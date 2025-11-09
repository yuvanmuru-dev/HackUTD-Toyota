# backend/app/chatbot.py
# Copy–paste file. Provides:
# 1) Fast answers from your DB for price / compare / MPG / trims / most-expensive.
# 2) Web fallback (toyota.com, fueleconomy.gov, Consumer Reports, J.D. Power, Edmunds, KBB, RepairPal, CarComplaints)
#    summarized by Gemini in ONE short paragraph (≤ ~70 words).
# 3) Reliability intent (e.g., “reliability of prius”) handled explicitly via web.
# 4) Robust Gemini extraction (avoids .text crashes), strict brevity, no tables/lists.

import os
import re
import asyncio
from typing import Optional, List, Dict, Tuple

from dotenv import load_dotenv, find_dotenv
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import requests
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .models import Vehicle  # fields: year, model, trim, price, mpg_combined

# -----------------------------------------------------------------------------
# Env + Gemini config
# -----------------------------------------------------------------------------
load_dotenv(find_dotenv(usecwd=True), override=True)

API_KEY = os.getenv("GEMINI_API_KEY", "")
genai.configure(api_key=API_KEY)

# Use a model your key supports (confirmed via list_models())
MODEL_NAME = "models/gemini-2.5-flash"  # alternatives: "models/gemini-2.5-pro", "models/gemini-pro-latest"
_model = genai.GenerativeModel(MODEL_NAME)

# -----------------------------------------------------------------------------
# Output style (ONE short paragraph, plain text)
# -----------------------------------------------------------------------------
STYLE_GUIDE = """
You are a Toyota shopping assistant. Answer in ONE short paragraph (≤70 words).
No tables, no lists, no headings, no code, no emojis, no fluff.
Use inventory price/MPG when available; otherwise omit numbers.
Briefly state the tradeoff (who should pick which). Output plain text only.
"""

GEN_CFG = {
    "temperature": 0.3,
    "top_p": 0.9,
    "max_output_tokens": 120,  # brevity
}

# Loosen safety for benign car-shopping queries to reduce empty responses
SAFETY_SETTINGS = {
    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
}

# -----------------------------------------------------------------------------
# Schemas (kept for compatibility with your existing imports)
# -----------------------------------------------------------------------------
class ChatMessage(BaseModel):
    message: str
    context: str = ""

class ChatResponse(BaseModel):
    response: str

# -----------------------------------------------------------------------------
# Inventory helpers
# -----------------------------------------------------------------------------
# Normalize common model spellings/aliases (tolerant to typos)
_MODEL_ALIASES: Dict[str, List[str]] = {
    "camry": ["camry"],
    "corolla": ["corolla", "carolla", "corola", "carola"],
    "rav4": ["rav4", "rav-4", "rav 4"],
    "highlander": ["highlander"],
    "prius": ["prius"],
    "tacoma": ["tacoma"],
    "tundra": ["tundra"],
    "4runner": ["4runner", "4 runner", "four runner"],
    "sienna": ["sienna"],
    "sequoia": ["sequoia"],
    "venza": ["venza"],
    "c-hr": ["c-hr", "chr"],
    "avalon": ["avalon"],
    "supra": ["supra", "gr supra"],
    "gr86": ["gr86", "gr 86", "86"],
}

def _extract_models_from_text(text: str) -> List[str]:
    t = text.lower()
    found: List[str] = []
    for canonical, variants in _MODEL_ALIASES.items():
        if any(v in t for v in variants):
            found.append(canonical)
    # preserve order, unique
    seen, ordered = set(), []
    for m in found:
        if m not in seen:
            ordered.append(m)
            seen.add(m)
    return ordered

def _query_by_model(db: Session, canonical_model: str) -> List[Vehicle]:
    return (
        db.query(Vehicle)
        .filter(Vehicle.model.ilike(f"%{canonical_model}%"))
        .all()
    )

def _price_range_and_mpg(rows: List[Vehicle]) -> Tuple[Optional[Tuple[float, float]], Optional[int]]:
    if not rows:
        return None, None
    prices = [float(r.price) for r in rows if r.price is not None]
    mpgs = [float(r.mpg_combined) for r in rows if r.mpg_combined is not None]
    pr = (min(prices), max(prices)) if prices else None
    mpg_med = None
    if mpgs:
        mpgs.sort()
        mpg_med = int(round(mpgs[len(mpgs) // 2]))
    return pr, mpg_med

def _format_money_range(rng: Tuple[float, float]) -> str:
    lo, hi = rng
    if abs(hi - lo) < 1e-6:
        return f"${lo:,.0f}"
    return f"${lo:,.0f}–${hi:,.0f}"

def _most_expensive(db: Session) -> Optional[Tuple[int, str, str, float]]:
    row = db.query(Vehicle).order_by(Vehicle.price.desc()).first()
    if not row:
        return None
    return (row.year, row.model, row.trim, float(row.price))

def _most_efficient(db: Session) -> Optional[Tuple[int, str, str, int]]:
    row = (
        db.query(Vehicle)
        .filter(Vehicle.mpg_combined.isnot(None))
        .order_by(Vehicle.mpg_combined.desc())
        .first()
    )
    if not row:
        return None
    return (row.year, row.model, row.trim, int(round(float(row.mpg_combined))))

# -----------------------------------------------------------------------------
# Intent detectors (tolerant)
# -----------------------------------------------------------------------------
def _is_most_expensive(text: str) -> bool:
    t = text.lower()
    return "most expensive" in t or "highest price" in t or "top price" in t

def _is_price_question(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["price", "cost", "how much", "starting at", "msrp"])

def _is_efficiency_question(text: str) -> bool:
    t = text.lower().replace("-", " ")
    if "mpg" in t:
        return True
    # tolerate misspellings: efficient/efficiency/“effiecent”, mileage/milage, economy/economic
    return bool(re.search(r"(most|best|highest).*(mpg|fuel|effici|effie|mileage|milage|economy|economic)", t))

def _is_compare_question(text: str) -> bool:
    t = text.lower()
    if " vs " in t or " versus " in t or " compare " in t:
        return True
    return " or " in t and len(_extract_models_from_text(t)) >= 2

def _is_trims_question(text: str) -> bool:
    t = text.lower()
    return any(k in t for k in ["trim", "trims", "grade", "grades", "variant", "variants"])

def _is_reliability_question(text: str) -> bool:
    t = text.lower()
    # reliability, reliable, dependability, breakdowns, maintenance, issues, problems (catch misspellings)
    return bool(re.search(r"(reliab|reliable|dependab|breakdown|mainten|issue|problem)", t))

# -----------------------------------------------------------------------------
# Rule-based responses (deterministic, fast)
# -----------------------------------------------------------------------------
def _handle_rules(message: str, db: Session) -> Optional[str]:
    # Most expensive in inventory
    if _is_most_expensive(message):
        top = _most_expensive(db)
        if top:
            y, m, tr, p = top
            return f"The most expensive Toyota in our inventory is the {y} {m} {tr} at ${p:,.0f}."
        return "I don’t see any vehicles in our inventory right now."

    # Most fuel-efficient in inventory
    if _is_efficiency_question(message):
        eff = _most_efficient(db)
        if eff:
            y, m, tr, mpg = eff
            return f"Our most fuel-efficient Toyota in inventory is the {y} {m} {tr}, around {mpg} MPG combined."
        return "I don’t have MPG data in our inventory right now."

    # Trims for a model
    if _is_trims_question(message):
        models = _extract_models_from_text(message)
        if len(models) == 0:
            return "Which Toyota model should I list trims for?"
        mk = models[0]
        rows = _query_by_model(db, mk)
        trims = sorted({(r.trim or "").strip() for r in rows if (r.trim or "").strip()})
        name = mk.upper() if mk == "gr86" else mk.capitalize()
        if trims:
            shown = ", ".join(trims[:6]) + ("…" if len(trims) > 6 else "")
            return f"{name} trims in our inventory: {shown}."
        return f"I don’t have trims for {name} in our inventory."

    # Pricing (single or compare)
    if _is_price_question(message):
        models = _extract_models_from_text(message)
        if len(models) == 1:
            mk = models[0]
            rows = _query_by_model(db, mk)
            pr, mpg = _price_range_and_mpg(rows)
            name = mk.upper() if mk == "gr86" else mk.capitalize()
            if pr:
                extra = f", ~{mpg} MPG" if mpg is not None else ""
                return f"{name} pricing in our inventory: {_format_money_range(pr)}{extra}."
            return f"I don’t have pricing for {name} in our inventory."
        if len(models) >= 2:
            a, b = models[0], models[1]
            rows_a, rows_b = _query_by_model(db, a), _query_by_model(db, b)
            pra, mpga = _price_range_and_mpg(rows_a)
            prb, mpgb = _price_range_and_mpg(rows_b)
            name_a = a.upper() if a == "gr86" else a.capitalize()
            name_b = b.upper() if b == "gr86" else b.capitalize()
            if pra and prb:
                sa = f"{_format_money_range(pra)}" + (f", ~{mpga} MPG" if mpga is not None else "")
                sb = f"{_format_money_range(prb)}" + (f", ~{mpgb} MPG" if mpgb is not None else "")
                return f"{name_a} vs {name_b}: {sa} vs {sb}. Choose {name_b} for value/efficiency; {name_a} for space/power."
            if pra and not prb:
                return f"{name_a}: {_format_money_range(pra)}; I don’t have pricing for {name_b}."
            if prb and not pra:
                return f"{name_b}: {_format_money_range(prb)}; I don’t have pricing for {name_a}."
            return "I don’t have pricing for those models in our inventory."

    # Generic compare like “camry or corolla?”
    if _is_compare_question(message):
        models = _extract_models_from_text(message)
        if len(models) >= 2:
            a, b = models[0], models[1]
            rows_a, rows_b = _query_by_model(db, a), _query_by_model(db, b)
            pra, mpga = _price_range_and_mpg(rows_a)
            prb, mpgb = _price_range_and_mpg(rows_b)
            name_a = a.upper() if a == "gr86" else a.capitalize()
            name_b = b.upper() if b == "gr86" else b.capitalize()
            left = f"{name_a}: {_format_money_range(pra)}" if pra else f"{name_a}: (no price)"
            right = f"{name_b}: {_format_money_range(prb)}" if prb else f"{name_b}: (no price)"
            if mpga is not None:
                left += f", ~{mpga} MPG"
            if mpgb is not None:
                right += f", ~{mpgb} MPG"
            return f"{left}; {right}. Pick {name_b} for value/efficiency; {name_a} for space/power."
        return "Which two Toyota models should I compare?"

    return None

# -----------------------------------------------------------------------------
# Web fallback (Tavily)
# -----------------------------------------------------------------------------
TAVILY_KEY = os.getenv("TAVILY_API_KEY", "")

def search_web(query: str, sites: List[str] | None = None, max_results: int = 5) -> List[dict]:
    if not TAVILY_KEY:
        return []
    q = query
    if sites:
        q += " " + " ".join(f"site:{s}" for s in sites)
    try:
        r = requests.post(
            "https://api.tavily.com/search",
            json={"api_key": TAVILY_KEY, "query": q, "max_results": max_results},
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        return data.get("results", [])
    except Exception as e:
        print("[web] search error:", type(e).__name__, str(e))
        return []

def build_web_context(results: List[dict], limit: int = 4) -> str:
    lines = []
    for item in results[:limit]:
        title = item.get("title", "")[:120]
        snippet = (item.get("content") or "")[:400].replace("\n", " ")
        url = item.get("url", "")
        lines.append(f"- {title}\n  {snippet}\n  Source: {url}")
    return "\n".join(lines)

# Trusted domains (add reliability sources)
WEB_DOMAINS_DEFAULT = [
    "www.toyota.com", "pressroom.toyota.com", "www.fueleconomy.gov",
    "www.consumerreports.org", "www.jdpower.com",
    "www.edmunds.com", "www.kbb.com", "repairpal.com", "www.carcomplaints.com",
]

# -----------------------------------------------------------------------------
# Gemini helpers (robust text extraction + formatting)
# -----------------------------------------------------------------------------
def _extract_text(resp) -> Optional[str]:
    text = getattr(resp, "text", None)
    if text:
        return text.strip()

    pf = getattr(resp, "prompt_feedback", None)
    if pf:
        print("[gemini] prompt_feedback:", pf)

    cands = getattr(resp, "candidates", None) or []
    if not cands:
        print("[gemini] no candidates returned")
        return None

    for idx, c in enumerate(cands):
        fr = getattr(c, "finish_reason", None)
        fb = getattr(c, "finish_message", None)
        print(f"[gemini] candidate[{idx}] finish_reason={fr} finish_message={fb}")
        content = getattr(c, "content", None)
        parts = getattr(content, "parts", None) if content else None
        if parts:
            chunks = []
            for p in parts:
                t = getattr(p, "text", None)
                if t:
                    chunks.append(t)
            if chunks:
                return " ".join(chunks).strip()
    return None

def _clean_one_paragraph(text: str, word_cap: int = 75) -> str:
    para = " ".join(text.split())
    if "|" in para:  # strip any table residue
        para = para.replace("|", " ")
    words = para.split()
    if len(words) > word_cap:
        para = " ".join(words[:word_cap]) + "…"
    return para

# -----------------------------------------------------------------------------
# Public API
# -----------------------------------------------------------------------------
def get_car_context(db: Session) -> str:
    cars: List[Vehicle] = db.query(Vehicle).all()
    lines = [f"- {c.year} {c.model} {c.trim}: ${c.price:,} (MPG: {c.mpg_combined})" for c in cars]
    return "Currently available vehicles:\n" + ("\n".join(lines) if lines else "(none)") + "\n\nBe concise and neutral."

async def generate_chat_response(message: str, db: Session) -> str:
    """
    1) Try rule-based answers for price/efficiency/trims/compare using DB (fast + deterministic).
    2) Reliability questions: search reliability sources and summarize.
    3) If not handled, do a quick web search on trusted domains and summarize (ONE short paragraph).
    4) If web gives nothing, ask Gemini using inventory context.
    5) If Gemini still returns nothing, return a neutral one-liner.
    """
    # 1) Rules
    rule = _handle_rules(message, db)
    if rule:
        return _clean_one_paragraph(rule, word_cap=65)

    # 2) Reliability-first handling (web preferred)
    if _is_reliability_question(message):
        models = _extract_models_from_text(message)
        if models:
            q = f"Toyota {models[0]} reliability owner reports 2024 2025"
        else:
            q = "Toyota reliability owner reports 2024 2025"
        rel_results = search_web(q, sites=WEB_DOMAINS_DEFAULT, max_results=5)
        if rel_results:
            web_ctx = build_web_context(rel_results)
            prompt = f"""{STYLE_GUIDE}

Use ONLY this web context to answer (if insufficient, say so briefly):
{web_ctx}

USER:
{message}

Return exactly one concise paragraph (plain text, ≤70 words). No lists. No tables.
"""
            try:
                def _call_rel():
                    return _model.generate_content(
                        prompt,
                        generation_config=GEN_CFG,
                        safety_settings=SAFETY_SETTINGS,
                    )
                resp = await asyncio.to_thread(_call_rel)
                text = _extract_text(resp)
                if text:
                    return _clean_one_paragraph(text, word_cap=70)
            except Exception as e:
                print("[gemini] reliability summarize error:", type(e).__name__, str(e))
        # If reliability search failed, fall through to general web/LLM

    # 3) General web fallback (trusted domains)
    web_results = search_web(message, sites=WEB_DOMAINS_DEFAULT, max_results=5)
    if web_results:
        web_ctx = build_web_context(web_results)
        prompt = f"""{STYLE_GUIDE}

Use ONLY this web context to answer (if insufficient, say so briefly):
{web_ctx}

USER:
{message}

Return exactly one concise paragraph (plain text, ≤70 words). No lists. No tables.
"""
        try:
            def _call_web():
                return _model.generate_content(
                    prompt,
                    generation_config=GEN_CFG,
                    safety_settings=SAFETY_SETTINGS,
                )
            resp = await asyncio.to_thread(_call_web)
            text = _extract_text(resp)
            if text:
                return _clean_one_paragraph(text, word_cap=70)
        except Exception as e:
            print("[gemini] web summarize error:", type(e).__name__, str(e))

    # 4) Final LLM attempt (inventory-only)
    try:
        inventory = get_car_context(db)
        prompt = f"""{STYLE_GUIDE}

INVENTORY:
{inventory}

USER:
{message}

Return exactly one concise paragraph (plain text, ≤70 words). No lists. No tables.
"""
        def _call():
            return _model.generate_content(
                prompt,
                generation_config=GEN_CFG,
                safety_settings=SAFETY_SETTINGS,
            )
        resp = await asyncio.to_thread(_call)
        text = _extract_text(resp)
        if text:
            return _clean_one_paragraph(text, word_cap=70)
    except Exception as e:
        print("[gemini] final attempt error:", type(e).__name__, str(e))

    # 5) Neutral one-liner last
    return "I can pull Toyota info from our inventory and trusted sources. What model or detail should I focus on?"

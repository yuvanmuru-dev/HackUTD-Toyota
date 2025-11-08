"""FastAPI main application with Toyota vehicle endpoints."""

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from . import models, schemas
from .database import engine, get_db
from .mock_data import populate_database
from .chatbot import ChatMessage, ChatResponse, generate_chat_response

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Toyota Vehicle Finder API",
    description="API for searching and comparing Toyota vehicles",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database with mock data on startup."""
    db = SessionLocal()
    try:
        populate_database(db)
    finally:
        db.close()

@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Toyota Vehicle Finder API",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/cars", response_model=List[schemas.Vehicle])
def get_vehicles(
    model: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    drivetrain: Optional[str] = None,
    min_mpg: Optional[int] = None,
    category: Optional[str] = None,
    search_query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all vehicles with optional filters."""
    query = db.query(models.Vehicle)
    
    if model:
        query = query.filter(models.Vehicle.model.ilike(f"%{model}%"))
    if min_price:
        query = query.filter(models.Vehicle.price >= min_price)
    if max_price:
        query = query.filter(models.Vehicle.price <= max_price)
    if drivetrain:
        query = query.filter(models.Vehicle.drivetrain == drivetrain)
    if min_mpg:
        query = query.filter(models.Vehicle.mpg_combined >= min_mpg)
    if category:
        query = query.filter(models.Vehicle.category == category)
    if search_query:
        query = query.filter(
            (models.Vehicle.model.ilike(f"%{search_query}%")) |
            (models.Vehicle.trim.ilike(f"%{search_query}%")) |
            (models.Vehicle.category.ilike(f"%{search_query}%"))
        )
    
    vehicles = query.all()
    return vehicles

@app.get("/cars/{vehicle_id}", response_model=schemas.Vehicle)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Get a specific vehicle by ID."""
    vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle

@app.post("/compare", response_model=schemas.ComparisonResponse)
def compare_vehicles(
    request: schemas.ComparisonRequest,
    db: Session = Depends(get_db)
):
    """Compare multiple vehicles."""
    # Get vehicles
    vehicles = []
    for vehicle_id in request.vehicle_ids:
        vehicle = db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()
        if vehicle:
            vehicles.append(vehicle)
    
    if not vehicles:
        raise HTTPException(status_code=404, detail="No vehicles found")
    
    # Create comparison table
    comparison_table = {
        "Model": [f"{v.model} {v.trim}" for v in vehicles],
        "Price": [f"${v.price:,.0f}" for v in vehicles],
        "MPG (City/Hwy/Combined)": [f"{v.mpg_city}/{v.mpg_highway}/{v.mpg_combined}" for v in vehicles],
        "Drivetrain": [v.drivetrain for v in vehicles],
        "Engine": [v.engine for v in vehicles],
        "Transmission": [v.transmission for v in vehicles],
        "Seating": [v.seating for v in vehicles],
        "Cargo Volume": [f"{v.cargo_volume} cu ft" for v in vehicles],
        "Towing Capacity": [f"{v.towing_capacity:,} lbs" if v.towing_capacity else "N/A" for v in vehicles],
        "Safety Rating": [v.safety_rating for v in vehicles],
    }
    
    # Save comparison to database
    for position, vehicle_id in enumerate(request.vehicle_ids, 1):
        comparison = models.Comparison(
            session_id=request.session_id,
            vehicle_id=vehicle_id,
            position=position
        )
        db.add(comparison)
    db.commit()
    
    return schemas.ComparisonResponse(
        vehicles=vehicles,
        comparison_table=comparison_table
    )

@app.post("/finance", response_model=schemas.FinanceCalculatorResponse)
def calculate_finance(request: schemas.FinanceCalculatorRequest):
    """Calculate vehicle financing."""
    # Calculate tax and fees
    tax_amount = request.vehicle_price * (request.tax_rate / 100) if request.include_tax else 0
    total_fees = request.fees if request.include_fees else 0
    
    # Calculate loan amount
    total_vehicle_cost = request.vehicle_price + tax_amount + total_fees
    loan_amount = total_vehicle_cost - request.down_payment - request.trade_in_value
    
    # Calculate monthly payment
    monthly_rate = request.interest_rate / 100 / 12
    if monthly_rate == 0:
        monthly_payment = loan_amount / request.loan_term_months
    else:
        monthly_payment = loan_amount * (monthly_rate * (1 + monthly_rate) ** request.loan_term_months) / \
                         ((1 + monthly_rate) ** request.loan_term_months - 1)
    
    # Calculate totals
    total_amount_paid = monthly_payment * request.loan_term_months + request.down_payment
    total_interest_paid = total_amount_paid - total_vehicle_cost
    
    return schemas.FinanceCalculatorResponse(
        monthly_payment=round(monthly_payment, 2),
        total_loan_amount=round(loan_amount, 2),
        total_interest_paid=round(total_interest_paid, 2),
        total_amount_paid=round(total_amount_paid, 2),
        breakdown={
            "vehicle_price": request.vehicle_price,
            "tax": round(tax_amount, 2),
            "fees": total_fees,
            "down_payment": request.down_payment,
            "trade_in_value": request.trade_in_value,
            "financed_amount": round(loan_amount, 2)
        }
    )

@app.post("/lease", response_model=schemas.LeaseCalculatorResponse)
def calculate_lease(request: schemas.LeaseCalculatorRequest):
    """Calculate vehicle lease payments."""
    # Calculate depreciation
    depreciation = (request.vehicle_price - request.residual_value - request.down_payment) / request.lease_term_months
    
    # Calculate finance charge
    finance_charge = (request.vehicle_price + request.residual_value) * request.money_factor
    
    # Calculate base monthly payment
    base_payment = depreciation + finance_charge
    
    # Calculate tax on monthly payment
    monthly_tax = base_payment * (request.sales_tax_rate / 100)
    
    # Total monthly payment
    monthly_payment = base_payment + monthly_tax
    
    # Calculate totals
    total_taxes = monthly_tax * request.lease_term_months
    total_lease_cost = (monthly_payment * request.lease_term_months) + request.down_payment + request.fees
    
    return schemas.LeaseCalculatorResponse(
        monthly_payment=round(monthly_payment, 2),
        total_lease_cost=round(total_lease_cost, 2),
        depreciation=round(depreciation * request.lease_term_months, 2),
        finance_charge=round(finance_charge * request.lease_term_months, 2),
        total_taxes=round(total_taxes, 2),
        breakdown={
            "vehicle_price": request.vehicle_price,
            "residual_value": request.residual_value,
            "down_payment": request.down_payment,
            "monthly_depreciation": round(depreciation, 2),
            "monthly_finance_charge": round(finance_charge, 2),
            "monthly_tax": round(monthly_tax, 2),
            "acquisition_fees": request.fees
        }
    )

@app.get("/favorites/{user_id}", response_model=List[schemas.Favorite])
def get_favorites(user_id: str, db: Session = Depends(get_db)):
    """Get user's favorite vehicles."""
    favorites = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id
    ).all()
    
    # Load vehicle details
    for favorite in favorites:
        favorite.vehicle = db.query(models.Vehicle).filter(
            models.Vehicle.id == favorite.vehicle_id
        ).first()
    
    return favorites

@app.post("/favorites", response_model=schemas.Favorite)
def add_favorite(favorite: schemas.FavoriteCreate, db: Session = Depends(get_db)):
    """Add a vehicle to favorites."""
    # Check if already favorited
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == favorite.user_id,
        models.Favorite.vehicle_id == favorite.vehicle_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle already in favorites")
    
    # Add favorite
    db_favorite = models.Favorite(**favorite.dict())
    db.add(db_favorite)
    db.commit()
    db.refresh(db_favorite)
    
    # Load vehicle details
    db_favorite.vehicle = db.query(models.Vehicle).filter(
        models.Vehicle.id == db_favorite.vehicle_id
    ).first()
    
    return db_favorite

@app.delete("/favorites/{user_id}/{vehicle_id}")
def remove_favorite(user_id: str, vehicle_id: int, db: Session = Depends(get_db)):
    """Remove a vehicle from favorites."""
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.vehicle_id == vehicle_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Favorite removed successfully"}

@app.post("/history")
def add_view_history(history: schemas.ViewHistoryCreate, db: Session = Depends(get_db)):
    """Add vehicle view to history."""
    db_history = models.ViewHistory(**history.dict())
    db.add(db_history)
    db.commit()
    return {"message": "View recorded"}

@app.get("/history/{user_id}", response_model=List[schemas.ViewHistory])
def get_view_history(user_id: str, limit: int = 10, db: Session = Depends(get_db)):
    """Get user's view history."""
    history = db.query(models.ViewHistory).filter(
        models.ViewHistory.user_id == user_id
    ).order_by(models.ViewHistory.viewed_at.desc()).limit(limit).all()
    return history

@app.post("/chat", response_model=ChatResponse)
async def chat_with_bot(message: ChatMessage, db: Session = Depends(get_db)):
    """Chat with the AI assistant."""
    response = await generate_chat_response(message.message, db)
    return ChatResponse(response=response)

# Import SessionLocal for startup event
from .database import SessionLocal

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

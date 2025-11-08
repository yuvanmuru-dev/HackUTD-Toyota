import os
from typing import List, Dict
import google.generativeai as genai
from dotenv import load_dotenv
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .database import get_db
from .models import Vehicle

# Load environment variables
load_dotenv()

# Get API key
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    print(f"API Key loaded: {api_key[:10]}...")  # Print first 10 chars for debug
    genai.configure(api_key=api_key)
    # Initialize the model with the correct model name
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables")
    model = None

class ChatMessage(BaseModel):
    message: str
    context: str = ""

class ChatResponse(BaseModel):
    response: str

def get_car_context(db: Session) -> str:
    """Get context about available cars in the database"""
    cars = db.query(Vehicle).all()
    car_info = []
    for car in cars:
        car_info.append(f"- {car.year} {car.model} {car.trim}: ${car.price:,} (MPG: {car.mpg_combined})")
    
    context = f"""
    You are a helpful AI assistant for a Toyota vehicle finder website. 
    You help users find the perfect Toyota vehicle based on their needs and preferences.
    
    Currently available vehicles:
    {chr(10).join(car_info)}
    
    You can help users with:
    - Finding vehicles that match their budget
    - Comparing different models
    - Understanding features and specifications
    - Finance calculations
    - Answering questions about Toyota vehicles
    
    Be friendly, professional, and helpful. If asked about specific vehicles, 
    reference the available inventory listed above.
    """
    return context

async def generate_chat_response(message: str, db: Session) -> str:
    """Generate a response using Gemini API"""
    try:
        if not model:
            print("ERROR: Gemini model not initialized. Check API key.")
            return "The chatbot is not configured. Please check the API key configuration."
            
        # Get context about available cars
        context = get_car_context(db)
        
        # Create the prompt with context
        prompt = f"{context}\n\nUser question: {message}\n\nProvide a helpful response:"
        
        print(f"Sending prompt to Gemini API...")
        
        # Generate response
        response = model.generate_content(prompt)
        
        print(f"Response received from Gemini")
        
        return response.text
    except Exception as e:
        print(f"Error generating response: {type(e).__name__}: {str(e)}")
        # Provide more specific error messages
        if "API_KEY_INVALID" in str(e):
            return "Invalid API key. Please check your Gemini API key configuration."
        elif "quota" in str(e).lower():
            return "API quota exceeded. Please try again later."
        else:
            return f"I apologize, but I'm having trouble processing your request. Error: {str(e)[:100]}"

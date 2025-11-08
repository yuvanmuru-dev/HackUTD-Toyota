"""SQLAlchemy database models."""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Vehicle(Base):
    """Toyota vehicle model."""
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    model = Column(String, index=True)
    year = Column(Integer)
    trim = Column(String)
    price = Column(Float)
    drivetrain = Column(String)  # FWD, RWD, AWD, 4WD
    mpg_city = Column(Integer)
    mpg_highway = Column(Integer)
    mpg_combined = Column(Integer)
    engine = Column(String)
    transmission = Column(String)
    seating = Column(Integer)
    cargo_volume = Column(Float)  # cubic feet
    towing_capacity = Column(Integer)  # pounds
    safety_rating = Column(Float)
    image_url = Column(String)
    category = Column(String)  # SUV, Sedan, Truck, Hybrid, etc.
    features = Column(Text)  # JSON string of features
    
    # Relationships
    favorites = relationship("Favorite", back_populates="vehicle", cascade="all, delete-orphan")
    comparisons = relationship("Comparison", back_populates="vehicle", cascade="all, delete-orphan")

class Favorite(Base):
    """User favorites model."""
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # Session ID or user identifier
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="favorites")

class Comparison(Base):
    """Vehicle comparison session model."""
    __tablename__ = "comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    position = Column(Integer)  # Position in comparison (1, 2, or 3)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    vehicle = relationship("Vehicle", back_populates="comparisons")

class ViewHistory(Base):
    """Vehicle view history model."""
    __tablename__ = "view_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    viewed_at = Column(DateTime, default=datetime.utcnow)

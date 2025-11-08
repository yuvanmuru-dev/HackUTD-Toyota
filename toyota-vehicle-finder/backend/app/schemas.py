"""Pydantic schemas for API request/response validation."""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Vehicle schemas
class VehicleBase(BaseModel):
    """Base vehicle schema."""
    model: str
    year: int
    trim: str
    price: float
    drivetrain: str
    mpg_city: int
    mpg_highway: int
    mpg_combined: int
    engine: str
    transmission: str
    seating: int
    cargo_volume: float
    towing_capacity: int
    safety_rating: float
    image_url: str
    category: str
    features: str

class VehicleCreate(VehicleBase):
    """Schema for creating a vehicle."""
    pass

class Vehicle(VehicleBase):
    """Vehicle schema with ID."""
    id: int
    
    class Config:
        from_attributes = True

# Search/Filter schemas
class VehicleFilter(BaseModel):
    """Schema for vehicle filtering."""
    model: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    drivetrain: Optional[str] = None
    min_mpg: Optional[int] = None
    category: Optional[str] = None
    search_query: Optional[str] = None

# Favorite schemas
class FavoriteBase(BaseModel):
    """Base favorite schema."""
    user_id: str
    vehicle_id: int

class FavoriteCreate(FavoriteBase):
    """Schema for creating a favorite."""
    pass

class Favorite(FavoriteBase):
    """Favorite schema with details."""
    id: int
    created_at: datetime
    vehicle: Optional[Vehicle] = None
    
    class Config:
        from_attributes = True

# Comparison schemas
class ComparisonBase(BaseModel):
    """Base comparison schema."""
    session_id: str
    vehicle_id: int
    position: int

class ComparisonCreate(ComparisonBase):
    """Schema for creating a comparison."""
    pass

class Comparison(ComparisonBase):
    """Comparison schema with details."""
    id: int
    created_at: datetime
    vehicle: Optional[Vehicle] = None
    
    class Config:
        from_attributes = True

class ComparisonRequest(BaseModel):
    """Request schema for vehicle comparison."""
    session_id: str
    vehicle_ids: List[int] = Field(..., max_length=3)

class ComparisonResponse(BaseModel):
    """Response schema for vehicle comparison."""
    vehicles: List[Vehicle]
    comparison_table: Dict[str, List[Any]]

# Finance Calculator schemas
class FinanceCalculatorRequest(BaseModel):
    """Request schema for finance calculator."""
    vehicle_price: float
    down_payment: float = 0
    trade_in_value: float = 0
    interest_rate: float = Field(..., gt=0, le=30)  # APR percentage
    loan_term_months: int = Field(..., gt=0, le=96)  # 1-96 months
    include_tax: bool = True
    tax_rate: float = 8.25  # Default tax rate percentage
    include_fees: bool = True
    fees: float = 500  # Default fees

class FinanceCalculatorResponse(BaseModel):
    """Response schema for finance calculator."""
    monthly_payment: float
    total_loan_amount: float
    total_interest_paid: float
    total_amount_paid: float
    breakdown: Dict[str, float]

class LeaseCalculatorRequest(BaseModel):
    """Request schema for lease calculator."""
    vehicle_price: float
    down_payment: float = 0
    residual_value: float  # End-of-lease value
    money_factor: float  # Lease rate factor
    lease_term_months: int = Field(..., gt=0, le=48)  # 1-48 months
    sales_tax_rate: float = 8.25  # Tax rate percentage
    fees: float = 1000  # Acquisition and other fees

class LeaseCalculatorResponse(BaseModel):
    """Response schema for lease calculator."""
    monthly_payment: float
    total_lease_cost: float
    depreciation: float
    finance_charge: float
    total_taxes: float
    breakdown: Dict[str, float]

# View History schemas
class ViewHistoryCreate(BaseModel):
    """Schema for creating view history."""
    user_id: str
    vehicle_id: int

class ViewHistory(ViewHistoryCreate):
    """View history schema with details."""
    id: int
    viewed_at: datetime
    
    class Config:
        from_attributes = True

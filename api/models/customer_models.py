from pydantic import BaseModel
from typing import Optional, Dict
from datetime import datetime

# Request models
class CustomerCreateRequest(BaseModel):
    name: str
    contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    billing_address: Dict[str, str]
    shipping_address: Optional[Dict[str, str]] = None
    gst_no: Optional[str] = None
    place_of_supply: Optional[str] = None
    payment_terms: Optional[int] = 15
    credit_limit: Optional[float] = None
    company_type: Optional[str] = None
    notes: Optional[str] = None

class CustomerUpdateRequest(BaseModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    billing_address: Optional[Dict[str, str]] = None
    shipping_address: Optional[Dict[str, str]] = None
    gst_no: Optional[str] = None
    place_of_supply: Optional[str] = None
    payment_terms: Optional[int] = None
    credit_limit: Optional[float] = None
    company_type: Optional[str] = None
    notes: Optional[str] = None

# Response models
class CustomerResponse(BaseModel):
    id: str
    name: str
    contact: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    billing_address: Dict[str, str]
    shipping_address: Optional[Dict[str, str]]
    gst_no: Optional[str]
    place_of_supply: Optional[str]
    payment_terms: Optional[int]
    credit_limit: Optional[float]
    company_type: Optional[str]
    notes: Optional[str]
    is_active: Optional[bool]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

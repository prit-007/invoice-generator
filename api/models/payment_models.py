from pydantic import BaseModel
from typing import Optional
from datetime import date as DateType, datetime

# Request models
class PaymentCreateRequest(BaseModel):
    invoice_id: Optional[str] = None
    customer_id: str
    amount: float
    date: DateType
    method: str
    reference: Optional[str] = None
    notes: Optional[str] = None
    is_refund: Optional[bool] = False
    is_advance: Optional[bool] = False

class PaymentUpdateRequest(BaseModel):
    invoice_id: Optional[str] = None
    customer_id: Optional[str] = None
    amount: Optional[float] = None
    date: Optional[DateType] = None
    method: Optional[str] = None
    reference: Optional[str] = None
    notes: Optional[str] = None
    is_refund: Optional[bool] = None
    is_advance: Optional[bool] = None

# Response models
class PaymentResponse(BaseModel):
    id: str
    invoice_id: Optional[str]
    customer_id: str
    amount: float
    date: DateType
    method: str
    reference: Optional[str]
    notes: Optional[str]
    is_refund: Optional[bool]
    is_advance: Optional[bool]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

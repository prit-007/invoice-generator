from pydantic import BaseModel
from typing import Optional

# Request models
class InvoiceItemCreateRequest(BaseModel):
    invoice_id: str
    product_id: Optional[str] = None
    description: str
    quantity: float
    unit_price: float
    tax_rate: float
    discount: Optional[float] = 0.0

class InvoiceItemUpdateRequest(BaseModel):
    invoice_id: Optional[str] = None
    product_id: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    tax_rate: Optional[float] = None
    discount: Optional[float] = None

# Response models
class InvoiceItemResponse(BaseModel):
    id: str
    invoice_id: str
    product_id: Optional[str]
    description: str
    quantity: float
    unit_price: float
    tax_rate: float
    discount: Optional[float]
    amount: Optional[float]

    class Config:
        from_attributes = True

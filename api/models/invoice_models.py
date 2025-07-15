from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime, date as DateType

# Invoice item structure for requests
class InvoiceItemRequest(BaseModel):
    product_id: str
    quantity: float
    unit_price: Optional[float] = None  # Can be auto-populated from product
    tax_rate: Optional[float] = None    # Can be auto-populated from product
    discount: Optional[float] = 0.0
    description: Optional[str] = None   # Can be auto-populated from product

# Request models
class InvoiceCreateRequest(BaseModel):
    customer_id: str
    due_date: Optional[DateType] = None
    status: Optional[str] = 'draft'
    notes: Optional[str] = None
    terms: Optional[str] = None
    shipping_address: Optional[Dict[str, str]] = None  # If not provided, will use billing address
    subtotal: float
    tax_amount: float
    total_amount: float
    items: List[InvoiceItemRequest]  # List of products and quantities
    invoice_type: Optional[str] = 'sales'
    is_template: Optional[bool] = False

class InvoiceUpdateRequest(BaseModel):
    customer_id: Optional[str] = None
    due_date: Optional[DateType] = None
    status: Optional[str] = None
    shipping_address: Optional[Dict[str, str]] = None
    notes: Optional[str] = None
    terms: Optional[str] = None
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None
    items: Optional[List[InvoiceItemRequest]] = None  # Updated items list
    invoice_type: Optional[str] = None
    is_template: Optional[bool] = None
    cancel_reason: Optional[str] = None

# Product details embedded in invoice items for response
class InvoiceItemWithProduct(BaseModel):
    id: str
    product_id: Optional[str]
    product_name: Optional[str]  # From product table
    description: str
    quantity: float
    unit_price: float
    tax_rate: float
    discount: Optional[float]
    amount: Optional[float]
    
# Response models
class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    customer_id: str
    customer_name: Optional[str]  # Embedded customer info
    date: DateType
    due_date: DateType
    status: str
    subtotal: float
    tax_amount: float
    total_amount: float
    amount_paid: Optional[float]
    balance_due: Optional[float]
    shipping_details: Optional[Dict[str, str]]
    notes: Optional[str]
    terms: Optional[str]
    invoice_type: Optional[str]
    is_template: Optional[bool]
    cancel_reason: Optional[str]
    created_at: Optional[datetime]
    items: List[InvoiceItemWithProduct]  # Embedded invoice items with product details

    class Config:
        from_attributes = True

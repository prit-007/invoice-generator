from pydantic import BaseModel, field_validator, Field
from typing import Optional, Dict, List, Union
from datetime import datetime, date as DateType
from decimal import Decimal
import json

# Invoice item structure for requests
class InvoiceItemRequest(BaseModel):
    product_id: Optional[str] = None
    description: str
    hsn_sac_code: Optional[str] = None
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)
    discount_percentage: float = Field(ge=0, le=100, default=0)
    discount_amount: float = Field(ge=0, default=0)
    tax_rate: float = Field(ge=0, le=100, default=18)

# Additional charges structure
class AdditionalChargeRequest(BaseModel):
    charge_name: str
    charge_amount: float = Field(ge=0)
    is_taxable: bool = False
    tax_rate: float = Field(ge=0, le=100, default=0)

# Request models
class InvoiceCreateRequest(BaseModel):
    customer_id: str
    date: Optional[DateType] = None
    due_date: Optional[DateType] = None
    status: Optional[str] = 'draft'

    # Items and charges
    items: List[InvoiceItemRequest]
    additional_charges: Optional[List[AdditionalChargeRequest]] = []

    # Calculated totals (sent from frontend)
    subtotal: Optional[float] = 0
    tax_amount: Optional[float] = 0
    total_amount: Optional[float] = 0

    # Transport and logistics
    po_number: Optional[str] = None
    po_date: Optional[DateType] = None
    transport_name: Optional[str] = None
    lr_number: Optional[str] = None
    vehicle_number: Optional[str] = None
    eway_bill_number: Optional[str] = None
    eway_bill_date: Optional[DateType] = None

    # Address and supply details
    shipping_address: Optional[Union[Dict[str, str], str]] = None
    place_of_supply: Optional[str] = None

    # Standard fields
    notes: Optional[str] = None
    terms: Optional[str] = None
    invoice_type: Optional[str] = 'sales'
    is_template: Optional[bool] = False

    @field_validator('shipping_address')
    @classmethod
    def validate_shipping_address(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                raise ValueError('shipping_address must be valid JSON string or dictionary')
        return v

class InvoiceUpdateRequest(BaseModel):
    customer_id: Optional[str] = None
    date: Optional[DateType] = None
    due_date: Optional[DateType] = None
    status: Optional[str] = None

    # Items and charges
    items: Optional[List[InvoiceItemRequest]] = None
    additional_charges: Optional[List[AdditionalChargeRequest]] = None

    # Calculated totals (sent from frontend)
    subtotal: Optional[float] = None
    tax_amount: Optional[float] = None
    total_amount: Optional[float] = None

    # Transport and logistics
    po_number: Optional[str] = None
    po_date: Optional[DateType] = None
    transport_name: Optional[str] = None
    lr_number: Optional[str] = None
    vehicle_number: Optional[str] = None
    eway_bill_number: Optional[str] = None
    eway_bill_date: Optional[DateType] = None

    # GST breakdown
    cgst_rate: Optional[float] = None
    sgst_rate: Optional[float] = None
    igst_rate: Optional[float] = None

    # Address and supply details
    shipping_address: Optional[Union[Dict[str, str], str]] = None
    place_of_supply: Optional[str] = None

    # Standard fields
    notes: Optional[str] = None
    terms: Optional[str] = None
    invoice_type: Optional[str] = None
    is_template: Optional[bool] = None
    cancel_reason: Optional[str] = None

    @field_validator('shipping_address')
    @classmethod
    def validate_shipping_address(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                raise ValueError('shipping_address must be valid JSON string or dictionary')
        return v

# Product details embedded in invoice items for response
class InvoiceItemWithProduct(BaseModel):
    id: str
    product_id: Optional[str]
    product_name: Optional[str]  # From product table
    description: str
    hsn_sac_code: Optional[str]
    quantity: float
    unit_price: float
    discount_percentage: Optional[float] = 0.0
    discount_amount: Optional[float] = 0.0
    taxable_amount: Optional[float] = None
    tax_rate: float
    tax_amount: Optional[float] = None
    line_total: Optional[float] = None

# Additional charges for response
class AdditionalChargeResponse(BaseModel):
    id: str
    charge_name: str
    charge_amount: float
    is_taxable: bool
    tax_rate: float
    tax_amount: float
    total_amount: float
    
# Response models
class InvoiceResponse(BaseModel):
    id: str
    invoice_number: str
    customer_id: str
    customer_name: Optional[str]  # Embedded customer info
    date: DateType
    due_date: DateType
    status: str

    # Basic amounts
    subtotal: float
    tax_amount: float
    total_amount: float
    amount_paid: Optional[float]
    balance_due: Optional[float]

    # Transport and logistics
    po_number: Optional[str]
    po_date: Optional[DateType]
    transport_name: Optional[str]
    lr_number: Optional[str]
    vehicle_number: Optional[str]
    eway_bill_number: Optional[str]
    eway_bill_date: Optional[DateType]
    total_quantity: Optional[float]

    # GST breakdown
    cgst_rate: Optional[float]
    sgst_rate: Optional[float]
    igst_rate: Optional[float]
    cgst_amount: Optional[float]
    sgst_amount: Optional[float]
    igst_amount: Optional[float]
    round_off: Optional[float]

    # Address and supply details
    shipping_details: Optional[Dict[str, str]]
    place_of_supply: Optional[str]

    # Standard fields
    notes: Optional[str]
    terms: Optional[str]
    invoice_type: Optional[str]
    is_template: Optional[bool]
    cancel_reason: Optional[str]
    created_at: Optional[datetime]

    # Related data
    items: List[InvoiceItemWithProduct]
    additional_charges: Optional[List[AdditionalChargeResponse]] = []

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Request models
class ProductCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    hsn_sac_code: Optional[str] = None
    price: float
    tax_rate: Optional[float] = 18.0
    unit: Optional[str] = 'NOS'
    is_taxable: Optional[bool] = True
    category: Optional[str] = None

class ProductUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    hsn_sac_code: Optional[str] = None
    price: Optional[float] = None
    tax_rate: Optional[float] = None
    unit: Optional[str] = None
    is_taxable: Optional[bool] = None
    category: Optional[str] = None

# Response models
class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    hsn_sac_code: Optional[str]
    price: float
    tax_rate: Optional[float]
    unit: Optional[str]
    is_taxable: Optional[bool]
    category: Optional[str]
    is_active: Optional[bool]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

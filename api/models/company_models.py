from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CompanySettingsResponse(BaseModel):
    id: str
    company_name: str
    address_line1: str
    address_line2: Optional[str]
    city: str
    state: str
    postal_code: str
    country: str
    phone: Optional[str]
    email: Optional[str]
    website: Optional[str]
    gst_number: Optional[str]
    pan_number: Optional[str]
    bank_name: Optional[str]
    bank_account_name: Optional[str]
    bank_account_number: Optional[str]
    bank_ifsc_code: Optional[str]
    terms_and_conditions: Optional[str]
    authorized_signatory: Optional[str]
    logo_url: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

class CompanySettingsUpdateRequest(BaseModel):
    company_name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    gst_number: Optional[str] = None
    pan_number: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    authorized_signatory: Optional[str] = None
    logo_url: Optional[str] = None

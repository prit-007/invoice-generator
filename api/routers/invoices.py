from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from services.invoice_service import (
    get_all_invoices,
    get_invoice_by_id,
    create_invoice,
    update_invoice,
    cancel_invoice
)
from models.invoice_models import InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceResponse

# Request model for cancellation
class CancelInvoiceRequest(BaseModel):
    reason: str = None

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"]
)

@router.get("/", response_model=List[InvoiceResponse])
async def get_invoices():
    """Get all invoices with embedded customer and product details"""
    try:
        return get_all_invoices()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{invoice_id}", response_model=InvoiceResponse)
async def get_invoice(invoice_id: str):
    """Get a specific invoice by ID with embedded items and product details"""
    try:
        invoice = get_invoice_by_id(invoice_id)
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return invoice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=InvoiceResponse)
async def create_new_invoice(invoice_data: InvoiceCreateRequest):
    """Create a new invoice with items"""
    try:
        return create_invoice(invoice_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_existing_invoice(invoice_id: str, invoice_data: InvoiceUpdateRequest):
    """Update an existing invoice and its items"""
    try:
        updated_invoice = update_invoice(invoice_id, invoice_data)
        if not updated_invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return updated_invoice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{invoice_id}/cancel", response_model=InvoiceResponse)
async def cancel_existing_invoice(invoice_id: str, cancel_data: CancelInvoiceRequest):
    """Cancel an invoice (soft delete equivalent)"""
    try:
        cancelled_invoice = cancel_invoice(invoice_id, cancel_data.reason)
        if not cancelled_invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return cancelled_invoice
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: No delete endpoint - invoices should be cancelled using the cancel endpoint instead

from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from services.payment_service import (
    get_all_payments,
    get_payment_by_id,
    create_payment,
    update_payment,
    refund_payment
)
from models.payment_models import PaymentCreateRequest, PaymentUpdateRequest, PaymentResponse

# Request model for refund
class RefundRequest(BaseModel):
    reason: str = None

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)

@router.get("/", response_model=List[PaymentResponse])
async def get_payments():
    """Get all payments"""
    try:
        return get_all_payments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(payment_id: str):
    """Get a specific payment by ID"""
    try:
        payment = get_payment_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return payment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=PaymentResponse)
async def create_new_payment(payment_data: PaymentCreateRequest):
    """Create a new payment"""
    try:
        return create_payment(payment_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{payment_id}", response_model=PaymentResponse)
async def update_existing_payment(payment_id: str, payment_data: PaymentUpdateRequest):
    """Update an existing payment"""
    try:
        updated_payment = update_payment(payment_id, payment_data)
        if not updated_payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        return updated_payment
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{payment_id}/refund", response_model=PaymentResponse)
async def refund_existing_payment(payment_id: str, refund_data: RefundRequest):
    """Create a refund for a payment (soft delete equivalent)"""
    try:
        refund = refund_payment(payment_id, refund_data.reason)
        if not refund:
            raise HTTPException(status_code=404, detail="Payment not found")
        return refund
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: No delete endpoint - payments should be handled with refunds using the refund endpoint instead

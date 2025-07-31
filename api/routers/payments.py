from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
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
    tags=["Payments"],
    responses={
        404: {"description": "Payment not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

@router.get(
    "/", 
    response_model=List[PaymentResponse],
    summary="Get all payments",
    description="""
    Retrieve a list of all payments in the system.
    
    This endpoint returns all payment records with complete information including:
    - Payment details (amount, method, reference)
    - Associated invoice information (embedded)
    - Customer information (embedded)
    - Payment status and timestamps
    
    **Returns:**
    - List of payment objects with complete information
    - Empty list if no payments exist
    
    **Use cases:**
    - Payment history and tracking
    - Financial reporting and reconciliation
    - Customer payment analysis
    - Cash flow management
    """
)
async def get_payments():
    """Get all payments"""
    try:
        return get_all_payments()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/{payment_id}", 
    response_model=PaymentResponse,
    summary="Get payment by ID",
    description="""
    Retrieve a specific payment by its unique ID.
    
    **Parameters:**
    - `payment_id`: UUID of the payment to retrieve
    
    **Returns:**
    - Complete payment object including:
      - Payment information (amount, method, reference, date)
      - Associated invoice details (embedded)
      - Customer information (embedded)
      - Payment status and audit information
    
    **Errors:**
    - 404: Payment with the specified ID does not exist
    - 422: Invalid UUID format
    
    **Use cases:**
    - Payment verification and tracking
    - Dispute resolution
    - Financial auditing
    """
)
async def get_payment(payment_id: str):
    """Get a specific payment by ID"""
    try:
        payment = get_payment_by_id(payment_id)
        if not payment:
            raise HTTPException(status_code=404, detail=f"Payment not found: {payment_id}")
        return payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/", 
    response_model=PaymentResponse,
    status_code=201,
    summary="Create a new payment",
    description="""
    Record a new payment against an invoice.
    
    **Required fields:**
    - `invoice_id`: UUID of the invoice being paid
    - `amount`: Payment amount (> 0)
    - `payment_method`: Method of payment
    - `payment_date`: Date of payment
    
    **Optional fields:**
    - `reference_number`: Payment reference or transaction ID
    - `notes`: Additional payment notes
    - `currency`: Payment currency (default: system currency)
    
    **Payment Methods:**
    - `cash`: Cash payment
    - `check`: Check payment
    - `bank_transfer`: Bank transfer
    - `credit_card`: Credit card payment
    - `debit_card`: Debit card payment
    - `digital_wallet`: Digital wallet (PayPal, etc.)
    - `other`: Other payment methods
    
    **Returns:**
    - Created payment object with assigned ID and timestamps
    - Updated invoice payment status
    
    **Business Rules:**
    - Invoice must exist and be in payable status
    - Payment amount cannot exceed outstanding invoice amount
    - Multiple partial payments are allowed
    - Automatic calculation of remaining balance
    - Invoice status updated based on payment completion
    """
)
async def create_new_payment(payment_data: PaymentCreateRequest):
    """Create a new payment"""
    try:
        return create_payment(payment_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put(
    "/{payment_id}", 
    response_model=PaymentResponse,
    summary="Update an existing payment",
    description="""
    Update an existing payment's information.
    
    **Parameters:**
    - `payment_id`: UUID of the payment to update
    
    **Request body:**
    - All fields are optional for updates
    - Only provided fields will be updated
    - Invoice totals are recalculated if amount changes
    
    **Returns:**
    - Updated payment object with new information
    
    **Errors:**
    - 404: Payment with the specified ID does not exist
    - 422: Invalid data format or validation errors
    
    **Business Rules:**
    - Only pending or failed payments can be fully modified
    - Completed payments have limited update capabilities
    - Amount changes trigger invoice balance recalculation
    - Status changes may trigger invoice status updates
    """
)
async def update_existing_payment(payment_id: str, payment_data: PaymentUpdateRequest):
    """Update an existing payment"""
    try:
        updated_payment = update_payment(payment_id, payment_data)
        if not updated_payment:
            raise HTTPException(status_code=404, detail=f"Payment not found: {payment_id}")
        return updated_payment
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/{payment_id}/refund", 
    response_model=PaymentResponse,
    summary="Refund a payment",
    description="""
    Process a refund for an existing payment.
    
    This operation marks the payment as refunded while preserving
    the record for audit and reporting purposes. It also updates
    the associated invoice's payment status accordingly.
    
    **Parameters:**
    - `payment_id`: UUID of the payment to refund
    
    **Request body:**
    - `reason`: Optional reason for the refund
    
    **Returns:**
    - Updated payment object with refunded status
    
    **Errors:**
    - 404: Payment with the specified ID does not exist
    - 422: Payment cannot be refunded (e.g., already refunded)
    
    **Business Rules:**
    - Only completed payments can be refunded
    - Refunded payments cannot be modified
    - Refund creates an audit trail
    - Associated invoice status is updated
    - Refunds may trigger accounting entries
    
    **Note:** Use this instead of deletion to maintain financial records integrity
    """
)
async def refund_existing_payment(payment_id: str, refund_data: RefundRequest):
    """Create a refund for a payment (soft delete equivalent)"""
    try:
        refund = refund_payment(payment_id, refund_data.reason)
        if not refund:
            raise HTTPException(status_code=404, detail=f"Payment not found: {payment_id}")
        return refund
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Note: No delete endpoint - payments should be handled with refunds using the refund endpoint instead

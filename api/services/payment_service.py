from db.database import db
from models.payment_models import PaymentCreateRequest, PaymentUpdateRequest, PaymentResponse
from typing import List, Optional
import uuid
from datetime import date
from datetime import datetime

def get_all_payments() -> List[PaymentResponse]:
    query = "SELECT * FROM payments ORDER BY created_at DESC"
    result = db.fetch_all(query)
    return [PaymentResponse(**row) for row in result]

def get_payment_by_id(payment_id: str) -> Optional[PaymentResponse]:
    query = "SELECT * FROM payments WHERE id = %s"
    result = db.fetch_one(query, (payment_id,))
    return PaymentResponse(**result) if result else None

def create_payment(payment_data: PaymentCreateRequest) -> PaymentResponse:
    payment_id = str(uuid.uuid4())
    data = payment_data.dict()
    data['id'] = payment_id
    # Remove auto-generated fields - created_at is handled by DB
    
    query = """
        INSERT INTO payments (id, invoice_id, customer_id, amount, date, method, reference, notes, is_refund, is_advance)
        VALUES (%(id)s, %(invoice_id)s, %(customer_id)s, %(amount)s, %(date)s, %(method)s, %(reference)s, %(notes)s, %(is_refund)s, %(is_advance)s)
    """
    db.execute(query, data)
    return get_payment_by_id(payment_id)

def update_payment(payment_id: str, payment_data: PaymentUpdateRequest) -> Optional[PaymentResponse]:
    # Check if payment exists
    existing_payment = get_payment_by_id(payment_id)
    if not existing_payment:
        return None
    
    data = payment_data.dict(exclude_unset=True)
    data['id'] = payment_id
    
    # Build dynamic query based on provided fields
    set_clause = ", ".join([f"{key}=%({key})s" for key in data.keys() if key != 'id'])
    query = f"UPDATE payments SET {set_clause} WHERE id=%(id)s"
    
    db.execute(query, data)
    
    # Return updated payment
    return get_payment_by_id(payment_id)

def refund_payment(payment_id: str, reason: str = None) -> Optional[PaymentResponse]:
    """Create a refund for a payment - this is the soft delete equivalent"""
    original_payment = get_payment_by_id(payment_id)
    if not original_payment:
        return None
    
    # Create refund entry
    refund_data = {
        'id': str(uuid.uuid4()),
        'invoice_id': original_payment.invoice_id,
        'customer_id': original_payment.customer_id,
        'amount': original_payment.amount,  # Same amount as original
        'date': date.today(),
        'method': original_payment.method,
        'reference': f"REFUND-{original_payment.id[:8]}",
        'notes': f"Refund for payment {original_payment.id}. Reason: {reason or 'No reason provided'}",
        'is_refund': True,
        'is_advance': False
    }
    
    query = """
        INSERT INTO payments (id, invoice_id, customer_id, amount, date, method, reference, notes, is_refund, is_advance)
        VALUES (%(id)s, %(invoice_id)s, %(customer_id)s, %(amount)s, %(date)s, %(method)s, %(reference)s, %(notes)s, %(is_refund)s, %(is_advance)s)
    """
    db.execute(query, refund_data)
    return get_payment_by_id(refund_data['id'])

# Note: No delete function - payments should be handled with refunds using refund_payment() instead

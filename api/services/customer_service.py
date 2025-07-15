from db.database import db
from models.customer_models import CustomerCreateRequest, CustomerUpdateRequest, CustomerResponse
from typing import List, Optional
import uuid
from datetime import datetime

def get_all_customers() -> List[CustomerResponse]:
    query = "SELECT * FROM customers WHERE is_active = TRUE ORDER BY name"
    result = db.fetch_all(query)
    return [CustomerResponse(**row) for row in result]

def get_all_customers_including_inactive() -> List[CustomerResponse]:
    query = "SELECT * FROM customers ORDER BY name"
    result = db.fetch_all(query)
    return [CustomerResponse(**row) for row in result]

def get_customer_by_id(customer_id: str) -> Optional[CustomerResponse]:
    query = "SELECT * FROM customers WHERE id = %s AND is_active = TRUE"
    result = db.fetch_one(query, (customer_id,))
    return CustomerResponse(**result) if result else None

def create_customer(customer_data: CustomerCreateRequest) -> CustomerResponse:
    customer_id = str(uuid.uuid4())
    data = customer_data.dict()
    data['id'] = customer_id
    data['is_active'] = True
    # Remove auto-generated fields - created_at and updated_at are handled by DB
    
    query = """
        INSERT INTO customers (id, name, contact, email, phone, billing_address, shipping_address, gst_no, place_of_supply, payment_terms, credit_limit, company_type, notes, is_active)
        VALUES (%(id)s, %(name)s, %(contact)s, %(email)s, %(phone)s, %(billing_address)s, %(shipping_address)s, %(gst_no)s, %(place_of_supply)s, %(payment_terms)s, %(credit_limit)s, %(company_type)s, %(notes)s, %(is_active)s)
    """
    db.execute(query, data)
    return get_customer_by_id(customer_id)

def update_customer(customer_id: str, customer_data: CustomerUpdateRequest) -> Optional[CustomerResponse]:
    # Check if customer exists
    existing_customer = get_customer_by_id(customer_id)
    if not existing_customer:
        return None
    
    data = customer_data.dict(exclude_unset=True)
    data['id'] = customer_id
    # Remove updated_at - it's handled by trigger
    
    # Build dynamic query based on provided fields
    set_clause = ", ".join([f"{key}=%({key})s" for key in data.keys() if key != 'id'])
    query = f"UPDATE customers SET {set_clause} WHERE id=%(id)s"
    
    db.execute(query, data)
    
    # Return updated customer
    return get_customer_by_id(customer_id)

def delete_customer(customer_id: str) -> bool:
    query = "UPDATE customers SET is_active = FALSE WHERE id = %s"
    try:
        db.execute(query, (customer_id,))
        return True
    except:
        return False

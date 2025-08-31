from db.database import db
from models.customer_models import CustomerCreateRequest, CustomerUpdateRequest, CustomerResponse
from typing import List, Optional
import uuid
from datetime import datetime
import json

def get_all_customers() -> List[CustomerResponse]:
    query = "SELECT * FROM customers WHERE is_active = TRUE ORDER BY name"
    result = db.fetch_all(query)
    return [CustomerResponse(**row) for row in result]

def search_customers(search_term: str) -> List[CustomerResponse]:
    pattern = f"%{search_term}%"
    query = (
        "SELECT * FROM customers WHERE is_active = TRUE AND ("
        "name ILIKE %s OR email ILIKE %s OR phone ILIKE %s OR contact ILIKE %s OR COALESCE(company_type,'') ILIKE %s"
        ") ORDER BY name"
    )
    result = db.fetch_all(query, (pattern, pattern, pattern, pattern, pattern))
    return [CustomerResponse(**row) for row in result]

def get_all_customers_including_inactive() -> List[CustomerResponse]:
    query = "SELECT * FROM customers ORDER BY name"
    result = db.fetch_all(query)
    return [CustomerResponse(**row) for row in result]

def get_customer_by_id(customer_id: str) -> Optional[CustomerResponse]:
    query = "SELECT * FROM customers WHERE id = %s AND is_active = TRUE"
    result = db.fetch_one(query, (customer_id,))
    return CustomerResponse(**result) if result else None

def _serialize_addresses(data: dict) -> dict:
    # Ensure address JSON fields are serialized for DB
    for key in ["billing_address", "shipping_address"]:
        if key in data and data[key] is not None and not isinstance(data[key], str):
            try:
                data[key] = json.dumps(data[key])
            except Exception:
                # Fallback to string conversion if serialization fails
                data[key] = json.dumps({}) if key == "billing_address" else None
    return data

def create_customer(customer_data: CustomerCreateRequest) -> CustomerResponse:
    customer_id = str(uuid.uuid4())
    data = customer_data.dict()
    data['id'] = customer_id
    data['is_active'] = True
    data = _serialize_addresses(data)

    query = """
        INSERT INTO customers (id, name, contact, email, phone, billing_address, shipping_address, gst_no, place_of_supply, payment_terms, credit_limit, company_type, notes, is_active)
        VALUES (%(id)s, %(name)s, %(contact)s, %(email)s, %(phone)s, %(billing_address)s::jsonb, %(shipping_address)s::jsonb, %(gst_no)s, %(place_of_supply)s, %(payment_terms)s, %(credit_limit)s, %(company_type)s, %(notes)s, %(is_active)s)
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
    data = _serialize_addresses(data)

    # Build dynamic query based on provided fields
    set_parts = []
    for key in data.keys():
        if key == 'id':
            continue
        if key in ('billing_address', 'shipping_address'):
            set_parts.append(f"{key}=%({key})s::jsonb")
        else:
            set_parts.append(f"{key}=%({key})s")
    set_clause = ", ".join(set_parts)
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

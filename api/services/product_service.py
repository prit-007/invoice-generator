from db.database import db
from models.product_models import ProductCreateRequest, ProductUpdateRequest, ProductResponse
from typing import List, Optional
import uuid
from datetime import datetime

def get_all_products() -> List[ProductResponse]:
    query = "SELECT * FROM products WHERE is_active = TRUE ORDER BY name"
    result = db.fetch_all(query)
    return [ProductResponse(**row) for row in result]

def search_products(search_term: str) -> List[ProductResponse]:
    pattern = f"%{search_term}%"
    query = (
        "SELECT * FROM products WHERE is_active = TRUE AND ("
        "name ILIKE %s OR description ILIKE %s OR category ILIKE %s"
        ") ORDER BY name"
    )
    result = db.fetch_all(query, (pattern, pattern, pattern))
    return [ProductResponse(**row) for row in result]

def get_all_products_including_inactive() -> List[ProductResponse]:
    query = "SELECT * FROM products ORDER BY name"
    result = db.fetch_all(query)
    return [ProductResponse(**row) for row in result]

def get_product_by_id(product_id: str) -> Optional[ProductResponse]:
    query = "SELECT * FROM products WHERE id = %s AND is_active = TRUE"
    result = db.fetch_one(query, (product_id,))
    return ProductResponse(**result) if result else None

def create_product(product_data: ProductCreateRequest) -> ProductResponse:
    product_id = str(uuid.uuid4())
    data = product_data.dict()
    data['id'] = product_id
    data['is_active'] = True
    # Remove auto-generated fields - created_at is handled by DB

    query = """
        INSERT INTO products (id, name, description, hsn_sac_code, price, tax_rate, unit, is_taxable, category, is_active)
        VALUES (%(id)s, %(name)s, %(description)s, %(hsn_sac_code)s, %(price)s, %(tax_rate)s, %(unit)s, %(is_taxable)s, %(category)s, %(is_active)s)
    """
    db.execute(query, data)
    return get_product_by_id(product_id)

def update_product(product_id: str, product_data: ProductUpdateRequest) -> Optional[ProductResponse]:
    # Check if product exists
    existing_product = get_product_by_id(product_id)
    if not existing_product:
        return None

    data = product_data.dict(exclude_unset=True)
    data['id'] = product_id

    # Build dynamic query based on provided fields
    set_clause = ", ".join([f"{key}=%({key})s" for key in data.keys() if key != 'id'])
    query = f"UPDATE products SET {set_clause} WHERE id=%(id)s"

    db.execute(query, data)

    # Return updated product
    return get_product_by_id(product_id)

def delete_product(product_id: str) -> bool:
    query = "UPDATE products SET is_active = FALSE WHERE id = %s"
    try:
        db.execute(query, (product_id,))
        return True
    except:
        return False

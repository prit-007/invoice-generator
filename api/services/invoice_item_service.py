from db.database import db
from models.invoice_item_models import InvoiceItemCreateRequest, InvoiceItemUpdateRequest, InvoiceItemResponse
from typing import List, Optional
import uuid
import logging

logger = logging.getLogger(__name__)

def validate_uuid(uuid_string: str) -> bool:
    """Validate if string is a valid UUID format"""
    try:
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False

def get_invoice_items_by_invoice_id(invoice_id: str) -> List[InvoiceItemResponse]:
    """Get all invoice items for a specific invoice"""
    if not validate_uuid(invoice_id):
        raise ValueError(f"Invalid invoice ID format: {invoice_id}")
    
    logger.info(f"Fetching invoice items for invoice: {invoice_id}")
    query = "SELECT * FROM invoice_items WHERE invoice_id = %s ORDER BY id"
    result = db.fetch_all(query, (invoice_id,))
    return [InvoiceItemResponse(**row) for row in result]

def get_invoice_item_by_id(item_id: str) -> Optional[InvoiceItemResponse]:
    """Get a specific invoice item by ID"""
    if not validate_uuid(item_id):
        raise ValueError(f"Invalid item ID format: {item_id}")
    
    logger.info(f"Fetching invoice item: {item_id}")
    query = "SELECT * FROM invoice_items WHERE id = %s"
    result = db.fetch_one(query, (item_id,))
    
    if not result:
        logger.warning(f"Invoice item not found: {item_id}")
        return None
    
    return InvoiceItemResponse(**result)

def create_invoice_item(item_data: InvoiceItemCreateRequest) -> InvoiceItemResponse:
    """Create a new invoice item"""
    if not validate_uuid(item_data.invoice_id):
        raise ValueError(f"Invalid invoice ID format: {item_data.invoice_id}")
    
    if item_data.product_id and not validate_uuid(item_data.product_id):
        raise ValueError(f"Invalid product ID format: {item_data.product_id}")
    
    item_id = str(uuid.uuid4())
    data = item_data.dict()
    data['id'] = item_id
    
    # Validate required fields
    if not data.get('description'):
        raise ValueError("Description is required")
    if not data.get('quantity') or data.get('quantity') <= 0:
        raise ValueError("Quantity must be greater than 0")
    if not data.get('unit_price') or data.get('unit_price') < 0:
        raise ValueError("Unit price must be non-negative")
    
    # Get product details if not provided
    if item_data.product_id and (not item_data.unit_price or not item_data.description):
        product_query = "SELECT name, price, tax_rate FROM products WHERE id = %s AND is_active = TRUE"
        product_result = db.fetch_one(product_query, (item_data.product_id,))
        
        if not product_result:
            raise ValueError(f"Product not found or inactive: {item_data.product_id}")
        
        data['unit_price'] = data.get('unit_price') or product_result['price']
        data['tax_rate'] = data.get('tax_rate') or product_result['tax_rate']
        data['description'] = data.get('description') or product_result['name']
    
    logger.info(f"Creating invoice item for invoice: {item_data.invoice_id}")
    query = """
        INSERT INTO invoice_items (id, invoice_id, product_id, description, quantity, unit_price, tax_rate, discount)
        VALUES (%(id)s, %(invoice_id)s, %(product_id)s, %(description)s, %(quantity)s, %(unit_price)s, %(tax_rate)s, %(discount)s)
    """
    db.execute(query, data)
    return get_invoice_item_by_id(item_id)

def update_invoice_item(item_id: str, item_data: InvoiceItemUpdateRequest) -> Optional[InvoiceItemResponse]:
    """Update an existing invoice item"""
    if not validate_uuid(item_id):
        raise ValueError(f"Invalid item ID format: {item_id}")
    
    # Check if item exists
    existing_item = get_invoice_item_by_id(item_id)
    if not existing_item:
        raise ValueError(f"Invoice item not found: {item_id}")
    
    data = item_data.dict(exclude_unset=True)
    
    # Validate updated fields
    if 'quantity' in data and (not data['quantity'] or data['quantity'] <= 0):
        raise ValueError("Quantity must be greater than 0")
    if 'unit_price' in data and data['unit_price'] < 0:
        raise ValueError("Unit price must be non-negative")
    if 'product_id' in data and data['product_id'] and not validate_uuid(data['product_id']):
        raise ValueError(f"Invalid product ID format: {data['product_id']}")
    
    data['id'] = item_id
    
    # Build dynamic query based on provided fields
    set_clause = ", ".join([f"{key}=%({key})s" for key in data.keys() if key != 'id'])
    query = f"UPDATE invoice_items SET {set_clause} WHERE id=%(id)s"
    
    logger.info(f"Updating invoice item: {item_id}")
    db.execute(query, data)
    
    # Return updated item
    return get_invoice_item_by_id(item_id)

def delete_invoice_items_by_invoice_id(invoice_id: str) -> bool:
    """Delete all invoice items for a specific invoice (used during invoice updates)"""
    if not validate_uuid(invoice_id):
        raise ValueError(f"Invalid invoice ID format: {invoice_id}")
    
    query = "DELETE FROM invoice_items WHERE invoice_id = %s"
    try:
        logger.info(f"Deleting invoice items for invoice: {invoice_id}")
        db.execute(query, (invoice_id,))
        return True
    except Exception as e:
        logger.error(f"Failed to delete invoice items for invoice {invoice_id}: {e}")
        return False

# Note: Invoice items are managed through invoice lifecycle
# They should be updated/replaced when the invoice is updated
# Individual invoice items can be updated but deletion is typically done at invoice level

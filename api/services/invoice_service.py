from db.database import db
from models.invoice_models import InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceResponse, InvoiceItemWithProduct
from typing import List, Optional
import uuid
from datetime import datetime, date, timedelta

def get_all_invoices() -> List[InvoiceResponse]:
    query = """
        SELECT 
            i.*,
            c.name as customer_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        ORDER BY i.created_at DESC
    """
    result = db.fetch_all(query)
    
    invoices = []
    for row in result:
        invoice_data = dict(row)
        # Get invoice items with product details
        invoice_data['items'] = get_invoice_items_with_products(row['id'])
        invoices.append(InvoiceResponse(**invoice_data))
    
    return invoices

def get_invoice_by_id(invoice_id: str) -> Optional[InvoiceResponse]:
    query = """
        SELECT 
            i.*,
            c.name as customer_name
        FROM invoices i
        LEFT JOIN customers c ON i.customer_id = c.id
        WHERE i.id = %s
    """
    result = db.fetch_one(query, (invoice_id,))
    
    if result:
        invoice_data = dict(result)
        # Get invoice items with product details
        invoice_data['items'] = get_invoice_items_with_products(invoice_id)
        return InvoiceResponse(**invoice_data)
    
    return None

def get_invoice_items_with_products(invoice_id: str) -> List[InvoiceItemWithProduct]:
    query = """
        SELECT 
            ii.*,
            p.name as product_name
        FROM invoice_items ii
        LEFT JOIN products p ON ii.product_id = p.id
        WHERE ii.invoice_id = %s
        ORDER BY ii.id
    """
    result = db.fetch_all(query, (invoice_id,))
    return [InvoiceItemWithProduct(**row) for row in result]

def create_invoice(invoice_data: InvoiceCreateRequest) -> InvoiceResponse:
    invoice_id = str(uuid.uuid4())
    
    # Get customer details for shipping address fallback
    customer_query = "SELECT billing_address FROM customers WHERE id = %s"
    customer_result = db.fetch_one(customer_query, (invoice_data.customer_id,))
    
    shipping_address = invoice_data.shipping_address
    if not shipping_address and customer_result:
        shipping_address = customer_result['billing_address']
    
    # Create invoice with provided totals
    invoice_query = """
        INSERT INTO invoices (
            id, customer_id, due_date, status, subtotal, tax_amount, total_amount,
            shipping_details, notes, terms, invoice_type, is_template
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    db.execute(invoice_query, (
        invoice_id,
        invoice_data.customer_id,
        invoice_data.due_date or (date.today() + timedelta(days=15)),
        invoice_data.status,
        invoice_data.subtotal,
        invoice_data.tax_amount,
        invoice_data.total_amount,
        shipping_address,
        invoice_data.notes,
        invoice_data.terms,
        invoice_data.invoice_type,
        invoice_data.is_template
    ))
    
    # Create invoice items
    for item in invoice_data.items:
        create_invoice_item(invoice_id, item)
    
    return get_invoice_by_id(invoice_id)

def create_invoice_item(invoice_id: str, item_data):
    # Get product details if not provided
    product_query = "SELECT name, price, tax_rate FROM products WHERE id = %s"
    product_result = db.fetch_one(product_query, (item_data.product_id,))
    
    unit_price = item_data.unit_price
    tax_rate = item_data.tax_rate
    description = item_data.description
    
    if product_result:
        unit_price = unit_price or product_result['price']
        tax_rate = tax_rate or product_result['tax_rate']
        description = description or product_result['name']
    
    item_query = """
        INSERT INTO invoice_items (
            id, invoice_id, product_id, description, quantity, unit_price, tax_rate, discount
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    
    db.execute(item_query, (
        str(uuid.uuid4()),
        invoice_id,
        item_data.product_id,
        description,
        item_data.quantity,
        unit_price,
        tax_rate,
        item_data.discount
    ))

def update_invoice(invoice_id: str, invoice_data: InvoiceUpdateRequest) -> Optional[InvoiceResponse]:
    # Check if invoice exists
    existing_invoice = get_invoice_by_id(invoice_id)
    if not existing_invoice:
        return None
    
    # Update invoice fields
    update_fields = []
    params = {'id': invoice_id}
    
    for field, value in invoice_data.dict(exclude_unset=True).items():
        if field == 'items':
            continue  # Handle items separately
        if field == 'shipping_address':
            update_fields.append("shipping_details = %(shipping_details)s")
            params['shipping_details'] = value
        else:
            update_fields.append(f"{field} = %({field})s")
            params[field] = value
    
    if update_fields:
        query = f"UPDATE invoices SET {', '.join(update_fields)} WHERE id = %(id)s"
        db.execute(query, params)
    
    # Update invoice items if provided
    if invoice_data.items is not None:
        # Delete existing items
        from services.invoice_item_service import delete_invoice_items_by_invoice_id
        delete_invoice_items_by_invoice_id(invoice_id)
        
        # Create new items
        for item in invoice_data.items:
            create_invoice_item(invoice_id, item)
    
    # Return updated invoice
    return get_invoice_by_id(invoice_id)

def cancel_invoice(invoice_id: str, reason: str = None) -> Optional[InvoiceResponse]:
    """Cancel an invoice - this is the soft delete equivalent"""
    existing_invoice = get_invoice_by_id(invoice_id)
    if not existing_invoice:
        return None
    
    # Update invoice status to cancelled with reason
    query = """
        UPDATE invoices 
        SET status = 'cancelled', cancel_reason = %s 
        WHERE id = %s
    """
    db.execute(query, (reason or 'No reason provided', invoice_id))
    
    return get_invoice_by_id(invoice_id)

# Note: No delete function - invoices should be cancelled using cancel_invoice() instead

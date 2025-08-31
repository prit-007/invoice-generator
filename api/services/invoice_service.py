from fastapi import logger
from db.database import db
from models.invoice_models import InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceResponse, InvoiceItemWithProduct
from typing import List, Optional
import uuid
from datetime import datetime, date, timedelta
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
import io
import json

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

    # Process each item to calculate missing values
    items = []
    for row in result:
        # Convert to dict for manipulation
        item_data = dict(row)

        # Calculate missing values if they're None
        quantity = float(item_data.get('quantity', 0))
        unit_price = float(item_data.get('unit_price', 0))
        discount_percentage = float(item_data.get('discount_percentage', 0))
        discount_amount = float(item_data.get('discount_amount', 0))
        tax_rate = float(item_data.get('tax_rate', 0))

        # Calculate taxable amount if missing
        if item_data.get('taxable_amount') is None:
            # Taxable amount = (quantity * unit_price) - discount_amount - (quantity * unit_price * discount_percentage / 100)
            gross_amount = quantity * unit_price
            percentage_discount = gross_amount * (discount_percentage / 100)
            item_data['taxable_amount'] = gross_amount - discount_amount - percentage_discount

        # Calculate tax amount if missing
        if item_data.get('tax_amount') is None:
            taxable_amount = float(item_data.get('taxable_amount', 0))
            item_data['tax_amount'] = taxable_amount * (tax_rate / 100)

        # Calculate line total if missing
        if item_data.get('line_total') is None:
            taxable_amount = float(item_data.get('taxable_amount', 0))
            tax_amount = float(item_data.get('tax_amount', 0))
            item_data['line_total'] = taxable_amount + tax_amount

        items.append(InvoiceItemWithProduct(**item_data))

    return items

def create_invoice(invoice_data: InvoiceCreateRequest) -> InvoiceResponse:
    invoice_id = str(uuid.uuid4())

    # Get customer details for shipping address fallback
    customer_query = "SELECT billing_address FROM customers WHERE id = %s"
    customer_result = db.fetch_one(customer_query, (invoice_data.customer_id,))

    shipping_address = invoice_data.shipping_address
    if not shipping_address and customer_result:
        shipping_address = customer_result['billing_address']

    # Convert dict to JSON string for database storage
    if isinstance(shipping_address, dict):
        import json
        shipping_address = json.dumps(shipping_address)

    # 1) Insert invoice header first (avoid FK violation on items)
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
        0,  # provisional subtotal
        0,  # provisional tax
        0,  # provisional total
        shipping_address,
        invoice_data.notes,
        invoice_data.terms,
        invoice_data.invoice_type,
        invoice_data.is_template
    ))

    # 2) Create invoice items and compute totals
    subtotal = 0
    tax_amount = 0
    for item in invoice_data.items:
        create_invoice_item(invoice_id, item)

    items = get_invoice_items_with_products(invoice_id)
    subtotal = sum(float(item.taxable_amount or 0) for item in items)
    tax_amount = sum(float(item.tax_amount or 0) for item in items)
    total_amount = subtotal + tax_amount

    # 3) Update totals on header
    db.execute(
        "UPDATE invoices SET subtotal=%s, tax_amount=%s, total_amount=%s WHERE id=%s",
        (subtotal, tax_amount, total_amount, invoice_id)
    )

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

    # Calculate amounts
    quantity = float(item_data.quantity)
    discount = float(getattr(item_data, 'discount', 0))
    discount_percentage = float(getattr(item_data, 'discount_percentage', 0))

    # Calculate taxable amount
    gross_amount = quantity * unit_price
    percentage_discount = gross_amount * (discount_percentage / 100)
    taxable_amount = gross_amount - discount - percentage_discount

    # Calculate tax amount
    tax_amount = taxable_amount * (tax_rate / 100)

    # Calculate line total
    line_total = taxable_amount + tax_amount

    item_query = """
        INSERT INTO invoice_items (
            id, invoice_id, product_id, description, quantity, unit_price, tax_rate,
            discount_percentage, discount_amount, taxable_amount, tax_amount, line_total
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """

    db.execute(item_query, (
        str(uuid.uuid4()),
        invoice_id,
        item_data.product_id,
        description,
        quantity,
        unit_price,
        tax_rate,
        discount_percentage,
        discount,
        taxable_amount,
        tax_amount,
        line_total
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
            # Convert dict to JSON string for database storage
            if isinstance(value, dict):
                import json
                params['shipping_details'] = json.dumps(value)
            else:
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


def generate_invoice_pdf(invoice_id: str) -> bytes:
    """Generate PDF using RUBY ENTERPRISE format"""
    try:
        from services.ruby_pdf_generator import generate_ruby_enterprise_pdf
        return generate_ruby_enterprise_pdf(invoice_id)
    except Exception as e:
        logger.error(f"Error generating RUBY ENTERPRISE PDF: {e}")
        # Fallback to original PDF generation
        return generate_invoice_pdf_original(invoice_id)

def generate_invoice_pdf_original(invoice_id: str) -> bytes:
    """Generate PDF for an invoice"""
    try:
        # Get invoice data
        invoice = get_invoice_by_id(invoice_id)
        if not invoice:
            return None

        # Create PDF buffer
        buffer = io.BytesIO()

        # Create PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )

        # Get styles
        styles = getSampleStyleSheet()

        # Custom styles
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#1f2937')
        )

        header_style = ParagraphStyle(
            'CustomHeader',
            parent=styles['Heading2'],
            fontSize=14,
            spaceAfter=12,
            textColor=colors.HexColor('#374151')
        )

        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=10,
            spaceAfter=6
        )

        # Build PDF content
        story = []

        # Title
        story.append(Paragraph("INVOICE", title_style))
        story.append(Spacer(1, 20))

        # Invoice header info
        header_data = [
            ['Invoice #:', invoice.invoice_number or 'N/A'],
            ['Date:', invoice.date.strftime('%Y-%m-%d') if invoice.date else 'N/A'],
            ['Due Date:', invoice.due_date.strftime('%Y-%m-%d') if invoice.due_date else 'N/A'],
            ['Status:', (invoice.status or 'draft').upper()]
        ]

        header_table = Table(header_data, colWidths=[2*inch, 3*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))

        story.append(header_table)
        story.append(Spacer(1, 30))

        # Customer information
        story.append(Paragraph("BILL TO:", header_style))

        customer_info = []
        if hasattr(invoice, 'customer_name') and invoice.customer_name:
            customer_info.append(invoice.customer_name)

        # Add customer details if available
        if customer_info:
            for info in customer_info:
                story.append(Paragraph(info, normal_style))
        else:
            story.append(Paragraph("Customer information not available", normal_style))

        story.append(Spacer(1, 30))

        # Invoice items
        story.append(Paragraph("ITEMS:", header_style))

        # Items table header
        items_data = [['Description', 'Qty', 'Rate', 'Discount', 'Tax', 'Amount']]

        # Add items
        total_amount = 0
        if invoice.items:
            for item in invoice.items:
                quantity = float(item.quantity) if item.quantity else 0
                unit_price = float(item.unit_price) if item.unit_price else 0
                discount = float(item.discount) if item.discount else 0
                tax_rate = float(item.tax_rate) if item.tax_rate else 0

                # Calculate line total
                line_total = quantity * unit_price * (1 - discount / 100)
                line_tax = line_total * (tax_rate / 100)
                total_with_tax = line_total + line_tax
                total_amount += total_with_tax

                items_data.append([
                    item.product_name or item.description or 'N/A',
                    str(quantity),
                    f"₹{unit_price:.2f}",
                    f"{discount}%",
                    f"{tax_rate}%",
                    f"₹{total_with_tax:.2f}"
                ])

        # Create items table
        items_table = Table(items_data, colWidths=[3*inch, 0.8*inch, 1*inch, 0.8*inch, 0.8*inch, 1.2*inch])
        items_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),  # Description left aligned
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),

            # Grid
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),

            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ]))

        story.append(items_table)
        story.append(Spacer(1, 30))

        # Totals section
        totals_data = [
            ['Subtotal:', f"₹{invoice.subtotal:.2f}" if invoice.subtotal else "₹0.00"],
            ['Tax:', f"₹{invoice.tax_amount:.2f}" if invoice.tax_amount else "₹0.00"],
            ['Total:', f"₹{invoice.total_amount:.2f}" if invoice.total_amount else "₹0.00"]
        ]

        if invoice.amount_paid and invoice.amount_paid > 0:
            totals_data.append(['Paid:', f"₹{invoice.amount_paid:.2f}"])
            balance_due = (invoice.total_amount or 0) - (invoice.amount_paid or 0)
            totals_data.append(['Balance Due:', f"₹{balance_due:.2f}"])

        totals_table = Table(totals_data, colWidths=[4*inch, 2*inch])
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),  # Bold total row
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LINEABOVE', (0, -1), (-1, -1), 1, colors.black),  # Line above total
        ]))

        story.append(totals_table)
        story.append(Spacer(1, 30))

        # Notes and terms
        if invoice.notes or invoice.terms:
            if invoice.notes:
                story.append(Paragraph("Notes:", header_style))
                story.append(Paragraph(invoice.notes, normal_style))
                story.append(Spacer(1, 15))

            if invoice.terms:
                story.append(Paragraph("Terms & Conditions:", header_style))
                story.append(Paragraph(invoice.terms, normal_style))

        # Build PDF
        doc.build(story)

        # Get PDF content
        pdf_content = buffer.getvalue()
        buffer.close()

        return pdf_content

    except Exception as e:
        print(f"Error generating PDF: {e}")
        return None

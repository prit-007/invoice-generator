from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from typing import List, Optional
from pydantic import BaseModel
from services.invoice_service import (
    get_all_invoices,
    get_invoice_by_id,
    create_invoice,
    update_invoice,
    cancel_invoice,
    generate_invoice_pdf
)
from models.invoice_models import InvoiceCreateRequest, InvoiceUpdateRequest, InvoiceResponse

# Request model for cancellation
class CancelInvoiceRequest(BaseModel):
    reason: str = None

router = APIRouter(
    prefix="/invoices",
    tags=["Invoices"],
    responses={
        404: {"description": "Invoice not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

@router.get(
    "/", 
    response_model=List[InvoiceResponse],
    summary="Get all invoices",
    description="""
    Retrieve a list of all invoices in the system with embedded customer and product details.
    
    This endpoint returns invoices with complete information including:
    - Invoice header details (number, dates, amounts)
    - Customer information (embedded)
    - Line items with product details (embedded)
    - Calculated totals (subtotal, tax, total)
    
    **Returns:**
    - List of invoice objects with complete information
    - Empty list if no invoices exist
    
    **Use cases:**
    - Invoice listing and management
    - Financial reporting
    - Customer account statements
    """
)
async def get_invoices():
    """Get all invoices with embedded customer and product details"""
    try:
        return get_all_invoices()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/{invoice_id}", 
    response_model=InvoiceResponse,
    summary="Get invoice by ID",
    description="""
    Retrieve a specific invoice by its unique ID with complete details.
    
    **Parameters:**
    - `invoice_id`: UUID of the invoice to retrieve
    
    **Returns:**
    - Complete invoice object including:
      - Header information (invoice number, dates, status)
      - Customer details (embedded from customer record)
      - Line items with full product information
      - Financial calculations (subtotals, taxes, discounts)
      - Payment information and status
    
    **Errors:**
    - 404: Invoice with the specified ID does not exist
    - 422: Invalid UUID format
    
    **Use cases:**
    - Invoice viewing and printing
    - Payment processing
    - Invoice editing
    """
)
async def get_invoice(invoice_id: str):
    """Get a specific invoice by ID with embedded items and product details"""
    try:
        invoice = get_invoice_by_id(invoice_id)
        if not invoice:
            raise HTTPException(status_code=404, detail=f"Invoice not found: {invoice_id}")
        return invoice
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/", 
    response_model=InvoiceResponse,
    status_code=201,
    summary="Create a new invoice",
    description="""
    Create a new invoice with line items.
    
    **Required fields:**
    - `customer_id`: UUID of the customer
    - `invoice_date`: Date of invoice creation
    - `due_date`: Payment due date
    - `items`: List of invoice line items
    
    **Optional fields:**
    - `invoice_number`: Auto-generated if not provided
    - `notes`: Additional notes or terms
    - `discount_amount`: Discount amount
    - `tax_amount`: Additional tax amount (calculated if not provided)
    
    **Line Item fields:**
    - `product_id`: UUID of the product
    - `quantity`: Quantity ordered (> 0)
    - `unit_price`: Price per unit (uses product price if not provided)
    - `discount_amount`: Line item discount
    
    **Returns:**
    - Created invoice object with:
      - Assigned invoice ID and number
      - Calculated totals
      - Embedded customer and product details
    
    **Business Rules:**
    - Customer must exist and be active
    - Products must exist and be active
    - Quantities must be positive
    - Automatic calculation of line totals and invoice totals
    - Stock levels are checked but not automatically updated
    """
)
async def create_new_invoice(invoice_data: InvoiceCreateRequest):
    """Create a new invoice with items"""
    try:
        return create_invoice(invoice_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put(
    "/{invoice_id}", 
    response_model=InvoiceResponse,
    summary="Update an existing invoice",
    description="""
    Update an existing invoice's information and line items.
    
    **Parameters:**
    - `invoice_id`: UUID of the invoice to update
    
    **Request body:**
    - All fields are optional for updates
    - Line items can be added, modified, or removed
    - Totals are automatically recalculated
    
    **Returns:**
    - Updated invoice object with new information
    
    **Errors:**
    - 404: Invoice with the specified ID does not exist
    - 422: Invalid data format or validation errors
    
    **Business Rules:**
    - Only draft invoices can be fully modified
    - Paid invoices have limited update capabilities
    - Customer and product references must be valid
    - Automatic recalculation of all totals
    """
)
async def update_existing_invoice(invoice_id: str, invoice_data: InvoiceUpdateRequest):
    """Update an existing invoice and its items"""
    try:
        updated_invoice = update_invoice(invoice_id, invoice_data)
        if not updated_invoice:
            raise HTTPException(status_code=404, detail=f"Invoice not found: {invoice_id}")
        return updated_invoice
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/{invoice_id}/cancel", 
    response_model=InvoiceResponse,
    summary="Cancel an invoice",
    description="""
    Cancel an existing invoice instead of deleting it.
    
    This operation marks the invoice as cancelled while preserving
    the record for audit and reporting purposes.
    
    **Parameters:**
    - `invoice_id`: UUID of the invoice to cancel
    
    **Request body:**
    - `reason`: Optional reason for cancellation
    
    **Returns:**
    - Updated invoice object with cancelled status
    
    **Errors:**
    - 404: Invoice with the specified ID does not exist
    - 422: Invoice cannot be cancelled (e.g., already paid)
    
    **Business Rules:**
    - Only unpaid invoices can be cancelled
    - Cancelled invoices cannot be modified
    - Cancellation creates an audit trail
    - Stock levels may be updated if inventory tracking is enabled
    
    **Note:** Use this instead of deletion to maintain financial records integrity
    """
)
async def cancel_existing_invoice(invoice_id: str, cancel_data: CancelInvoiceRequest):
    """Cancel an invoice (soft delete equivalent)"""
    try:
        cancelled_invoice = cancel_invoice(invoice_id, cancel_data.reason)
        if not cancelled_invoice:
            raise HTTPException(status_code=404, detail=f"Invoice not found: {invoice_id}")
        return cancelled_invoice
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/{invoice_id}/pdf",
    summary="Generate invoice PDF",
    description="""
    Generate and download a PDF version of the invoice.

    **Parameters:**
    - `invoice_id`: UUID of the invoice to generate PDF for

    **Returns:**
    - PDF file as binary response with appropriate headers

    **Errors:**
    - 404: Invoice with the specified ID does not exist
    - 500: PDF generation failed

    **Use cases:**
    - Invoice printing and archiving
    - Email attachments
    - Customer delivery
    """
)
async def generate_pdf(invoice_id: str):
    """Generate PDF for an invoice"""
    try:
        pdf_content = generate_invoice_pdf(invoice_id)
        if not pdf_content:
            raise HTTPException(status_code=404, detail=f"Invoice not found: {invoice_id}")

        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=invoice-{invoice_id}.pdf"
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

# Note: No delete endpoint - invoices should be cancelled using the cancel endpoint instead

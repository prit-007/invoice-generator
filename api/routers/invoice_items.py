from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import logging
from services.invoice_item_service import (
    get_invoice_items_by_invoice_id,
    get_invoice_item_by_id,
    create_invoice_item,
    update_invoice_item
)
from models.invoice_item_models import InvoiceItemCreateRequest, InvoiceItemUpdateRequest, InvoiceItemResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/invoice-items",
    tags=["Invoice Items"],
    responses={
        404: {"description": "Invoice item not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

@router.get(
    "/invoice/{invoice_id}", 
    response_model=List[InvoiceItemResponse],
    summary="Get all items for an invoice",
    description="""
    Retrieve all line items associated with a specific invoice.
    
    This endpoint returns all line items with complete information including:
    - Item details (product, quantity, price)
    - Calculated totals (amount, tax, discounts)
    - Product information (embedded)
    
    **Parameters:**
    - `invoice_id`: UUID of the invoice to retrieve items for
    
    **Returns:**
    - List of invoice item objects with complete information
    - Empty list if invoice has no items
    
    **Errors:**
    - 404: Invoice with the specified ID does not exist
    - 422: Invalid UUID format
    
    **Use cases:**
    - Invoice detail display
    - Order fulfillment
    - Financial calculations and reporting
    """
)
async def get_items_by_invoice(invoice_id: str):
    """Get all items for a specific invoice"""
    try:
        logger.info(f"Fetching items for invoice: {invoice_id}")
        items = get_invoice_items_by_invoice_id(invoice_id)
        logger.info(f"Found {len(items)} items for invoice {invoice_id}")
        return items
    except ValueError as e:
        logger.error(f"Validation error for invoice {invoice_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching items for invoice {invoice_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch invoice items: {str(e)}")

@router.get(
    "/{item_id}", 
    response_model=InvoiceItemResponse,
    summary="Get invoice item by ID",
    description="""
    Retrieve a specific invoice line item by its unique ID.
    
    **Parameters:**
    - `item_id`: UUID of the invoice item to retrieve
    
    **Returns:**
    - Complete invoice item object including:
      - Item details (product, quantity, unit price)
      - Calculated values (amount, discount, tax)
      - Product information (embedded)
      - Invoice reference and metadata
    
    **Errors:**
    - 404: Invoice item with the specified ID does not exist
    - 422: Invalid UUID format
    
    **Use cases:**
    - Item detail display
    - Audit and verification
    - Order fulfillment tracking
    """
)
async def get_invoice_item(item_id: str):
    """Get a specific invoice item by ID"""
    try:
        logger.info(f"Fetching invoice item: {item_id}")
        item = get_invoice_item_by_id(item_id)
        if not item:
            logger.warning(f"Invoice item not found: {item_id}")
            raise HTTPException(status_code=404, detail=f"Invoice item not found: {item_id}")
        return item
    except ValueError as e:
        logger.error(f"Validation error for item {item_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching invoice item {item_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch invoice item: {str(e)}")

@router.post(
    "/", 
    response_model=InvoiceItemResponse,
    status_code=201,
    summary="Create a new invoice item",
    description="""
    Add a new line item to an existing invoice.
    
    This endpoint allows adding individual line items to an invoice.
    Note: For most cases, it is recommended to use the invoice update endpoint
    to manage multiple line items in a single request.
    
    **Required fields:**
    - `invoice_id`: UUID of the invoice to add the item to
    - `product_id`: UUID of the product for this line item
    - `quantity`: Quantity of the product (> 0)
    - `unit_price`: Price per unit (defaults to current product price if not provided)
    
    **Optional fields:**
    - `description`: Custom description (defaults to product name)
    - `discount_amount`: Item-level discount amount
    - `tax_rate`: Item-level tax rate (defaults to product's tax rate)
    
    **Returns:**
    - Created invoice item object with assigned ID
    - Updated invoice totals
    
    **Business Rules:**
    - Invoice must exist and be in draft status
    - Product must exist and be active
    - Quantity must be positive
    - Invoice totals are automatically recalculated
    - Stock levels are checked but not automatically updated
    
    **Note:** Adding items to finalized invoices may be restricted based on system settings
    """
)
async def create_new_invoice_item(item_data: InvoiceItemCreateRequest):
    """Create a new invoice item"""
    try:
        logger.info(f"Creating new invoice item for invoice: {item_data.invoice_id}")
        item = create_invoice_item(item_data)
        logger.info(f"Created invoice item: {item.id}")
        return item
    except ValueError as e:
        logger.error(f"Validation error creating invoice item: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating invoice item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create invoice item: {str(e)}")

@router.put(
    "/{item_id}", 
    response_model=InvoiceItemResponse,
    summary="Update an existing invoice item",
    description="""
    Update an existing invoice line item's information.
    
    This endpoint allows modifying individual line items within an invoice.
    Note: For most cases, it is recommended to use the invoice update endpoint
    to manage multiple line items in a single request.
    
    **Parameters:**
    - `item_id`: UUID of the invoice item to update
    
    **Request body:**
    - All fields are optional for updates
    - Only provided fields will be updated
    - Totals are automatically recalculated
    
    **Returns:**
    - Updated invoice item object with new information
    - Updated invoice totals
    
    **Errors:**
    - 404: Invoice item with the specified ID does not exist
    - 422: Invalid data format or validation errors
    
    **Business Rules:**
    - Invoice must not be in a finalized state
    - Quantity must be positive if provided
    - Invoice and item totals are automatically recalculated
    - Product information is refreshed if product_id is changed
    
    **Note:** Updating items in finalized invoices may be restricted based on system settings
    """
)
async def update_existing_invoice_item(item_id: str, item_data: InvoiceItemUpdateRequest):
    """Update an existing invoice item"""
    try:
        logger.info(f"Updating invoice item: {item_id}")
        updated_item = update_invoice_item(item_id, item_data)
        if not updated_item:
            logger.warning(f"Invoice item not found for update: {item_id}")
            raise HTTPException(status_code=404, detail=f"Invoice item not found: {item_id}")
        logger.info(f"Updated invoice item: {item_id}")
        return updated_item
    except ValueError as e:
        logger.error(f"Validation error updating item {item_id}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating invoice item {item_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update invoice item: {str(e)}")

# Note: No delete route - invoice items are managed through invoice lifecycle
# Use the invoice update endpoint to modify items in an invoice

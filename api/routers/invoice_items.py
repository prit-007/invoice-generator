from fastapi import APIRouter, HTTPException
from typing import List
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
    tags=["Invoice Items"]
)

@router.get("/invoice/{invoice_id}", response_model=List[InvoiceItemResponse])
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

@router.get("/{item_id}", response_model=InvoiceItemResponse)
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

@router.post("/", response_model=InvoiceItemResponse)
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

@router.put("/{item_id}", response_model=InvoiceItemResponse)
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

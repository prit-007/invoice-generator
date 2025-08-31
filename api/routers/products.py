from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from services.product_service import (
    get_all_products,
    search_products,
    get_all_products_including_inactive,
    get_product_by_id,
    create_product,
    update_product,
    delete_product
)
from models.product_models import ProductCreateRequest, ProductUpdateRequest, ProductResponse

router = APIRouter(
    prefix="/products",
    tags=["Products"],
    responses={
        404: {"description": "Product not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

@router.get(
    "/",
    response_model=List[ProductResponse],
    summary="Get all active products",
    description="""
    Retrieve a list of all active products in the inventory.

    This endpoint returns only products with `is_active = true`.
    Use `/products/all` to include inactive products.

    Optionally filter using `?search=` to match on name, description, or category.

    **Returns:**
    - List of product objects
    - Empty list if no active products exist
    """
)
async def get_products(search: Optional[str] = Query(default=None, description="Search by name/description/category")):
    """Get all active products or search by term"""
    try:
        if search:
            return search_products(search)
        return get_all_products()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/all",
    response_model=List[ProductResponse],
    summary="Get all products (including inactive)",
    description="""
    Retrieve a list of all products in the system, including inactive ones.

    This endpoint returns products regardless of their `is_active` status.
    Useful for administrative purposes and historical data analysis.

    **Returns:**
    - List of all product objects with complete information
    - Empty list if no products exist
    """
)
async def get_all_products_endpoint():
    """Get all products including inactive ones"""
    try:
        return get_all_products_including_inactive()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get product by ID",
    description="""
    Retrieve a specific product by its unique ID.

    **Parameters:**
    - `product_id`: UUID of the product to retrieve

    **Returns:**
    - Product object with complete information including:
      - Basic details (name, description)
      - Pricing information (price, tax_rate)
      - Metadata (timestamps, active status)

    **Errors:**
    - 404: Product with the specified ID does not exist
    - 422: Invalid UUID format
    """
)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    try:
        product = get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product not found: {product_id}")
        return product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/",
    response_model=ProductResponse,
    status_code=201,
    summary="Create a new product",
    description="""
    Create a new product in the inventory system.

    **Required fields:**
    - `name`: Product name (string)
    - `price`: Selling price (decimal, > 0)

    **Optional fields:**
    - `description`: Product description
    - `category`: Product category
    - `tax_rate`: Tax rate percentage (default: 0)
    - `unit`: Unit of measurement (default: 'NOS')
    - `is_taxable`: Whether product is taxable (default: true)

    **Returns:**
    - Created product object with assigned ID and timestamps
    """
)
async def create_new_product(product_data: ProductCreateRequest):
    """Create a new product"""
    try:
        return create_product(product_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update an existing product",
    description="""
    Update an existing product's information.

    **Parameters:**
    - `product_id`: UUID of the product to update

    **Request body:**
    - All fields are optional for updates
    - Only provided fields will be updated

    **Returns:**
    - Updated product object with new information

    **Errors:**
    - 404: Product with the specified ID does not exist
    - 422: Invalid data format or validation errors
    """
)
async def update_existing_product(product_id: str, product_data: ProductUpdateRequest):
    """Update an existing product"""
    try:
        updated_product = update_product(product_id, product_data)
        if not updated_product:
            raise HTTPException(status_code=404, detail=f"Product not found: {product_id}")
        return updated_product
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete(
    "/{product_id}",
    summary="Deactivate a product",
    description="""
    Soft delete a product by setting its status to inactive.

    This operation does not permanently delete the product record,
    but sets `is_active = false`. The product data is preserved
    for historical purposes, reporting, and existing invoice references.

    **Parameters:**
    - `product_id`: UUID of the product to deactivate

    **Returns:**
    - Success message confirming deactivation

    **Errors:**
    - 404: Product with the specified ID does not exist

    **Important Notes:**
    - Deactivated products will not appear in active product listings
    - Existing invoices referencing this product remain unaffected
    - Product can be reactivated by updating is_active to true
    - Use this instead of hard deletion to maintain data integrity
    """
)
async def delete_existing_product(product_id: str):
    """Soft delete a product (sets is_active to false)"""
    try:
        success = delete_product(product_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Product not found: {product_id}")
        return {"message": "Product deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

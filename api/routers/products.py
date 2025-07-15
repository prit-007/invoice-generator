from fastapi import APIRouter, HTTPException
from typing import List
from services.product_service import (
    get_all_products,
    get_all_products_including_inactive,
    get_product_by_id,
    create_product,
    update_product,
    delete_product
)
from models.product_models import ProductCreateRequest, ProductUpdateRequest, ProductResponse

router = APIRouter(
    prefix="/products",
    tags=["Products"]
)

@router.get("/", response_model=List[ProductResponse])
async def get_products():
    """Get all active products"""
    try:
        return get_all_products()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all", response_model=List[ProductResponse])
async def get_all_products_endpoint():
    """Get all products including inactive ones"""
    try:
        return get_all_products_including_inactive()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get a specific product by ID"""
    try:
        product = get_product_by_id(product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        return product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ProductResponse)
async def create_new_product(product_data: ProductCreateRequest):
    """Create a new product"""
    try:
        return create_product(product_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{product_id}", response_model=ProductResponse)
async def update_existing_product(product_id: str, product_data: ProductUpdateRequest):
    """Update an existing product"""
    try:
        updated_product = update_product(product_id, product_data)
        if not updated_product:
            raise HTTPException(status_code=404, detail="Product not found")
        return updated_product
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{product_id}")
async def delete_existing_product(product_id: str):
    """Soft delete a product (sets is_active to false)"""
    try:
        success = delete_product(product_id)
        if not success:
            raise HTTPException(status_code=404, detail="Product not found")
        return {"message": "Product deactivated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

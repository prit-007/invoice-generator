from fastapi import APIRouter, HTTPException
from typing import List
from services.customer_service import (
    get_all_customers,
    get_all_customers_including_inactive,
    get_customer_by_id,
    create_customer,
    update_customer,
    delete_customer
)
from models.customer_models import CustomerCreateRequest, CustomerUpdateRequest, CustomerResponse

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

@router.get("/", response_model=List[CustomerResponse])
async def get_customers():
    """Get all active customers"""
    try:
        return get_all_customers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all", response_model=List[CustomerResponse])
async def get_all_customers_endpoint():
    """Get all customers including inactive ones"""
    try:
        return get_all_customers_including_inactive()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(customer_id: str):
    """Get a specific customer by ID"""
    try:
        customer = get_customer_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return customer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=CustomerResponse)
async def create_new_customer(customer_data: CustomerCreateRequest):
    """Create a new customer"""
    try:
        return create_customer(customer_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_existing_customer(customer_id: str, customer_data: CustomerUpdateRequest):
    """Update an existing customer"""
    try:
        updated_customer = update_customer(customer_id, customer_data)
        if not updated_customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return updated_customer
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{customer_id}")
async def delete_existing_customer(customer_id: str):
    """Soft delete a customer (sets is_active to false)"""
    try:
        success = delete_customer(customer_id)
        if not success:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"message": "Customer deactivated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

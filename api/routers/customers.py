from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from services.customer_service import (
    get_all_customers,
    search_customers,
    get_all_customers_including_inactive,
    get_customer_by_id,
    create_customer,
    update_customer,
    delete_customer
)
from models.customer_models import CustomerCreateRequest, CustomerUpdateRequest, CustomerResponse

router = APIRouter(
    prefix="/customers",
    tags=["Customers"],
    responses={
        404: {"description": "Customer not found"},
        422: {"description": "Validation error"},
        500: {"description": "Internal server error"}
    }
)

@router.get(
    "/",
    response_model=List[CustomerResponse],
    summary="Get all active customers",
    description="""
    Retrieve a list of all active customers in the system.

    This endpoint returns only customers with `is_active = true`.
    Use `/customers/all` to include inactive customers.

    Optionally filter using `?search=` to match on name, email, phone, contact, or company type.

    **Returns:**
    - List of customer objects with complete information
    - Empty list if no active customers exist
    """
)
async def get_customers(search: Optional[str] = Query(default=None, description="Search by name/email/phone/contact/company")):
    """Get all active customers or search by term"""
    try:
        if search:
            return search_customers(search)
        return get_all_customers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/all",
    response_model=List[CustomerResponse],
    summary="Get all customers (including inactive)",
    description="""
    Retrieve a list of all customers in the system, including inactive ones.

    This endpoint returns customers regardless of their `is_active` status.

    **Returns:**
    - List of all customer objects with complete information
    - Empty list if no customers exist
    """
)
async def get_all_customers_endpoint():
    """Get all customers including inactive ones"""
    try:
        return get_all_customers_including_inactive()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Get customer by ID",
    description="""
    Retrieve a specific customer by their unique ID.

    **Parameters:**
    - `customer_id`: UUID of the customer to retrieve

    **Returns:**
    - Customer object with complete information

    **Errors:**
    - 404: Customer with the specified ID does not exist
    - 422: Invalid UUID format
    """
)
async def get_customer(customer_id: str):
    """Get a specific customer by ID"""
    try:
        customer = get_customer_by_id(customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail=f"Customer not found: {customer_id}")
        return customer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post(
    "/",
    response_model=CustomerResponse,
    status_code=201,
    summary="Create a new customer",
    description="""
    Create a new customer in the system.

    **Required fields:**
    - `name`: Customer name (string)
    - `billing_address`: Complete billing address object

    **Optional fields:**
    - `contact`: Contact person name
    - `email`: Email address (validated)
    - `phone`: Phone number
    - `shipping_address`: Shipping address (if different from billing)
    - `gst_no`: GST number
    - `place_of_supply`: Place of supply for GST
    - `payment_terms`: Payment terms in days (default: 15)
    - `credit_limit`: Credit limit amount
    - `company_type`: Type of company/business
    - `notes`: Additional notes

    **Returns:**
    - Created customer object with assigned ID and timestamps
    """
)
async def create_new_customer(customer_data: CustomerCreateRequest):
    """Create a new customer"""
    try:
        return create_customer(customer_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put(
    "/{customer_id}",
    response_model=CustomerResponse,
    summary="Update an existing customer",
    description="""
    Update an existing customer's information.

    **Parameters:**
    - `customer_id`: UUID of the customer to update

    **Request body:**
    - All fields are optional for updates
    - Only provided fields will be updated
    - Null values will clear the field

    **Returns:**
    - Updated customer object with new information

    **Errors:**
    - 404: Customer with the specified ID does not exist
    - 422: Invalid data format or validation errors
    """
)
async def update_existing_customer(customer_id: str, customer_data: CustomerUpdateRequest):
    """Update an existing customer"""
    try:
        updated_customer = update_customer(customer_id, customer_data)
        if not updated_customer:
            raise HTTPException(status_code=404, detail=f"Customer not found: {customer_id}")
        return updated_customer
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete(
    "/{customer_id}",
    summary="Deactivate a customer",
    description="""
    Soft delete a customer by setting their status to inactive.

    This operation does not permanently delete the customer record,
    but sets `is_active = false`. The customer data is preserved
    for historical purposes and reporting.

    **Parameters:**
    - `customer_id`: UUID of the customer to deactivate

    **Returns:**
    - Success message confirming deactivation

    **Errors:**
    - 404: Customer with the specified ID does not exist

    **Note:** To permanently delete customers, use the hard delete endpoint
    (if available) or contact system administrator.
    """
)
async def delete_existing_customer(customer_id: str):
    """Soft delete a customer (sets is_active to false)"""
    try:
        success = delete_customer(customer_id)
        if not success:
            raise HTTPException(status_code=404, detail=f"Customer not found: {customer_id}")
        return {"message": "Customer deactivated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

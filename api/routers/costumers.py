from fastapi import APIRouter

router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)

@router.get("/")
def get_customers():
    return [{"id": 1, "name": "Test Customer"}]
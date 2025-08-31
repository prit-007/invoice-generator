from fastapi import APIRouter, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from services.dashboard_service import get_dashboard_stats

router = APIRouter()

class DashboardStats(BaseModel):
    total_invoices: int
    pending_invoices: int
    paid_invoices: int
    overdue_invoices: int
    total_revenue: float
    pending_revenue: float
    total_customers: int
    active_customers: int
    total_products: int
    low_stock_products: int
    recent_invoices: list
    revenue_trend: list

@router.get(
    "/stats", 
    response_model=DashboardStats,
    summary="Get dashboard statistics",
    description="""
    Get comprehensive dashboard statistics including:
    - Invoice counts by status
    - Revenue totals and pending amounts
    - Customer and product counts
    - Recent invoices
    - Revenue trends
    
    **Returns:**
    - Complete dashboard statistics object
    
    **Use cases:**
    - Dashboard display
    - Business analytics
    - Quick overview of business metrics
    """
)
async def get_stats():
    """Get dashboard statistics"""
    try:
        stats = get_dashboard_stats()
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get dashboard stats: {str(e)}")

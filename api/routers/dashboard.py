from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from services.dashboard_service import get_dashboard_stats

router = APIRouter()

class InvoiceStatusBreakdown(BaseModel):
    count: int
    revenue: float

class RecentInvoice(BaseModel):
    id: str
    invoice_number: str
    customer_name: str
    total_amount: float
    status: str
    created_at: str

class RevenueTrend(BaseModel):
    month: str
    revenue: float

class DashboardStats(BaseModel):
    total_invoices: int
    total_customers: int
    total_products: int
    total_revenue: float
    paid_revenue: float
    pending_revenue: float
    overdue_revenue: float
    invoice_status_breakdown: Dict[str, InvoiceStatusBreakdown]
    recent_invoices: List[RecentInvoice]
    revenue_trend: List[RevenueTrend]

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

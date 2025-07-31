from db.database import db
from typing import Dict, Any, List
from datetime import datetime, timedelta

def get_dashboard_stats() -> Dict[str, Any]:
    """Get comprehensive dashboard statistics"""
    try:
        stats = {}
        
        # Invoice statistics
        invoice_stats = get_invoice_stats()
        stats.update(invoice_stats)
        
        # Customer statistics
        customer_stats = get_customer_stats()
        stats.update(customer_stats)
        
        # Product statistics
        product_stats = get_product_stats()
        stats.update(product_stats)
        
        # Recent invoices
        stats['recent_invoices'] = get_recent_invoices()
        
        # Revenue trend (last 6 months)
        stats['revenue_trend'] = get_revenue_trend()
        
        return stats
        
    except Exception as e:
        print(f"Error getting dashboard stats: {e}")
        return get_default_stats()

def get_invoice_stats() -> Dict[str, Any]:
    """Get invoice-related statistics"""
    try:
        # Total invoices
        total_query = "SELECT COUNT(*) as count FROM invoices"
        total_result = db.fetch_one(total_query)
        total_invoices = total_result['count'] if total_result else 0
        
        # Invoices by status
        status_query = """
            SELECT 
                status,
                COUNT(*) as count,
                COALESCE(SUM(total_amount), 0) as revenue
            FROM invoices 
            GROUP BY status
        """
        status_results = db.fetch_all(status_query)
        
        # Initialize counters
        pending_invoices = 0
        paid_invoices = 0
        overdue_invoices = 0
        total_revenue = 0
        pending_revenue = 0
        
        # Process status results
        for row in status_results:
            status = row['status']
            count = row['count']
            revenue = float(row['revenue']) if row['revenue'] else 0
            
            if status in ['draft', 'sent']:
                pending_invoices += count
                pending_revenue += revenue
            elif status == 'paid':
                paid_invoices += count
                total_revenue += revenue
            elif status == 'overdue':
                overdue_invoices += count
                pending_revenue += revenue
            elif status == 'partially_paid':
                pending_invoices += count
                # For partially paid, add paid amount to total revenue and remaining to pending
                paid_amount = float(row.get('amount_paid', 0)) if row.get('amount_paid') else 0
                total_revenue += paid_amount
                pending_revenue += (revenue - paid_amount)
        
        # Get total revenue from all paid invoices
        revenue_query = """
            SELECT 
                COALESCE(SUM(total_amount), 0) as total_revenue,
                COALESCE(SUM(amount_paid), 0) as paid_revenue,
                COALESCE(SUM(balance_due), 0) as pending_revenue
            FROM invoices 
            WHERE status != 'cancelled'
        """
        revenue_result = db.fetch_one(revenue_query)
        
        if revenue_result:
            total_revenue = float(revenue_result['paid_revenue']) if revenue_result['paid_revenue'] else 0
            pending_revenue = float(revenue_result['pending_revenue']) if revenue_result['pending_revenue'] else 0
        
        return {
            'total_invoices': total_invoices,
            'pending_invoices': pending_invoices,
            'paid_invoices': paid_invoices,
            'overdue_invoices': overdue_invoices,
            'total_revenue': total_revenue,
            'pending_revenue': pending_revenue
        }
        
    except Exception as e:
        print(f"Error getting invoice stats: {e}")
        return {
            'total_invoices': 0,
            'pending_invoices': 0,
            'paid_invoices': 0,
            'overdue_invoices': 0,
            'total_revenue': 0.0,
            'pending_revenue': 0.0
        }

def get_customer_stats() -> Dict[str, Any]:
    """Get customer-related statistics"""
    try:
        # Total customers
        total_query = "SELECT COUNT(*) as count FROM customers"
        total_result = db.fetch_one(total_query)
        total_customers = total_result['count'] if total_result else 0
        
        # Active customers (customers with invoices in last 6 months)
        active_query = """
            SELECT COUNT(DISTINCT customer_id) as count 
            FROM invoices 
            WHERE date >= %s
        """
        six_months_ago = datetime.now() - timedelta(days=180)
        active_result = db.fetch_one(active_query, (six_months_ago.date(),))
        active_customers = active_result['count'] if active_result else 0
        
        return {
            'total_customers': total_customers,
            'active_customers': active_customers
        }
        
    except Exception as e:
        print(f"Error getting customer stats: {e}")
        return {
            'total_customers': 0,
            'active_customers': 0
        }

def get_product_stats() -> Dict[str, Any]:
    """Get product-related statistics"""
    try:
        # Total products
        total_query = "SELECT COUNT(*) as count FROM products"
        total_result = db.fetch_one(total_query)
        total_products = total_result['count'] if total_result else 0
        
        # Low stock products (assuming min_stock_level field exists)
        low_stock_query = """
            SELECT COUNT(*) as count 
            FROM products 
            WHERE stock_quantity <= min_stock_level 
            AND min_stock_level > 0
        """
        try:
            low_stock_result = db.fetch_one(low_stock_query)
            low_stock_products = low_stock_result['count'] if low_stock_result else 0
        except:
            # If min_stock_level column doesn't exist, default to 0
            low_stock_products = 0
        
        return {
            'total_products': total_products,
            'low_stock_products': low_stock_products
        }
        
    except Exception as e:
        print(f"Error getting product stats: {e}")
        return {
            'total_products': 0,
            'low_stock_products': 0
        }

def get_recent_invoices() -> List[Dict[str, Any]]:
    """Get recent invoices for dashboard"""
    try:
        query = """
            SELECT 
                i.id,
                i.invoice_number,
                i.date,
                i.total_amount,
                i.status,
                c.name as customer_name
            FROM invoices i
            LEFT JOIN customers c ON i.customer_id = c.id
            ORDER BY i.date DESC, i.created_at DESC
            LIMIT 5
        """
        results = db.fetch_all(query)
        
        recent_invoices = []
        for row in results:
            recent_invoices.append({
                'id': str(row['id']),
                'invoice_number': row['invoice_number'],
                'date': row['date'].isoformat() if row['date'] else None,
                'total_amount': float(row['total_amount']) if row['total_amount'] else 0,
                'status': row['status'],
                'customer_name': row['customer_name']
            })
        
        return recent_invoices
        
    except Exception as e:
        print(f"Error getting recent invoices: {e}")
        return []

def get_revenue_trend() -> List[Dict[str, Any]]:
    """Get revenue trend for last 6 months"""
    try:
        query = """
            SELECT 
                DATE_FORMAT(date, '%Y-%m') as month,
                SUM(amount_paid) as revenue
            FROM invoices 
            WHERE date >= %s
            AND status != 'cancelled'
            GROUP BY DATE_FORMAT(date, '%Y-%m')
            ORDER BY month
        """
        six_months_ago = datetime.now() - timedelta(days=180)
        results = db.fetch_all(query, (six_months_ago.date(),))
        
        trend = []
        for row in results:
            trend.append({
                'month': row['month'],
                'revenue': float(row['revenue']) if row['revenue'] else 0
            })
        
        return trend
        
    except Exception as e:
        print(f"Error getting revenue trend: {e}")
        return []

def get_default_stats() -> Dict[str, Any]:
    """Return default stats when database queries fail"""
    return {
        'total_invoices': 0,
        'pending_invoices': 0,
        'paid_invoices': 0,
        'overdue_invoices': 0,
        'total_revenue': 0.0,
        'pending_revenue': 0.0,
        'total_customers': 0,
        'active_customers': 0,
        'total_products': 0,
        'low_stock_products': 0,
        'recent_invoices': [],
        'revenue_trend': []
    }

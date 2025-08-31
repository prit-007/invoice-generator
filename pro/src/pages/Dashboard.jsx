import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Alert from '../components/ui/Alert';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, change, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animatedValue, setAnimatedValue] = useState(0);

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
    indigo: 'from-indigo-500 to-indigo-600'
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      // Animate the number
      const numericValue = parseInt(value.replace(/[^0-9]/g, ''));
      if (!isNaN(numericValue)) {
        let current = 0;
        const increment = numericValue / 30;
        const counter = setInterval(() => {
          current += increment;
          if (current >= numericValue) {
            setAnimatedValue(numericValue);
            clearInterval(counter);
          } else {
            setAnimatedValue(Math.floor(current));
          }
        }, 50);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={`
      bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200/50 p-6
      hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group
      ${isVisible ? 'animate-scale-in' : 'opacity-0'}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {typeof animatedValue === 'number' && animatedValue > 0
              ? value.replace(/[0-9]/g, '').includes('₹')
                ? `₹${animatedValue.toLocaleString()}`
                : animatedValue.toLocaleString()
              : value
            }
          </p>
          {change && (
            <div className="flex items-center mt-3">
              <span className={`
                text-sm font-medium flex items-center
                ${change.type === 'increase' ? 'text-green-600' : 'text-red-600'}
              `}>
                <svg className={`w-4 h-4 mr-1 ${change.type === 'increase' ? 'rotate-0' : 'rotate-180'}`}
                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
                {change.value}
              </span>
              <span className="text-xs text-gray-500 ml-2">from last month</span>
            </div>
          )}
        </div>
        <div className={`
          p-4 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg
          group-hover:scale-110 transition-transform duration-300 animate-float
        `}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useLanguage();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard stats
  const loadDashboardStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:1969/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to load dashboard stats');
      }
      const stats = await response.json();
      setDashboardStats(stats);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message);
      // Set default stats on error
      setDashboardStats({
        total_invoices: 0,
        pending_invoices: 0,
        paid_invoices: 0,
        overdue_invoices: 0,
        total_revenue: 0,
        pending_revenue: 0,
        total_customers: 0,
        active_customers: 0,
        total_products: 0,
        low_stock_products: 0,
        recent_invoices: [],
        revenue_trend: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const stats = dashboardStats ? [
    {
      title: t('dashboard.totalProducts'),
      value: dashboardStats.total_products.toString(),
      icon: '📦',
      color: 'blue',
      change: { type: 'neutral', value: '' }
    },
    {
      title: t('dashboard.totalCustomers'),
      value: dashboardStats.total_customers.toString(),
      icon: '👥',
      color: 'green',
      change: { type: 'neutral', value: `${dashboardStats.active_customers} active` }
    },
    {
      title: t('dashboard.totalInvoices'),
      value: dashboardStats.total_invoices.toString(),
      icon: '📄',
      color: 'yellow',
      change: { type: 'neutral', value: `${dashboardStats.pending_invoices} pending` }
    },
    {
      title: t('dashboard.totalRevenue'),
      value: formatCurrency(dashboardStats.total_revenue),
      icon: '💳',
      color: 'purple',
      change: { type: 'neutral', value: `${formatCurrency(dashboardStats.pending_revenue)} pending` }
    }
  ] : [];

  const quickActions = [
    {
      title: 'Create Invoice',
      description: 'Generate a new invoice for your customers',
      icon: '📄',
      color: 'from-blue-500 to-blue-600',
      href: '/invoices/add'
    },
    {
      title: 'Add Customer',
      description: 'Register a new customer to your database',
      icon: '👤',
      color: 'from-green-500 to-green-600',
      href: '/customers/add'
    },
    {
      title: 'Add Product',
      description: 'Add new products to your inventory',
      icon: '📦',
      color: 'from-purple-500 to-purple-600',
      href: '/products/add'
    },
    {
      title: 'Record Payment',
      description: 'Record a payment from your customers',
      icon: '💳',
      color: 'from-orange-500 to-orange-600',
      href: '/payments/add'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert type="error" className="mb-6">
          Failed to load dashboard data: {error}
        </Alert>
        <Button onClick={loadDashboardStats}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white relative overflow-hidden animate-slide-down">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-3">{t('dashboard.welcome')}</h1>
              <p className="text-blue-100 text-lg mb-4">
                Manage your business efficiently with our comprehensive invoice management system.
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  📅 {currentTime.toLocaleDateString()}
                </span>
                <span className="bg-white/20 px-3 py-1 rounded-full">
                  🕒 {currentTime.toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="text-6xl opacity-20 animate-float">
              📊
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} delay={index * 100} />
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <Card.Header>
            <Card.Title className="flex items-center">
              <span className="mr-2">⚡</span>
              {t('quickActions')}
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.href}
                  className={`
                    group relative overflow-hidden rounded-xl p-4 text-white
                    bg-gradient-to-r ${action.color} hover:shadow-lg
                    transition-all duration-300 hover:-translate-y-1 hover:scale-105
                  `}
                >
                  <div className="relative z-10">
                    <div className="text-2xl mb-2">{action.icon}</div>
                    <h4 className="font-semibold text-sm mb-1">{action.title}</h4>
                    <p className="text-xs opacity-90">{action.description}</p>
                  </div>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ))}
            </div>
          </Card.Content>
        </Card>

        {/* Recent Activity */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Card.Header>
            <div className="flex items-center justify-between">
              <Card.Title className="flex items-center">
                <span className="mr-2">📈</span>
                {t('recentActivity')}
              </Card.Title>
              <Button variant="ghost" size="sm">
                {t('viewAll')}
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4 custom-scrollbar max-h-64 overflow-y-auto">
              {[
                { type: 'invoice', title: 'Invoice #INV-001 created', time: '2 hours ago', amount: '₹5,000', icon: '📄', color: 'blue' },
                { type: 'payment', title: 'Payment received from John Doe', time: '4 hours ago', amount: '₹3,500', icon: '💰', color: 'green' },
                { type: 'customer', title: 'New customer registered', time: '6 hours ago', amount: '', icon: '👤', color: 'purple' },
                { type: 'product', title: 'Product "Widget A" updated', time: '1 day ago', amount: '', icon: '📦', color: 'orange' },
                { type: 'invoice', title: 'Invoice #INV-002 sent', time: '2 days ago', amount: '₹7,200', icon: '📧', color: 'indigo' }
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group hover:scale-105"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${activity.color === 'blue' ? 'bg-blue-100 text-blue-600' : ''}
                    ${activity.color === 'green' ? 'bg-green-100 text-green-600' : ''}
                    ${activity.color === 'purple' ? 'bg-purple-100 text-purple-600' : ''}
                    ${activity.color === 'orange' ? 'bg-orange-100 text-orange-600' : ''}
                    ${activity.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' : ''}
                    group-hover:scale-110 transition-transform duration-200
                  `}>
                    <span className="text-lg">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 group-hover:text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {activity.amount && (
                    <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                      {activity.amount}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <Card.Header>
            <Card.Title className="flex items-center">
              <span className="mr-2">📊</span>
              Sales Overview
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-2 animate-bounce">📈</div>
                <p className="text-gray-600 font-medium">Interactive Chart</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-slide-up" style={{ animationDelay: '0.8s' }}>
          <Card.Header>
            <Card.Title className="flex items-center">
              <span className="mr-2">💹</span>
              Revenue Trends
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-pulse"></div>
              <div className="relative z-10 text-center">
                <div className="text-4xl mb-2 animate-bounce" style={{ animationDelay: '0.5s' }}>💰</div>
                <p className="text-gray-600 font-medium">Revenue Analytics</p>
                <p className="text-sm text-gray-500">Coming Soon</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

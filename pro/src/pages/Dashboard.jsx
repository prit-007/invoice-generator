import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";
import { DashboardSkeleton } from "../components/ui/Skeleton";
import { Link } from "react-router-dom";
import { dashboardApi } from "../services/api";

// Lightweight inline chart (no external deps) - Memoized for performance
const MiniLineChart = React.memo(({
	data = [],
	width = 600,
	height = 200,
	stroke = "#0ea5e9", // primary-500
	fill = "rgba(14, 165, 233, 0.08)", // primary-500 with opacity
	padding = 24,
}) => {
	if (!data || data.length === 0) {
		return (
			<div className="h-48 flex items-center justify-center text-neutral-400 bg-gradient-to-r from-neutral-50 to-white rounded-lg border border-neutral-200">
				<div className="text-center">
					<svg className="w-12 h-12 mx-auto mb-2 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
					<p>No data available</p>
				</div>
			</div>
		);
	}
	const xs = data.map((d) => (typeof d === "number" ? d : d.value ?? 0));
	const max = Math.max(...xs);
	const min = Math.min(...xs);
	const range = max - min || 1;
	const innerW = width - padding * 2;
	const innerH = height - padding * 2;
	const points = xs.map((v, i) => {
		const x = padding + (i / (xs.length - 1 || 1)) * innerW;
		const y = padding + innerH - ((v - min) / range) * innerH;
		return [x, y];
	});
	const path = points
		.map(([x, y], i) => (i === 0 ? `M ${x},${y}` : `L ${x},${y}`))
		.join(" ");
	const area = `${path} L ${padding + innerW},${
		padding + innerH
	} L ${padding},${padding + innerH} Z`;
	const gridY = 4;
	const gridLines = Array.from(
		{ length: gridY + 1 },
		(_, i) => padding + (i * innerH) / gridY
	);
	return (
		<div className="bg-white rounded-lg border border-neutral-200 shadow-soft p-2">
			<svg
				width="100%"
				height={height}
				viewBox={`0 0 ${width} ${height}`}
				role="img"
				aria-label="Revenue trend chart"
				className="overflow-visible"
			>
				<g stroke="#f3f4f6" strokeWidth="0.5">
					{gridLines.map((y, i) => (
						<line
							key={i}
							x1={padding}
							x2={padding + innerW}
							y1={y}
							y2={y}
							opacity={i === 0 || i === gridLines.length - 1 ? 0.8 : 0.4}
						/>
					))}
				</g>
				<path d={area} fill={fill} />
				<path
					d={path}
					fill="none"
					stroke={stroke}
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				{points.map(([x, y], i) => (
					<circle 
						key={i} 
						cx={x} 
						cy={y} 
						r="3" 
						fill="white" 
						stroke={stroke}
						strokeWidth="2"
						className="drop-shadow-sm"
					/>
				))}
			</svg>
		</div>
	);
});
const StatCard = React.memo(({ title, value, icon, color, change, delay = 0 }) => {
	const [isVisible, setIsVisible] = useState(false);
	const [animatedValue, setAnimatedValue] = useState(0);

	const colorClasses = {
		blue: "from-primary-500 to-primary-600",
		green: "from-secondary-500 to-secondary-600", 
		yellow: "from-warning-500 to-warning-600",
		red: "from-danger-500 to-danger-600",
		purple: "from-purple-500 to-purple-600",
		indigo: "from-indigo-500 to-indigo-600",
		emerald: "from-emerald-500 to-emerald-600",
		cyan: "from-cyan-500 to-cyan-600",
	};

	useEffect(() => {
		const timer = setTimeout(() => {
			setIsVisible(true);
			// Animate the number
			const numericValue = parseInt(value.replace(/[^0-9]/g, ""));
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
		<div
			className={`
      bg-white/95 backdrop-blur-sm rounded-xl shadow-soft border border-neutral-200/60 p-6
      hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-300 group
      hover:border-primary-200/80
      ${isVisible ? "animate-scale-in" : "opacity-0"}
    `}
			title={title}
			aria-label={title}
		>
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<p className="text-sm font-medium text-neutral-600 group-hover:text-neutral-700 transition-colors">
						{title}
					</p>
					<p className="text-3xl font-bold text-neutral-900 mt-2">
						{typeof animatedValue === "number" && animatedValue > 0
							? value.replace(/[0-9]/g, "").includes("₹")
								? `₹${animatedValue.toLocaleString()}`
								: animatedValue.toLocaleString()
							: value}
					</p>
					{change && (
						<div className="flex items-center mt-3">
							<span
								className={`
                text-sm font-medium flex items-center
                ${
									change.type === "increase" ? "text-success-600" : 
									change.type === "decrease" ? "text-danger-600" : "text-neutral-500"
								}
              `}
							>
								{change.type === "increase" && (
									<svg
										className="w-4 h-4 mr-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 17l9.2-9.2M17 17V7H7"
										/>
									</svg>
								)}
								{change.type === "decrease" && (
									<svg
										className="w-4 h-4 mr-1 rotate-180"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M7 17l9.2-9.2M17 17V7H7"
										/>
									</svg>
								)}
								{change.value}
							</span>
							<span className="text-xs text-neutral-500 ml-2">
								{change.description || "from last month"}
							</span>
						</div>
					)}
				</div>
				<div
					className={`
          p-4 rounded-xl bg-gradient-to-r ${colorClasses[color]} text-white shadow-lg
          group-hover:scale-110 transition-transform duration-300 animate-float
        `}
				>
					<span className="text-2xl">{icon}</span>
				</div>
			</div>
		</div>
	);
});

const Dashboard = () => {
	const { t } = useLanguage();
	const [currentTime, setCurrentTime] = useState(new Date());
	const [dashboardStats, setDashboardStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);

	// Memoized default stats
	const defaultStats = useMemo(() => ({
		total_invoices: 0,
		total_customers: 0,
		total_products: 0,
		total_revenue: 0,
		paid_revenue: 0,
		pending_revenue: 0,
		overdue_revenue: 0,
		invoice_status_breakdown: {
			paid: { count: 0, revenue: 0 },
			pending: { count: 0, revenue: 0 },
			overdue: { count: 0, revenue: 0 }
		},
		recent_invoices: [],
		revenue_trend: []
	}), []);

	// Optimized load function with retry logic
	const loadDashboardStats = useCallback(async (showLoading = true) => {
		if (showLoading) {
			setLoading(true);
		}
		setError(null);

		try {
			console.log('Loading dashboard stats...');
			const startTime = Date.now();
			
			// Use centralized API service which respects REACT_APP_API_URL
			const stats = await dashboardApi.getStats();
			
			const loadTime = Date.now() - startTime;
			console.log(`Dashboard stats loaded in ${loadTime}ms`);
			
			setDashboardStats(stats);
			setRetryCount(0); // Reset retry count on success
		} catch (err) {
			console.error("Error loading dashboard stats:", err);
			setError(err.message);
			setRetryCount(prev => prev + 1);
			
			// Set default stats on error
			setDashboardStats(defaultStats);
		} finally {
			setLoading(false);
		}
	}, [defaultStats]);

	// Auto-retry logic
	useEffect(() => {
		if (error && retryCount < 3) {
			const timeout = setTimeout(() => {
				console.log(`Retrying dashboard load (attempt ${retryCount + 1})`);
				loadDashboardStats(false);
			}, 2000 * retryCount); // Exponential backoff

			return () => clearTimeout(timeout);
		}
	}, [error, retryCount, loadDashboardStats]);

	useEffect(() => {
		loadDashboardStats();

		const timer = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const formatCurrency = (amount) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount || 0);
	};

	const getStatusBadgeClass = (status) => {
		switch ((status || "").toLowerCase()) {
			case "paid":
				return "bg-success-100 text-success-700 border border-success-200";
			case "pending":
			case "partial":
			case "partially_paid":
				return "bg-warning-100 text-warning-700 border border-warning-200";
			case "overdue":
				return "bg-danger-100 text-danger-700 border border-danger-200";
			case "cancelled":
				return "bg-neutral-100 text-neutral-500 border border-neutral-200";
			case "sent":
				return "bg-primary-100 text-primary-700 border border-primary-200";
			default:
				return "bg-neutral-100 text-neutral-600 border border-neutral-200";
		}
	};

	const stats = dashboardStats
		? [
				{
					title: t("dashboard.totalProducts"),
					value: dashboardStats.total_products.toString(),
					icon: "📦",
					color: "blue",
					change: dashboardStats.low_stock_products > 0 ? { 
						type: "neutral", 
						value: `${dashboardStats.low_stock_products} low stock`,
						description: "need attention"
					} : null,
				},
				{
					title: t("dashboard.totalCustomers"),
					value: dashboardStats.total_customers.toString(),
					icon: "👥",
					color: "emerald",
					change: {
						type: "neutral",
						value: `${dashboardStats.active_customers} active`,
						description: "customers"
					},
				},
				{
					title: t("dashboard.totalInvoices"),
					value: dashboardStats.total_invoices.toString(),
					icon: "📄",
					color: "cyan",
					change: dashboardStats.pending_invoices > 0 ? {
						type: "neutral",
						value: `${dashboardStats.pending_invoices} pending`,
						description: "awaiting payment"
					} : dashboardStats.overdue_invoices > 0 ? {
						type: "decrease",
						value: `${dashboardStats.overdue_invoices} overdue`,
						description: "need follow-up"
					} : null,
				},
				{
					title: t("dashboard.totalRevenue"),
					value: formatCurrency(dashboardStats.total_revenue),
					icon: "�",
					color: "purple",
					change: dashboardStats.pending_revenue > 0 ? {
						type: "neutral",
						value: `${formatCurrency(dashboardStats.pending_revenue)} pending`,
						description: "outstanding"
					} : null,
				},
		  ]
		: [];

	const quickActions = [
		{
			title: "Create Invoice",
			description: "Generate a new invoice for your customers",
			icon: "📄",
			color: "from-primary-500 to-primary-600",
			href: "/invoices/add",
		},
		{
			title: "Add Customer",
			description: "Register a new customer to your database",
			icon: "👤",
			color: "from-secondary-500 to-secondary-600",
			href: "/customers/add",
		},
		{
			title: "Add Product",
			description: "Add new products to your inventory",
			icon: "📦",
			color: "from-purple-500 to-purple-600",
			href: "/products/add",
		},
		{
			title: "Record Payment",
			description: "Record a payment from your customers",
			icon: "�",
			color: "from-warning-500 to-warning-600",
			href: "/payments/add",
		},
	];

	if (loading) {
		return (
			<div className="max-w-7xl mx-auto p-6">
				<DashboardSkeleton />
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6 max-w-2xl mx-auto mt-8">
				<Alert type="error" className="mb-6">
					<div className="flex items-center space-x-3">
						<svg className="w-5 h-5 text-danger-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<span>Failed to load dashboard data: {error}</span>
					</div>
				</Alert>
				<div className="text-center">
					<Button onClick={loadDashboardStats} variant="primary">
						<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						Retry Loading
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-fade-in">
			{/* Welcome Section */}
			<div className="bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-500 rounded-2xl p-8 text-white relative overflow-hidden animate-slide-up">
				<div className="absolute inset-0 bg-black/5"></div>
				<div className="relative z-10">
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-3xl font-bold mb-3">
								{t("dashboard.welcome")}
							</h1>
							<p className="text-primary-100 text-lg mb-4">
								Manage your business efficiently with our comprehensive invoice
								management system.
							</p>
							<div className="flex items-center space-x-4 text-sm">
								<span
									className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10"
									title={currentTime.toLocaleDateString()}
									aria-label={currentTime.toLocaleDateString()}
								>
									📅 {currentTime.toLocaleDateString()}
								</span>
								<span
									className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10"
									title={currentTime.toLocaleTimeString()}
									aria-label={currentTime.toLocaleTimeString()}
								>
									🕒 {currentTime.toLocaleTimeString()}
								</span>
							</div>
						</div>
						<div className="text-6xl opacity-20 animate-float">📊</div>
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
				<Card className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
					<Card.Header>
						<Card.Title className="flex items-center">
							<span className="mr-2">⚡</span>
							{t("quickActions")}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							{quickActions.map((action, index) => (
								<Link
									key={index}
									to={action.href}
									title={action.title}
									aria-label={action.title}
									className={`
                    group relative overflow-hidden rounded-xl p-4 text-white
                    bg-gradient-to-r ${action.color} hover:shadow-lg
                    transition-all duration-300 hover:-translate-y-1 hover:scale-105
                  `}
								>
									<div className="relative z-10">
										<div className="text-2xl mb-2">{action.icon}</div>
										<h4 className="font-semibold text-sm mb-1">
											{action.title}
										</h4>
										<p className="text-xs opacity-90">{action.description}</p>
									</div>
									<div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
								</Link>
							))}
						</div>
					</Card.Content>
				</Card>

				{/* Recent Activity */}
				<Card className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
					<Card.Header>
						<div className="flex items-center justify-between">
							<Card.Title className="flex items-center">
								<span className="mr-2">📈</span>
								{t("recentActivity")}
							</Card.Title>
							<Button
								variant="ghost"
								size="sm"
								title={t("viewAll")}
								aria-label={t("viewAll")}
							>
								{t("viewAll")}
							</Button>
						</div>
					</Card.Header>
					<Card.Content>
						<div className="space-y-4 custom-scrollbar max-h-64 overflow-y-auto">
							{dashboardStats?.recent_invoices && dashboardStats.recent_invoices.length > 0 ? 
								dashboardStats.recent_invoices.slice(0, 5).map((activity, index) => (
								<div
									key={activity.id || index}
									className="flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-50 transition-all duration-200 group hover:scale-105"
								>
									<div
										className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    bg-primary-100 text-primary-600
                    group-hover:scale-110 transition-transform duration-200
                  `}
									>
										<span className="text-lg">📄</span>
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">
											Invoice {activity.invoice_number} created
										</p>
										<p className="text-xs text-neutral-500">
											{activity.date ? new Date(activity.date).toLocaleString() : 'Recent'}
										</p>
									</div>
									<span className="text-sm font-semibold text-success-600 bg-success-50 px-2 py-1 rounded-lg">
										{formatCurrency(activity.total_amount || 0)}
									</span>
								</div>
							)) : [
								{
									type: "invoice",
									title: "Invoice #INV-001 created",
									time: "2 hours ago",
									amount: "₹5,000",
									icon: "📄",
									color: "primary",
								},
								{
									type: "payment",
									title: "Payment received from John Doe",
									time: "4 hours ago",
									amount: "₹3,500",
									icon: "💰",
									color: "success",
								},
								{
									type: "customer",
									title: "New customer registered",
									time: "6 hours ago",
									amount: "",
									icon: "👤",
									color: "secondary",
								},
								{
									type: "product",
									title: 'Product "Widget A" updated',
									time: "1 day ago",
									amount: "",
									icon: "📦",
									color: "warning",
								},
								{
									type: "invoice",
									title: "Invoice #INV-002 sent",
									time: "2 days ago",
									amount: "₹7,200",
									icon: "📧",
									color: "purple",
								},
							].map((activity, index) => (
								<div
									key={index}
									className="flex items-center space-x-4 p-3 rounded-xl hover:bg-neutral-50 transition-all duration-200 group hover:scale-105"
								>
									<div
										className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${
											activity.color === "primary"
												? "bg-primary-100 text-primary-600"
												: ""
										}
                    ${
											activity.color === "success"
												? "bg-success-100 text-success-600"
												: ""
										}
                    ${
											activity.color === "secondary"
												? "bg-secondary-100 text-secondary-600"
												: ""
										}
                    ${
											activity.color === "warning"
												? "bg-warning-100 text-warning-600"
												: ""
										}
                    ${
											activity.color === "purple"
												? "bg-purple-100 text-purple-600"
												: ""
										}
                    group-hover:scale-110 transition-transform duration-200
                  `}
									>
										<span className="text-lg">{activity.icon}</span>
									</div>
									<div className="flex-1">
										<p className="text-sm font-medium text-neutral-800 group-hover:text-neutral-900">
											{activity.title}
										</p>
										<p className="text-xs text-neutral-500">{activity.time}</p>
									</div>
									{activity.amount && (
										<span className="text-sm font-semibold text-success-600 bg-success-50 px-2 py-1 rounded-lg">
											{activity.amount}
										</span>
									)}
								</div>
							))}
						</div>
					</Card.Content>
				</Card>
			</div>

			{/* Recent Invoices (Real Data) */}
			<Card className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
				<Card.Header>
					<div className="flex items-center justify-between">
						<Card.Title className="flex items-center">
							<span className="mr-2">🧾</span>
							{t("dashboard.recentInvoices")}
						</Card.Title>
						<Link
							to="/invoices"
							className="text-sm text-blue-600 hover:underline"
						>
							{t("viewAll")}
						</Link>
					</div>
				</Card.Header>
				<Card.Content>
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-neutral-200">
							<thead className="bg-white sticky top-0 z-10 shadow-soft">
								<tr>
									<th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
										{t("invoices.number")}
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
										{t("invoices.customer")}
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
										{t("invoices.date")}
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
										{t("invoices.amount")}
									</th>
									<th className="px-4 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
										{t("invoices.status")}
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-neutral-200">
								{(dashboardStats?.recent_invoices || [])
									.slice(0, 6)
									.map((inv, i) => (
										<tr
											key={inv.id || i}
											className="odd:bg-white even:bg-neutral-50/60 hover:bg-primary-50/40 transition-colors"
										>
											<td className="px-4 py-3 whitespace-nowrap">
												<Link
													to={`/invoices/preview/${
														inv.id || inv.invoice_id || ""
													}`}
													className="text-primary-600 hover:text-primary-800 hover:underline font-medium"
												>
													{inv.invoice_number || inv.number || "-"}
												</Link>
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-neutral-700">
												{inv.customer_name || inv.customer || "-"}
											</td>
											<td className="px-4 py-3 whitespace-nowrap text-neutral-600">
												{inv.date
													? new Date(inv.date).toLocaleDateString()
													: "-"}
											</td>
											<td className="px-4 py-3 whitespace-nowrap font-medium">
												{new Intl.NumberFormat("en-IN", {
													style: "currency",
													currency: "INR",
												}).format(
													parseFloat(inv.total_amount ?? inv.amount ?? 0)
												)}
											</td>
											<td className="px-4 py-3 whitespace-nowrap">
												<span
													className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(
														inv.status
													)}`}
												>
													{inv.status || "draft"}
												</span>
											</td>
										</tr>
									))}
								{(dashboardStats?.recent_invoices || []).length === 0 && (
									<tr>
										<td
											colSpan={5}
											className="text-center text-sm text-neutral-500 py-8"
										>
											{t("dashboard.noRecentInvoices")}
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card>

			{/* Real Revenue Chart (from API) */}
			<Card className="animate-slide-up" style={{ animationDelay: "0.55s" }}>
				<Card.Header>
					<Card.Title className="flex items-center">
						<span className="mr-2">📈</span>
						Revenue (Real Data)
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-2">
						<MiniLineChart
							data={(dashboardStats?.revenue_trend || []).map((d) =>
								typeof d === "number" ? d : d.amount ?? d.value ?? 0
							)}
						/>
					</div>
				</Card.Content>
			</Card>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Card className="animate-slide-up" style={{ animationDelay: "0.6s" }}>
					<Card.Header>
						<Card.Title className="flex items-center">
							<span className="mr-2">📊</span>
							{t("dashboard.salesOverview")}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-2">
							<MiniLineChart
								data={(dashboardStats?.revenue_trend || []).map((d) =>
									typeof d === "number" ? d : d.amount ?? d.value ?? 0
								)}
							/>
						</div>
					</Card.Content>
				</Card>

				<Card className="animate-slide-up" style={{ animationDelay: "0.8s" }}>
					<Card.Header>
						<Card.Title className="flex items-center">
							<span className="mr-2">💹</span>
							{t("dashboard.revenueTrends")}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div className="h-64 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-2">
							<MiniLineChart
								stroke="#16a34a"
								fill="rgba(22,163,74,0.12)"
								data={(dashboardStats?.revenue_trend || []).map((d) =>
									typeof d === "number" ? d : d.amount ?? d.value ?? 0
								)}
							/>
						</div>
					</Card.Content>
				</Card>
			</div>
		</div>
	);
};

export default Dashboard;

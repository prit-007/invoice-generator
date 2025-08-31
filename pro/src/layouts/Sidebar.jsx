import React, { useState } from "react";
import {
	Home,
	Package,
	Users,
	FileText,
	CreditCard,
	Settings,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { useLocation, Link } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar, dashboardStats }) => {
	const { t, language, changeLanguage } = useLanguage();
	const location = useLocation();
	const [hoveredItem, setHoveredItem] = useState(null);

	const menuItems = [
		{
			id: "dashboard",
			label: t("nav.dashboard"),
			icon: <Home size={20} aria-hidden />,
			href: "/dashboard",
			gradient: "from-blue-500 to-cyan-500",
		},
		{
			id: "products",
			label: t("nav.products"),
			icon: <Package size={20} aria-hidden />,
			href: "/products",
			gradient: "from-green-500 to-emerald-500",
		},
		{
			id: "customers",
			label: t("nav.customers"),
			icon: <Users size={20} aria-hidden />,
			href: "/customers",
			gradient: "from-purple-500 to-pink-500",
		},
		{
			id: "invoices",
			label: t("nav.invoices"),
			icon: <FileText size={20} aria-hidden />,
			href: "/invoices",
			gradient: "from-orange-500 to-red-500",
		},
		{
			id: "payments",
			label: t("nav.payments"),
			icon: <CreditCard size={20} aria-hidden />,
			href: "/payments",
			gradient: "from-indigo-500 to-blue-500",
		},
		{
			id: "settings",
			label: t("nav.settings"),
			icon: <Settings size={20} aria-hidden />,
			href: "/settings",
			gradient: "from-gray-500 to-slate-500",
		},
	];

	const isActive = (href) => {
		if (href === "/") {
			return location.pathname === "/";
		}
		return location.pathname.startsWith(href);
	};

	return (
		<>
			{/* Sidebar */}
			<div
				className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md shadow-xl transform transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200/50
      `}
			>
				{/* Decorative gradient */}
				<div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-2xl" />

				{/* Header */}
				<div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse-ring">
							<span className="text-white text-lg font-bold">B</span>
						</div>
						<div>
							<span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Bill Generator
							</span>
							<p className="text-xs text-gray-500">Invoice Management</p>
						</div>
					</div>
					<button
						onClick={toggleSidebar}
						className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
					>
						<svg
							className="w-5 h-5 text-gray-600"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Navigation */}
				<nav className="mt-6 px-4 flex-1">
					<ul className="space-y-2">
						{menuItems.map((item) => {
							const active = isActive(item.href);
							return (
								<li key={item.id}>
									<Link
										to={item.href}
										onMouseEnter={() => setHoveredItem(item.id)}
										onMouseLeave={() => setHoveredItem(null)}
										title={t(`navTooltips.${item.id}`)}
										aria-label={t(`navTooltips.${item.id}`)}
										className={`
                      group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                      ${
												active
													? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
													: "text-gray-700 hover:bg-white/70 hover:shadow-md hover:text-gray-900 hover:scale-105"
											}
                      ${hoveredItem === item.id ? "shadow-md" : ""}
                    `}
									>
										{/* Background animation */}
										{!active && (
											<div
												className={`
                        absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300
                      `}
											/>
										)}

										{/* Icon */}
										<div
											className={`
                      relative z-10 transition-transform duration-300
                      ${
												active
													? "text-white"
													: "text-gray-500 group-hover:text-gray-700"
											}
                      ${hoveredItem === item.id ? "scale-110" : ""}
                    `}
										>
											{item.icon}
										</div>

										{/* Label */}
										<span
											className={`
                      relative z-10 font-medium transition-all duration-300
                      ${
												active
													? "text-white"
													: "text-gray-700 group-hover:text-gray-900"
											}
                    `}
										>
											{item.label}
										</span>

										{/* Active indicator */}
										{active && (
											<div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
										)}
									</Link>
								</li>
							);
						})}
					</ul>

					{/* Quick Stats */}
					<div className="mt-8 p-4 rounded-xl border border-blue-100 bg-white/70 backdrop-blur-md">
						<h3 className="text-sm font-semibold text-gray-700 mb-3">
							{t("dashboard.quickStats")}
						</h3>
						<div className="space-y-2">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">
									{t("dashboard.totalInvoices")}
								</span>
								<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
									{dashboardStats?.total_invoices ?? "—"}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">{t("dashboard.pending")}</span>
								<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700">
									{dashboardStats?.pending_invoices ?? "—"}
								</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">{t("dashboard.revenue")}</span>
								<span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
									{new Intl.NumberFormat("en-IN", {
										style: "currency",
										currency: "INR",
									}).format(parseFloat(dashboardStats?.total_revenue ?? 0))}
								</span>
							</div>
						</div>
					</div>
				</nav>

				{/* Language toggle */}
				<div className="absolute bottom-4 left-4 right-4">
					<button
						onClick={() => changeLanguage(language === "en" ? "gu" : "en")}
						className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-200 hover:scale-105 active:scale-95"
					>
						<span className="text-lg">🌐</span>
						<span className="font-medium text-gray-700">
							{language === "en" ? "ગુજરાતી" : "English"}
						</span>
					</button>
				</div>
			</div>
		</>
	);
};

export default Sidebar;

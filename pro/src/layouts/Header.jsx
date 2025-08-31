import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

const Header = ({ toggleSidebar }) => {
	const { t, language, changeLanguage } = useLanguage();
	const [searchFocused, setSearchFocused] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);
	const [showProfile, setShowProfile] = useState(false);

	return (
		<header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
			{/* Left side */}
			<div className="flex items-center space-x-4">
				<button
					onClick={toggleSidebar}
					className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-all duration-200 hover:scale-105 active:scale-95"
				>
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M4 6h16M4 12h16M4 18h16"
						/>
					</svg>
				</button>

				<div className="hidden lg:block">
					<h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						{t("dashboard.title")}
					</h1>
				</div>
			</div>

			{/* Center - Search */}
			<div className="flex-1 max-w-md mx-4">
				<div
					className={`relative transition-all duration-300 ${
						searchFocused ? "transform scale-105" : ""
					}`}
				>
					<input
						type="text"
						placeholder={t("common.search")}
						onFocus={() => setSearchFocused(true)}
						onBlur={() => setSearchFocused(false)}
						className={`w-full pl-10 pr-4 py-2.5 border rounded-xl transition-all duration-300 ${
							searchFocused
								? "border-blue-400 ring-2 ring-blue-100 shadow-md"
								: "border-gray-300 hover:border-gray-400"
						} focus:outline-none bg-gray-50/50 backdrop-blur-sm`}
					/>
					<svg
						className={`absolute left-3 top-3 h-5 w-5 transition-colors duration-300 ${
							searchFocused ? "text-blue-500" : "text-gray-400"
						}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
						/>
					</svg>
				</div>
			</div>

			{/* Right side */}
			<div className="flex items-center space-x-2">
				{/* Language Switcher */}
				<div className="relative">
					<select
						value={language}
						onChange={(e) => changeLanguage(e.target.value)}
						className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:bg-gray-100"
					>
						<option value="en">🇺🇸 EN</option>
						<option value="gu">🇮🇳 ગુ</option>
					</select>
				</div>

				{/* Notifications */}
				<div className="relative">
					<button
						onClick={() => setShowNotifications(!showNotifications)}
						className="relative p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
					>
						<svg
							className="w-5 h-5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 17h5l-5-5V9a5 5 0 00-10 0v3l-5 5h5m10 0a1 1 0 01-1 1H9a1 1 0 01-1-1m10 0V9a5 5 0 00-10 0v8"
							/>
						</svg>
						<span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
							3
						</span>
					</button>

					{/* Notifications Dropdown */}
					{showNotifications && (
						<div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-scale-in">
							<div className="p-4 border-b border-gray-100">
								<h3 className="font-semibold text-gray-900">
									{t("common.notifications")}
								</h3>
							</div>
							<div className="max-h-64 overflow-y-auto">
								<div className="p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors">
									<p className="text-sm font-medium text-gray-900">
										{t("notifications.newInvoice")}
									</p>
									<p className="text-xs text-gray-500">
										{t("common.minutesAgo", { count: 2 })}
									</p>
								</div>
								<div className="p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors">
									<p className="text-sm font-medium text-gray-900">
										{t("notifications.paymentReceived")}
									</p>
									<p className="text-xs text-gray-500">
										{t("common.hoursAgo", { count: 1 })}
									</p>
								</div>
								<div className="p-3 hover:bg-gray-50 transition-colors">
									<p className="text-sm font-medium text-gray-900">
										{t("notifications.customerAdded")}
									</p>
									<p className="text-xs text-gray-500">
										{t("common.hoursAgo", { count: 3 })}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Profile */}
				<div className="relative">
					<button
						onClick={() => setShowProfile(!showProfile)}
						className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
					>
						<div className="hidden md:block text-right">
							<p className="text-sm font-medium text-gray-900">John Doe</p>
							<p className="text-xs text-gray-500">
								{t("common.administrator")}
							</p>
						</div>
						<div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
							<span className="text-white text-sm font-medium">JD</span>
						</div>
					</button>

					{/* Profile Dropdown */}
					{showProfile && (
						<div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 animate-scale-in">
							<div className="p-3 border-b border-gray-100">
								<p className="font-medium text-gray-900">John Doe</p>
								<p className="text-sm text-gray-500">john@company.com</p>
							</div>
							<div className="py-2">
								<a
									href="/profile"
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
								>
									👤 {t("common.profile")}
								</a>
								<a
									href="/settings"
									className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
								>
									⚙️ {t("settings.title")}
								</a>
								<hr className="my-2" />
								<button className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
									🚪 {t("common.signOut")}
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;

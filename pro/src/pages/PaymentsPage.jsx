import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { paymentsApi, ApiError } from "../services/api";
import { logRequest } from "../utils/requestLogger";

const PaymentsPage = () => {
	const { t } = useLanguage();
	const [payments, setPayments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("date");
	const [sortOrder, setSortOrder] = useState("desc");
	const [currentPage, setCurrentPage] = useState(1);
	const [itemsPerPage] = useState(10);

	// Load payments
	const loadPayments = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const startTime = Date.now();
			const response = await paymentsApi.getAll();

			logRequest({
				endpoint: "/payments",
				method: "GET",
				duration: Date.now() - startTime,
				status: "success",
				responseSize: JSON.stringify(response).length,
			});

			setPayments(
				Array.isArray(response) ? response : response.data || response || []
			);
		} catch (err) {
			console.error("Error loading payments:", err);
			setError(err instanceof ApiError ? err.message : t("errors.network"));

			logRequest({
				endpoint: "/payments",
				method: "GET",
				duration: Date.now() - Date.now(),
				status: "error",
				error: err.message,
			});
		} finally {
			setLoading(false);
		}
	}, [t]);

	useEffect(() => {
		loadPayments();
	}, [loadPayments]);

	// Filter and sort payments
	const filteredPayments = payments
		.filter((payment) => {
			if (!searchTerm.trim()) return true;

			const referenceMatch =
				payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				false;
			const methodMatch =
				payment.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				false;

			return referenceMatch || methodMatch;
		})
		.sort((a, b) => {
			const aValue = a[sortBy] || "";
			const bValue = b[sortBy] || "";

			if (sortBy === "date") {
				return sortOrder === "asc"
					? new Date(aValue) - new Date(bValue)
					: new Date(bValue) - new Date(aValue);
			}

			if (sortBy === "amount") {
				return sortOrder === "asc"
					? parseFloat(aValue) - parseFloat(bValue)
					: parseFloat(bValue) - parseFloat(aValue);
			}

			if (sortOrder === "asc") {
				return aValue.toString().localeCompare(bValue.toString());
			} else {
				return bValue.toString().localeCompare(aValue.toString());
			}
		});

	// Pagination
	const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const paginatedPayments = filteredPayments.slice(
		startIndex,
		startIndex + itemsPerPage
	);

	const handleSort = (field) => {
		if (sortBy === field) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortBy(field);
			setSortOrder("desc");
		}
	};

	const handleRefund = async (paymentId) => {
		if (!window.confirm(t("payments.refundConfirm"))) return;

		try {
			const reason = prompt(t("payments.refundReason"));
			await paymentsApi.refund(paymentId, reason || "");
			await loadPayments();
		} catch (err) {
			console.error("Error refunding payment:", err);
			setError(err instanceof ApiError ? err.message : t("errors.network"));
		}
	};

	const formatAmount = (amount) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString();
	};

	const getPaymentMethodBadgeClass = (method) => {
		switch (method?.toLowerCase()) {
			case "cash":
				return "bg-green-100 text-green-800";
			case "credit_card":
			case "credit card":
				return "bg-blue-100 text-blue-800";
			case "debit_card":
			case "debit card":
				return "bg-indigo-100 text-indigo-800";
			case "bank_transfer":
			case "bank transfer":
				return "bg-purple-100 text-purple-800";
			case "upi":
				return "bg-yellow-100 text-yellow-800";
			case "cheque":
				return "bg-orange-100 text-orange-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getMethodLabel = (method) => {
		const key = (method || "").toLowerCase().replace(/[-\s]+/g, "_");
		switch (key) {
			case "cash":
				return t("payments.cash");
			case "credit_card":
				return t("payments.creditCard");
			case "debit_card":
				return t("payments.debitCard");
			case "bank_transfer":
				return t("payments.bankTransfer");
			case "upi":
				return t("payments.upi");
			case "cheque":
				return t("payments.cheque");
			default:
				return method || t("common.other");
		}
	};

	const SortIcon = ({ field }) => {
		if (sortBy !== field) return <span className="text-gray-400">↕</span>;
		return sortOrder === "asc" ? (
			<span className="text-blue-600">↑</span>
		) : (
			<span className="text-blue-600">↓</span>
		);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold text-gray-900">
					{t("payments.title")}
				</h1>
				<button
					onClick={() => (window.location.href = "/payments/add")}
					className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
				>
					{t("payments.add")}
				</button>
			</div>

			{/* Error Message */}
			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
					<svg
						className="w-5 h-5 text-red-500 mr-3"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span className="text-red-700">{error}</span>
					<button
						onClick={() => setError(null)}
						className="ml-auto text-red-500 hover:text-red-700"
					>
						×
					</button>
				</div>
			)}

			{/* Search and Filter */}
			<div className="bg-white rounded-lg shadow p-4">
				<div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
					<div className="flex-1 max-w-md">
						<div className="relative">
							<input
								type="text"
								placeholder={t("payments.search")}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
							<svg
								className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
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

					<div className="flex items-center gap-4">
						<button
							onClick={loadPayments}
							className="p-2 text-gray-500 hover:text-gray-700"
							title={t("common.refresh")}
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
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/>
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Payments Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-white sticky top-0 z-10 shadow-sm">
							<tr>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
									onClick={() => handleSort("reference")}
								>
									<div className="flex items-center">
										{t("payments.reference")}
										<SortIcon field="reference" />
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{t("payments.invoice")}
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
									onClick={() => handleSort("date")}
								>
									<div className="flex items-center">
										{t("payments.date")}
										<SortIcon field="date" />
									</div>
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
									onClick={() => handleSort("amount")}
								>
									<div className="flex items-center">
										{t("payments.amount")}
										<SortIcon field="amount" />
									</div>
								</th>
								<th
									className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
									onClick={() => handleSort("method")}
								>
									<div className="flex items-center">
										{t("payments.method")}
										<SortIcon field="method" />
									</div>
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									{t("payments.type")}
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									{t("common.actions")}
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paginatedPayments.map((payment) => (
								<tr
									key={payment.id}
									className="odd:bg-white even:bg-gray-50/60 hover:bg-blue-50/40 transition-colors"
								>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="font-medium text-gray-900">
											{payment.reference || "-"}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{payment.invoice_id ? (
												<a
													href={`/invoices/edit/${payment.invoice_id}`}
													className="text-blue-600 hover:underline"
												>
													{payment.invoice_id}
												</a>
											) : (
												"-"
											)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{formatDate(payment.date)}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
										<span className={payment.is_refund ? "text-red-600" : ""}>
											{payment.is_refund ? "-" : ""}
											{formatAmount(payment.amount)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentMethodBadgeClass(
												payment.method
											)}`}
										>
											{getMethodLabel(payment.method)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{payment.is_refund && (
											<span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
												{t("payments.refund")}
											</span>
										)}
										{payment.is_advance && !payment.is_refund && (
											<span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
												{t("payments.advance")}
											</span>
										)}
										{!payment.is_refund && !payment.is_advance && (
											<span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
												{t("payments.regular")}
											</span>
										)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<button
											onClick={() =>
												(window.location.href = `/payments/edit/${payment.id}`)
											}
											className="text-blue-600 hover:text-blue-900 mr-3"
										>
											{t("common.edit")}
										</button>
										{!payment.is_refund && (
											<button
												onClick={() => handleRefund(payment.id)}
												className="text-red-600 hover:text-red-900"
											>
												{t("payments.refundAction")}
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Empty State */}
				{filteredPayments.length === 0 && (
					<div className="text-center py-12">
						<svg
							className="mx-auto h-12 w-12 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<h3 className="mt-2 text-sm font-medium text-gray-900">
							{t("payments.noPayments")}
						</h3>
						<p className="mt-1 text-sm text-gray-500">
							{t("payments.noPaymentsDesc")}
						</p>
					</div>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
					<div className="flex items-center text-sm text-gray-500">
						{t("common.showing")} {startIndex + 1} {t("common.to")}{" "}
						{Math.min(startIndex + itemsPerPage, filteredPayments.length)}{" "}
						{t("common.of")} {filteredPayments.length} {t("common.results")}
					</div>
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
							disabled={currentPage === 1}
							className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
						>
							{t("common.previous")}
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
							<button
								key={page}
								onClick={() => setCurrentPage(page)}
								className={`px-3 py-1 rounded text-sm ${
									currentPage === page
										? "bg-blue-600 text-white"
										: "border border-gray-300 hover:bg-gray-50"
								}`}
							>
								{page}
							</button>
						))}

						<button
							onClick={() =>
								setCurrentPage(Math.min(totalPages, currentPage + 1))
							}
							disabled={currentPage === totalPages}
							className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
						>
							{t("common.next")}
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default PaymentsPage;

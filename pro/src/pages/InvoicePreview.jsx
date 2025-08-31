import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { invoicesApi, customersApi, ApiError } from "../services/api";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Alert from "../components/ui/Alert";
import { useToast } from "../components/ui/Toast";

const InvoicePreview = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const { toast } = useToast();

	const [invoice, setInvoice] = useState(null);
	const [customer, setCustomer] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		loadInvoice();
	}, [id]);

	const loadInvoice = async () => {
		setLoading(true);
		setError(null);

		try {
			const invoiceData = await invoicesApi.getById(id);
			setInvoice(invoiceData);

			// Load customer data
			if (invoiceData.customer_id) {
				const customerData = await customersApi.getById(
					invoiceData.customer_id
				);
				setCustomer(customerData);
			}
		} catch (err) {
			console.error("Error loading invoice:", err);
			setError(err instanceof ApiError ? err.message : t("errors.network"));
		} finally {
			setLoading(false);
		}
	};

	const handleDownloadPDF = async () => {
		try {
			// Create PDF download functionality
			const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:1969';
			const response = await fetch(`${apiBase}/invoices/${id}/pdf`, {
				method: "GET",
				headers: {
					Accept: "application/pdf",
				},
			});

			if (!response.ok) {
				throw new Error("Failed to generate PDF");
			}

			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.style.display = "none";
			a.href = url;
			a.download = `invoice-${invoice.invoice_number}.pdf`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);

			toast.success(t("invoices.pdfDownloaded"));
		} catch (err) {
			console.error("Error downloading PDF:", err);
			toast.error(t("errors.pdfDownload"));
		}
	};

	const formatAmount = (amount) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
		}).format(amount || 0);
	};

	const formatDate = (dateString) => {
		if (!dateString) return "-";
		return new Date(dateString).toLocaleDateString("en-IN");
	};

	const getStatusBadgeClass = (status) => {
		switch (status?.toLowerCase()) {
			case "draft":
				return "bg-gray-100 text-gray-800";
			case "sent":
				return "bg-blue-100 text-blue-800";
			case "paid":
				return "bg-green-100 text-green-800";
			case "partially_paid":
				return "bg-yellow-100 text-yellow-800";
			case "overdue":
				return "bg-red-100 text-red-800";
			case "cancelled":
				return "bg-gray-100 text-gray-500";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner size="lg" />
				<span className="ml-3 text-lg text-gray-600">Loading invoice...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<Alert type="error" className="mb-6">
					{error}
				</Alert>
				<Button onClick={() => navigate("/invoices")}>
					{t("common.back")}
				</Button>
			</div>
		);
	}

	if (!invoice) {
		return (
			<div className="max-w-4xl mx-auto p-6">
				<Alert type="error" className="mb-6">
					Invoice not found
				</Alert>
				<Button onClick={() => navigate("/invoices")}>
					{t("common.back")}
				</Button>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-6 animate-fade-in">
			{/* Header */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
				<div>
					<h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						{t("invoices.preview")}
					</h1>
					<p className="text-gray-600 mt-1">
						Invoice #{invoice.invoice_number}
					</p>
				</div>
				<div className="flex space-x-3">
					<Button variant="secondary" onClick={() => navigate("/invoices")}>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M10 19l-7-7m0 0l7-7m-7 7h18"
							/>
						</svg>
						{t("common.back")}
					</Button>
					<Button
						variant="secondary"
						onClick={() => navigate(`/invoices/edit/${id}`)}
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
							/>
						</svg>
						{t("common.edit")}
					</Button>
					<Button
						onClick={handleDownloadPDF}
						className="shadow-lg hover:shadow-xl"
					>
						<svg
							className="w-4 h-4 mr-2"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
							/>

							{/* Invoice Details (as per RE0029) */}
							<div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8 text-sm">
								<div className="col-span-2">
									<div className="text-gray-600">PO NO:</div>
									<div className="font-medium">{invoice.po_no || "-"}</div>
								</div>
								<div className="col-span-2">
									<div className="text-gray-600">PO DATE:</div>
									<div className="font-medium">
										{formatDate(invoice.po_date)}
									</div>
								</div>
								<div className="col-span-2">
									<div className="text-gray-600">BILL NO:</div>
									<div className="font-medium">
										{invoice.invoice_number || "-"}
									</div>
								</div>

								<div className="col-span-2">
									<div className="text-gray-600">BILL DATE:</div>
									<div className="font-medium">{formatDate(invoice.date)}</div>
								</div>
								<div className="col-span-2">
									<div className="text-gray-600">E-WAY BILL NO.:</div>
									<div className="font-medium">
										{invoice.eway_bill_no || "-"}
									</div>
								</div>
								<div className="col-span-2">
									<div className="text-gray-600">E-WAY BILL DATE:</div>
									<div className="font-medium">
										{formatDate(invoice.eway_bill_date)}
									</div>
								</div>

								<div className="col-span-2">
									<div className="text-gray-600">TRANSPORT:</div>
									<div className="font-medium">{invoice.transport || "-"}</div>
								</div>
								<div className="col-span-2">
									<div className="text-gray-600">VEHICLE NO.:</div>
									<div className="font-medium">{invoice.vehicle_no || "-"}</div>
								</div>
								<div className="col-span-2">
									<div className="text-gray-600">LR NO.:</div>
									<div className="font-medium">{invoice.lr_no || "-"}</div>
								</div>
							</div>
						</svg>
						{t("invoices.downloadPDF")}
					</Button>
				</div>
			</div>

			{/* Invoice Preview Card */}
			<Card className="print:shadow-none">
				<Card.Content className="p-8">
					{/* Invoice Header */}
					<div className="flex justify-between items-start mb-8">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-2">INVOICE</h2>
							<div className="text-sm text-gray-600 space-y-1">
								<p>
									<strong>Invoice #:</strong> {invoice.invoice_number}
								</p>
								<p>
									<strong>Date:</strong> {formatDate(invoice.date)}
								</p>
								<p>
									<strong>Due Date:</strong> {formatDate(invoice.due_date)}
								</p>
								<span
									className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
										invoice.status
									)}`}
								>
									{invoice.status?.toUpperCase()}
								</span>
							</div>
						</div>
						<div className="text-right">
							<div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
								<span className="text-white text-2xl font-bold">B</span>
							</div>
							<h3 className="text-lg font-bold text-gray-900">
								Bill Generator
							</h3>
							<p className="text-sm text-gray-600">Invoice Management System</p>
						</div>
					</div>

					{/* Customer Information */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
						<div>
							<h4 className="text-sm font-semibold text-gray-700 mb-3">
								BILL TO:
							</h4>
							<div className="text-sm text-gray-900">
								<p className="font-semibold">
									{customer?.name || invoice.customer_name}
								</p>
								{customer?.billing_address && (
									<div className="mt-2 text-gray-600">
										<p>{customer.billing_address.line1}</p>
										{customer.billing_address.line2 && (
											<p>{customer.billing_address.line2}</p>
										)}
										<p>
											{customer.billing_address.city},{" "}
											{customer.billing_address.state}{" "}
											{customer.billing_address.pincode}
										</p>
										<p>{customer.billing_address.country}</p>
									</div>
								)}
								{customer?.email && (
									<p className="mt-2">Email: {customer.email}</p>
								)}
								{customer?.phone && <p>Phone: {customer.phone}</p>}
								{customer?.gst_no && <p>GST: {customer.gst_no}</p>}
							</div>
						</div>

						{invoice.shipping_details && (
							<div>
								<h4 className="text-sm font-semibold text-gray-700 mb-3">
									SHIP TO:
								</h4>
								<div className="text-sm text-gray-600">
									<p>{invoice.shipping_details.line1}</p>
									{invoice.shipping_details.line2 && (
										<p>{invoice.shipping_details.line2}</p>
									)}
									<p>
										{invoice.shipping_details.city},{" "}
										{invoice.shipping_details.state}{" "}
										{invoice.shipping_details.pincode}
									</p>
									<p>{invoice.shipping_details.country}</p>
								</div>
							</div>
						)}
					</div>

					{/* Invoice Items */}
					<div className="mb-8">
						<div className="overflow-x-auto">
							<table className="min-w-full">
								<thead>
									<tr className="border-b-2 border-gray-200">
										<th className="text-center py-3 px-4 font-semibold text-gray-700">
											Sr No
										</th>
										<th className="text-left py-3 px-4 font-semibold text-gray-700">
											Product
										</th>
										<th className="text-center py-3 px-4 font-semibold text-gray-700">
											HSN/SAC
										</th>
										<th className="text-center py-3 px-4 font-semibold text-gray-700">
											GST%
										</th>
										<th className="text-center py-3 px-4 font-semibold text-gray-700">
											Qty
										</th>
										<th className="text-right py-3 px-4 font-semibold text-gray-700">
											Rate
										</th>
										<th className="text-right py-3 px-4 font-semibold text-gray-700">
											Amount
										</th>
									</tr>
								</thead>
								<tbody>
									{invoice.items?.map((item, index) => {
										const quantity = parseFloat(item.quantity) || 0;
										const unitPrice = parseFloat(item.unit_price) || 0;
										const discount = parseFloat(item.discount) || 0;
										const taxRate = parseFloat(item.tax_rate) || 0;

										const lineTotal =
											quantity * unitPrice * (1 - discount / 100);
										const lineTax = lineTotal * (taxRate / 100);
										const totalWithTax = lineTotal + lineTax;

										return (
											<tr key={index} className="border-b border-gray-100">
												<td className="text-center py-3 px-4">{index + 1}</td>
												<td className="py-3 px-4">
													<div className="font-medium text-gray-900">
														{item.product_name || item.description}
													</div>
													{/* Removed per design: no amount-in-words or bank details inside each item */}
													{false && (
														<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
															<div>
																<div className="text-sm font-semibold text-gray-700 mb-2">
																	Amount in Words:
																</div>
																<div className="text-sm text-gray-800 italic">
																	{invoice.amount_in_words ||
																		`${Math.round(
																			invoice.total_amount || 0
																		)} ONLY`}
																</div>
															</div>
															<div>
																<div className="text-sm font-semibold text-gray-700 mb-2">
																	Bank Details:
																</div>
																<div className="text-sm text-gray-700 space-y-1">
																	<div>
																		<span className="text-gray-500">
																			Bank Name:{" "}
																		</span>
																		<span className="font-medium">
																			{invoice.bank_name || "—"}
																		</span>
																	</div>
																	<div>
																		<span className="text-gray-500">
																			Account Name:{" "}
																		</span>
																		<span className="font-medium">
																			{invoice.bank_account_name || "—"}
																		</span>
																	</div>
																	<div>
																		<span className="text-gray-500">
																			Account No:{" "}
																		</span>
																		<span className="font-medium">
																			{invoice.bank_account_number || "—"}
																		</span>
																	</div>
																	<div>
																		<span className="text-gray-500">
																			IFSC:{" "}
																		</span>
																		<span className="font-medium">
																			{invoice.bank_ifsc_code || "—"}
																		</span>
																	</div>
																</div>
															</div>
														</div>
													)}
													{/* Signature */}
													{false && (
														<div className="mt-10 flex justify-end">
															<div className="text-right">
																<div className="h-16"></div>
																<div className="text-sm text-gray-700 border-t border-gray-300 pt-2">
																	Signature for{" "}
																	{invoice.company_name || "Company"}
																</div>
															</div>
														</div>
													)}
													{item.description &&
														item.product_name !== item.description && (
															<div className="text-sm text-gray-600">
																{item.description}
															</div>
														)}
												</td>
												<td className="text-center py-3 px-4">
													{item.hsn_sac_code || invoice.hsn_sac_code || ""}
												</td>
												<td className="text-center py-3 px-4">{taxRate}%</td>
												<td className="text-center py-3 px-4">{quantity}</td>
												<td className="text-right py-3 px-4">
													{formatAmount(unitPrice)}
												</td>

												<td className="text-right py-3 px-4 font-semibold">
													{formatAmount(lineTotal)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>

					{/* Invoice Totals */}
					<div className="flex justify-end">
						<div className="w-full max-w-sm">
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Subtotal:</span>
									<span className="font-medium">
										{formatAmount(invoice.subtotal)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">CGST (6%):</span>
									<span className="font-medium">
										{formatAmount(invoice.cgst_amount || 0)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">SGST (6%):</span>
									<span className="font-medium">
										{formatAmount(invoice.sgst_amount || 0)}
									</span>
								</div>
								<div className="flex justify-between text-sm">
									<span className="text-gray-600">Total Tax:</span>
									<span className="font-medium">
										{formatAmount(invoice.tax_amount)}
									</span>
								</div>
								<div className="border-t border-gray-200 pt-2">
									<div className="flex justify-between text-lg font-bold">
										<span>Total:</span>
										<span>{formatAmount(invoice.total_amount)}</span>
									</div>
								</div>
								{invoice.amount_paid > 0 && (
									<>
										<div className="flex justify-between text-sm text-green-600">
											<span>Paid:</span>
											<span className="font-medium">
												{formatAmount(invoice.amount_paid)}
											</span>
										</div>
										<div className="flex justify-between text-lg font-bold text-red-600">
											<span>Balance Due:</span>
											<span>{formatAmount(invoice.balance_due)}</span>
										</div>
									</>
								)}
							</div>
						</div>
					</div>

					{/* Notes and Terms */}
					{(invoice.notes || invoice.terms) && (
						<div className="mt-8 pt-8 border-t border-gray-200">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
								{invoice.notes && (
									<div>
										<h4 className="text-sm font-semibold text-gray-700 mb-2">
											Notes:
										</h4>
										<p className="text-sm text-gray-600">{invoice.notes}</p>
									</div>
								)}
								{invoice.terms && (
									<div>
										<h4 className="text-sm font-semibold text-gray-700 mb-2">
											Terms & Conditions:
										</h4>
										<p className="text-sm text-gray-600">{invoice.terms}</p>
									</div>
								)}
							</div>
						</div>
					)}
				</Card.Content>
			</Card>
		</div>
	);
};

export default InvoicePreview;

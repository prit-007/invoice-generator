import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { customersApi, ApiError } from "../services/api";
import { logRequest } from "../utils/requestLogger";

const defaultBillingAddress = {
	address_line1: "",
	address_line2: "",
	city: "",
	state: "",
	zip_code: "",
	country: "",
};

const CustomerAddEdit = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t } = useLanguage();
	const isEdit = Boolean(id);

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		contact: "",
		email: "",
		phone: "",
		billing_address: { ...defaultBillingAddress },
		shipping_address: null,
		gst_no: "",
		place_of_supply: "",
		payment_terms: 15,
		credit_limit: "",
		company_type: "",
		notes: "",
	});
	const [errors, setErrors] = useState({});

	// Load customer data for editing
	const loadCustomer = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const startTime = Date.now();
			const response = await customersApi.getById(id);
			logRequest({
				endpoint: `/customers/${id}`,
				method: "GET",
				duration: Date.now() - startTime,
				status: "success",
				responseSize: JSON.stringify(response).length,
			});
			setFormData({
				name: response.name || "",
				contact: response.contact || "",
				email: response.email || "",
				phone: response.phone || "",
				billing_address: response.billing_address || {
					...defaultBillingAddress,
				},
				shipping_address: response.shipping_address || null,
				gst_no: response.gst_no || "",
				place_of_supply: response.place_of_supply || "",
				payment_terms: response.payment_terms ?? 15,
				credit_limit: response.credit_limit?.toString() || "",
				company_type: response.company_type || "",
				notes: response.notes || "",
			});
		} catch (err) {
			setError(err instanceof ApiError ? err.message : t("errors.network"));
			logRequest({
				endpoint: `/customers/${id}`,
				method: "GET",
				duration: Date.now() - Date.now(),
				status: "error",
				error: err.message,
			});
		} finally {
			setLoading(false);
		}
	}, [id, t]);

	useEffect(() => {
		if (isEdit) {
			loadCustomer();
		}
	}, [isEdit, loadCustomer]);

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: null }));
		}
	};

	const handleAddressChange = (e, addressType = "billing_address") => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[addressType]: {
				...prev[addressType],
				[name]: value,
			},
		}));
		if (errors[addressType]?.[name]) {
			setErrors((prev) => ({
				...prev,
				[addressType]: {
					...prev[addressType],
					[name]: null,
				},
			}));
		}
	};

	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) {
			newErrors.name = t("errors.required");
		}
		if (formData.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
			newErrors.email = t("errors.invalidEmail");
		}
		if (formData.phone && !/^\+?[0-9\-\s]{7,15}$/.test(formData.phone)) {
			newErrors.phone = t("errors.invalidPhone");
		}
		// Billing address required fields
		const ba = formData.billing_address;
		if (!ba.address_line1?.trim()) {
			newErrors.billing_address = {
				...newErrors.billing_address,
				address_line1: t("errors.required"),
			};
		}
		if (!ba.city?.trim()) {
			newErrors.billing_address = {
				...newErrors.billing_address,
				city: t("errors.required"),
			};
		}
		if (!ba.state?.trim()) {
			newErrors.billing_address = {
				...newErrors.billing_address,
				state: t("errors.required"),
			};
		}
		if (!ba.zip_code?.trim()) {
			newErrors.billing_address = {
				...newErrors.billing_address,
				zip_code: t("errors.required"),
			};
		}
		if (!ba.country?.trim()) {
			newErrors.billing_address = {
				...newErrors.billing_address,
				country: t("errors.required"),
			};
		}
		if (formData.credit_limit && isNaN(Number(formData.credit_limit))) {
			newErrors.credit_limit = t("errors.invalidNumber");
		}
		setErrors(newErrors);
		return (
			Object.keys(newErrors).length === 0 &&
			(!newErrors.billing_address ||
				Object.keys(newErrors.billing_address).length === 0)
		);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!validateForm()) return;
		setSaving(true);
		setError(null);
		try {
			const customerData = {
				...formData,
				credit_limit: formData.credit_limit
					? parseFloat(formData.credit_limit)
					: null,
				payment_terms: formData.payment_terms
					? parseInt(formData.payment_terms)
					: 15,
			};
			const startTime = Date.now();
			let response;
			if (isEdit) {
				response = await customersApi.update(id, customerData);
				logRequest({
					endpoint: `/customers/${id}`,
					method: "PUT",
					duration: Date.now() - startTime,
					status: "success",
					responseSize: JSON.stringify(response).length,
				});
			} else {
				response = await customersApi.create(customerData);
				logRequest({
					endpoint: "/customers",
					method: "POST",
					duration: Date.now() - startTime,
					status: "success",
					responseSize: JSON.stringify(response).length,
				});
			}
			navigate("/customers");
		} catch (err) {
			setError(err instanceof ApiError ? err.message : t("errors.network"));
			logRequest({
				endpoint: isEdit ? `/customers/${id}` : "/customers",
				method: isEdit ? "PUT" : "POST",
				duration: Date.now() - Date.now(),
				status: "error",
				error: err.message,
			});
		} finally {
			setSaving(false);
		}
	};

	const companyTypes = [
		{ value: "Individual", label: t("customers.companyTypes.individual") },
		{
			value: "Proprietorship",
			label: t("customers.companyTypes.proprietorship"),
		},
		{ value: "Partnership", label: t("customers.companyTypes.partnership") },
		{
			value: "Private Limited",
			label: t("customers.companyTypes.privateLimited"),
		},
		{
			value: "Public Limited",
			label: t("customers.companyTypes.publicLimited"),
		},
		{ value: "LLP", label: t("customers.companyTypes.llp") },
		{ value: "Other", label: t("customers.companyTypes.other") },
	];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<button
						onClick={() => navigate("/customers")}
						className="p-2 hover:bg-gray-100 rounded-lg"
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
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
					<h1 className="text-2xl font-bold text-gray-900">
						{isEdit ? t("customers.edit") : t("customers.add")}
					</h1>
				</div>
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

			{/* Form */}
			<form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
				<div className="p-6 space-y-6">
					{/* Basic Information */}
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							{t("customers.title")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.name")} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.name ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={t("customers.name")}
									aria-required="true"
									aria-invalid={!!errors.name}
								/>
								{errors.name && (
									<p className="mt-1 text-sm text-red-500">{errors.name}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.contactPerson")}
								</label>
								<input
									type="text"
									name="contact"
									value={formData.contact}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={t("customers.contactPerson")}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.email")}
								</label>
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.email ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={t("customers.email")}
									aria-invalid={!!errors.email}
								/>
								{errors.email && (
									<p className="mt-1 text-sm text-red-500">{errors.email}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.phone")}
								</label>
								<input
									type="text"
									name="phone"
									value={formData.phone}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.phone ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={t("customers.phone")}
									aria-invalid={!!errors.phone}
								/>
								{errors.phone && (
									<p className="mt-1 text-sm text-red-500">{errors.phone}</p>
								)}
							</div>
						</div>
					</div>

					{/* Billing Address */}
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							{t("customers.address")} ({t("form.required")})
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("form.select")} {t("customers.address")}
								</label>
								<input
									type="text"
									name="address_line1"
									value={formData.billing_address.address_line1}
									onChange={(e) => handleAddressChange(e, "billing_address")}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.billing_address?.address_line1
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder={t("form.required")}
									aria-required="true"
									aria-invalid={!!errors.billing_address?.address_line1}
								/>
								{errors.billing_address?.address_line1 && (
									<p className="mt-1 text-sm text-red-500">
										{errors.billing_address.address_line1}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.city")}
								</label>
								<input
									type="text"
									name="city"
									value={formData.billing_address.city}
									onChange={(e) => handleAddressChange(e, "billing_address")}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.billing_address?.city
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder={t("customers.city")}
									aria-required="true"
									aria-invalid={!!errors.billing_address?.city}
								/>
								{errors.billing_address?.city && (
									<p className="mt-1 text-sm text-red-500">
										{errors.billing_address.city}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.state")}
								</label>
								<input
									type="text"
									name="state"
									value={formData.billing_address.state}
									onChange={(e) => handleAddressChange(e, "billing_address")}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.billing_address?.state
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder={t("customers.state")}
									aria-required="true"
									aria-invalid={!!errors.billing_address?.state}
								/>
								{errors.billing_address?.state && (
									<p className="mt-1 text-sm text-red-500">
										{errors.billing_address.state}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.zipCode")}
								</label>
								<input
									type="text"
									name="zip_code"
									value={formData.billing_address.zip_code}
									onChange={(e) => handleAddressChange(e, "billing_address")}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.billing_address?.zip_code
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder={t("customers.zipCode")}
									aria-required="true"
									aria-invalid={!!errors.billing_address?.zip_code}
								/>
								{errors.billing_address?.zip_code && (
									<p className="mt-1 text-sm text-red-500">
										{errors.billing_address.zip_code}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.country")}
								</label>
								<input
									type="text"
									name="country"
									value={formData.billing_address.country}
									onChange={(e) => handleAddressChange(e, "billing_address")}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.billing_address?.country
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder={t("customers.country")}
									aria-required="true"
									aria-invalid={!!errors.billing_address?.country}
								/>
								{errors.billing_address?.country && (
									<p className="mt-1 text-sm text-red-500">
										{errors.billing_address.country}
									</p>
								)}
							</div>
						</div>
					</div>

					{/* Optional Fields */}
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							{t("form.optional")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.gstNumber")}
								</label>
								<input
									type="text"
									name="gst_no"
									value={formData.gst_no}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={t("customers.gstNumber")}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.place_of_supply")}
								</label>
								<input
									type="text"
									name="place_of_supply"
									value={formData.place_of_supply}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={t("customers.place_of_supply")}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.paymentTerms")}
								</label>
								<input
									type="number"
									name="payment_terms"
									value={formData.payment_terms}
									onChange={handleInputChange}
									min="0"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={t("customers.paymentTerms")}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.creditLimit")}
								</label>
								<input
									type="number"
									name="credit_limit"
									value={formData.credit_limit}
									onChange={handleInputChange}
									min="0"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.credit_limit ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={t("customers.creditLimit")}
									aria-invalid={!!errors.credit_limit}
								/>
								{errors.credit_limit && (
									<p className="mt-1 text-sm text-red-500">
										{errors.credit_limit}
									</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("customers.company")}
								</label>
								<select
									name="company_type"
									value={formData.company_type}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">{t("form.select")}</option>
									{companyTypes.map((ct) => (
										<option key={ct.value} value={ct.value}>
											{ct.label}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("form.notes")}
								</label>
								<textarea
									name="notes"
									value={formData.notes}
									onChange={handleInputChange}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={t("form.notes")}
								/>
							</div>
						</div>
					</div>
				</div>
				{/* Footer */}
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
					<button
						type="button"
						onClick={() => navigate("/customers")}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
					>
						{t("form.cancel")}
					</button>
					<button
						type="submit"
						disabled={saving}
						className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{saving
							? t("common.saving")
							: isEdit
							? t("common.update")
							: t("form.submit")}
					</button>
				</div>
			</form>
		</div>
	);
};

export default CustomerAddEdit;

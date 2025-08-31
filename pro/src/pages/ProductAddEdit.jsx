import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { productsApi, ApiError } from "../services/api";
import { logRequest } from "../utils/requestLogger";

import { useToast } from "../components/ui/Toast";

const ProductAddEdit = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { t } = useLanguage();

	const isEdit = Boolean(id);

	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState({
		name: "",
		description: "",
		category: "",
		price: "",
		cost_price: "",
		sku: "",
		stock_quantity: "",
		min_stock_level: "",
		unit: "pcs",
		tax_rate: "18",
		is_active: true,
	});
	const [errors, setErrors] = useState({}); // Load product data for editing
	const loadProduct = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const startTime = Date.now();
			const response = await productsApi.getById(id);

			logRequest({
				endpoint: `/products/${id}`,
				method: "GET",
				duration: Date.now() - startTime,
				status: "success",
				responseSize: JSON.stringify(response).length,
			});

			setFormData({
				name: response.name || "",
				description: response.description || "",
				category: response.category || "",
				price: response.price?.toString() || "",
				cost_price: response.cost_price?.toString() || "",
				sku: response.sku || "",
				stock_quantity: response.stock_quantity?.toString() || "",
				min_stock_level: response.min_stock_level?.toString() || "",
				unit: response.unit || "pcs",
				tax_rate: response.tax_rate?.toString() || "18",
				is_active: response.is_active !== false,
			});
		} catch (err) {
			console.error("Error loading product:", err);
			setError(err instanceof ApiError ? err.message : t("errors.network"));

			logRequest({
				endpoint: `/products/${id}`,
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
			loadProduct();
		}
	}, [isEdit, loadProduct]);

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: null,
			}));
		}
	};
	const validateForm = () => {
		const newErrors = {};
		if (!formData.name.trim()) {
			newErrors.name = t("errors.required");
		}
		if (!formData.price || parseFloat(formData.price) <= 0) {
			newErrors.price = t("errors.minValue", { min: 0.01 });
		}
		if (!formData.sku.trim()) {
			newErrors.sku = t("errors.required");
		}
		if (formData.stock_quantity && parseFloat(formData.stock_quantity) < 0) {
			newErrors.stock_quantity = t("errors.minValue", { min: 0 });
		}
		if (formData.min_stock_level && parseFloat(formData.min_stock_level) < 0) {
			newErrors.min_stock_level = t("errors.minValue", { min: 0 });
		}
		if (
			formData.tax_rate &&
			(parseFloat(formData.tax_rate) < 0 || parseFloat(formData.tax_rate) > 100)
		) {
			newErrors.tax_rate = t("errors.invalidNumber");
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const productData = {
				...formData,
				price: parseFloat(formData.price),
				cost_price: formData.cost_price
					? parseFloat(formData.cost_price)
					: null,
				stock_quantity: formData.stock_quantity
					? parseInt(formData.stock_quantity)
					: 0,
				min_stock_level: formData.min_stock_level
					? parseInt(formData.min_stock_level)
					: null,
				tax_rate: parseFloat(formData.tax_rate),
			};

			const startTime = Date.now();
			let response;

			if (isEdit) {
				response = await productsApi.update(id, productData);
				logRequest({
					endpoint: `/products/${id}`,
					method: "PUT",
					duration: Date.now() - startTime,
					status: "success",
					responseSize: JSON.stringify(response).length,
				});
			} else {
				response = await productsApi.create(productData);
				logRequest({
					endpoint: "/products",
					method: "POST",
					duration: Date.now() - startTime,
					status: "success",
					responseSize: JSON.stringify(response).length,
				});
			}

			navigate("/products");
		} catch (err) {
			console.error("Error saving product:", err);
			setError(err instanceof ApiError ? err.message : t("errors.network"));

			logRequest({
				endpoint: isEdit ? `/products/${id}` : "/products",
				method: isEdit ? "PUT" : "POST",
				duration: Date.now() - Date.now(),
				status: "error",
				error: err.message,
			});
		} finally {
			setSaving(false);
		}
	};

	const categories = [
		{ value: "Electronics", label: t("products.categories.electronics") },
		{ value: "Clothing", label: t("products.categories.clothing") },
		{ value: "Books", label: t("products.categories.books") },
		{
			value: "Food & Beverages",
			label: t("products.categories.foodBeverages"),
		},
		{ value: "Home & Garden", label: t("products.categories.homeGarden") },
		{
			value: "Sports & Outdoors",
			label: t("products.categories.sportsOutdoors"),
		},
		{ value: "Health & Beauty", label: t("products.categories.healthBeauty") },
		{ value: "Automotive", label: t("products.categories.automotive") },
		{
			value: "Tools & Hardware",
			label: t("products.categories.toolsHardware"),
		},
		{
			value: "Office Supplies",
			label: t("products.categories.officeSupplies"),
		},
		{ value: "Other", label: t("products.categories.other") },
	];

	const units = [
		{ value: "pcs", label: t("products.unitsMap.pcs") },
		{ value: "kg", label: t("products.unitsMap.kg") },
		{ value: "g", label: t("products.unitsMap.g") },
		{ value: "l", label: t("products.unitsMap.l") },
		{ value: "ml", label: t("products.unitsMap.ml") },
		{ value: "m", label: t("products.unitsMap.m") },
		{ value: "cm", label: t("products.unitsMap.cm") },
		{ value: "box", label: t("products.unitsMap.box") },
		{ value: "pack", label: t("products.unitsMap.pack") },
		{ value: "set", label: t("products.unitsMap.set") },
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
						onClick={() => navigate("/products")}
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
						{isEdit ? t("products.edit") : t("products.add")}
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
							{t("products.basicInfo")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.name")} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.name ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={t("products.namePlaceholder")}
									aria-required="true"
									aria-invalid={!!errors.name}
								/>
								{errors.name && (
									<p className="mt-1 text-sm text-red-500">{errors.name}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.sku")} <span className="text-red-500">*</span>
								</label>
								<input
									type="text"
									name="sku"
									value={formData.sku}
									onChange={handleInputChange}
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.sku ? "border-red-500" : "border-gray-300"
									}`}
									placeholder={t("products.skuPlaceholder")}
									aria-required="true"
									aria-invalid={!!errors.sku}
								/>
								{errors.sku && (
									<p className="mt-1 text-sm text-red-500">{errors.sku}</p>
								)}
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.description")}
								</label>
								<textarea
									name="description"
									value={formData.description}
									onChange={handleInputChange}
									rows={3}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder={t("products.descriptionPlaceholder")}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.category")}
								</label>
								<select
									name="category"
									value={formData.category}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">{t("products.selectCategory")}</option>
									{categories.map((category) => (
										<option key={category.value} value={category.value}>
											{category.label}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.unit")}
								</label>
								<select
									name="unit"
									value={formData.unit}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									{units.map((unit) => (
										<option key={unit.value} value={unit.value}>
											{unit.label}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>

					{/* Pricing */}
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							{t("products.pricing")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.price")} <span className="text-red-500">*</span>
								</label>
								<input
									type="number"
									name="price"
									value={formData.price}
									onChange={handleInputChange}
									step="0.01"
									min="0"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.price ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="0.00"
									aria-required="true"
									aria-invalid={!!errors.price}
								/>
								{errors.price && (
									<p className="mt-1 text-sm text-red-500">{errors.price}</p>
								)}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.costPrice")}
								</label>
								<input
									type="number"
									name="cost_price"
									value={formData.cost_price}
									onChange={handleInputChange}
									step="0.01"
									min="0"
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="0.00"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.taxRate")} (%)
								</label>
								<input
									type="number"
									name="tax_rate"
									value={formData.tax_rate}
									onChange={handleInputChange}
									step="0.01"
									min="0"
									max="100"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.tax_rate ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="18.00"
									aria-invalid={!!errors.tax_rate}
								/>
								{errors.tax_rate && (
									<p className="mt-1 text-sm text-red-500">{errors.tax_rate}</p>
								)}
							</div>
						</div>
					</div>

					{/* Inventory */}
					<div>
						<h2 className="text-lg font-semibold text-gray-900 mb-4">
							{t("products.inventory")}
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.stockQuantity")}
								</label>
								<input
									type="number"
									name="stock_quantity"
									value={formData.stock_quantity}
									onChange={handleInputChange}
									min="0"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.stock_quantity ? "border-red-500" : "border-gray-300"
									}`}
									placeholder="0"
									aria-invalid={!!errors.stock_quantity}
								/>
								{errors.stock_quantity && (
									<p className="mt-1 text-sm text-red-500">
										{errors.stock_quantity}
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{t("products.minStockLevel")}
								</label>
								<input
									type="number"
									name="min_stock_level"
									value={formData.min_stock_level}
									onChange={handleInputChange}
									min="0"
									className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
										errors.min_stock_level
											? "border-red-500"
											: "border-gray-300"
									}`}
									placeholder="0"
									aria-invalid={!!errors.min_stock_level}
								/>
								{errors.min_stock_level && (
									<p className="mt-1 text-sm text-red-500">
										{errors.min_stock_level}
									</p>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
					<button
						type="button"
						onClick={() => navigate("/products")}
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

export default ProductAddEdit;

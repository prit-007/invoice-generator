import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { paymentsApi, customersApi, invoicesApi, ApiError } from '../services/api';
import { logRequest } from '../utils/requestLogger';

const PaymentAddEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [invoices, setInvoices] = useState([]);
    const [customerInvoices, setCustomerInvoices] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [invoiceSearch, setInvoiceSearch] = useState('');
    const [showInvoiceDropdown, setShowInvoiceDropdown] = useState(false);

    const [formData, setFormData] = useState({
        customer_id: '',
        invoice_id: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        method: 'bank_transfer',
        reference: '',
        notes: '',
        is_refund: false,
        is_advance: false
    });

    const [errors, setErrors] = useState({});

    // Filter customers based on search
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearch.toLowerCase())
    );

    // Filter invoices based on search
    const filteredInvoices = customerInvoices.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase())
    );

    // Handle customer selection
    const handleCustomerSelect = (customer) => {
        setFormData(prev => ({
            ...prev,
            customer_id: customer.id,
            invoice_id: '' // Reset invoice when customer changes
        }));
        setCustomerSearch(customer.name);
        setShowCustomerDropdown(false);

        // Load invoices for selected customer
        loadCustomerInvoices(customer.id);
    };

    // Handle invoice selection
    const handleInvoiceSelect = (invoice) => {
        setFormData(prev => ({
            ...prev,
            invoice_id: invoice.id,
            amount: invoice.balance_due || invoice.total_amount // Auto-fill amount
        }));
        setInvoiceSearch(`${invoice.invoice_number} - ₹${(invoice.balance_due || invoice.total_amount).toFixed(2)}`);
        setShowInvoiceDropdown(false);
    };

    // Clear invoice selection
    const clearInvoiceSelection = () => {
        setFormData(prev => ({
            ...prev,
            invoice_id: '',
            amount: ''
        }));
        setInvoiceSearch('');
    };
    
    // Load customers
    const loadCustomers = useCallback(async () => {
        try {
            const response = await customersApi.getAll();
            setCustomers(Array.isArray(response) ? response : response.data || response || []);
        } catch (err) {
            console.error('Error loading customers:', err);
        }
    }, []);

    // Load invoices
    const loadInvoices = useCallback(async () => {
        try {
            const response = await invoicesApi.getAll();
            // Filter only pending or partially paid invoices
            const filteredInvoices = (Array.isArray(response) ? response : response.data || response || [])
                .filter(invoice => ['pending', 'partial'].includes(invoice.status?.toLowerCase()));
            setInvoices(filteredInvoices);
        } catch (err) {
            console.error('Error loading invoices:', err);
        }
    }, []);

    const loadCustomerInvoices = useCallback(async (customerId) => {
        if (!customerId) {
            setCustomerInvoices([]);
            return;
        }

        try {
            // Fetch all invoices and filter for the customer
            const response = await invoicesApi.getAll();
            const allInvoices = Array.isArray(response) ? response : response.data || response || [];

            // Filter for customer's pending/partial invoices
            const customerInvoices = allInvoices.filter(invoice =>
                invoice.customer_id === customerId &&
                ['pending', 'partial', 'draft'].includes(invoice.status?.toLowerCase())
            );

            setCustomerInvoices(customerInvoices);
        } catch (err) {
            console.error('Error loading customer invoices:', err);
            setCustomerInvoices([]);
        }
    }, []);

    // Load payment data for editing
    const loadPayment = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const startTime = Date.now();
            const response = await paymentsApi.getById(id);
            
            logRequest({
                endpoint: `/payments/${id}`,
                method: 'GET',
                duration: Date.now() - startTime,
                status: 'success',
                responseSize: JSON.stringify(response).length
            });

            // Format date string
            const paymentDate = response.date ? new Date(response.date).toISOString().split('T')[0] : '';

            setFormData({
                customer_id: response.customer_id || '',
                invoice_id: response.invoice_id || '',
                amount: response.amount?.toString() || '',
                date: paymentDate,
                method: response.method || 'bank_transfer',
                reference: response.reference || '',
                notes: response.notes || '',
                is_refund: response.is_refund || false,
                is_advance: response.is_advance || false
            });

            // Set search fields for display
            if (response.customer_id) {
                const customer = customers.find(c => c.id === response.customer_id);
                if (customer) {
                    setCustomerSearch(customer.name);
                }
                // Load customer invoices
                await loadCustomerInvoices(response.customer_id);
            }

            if (response.invoice_id) {
                // Find and set invoice search after loading customer invoices
                setTimeout(() => {
                    const invoice = customerInvoices.find(inv => inv.id === response.invoice_id);
                    if (invoice) {
                        setInvoiceSearch(`${invoice.invoice_number} - ₹${(invoice.balance_due || invoice.total_amount).toFixed(2)}`);
                    }
                }, 100);
            }
        } catch (err) {
            console.error('Error loading payment:', err);
            setError(err instanceof ApiError ? err.message : t('errors.network'));
            
            logRequest({
                endpoint: `/payments/${id}`,
                method: 'GET',
                duration: Date.now() - Date.now(),
                status: 'error',
                error: err.message
            });
        } finally {
            setLoading(false);
        }
    }, [id, t]);

    useEffect(() => {
        loadCustomers();
        loadInvoices();
        
        if (isEdit) {
            loadPayment();
        }
    }, [isEdit, loadPayment, loadCustomers, loadInvoices]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.dropdown-container')) {
                setShowCustomerDropdown(false);
                setShowInvoiceDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Filter invoices when customer changes
    useEffect(() => {
        if (formData.customer_id) {
            const filtered = invoices.filter(invoice => invoice.customer_id === formData.customer_id);
            setCustomerInvoices(filtered);
            
            // If current invoice doesn't belong to the selected customer, reset it
            if (formData.invoice_id && !filtered.some(invoice => invoice.id === formData.invoice_id)) {
                setFormData(prev => ({ ...prev, invoice_id: '' }));
            }
        } else {
            setCustomerInvoices([]);
            setFormData(prev => ({ ...prev, invoice_id: '' }));
        }
    }, [formData.customer_id, invoices]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // For invoice selection, also check if it's an advance payment
        if (name === 'invoice_id') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                is_advance: !value // If no invoice is selected, it's an advance payment
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.customer_id) {
            newErrors.customer_id = t('errors.required');
        }
        if (!formData.date) {
            newErrors.date = t('errors.required');
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = t('errors.minValue', { min: 0.01 });
        }
        if (!formData.method) {
            newErrors.method = t('errors.required');
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
            const paymentData = {
                ...formData,
                amount: parseFloat(formData.amount),
                invoice_id: formData.invoice_id || null,
                is_advance: !formData.invoice_id || formData.is_advance
            };

            const startTime = Date.now();
            let response;

            if (isEdit) {
                response = await paymentsApi.update(id, paymentData);
                logRequest({
                    endpoint: `/payments/${id}`,
                    method: 'PUT',
                    duration: Date.now() - startTime,
                    status: 'success',
                    responseSize: JSON.stringify(response).length
                });
            } else {
                response = await paymentsApi.create(paymentData);
                logRequest({
                    endpoint: '/payments',
                    method: 'POST',
                    duration: Date.now() - startTime,
                    status: 'success',
                    responseSize: JSON.stringify(response).length
                });
            }

            navigate('/payments');
        } catch (err) {
            console.error('Error saving payment:', err);
            setError(err instanceof ApiError ? err.message : t('errors.network'));

            logRequest({
                endpoint: isEdit ? `/payments/${id}` : '/payments',
                method: isEdit ? 'PUT' : 'POST',
                duration: Date.now() - Date.now(),
                status: 'error',
                error: err.message
            });
        } finally {
            setSaving(false);
        }
    };

    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount || 0);
    };

    const paymentMethods = [
        { value: 'cash', label: 'Cash' },
        { value: 'bank_transfer', label: 'Bank Transfer' },
        { value: 'credit_card', label: 'Credit Card' },
        { value: 'debit_card', label: 'Debit Card' },
        { value: 'upi', label: 'UPI' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'other', label: 'Other' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Enhanced Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                            <i className="fas fa-credit-card text-green-600 text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {isEdit ? t('payments.edit') : t('payments.create')}
                            </h1>
                            {isEdit && formData.reference && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Reference: {formData.reference}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/payments')}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <i className="fas fa-arrow-left"></i>
                            <span>{t('common.cancel')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">{t('payments.details')}</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer */}
                            <div className="relative dropdown-container">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('payments.customer')}*
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowCustomerDropdown(true);
                                        }}
                                        onFocus={() => setShowCustomerDropdown(true)}
                                        placeholder="Search and select customer..."
                                        className={`w-full border ${errors.customer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 pr-10`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    {showCustomerDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCustomers.length > 0 ? (
                                                filteredCustomers.map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() => handleCustomerSelect(customer)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                    >
                                                        <div className="font-medium">{customer.name}</div>
                                                        {customer.email && (
                                                            <div className="text-sm text-gray-500">{customer.email}</div>
                                                        )}
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-gray-500">No customers found</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {errors.customer_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                                )}
                            </div>

                            {/* Invoice (optional) */}
                            <div className="relative dropdown-container">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('payments.invoice')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={invoiceSearch}
                                        onChange={(e) => {
                                            setInvoiceSearch(e.target.value);
                                            setShowInvoiceDropdown(true);
                                        }}
                                        onFocus={() => setShowInvoiceDropdown(true)}
                                        placeholder={!formData.customer_id ? "Select customer first..." : "Search invoices or leave empty for advance payment..."}
                                        disabled={!formData.customer_id}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-20"
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center">
                                        {formData.invoice_id && (
                                            <button
                                                type="button"
                                                onClick={clearInvoiceSelection}
                                                className="px-2 text-gray-400 hover:text-gray-600"
                                                title="Clear selection"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowInvoiceDropdown(!showInvoiceDropdown)}
                                            disabled={!formData.customer_id}
                                            className="px-3 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>

                                    {showInvoiceDropdown && formData.customer_id && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredInvoices.length > 0 ? (
                                                filteredInvoices.map(invoice => (
                                                    <button
                                                        key={invoice.id}
                                                        type="button"
                                                        onClick={() => handleInvoiceSelect(invoice)}
                                                        className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <div className="font-medium">{invoice.invoice_number}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    {new Date(invoice.date).toLocaleDateString()} • Status: {invoice.status}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="font-medium text-green-600">
                                                                    {formatAmount(invoice.balance_due || invoice.total_amount)}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    {invoice.balance_due ? 'Balance Due' : 'Total'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                ))
                                            ) : (
                                                <div className="px-3 py-2 text-gray-500">
                                                    {customerInvoices.length === 0 ? "No pending invoices" : "No invoices found"}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <p className="mt-1 text-xs text-gray-500">
                                    {!formData.invoice_id ? "Leave empty for advance payment" : "Payment will be applied to selected invoice"}
                                </p>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('payments.amount')}*
                                </label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        min="0.01"
                                        step="0.01"
                                        className={`w-full border ${errors.amount ? 'border-red-500' : 'border-gray-300'} rounded-lg pl-8 pr-3 py-2`}
                                        placeholder="0.00"
                                    />
                                </div>
                                {errors.amount && (
                                    <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
                                )}
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('payments.date')}*
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleInputChange}
                                    className={`w-full border ${errors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                                />
                                {errors.date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('payments.method')}*
                                </label>
                                <select
                                    name="method"
                                    value={formData.method}
                                    onChange={handleInputChange}
                                    className={`w-full border ${errors.method ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                                >
                                    {paymentMethods.map(method => (
                                        <option key={method.value} value={method.value}>
                                            {method.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.method && (
                                    <p className="mt-1 text-sm text-red-600">{errors.method}</p>
                                )}
                            </div>

                            {/* Reference */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('payments.reference')}
                                </label>
                                <input
                                    type="text"
                                    name="reference"
                                    value={formData.reference}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder={t('payments.referencePlaceholder')}
                                />
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('payments.notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder={t('payments.notesPlaceholder')}
                                />
                            </div>

                            {/* Additional Options */}
                            <div className="md:col-span-2 flex flex-wrap gap-6">
                                {/* Refund checkbox (only for editing) */}
                                {isEdit && (
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_refund"
                                            checked={formData.is_refund}
                                            onChange={handleInputChange}
                                            className="mr-2 h-4 w-4"
                                        />
                                        <span className="text-sm text-gray-700">{t('payments.markAsRefund')}</span>
                                    </label>
                                )}
                                
                                {/* Advance Payment checkbox (only shown when no invoice is selected) */}
                                {!formData.invoice_id && (
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name="is_advance"
                                            checked={formData.is_advance}
                                            onChange={handleInputChange}
                                            className="mr-2 h-4 w-4"
                                            disabled
                                        />
                                        <span className="text-sm text-gray-700">{t('payments.advancePayment')}</span>
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                        disabled={saving}
                    >
                        {saving ? t('common.saving') : (isEdit ? t('common.update') : t('common.create'))}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PaymentAddEdit;

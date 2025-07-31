import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { invoicesApi, customersApi, productsApi, invoiceItemsApi, ApiError } from '../services/api';
import { logRequest } from '../utils/requestLogger';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

import Select from '../components/ui/Select';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Table from '../components/ui/Table';
import { useToast } from '../components/ui/Toast';
import AdditionalCharges from '../components/invoice/AdditionalCharges';

const InvoiceAddEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { toast } = useToast();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);

    const [formData, setFormData] = useState({
        customer_id: '',
        due_date: '',
        status: 'draft',
        notes: '',
        terms: '',
        shipping_address: null,
        items: [],
        invoice_type: 'sales',
        is_template: false
    });

    const [errors, setErrors] = useState({});
    const [selectedProduct, setSelectedProduct] = useState('');
    const [productQuantity, setProductQuantity] = useState(1);
    const [productDiscount, setProductDiscount] = useState(0);
    const [editingItem, setEditingItem] = useState(null);
    
    // Load customers
    const loadCustomers = useCallback(async () => {
        try {
            const response = await customersApi.getAll(true); // Include inactive customers too
            setCustomers(Array.isArray(response) ? response : response.data || response || []);
        } catch (err) {
            console.error('Error loading customers:', err);
        }
    }, []);
    
    // Handle customer selection change
    const handleCustomerChange = async (e) => {
        const customerId = e.target.value;
        
        // Update customer_id in the form
        handleInputChange(e);
        
        // If a customer is selected, try to get their billing address for shipping
        if (customerId && !isEdit) {
            try {
                const customerResponse = await customersApi.getById(customerId);
                if (customerResponse.billing_address) {
                    setFormData(prev => ({
                        ...prev,
                        shipping_address: customerResponse.billing_address
                    }));
                }
            } catch (err) {
                console.error('Error loading customer details:', err);
                // Non-critical error, so don't show to user
            }
        }
    };

    // Load products
    const loadProducts = useCallback(async () => {
        try {
            const response = await productsApi.getAll();
            setProducts(Array.isArray(response) ? response : response.data || response || []);
        } catch (err) {
            console.error('Error loading products:', err);
        }
    }, []);

    // Load invoice items separately for better debugging
    const loadInvoiceItems = useCallback(async (invoiceId) => {
        try {
            const startTime = Date.now();
            const items = await invoiceItemsApi.getByInvoiceId(invoiceId);

            logRequest({
                endpoint: `/invoice-items/invoice/${invoiceId}`,
                method: 'GET',
                duration: Date.now() - startTime,
                status: 'success',
                responseSize: JSON.stringify(items).length
            });

            console.log('Loaded invoice items:', items);
            return items || [];
        } catch (err) {
            console.error('Error loading invoice items:', err);
            toast.error(t('errors.loadingItems'));
            return [];
        }
    }, [toast, t]);

    // Load invoice data for editing
    const loadInvoice = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const startTime = Date.now();
            const response = await invoicesApi.getById(id);

            logRequest({
                endpoint: `/invoices/${id}`,
                method: 'GET',
                duration: Date.now() - startTime,
                status: 'success',
                responseSize: JSON.stringify(response).length
            });

            console.log('Loaded invoice:', response);

            // Format date strings
            const dueDate = response.due_date ? new Date(response.due_date).toISOString().split('T')[0] : '';

            // Load invoice items separately to ensure they're loaded
            const invoiceItems = response.items && response.items.length > 0
                ? response.items
                : await loadInvoiceItems(id);

            setFormData({
                customer_id: response.customer_id || '',
                due_date: dueDate,
                status: response.status || 'draft',
                notes: response.notes || '',
                terms: response.terms || '',
                shipping_address: response.shipping_details || null,
                subtotal: response.subtotal || 0,
                tax_amount: response.tax_amount || 0,
                total_amount: response.total_amount || 0,
                items: invoiceItems,
                invoice_type: response.invoice_type || 'sales',
                is_template: response.is_template || false,
                // Add invoice number and other read-only fields
                invoice_number: response.invoice_number,
                date: response.date,
                created_at: response.created_at,
                amount_paid: response.amount_paid,
                balance_due: response.balance_due
            });
            
            // After setting the customer ID, load the customer's billing address
            if (response.customer_id) {
                try {
                    const customerResponse = await customersApi.getById(response.customer_id);
                    // If shipping address isn't set but we have billing address, use that
                    if (!response.shipping_details && customerResponse.billing_address) {
                        setFormData(prev => ({
                            ...prev,
                            shipping_address: customerResponse.billing_address
                        }));
                    }
                } catch (customerError) {
                    console.error('Error loading customer details:', customerError);
                    // Non-critical error, so don't show to user or change loading state
                }
            }
        } catch (err) {
            console.error('Error loading invoice:', err);
            setError(err instanceof ApiError ? err.message : t('errors.network'));
            
            logRequest({
                endpoint: `/invoices/${id}`,
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
        loadProducts();
        
        if (isEdit) {
            loadInvoice();
        } else {
            // Set default due date to 15 days from now for new invoices (matches API default)
            const today = new Date();
            const dueDate = new Date();
            dueDate.setDate(today.getDate() + 15);
            
            setFormData(prev => ({
                ...prev,
                due_date: dueDate.toISOString().split('T')[0],
                status: 'draft', // Default status for new invoices
                invoice_type: 'sales', // Default type
                is_template: false // Not a template by default
            }));
        }

        // Close dropdowns when clicking outside
        const handleClickOutside = (event) => {
            const customerDropdown = document.getElementById('customer-dropdown');
            const productDropdown = document.getElementById('product-dropdown');
            
            if (customerDropdown && !event.target.closest('.customer-dropdown-container') && 
                !customerDropdown.classList.contains('hidden')) {
                customerDropdown.classList.add('hidden');
            }
            
            if (productDropdown && !event.target.closest('.product-dropdown-container') && 
                !productDropdown.classList.contains('hidden')) {
                productDropdown.classList.add('hidden');
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isEdit, loadInvoice, loadCustomers, loadProducts]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handleAddItem = () => {
        if (!selectedProduct || productQuantity <= 0) {
            return;
        }

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        // Check if item already exists
        const existingItemIndex = formData.items.findIndex(item => item.product_id === selectedProduct);

        let updatedItems;
        if (existingItemIndex >= 0) {
            // Update existing item quantity
            updatedItems = [...formData.items];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + parseFloat(productQuantity),
                discount: parseFloat(productDiscount) // Update discount if changed
            };
            toast.success(t('invoices.itemQuantityUpdated'));
        } else {
            // Create new item based on API InvoiceItemRequest model
            const newItem = {
                product_id: product.id,
                quantity: parseFloat(productQuantity),
                unit_price: product.price,
                tax_rate: product.tax_rate,
                discount: parseFloat(productDiscount),
                description: product.description || product.name
            };
            updatedItems = [...formData.items, newItem];
            toast.success(t('invoices.itemAdded'));
        }

        setFormData(prev => ({
            ...prev,
            items: updatedItems
        }));

        // Reset form
        setSelectedProduct('');
        setProductQuantity(1);
        setProductDiscount(0);

        // Recalculate totals
        recalculateTotals(updatedItems);
    };

    // Handle editing an item
    const handleEditItem = (item) => {
        // Set the editing item
        setEditingItem(item);

        // Find the product in the products list
        const product = products.find(p => p.id === item.product_id);

        // Set the form values
        setSelectedProduct(item.product_id);
        setProductQuantity(item.quantity);
        setProductDiscount(item.discount || 0);

        // Scroll to the product selection area
        document.getElementById('product-selection')?.scrollIntoView({ behavior: 'smooth' });
    };

    // Handle updating an item
    const handleUpdateItem = async () => {
        if (!editingItem || !selectedProduct || productQuantity <= 0) {
            return;
        }

        try {
            if (isEdit && editingItem.id) {
                // Update existing item via API
                const updatedData = {
                    quantity: parseFloat(productQuantity),
                    discount: parseFloat(productDiscount)
                };

                const updatedItem = await invoiceItemsApi.update(editingItem.id, updatedData);

                // Update the items in the form
                setFormData(prev => ({
                    ...prev,
                    items: prev.items.map(item =>
                        item.id === editingItem.id ? updatedItem : item
                    )
                }));

                toast.success(t('invoices.itemUpdated'));
            } else {
                // Update item in local state (for new invoices)
                setFormData(prev => ({
                    ...prev,
                    items: prev.items.map(item =>
                        item === editingItem
                            ? { ...item, quantity: parseFloat(productQuantity), discount: parseFloat(productDiscount) }
                            : item
                    )
                }));

                toast.success(t('invoices.itemUpdated'));
            }

            // Reset editing state
            handleCancelEdit();

            // Recalculate totals
            const updatedItems = formData.items.map(item =>
                item === editingItem || item.id === editingItem.id
                    ? { ...item, quantity: parseFloat(productQuantity), discount: parseFloat(productDiscount) }
                    : item
            );
            recalculateTotals(updatedItems);

        } catch (err) {
            console.error('Error updating invoice item:', err);
            toast.error(err instanceof ApiError ? err.message : t('errors.network'));
        }
    };

    // Handle canceling edit
    const handleCancelEdit = () => {
        setEditingItem(null);
        setSelectedProduct('');
        setProductQuantity(1);
        setProductDiscount(0);
    };

    // Add individual invoice item (for existing invoices)
    const handleAddInvoiceItem = async () => {
        if (!isEdit || !selectedProduct || productQuantity <= 0) {
            return;
        }

        const product = products.find(p => p.id === selectedProduct);
        if (!product) return;

        try {
            // Check if item already exists
            const existingItem = formData.items.find(item => item.product_id === selectedProduct);

            if (existingItem && existingItem.id) {
                // Update existing item
                const updatedData = {
                    quantity: existingItem.quantity + parseFloat(productQuantity),
                    discount: parseFloat(productDiscount)
                };

                const updatedItem = await invoiceItemsApi.update(existingItem.id, updatedData);

                // Update the items in the form
                setFormData(prev => ({
                    ...prev,
                    items: prev.items.map(item =>
                        item.id === existingItem.id ? updatedItem : item
                    )
                }));

                toast.success(t('invoices.itemQuantityUpdated'));
            } else {
                // Create new item
                const itemData = {
                    invoice_id: id,
                    product_id: product.id,
                    quantity: parseFloat(productQuantity),
                    unit_price: product.price,
                    tax_rate: product.tax_rate,
                    discount: parseFloat(productDiscount),
                    description: product.description || product.name
                };

                const newItem = await invoiceItemsApi.create(itemData);

                // Update the items in the form
                setFormData(prev => ({
                    ...prev,
                    items: [...prev.items, newItem]
                }));

                toast.success(t('invoices.itemAdded'));
            }

            // Reset form
            setSelectedProduct('');
            setProductQuantity(1);
            setProductDiscount(0);

            // Recalculate totals
            const updatedItems = existingItem && existingItem.id
                ? formData.items.map(item =>
                    item.id === existingItem.id
                        ? { ...item, quantity: item.quantity + parseFloat(productQuantity) }
                        : item
                  )
                : [...formData.items, { product_id: selectedProduct, quantity: parseFloat(productQuantity) }];

            recalculateTotals(updatedItems);
        } catch (err) {
            console.error('Error adding invoice item:', err);
            toast.error(err instanceof ApiError ? err.message : t('errors.network'));
        }
    };

    // Update individual invoice item
    const handleUpdateInvoiceItem = async (itemId, updatedData) => {
        if (!isEdit) return;

        try {
            const updatedItem = await invoiceItemsApi.update(itemId, updatedData);

            // Update the items in the form
            setFormData(prev => ({
                ...prev,
                items: prev.items.map(item =>
                    item.id === itemId ? updatedItem : item
                )
            }));

            // Recalculate totals
            const updatedItems = formData.items.map(item =>
                item.id === itemId ? updatedItem : item
            );
            recalculateTotals(updatedItems);

            toast.success(t('invoices.itemUpdated'));
        } catch (err) {
            console.error('Error updating invoice item:', err);
            toast.error(err instanceof ApiError ? err.message : t('errors.network'));
        }
    };

    const handleRemoveItem = (index) => {
        const newItems = [...formData.items];
        newItems.splice(index, 1);
        
        setFormData(prev => ({
            ...prev,
            items: newItems
        }));

        // Recalculate totals
        recalculateTotals(newItems);
    };

    // Define table columns for invoice items
    const itemsTableColumns = [
        {
            key: 'product_name',
            title: t('products.name'),
            render: (value, item) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {value || item.description || 'Unknown Product'}
                    </div>
                    <div className="text-sm text-gray-500">
                        {item.description && value !== item.description ? item.description : ''}
                    </div>
                </div>
            )
        },
        {
            key: 'quantity',
            title: t('invoices.quantity'),
            render: (value) => (
                <span className="font-medium">{parseFloat(value) || 0}</span>
            )
        },
        {
            key: 'unit_price',
            title: t('products.price'),
            render: (value) => (
                <span className="font-medium text-green-600">
                    ₹{parseFloat(value).toFixed(2)}
                </span>
            )
        },
        {
            key: 'discount',
            title: t('invoices.discount'),
            render: (value) => (
                <span className="text-orange-600">
                    {parseFloat(value) || 0}%
                </span>
            )
        },
        {
            key: 'tax_rate',
            title: t('products.tax'),
            render: (value) => (
                <span className="text-blue-600">
                    {parseFloat(value) || 0}%
                </span>
            )
        },
        {
            key: 'amount',
            title: t('invoices.total'),
            render: (value, item) => {
                const quantity = parseFloat(item.quantity) || 0;
                const unitPrice = parseFloat(item.unit_price) || 0;
                const discount = parseFloat(item.discount) || 0;
                const taxRate = parseFloat(item.tax_rate) || 0;

                const lineTotal = quantity * unitPrice * (1 - discount / 100);
                const lineTax = lineTotal * (taxRate / 100);
                const totalWithTax = lineTotal + lineTax;

                return (
                    <div className="text-right">
                        <div className="font-bold text-gray-900">
                            ₹{totalWithTax.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                            +₹{lineTax.toFixed(2)} tax
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'actions',
            title: t('common.actions'),
            sortable: false,
            render: (_, item, index) => (
                <div className="flex items-center space-x-2">
                    {isEdit && item.id ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </Button>
                    ) : null}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </Button>
                </div>
            )
        }
    ];

    const recalculateTotals = (items) => {
        let subtotal = 0;
        let taxAmount = 0;
        
        items.forEach(item => {
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            const discount = parseFloat(item.discount) || 0;
            const taxRate = parseFloat(item.tax_rate) || 0;
            
            const lineTotal = quantity * unitPrice * (1 - discount / 100);
            const lineTax = lineTotal * (taxRate / 100);
            
            subtotal += lineTotal;
            taxAmount += lineTax;
            
            // Calculate and add amount property to each item as it's expected in the response
            item.amount = lineTotal + lineTax;
        });
        
        const totalAmount = subtotal + taxAmount;
        
        setFormData(prev => ({
            ...prev,
            subtotal,
            tax_amount: taxAmount,
            total_amount: totalAmount
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.customer_id) {
            newErrors.customer_id = t('errors.required');
        }
        if (!formData.due_date) {
            newErrors.due_date = t('errors.required');
        }
        if (!formData.items || formData.items.length === 0) {
            newErrors.items = t('invoices.errorNoItems');
        } else {
            // Validate each item
            const itemErrors = formData.items.some(item => {
                return !item.product_id || 
                       !item.quantity || 
                       item.quantity <= 0 || 
                       !item.unit_price || 
                       item.unit_price < 0;
            });
            
            if (itemErrors) {
                newErrors.items = t('invoices.errorInvalidItems');
            }
        }
        
        // Check if totals are calculated
        if (formData.subtotal === undefined || formData.tax_amount === undefined || formData.total_amount === undefined) {
            newErrors.totals = t('invoices.errorInvalidTotals');
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
            // Create a copy of items with properly formatted data for the API
            const formattedItems = formData.items.map(item => ({
                product_id: item.product_id,
                quantity: parseFloat(item.quantity),
                unit_price: parseFloat(item.unit_price),
                tax_rate: parseFloat(item.tax_rate),
                discount: parseFloat(item.discount) || 0,
                description: item.description
            }));

            // Prepare the invoice data according to the API model requirements
            const invoiceData = {
                ...formData,
                items: formattedItems,
                subtotal: parseFloat(formData.subtotal) || 0,
                tax_amount: parseFloat(formData.tax_amount) || 0,
                total_amount: parseFloat(formData.total_amount) || 0,
                // Ensure shipping_address is a valid JSON string or null
                shipping_address: formData.shipping_address && Object.keys(formData.shipping_address).length > 0 
                    ? JSON.stringify(formData.shipping_address) 
                    : null
            };

            // Remove any fields that shouldn't be sent to the API
            if (!isEdit) {
                // For create request, ensure we don't send unnecessary fields
                delete invoiceData.id;
                delete invoiceData.invoice_number;
                delete invoiceData.created_at;
                delete invoiceData.balance_due;
                delete invoiceData.amount_paid;
            }

            const startTime = Date.now();
            let response;

            if (isEdit) {
                console.log(invoiceData);
                
                response = await invoicesApi.update(id, invoiceData);
                logRequest({
                    endpoint: `/invoices/${id}`,
                    method: 'PUT',
                    duration: Date.now() - startTime,
                    status: 'success',
                    responseSize: JSON.stringify(response).length
                });
            } else {
                response = await invoicesApi.create(invoiceData);
                logRequest({
                    endpoint: '/invoices',
                    method: 'POST',
                    duration: Date.now() - startTime,
                    status: 'success',
                    responseSize: JSON.stringify(response).length
                });
            }

            toast.success(
                isEdit
                    ? t('invoices.updateSuccess')
                    : t('invoices.createSuccess')
            );
            navigate('/invoices');
        } catch (err) {
            console.error('Error saving invoice:', err);
            setError(err instanceof ApiError ? err.message : t('errors.network'));

            logRequest({
                endpoint: isEdit ? `/invoices/${id}` : '/invoices',
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="xl" />
                <span className="ml-3 text-gray-600">{t('common.loading')}</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? t('invoices.edit') : t('invoices.create')}
                </h1>
                <Button
                    variant="ghost"
                    onClick={() => navigate('/invoices')}
                >
                    {t('common.cancel')}
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <Alert
                    type="error"
                    title={t('common.error')}
                    onClose={() => setError(null)}
                >
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <Card.Header>
                        <Card.Title>{t('invoices.details')}</Card.Title>
                    </Card.Header>
                    <Card.Content>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Customer - Searchable Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('invoices.customer')}*
                                </label>
                                <div className="relative customer-dropdown-container">
                                    <input
                                        type="text"
                                        placeholder={t('common.searchAndSelect')}
                                        className={`w-full border ${errors.customer_id ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2 pr-10`}
                                        value={formData.customer_id ? customers.find(c => c.id === formData.customer_id)?.name || '' : ''}
                                        onClick={() => document.getElementById('customer-dropdown').classList.toggle('hidden')}
                                        onChange={async (e) => {
                                            const searchTerm = e.target.value.toLowerCase();
                                            if (searchTerm === '') {
                                                loadCustomers(); // Reset to all customers
                                            } else if (searchTerm.length > 2) {
                                                // Search API if at least 3 characters
                                                try {
                                                    const result = await customersApi.search(searchTerm);
                                                    setCustomers(result || []);
                                                } catch (err) {
                                                    console.error('Error searching customers:', err);
                                                    // Fallback to client-side filtering
                                                    const filteredCustomers = customers.filter(c => 
                                                        c.name.toLowerCase().includes(searchTerm) ||
                                                        (c.email && c.email.toLowerCase().includes(searchTerm)) ||
                                                        (c.phone && c.phone.toLowerCase().includes(searchTerm))
                                                    );
                                                    setCustomers(filteredCustomers.length > 0 ? filteredCustomers : customers);
                                                }
                                            } else {
                                                // For 1-2 characters, do client-side filtering
                                                const filteredCustomers = customers.filter(c => 
                                                    c.name.toLowerCase().includes(searchTerm) ||
                                                    (c.email && c.email.toLowerCase().includes(searchTerm)) ||
                                                    (c.phone && c.phone.toLowerCase().includes(searchTerm))
                                                );
                                                setCustomers(filteredCustomers.length > 0 ? filteredCustomers : customers);
                                            }
                                        }}
                                        disabled={isEdit}
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </div>
                                    <div 
                                        id="customer-dropdown" 
                                        className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                                    >
                                        <div className="p-2 border-b sticky top-0 bg-white">
                                            <input 
                                                type="text" 
                                                className="w-full border border-gray-300 rounded px-2 py-1" 
                                                placeholder={t('common.search')}
                                                onClick={(e) => e.stopPropagation()}
                                                onChange={async (e) => {
                                                    const searchTerm = e.target.value.toLowerCase();
                                                    if (searchTerm === '') {
                                                        loadCustomers(); // Reset to all customers
                                                    } else if (searchTerm.length > 2) {
                                                        // Search API if at least 3 characters
                                                        try {
                                                            const result = await customersApi.search(searchTerm);
                                                            setCustomers(result || []);
                                                        } catch (err) {
                                                            console.error('Error searching customers:', err);
                                                            // Fallback to client-side filtering
                                                            const filteredCustomers = customers.filter(c => 
                                                                c.name.toLowerCase().includes(searchTerm) ||
                                                                (c.email && c.email.toLowerCase().includes(searchTerm)) ||
                                                                (c.phone && c.phone.toLowerCase().includes(searchTerm))
                                                            );
                                                            setCustomers(filteredCustomers.length > 0 ? filteredCustomers : []);
                                                        }
                                                    } else {
                                                        // For 1-2 characters, do client-side filtering
                                                        const filteredCustomers = customers.filter(c => 
                                                            c.name.toLowerCase().includes(searchTerm) ||
                                                            (c.email && c.email.toLowerCase().includes(searchTerm)) ||
                                                            (c.phone && c.phone.toLowerCase().includes(searchTerm))
                                                        );
                                                        setCustomers(filteredCustomers.length > 0 ? filteredCustomers : []);
                                                    }
                                                }}
                                            />
                                        </div>
                                        <ul>
                                            {customers.map(customer => (
                                                <li 
                                                    key={customer.id} 
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            customer_id: customer.id
                                                        }));
                                                        document.getElementById('customer-dropdown').classList.add('hidden');
                                                        // Clear error when selected
                                                        if (errors.customer_id) {
                                                            setErrors(prev => ({
                                                                ...prev,
                                                                customer_id: null
                                                            }));
                                                        }
                                                    }}
                                                >
                                                    <div className="font-medium">{customer.name}</div>
                                                    {customer.email && <div className="text-xs text-gray-500">{customer.email}</div>}
                                                    {customer.phone && <div className="text-xs text-gray-500">{customer.phone}</div>}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                {errors.customer_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.customer_id}</p>
                                )}
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('invoices.dueDate')}*
                                </label>
                                <input
                                    type="date"
                                    name="due_date"
                                    value={formData.due_date}
                                    onChange={handleInputChange}
                                    className={`w-full border ${errors.due_date ? 'border-red-500' : 'border-gray-300'} rounded-lg px-3 py-2`}
                                />
                                {errors.due_date && (
                                    <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
                                )}
                            </div>

                            {/* Status (editable only for existing invoices) */}
                            {isEdit && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('invoices.status')}
                                    </label>
                                    <Select
                                        value={formData.status}
                                        onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                                        options={[
                                            { value: 'draft', label: t('invoices.statusDraft') },
                                            { value: 'sent', label: t('invoices.statusSent') },
                                            { value: 'paid', label: t('invoices.statusPaid') },
                                            { value: 'partially_paid', label: t('invoices.statusPartiallyPaid') },
                                            { value: 'overdue', label: t('invoices.statusOverdue') },
                                            { value: 'cancelled', label: t('invoices.statusCancelled') }
                                        ]}
                                    />
                                </div>
                            )}
                            
                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('invoices.notes')}
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder={t('invoices.notesPlaceholder')}
                                />
                            </div>
                            
                            {/* Terms */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {t('invoices.terms')}
                                </label>
                                <textarea
                                    name="terms"
                                    value={formData.terms}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder={t('invoices.termsPlaceholder')}
                                />
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                {/* Invoice Items */}
                <Card id="product-selection">
                    <Card.Header>
                        <Card.Title>{editingItem ? t('invoices.editItem') : t('invoices.items')}</Card.Title>
                    </Card.Header>
                    <Card.Content>

                        {/* Add Item Form */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('invoices.product')}
                                    </label>
                                    <div className="relative product-dropdown-container">
                                        <input
                                            type="text"
                                            placeholder={t('common.searchAndSelect')}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10"
                                            value={selectedProduct ? products.find(p => p.id === selectedProduct)?.name || '' : ''}
                                            onClick={() => document.getElementById('product-dropdown').classList.toggle('hidden')}
                                            onChange={async (e) => {
                                                const searchTerm = e.target.value.toLowerCase();
                                                if (searchTerm === '') {
                                                    loadProducts(); // Reset to all products
                                                } else if (searchTerm.length > 2) {
                                                    // Search API if at least 3 characters
                                                    try {
                                                        const result = await productsApi.search(searchTerm);
                                                        if (Array.isArray(result) && result.length > 0) {
                                                            setProducts(result);
                                                        } else {
                                                            // Fallback to client-side filtering if API returns empty
                                                            const filteredProducts = products.filter(p => 
                                                                p.name.toLowerCase().includes(searchTerm) ||
                                                                (p.description && p.description.toLowerCase().includes(searchTerm))
                                                            );
                                                            setProducts(filteredProducts.length > 0 ? filteredProducts : products);
                                                        }
                                                    } catch (err) {
                                                        console.error('Error searching products:', err);
                                                        // Fallback to client-side filtering
                                                        const filteredProducts = products.filter(p => 
                                                            p.name.toLowerCase().includes(searchTerm) ||
                                                            (p.description && p.description.toLowerCase().includes(searchTerm))
                                                        );
                                                        setProducts(filteredProducts.length > 0 ? filteredProducts : products);
                                                    }
                                                } else {
                                                    // For 1-2 characters, do client-side filtering
                                                    const filteredProducts = products.filter(p => 
                                                        p.name.toLowerCase().includes(searchTerm) ||
                                                        (p.description && p.description.toLowerCase().includes(searchTerm))
                                                    );
                                                    setProducts(filteredProducts.length > 0 ? filteredProducts : products);
                                                }
                                            }}
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                            </svg>
                                        </div>
                                        <div 
                                            id="product-dropdown" 
                                            className="hidden absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                                        >
                                            <div className="p-2 border-b sticky top-0 bg-white">
                                                <input 
                                                    type="text" 
                                                    className="w-full border border-gray-300 rounded px-2 py-1" 
                                                    placeholder={t('common.search')}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={async (e) => {
                                                        const searchTerm = e.target.value.toLowerCase();
                                                        if (searchTerm === '') {
                                                            loadProducts(); // Reset to all products
                                                        } else if (searchTerm.length > 2) {
                                                            // Search API if at least 3 characters
                                                            try {
                                                                const result = await productsApi.search(searchTerm);
                                                                if (Array.isArray(result) && result.length > 0) {
                                                                    setProducts(result);
                                                                } else {
                                                                    // Fallback to client-side filtering
                                                                    const filteredProducts = products.filter(p => 
                                                                        p.name.toLowerCase().includes(searchTerm) ||
                                                                        (p.description && p.description.toLowerCase().includes(searchTerm))
                                                                    );
                                                                    setProducts(filteredProducts.length > 0 ? filteredProducts : []);
                                                                }
                                                            } catch (err) {
                                                                console.error('Error searching products:', err);
                                                                // Fallback to client-side filtering
                                                                const filteredProducts = products.filter(p => 
                                                                    p.name.toLowerCase().includes(searchTerm) ||
                                                                    (p.description && p.description.toLowerCase().includes(searchTerm))
                                                                );
                                                                setProducts(filteredProducts.length > 0 ? filteredProducts : []);
                                                            }
                                                        } else {
                                                            // For 1-2 characters, do client-side filtering
                                                            const filteredProducts = products.filter(p => 
                                                                p.name.toLowerCase().includes(searchTerm) ||
                                                                (p.description && p.description.toLowerCase().includes(searchTerm))
                                                            );
                                                            setProducts(filteredProducts.length > 0 ? filteredProducts : []);
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <ul>
                                                {products.map(product => (
                                                    <li 
                                                        key={product.id} 
                                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedProduct(product.id);
                                                            document.getElementById('product-dropdown').classList.add('hidden');
                                                        }}
                                                    >
                                                        <div className="font-medium">{product.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {formatAmount(product.price)} | {t('products.tax')}: {product.tax_rate}%
                                                        </div>
                                                        {product.description && (
                                                            <div className="text-xs text-gray-500">{product.description}</div>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('invoices.quantity')}
                                    </label>
                                    <input
                                        type="number"
                                        value={productQuantity}
                                        onChange={(e) => setProductQuantity(e.target.value)}
                                        min="0.01"
                                        step="0.01"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {t('invoices.discount')} (%)
                                    </label>
                                    <input
                                        type="number"
                                        value={productDiscount}
                                        onChange={(e) => setProductDiscount(e.target.value)}
                                        min="0"
                                        max="100"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    />
                                </div>
                                
                                <div className="md:col-span-4">
                                    <Button
                                        type="button"
                                        onClick={editingItem ? handleUpdateItem : (isEdit ? handleAddInvoiceItem : handleAddItem)}
                                        disabled={!selectedProduct || productQuantity <= 0}
                                        className="w-full md:w-auto"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={editingItem ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 6v6m0 0v6m0-6h6m-6 0H6"} />
                                        </svg>
                                        {editingItem ? t('common.update') : t('invoices.addItem')}
                                    </Button>
                                    {editingItem && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            onClick={handleCancelEdit}
                                            className="w-full md:w-auto ml-2"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Items List */}
                        <div className="mt-6">
                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                {t('invoices.items')} ({formData.items.length})
                            </h4>

                            <Table
                                columns={itemsTableColumns}
                                data={formData.items}
                                loading={false}
                                className="animate-fade-in"
                            />

                            {formData.items.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <div className="text-6xl mb-4 opacity-50">📋</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {t('invoices.noItems')}
                                    </h3>
                                    <p className="text-gray-500">
                                        Add products to this invoice using the form above.
                                    </p>
                                    {errors.items && (
                                        <p className="text-red-600 mt-2">{errors.items}</p>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        {/* Totals */}
                        <div className="mt-6 border-t pt-4">
                            <div className="flex justify-end">
                                <div className="w-64 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('invoices.subtotal')}</span>
                                        <span className="font-medium">{formatAmount(formData.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">{t('invoices.tax')}</span>
                                        <span className="font-medium">{formatAmount(formData.tax_amount)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="font-medium text-gray-700">{t('invoices.total')}</span>
                                        <span className="font-bold text-blue-600">{formatAmount(formData.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card.Content>
                </Card>

                {/* Additional Charges */}
                {isEdit && formData.id && (
                    <AdditionalCharges
                        invoiceId={formData.id}
                        onChargesUpdate={() => {
                            // Update totals when charges change
                            recalculateTotals();
                        }}
                    />
                )}

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/invoices')}
                        type="button"
                    >
                        {t('common.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        loading={saving}
                        disabled={saving}
                        size="lg"
                    >
                        {isEdit ? t('common.update') : t('common.create')}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default InvoiceAddEdit;

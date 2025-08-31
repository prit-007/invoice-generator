import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { productsApi, ApiError } from '../services/api';
import { logRequest } from '../utils/requestLogger';
import { Link } from 'react-router-dom';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

import Pagination from '../components/ui/Pagination';
import Card from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';

const ProductsPage = () => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showInactive, setShowInactive] = useState(false);

    // Load products
    const loadProducts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const startTime = Date.now();
            const response = await productsApi.getAll(showInactive);
            
            logRequest({
                endpoint: '/products',
                method: 'GET',
                duration: Date.now() - startTime,
                status: 'success',
                responseSize: JSON.stringify(response).length
            });

            setProducts(Array.isArray(response) ? response : response.data || response || []);
        } catch (err) {
            console.error('Error loading products:', err);
            setError(err instanceof ApiError ? err.message : t('errors.network'));

            logRequest({
                endpoint: '/products',
                method: 'GET',
                duration: Date.now() - Date.now(),
                status: 'error',
                error: err.message
            });
        } finally {
            setLoading(false);
        }
    }, [showInactive, t]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    // Filter and sort products
    const filteredProducts = products
        .filter(product => {
            if (!searchTerm.trim()) return true;
            
            const nameMatch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const descriptionMatch = product.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const categoryMatch = product.category?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            
            return nameMatch || descriptionMatch || categoryMatch;
        })
        .sort((a, b) => {
            const aValue = a[sortBy] || '';
            const bValue = b[sortBy] || '';

            if (sortOrder === 'asc') {
                return aValue.toString().localeCompare(bValue.toString());
            } else {
                return bValue.toString().localeCompare(aValue.toString());
            }
        });

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);




    const handleDelete = async (productId) => {
        if (!window.confirm(t('products.deleteConfirm'))) return;

        try {
            await productsApi.delete(productId);
            toast.success(t('products.deleteSuccess'));
            await loadProducts();
        } catch (err) {
            console.error('Error deleting product:', err);
            const errorMessage = err instanceof ApiError ? err.message : t('errors.network');
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(price);
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // Define table columns
    const columns = [
        {
            key: 'name',
            title: t('products.name'),
            render: (value, row) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {value.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{value}</div>
                        <div className="text-sm text-gray-500">{row.sku}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'category',
            title: t('products.category'),
            render: (value) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {value || 'Uncategorized'}
                </span>
            )
        },
        {
            key: 'price',
            title: t('products.price'),
            render: (value) => (
                <span className="font-semibold text-green-600">{formatPrice(value)}</span>
            )
        },
        {
            key: 'stock_quantity',
            title: t('products.stock'),
            render: (value) => (
                <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        value > 10 ? 'bg-green-100 text-green-800' :
                        value > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {value} units
                    </span>
                </div>
            )
        },

        {
            key: 'actions',
            title: t('common.actions'),
            sortable: false,
            render: (_, row) => (
                <div className="flex items-center space-x-2">
                    <Link
                        to={`/products/edit/${row.id}`}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                    <button
                        onClick={() => handleDelete(row.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t('products.title')}
                    </h1>
                    <p className="text-gray-600 mt-1">Manage your product inventory</p>
                </div>
                <Link to="/products/add">
                    <Button size="lg" className="shadow-lg hover:shadow-xl">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        {t('products.add')}
                    </Button>
                </Link>
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

            {/* Search and Filter */}
            <Card className="animate-slide-up">
                <Card.Content>
                    <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                        <div className="flex-1 max-w-md">
                            <Input
                                placeholder={t('products.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                }
                                className="w-full"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

                            <Button
                                variant="ghost"
                                onClick={loadProducts}
                                className="hover:bg-blue-50 hover:text-blue-600"
                                title={t('common.refresh')}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </Button>
                        </div>
                    </div>
                </Card.Content>
            </Card>

            {/* Products Table */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <Table
                    columns={columns}
                    data={paginatedProducts}
                    loading={loading}
                    onRowClick={(product) => window.location.href = `/products/edit/${product.id}`}
                    className="hover-lift"
                />
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredProducts.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default ProductsPage;

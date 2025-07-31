import React, { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext';
import { customersApi, ApiError } from '../services/api';
import { logRequest } from '../utils/requestLogger';
import Table from '../components/ui/Table';
import { useToast } from '../components/ui/Toast';
function CustomersPage() {
    const { t } = useLanguage();
    const [customers, setCustomers] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Load customers
    const loadCustomers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const startTime = Date.now();
            const response = await customersApi.getAll(showInactive);

            logRequest({
                endpoint: '/customers',
                method: 'GET',
                duration: Date.now() - startTime,
                status: 'success',
                responseSize: JSON.stringify(response).length
            });

            setCustomers(Array.isArray(response) ? response : response.data || response || []);

        } catch (err) {
            console.error('Error loading customers:', err);
            setError(err instanceof ApiError ? err.message : t('errors.network'));

            logRequest({
                endpoint: '/customers',
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
        loadCustomers();
    }, [loadCustomers]);
    const filteredCustomers = customers
        .filter(customer => {
            if (!searchTerm.trim()) return true;

            const nameMatch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const emailMatch = customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
            const phoneMatch = customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || false;

            return nameMatch || emailMatch || phoneMatch;
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
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredCustomers.slice(startIndex, startIndex + itemsPerPage);


    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleDelete = async (customerId) => {
        if (!window.confirm(t('customers.deleteConfirm'))) return;

        try {
            await customersApi.delete(customerId);
            await loadCustomers();
        } catch (err) {
            console.error('Error deleting customer:', err);
            setError(err instanceof ApiError ? err.message : t('errors.network'));
        }
    };
    const SortIcon = ({ field }) => {
        if (sortBy !== field) return <span className="text-gray-400">↕</span>;
        return sortOrder === 'asc' ? <span className="text-blue-600">↑</span> : <span className="text-blue-600">↓</span>;
    };
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">{t('customers.title')}</h1>
                <button
                    onClick={() => window.location.href = '/customers/add'}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    {t('customers.add')}
                </button>
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
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={t('customers.search')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={loadCustomers}
                            className="p-2 text-gray-500 hover:text-gray-700"
                            title={t('common.refresh')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Customers Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('name')}
                                >
                                    <div className="flex items-center">
                                        {t('customers.name')}
                                        <SortIcon field="name" />
                                    </div>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('customers.email')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('customers.phone')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('customers.address')}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {t('common.actions')}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('customers.noCustomers')}</h3>
                                        <p className="mt-1 text-sm text-gray-500">{t('customers.noCustomersDesc')}</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{customer.name}</div>
                                            <div className="text-sm text-gray-500">{customer.company}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{customer.email || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{customer.phone || '-'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 max-w-xs truncate">
                                                {customer.billing_address ? (
                                                    <span>
                                                        {customer.billing_address.address}<br/>
                                                        {customer.billing_address.city && <>{customer.billing_address.city}, </>}
                                                        {customer.billing_address.state && <>{customer.billing_address.state}, </>}
                                                        {customer.billing_address.country && <>{customer.billing_address.country}, </>}
                                                        {customer.billing_address.pincode && <>PIN: {customer.billing_address.pincode}</>}
                                                    </span>
                                                ) : (
                                                    customer.address || '-'
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => window.location.href = `/customers/edit/${customer.id}`}
                                                className="text-blue-600 hover:text-blue-900 mr-3"
                                            >
                                                {t('common.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                {t('common.delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg shadow">
                    <div className="flex items-center text-sm text-gray-500">
                        {t('common.showing')} {startIndex + 1} {t('common.to')} {Math.min(startIndex + itemsPerPage, filteredCustomers.length)} {t('common.of')} {filteredCustomers.length} {t('common.results')}
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            {t('common.previous')}
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 rounded text-sm ${currentPage === page ? 'bg-blue-600 text-white' : 'border border-gray-300 hover:bg-gray-50'}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            {t('common.next')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default CustomersPage
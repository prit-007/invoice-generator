const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1969';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: 'Network error occurred' };
    }
    
    throw new ApiError(
      errorData.message || `HTTP Error ${response.status}`,
      response.status,
      errorData
    );
  }
  
  return response.json();
};

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0, { originalError: error });
  }
};

// Products API
export const productsApi = {
  // Get all active products
  getAll: (includeInactive = false) => {
    const endpoint = includeInactive ? '/products/all' : '/products';
    return apiRequest(endpoint);
  },
  
  // Search products by name, description, or category
  search: (query) => {
    return apiRequest(`/products?search=${encodeURIComponent(query)}`);
  },

  // Get product by ID
  getById: (id) => apiRequest(`/products/${id}`),

  // Create new product
  create: (productData) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  }),

  // Update product
  update: (id, productData) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData),
  }),

  // Delete product (soft delete)
  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE',
  }),
};

// Customers API
export const customersApi = {
  // Get all active customers
  getAll: (includeInactive = false) => {
    const endpoint = includeInactive ? '/customers/all' : '/customers';
    return apiRequest(endpoint);
  },
  
  // Search customers by name, email, phone, or company
  search: (query) => {
    return apiRequest(`/customers?search=${encodeURIComponent(query)}`);
  },

  // Get customer by ID
  getById: (id) => apiRequest(`/customers/${id}`),

  // Create new customer
  create: (customerData) => apiRequest('/customers', {
    method: 'POST',
    body: JSON.stringify(customerData),
  }),

  // Update customer
  update: (id, customerData) => apiRequest(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(customerData),
  }),

  // Delete customer (soft delete)
  delete: (id) => apiRequest(`/customers/${id}`, {
    method: 'DELETE',
  }),
};

// Invoices API
export const invoicesApi = {
  // Get all invoices
  getAll: () => apiRequest('/invoices'),

  // Get invoice by ID
  getById: (id) => apiRequest(`/invoices/${id}`),

  // Create new invoice
  create: (invoiceData) => apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(invoiceData),
  }),

  // Update invoice
  update: (id, invoiceData) => apiRequest(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoiceData),
  }),

  // Cancel invoice
  cancel: (id, reason) => apiRequest(`/invoices/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
};

// Invoice Items API
export const invoiceItemsApi = {
  // Get all items for an invoice
  getByInvoiceId: (invoiceId) => apiRequest(`/invoice-items/invoice/${invoiceId}`),

  // Get invoice item by ID
  getById: (id) => apiRequest(`/invoice-items/${id}`),

  // Create new invoice item
  create: (itemData) => apiRequest('/invoice-items', {
    method: 'POST',
    body: JSON.stringify(itemData),
  }),

  // Update invoice item
  update: (id, itemData) => apiRequest(`/invoice-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(itemData),
  }),
};

// Payments API
export const paymentsApi = {
  // Get all payments
  getAll: () => apiRequest('/payments'),

  // Get payment by ID
  getById: (id) => apiRequest(`/payments/${id}`),

  // Create new payment
  create: (paymentData) => apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(paymentData),
  }),

  // Update payment
  update: (id, paymentData) => apiRequest(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(paymentData),
  }),

  // Refund payment
  refund: (id, reason) => apiRequest(`/payments/${id}/refund`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  }),
};

// Export ApiError for use in components
export { ApiError };

const apiService = {
  products: productsApi,
  customers: customersApi,
  invoices: invoicesApi,
  payments: paymentsApi,
};
export default apiService;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import ProductsPage from './pages/ProductsPage';
import ProductAddEdit from './pages/ProductAddEdit';
import './i18n'; // Initialize i18n
import './App.css';
import CustomersPage from './pages/CustomersPage';
import CustomerAddEdit from './pages/CustomerAddEdit';
import InvoicesPage from './pages/InvoicesPage';
import InvoiceAddEdit from './pages/InvoiceAddEdit';
import InvoicePreview from './pages/InvoicePreview';
import PaymentsPage from './pages/PaymentsPage';
import PaymentAddEdit from './pages/PaymentAddEdit';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/add" element={<ProductAddEdit />} />
                <Route path="/products/edit/:id" element={<ProductAddEdit />} />
                <Route path="/customers" element={<CustomersPage />} />
                <Route path="/customers/add" element={<CustomerAddEdit />} />
                <Route path="/customers/edit/:id" element={<CustomerAddEdit />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/invoices/add" element={<InvoiceAddEdit />} />
                <Route path="/invoices/edit/:id" element={<InvoiceAddEdit />} />
                <Route path="/invoices/preview/:id" element={<InvoicePreview />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/payments/add" element={<PaymentAddEdit />} />
                <Route path="/payments/edit/:id" element={<PaymentAddEdit />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
              </Layout>
            </div>
          </Router>
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;

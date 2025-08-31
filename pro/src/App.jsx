import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './layouts/Layout';
import LandingPage from './pages/LandingPage';
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
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                <Route path="/products" element={<Layout><ProductsPage /></Layout>} />
                <Route path="/products/add" element={<Layout><ProductAddEdit /></Layout>} />
                <Route path="/products/edit/:id" element={<Layout><ProductAddEdit /></Layout>} />
                <Route path="/customers" element={<Layout><CustomersPage /></Layout>} />
                <Route path="/customers/add" element={<Layout><CustomerAddEdit /></Layout>} />
                <Route path="/customers/edit/:id" element={<Layout><CustomerAddEdit /></Layout>} />
                <Route path="/invoices" element={<Layout><InvoicesPage /></Layout>} />
                <Route path="/invoices/add" element={<Layout><InvoiceAddEdit /></Layout>} />
                <Route path="/invoices/edit/:id" element={<Layout><InvoiceAddEdit /></Layout>} />
                <Route path="/invoices/preview/:id" element={<Layout><InvoicePreview /></Layout>} />
                <Route path="/payments" element={<Layout><PaymentsPage /></Layout>} />
                <Route path="/payments/add" element={<Layout><PaymentAddEdit /></Layout>} />
                <Route path="/payments/edit/:id" element={<Layout><PaymentAddEdit /></Layout>} />
                <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const AdditionalCharges = ({ invoiceId, onChargesUpdate }) => {
  const { t } = useLanguage();
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCharge, setNewCharge] = useState({
    charge_name: '',
    charge_amount: '',
    is_taxable: false,
    tax_rate: '18'
  });

  // Load existing charges
  const loadCharges = async () => {
    if (!invoiceId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:1969/additional-charges/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to load additional charges');
      }
      const data = await response.json();
      setCharges(data);
      
      // Notify parent component
      if (onChargesUpdate) {
        onChargesUpdate(data);
      }
    } catch (err) {
      console.error('Error loading charges:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add new charge
  const handleAddCharge = async (e) => {
    e.preventDefault();
    
    if (!newCharge.charge_name.trim() || !newCharge.charge_amount) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:1969/additional-charges/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          charge_name: newCharge.charge_name.trim(),
          charge_amount: parseFloat(newCharge.charge_amount),
          is_taxable: newCharge.is_taxable,
          tax_rate: parseFloat(newCharge.tax_rate)
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add additional charge');
      }
      
      // Reset form and reload charges
      setNewCharge({
        charge_name: '',
        charge_amount: '',
        is_taxable: false,
        tax_rate: '18'
      });
      setShowAddForm(false);
      await loadCharges();
      
    } catch (err) {
      console.error('Error adding charge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete charge
  const handleDeleteCharge = async (chargeId) => {
    if (!confirm('Are you sure you want to delete this charge?')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://127.0.0.1:1969/additional-charges/${chargeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete additional charge');
      }
      
      await loadCharges();
      
    } catch (err) {
      console.error('Error deleting charge:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCharges();
  }, [invoiceId]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Additional Charges</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="outline"
          size="sm"
        >
          {showAddForm ? 'Cancel' : 'Add Charge'}
        </Button>
      </div>

      {error && (
        <Alert type="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Add Charge Form */}
      {showAddForm && (
        <form onSubmit={handleAddCharge} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Charge Name *
              </label>
              <input
                type="text"
                value={newCharge.charge_name}
                onChange={(e) => setNewCharge({ ...newCharge, charge_name: e.target.value })}
                placeholder="e.g., PACKAGING AND FORWARDING"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newCharge.charge_amount}
                onChange={(e) => setNewCharge({ ...newCharge, charge_amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCharge.is_taxable}
                  onChange={(e) => setNewCharge({ ...newCharge, is_taxable: e.target.checked })}
                  className="mr-2"
                />
                Taxable
              </label>
              
              {newCharge.is_taxable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newCharge.tax_rate}
                    onChange={(e) => setNewCharge({ ...newCharge, tax_rate: e.target.value })}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end mt-4 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              Add Charge
            </Button>
          </div>
        </form>
      )}

      {/* Charges List */}
      {charges.length > 0 ? (
        <div className="space-y-2">
          {charges.map((charge) => (
            <div key={charge.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="font-medium text-gray-900">{charge.charge_name}</div>
                <div className="text-sm text-gray-600">
                  Amount: ₹{charge.charge_amount.toFixed(2)}
                  {charge.is_taxable && (
                    <span> | Tax ({charge.tax_rate}%): ₹{charge.tax_amount.toFixed(2)}</span>
                  )}
                  <span className="font-medium"> | Total: ₹{charge.total_amount.toFixed(2)}</span>
                </div>
              </div>
              <Button
                onClick={() => handleDeleteCharge(charge.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No additional charges added yet.
        </div>
      )}
    </div>
  );
};

export default AdditionalCharges;

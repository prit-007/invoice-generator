import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const SettingsPage = () => {
  const { t, language, changeLanguage } = useLanguage();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'Your Company Name',
    companyEmail: 'info@company.com',
    companyPhone: '+91 98765 43210',
    companyWebsite: 'www.company.com',
    
    // Address Settings
    companyAddress: {
      address_line1: '123 Business Street',
      address_line2: 'Suite 100',
      city: 'Ahmedabad',
      state: 'Gujarat',
      zip_code: '380001',
      country: 'India'
    },
    
    // Tax Settings
    defaultTaxRate: 18,
    taxNumber: 'GSTIN123456789',
    
    // Invoice Settings
    invoicePrefix: 'INV',
    invoiceNumberStart: 1,
    invoiceTerms: 'Payment due within 30 days',
    invoiceNotes: 'Thank you for your business!',
    
    // Currency Settings
    currency: 'INR',
    currencySymbol: '₹',
    currencyPosition: 'before', // before or after
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    
    // Display Settings
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    theme: 'light',
    
    // Language Settings
    defaultLanguage: 'en'
  });

  const tabs = [
    { id: 'general', label: t('settings.general'), icon: '⚙️' },
    { id: 'company', label: t('settings.company'), icon: '🏢' },
    { id: 'invoice', label: t('settings.invoice'), icon: '📄' },
    { id: 'tax', label: t('settings.tax'), icon: '💰' },
    { id: 'notifications', label: t('settings.notifications'), icon: '🔔' },
    { id: 'display', label: t('settings.display'), icon: '🎨' }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load settings from localStorage or API
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error(t('settings.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save settings to localStorage or API
      localStorage.setItem('appSettings', JSON.stringify(settings));
      toast.success(t('settings.saveSuccess'));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t('settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const resetSettings = () => {
    if (window.confirm(t('settings.resetConfirm'))) {
      localStorage.removeItem('appSettings');
      loadSettings();
      toast.success(t('settings.resetSuccess'));
    }
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
          {t('settings.title')}
        </h1>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            onClick={resetSettings}
          >
            {t('settings.reset')}
          </Button>
          <Button
            onClick={saveSettings}
            loading={saving}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <Card padding="none">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 text-lg">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'general' && (
            <Card>
              <Card.Header>
                <Card.Title>{t('settings.general')}</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.language')}
                    </label>
                    <select
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="gu">ગુજરાતી (Gujarati)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.theme')}
                    </label>
                    <select
                      value={settings.theme}
                      onChange={(e) => handleInputChange('theme', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">{t('settings.lightTheme')}</option>
                      <option value="dark">{t('settings.darkTheme')}</option>
                      <option value="auto">{t('settings.autoTheme')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.dateFormat')}
                    </label>
                    <select
                      value={settings.dateFormat}
                      onChange={(e) => handleInputChange('dateFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.timeFormat')}
                    </label>
                    <select
                      value={settings.timeFormat}
                      onChange={(e) => handleInputChange('timeFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="12h">12 Hour</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {activeTab === 'company' && (
            <Card>
              <Card.Header>
                <Card.Title>{t('settings.company')}</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.companyName')}
                      </label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.companyEmail')}
                      </label>
                      <input
                        type="email"
                        value={settings.companyEmail}
                        onChange={(e) => handleInputChange('companyEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.companyPhone')}
                      </label>
                      <input
                        type="tel"
                        value={settings.companyPhone}
                        onChange={(e) => handleInputChange('companyPhone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.companyWebsite')}
                      </label>
                      <input
                        type="url"
                        value={settings.companyWebsite}
                        onChange={(e) => handleInputChange('companyWebsite', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('settings.companyAddress')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('customers.addressLine1')}
                        </label>
                        <input
                          type="text"
                          value={settings.companyAddress.address_line1}
                          onChange={(e) => handleInputChange('companyAddress.address_line1', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('customers.addressLine2')}
                        </label>
                        <input
                          type="text"
                          value={settings.companyAddress.address_line2}
                          onChange={(e) => handleInputChange('companyAddress.address_line2', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('customers.city')}
                        </label>
                        <input
                          type="text"
                          value={settings.companyAddress.city}
                          onChange={(e) => handleInputChange('companyAddress.city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('customers.state')}
                        </label>
                        <input
                          type="text"
                          value={settings.companyAddress.state}
                          onChange={(e) => handleInputChange('companyAddress.state', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('customers.zipCode')}
                        </label>
                        <input
                          type="text"
                          value={settings.companyAddress.zip_code}
                          onChange={(e) => handleInputChange('companyAddress.zip_code', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t('customers.country')}
                        </label>
                        <input
                          type="text"
                          value={settings.companyAddress.country}
                          onChange={(e) => handleInputChange('companyAddress.country', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {activeTab === 'invoice' && (
            <Card>
              <Card.Header>
                <Card.Title>{t('settings.invoice')}</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.invoicePrefix')}
                      </label>
                      <input
                        type="text"
                        value={settings.invoicePrefix}
                        onChange={(e) => handleInputChange('invoicePrefix', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.invoiceNumberStart')}
                      </label>
                      <input
                        type="number"
                        value={settings.invoiceNumberStart}
                        onChange={(e) => handleInputChange('invoiceNumberStart', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.invoiceTerms')}
                    </label>
                    <textarea
                      value={settings.invoiceTerms}
                      onChange={(e) => handleInputChange('invoiceTerms', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('settings.invoiceNotes')}
                    </label>
                    <textarea
                      value={settings.invoiceNotes}
                      onChange={(e) => handleInputChange('invoiceNotes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.currency')}
                      </label>
                      <select
                        value={settings.currency}
                        onChange={(e) => handleInputChange('currency', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.currencySymbol')}
                      </label>
                      <input
                        type="text"
                        value={settings.currencySymbol}
                        onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.currencyPosition')}
                      </label>
                      <select
                        value={settings.currencyPosition}
                        onChange={(e) => handleInputChange('currencyPosition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="before">{t('settings.before')}</option>
                        <option value="after">{t('settings.after')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {activeTab === 'tax' && (
            <Card>
              <Card.Header>
                <Card.Title>{t('settings.tax')}</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.defaultTaxRate')} (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={settings.defaultTaxRate}
                        onChange={(e) => handleInputChange('defaultTaxRate', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.taxNumber')}
                      </label>
                      <input
                        type="text"
                        value={settings.taxNumber}
                        onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <Card.Header>
                <Card.Title>{t('settings.notifications')}</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('settings.emailNotifications')}</h3>
                      <p className="text-sm text-gray-500">{t('settings.emailNotificationsDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{t('settings.smsNotifications')}</h3>
                      <p className="text-sm text-gray-500">{t('settings.smsNotificationsDesc')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleInputChange('smsNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

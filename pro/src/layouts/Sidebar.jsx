import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLocation, Link } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t, language, changeLanguage } = useLanguage();
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
      href: '/',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'products',
      label: t('nav.products'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      href: '/products',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'customers',
      label: t('nav.customers'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      href: '/customers',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'invoices',
      label: t('nav.invoices'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/invoices',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'payments',
      label: t('nav.payments'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      href: '/payments',
      gradient: 'from-indigo-500 to-blue-500'
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      href: '/settings',
      gradient: 'from-gray-500 to-slate-500'
    },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md shadow-xl transform transition-all duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200/50
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">B</span>
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bill Gen
              </span>
              <p className="text-xs text-gray-500">Invoice Management</p>
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4 flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.id}>
                  <Link
                    to={item.href}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      group flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden
                      ${active
                        ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:scale-105'
                      }
                      ${hoveredItem === item.id ? 'shadow-md' : ''}
                    `}
                  >
                    {/* Background animation */}
                    {!active && (
                      <div className={`
                        absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300
                      `} />
                    )}

                    {/* Icon */}
                    <div className={`
                      relative z-10 transition-transform duration-300
                      ${active ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}
                      ${hoveredItem === item.id ? 'scale-110' : ''}
                    `}>
                      {item.icon}
                    </div>

                    {/* Label */}
                    <span className={`
                      relative z-10 font-medium transition-all duration-300
                      ${active ? 'text-white' : 'text-gray-700 group-hover:text-gray-900'}
                    `}>
                      {item.label}
                    </span>

                    {/* Active indicator */}
                    {active && (
                      <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('dashboard.quickStats')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('dashboard.totalInvoices')}</span>
                <span className="font-semibold text-blue-600">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('dashboard.pending')}</span>
                <span className="font-semibold text-orange-600">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('dashboard.revenue')}</span>
                <span className="font-semibold text-green-600">₹1,24,500</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Language toggle */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => changeLanguage(language === 'en' ? 'gu' : 'en')}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 border border-gray-200 hover:border-blue-200 hover:scale-105 active:scale-95"
          >
            <span className="text-lg">🌐</span>
            <span className="font-medium text-gray-700">
              {language === 'en' ? 'ગુજરાતી' : 'English'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

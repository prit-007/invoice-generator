import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const Toast = ({ toast, onRemove }) => {
  const types = {
    success: {
      icon: '✅',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    },
    error: {
      icon: '❌',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    },
    warning: {
      icon: '⚠️',
      bgColor: 'bg-yellow-500',
      textColor: 'text-white'
    },
    info: {
      icon: 'ℹ️',
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    }
  };

  const currentType = types[toast.type] || types.info;

  return (
    <div className={`${currentType.bgColor} ${currentType.textColor} p-4 rounded-lg shadow-lg mb-2 flex items-center justify-between min-w-80 max-w-md animate-slide-in-right`}>
      <div className="flex items-center">
        <span className="mr-3 text-lg">{currentType.icon}</span>
        <div>
          {toast.title && (
            <div className="font-semibold text-sm">{toast.title}</div>
          )}
          <div className="text-sm opacity-90">{toast.message}</div>
        </div>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-4 text-white hover:text-gray-200 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = { id, ...toast };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options })
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onRemove={removeToast} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export default Toast;

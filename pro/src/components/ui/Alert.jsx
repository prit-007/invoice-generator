import React from 'react';

const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onClose, 
  className = '',
  icon = null 
}) => {
  const baseClasses = 'rounded-lg p-4 border transition-all duration-300';
  
  const types = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: '✅',
      iconBg: 'bg-green-100'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: '❌',
      iconBg: 'bg-red-100'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: '⚠️',
      iconBg: 'bg-yellow-100'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100'
    }
  };

  const currentType = types[type];
  const displayIcon = icon || currentType.icon;

  return (
    <div className={`${baseClasses} ${currentType.container} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">
          <div className={`flex items-center justify-center h-8 w-8 rounded-full ${currentType.iconBg}`}>
            <span className="text-sm">{displayIcon}</span>
          </div>
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">
              {title}
            </h3>
          )}
          <div className="text-sm">
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className="inline-flex rounded-md p-1.5 hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-current"
                onClick={onClose}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;

import React, { useState, forwardRef } from 'react';

const Input = forwardRef(({ 
  label,
  error,
  hint,
  icon,
  rightIcon,
  size = 'md',
  variant = 'default',
  className = '',
  required = false,
  disabled = false,
  type = 'text',
  onFocus,
  onBlur,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };

  const variants = {
    default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    success: 'border-green-300 focus:border-green-500 focus:ring-green-500',
    error: 'border-red-300 focus:border-red-500 focus:ring-red-500',
    warning: 'border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500'
  };

  const handleFocus = (e) => {
    setFocused(true);
    onFocus && onFocus(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur && onBlur(e);
  };

  const inputVariant = error ? 'error' : variant;
  const isPassword = type === 'password';

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`
          block text-sm font-medium mb-2 transition-colors duration-200
          ${focused ? 'text-blue-600' : 'text-gray-700'}
          ${error ? 'text-red-600' : ''}
        `}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className={`
            absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200
            ${focused ? 'text-blue-500' : 'text-gray-400'}
            ${error ? 'text-red-500' : ''}
          `}>
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          type={isPassword && showPassword ? 'text' : type}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${sizes[size]}
            ${variants[inputVariant]}
            ${icon ? 'pl-10' : ''}
            ${(rightIcon || isPassword) ? 'pr-10' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:border-gray-400'}
            ${focused ? 'transform scale-[1.02] shadow-lg' : 'shadow-sm'}
            ${error ? 'animate-shake' : ''}
          `}
          {...props}
        />
        
        {(rightIcon || isPassword) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`
                  p-1 rounded-md transition-colors duration-200 hover:bg-gray-100
                  ${focused ? 'text-blue-500' : 'text-gray-400'}
                `}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            ) : (
              <div className={`
                transition-colors duration-200
                ${focused ? 'text-blue-500' : 'text-gray-400'}
                ${error ? 'text-red-500' : ''}
              `}>
                {rightIcon}
              </div>
            )}
          </div>
        )}
      </div>
      
      {(error || hint) && (
        <div className="mt-2 flex items-start space-x-2">
          {error && (
            <div className="flex items-center text-red-600 text-sm animate-slide-down">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {hint && !error && (
            <div className="text-gray-500 text-sm flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{hint}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

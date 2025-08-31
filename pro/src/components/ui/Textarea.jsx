import React, { useState, forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label,
  error,
  hint,
  size = 'md',
  variant = 'default',
  className = '',
  required = false,
  disabled = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  onFocus,
  onBlur,
  ...props 
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(props.value?.length || 0);

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

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    props.onChange && props.onChange(e);
  };

  const inputVariant = error ? 'error' : variant;

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
        <textarea
          ref={ref}
          rows={rows}
          disabled={disabled}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`
            w-full rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none
            ${sizes[size]}
            ${variants[inputVariant]}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:border-gray-400'}
            ${focused ? 'transform scale-[1.01] shadow-lg' : 'shadow-sm'}
            ${error ? 'animate-shake' : ''}
          `}
          {...props}
        />
        
        {(showCharCount || maxLength) && (
          <div className="absolute bottom-3 right-3">
            <span className={`
              text-xs px-2 py-1 rounded-full transition-colors duration-200
              ${maxLength && charCount > maxLength * 0.9 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gray-100 text-gray-500'
              }
            `}>
              {charCount}{maxLength && `/${maxLength}`}
            </span>
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

Textarea.displayName = 'Textarea';

export default Textarea;

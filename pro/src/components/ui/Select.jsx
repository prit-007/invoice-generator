import React, { useState, useRef, useEffect } from 'react';

const Select = ({ 
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  error,
  hint,
  size = 'md',
  disabled = false,
  required = false,
  searchable = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focused, setFocused] = useState(false);
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-4 text-base'
  };

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocused(!isOpen);
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm('');
    setFocused(false);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
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
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full text-left rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            ${sizes[size]}
            ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white hover:border-gray-400'}
            ${focused || isOpen ? 'transform scale-[1.02] shadow-lg border-blue-500' : 'shadow-sm'}
            ${error ? 'animate-shake' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg 
              className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${
                focused ? 'text-blue-500' : 'text-gray-400'
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg animate-scale-in">
            {searchable && (
              <div className="p-3 border-b border-gray-100">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>No options found</p>
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors duration-150 focus:outline-none focus:bg-blue-50
                      ${value === option.value ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'}
                      ${index === 0 ? 'rounded-t-xl' : ''}
                      ${index === filteredOptions.length - 1 ? 'rounded-b-xl' : ''}
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {value === option.value && (
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
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
};

export default Select;

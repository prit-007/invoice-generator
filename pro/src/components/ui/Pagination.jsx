import React from 'react';
import Button from './Button';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
  showInfo = true,
  size = 'md',
  className = ''
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 ${className}`}>
      {showInfo && (
        <div className="text-sm text-gray-700 flex items-center space-x-2">
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium">
            {startItem}-{endItem}
          </span>
          <span>of</span>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
            {totalItems}
          </span>
          <span>items</span>
        </div>
      )}

      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <Button
          variant="ghost"
          size={size}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span key={`dots-${index}`} className="px-3 py-2 text-gray-500">
                  ...
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }
                  ${isActive ? 'animate-pulse-ring' : ''}
                `}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="ghost"
          size={size}
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="hover:bg-blue-50 hover:text-blue-600"
        >
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

export default Pagination;

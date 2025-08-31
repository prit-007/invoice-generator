import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const Table = ({ 
  columns, 
  data, 
  loading = false, 
  onRowClick, 
  className = '',
  striped = true,
  hoverable = true,
  responsive = true,
  size = 'md'
}) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [hoveredRow, setHoveredRow] = useState(null);

  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn) return data;
    
    return [...data].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600 text-lg">Loading data...</span>
        </div>
      </div>
    );
  }

  const TableWrapper = responsive ? 'div' : React.Fragment;
  const wrapperProps = responsive ? {
    className: "overflow-x-auto custom-scrollbar"
  } : {};

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in ${className}`}>
      <TableWrapper {...wrapperProps}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`
                    px-6 py-4 text-left font-semibold text-gray-700 uppercase tracking-wider cursor-pointer
                    hover:bg-blue-100 transition-colors duration-200 select-none
                    ${sizes[size]}
                    ${column.sortable !== false ? 'hover:text-blue-600' : ''}
                  `}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.title}</span>
                    {column.sortable !== false && (
                      <div className="flex flex-col">
                        <svg 
                          className={`w-3 h-3 ${
                            sortColumn === column.key && sortDirection === 'asc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg 
                          className={`w-3 h-3 -mt-1 ${
                            sortColumn === column.key && sortDirection === 'desc' 
                              ? 'text-blue-600' 
                              : 'text-gray-400'
                          }`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="text-6xl mb-4 opacity-50">📋</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No data found</h3>
                    <p className="text-gray-500">There are no records to display at the moment.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`
                    transition-all duration-200 transform
                    ${striped && rowIndex % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}
                    ${hoverable ? 'hover:bg-blue-50 hover:shadow-md hover:-translate-y-0.5' : ''}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    ${hoveredRow === rowIndex ? 'scale-[1.01] shadow-lg' : ''}
                  `}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className={`
                        px-6 py-4 whitespace-nowrap transition-colors duration-200
                        ${sizes[size]}
                        ${hoveredRow === rowIndex ? 'text-gray-900' : 'text-gray-700'}
                      `}
                    >
                      {column.render ? column.render(row[column.key], row, rowIndex) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </TableWrapper>
    </div>
  );
};

// Table components for better composition
const TableHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 ${className}`}>
    {children}
  </div>
);

const TableFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
    {children}
  </div>
);

Table.Header = TableHeader;
Table.Footer = TableFooter;

export default Table;

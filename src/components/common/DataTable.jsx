import React, { useState } from 'react';
import LoadingSpinner, { SkeletonLoader } from './LoadingSpinner';

const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'No data available',
  actions = null,
  sortable = true,
  searchable = true,
  pagination = true,
  itemsPerPage = 10,
  // Backend pagination props
  serverSide = false,
  totalItems = 0,
  currentPage: externalCurrentPage = 1,
  onPageChange,
  onSort,
  onSearch,
  searchTerm: externalSearchTerm = '',
  sortConfig: externalSortConfig = { key: null, direction: 'asc' }
}) => {
  // Use external state for server-side, internal state for client-side
  const [clientSortConfig, setClientSortConfig] = useState({ key: null, direction: 'asc' });
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientCurrentPage, setClientCurrentPage] = useState(1);

  const sortConfig = serverSide ? externalSortConfig : clientSortConfig;
  const searchTerm = serverSide ? externalSearchTerm : clientSearchTerm;
  const currentPage = serverSide ? externalCurrentPage : clientCurrentPage;

  // For server-side pagination, use provided data directly
  const displayData = serverSide ? data : data;

  // Client-side filtering, sorting, and pagination
  const filteredData = React.useMemo(() => {
    if (serverSide) return displayData; // Server handles filtering
    if (!searchTerm) return displayData;
    
    return displayData.filter(item =>
      columns.some(column => {
        const value = item[column.key];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );
  }, [serverSide, displayData, columns, searchTerm]);

  const sortedData = React.useMemo(() => {
    if (serverSide) return filteredData; // Server handles sorting
    if (!sortConfig.key) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [serverSide, filteredData, sortConfig]);

  const paginatedData = React.useMemo(() => {
    if (serverSide) return sortedData; // Server handles pagination
    if (!pagination) return sortedData;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [serverSide, sortedData, currentPage, itemsPerPage, pagination]);

  // Calculate pagination info
  const totalPages = serverSide
    ? Math.ceil(totalItems / itemsPerPage)
    : Math.ceil(filteredData.length / itemsPerPage);
  
  const totalItemsCount = serverSide ? totalItems : filteredData.length;
  const startItem = ((currentPage - 1) * itemsPerPage) + 1;
  const endItem = serverSide
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : Math.min(currentPage * itemsPerPage, filteredData.length);

  const handleSort = (key) => {
    if (!sortable) return;
    
    const newDirection = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    const newSortConfig = { key, direction: newDirection };
    
    if (serverSide) {
      onSort && onSort(newSortConfig);
    } else {
      setClientSortConfig(newSortConfig);
    }
  };

  const handleSearchChange = (e) => {
    const newSearchTerm = e.target.value;
    
    if (serverSide) {
      onSearch && onSearch(newSearchTerm);
    } else {
      setClientSearchTerm(newSearchTerm);
      setClientCurrentPage(1); // Reset to first page when searching
    }
  };

  const handlePageChange = (newPage) => {
    if (serverSide) {
      onPageChange && onPageChange(newPage);
    } else {
      setClientCurrentPage(newPage);
    }
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="card">
        <div className="p-6">
          <SkeletonLoader lines={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Search Bar */}
      {searchable && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    sortable && column.sortable !== false ? 'cursor-pointer hover:bg-gray-100 select-none' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <span className="text-gray-400 text-sm">{getSortIcon(column.key)}</span>
                    )}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <span className="block text-4xl mb-2">📭</span>
                    <p className="text-lg font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <tr key={item.id || index} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startItem} to {endItem} of {totalItemsCount} results
          </div>
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {/* Page number buttons for better UX */}
              {totalPages <= 7 ? (
                // Show all pages if 7 or fewer
                [...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      className={`px-3 py-1 text-sm border rounded-md ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'border-gray-300 hover:bg-gray-100'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {pageNum}
                    </button>
                  );
                })
              ) : (
                // Show abbreviated pagination for many pages
                <>
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={loading}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        1
                      </button>
                      {currentPage > 4 && <span className="px-1 text-gray-500">...</span>}
                    </>
                  )}
                  
                  {[-1, 0, 1].map(offset => {
                    const pageNum = currentPage + offset;
                    if (pageNum < 1 || pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`px-3 py-1 text-sm border rounded-md ${
                          pageNum === currentPage
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'border-gray-300 hover:bg-gray-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && <span className="px-1 text-gray-500">...</span>}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={loading}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </>
              )}
              
              <button
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Backend-paginated DataTable specifically for expenses
export const BackendPaginatedDataTable = ({
  data = [],
  columns = [],
  loading = false,
  emptyMessage = 'No data available',
  actions = null,
  searchable = true,
  // Backend pagination required props
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 20,
  onPageChange,
  onSort,
  onSearch,
  searchTerm = '',
  sortConfig = { key: 'expenseDate', direction: 'desc' },
}) => {
  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      emptyMessage={emptyMessage}
      actions={actions}
      sortable={true}
      searchable={searchable}
      pagination={true}
      itemsPerPage={itemsPerPage}
      serverSide={true}
      totalItems={totalItems}
      currentPage={currentPage}
      onPageChange={onPageChange}
      onSort={onSort}
      onSearch={onSearch}
      searchTerm={searchTerm}
      sortConfig={sortConfig}
    />
  );
};

export default DataTable;
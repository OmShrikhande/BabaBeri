import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const pageSizeOptions = [5, 8, 10];

  // Generate page numbers to show
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-gray-700 bg-gray-800/30">
      {/* Page Size Selector and Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-gray-300">
            Show:
          </label>
          <select
            id="pageSize"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="
              px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-gray-200 text-sm
              focus:outline-none focus:ring-2 focus:ring-[#F72585] focus:border-transparent
              transition-all duration-200 cursor-pointer
            "
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="text-gray-400">per page</span>
        </div>
        
        <div className="text-gray-400">
          Showing {startItem}-{endItem} of {totalItems} results
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="
              p-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-300
              hover:bg-gray-700 hover:text-white hover:border-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800
              transition-all duration-200
            "
            aria-label="Go to first page"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="
              p-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-300
              hover:bg-gray-700 hover:text-white hover:border-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800
              transition-all duration-200
            "
            aria-label="Go to previous page"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-gray-500">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`
                      px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200
                      ${currentPage === page
                        ? 'bg-[#F72585] border-[#F72585] text-white shadow-lg shadow-[#F72585]/25'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white hover:border-gray-500'
                      }
                    `}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="
              p-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-300
              hover:bg-gray-700 hover:text-white hover:border-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800
              transition-all duration-200
            "
            aria-label="Go to next page"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="
              p-2 rounded-lg border border-gray-600 bg-gray-800 text-gray-300
              hover:bg-gray-700 hover:text-white hover:border-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800
              transition-all duration-200
            "
            aria-label="Go to last page"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
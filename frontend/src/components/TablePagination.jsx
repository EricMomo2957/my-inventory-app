import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function TablePagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 8,
  onPageChange,
  isExpanded = false,
  onToggleExpand,
  itemLabel = "items"
}) {
  const { isDark } = useTheme();

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Calculate start & end indices
  const startIndex = totalItems === 0 ? 0 : isExpanded ? 1 : (currentPage - 1) * pageSize + 1;
  const endIndex = isExpanded ? totalItems : Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`mt-4 px-6 py-3.5 rounded-full border shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
      isDark 
        ? 'bg-[#0f172a] border-slate-800 text-slate-300' 
        : 'bg-white border-slate-200/90 text-slate-600 shadow-slate-100'
    }`}>
      {/* Left info label */}
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 select-none">
        Displaying <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex} - {endIndex}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> {itemLabel}
      </div>

      {/* Right pagination controls */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange && onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isExpanded}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all select-none ${
            currentPage === 1 || isExpanded
              ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
              : `${isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'}`
          }`}
        >
          Previous
        </button>

        {/* Numbered Page Buttons */}
        {!isExpanded && pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-1.5 text-xs text-slate-400 select-none">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={`page-${page}`}
              onClick={() => onPageChange && onPageChange(page)}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs font-bold flex items-center justify-center transition-all select-none ${
                isActive
                  ? 'bg-[#00684a] text-white border border-[#00684a] shadow-xs'
                  : `border ${isDark ? 'border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'}`
              }`}
            >
              {page}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange && onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isExpanded || totalItems === 0}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all select-none ${
            currentPage === totalPages || isExpanded || totalItems === 0
              ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400'
              : `${isDark ? 'border-slate-700 hover:bg-slate-800 text-slate-200' : 'border-slate-200 hover:bg-slate-50 text-slate-700 hover:border-slate-300'}`
          }`}
        >
          Next
        </button>

        {/* Expand / Collapse All Button */}
        {onToggleExpand && (
          <button
            onClick={onToggleExpand}
            className={`ml-1 px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all select-none ${
              isExpanded
                ? 'bg-emerald-500/20 text-[#00684a] dark:text-emerald-300 border-emerald-500/40'
                : 'border-[#00684a]/30 dark:border-[#00684a]/40 bg-[#00684a]/5 dark:bg-[#00684a]/10 text-[#00684a] dark:text-emerald-400 hover:bg-[#00684a]/15'
            }`}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-3 h-3" />
                <span>Collapse</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3 h-3" />
                <span>Expand All</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

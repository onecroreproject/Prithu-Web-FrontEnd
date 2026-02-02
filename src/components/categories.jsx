import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CategoryFeedPage = ({ onSelectCategory, selectedCategoryId, excludedCategoryIds = [] }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6); // 2 rows × 3 columns
  const [hoveredCategory, setHoveredCategory] = useState(null);

  useEffect(() => {
    axios.get(`/api/get/feed/category`)
      .then(res => {
        const categoriesData = res.data.categories || [];
        setCategories(categoriesData);
        calculateVisibleCount();
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const calculateVisibleCount = () => {
    const itemsPerRow = 3;
    const rows = 2;
    setVisibleCount(itemsPerRow * rows);
  };

  const getDisplayCategories = () => {
    const filtered = categories.filter(cat => !excludedCategoryIds.includes(cat.categoryId));
    if (showAll) {
      return filtered;
    }
    return filtered.slice(0, visibleCount);
  };

  const filteredCategoriesLen = categories.filter(cat => !excludedCategoryIds.includes(cat.categoryId)).length;
  const hasMoreCategories = filteredCategoriesLen > visibleCount;

  const truncateName = (name) => {
    if (name.length > 10) {
      return name.substring(0, 8) + '..';
    }
    return name;
  };

  // Ultra-compact padding that hugs the text
  const getPaddingClass = () => 'px-2 py-0.5';

  if (loading) {
    return (
      <div className="w-full py-1 animate-in fade-in duration-200">
        <div className="grid grid-cols-3 gap-1">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-6 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full animate-pulse-glow"
              style={{ animationDelay: `${i * 30}ms` }}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className="p-2 text-xs text-red-500 bg-red-50 rounded-lg animate-in fade-in">{error}</div>;

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-1 duration-200">
      {hasMoreCategories && (
        <div className="mb-1 flex justify-end">
          <button
            onClick={() => setShowAll(!showAll)}
            className="group flex items-center gap-0.5 text-[10px] text-gray-500 hover:text-gray-700 font-medium px-1.5 py-0.5 rounded-full hover:bg-gray-100 transition-all duration-150 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-right-1 duration-150"
          >
            {showAll ? (
              <>
                <ChevronUp className="w-2.5 h-2.5 transition-transform duration-150 group-hover:-translate-y-0.5" />
                <span>Less</span>
              </>
            ) : (
              <>
                <span>More</span>
                <ChevronDown className="w-2.5 h-2.5 transition-transform duration-150 group-hover:translate-y-0.5" />
              </>
            )}
          </button>
        </div>
      )}

      {categories.length > 0 ? (
        <div className="space-y-1">
          {/* Categories Grid - Ultra compact */}
          <div className="grid grid-cols-3 gap-1 animate-in fade-in duration-150">
            {/* "All" category - Tightly wrapped */}
            <button
              onClick={() => onSelectCategory(null)}
              onMouseEnter={() => setHoveredCategory('all')}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`group relative inline-flex items-center justify-center rounded-full transition-all duration-150 overflow-hidden whitespace-nowrap border ${!selectedCategoryId
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm border-blue-400'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-300'
                } ${getPaddingClass()}`}
              style={{ minHeight: '24px' }}
            >
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

              <span className="relative z-10 text-xs font-medium transition-all duration-150 leading-tight">
                All
              </span>

              {!selectedCategoryId && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse-slow"></div>
              )}
            </button>

            {/* Other categories - Inline style */}
            {getDisplayCategories().map((cat, index) => (
              <button
                key={cat.categoryId}
                onClick={() => onSelectCategory(cat.categoryId)}
                onMouseEnter={() => setHoveredCategory(cat.categoryId)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`group relative inline-flex items-center justify-center rounded-full transition-all duration-150 overflow-hidden whitespace-nowrap border animate-in fade-in slide-in-from-bottom-1 ${selectedCategoryId === cat.categoryId
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm border-blue-400'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-300'
                  } ${getPaddingClass()}`}
                style={{
                  animationDelay: `${index * 20}ms`,
                  animationFillMode: 'backwards',
                  minHeight: '24px'
                }}
              >
                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />

                {/* Selection glow */}
                {selectedCategoryId === cat.categoryId && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 animate-pulse-slow"></div>
                )}

                {/* Category name */}
                <span
                  className="relative z-10 text-xs font-medium transition-all duration-150 leading-tight"
                  title={cat.categoryName}
                >
                  {truncateName(cat.categoryName)}
                </span>
              </button>
            ))}
          </div>

          {/* "Show More" indicator when collapsed */}
          {hasMoreCategories && !showAll && categories.length > visibleCount && (
            <div className="text-center pt-1 animate-in fade-in duration-150">
              <button
                onClick={() => setShowAll(true)}
                className="group inline-flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 px-2 py-0.5 rounded-full transition-all duration-150 hover:scale-105 active:scale-95"
              >
                <span>+{categories.length - visibleCount}</span>
                <ChevronDown className="w-2 h-2 transition-transform duration-150 group-hover:translate-y-0.5" />
              </button>
            </div>
          )}

          {/* Compact expanded view message */}
          {showAll && (
            <div className="text-center pt-1 animate-in fade-in duration-150">
              <div className="inline-flex items-center gap-0.5 text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                <span className="font-medium">{categories.length} total</span>
                <ChevronUp className="w-2 h-2 animate-bounce-slow" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-2 animate-in fade-in duration-150">
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-lg border border-gray-200">
            <span className="text-xs text-gray-500">No categories</span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(2px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(4px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-1px);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation: fadeIn 0.15s ease-out;
        }
        
        .slide-in-from-bottom-1 {
          animation: slideInFromBottom 0.2s ease-out;
        }
        
        .slide-in-from-right-1 {
          animation: slideInFromRight 0.2s ease-out;
        }
        
        .animate-pulse-glow {
          animation: pulse-glow 1s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 1s ease-in-out infinite;
        }
        
        /* Ultra-fast transitions */
        button, div {
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Ensure inline layout */
        button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: fit-content;
          min-width: fit-content;
        }
        
        /* Responsive adjustments */
        @media (max-width: 640px) {
          .grid-cols-3 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        
        @media (max-width: 480px) {
          .grid-cols-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryFeedPage;
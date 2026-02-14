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
  const [persistentExcludedIds, setPersistentExcludedIds] = useState([]); // Fetched from backend


  useEffect(() => {
    const handleResize = () => calculateVisibleCount();
    window.addEventListener('resize', handleResize);

    const fetchCategories = axios.get(`/api/get/feed/category`);
    const fetchExclusions = axios.get(`/api/get/non-interested-categories`).catch(() => ({ data: { nonInterestedCategories: [] } }));

    Promise.all([fetchCategories, fetchExclusions])
      .then(([catRes, exclRes]) => {
        const categoriesData = catRes.data.categories || [];
        const excludedIds = exclRes.data.nonInterestedCategories || [];

        setCategories(categoriesData);
        setPersistentExcludedIds(excludedIds.map(id => (id._id || id).toString()));
        calculateVisibleCount();
      })
      .catch(err => {
        console.error("Failed to load categories or exclusions:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const calculateVisibleCount = () => {
    const isMobile = window.innerWidth <= 768;
    const itemsPerRow = isMobile ? 3 : 4;
    const rows = isMobile ? 2 : 3; // Only 2 rows on mobile
    // We have 2 static items (Trending, All), so we subtract them from the total visible slots
    // On mobile, also reserve 1 slot for the More button if there are more categories
    const reservedSlots = isMobile ? 3 : 2; // Trending, All, and More button on mobile
    setVisibleCount((itemsPerRow * rows) - reservedSlots);
  };

  const getDisplayCategories = () => {
    const combinedExclusions = [...new Set([
      ...excludedCategoryIds.map(id => id.toString()),
      ...persistentExcludedIds
    ])];
    const filtered = categories.filter(cat => {
      const id = (cat.categoryId || cat._id)?.toString();
      return !combinedExclusions.includes(id);
    });
    if (showAll) {
      return filtered;
    }
    return filtered.slice(0, visibleCount);
  };

  const combinedExclusions = [...new Set([
    ...excludedCategoryIds.map(id => id.toString()),
    ...persistentExcludedIds
  ])];
  const filteredCategoriesLen = categories.filter(cat => {
    const id = (cat.categoryId || cat._id)?.toString();
    return !combinedExclusions.includes(id);
  }).length;
  const hasMoreCategories = filteredCategoriesLen > visibleCount;

  const truncateName = (name) => {
    if (name.length > 10) {
      return name.substring(0, 8) + '..';
    }
    return name;
  };

  // Icon mapping based on category names
  const ICON_MAP = {
    'Trending': '🔥',
    'Music': '🎵',
    'Entertainment': '🎬',
    'Comedy': '😂',
    'Tech': '💻',
    'Gaming': '🎮',
    'News': '📰',
    'Sports': '⚽',
    'Food': '🍳',
    'Travel': '✈️',
    'Photography': '📷',
    'Education': '📚',
    'Politics': '⚖️',
    'Health': '🏥',
    'Fashion': '👗',
    'Business': '💼'
  };

  // Border & BG color mapping based on category names
  const COLOR_MAP = {
    'Trending': 'border-orange-400 bg-orange-50 text-orange-700',
    'Music': 'border-pink-300 bg-pink-50 text-pink-700',
    'Entertainment': 'border-purple-300 bg-purple-50 text-purple-700',
    'Comedy': 'border-yellow-400 bg-yellow-50 text-yellow-700',
    'Tech': 'border-blue-300 bg-blue-50 text-blue-700',
    'Gaming': 'border-indigo-300 bg-indigo-50 text-indigo-700',
    'News': 'border-gray-500 bg-gray-50 text-gray-700',
    'Sports': 'border-green-300 bg-green-50 text-green-700',
    'Food': 'border-orange-300 bg-orange-50 text-orange-700',
    'Travel': 'border-cyan-300 bg-cyan-50 text-cyan-700',
    'Photography': 'border-teal-300 bg-teal-50 text-teal-700',
    'Education': 'border-amber-300 bg-amber-50 text-amber-700'
  };

  // Expanded color palette for unique colors
  const COLOR_PALETTE = [
    'border-pink-300 bg-pink-50 text-pink-700',
    'border-purple-300 bg-purple-50 text-purple-700',
    'border-blue-300 bg-blue-50 text-blue-700',
    'border-indigo-300 bg-indigo-50 text-indigo-700',
    'border-green-300 bg-green-50 text-green-700',
    'border-orange-300 bg-orange-50 text-orange-700',
    'border-cyan-300 bg-cyan-50 text-cyan-700',
    'border-teal-300 bg-teal-50 text-teal-700',
    'border-amber-300 bg-amber-50 text-amber-700',
    'border-rose-300 bg-rose-50 text-rose-700',
    'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700',
    'border-violet-300 bg-violet-50 text-violet-700',
    'border-sky-300 bg-sky-50 text-sky-700',
    'border-emerald-300 bg-emerald-50 text-emerald-700',
    'border-lime-300 bg-lime-50 text-lime-700',
    'border-red-300 bg-red-50 text-red-700',
    'border-slate-300 bg-slate-50 text-slate-700',
  ];

  const getCategoryIcon = (name) => ICON_MAP[name] || '✨';
  const getCategoryTheme = (name, isSelected, index) => {
    if (isSelected) return 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm border-blue-400';

    // First try mapping by name to keep some specific branding
    if (COLOR_MAP[name]) return `${COLOR_MAP[name]} hover:border-blue-300`;

    // Fallback to palette based on index to ensure uniqueness for dynamic categories
    const colorStyle = COLOR_PALETTE[index % COLOR_PALETTE.length];
    return `${colorStyle} hover:border-blue-300`;
  };

  // Ultra-compact padding that hugs the text
  const getPaddingClass = () => 'px-2 py-0.5 sm:px-2 sm:py-0.5';

  if (loading) {
    return (
      <div className="w-full py-1 animate-in fade-in duration-200">
        <div className="grid grid-cols-4 gap-1">
          {[...Array(8)].map((_, i) => (
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


      {categories.length > 0 ? (
        <div className="space-y-1">
          {/* Categories Grid - Ultra compact */}
          <div className="grid grid-cols-4 gap-1 animate-in fade-in duration-150">
            {/* "Trending" category - Fire Icon */}
            <button
              onClick={() => onSelectCategory('trending')}
              onMouseEnter={() => setHoveredCategory('trending')}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`group relative inline-flex items-center justify-center rounded-full transition-all duration-150 overflow-hidden whitespace-nowrap border ${selectedCategoryId === 'trending'
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-sm border-orange-400'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200 hover:border-orange-400'
                } ${getPaddingClass()}`}
              style={{ minHeight: '24px' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
              <div className="flex items-center gap-1 relative z-10">
                <span className="text-[9px] sm:text-[10px]">🔥</span>
                <span className="text-[10px] sm:text-xs font-bold leading-tight">Trending</span>
              </div>
            </button>

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

              <span className="relative z-10 text-[10px] sm:text-xs font-medium transition-all duration-150 leading-tight">
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
                className={`group relative inline-flex items-center justify-center rounded-full transition-all duration-150 overflow-hidden whitespace-nowrap border animate-in fade-in slide-in-from-bottom-1 ${getCategoryTheme(cat.categoryName, selectedCategoryId === cat.categoryId, index)
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

                {/* Category Icon & Name */}
                <div className="flex items-center gap-1 relative z-10">
                  <span className="text-[9px] sm:text-[10px]">{getCategoryIcon(cat.categoryName)}</span>
                  <span
                    className="text-[10px] sm:text-xs font-medium transition-all duration-150 leading-tight"
                    title={cat.categoryName}
                  >
                    {truncateName(cat.categoryName)}
                  </span>
                </div>
              </button>
            ))}

            {/* More button - Only on mobile when there are more categories */}
            {hasMoreCategories && !showAll && typeof window !== 'undefined' && window.innerWidth <= 768 && (
              <button
                onClick={() => setShowAll(true)}
                className="group relative inline-flex items-center justify-center rounded-full transition-all duration-150 overflow-hidden whitespace-nowrap border bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-300 px-2 py-0.5 sm:px-2 sm:py-0.5"
                style={{ minHeight: '24px' }}
              >
                <span className="text-[10px] sm:text-xs font-medium">More....</span>
              </button>
            )}

            {/* Show Less button when expanded on mobile */}
            {showAll && typeof window !== 'undefined' && window.innerWidth <= 768 && (
              <button
                onClick={() => setShowAll(false)}
                className="group relative inline-flex items-center justify-center rounded-full transition-all duration-150 overflow-hidden whitespace-nowrap border bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-300 px-2 py-0.5 sm:px-2 sm:py-0.5"
                style={{ minHeight: '24px' }}
              >
                <span className="text-[10px] sm:text-xs font-medium">Less</span>
              </button>
            )}
          </div>

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
          .grid-cols-4 {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }
        
        @media (max-width: 480px) {
          .grid-cols-4 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryFeedPage;
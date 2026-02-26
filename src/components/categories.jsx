import React, { useState, useEffect, useMemo } from 'react';
import axios from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { getTrendingHashtags } from '../Service/feedService';

const CategoryFeedPage = ({ onSelectCategory, selectedCategoryId, excludedCategoryIds = [], hideCategories = false }) => {
  const [categories, setCategories] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [persistentExcludedIds, setPersistentExcludedIds] = useState([]);

  // Special categories to filter out from the main list
  const SPECIAL_CATEGORIES = ['Anniversary', 'Birthday', 'Politics'];

  useEffect(() => {
    const fetchCategories = axios.get(`/api/get/feed/category`);
    const fetchExclusions = axios.get(`/api/get/non-interested-categories`).catch(() => ({ data: { nonInterestedCategories: [] } }));
    // Initial trending hashtags (null category)
    const fetchHashtags = getTrendingHashtags(null);

    Promise.all([fetchCategories, fetchExclusions, fetchHashtags])
      .then(([catRes, exclRes, hashTagsData]) => {
        let categoriesData = catRes.data.categories || [];
        const excludedIds = exclRes.data.nonInterestedCategories || [];

        // Shuffle categories (Fisher-Yates shuffle)
        for (let i = categoriesData.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [categoriesData[i], categoriesData[j]] = [categoriesData[j], categoriesData[i]];
        }

        // Filter out special categories from the main categories list
        const filteredInitialCategories = categoriesData.filter(cat =>
          !SPECIAL_CATEGORIES.includes(cat.categoryName)
        );

        setCategories(filteredInitialCategories);
        setHashtags(hashTagsData);
        setPersistentExcludedIds(excludedIds.map(id => (id._id || id).toString()));
      })
      .catch(err => {
        console.error("Failed to load categories, exclusions or hashtags:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch specific hashtags if a category is selected in the parent
  useEffect(() => {
    if (selectedCategoryId && typeof selectedCategoryId === 'string' && !selectedCategoryId.startsWith('hashtag:') && selectedCategoryId !== 'trending') {
      getTrendingHashtags(null, selectedCategoryId).then(setHashtags);
    } else if (selectedCategoryId === 'trending' || !selectedCategoryId) {
      // If back to Trending or All, fetch general hashtags
      getTrendingHashtags(null).then(setHashtags);
    }
  }, [selectedCategoryId]);

  // Auto-collapse on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (showAll) {
        setShowAll(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('feedScroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('feedScroll', handleScroll);
    };
  }, [showAll]);

  const handleCategorySelect = (id) => {
    onSelectCategory(id);
    setShowAll(false); // Auto-collapse on selection
  };

  const handleHashtagSelect = (tag) => {
    // Custom handling for hashtags (can navigate or just set category)
    // Here we emit a special ID format that Feed.jsx can recognize
    onSelectCategory(`hashtag:${tag}`);
    setShowAll(false);
  };

  const filteredCategories = useMemo(() => {
    const combinedExclusions = [...new Set([
      ...excludedCategoryIds.map(id => id.toString()),
      ...persistentExcludedIds
    ])];

    let filtered = categories.filter(cat => {
      const id = (cat.categoryId || cat._id)?.toString();
      return !combinedExclusions.includes(id);
    });

    // Move selected category to the front
    if (selectedCategoryId && selectedCategoryId !== 'trending') {
      const selectedIndex = filtered.findIndex(cat => (cat.categoryId || cat._id)?.toString() === selectedCategoryId.toString());
      if (selectedIndex > -1) {
        const selectedCat = filtered[selectedIndex];
        filtered.splice(selectedIndex, 1);
        filtered.unshift(selectedCat);
      }
    }

    return filtered;
  }, [categories, excludedCategoryIds, persistentExcludedIds, selectedCategoryId]);

  const hasMoreCategories = (filteredCategories.length + hashtags.length) > 4;

  // Icon mapping
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

  const COLOR_PALETTE = [
    'bg-rose-600 text-white border-rose-700',
    'bg-fuchsia-600 text-white border-fuchsia-700',
    'bg-violet-600 text-white border-violet-700',
    'bg-sky-600 text-white border-sky-700',
    'bg-emerald-600 text-white border-emerald-700',
    'bg-lime-600 text-black border-lime-700',
    'bg-red-600 text-white border-red-700',
    'bg-indigo-500 text-white border-indigo-600',
    'bg-teal-500 text-white border-teal-600',
    'bg-cyan-500 text-white border-cyan-600',
  ];

  const getCategoryTheme = (name, isSelected, index) => {
    if (isSelected) {
      return 'bg-white text-blue-600 shadow-xl border-blue-400 scale-105 z-20 ring-4 ring-blue-500/20 font-black';
    }
    const colorStyle = COLOR_PALETTE[index % COLOR_PALETTE.length];
    return `${colorStyle} hover:opacity-90 active:scale-95`;
  };

  const isVisibleCondition = (index, combinedIndex, hideCats) => {
    if (hideCats) return index < 6; // Show more hashtags if categories are hidden
    return combinedIndex < 4;
  };

  if (loading) {
    return (
      <div className="w-full py-1 flex flex-wrap gap-1.5 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-6 w-16 bg-gray-200 rounded-full"></div>
        ))}
      </div>
    );
  }

  if (error) return <div className="p-2 text-[10px] text-red-500">{error}</div>;

  return (
    <div className="w-full">
      <motion.div
        layout
        initial={false}
        animate={{ height: showAll ? 'auto' : 66 }}
        className="flex flex-wrap items-center gap-1 px-0.5 overflow-hidden"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <AnimatePresence>
          {!hideCategories && (
            <React.Fragment key="categories-group">
              {/* Fixed: Trending */}
              <button
                onClick={() => handleCategorySelect('trending')}
                className={`px-3 py-1 rounded-full border transition-all duration-200 whitespace-nowrap text-[11px] flex items-center gap-1.5 ${selectedCategoryId === 'trending'
                  ? 'bg-white text-orange-600 shadow-md border-orange-100 scale-105 z-20 ring-2 ring-orange-500/10 font-bold'
                  : 'bg-orange-600 text-white border-orange-700 hover:bg-orange-700 font-bold'
                  }`}
              >
                <span>🔥</span>
                <span>Trending</span>
              </button>

              {/* Fixed: All */}
              <button
                onClick={() => handleCategorySelect(null)}
                className={`px-3 py-1 rounded-full border transition-all duration-200 whitespace-nowrap text-[11px] font-bold flex items-center gap-1.5 ${!selectedCategoryId
                  ? 'bg-white text-blue-600 shadow-md border-blue-100 scale-105 z-20 ring-2 ring-blue-500/10'
                  : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700'
                  }`}
              >
                <span>All</span>
              </button>

              {/* Dynamic Categories */}
              {filteredCategories.map((cat, index) => {
                const isVisible = showAll || index < 4;
                if (!isVisible) return null;

                return (
                  <motion.button
                    layout
                    key={cat.categoryId || cat._id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleCategorySelect(cat.categoryId || cat._id)}
                    className={`px-3 py-1 rounded-full border transition-all duration-200 whitespace-nowrap text-[11px] font-semibold flex items-center gap-1.5 ${getCategoryTheme(cat.categoryName, selectedCategoryId === (cat.categoryId || cat._id), index)
                      }`}
                  >
                    <span>{ICON_MAP[cat.categoryName] || '✨'}</span>
                    <span>{cat.categoryName}</span>
                  </motion.button>
                );
              })}
            </React.Fragment>
          )}

          {/* Hashtags (Always Show) */}
          {hashtags.map((hash, index) => {
            // If categories are hidden, we don't need the 4-item limit for hashtags
            const combinedIndex = hideCategories ? index : (filteredCategories.length + index);
            const isVisible = showAll || isVisibleCondition(index, combinedIndex, hideCategories);
            if (!isVisible) return null;

            const isSelected = selectedCategoryId === `hashtag:${hash.tag}`;

            return (
              <motion.button
                layout
                key={`hashtag-${hash.tag}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                onClick={() => handleHashtagSelect(hash.tag)}
                className={`px-3 py-1 rounded-full border transition-all duration-200 whitespace-nowrap text-[11px] font-semibold flex items-center gap-1.5 ${isSelected
                  ? 'bg-white text-blue-600 shadow-xl border-blue-400 scale-105 z-20 ring-4 ring-blue-500/20 font-black'
                  : 'bg-slate-700 text-white border-slate-800 hover:opacity-90 active:scale-95'
                  }`}
              >
                <span>{hash.tag.startsWith('#') ? hash.tag.substring(1) : hash.tag}</span>
              </motion.button>
            );
          })}
        </AnimatePresence>

        {/* Standard Button Style for More/Less */}
        {hasMoreCategories && (
          <motion.button
            layout
            onClick={() => setShowAll(!showAll)}
            className="px-3 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 transition-all text-[11px] font-black tracking-wider shadow-sm flex items-center h-[26px]"
          >
            {showAll ? 'LESS ↑' : 'MORE...'}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default CategoryFeedPage;

// src/components/HeaderComponent/mobileSearchBar.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, PlayCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileSearchBar({
  mobileSearchOpen, setMobileSearchOpen,
  searchQuery, setSearchQuery, debouncedSearch,
  scoredResults = { categories: [] }
}) {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId) => {
    navigate("/home", { state: { selectedCategoryId: categoryId } });
    setMobileSearchOpen(false);
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-green-600 font-bold">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <AnimatePresence>
      {mobileSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-white z-[100] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100">
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="flex-1 relative">
              <input
                autoFocus
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => {
                  const v = e.target.value;
                  setSearchQuery(v);
                  debouncedSearch(v);
                }}
                className="w-full pl-4 pr-10 py-3 rounded-2xl bg-gray-100 border-none outline-none text-gray-800 placeholder:text-gray-400 font-medium focus:ring-2 focus:ring-green-500/10 transition-all"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            </div>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {!searchQuery.trim() ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 grayscale pb-20">
                <Search className="w-20 h-20 mb-4" />
                <p className="font-black text-xl">SEARCH CATEGORIES</p>
              </div>
            ) : (
              <div className="space-y-3">
                {scoredResults.categories?.length > 0 ? (
                  scoredResults.categories.map((c) => (
                    <motion.div
                      key={c._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => handleCategoryClick(c._id)}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-green-50 transition-all cursor-pointer group active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-green-500 shadow-sm group-hover:bg-green-500 group-hover:text-white transition-all">
                          <PlayCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 tracking-tight">
                            {highlightText(c.name, searchQuery)}
                          </p>
                        </div>
                      </div>
                      <div className="bg-green-100/50 px-3 py-1 rounded-full">
                        <span className="text-[10px] font-black text-green-700 uppercase">
                          {c.videoCount || 0} Videos
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 text-gray-400 italic">
                    No matching categories found
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

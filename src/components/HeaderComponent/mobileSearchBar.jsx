// src/components/MobileSearchBar.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MobileSearchBar({
  mobileSearchOpen, setMobileSearchOpen,
  searchQuery, setSearchQuery, handleKeyDown, debouncedSearch,
  activeTab, setActiveTab, trending, history, clearHistory,
  handleTrendingClick, handleHistoryClick,
  scoredResults, handleSelectResult
}) {

  const navigate = useNavigate();   // ✅ Added

  return (
    <AnimatePresence>
      {mobileSearchOpen && (
        <motion.div
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ duration: 0.28 }}
          className="fixed top-0 left-0 w-full bg-white shadow-xl z-[100] h-full"
        >
          <div className="flex items-center gap-3 p-3 border-b">
            <button
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <input
              autoFocus
              type="text"
              placeholder="Search everything..."
              value={searchQuery}
              onChange={(e) => {
                const v = e.target.value;
                setSearchQuery(v);
                debouncedSearch(v);
              }}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2 rounded-full bg-gray-100 border outline-none"
            />
          </div>

          <div className="max-h-[80vh] overflow-y-auto p-3">
            <div className="space-y-6">

              {/* ---------------- Recent ---------------- */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-gray-500 font-semibold">Recent</p>
                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {history.map((h) => (
                    <button
                      key={h}
                      onClick={() => handleHistoryClick(h)}
                      className="px-3 py-2 bg-gray-100 rounded-lg"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* ---------------- Trending ---------------- */}
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-2">
                  Trending hashtags
                </p>
                <div className="flex flex-wrap gap-2">
                  {trending.map((t) => (
                    <button
                      key={t.tag || t}
                      onClick={() => handleTrendingClick(t)}
                      className="px-3 py-2 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg text-sm"
                    >
                      #{t.tag || t}{" "}
                      <span className="text-xs text-gray-500 ml-2">
                        • {t.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ---------------- Results ---------------- */}
              {searchQuery && (
                <div>
                  {/* Tabs */}
                  <div className="flex items-center gap-2 mb-3">
                    {["all", "people", "categories", "jobs"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          activeTab === t
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t === "all" ? "All" : t[0].toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>

                  {/* ALL TAB */}
                  {activeTab === "all" && (
                    <div className="space-y-2">

                      {/* People */}
                      {scoredResults.people.map((p) => (
                        <div
                          key={p._id}
                          onClick={() => handleSelectResult("people", p)}
                          className="flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <img
                            src={p.profileAvatar || "/default.png"}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium">{p.userName}</div>
                            <div className="text-xs text-gray-500">{p.name}</div>
                          </div>
                        </div>
                      ))}

                      {/* Categories (UPDATED) */}
                      {scoredResults.categories.map((c) => (
                        <div
                          key={c._id}
                          onClick={() => {
                            // send filter to Feed
                            window.dispatchEvent(
                              new CustomEvent("filterFeedByCategory", {
                                detail: { categoryId: c._id }
                              })
                            );

                            navigate("/");   // go to Feed
                            setMobileSearchOpen(false);  // close search
                          }}
                          className="px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          🔹 {c.name}
                        </div>
                      ))}

                      {/* Jobs */}
                      {scoredResults.jobs.map((j) => (
                        <div
                          key={j._id}
                          onClick={() => handleSelectResult("jobs", j)}
                          className="px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="font-medium">{j.title}</div>
                          <div className="text-xs text-gray-500">
                            {j.companyName}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CATEGORIES TAB */}
                  {activeTab === "categories" &&
                    scoredResults.categories.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          window.dispatchEvent(
                            new CustomEvent("filterFeedByCategory", {
                              detail: { categoryId: c._id }
                            })
                          );
                          navigate("/");
                          setMobileSearchOpen(false);
                        }}
                        className="px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        🔹 {c.name}
                      </div>
                    ))}

                  {/* JOBS TAB */}
                  {activeTab === "jobs" &&
                    scoredResults.jobs.map((j) => (
                      <div
                        key={j._id}
                        onClick={() => handleSelectResult("jobs", j)}
                        className="px-3 py-2 rounded hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="font-medium">{j.title}</div>
                        <div className="text-xs text-gray-500">
                          {j.companyName}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

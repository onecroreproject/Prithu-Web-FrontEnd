// src/components/SearchBar.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  handleKeyDown,
  debouncedSearch,
  loadHistory,
  setShowSearchDropdown,
  showSearchDropdown,
  activeTab,
  setActiveTab,
  trending,
  history,
  clearHistory,
  handleTrendingClick,
  handleHistoryClick,
  scoredResults,
  handleSelectResult,
  searchRef
}) {

  const navigate = useNavigate();    // ✅ REAL navigate function

  return (
    <div className="hidden sm:flex flex-1 justify-center px-4" ref={searchRef}>
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          placeholder="Search categories, people, jobs..."
          onChange={(e) => {
            const v = e.target.value;
            setSearchQuery(v);
            debouncedSearch(v);
          }}
          onFocus={() => {
            loadHistory();
            setShowSearchDropdown(true);
          }}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-400 bg-gray-50 outline-none"
        />

        {/* Dropdown */}
        <AnimatePresence>
          {showSearchDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute mt-2 w-full bg-white shadow-xl rounded-2xl border border-gray-200 max-h-96 overflow-y-auto z-50"
            >

              {/* -------------------------------- TABS ------------------------------ */}
              <div className="px-3 py-2 border-b flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {["all", "people", "categories", "jobs"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activeTab === t
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {t === "all" ? "All" : t[0].toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-xs text-gray-500">Trending</div>
                  <div className="flex gap-2 items-center overflow-auto max-w-xs">
                    {trending.slice(0, 6).map((t) => (
                      <button
                        key={t.tag || t}
                        onClick={() => handleTrendingClick(t)}
                        className="text-xs whitespace-nowrap px-2 py-1 rounded-full border border-gray-200 hover:bg-gray-50"
                      >
                        #{t.tag || t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ----------------------------- CONTENT --------------------------- */}
              <div className="p-3 space-y-2">

                {/* ----------------------- Recent searches ---------------------- */}
                {!searchQuery && (
                  <>
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

                      {history.length === 0 ? (
                        <p className="text-xs text-gray-400">No recent searches</p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {history.map((h) => (
                            <button
                              key={h}
                              onClick={() => handleHistoryClick(h)}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                            >
                              {h}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Trending hashtags */}
                    <div>
                      <p className="text-xs text-gray-500 font-semibold mb-2">
                        Trending hashtags
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trending.map((t) => (
                          <button
                            key={t.tag || t}
                            onClick={() => handleTrendingClick(t)}
                            className="px-3 py-2 bg-gradient-to-r from-green-50 to-yellow-50 rounded-lg text-sm hover:opacity-90"
                          >
                            #{t.tag || t}
                            <span className="text-xs text-gray-500 ml-2">• {t.count}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* ---------------------- When user types ----------------------- */}
                {searchQuery && (
                  <>
                    {/* ---------------------- All TAB ---------------------- */}
                    {activeTab === "all" && (
                      <>
                        {/* People */}
                        {scoredResults.people.length > 0 && (
                          <section>
                            <p className="text-xs text-gray-500 font-semibold mb-2">
                              People
                            </p>
                            {scoredResults.people.slice(0, 6).map((p) => (
                              <div
                                key={p._id}
                                onClick={() => handleSelectResult("people", p)}
                                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                              >
                                <img
                                  src={p.profileAvatar || "/default.png"}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <p className="font-medium">{p.userName}</p>
                                  <p className="text-xs text-gray-500">{p.name}</p>
                                </div>
                              </div>
                            ))}
                          </section>
                        )}

                        {/* Categories */}
                        {scoredResults.categories.length > 0 && (
                          <section>
                            <p className="text-xs text-gray-500 font-semibold mb-2">
                              Categories
                            </p>

                            {scoredResults.categories.slice(0, 6).map((c) => (
                              <div
                                key={c._id}
                                onClick={() => {
                                  window.dispatchEvent(
                                    new CustomEvent("filterFeedByCategory", {
                                      detail: { categoryId: c._id }
                                    })
                                  );
                                  navigate("/");  // Visit feed
                                }}
                                className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                              >
                                🔹 {c.name}
                              </div>
                            ))}

                          </section>
                        )}

                        {/* Jobs */}
                        {scoredResults.jobs.length > 0 && (
                          <section>
                            <p className="text-xs text-gray-500 font-semibold mb-2">
                              Jobs
                            </p>
                            {scoredResults.jobs.slice(0, 6).map((j) => (
                              <div
                                key={j._id}
                                onClick={() => handleSelectResult("jobs", j)}
                                className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                              >
                                <p className="font-medium">{j.title}</p>
                                <p className="text-xs text-gray-500">
                                  {j.companyName}
                                </p>
                              </div>
                            ))}
                          </section>
                        )}
                      </>
                    )}

                    {/* ------------------ Categories Tab ------------------ */}
                    {activeTab === "categories" && (
                      <div>
                        {scoredResults.categories.slice(0, 6).map((c) => (
                          <div
                            key={c._id}
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent("filterFeedByCategory", {
                                  detail: { categoryId: c._id }
                                })
                              );
                              navigate("/");
                            }}
                            className="px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                          >
                            🔹 {c.name}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* other tabs omitted for brevity — they stay same */}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

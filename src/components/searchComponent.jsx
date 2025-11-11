import React, { useState, useCallback } from "react";
import { Search, Briefcase, User, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash.debounce";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function SearchBar({ token }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ categories: [], people: [], jobs: [] });
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // 🔹 Debounced search handler
  const searchHandler = useCallback(
    debounce(async (value) => {
      if (!value.trim()) return setResults({ categories: [], people: [], jobs: [] });
      try {
        const { data } = await api.get(`/api/global/search?q=${value}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ✅ Local filter for "starts with" letter
        const q = value.toLowerCase();
        const startsWith = (text) => text?.toLowerCase().startsWith(q);

        const filteredData = {
          categories: (data.categories || []).filter((cat) => startsWith(cat.name)),
          people: (data.people || []).filter(
            (person) => startsWith(person.userName) || startsWith(person.name)
          ),
          jobs: (data.jobs || []).filter(
            (job) =>
              startsWith(job.title) ||
              startsWith(job.role) ||
              startsWith(job.companyName)
          ),
        };

        setResults(filteredData);
      } catch {
        setResults({ categories: [], people: [], jobs: [] });
      }
    }, 400),
    [token]
  );

  // 🔹 Handle input
  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    searchHandler(value);
  };

  // 🔹 Navigate to user profile page
  const handleUserClick = (username) => {
    setIsFocused(false);
    setQuery("");
    navigate(`/user/profile/${username}`);
  };

  return (
    <div className="relative w-full max-w-lg">
      {/* 🔍 Search Input */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
      <input
        value={query}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        placeholder="Search categories, people, or jobs..."
        className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-green-400 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none"
      />

      {/* 🔹 Search Dropdown */}
      <AnimatePresence>
        {isFocused && query && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="absolute top-12 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-3 max-h-96 overflow-y-auto z-50"
          >
            {/* 🏷️ Categories */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                <Tag size={14} /> Categories
              </h4>
              {results.categories.length ? (
                results.categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition"
                  >
                    {cat.name}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 px-3 italic">No categories found.</p>
              )}
            </div>

            {/* 👥 People */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                <User size={14} /> People
              </h4>
              {results.people.length ? (
                results.people.map((person) => (
                  <div
                    key={person._id}
                    onClick={() => handleUserClick(person.userName)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition"
                  >
                    <img
                      src={
                        person.profileAvatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={person.userName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {person.userName || "Unknown"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 px-3 italic">No people found.</p>
              )}
            </div>

            {/* 💼 Jobs */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1">
                <Briefcase size={14} /> Jobs
              </h4>
              {results.jobs.length ? (
                results.jobs.map((job) => (
                  <div
                    key={job._id}
                    className="px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition"
                  >
                    <p className="font-medium text-gray-800 dark:text-gray-200">
                      {job.title || "Untitled Job"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {job.role && `${job.role} · `}
                      {job.companyName}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 px-3 italic">No jobs found.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

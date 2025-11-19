// src/layouts/SearchResultsLayout.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FeedCards from "../components/FeedCards";
import PeopleCards from "../components/PeopleCards";
import CategoryFeeds from "../components/CategoryFeeds";
import JobCards from "../components/JobCards";

export default function SearchResultsLayout({ searchQuery, searchResults }) {
  const [activeSection, setActiveSection] = useState("feeds");

  const sections = [
    { id: "feeds", label: "Feeds", icon: "📰" },
    { id: "people", label: "People", icon: "👥" },
    { id: "categories", label: "Categories", icon: "🔹" },
    { id: "jobs", label: "Jobs", icon: "💼" }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Results for "{searchQuery}"
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {searchResults.total} results found
          </p>
        </div>

        <nav className="space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                activeSection === section.id
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{section.icon}</span>
              <span className="font-medium">{section.label}</span>
              {searchResults[section.id] && (
                <span className="ml-auto text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {searchResults[section.id].length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeSection === "feeds" && (
              <FeedCards feeds={searchResults.feeds || []} />
            )}
            {activeSection === "people" && (
              <PeopleCards people={searchResults.people || []} />
            )}
            {activeSection === "categories" && (
              <CategoryFeeds 
                categories={searchResults.categories || []} 
                feeds={searchResults.feeds || []}
              />
            )}
            {activeSection === "jobs" && (
              <JobCards jobs={searchResults.jobs || []} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
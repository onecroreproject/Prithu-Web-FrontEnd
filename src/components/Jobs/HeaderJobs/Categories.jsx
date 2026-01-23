import React, { useState, useMemo } from "react";
import categoryData from "../../../JsonFile/jobSelection.json";

export default function Categories({ selectedCategory, onSelectCategory }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Toggle section expansion
  const toggleSection = (sectionTitle) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  // Get all unique categories from mainCategories for the "All Categories" view
  const allCategories = [...new Set(
    categoryData.mainCategories.flatMap(section => section.items)
  )];

  // Filter categories based on search query - FIXED VERSION
const filteredData = useMemo(() => {
  const query = searchQuery.toLowerCase().trim();

  // No search → return entire JSON
  if (!query) {
    return {
      mainCategories: categoryData.mainCategories,
      jobRoles: categoryData.jobRoles
    };
  }

  // --- MAIN CATEGORIES SEARCH ---
  const filteredMainCategories = categoryData.mainCategories
    .map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.toLowerCase().includes(query)
      )
    }))
    .filter(section => section.items.length > 0);

  // --- JOB ROLES SEARCH ---
  const filteredJobRoles = categoryData.jobRoles
    .map(category => ({
      ...category,
      jobrole: category.jobrole.filter(role => {
        const roleString = Array.isArray(role) ? role.join(" ") : role;
        return roleString.toLowerCase().includes(query);
      })
    }))
    .filter(category => category.jobrole.length > 0);

  return {
    mainCategories: filteredMainCategories,
    jobRoles: filteredJobRoles
  };
}, [searchQuery]);


  // Check if any results exist after filtering
  const hasResults = 
    filteredData.mainCategories.length > 0 || 
    filteredData.jobRoles.length > 0;

  return (
    <div className="mb-6 sm:mb-8 bg-white rounded-lg border border-gray-200">
      {/* Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-base sm:text-lg text-gray-900">Categories</span>
        <svg 
          className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown Content */}
      <div className={`transition-all duration-300 overflow-hidden ${
        isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
      }`}>
        {/* Search Bar */}
        <div className="px-3 sm:px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 pl-9 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 sm:space-y-2 max-h-[70vh] overflow-y-auto">
          {/* All Categories Option - Only show when not searching or search is empty */}
          {!searchQuery && (
            <div
              className={`flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                selectedCategory === "All" 
                  ? "bg-blue-50 border border-blue-200" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onSelectCategory("All")}
            >
              <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3">
                <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  selectedCategory === "All" 
                    ? "border-blue-600 bg-blue-600" 
                    : "border-gray-300 group-hover:border-blue-400"
                }`}>
                  {selectedCategory === "All" && (
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <span className={`font-medium transition-colors duration-200 text-sm sm:text-base ${
                selectedCategory === "All" ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
              }`}>
                All Categories
              </span>
            </div>
          )}

          {/* No Results Message */}
          {searchQuery && !hasResults && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No categories found for "{searchQuery}"
            </div>
          )}

          {/* Main Categories Sections */}
          {filteredData.mainCategories.map((section, index) => (
            <div key={section.title} className="border-t border-gray-100 pt-2 first:border-t-0 first:pt-0">
              {/* Section Header */}
              <div 
                className="flex items-center justify-between px-2 sm:px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => toggleSection(section.title)}
              >
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  {section.title}
                </span>
                <svg 
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-300 ${
                    expandedSections[section.title] ? "rotate-180" : "rotate-0"
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Section Items */}
              <div className={`transition-all duration-300 overflow-hidden ${
                expandedSections[section.title] || searchQuery ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="space-y-1 sm:space-y-2 mt-1">
                  {section.items.map((category) => (
                    <div
                      key={category}
                      className={`flex items-center px-2 sm:px-3 py-2 sm:py-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                        selectedCategory === category 
                          ? "bg-blue-50" 
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => onSelectCategory(category)}
                    >
                      <div className="flex items-center justify-center w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-3">
                        <div className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          selectedCategory === category 
                            ? "border-blue-600 bg-blue-600" 
                            : "border-gray-300 group-hover:border-blue-400"
                        }`}>
                          {selectedCategory === category && (
                            <div className="w-1 h-1 sm:w-1 sm:h-1 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                      <span className={`font-medium transition-colors duration-200 text-sm ${
                        selectedCategory === category ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                      }`}>
                        {category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Job Roles Section - FIXED: Proper rendering of filtered job roles */}
          {filteredData.jobRoles.length > 0 && (
            <div className="border-t border-gray-100 pt-2">
              <div 
                className="flex items-center justify-between px-2 sm:px-3 py-2 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors duration-200"
                onClick={() => toggleSection("Job Roles")}
              >
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Job Roles
                </span>
                <svg 
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform duration-300 ${
                    expandedSections["Job Roles"] ? "rotate-180" : "rotate-0"
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Job Roles Items - FIXED: Proper handling of job role arrays */}
              <div className={`transition-all duration-300 overflow-hidden ${
                expandedSections["Job Roles"] || searchQuery ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}>
                <div className="space-y-2 mt-1">
                  {filteredData.jobRoles.map((jobCategory) => (
                    <div key={jobCategory.category} className="space-y-1">
                      <div className="text-xs font-medium text-gray-600 px-2 sm:px-3">
                        {jobCategory.category}
                      </div>
                      <div className="space-y-1">
                        {jobCategory.jobrole.map((role, index) => {
                          // Handle both array and string formats for job roles
                          const roleString = Array.isArray(role) ? role.join(" ") : role;
                          const roleKey = Array.isArray(role) ? role.join("-") : role;
                          
                          return (
                            <div
                              key={`${jobCategory.category}-${roleKey}-${index}`}
                              className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                                selectedCategory === roleString 
                                  ? "bg-blue-50" 
                                  : "hover:bg-gray-50"
                              }`}
                              onClick={() => onSelectCategory(roleString)}
                            >
                              <div className="flex items-center justify-center w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-3">
                                <div className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                  selectedCategory === roleString 
                                    ? "border-blue-600 bg-blue-600" 
                                    : "border-gray-300 group-hover:border-blue-400"
                                }`}>
                                  {selectedCategory === roleString && (
                                    <div className="w-1 h-1 sm:w-1 sm:h-1 bg-white rounded-full"></div>
                                  )}
                                </div>
                              </div>
                              <span className={`font-medium transition-colors duration-200 text-sm ${
                                selectedCategory === roleString ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                              }`}>
                                {roleString}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats - Only show when not searching */}
          {!searchQuery && (
            <div className="pt-2 border-t border-gray-100">
              <div className="px-2 sm:px-3 py-2 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <span>Total Categories:</span>
                  <span className="font-semibold">{allCategories.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Job Roles:</span>
                  <span className="font-semibold">
                    {categoryData.jobRoles.reduce((total, category) => total + category.jobrole.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
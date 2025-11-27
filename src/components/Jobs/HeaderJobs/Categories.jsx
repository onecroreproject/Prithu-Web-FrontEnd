import React, { useState } from "react";
import categoryData from "../../../JsonFile/jobSelection.json"; // Import the JSON file

export default function Categories({ selectedCategory, onSelectCategory }) {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});

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
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 sm:space-y-2 max-h-[70vh] overflow-y-auto">
          {/* All Categories Option */}
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

          {/* Main Categories Sections */}
          {categoryData.mainCategories.map((section, index) => (
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
                expandedSections[section.title] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
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

          {/* Job Roles Section */}
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

            {/* Job Roles Items */}
            <div className={`transition-all duration-300 overflow-hidden ${
              expandedSections["Job Roles"] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}>
              <div className="space-y-2 mt-1">
                {categoryData.jobRoles.map((jobCategory) => (
                  <div key={jobCategory.category} className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 px-2 sm:px-3">
                      {jobCategory.category}
                    </div>
                    <div className="space-y-1">
                      {jobCategory.jobrole.map((role, index) => (
                        <div
                          key={index}
                          className={`flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg cursor-pointer transition-all duration-200 group ${
                            selectedCategory === role.join(" ") 
                              ? "bg-blue-50" 
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => onSelectCategory(role.join(" "))}
                        >
                          <div className="flex items-center justify-center w-4 h-4 sm:w-4 sm:h-4 mr-2 sm:mr-3">
                            <div className={`w-3 h-3 sm:w-3 sm:h-3 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              selectedCategory === role.join(" ") 
                                ? "border-blue-600 bg-blue-600" 
                                : "border-gray-300 group-hover:border-blue-400"
                            }`}>
                              {selectedCategory === role.join(" ") && (
                                <div className="w-1 h-1 sm:w-1 sm:h-1 bg-white rounded-full"></div>
                              )}
                            </div>
                          </div>
                          <span className={`font-medium transition-colors duration-200 text-sm ${
                            selectedCategory === role.join(" ") ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                          }`}>
                            {role.join(" ")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Stats */}
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
        </div>
      </div>
    </div>
  );
}
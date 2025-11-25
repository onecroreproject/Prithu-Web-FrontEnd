import React, { useState } from "react";

const categories = [
  "Logo Design", 
  "Branding Services", 
  "Social Media Design", 
  "Website Design",
  "Illustrations", 
  "Packaging Design", 
  "Landing Page Design", 
  "UI/UX Design", 
  "Architecture & Interior Design",
  "Print Design",
  "Motion Graphics",
  "Product Design",
  "Mobile App Design",
  "Email Template Design",
  "Business Cards",
  "Brochure Design",
  "Infographic Design",
  "Character Design",
  "Icon Design",
  "Typography Design"
];

export default function Categories({ selectedCategory, onSelectCategory }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-6 sm:mb-8 bg-white rounded-lg">
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
        isOpen ? "max-h-96 sm:max-h-80 lg:max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 sm:space-y-2">
          {/* All Categories Option */}
          <div
            className={`flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
              selectedCategory === "All" 
                ? "bg-blue-50" 
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

          {/* Popular Categories Section */}
          <div className="pt-1 sm:pt-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 sm:px-3 mb-2 sm:mb-3">
              Popular Categories
            </div>
            <div className="space-y-1 sm:space-y-2">
              {categories.slice(0, 8).map((cat) => (
                <div
                  key={cat}
                  className={`flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    selectedCategory === cat 
                      ? "bg-blue-50" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectCategory(cat)}
                >
                  <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedCategory === cat 
                        ? "border-blue-600 bg-blue-600" 
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}>
                      {selectedCategory === cat && (
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className={`font-medium transition-colors duration-200 text-sm sm:text-base ${
                    selectedCategory === cat ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                  }`}>
                    {cat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Categories Section */}
          <div className="pt-3 sm:pt-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 sm:px-3 mb-2 sm:mb-3">
              More Categories
            </div>
            <div className="space-y-1 sm:space-y-2">
              {categories.slice(8, 16).map((cat) => (
                <div
                  key={cat}
                  className={`flex items-center px-2 sm:px-3 py-2 sm:py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    selectedCategory === cat 
                      ? "bg-blue-50" 
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectCategory(cat)}
                >
                  <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      selectedCategory === cat 
                        ? "border-blue-600 bg-blue-600" 
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}>
                      {selectedCategory === cat && (
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                  <span className={`font-medium transition-colors duration-200 text-sm sm:text-base ${
                    selectedCategory === cat ? "text-blue-700" : "text-gray-700 group-hover:text-gray-900"
                  }`}>
                    {cat}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* View All Button */}
          <button className="w-full mt-3 sm:mt-4 px-2 sm:px-3 py-2 sm:py-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium text-xs sm:text-sm group">
            <div className="flex items-center justify-center space-x-1 sm:space-x-2">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>View All Categories</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
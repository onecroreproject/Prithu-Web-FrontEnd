import React, { useState } from "react";

export default function Locations({ selectedCountry, onCountryChange, selectedCity, onCityChange }) {
  const [isOpen, setIsOpen] = useState(true);
  const countries = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "Japan"];

  return (
    <div className="mt-4 sm:mt-6 bg-white rounded-lg">
      {/* Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-3 sm:p-4 cursor-pointer bg-white hover:bg-gray-50 transition-colors duration-200 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-base sm:text-lg text-gray-900">Location</span>
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
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4">
          {/* Country Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country/Region
            </label>
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => onCountryChange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer text-gray-700 hover:border-gray-300 text-sm sm:text-base pr-8 sm:pr-10"
              >
                <option value="">Select a country</option>
                {countries.map((country) => (
                  <option value={country} key={country}>{country}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3 pointer-events-none">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="Enter city name"
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 placeholder-gray-400 hover:border-gray-300 text-sm sm:text-base pr-8 sm:pr-10"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:pr-3">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Quick Cities for India */}
          {selectedCountry === "India" && (
            <div className="pt-1 sm:pt-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Popular Indian Cities
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"].map((city) => (
                  <button
                    key={city}
                    onClick={() => onCityChange(city)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                      selectedCity === city
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Cities for US */}
          {selectedCountry === "United States" && (
            <div className="pt-1 sm:pt-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Popular US Cities
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio"].map((city) => (
                  <button
                    key={city}
                    onClick={() => onCityChange(city)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                      selectedCity === city
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Cities for UK */}
          {selectedCountry === "United Kingdom" && (
            <div className="pt-1 sm:pt-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Popular UK Cities
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {["London", "Manchester", "Birmingham", "Liverpool", "Glasgow", "Edinburgh", "Bristol"].map((city) => (
                  <button
                    key={city}
                    onClick={() => onCityChange(city)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                      selectedCity === city
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Cities for Canada */}
          {selectedCountry === "Canada" && (
            <div className="pt-1 sm:pt-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">
                Popular Canadian Cities
              </div>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                {["Toronto", "Vancouver", "Montreal", "Calgary", "Edmonton", "Ottawa", "Winnipeg"].map((city) => (
                  <button
                    key={city}
                    onClick={() => onCityChange(city)}
                    className={`px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 ${
                      selectedCity === city
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { FiTag, FiMapPin, FiBriefcase } from "react-icons/fi";
import { Search, Filter, Navigation, Target, X, ChevronDown, MapPin } from "lucide-react";

const JobHeader = ({ 
  searchText, 
  onSearchChange, 
  jobTitleSearch,
  onJobTitleChange,
  selectedCity, 
  onCityChange, 
  selectedCountry, 
  onCountryChange,
  selectedCategory,
  onCategoryChange,
  filters,
  onFilterChange,
  
  // Location props
  showLocationFilters,
  locationLoading,
  locationError,
  userLocation,
  selectedState,
  selectedArea,
  distanceRadius,
  dropdownOpen,
  states,
  citiesForSelectedState,
  areasForSelectedCity,
  distanceOptions,
  getUserLocation,
  clearLocationSearch,
  toggleDropdown,
  handleStateSelect,
  handleCitySelect,
  handleAreaSelect,
  handleDistanceSelect
}) => {
  const [localSearch, setLocalSearch] = useState(searchText);
  const [localJobTitle, setLocalJobTitle] = useState(jobTitleSearch || "");
  const [selectedJobTypes, setSelectedJobTypes] = useState(filters.employmentType || []);

  const jobTypes = [
    { value: "freelance", label: "Freelance" },
    { value: "full-time", label: "Full Time" },
    { value: "internship", label: "Internship" },
    { value: "part-time", label: "Part Time" },
    { value: "temporary", label: "Temporary" },
  ];

  const handleSearch = (e) => {
    setLocalSearch(e.target.value);
    onSearchChange(e.target.value);
  };

  const handleJobTitleChange = (e) => {
    const value = e.target.value;
    setLocalJobTitle(value);
    onJobTitleChange(value);
  };

  const handleJobTypeToggle = (type) => {
    console.log("Job type toggle:", type);
    console.log("Current selected types:", selectedJobTypes);
    
    const newTypes = selectedJobTypes.includes(type)
      ? selectedJobTypes.filter(t => t !== type)
      : [...selectedJobTypes, type];
    
    console.log("New selected types:", newTypes);
    
    setSelectedJobTypes(newTypes);
    onFilterChange('employmentType', newTypes);
  };

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-100 pt-16 pb-20 px-4">
      <div className="max-w-6xl mx-auto text-center text-gray-800 relative -bottom-8">
        
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-emerald-600">1000+</span> Job Opportunities Await
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Discover Careers, Vacancies & Professional Paths
        </p>

        {/* Combined Search and Location Section */}
        <div className="bg-transparent rounded-xl p-6 md:p-6 mt-12 relative">
          <div className="flex items-center justify-center gap-5">
            
            {/* Job Title Search */}
            <div className="flex flex-col text-left">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <Search className="w-4 h-4 text-emerald-600" />
                Job Title
              </label>
              <input
                type="text"
                placeholder="Software Engineer, Designer, etc..."
                value={localJobTitle}
                onChange={handleJobTitleChange}
                className="w-full rounded-lg px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-900 outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 shadow-lg"
              />
            </div>

            {/* Keywords/Skills Search */}
            {/* <div className="flex flex-col text-left">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <Search className="w-4 h-4 text-emerald-600" />
                Skills/Keywords
              </label>
              <input
                type="text"
                placeholder="React, Python, Marketing, etc..."
                value={localSearch}
                onChange={handleSearch}
                className="w-full rounded-lg px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-900 outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 shadow-lg"
              />
            </div> */}

            {/* Location */}
            <div className="flex flex-col text-left">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <FiMapPin className="w-4 h-4 text-emerald-600" />
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city..."
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full rounded-lg px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-900 outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 shadow-lg"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col text-left">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <FiBriefcase className="w-4 h-4 text-emerald-600" />
                Category
              </label>
              <input
                type="text"
                placeholder="Enter job category..."
                value={selectedCategory !== "All" ? selectedCategory : ""}
                onChange={(e) => onCategoryChange(e.target.value || "All")}
                className="w-full rounded-lg px-4 py-3 bg-white/90 backdrop-blur-sm text-gray-900 outline-none border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 shadow-lg"
              />
            </div>

            {/* Current Location */}
            <div className="flex flex-col text-left">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <Target className="w-4 h-4 text-emerald-600" />
                Current Location
              </label>
              <div className="relative">
                {!userLocation ? (
                  <button
                    onClick={getUserLocation}
                    disabled={locationLoading}
                    className="w-full rounded-lg px-4 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {locationLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        <span>Use My Location</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1">
                        <button
                          onClick={() => toggleDropdown('distance')}
                          className="w-full px-3 py-2.5 bg-white/90 backdrop-blur-sm rounded-lg text-gray-800 border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between shadow-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Navigation className="w-4 h-4 text-emerald-600" />
                            <span className="text-left">
                              {distanceRadius ? `Within ${distanceRadius} km` : "Select radius"}
                            </span>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen.distance ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                      <button
                        onClick={clearLocationSearch}
                        className="p-2 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-lg"
                        title="Clear location"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Distance Dropdown */}
                {dropdownOpen.distance && userLocation && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-emerald-200 rounded-lg shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] backdrop-blur-sm">
                    <div className="p-2 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
                      <p className="text-sm text-gray-700 font-medium">Select distance radius from your location</p>
                    </div>
                    {distanceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDistanceSelect(option.value)}
                        className={`w-full px-3 py-2.5 text-left hover:bg-emerald-50 text-gray-800 flex items-center justify-between border-b border-emerald-100 last:border-b-0 ${
                          distanceRadius === option.value ? "bg-gradient-to-r from-emerald-100 to-green-100" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${distanceRadius === option.value ? "bg-gradient-to-r from-emerald-500 to-green-500" : "bg-gray-300"}`} />
                          <span>{option.label}</span>
                        </div>
                        {distanceRadius === option.value && (
                          <span className="text-emerald-600 font-medium">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Job Types */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-gray-700 mt-6 px-1">
            {jobTypes.map((type) => (
              <label 
                key={type.value} 
                className="flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
              >
                <input
                  type="checkbox"
                  className="accent-emerald-500"
                  checked={selectedJobTypes.includes(type.value)}
                  onChange={() => handleJobTypeToggle(type.value)}
                />
                <span className="font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto shadow-md">
            <p className="text-red-600 text-sm">{locationError}</p>
          </div>
        )}

        {/* Location Status */}
        {userLocation && (
          <div className="mt-4 flex items-center justify-center gap-3 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
              <Target className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Using your current location</span>
            </div>
            {distanceRadius && (
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                <span className="font-medium">{distanceRadius} km radius applied</span>
              </div>
            )}
          </div>
        )}

        {/* Trending Keywords */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center text-gray-700 gap-2">
          <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            <FiTag className="text-gray-600" />
            <span className="font-medium">Popular Job Titles:</span>
          </div>
          <span className="text-gray-600 text-sm md:text-base bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
            Software Engineer, Frontend Developer, Data Analyst, Product Manager, UX Designer, Marketing Manager, Sales Executive, Content Writer, Project Manager, Business Analyst
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobHeader;
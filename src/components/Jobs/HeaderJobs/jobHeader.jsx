import React, { useState, useEffect } from "react";
import { FiTag, FiMapPin, FiBriefcase } from "react-icons/fi";
import {
  Search,
  Filter,
  Navigation,
  Target,
  X,
  ChevronDown,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  onFindJobs, // Add this prop for manual search trigger
  clearAll, // Add clearAll prop

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
  handleDistanceSelect,
}) => {
  const [localSearch, setLocalSearch] = useState(searchText);
  const [localJobTitle, setLocalJobTitle] = useState(jobTitleSearch || "");
  const [localCity, setLocalCity] = useState(selectedCity || "");
  const [localCategory, setLocalCategory] = useState(selectedCategory !== "All" ? selectedCategory : "");
  const [selectedJobTypes, setSelectedJobTypes] = useState(
    filters.employmentType || []
  );
  const navigate=useNavigate();

  // Sync local state with props when they change
  useEffect(() => {
    setLocalSearch(searchText);
  }, [searchText]);

  useEffect(() => {
    setLocalJobTitle(jobTitleSearch || "");
  }, [jobTitleSearch]);

  useEffect(() => {
    setLocalCity(selectedCity || "");
  }, [selectedCity]);

  useEffect(() => {
    setLocalCategory(selectedCategory !== "All" ? selectedCategory : "");
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedJobTypes(filters.employmentType || []);
  }, [filters.employmentType]);

  const jobTypes = [
    { value: "freelance", label: "Freelance" },
    { value: "full-time", label: "Full Time" },
    { value: "internship", label: "Internship" },
    { value: "part-time", label: "Part Time" },
    { value: "temporary", label: "Temporary" },
  ];

  const applyFilters = () => {
    // Update all parent states with local values
    onSearchChange(localSearch);
    onJobTitleChange(localJobTitle);
    onCityChange(localCity);
    onCategoryChange(localCategory || "All");
    onFilterChange("employmentType", selectedJobTypes);
    // Trigger search
    onFindJobs && onFindJobs();
  };

  const handleSearch = (e) => {
    setLocalSearch(e.target.value);
    // Don't update parent state on every keystroke - only on Enter or button click
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const handleJobTitleChange = (e) => {
    const value = e.target.value;
    setLocalJobTitle(value);
    // Don't update parent state on every keystroke - only on Enter or button click
  };

  const handleJobTitleKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const handleCityChange = (e) => {
    const value = e.target.value;
    setLocalCity(value);
    // Don't update parent state on every keystroke - only on Enter or button click
  };

  const handleCityKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setLocalCategory(value);
    // Don't update parent state on every keystroke - only on Enter or button click
  };

  const handleCategoryKeyPress = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const handleJobTypeToggle = (type) => {
    console.log("Job type toggle:", type);
    console.log("Current selected types:", selectedJobTypes);

    const newTypes = selectedJobTypes.includes(type)
      ? selectedJobTypes.filter((t) => t !== type)
      : [...selectedJobTypes, type];

    console.log("New selected types:", newTypes);

    setSelectedJobTypes(newTypes);
    // Don't update parent state immediately - only on Enter or button click
  };

  const handleClearAll = () => {
    // Clear all local state
    setLocalSearch("");
    setLocalJobTitle("");
    setLocalCity("");
    setLocalCategory("");
    setSelectedJobTypes([]);

    // Call the parent clearAll function if provided
    if (clearAll) {
      clearAll();
    }
  };

  const hadleAppliedApplications=()=>{
    navigate("/jobs/applied/jobs")
  }

  return (
    <div className="w-full bg-gradient-to-br from-emerald-50 via-green-100 to-emerald-100 pt-16 pb-20 px-4">
      <div className="max-w-6xl mx-auto text-center text-gray-800 relative -bottom-8">
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-emerald-600">1000+</span> Job Opportunities
          Await
        </h1>

        <p className="mt-3 text-lg text-gray-600">
          Discover Careers, Vacancies & Professional Paths
        </p>

        {/* Combined Search and Location Section */}
        <div className="bg-transparent rounded-xl p-4 md:p-6 mt-8 md:mt-12 relative">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-5">
            {/* Job Title Search */}
            <div className="flex flex-col text-left w-full md:w-auto md:min-w-[200px]">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <Search className="w-4 h-4 text-emerald-600" />
                Job Title
              </label>
              <input
                type="text"
                placeholder="Software Engineer, Designer, etc..."
                value={localJobTitle}
                onChange={handleJobTitleChange}
                onKeyPress={handleJobTitleKeyPress}
                className="w-full rounded-lg px-4 py-3 bg-white/95 backdrop-blur-sm text-gray-900 outline-none border-2 border-emerald-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-200 text-sm md:text-base"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col text-left w-full md:w-auto md:min-w-[180px]">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <FiMapPin className="w-4 h-4 text-emerald-600" />
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city..."
                value={localCity}
                onChange={handleCityChange}
                onKeyPress={handleCityKeyPress}
                className="w-full rounded-lg px-4 py-3 bg-white/95 backdrop-blur-sm text-gray-900 outline-none border-2 border-emerald-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-200 text-sm md:text-base"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col text-left w-full md:w-auto md:min-w-[180px]">
              <label className="text-sm mb-1 text-gray-700 font-medium flex items-center gap-1">
                <FiBriefcase className="w-4 h-4 text-emerald-600" />
                Category
              </label>
              <input
                type="text"
                placeholder="Enter job category..."
                value={localCategory}
                onChange={handleCategoryChange}
                onKeyPress={handleCategoryKeyPress}
                className="w-full rounded-lg px-4 py-3 bg-white/95 backdrop-blur-sm text-gray-900 outline-none border-2 border-emerald-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-200 text-sm md:text-base"
              />
            </div>

            {/* Find Job Button - Moved to top */}
            <div className="flex flex-col text-left w-full md:w-auto md:min-w-[150px]">
              <label className="text-sm mb-1 text-gray-700 font-medium opacity-0">
                Search
              </label>
              <button
                onClick={applyFilters}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 text-sm md:text-base border-2 border-transparent hover:border-blue-300"
              >
                <Search className="w-5 h-5" />
                Find Job
              </button>
            </div>
          </div>

          {/* Current Location and Applications - Below filters */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6">
            <div className="flex gap-3 w-full md:w-auto justify-center">
              <div className="relative">
                {!userLocation ? (
                  <button
                    onClick={getUserLocation}
                    disabled={locationLoading}
                    className="rounded-lg px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleDropdown("distance")}
                      className="px-4 py-3 bg-white/90 backdrop-blur-sm rounded-lg text-gray-800 border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all flex items-center justify-between shadow-lg text-sm md:text-base"
                    >
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-emerald-600" />
                        <span className="text-left">
                          {distanceRadius
                            ? `Within ${distanceRadius} km`
                            : "Select radius"}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          dropdownOpen.distance ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <button
                      onClick={clearLocationSearch}
                      className="p-3 bg-white/90 backdrop-blur-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shadow-lg"
                      title="Clear location"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Distance Dropdown */}
                {dropdownOpen.distance && userLocation && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-emerald-200 rounded-lg shadow-[0_10px_25px_-5px_rgba(16,185,129,0.3)] backdrop-blur-sm max-h-60 overflow-y-auto">
                    <div className="p-2 border-b border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50">
                      <p className="text-sm text-gray-700 font-medium">
                        Select distance radius from your location
                      </p>
                    </div>
                    {distanceOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleDistanceSelect(option.value)}
                        className={`w-full px-3 py-2.5 text-left hover:bg-emerald-50 text-gray-800 flex items-center justify-between border-b border-emerald-100 last:border-b-0 text-sm md:text-base ${
                          distanceRadius === option.value
                            ? "bg-gradient-to-r from-emerald-100 to-green-100"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              distanceRadius === option.value
                                ? "bg-gradient-to-r from-emerald-500 to-green-500"
                                : "bg-gray-300"
                            }`}
                          />
                          <span>{option.label}</span>
                        </div>
                        {distanceRadius === option.value && (
                          <span className="text-emerald-600 font-medium">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={hadleAppliedApplications}
                className="rounded-lg px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
              >
                Your Applications
              </button>
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

          {/* Clear All Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors shadow-lg hover:shadow-xl border border-gray-300 hover:border-gray-400"
            >
              <X className="w-4 h-4" />
              Clear All Filters
            </button>
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
                <span className="font-medium">
                  {distanceRadius} km radius applied
                </span>
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
            Software Engineer, Frontend Developer, Data Analyst, Product
            Manager, UX Designer, Marketing Manager, Sales Executive, Content
            Writer, Project Manager, Business Analyst
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobHeader;

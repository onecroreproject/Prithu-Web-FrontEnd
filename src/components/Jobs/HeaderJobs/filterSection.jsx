import React, { useState, useEffect } from "react";
import { Navigation, MapPin } from "lucide-react";

const FilterSection = ({
  selectedCategory,
  onSelectCategory,
  selectedCountry,
  onCountryChange,
  selectedCity,
  onCityChange,
  filters,
  onFilterChange,
  distanceRadius,
  onDistanceChange,
  userLocation,
  onGetLocation,
  locationLoading,
  locationError,
  distanceOptions,
  availableFilters = {},
  jobs = []
}) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    employmentType: false,
    workMode: false,
    salaryRange: false,
    experience: false,
    location: false,
    country: false
  });

  const [categorySearch, setCategorySearch] = useState("");

  // Default options for empty state
  const defaultEmploymentTypes = [
    { value: "freelance", label: "Freelance", count: 0 },
    { value: "full-time", label: "Full Time", count: 0 },
    { value: "internship", label: "Internship", count: 0 },
    { value: "part-time", label: "Part Time", count: 0 },
    { value: "temporary", label: "Temporary", count: 0 }
  ];

  const defaultWorkModes = [
    { value: "onsite", label: "On-site", count: 0 },
    { value: "remote", label: "Remote", count: 0 },
    { value: "hybrid", label: "Hybrid", count: 0 }
  ];

  const defaultSalaryRanges = [
    { value: "0-3", label: "₹0-3L", count: 0 },
    { value: "3-6", label: "₹3-6L", count: 0 },
    { value: "6-10", label: "₹6-10L", count: 0 },
    { value: "10-15", label: "₹10-15L", count: 0 },
    { value: "15-25", label: "₹15-25L", count: 0 },
    { value: "25+", label: "₹25L+", count: 0 }
  ];

  const defaultExperienceLevels = [
    { value: "0", label: "Fresher", count: 0 },
    { value: "1-3", label: "1-3 yrs", count: 0 },
    { value: "3-5", label: "3-5 yrs", count: 0 },
    { value: "5-8", label: "5-8 yrs", count: 0 },
    { value: "8+", label: "8+ yrs", count: 0 }
  ];

  // Default countries
  const defaultCountries = [
    { name: "United States", count: 0 },
    { name: "India", count: 0 },
    { name: "United Kingdom", count: 0 },
    { name: "Canada", count: 0 },
    { name: "Australia", count: 0 },
    { name: "Germany", count: 0 },
    { name: "France", count: 0 },
    { name: "Singapore", count: 0 },
    { name: "United Arab Emirates", count: 0 }
  ];

  // Use available filters or defaults
  const employmentTypes = availableFilters.employmentTypes?.length > 0 
    ? availableFilters.employmentTypes 
    : defaultEmploymentTypes;

  const workModes = availableFilters.workModes?.length > 0 
    ? availableFilters.workModes 
    : defaultWorkModes;

  const salaryRanges = availableFilters.salaryRanges?.length > 0 
    ? availableFilters.salaryRanges 
    : defaultSalaryRanges;

  const experienceLevels = availableFilters.experienceLevels?.length > 0 
    ? availableFilters.experienceLevels 
    : defaultExperienceLevels;

  // Get countries from available filters or use defaults
  const countries = availableFilters.locations?.countries?.length > 0 
    ? availableFilters.locations.countries 
    : defaultCountries;

  // Get categories from available filters or use static ones
  const categories = availableFilters.categories?.length > 0 
    ? availableFilters.categories 
    : [
        { name: "Accounting", count: 0 },
        { name: "Developer", count: 0 },
        { name: "Educations", count: 0 },
        { name: "Government", count: 0 },
        { name: "Media & News", count: 0 },
        { name: "Medical", count: 0 },
        { name: "Design", count: 0 },
        { name: "Technology", count: 0 },
        { name: "Business", count: 0 },
        { name: "Marketing", count: 0 }
      ];

  // Filter categories based on search
  const filteredCategories = categorySearch.trim() 
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
    : categories.slice(0, 6); // Show only first 6 by default

  // Toggle section
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleFilterChange = (key, value, isChecked) => {
    if (key === "employmentType") {
      const newTypes = isChecked
        ? [...(filters?.employmentType || []), value]
        : (filters?.employmentType || []).filter(v => v !== value);
      onFilterChange('employmentType', newTypes);
    } 
    else if (key === "workMode") {
      const newModes = isChecked
        ? [...(filters?.workMode || []), value]
        : (filters?.workMode || []).filter(v => v !== value);
      onFilterChange('workMode', newModes);
    }
    else if (key === "category") {
      onSelectCategory(value);
    }
    else if (key === "country") {
      onCountryChange(value === selectedCountry ? "" : value); // Toggle selection
    }
  };

  const isChecked = (key, value) => {
    if (key === "employmentType") {
      return (filters?.employmentType || []).includes(value);
    }
    else if (key === "workMode") {
      return (filters?.workMode || []).includes(value);
    }
    else if (key === "category") {
      return selectedCategory === value;
    }
    else if (key === "country") {
      return selectedCountry === value;
    }
    return false;
  };

  const shouldShowSection = (items) => {
    return items.some(item => item.count > 0);
  };

  // Employment Type Filter
  const renderEmploymentTypeFilter = () => {
    if (!shouldShowSection(employmentTypes)) return null;

    return (
      <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
        <div 
          className="bg-cyan-400 text-white px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('employmentType')}
        >
          <span>Jobs By Type</span>
          <span className="text-sm">{openSections.employmentType ? '−' : '+'}</span>
        </div>
        
        {openSections.employmentType && (
          <div className="p-4 space-y-3">
            {employmentTypes.map((type) => (
              type.count > 0 && (
                <label key={type.value} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={isChecked("employmentType", type.value)}
                      onChange={(e) => handleFilterChange("employmentType", type.value, e.target.checked)}
                      className="accent-red-500"
                    />
                    <span className="text-gray-700">{type.label}</span>
                  </div>
                  <span className="text-cyan-500 text-sm">({type.count})</span>
                </label>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  // Work Mode Filter
  const renderWorkModeFilter = () => {
    if (!shouldShowSection(workModes)) return null;

    return (
      <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
        <div 
          className="bg-cyan-400 text-white px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('workMode')}
        >
          <span>Work Mode</span>
          <span className="text-sm">{openSections.workMode ? '−' : '+'}</span>
        </div>
        
        {openSections.workMode && (
          <div className="p-4 space-y-3">
            {workModes.map((mode) => (
              mode.count > 0 && (
                <label key={mode.value} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      checked={isChecked("workMode", mode.value)}
                      onChange={(e) => handleFilterChange("workMode", mode.value, e.target.checked)}
                      className="accent-red-500"
                    />
                    <span className="text-gray-700">{mode.label}</span>
                  </div>
                  <span className="text-cyan-500 text-sm">({mode.count})</span>
                </label>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  // Category Filter
  const renderCategoryFilter = () => {
    if (!shouldShowSection(categories)) return null;

    return (
      <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
        <div 
          className="bg-cyan-400 text-white px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('categories')}
        >
          <span>Jobs By Category</span>
          <span className="text-sm">{openSections.categories ? '−' : '+'}</span>
        </div>
        
        {openSections.categories && (
          <div className="p-4 space-y-3">
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto space-y-3">
              {filteredCategories.map((category) => (
                category.count > 0 && (
                  <label 
                    key={category.name}
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.name}
                        onChange={() => onSelectCategory(category.name)}
                        className="accent-cyan-500"
                      />
                      <span className="text-gray-700">{category.name}</span>
                    </div>
                    <span className="text-cyan-500 text-sm">({category.count})</span>
                  </label>
                )
              ))}
            </div>
            
            {filteredCategories.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-2">
                No categories found
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Country Filter
  const renderCountryFilter = () => {
    if (countries.length === 0) return null;

    const hasJobsInCountries = countries.some(country => country.count > 0);
    if (!hasJobsInCountries) return null;

    return (
      <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
        <div 
          className="bg-cyan-400 text-white px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('country')}
        >
          <span>Jobs By Country</span>
          <span className="text-sm">{openSections.country ? '−' : '+'}</span>
        </div>
        
        {openSections.country && (
          <div className="p-4 space-y-3">
            {countries.slice(0, 10).map((country, index) => (
              country.count > 0 && (
                <label key={`country-${index}`} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      name="country"
                      checked={isChecked("country", country.name)}
                      onChange={(e) => handleFilterChange("country", country.name, e.target.checked)}
                      className="accent-red-500"
                    />
                    <span className="text-gray-700">{country.name}</span>
                  </div>
                  <span className="text-cyan-500 text-sm">({country.count})</span>
                </label>
              )
            ))}
            
            {countries.length > 10 && (
              <p className="text-cyan-600 text-sm cursor-pointer mt-2 hover:text-cyan-700">
                View {countries.length - 10} more countries »
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Salary Range Filter
  const renderSalaryFilter = () => {
    if (!shouldShowSection(salaryRanges)) return null;

    return (
      <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
        <div 
          className="bg-cyan-400 text-white px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('salaryRange')}
        >
          <span>Salary Range</span>
          <span className="text-sm">{openSections.salaryRange ? '−' : '+'}</span>
        </div>
        
        {openSections.salaryRange && (
          <div className="p-4 space-y-3">
            {salaryRanges.map((range) => (
              range.count > 0 && (
                <label key={range.value} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="salaryRange"
                      checked={filters?.salaryRange === range.value}
                      onChange={() => onFilterChange('salaryRange', range.value)}
                      className="accent-red-500"
                    />
                    <span className="text-gray-700">{range.label}</span>
                  </div>
                  <span className="text-cyan-500 text-sm">({range.count})</span>
                </label>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  // Experience Level Filter
  const renderExperienceFilter = () => {
    if (!shouldShowSection(experienceLevels)) return null;

    return (
      <div className="mb-6 border border-gray-300 rounded-lg overflow-hidden">
        <div 
          className="bg-cyan-400 text-white px-4 py-2 font-semibold flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('experience')}
        >
          <span>Experience Level</span>
          <span className="text-sm">{openSections.experience ? '−' : '+'}</span>
        </div>
        
        {openSections.experience && (
          <div className="p-4 space-y-3">
            {experienceLevels.map((level) => (
              level.count > 0 && (
                <label key={level.value} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="experience"
                      checked={filters?.experience === level.value}
                      onChange={() => onFilterChange('experience', level.value)}
                      className="accent-red-500"
                    />
                    <span className="text-gray-700">{level.label}</span>
                  </div>
                  <span className="text-cyan-500 text-sm">({level.count})</span>
                </label>
              )
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dynamic filters - only show if data exists */}
      {renderEmploymentTypeFilter()}
      {renderWorkModeFilter()}
      {renderCategoryFilter()}
      {renderCountryFilter()}
      {renderSalaryFilter()}
      {renderExperienceFilter()}

      {/* Show message if no filters available */}
      {!shouldShowSection(employmentTypes) && 
       !shouldShowSection(workModes) && 
       !shouldShowSection(categories) && 
       countries.length === 0 && 
       !shouldShowSection(salaryRanges) && 
       !shouldShowSection(experienceLevels) && (
        <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No filters available for current search</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or clear filters</p>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
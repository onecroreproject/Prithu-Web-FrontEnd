import React, { useState, useEffect, useRef } from "react";
import { GraduationCap, X, ChevronDown } from "lucide-react";

const FilterSection = ({
  selectedCategory,
  onSelectCategory,
  selectedCountry,
  onCountryChange,
  onCityChange,
  filters,
  onFilterChange,
  distanceRadius,
  onDistanceChange,
  userLocation,
  locationDetails,
  distanceOptions,
  availableFilters = {},
  jobs = [],
  allJobs = [] // Add allJobs prop for accurate filter counts
}) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    employmentType: true,
    workMode: true,
    salaryRange: true,
    experience: true,
    education: true,
    country: true
  });

  const [categorySearch, setCategorySearch] = useState("");
  const [educationSearch, setEducationSearch] = useState("");
  const [viewMorePopup, setViewMorePopup] = useState({
    isOpen: false,
    type: null,
    items: [],
    position: { top: 0, left: 0 }
  });

  // Refs for positioning
  const filterRefs = {
    employmentType: useRef(null),
    workMode: useRef(null),
    education: useRef(null),
    country: useRef(null),
    salaryRange: useRef(null),
    experience: useRef(null),
    categories: useRef(null)
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (viewMorePopup.isOpen && !event.target.closest('.view-more-popup') && !event.target.closest('.view-more-btn')) {
        setViewMorePopup({ isOpen: false, type: null, items: [], position: { top: 0, left: 0 } });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [viewMorePopup.isOpen]);

  // Extract categories from allJobs for accurate counts
  const getCategoriesFromJobs = () => {
    const jobsToUse = allJobs && allJobs.length > 0 ? allJobs : jobs;
    if (!jobsToUse || jobsToUse.length === 0) return [];

    const categoryMap = {};
    jobsToUse.forEach(job => {
      if (job.jobCategory || job.category) {
        const category = job.jobCategory || job.category;
        categoryMap[category] = (categoryMap[category] || 0) + 1;
      }
    });

    return Object.entries(categoryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Calculate employment types from allJobs for accurate counts
  const getEmploymentTypesFromJobs = () => {
    const jobsToUse = allJobs && allJobs.length > 0 ? allJobs : jobs;
    if (!jobsToUse || jobsToUse.length === 0) return [];

    const employmentTypeMap = {};
    jobsToUse.forEach(job => {
      if (job.employmentType) {
        const types = Array.isArray(job.employmentType)
          ? job.employmentType
          : [job.employmentType];

        types.forEach(type => {
          if (type) {
            const formattedType = type.toLowerCase();
            employmentTypeMap[formattedType] = (employmentTypeMap[formattedType] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(employmentTypeMap)
      .map(([value, count]) => ({
        value,
        label: value.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Calculate work modes from allJobs for accurate counts
  const getWorkModesFromJobs = () => {
    const jobsToUse = allJobs && allJobs.length > 0 ? allJobs : jobs;
    if (!jobsToUse || jobsToUse.length === 0) return [];

    const workModeMap = {};
    jobsToUse.forEach(job => {
      if (job.workMode) {
        const modes = Array.isArray(job.workMode)
          ? job.workMode
          : [job.workMode];

        modes.forEach(mode => {
          if (mode) {
            const formattedMode = mode.toLowerCase();
            workModeMap[formattedMode] = (workModeMap[formattedMode] || 0) + 1;
          }
        });
      }
    });

    return Object.entries(workModeMap)
      .map(([value, count]) => ({
        value,
        label: value.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        count
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Calculate education levels from allJobs for accurate counts - based on educationLevel field
  const getEducationLevelsFromJobs = () => {
    const jobsToUse = allJobs && allJobs.length > 0 ? allJobs : jobs;
    if (!jobsToUse || jobsToUse.length === 0) return [];

    const educationMap = {};
    jobsToUse.forEach(job => {
      if (job.educationLevel) {
        // Handle both string and array education levels
        const educationLevels = Array.isArray(job.educationLevel)
          ? job.educationLevel
          : [job.educationLevel];

        educationLevels.forEach(edu => {
          if (edu && edu.trim() !== "") {
            const eduKey = edu.trim().toLowerCase();
            educationMap[eduKey] = (educationMap[eduKey] || 0) + 1;
          }
        });
      }
    });

    // Create labels with proper capitalization
    return Object.entries(educationMap)
      .map(([value, count]) => {
        // Create a readable label from the value
        let label = value;

        // Handle common education level formats
        if (value.includes("bachelor") || value.includes("bachelor's")) {
          label = "Bachelor's Degree";
        } else if (value.includes("master") || value.includes("master's")) {
          label = "Master's Degree";
        } else if (value.includes("phd") || value.includes("doctorate")) {
          label = "PhD/Doctorate";
        } else if (value.includes("high school") || value.includes("secondary")) {
          label = "High School";
        } else if (value.includes("diploma")) {
          label = "Diploma";
        } else if (value.includes("associate")) {
          label = "Associate Degree";
        } else if (value.includes("certification")) {
          label = "Professional Certification";
        } else if (value.includes("vocational")) {
          label = "Vocational Training";
        } else if (value.includes("mba")) {
          label = "MBA";
        } else {
          // Capitalize first letter of each word
          label = value.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        }

        return {
          value: value, // Use original value for filtering
          label: label,
          count: count
        };
      })
      .sort((a, b) => b.count - a.count);
  };

  // Calculate salary ranges from allJobs for accurate counts
  const getSalaryRangesFromJobs = () => {
    const jobsToUse = allJobs && allJobs.length > 0 ? allJobs : jobs;
    if (!jobsToUse || jobsToUse.length === 0) return [];

    const salaryRanges = [
      { min: 0, max: 300000, value: "0-3", label: "₹0-3 LPA" },
      { min: 300000, max: 600000, value: "3-6", label: "₹3-6 LPA" },
      { min: 600000, max: 1000000, value: "6-10", label: "₹6-10 LPA" },
      { min: 1000000, max: 1500000, value: "10-15", label: "₹10-15 LPA" },
      { min: 1500000, max: 2500000, value: "15-25", label: "₹15-25 LPA" },
      { min: 2500000, max: Infinity, value: "25+", label: "₹25+ LPA" }
    ];

    const counts = salaryRanges.map(range => ({ ...range, count: 0 }));

    jobsToUse.forEach(job => {
      // Use salaryMin if available, otherwise try to parse salaryMax
      let salaryValue = 0;

      if (job.salaryMin && job.salaryMin > 0) {
        salaryValue = job.salaryMin;
      } else if (job.salaryMax && job.salaryMax > 0) {
        salaryValue = job.salaryMax;
      } else if (job.salaryRange) {
        // Try to parse from salaryRange string
        const match = job.salaryRange.match(/\d+/g);
        if (match && match.length > 0) {
          salaryValue = parseInt(match[0]) * 1000; // Convert to annual if in thousands
        }
      }

      if (salaryValue > 0) {
        counts.forEach(range => {
          if (salaryValue >= range.min && salaryValue < range.max) {
            range.count++;
          }
        });
      }
    });

    return counts.filter(range => range.count > 0);
  };

  // Calculate experience levels from allJobs for accurate counts
 // Calculate experience levels from allJobs - FIXED VERSION
// In FilterSection.js, update getExperienceLevelsFromJobs():
const getExperienceLevelsFromJobs = () => {
  const jobsToUse = allJobs && allJobs.length > 0 ? allJobs : jobs;
  if (!jobsToUse || jobsToUse.length === 0) return [];

  const experienceRanges = [
    { min: 0, max: 1, value: "0", label: "Fresher (0-1 yrs)" },
    { min: 1, max: 3, value: "1-3", label: "1-3 years" },
    { min: 3, max: 5, value: "3-5", label: "3-5 years" },
    { min: 5, max: 8, value: "5-8", label: "5-8 years" },
    { min: 8, max: Infinity, value: "8+", label: "8+ years" }
  ];

  // Initialize counts
  const counts = experienceRanges.map(range => ({ ...range, count: 0 }));

  jobsToUse.forEach(job => {
    let expValue = 0;

    // First try to get experience from common fields
    if (job.minimumExperience !== undefined && job.minimumExperience !== null) {
      expValue = parseFloat(job.minimumExperience);
    } else if (job.maximumExperience !== undefined && job.maximumExperience !== null) {
      expValue = parseFloat(job.maximumExperience);
    }

    // Handle NaN values
    if (isNaN(expValue)) {
      expValue = 0;
    }

    // Special handling for fresher jobs
    const isFresherJob = job.freshersAllowed === true ||
                         (job.minimumExperience === 0 && job.maximumExperience === 0 &&
                          (job.freshersAllowed === true || job.freshersAllowed === undefined));

    // Determine which range this job belongs to
    if (isFresherJob) {
      // Fresher jobs go in the 0-1 range
      counts[0].count++;
    } else {
      // For non-fresher jobs, use the experience value
      for (let i = 0; i < counts.length; i++) {
        const range = counts[i];

        if (range.value === "0") {
          // Skip fresher range for non-fresher jobs
          continue;
        }
        else if (range.value === "8+") {
          // 8+ years: 8 and above
          if (expValue >= range.min) {
            range.count++;
            break;
          }
        }
        else {
          // Other ranges: min <= expValue < max
          if (expValue >= range.min && expValue < range.max) {
            range.count++;
            break;
          }
        }
      }
    }
  });

  return counts.filter(range => range.count > 0);
};

  // Use calculated filters
  const employmentTypes = getEmploymentTypesFromJobs();
  const workModes = getWorkModesFromJobs();
  const educationLevels = getEducationLevelsFromJobs();
  const salaryRanges = getSalaryRangesFromJobs();
  const experienceLevels = getExperienceLevelsFromJobs();
  const categories = getCategoriesFromJobs();

  // Get countries from available filters or calculate from allJobs for accurate counts
  const getCountriesFromJobs = () => {
    const jobsToUse = allJobs && allJobs.length > 0 ? allJobs : jobs;
    if (!jobsToUse || jobsToUse.length === 0) return [];

    const countryMap = {};
    jobsToUse.forEach(job => {
      if (job.country) {
        countryMap[job.country] = (countryMap[job.country] || 0) + 1;
      }
    });

    return Object.entries(countryMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  };

  const countries = availableFilters.locations?.countries?.length > 0 
    ? availableFilters.locations.countries 
    : getCountriesFromJobs();

  // Filter categories based on search
  const filteredCategories = categorySearch.trim() 
    ? categories.filter(cat => 
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
      )
    : categories;

  // Filter education levels based on search
  const filteredEducationLevels = educationSearch.trim() 
    ? educationLevels.filter(edu => 
        edu.label.toLowerCase().includes(educationSearch.toLowerCase())
      )
    : educationLevels;

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
    else if (key === "education") {
      const newEducation = isChecked
        ? [...(filters?.education || []), value]
        : (filters?.education || []).filter(v => v !== value);
      onFilterChange('education', newEducation);
    }
    else if (key === "category") {
      onSelectCategory(value === selectedCategory ? "All" : value);
    }
    else if (key === "country") {
      onCountryChange(value === selectedCountry ? "" : value);
    }
    else if (key === "salaryRange") {
      onFilterChange('salaryRange', value === filters?.salaryRange ? "" : value);
    }
    else if (key === "experience") {
      onFilterChange('experience', value === filters?.experience ? "" : value);
    }
  };

  const isChecked = (key, value) => {
    if (key === "employmentType") {
      return (filters?.employmentType || []).includes(value);
    }
    else if (key === "workMode") {
      return (filters?.workMode || []).includes(value);
    }
    else if (key === "education") {
      return (filters?.education || []).includes(value);
    }
    else if (key === "category") {
      return selectedCategory === value;
    }
    else if (key === "country") {
      return selectedCountry === value;
    }
    else if (key === "salaryRange") {
      return filters?.salaryRange === value;
    }
    else if (key === "experience") {
      return filters?.experience === value;
    }
    return false;
  };

  const shouldShowSection = (items) => {
    return items && items.length > 0;
  };

  // Clear all filters
  const clearFilters = () => {
    onSelectCategory("All");
    onCountryChange("");
    onFilterChange('employmentType', []);
    onFilterChange('workMode', []);
    onFilterChange('education', []);
    onFilterChange('salaryRange', "");
    onFilterChange('experience', "");
  };

  // Clear specific filter
  const clearFilter = (type, value = null) => {
    switch (type) {
      case 'category':
        onSelectCategory("All");
        break;
      case 'country':
        onCountryChange("");
        break;
      case 'employmentType':
        onFilterChange('employmentType', []);
        break;
      case 'workMode':
        onFilterChange('workMode', []);
        break;
      case 'education':
        onFilterChange('education', []);
        break;
      case 'salaryRange':
        onFilterChange('salaryRange', "");
        break;
      case 'experience':
        onFilterChange('experience', "");
        break;
    }
  };

  // Active filters count
  const activeFiltersCount = [
    selectedCategory !== "All" ? 1 : 0,
    selectedCountry ? 1 : 0,
    filters.employmentType?.length || 0,
    filters.workMode?.length || 0,
    filters.education?.length || 0,
    filters.salaryRange ? 1 : 0,
    filters.experience ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  // Function to handle View More click
  const handleViewMoreClick = (type, items, event) => {
    event.stopPropagation();
    const ref = filterRefs[type];
    if (ref && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setViewMorePopup({
        isOpen: true,
        type,
        items,
        position: {
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX
        }
      });
    }
  };

  // Render View More Popup
  const renderViewMorePopup = () => {
    if (!viewMorePopup.isOpen) return null;

    const { type, items, position } = viewMorePopup;
    const title = {
      employmentType: "Employment Type",
      workMode: "Work Mode",
      education: "Education Level",
      country: "Country",
      salaryRange: "Salary Range",
      experience: "Experience Level",
      categories: "Job Category"
    }[type] || "Options";

    return (
      <div 
        className="view-more-popup fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          width: '600px',
          maxHeight: '400px'
        }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-800">{title}</h4>
            <button
              onClick={() => setViewMorePopup({ isOpen: false, type: null, items: [], position: { top: 0, left: 0 } })}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-2 overflow-y-auto max-h-80 pr-2">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col items-center p-2 hover:bg-gray-50 rounded-lg">
                <label className="flex flex-col items-center cursor-pointer w-full">
                  <div className="flex items-center justify-between w-full mb-1">
                    <input
                      type={type === 'employmentType' || type === 'workMode' || type === 'education' ? "checkbox" : "radio"}
                      checked={type === 'employmentType' || type === 'workMode' || type === 'education' 
                        ? (filters?.[type] || []).includes(item.value || item.name)
                        : type === 'country' 
                          ? selectedCountry === (item.name || item.value)
                          : type === 'categories'
                            ? selectedCategory === item.name
                            : filters?.[type] === item.value
                      }
                      onChange={(e) => {
                        if (type === 'employmentType' || type === 'workMode' || type === 'education') {
                          handleFilterChange(type, item.value || item.name, e.target.checked);
                        } else {
                          handleFilterChange(type, item.value || item.name, true);
                        }
                      }}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="text-xs text-gray-500 ml-1">({item.count})</span>
                  </div>
                  <span className="text-xs text-gray-700 text-center truncate w-full">
                    {item.label || item.name}
                  </span>
                </label>
              </div>
            ))}
          </div>
          
          {type === 'employmentType' || type === 'workMode' || type === 'education' ? (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => clearFilter(type)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear selection
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Generic render function for filters with View More
  const renderFilterWithViewMore = (type, title, items, icon = null, isRadio = false) => {
    if (!shouldShowSection(items)) return null;

    const visibleItems = items.slice(0, 5);
    const hasMore = items.length > 5;
    const activeCount = isRadio 
      ? (type === 'country' ? (selectedCountry ? 1 : 0) : 
         type === 'categories' ? (selectedCategory !== "All" ? 1 : 0) :
         (filters?.[type] ? 1 : 0))
      : (filters?.[type]?.length || 0);

    return (
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white" ref={filterRefs[type]}>
        <div 
          className="bg-blue-50 border-b border-gray-200 px-4 py-3 font-medium flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-gray-800">{title}</span>
            {activeCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <span className="text-gray-500 text-sm">{openSections[type] ? '−' : '+'}</span>
        </div>
        
        {openSections[type] && (
          <div className="p-3 space-y-2">
            <div className="max-h-60 overflow-y-auto pr-1">
              {/* "All" option for radio filters */}
              {isRadio && (
                <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio"
                      name={type}
                      checked={
                        type === 'country' ? !selectedCountry :
                        type === 'categories' ? selectedCategory === "All" :
                        !filters?.[type]
                      }
                      onChange={() => {
                        if (type === 'country') onCountryChange("");
                        else if (type === 'categories') onSelectCategory("All");
                        else onFilterChange(type, "");
                      }}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">
                      {type === 'country' ? 'All Countries' :
                       type === 'categories' ? 'All Categories' :
                       type === 'salaryRange' ? 'All Salaries' :
                       'All Experience'}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs">({jobs.length})</span>
                </label>
              )}
              
              {/* Visible items */}
              {visibleItems.map((item, index) => (
                <label key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type={isRadio ? "radio" : "checkbox"}
                      name={type}
                      checked={
                        isRadio
                          ? (type === 'country' ? selectedCountry === (item.name || item.value) :
                             type === 'categories' ? selectedCategory === item.name :
                             filters?.[type] === item.value)
                          : (filters?.[type] || []).includes(item.value || item.name)
                      }
                      onChange={(e) => {
                        if (isRadio) {
                          handleFilterChange(type, item.value || item.name, true);
                        } else {
                          handleFilterChange(type, item.value || item.name, e.target.checked);
                        }
                      }}
                      className={isRadio ? "accent-blue-600 w-4 h-4" : "accent-blue-600 w-4 h-4"}
                    />
                    <span className="text-gray-700 text-sm">{item.label || item.name}</span>
                  </div>
                  <span className="text-gray-500 text-xs">({item.count})</span>
                </label>
              ))}
              
              {/* View More button */}
              {hasMore && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => handleViewMoreClick(type, items, e)}
                    className="view-more-btn w-full text-center text-sm text-blue-600 hover:text-blue-700 py-1 flex items-center justify-center gap-1"
                  >
                    View More ({items.length - 5} more)
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {/* Clear selection for checkbox filters */}
            {!isRadio && activeCount > 0 && (
              <button
                onClick={() => clearFilter(type)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear selection
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  // Category Filter with search
  const renderCategoryFilter = () => {
    if (!shouldShowSection(categories)) return null;

    const visibleCategories = filteredCategories.slice(0, 5);
    const hasMore = filteredCategories.length > 5;
    const activeCount = selectedCategory !== "All" ? 1 : 0;

    return (
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white" ref={filterRefs.categories}>
        <div 
          className="bg-blue-50 border-b border-gray-200 px-4 py-3 font-medium flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => toggleSection('categories')}
        >
          <div className="flex items-center gap-2">
            <span className="text-gray-800">Job Category</span>
            {activeCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">{activeCount}</span>
            )}
          </div>
          <span className="text-gray-500 text-sm">{openSections.categories ? '−' : '+'}</span>
        </div>
        
        {openSections.categories && (
          <div className="p-3 space-y-2">
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto pr-1">
              {/* All Categories option */}
              <label className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === "All"}
                    onChange={() => onSelectCategory("All")}
                    className="accent-blue-600 w-4 h-4"
                  />
                  <span className="text-gray-700 text-sm">All Categories</span>
                </div>
                <span className="text-gray-500 text-xs">({jobs.length})</span>
              </label>
              
              {/* Visible categories */}
              {visibleCategories.map((category, index) => (
                <label key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === category.name}
                      onChange={() => handleFilterChange("category", category.name)}
                      className="accent-blue-600 w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">{category.name}</span>
                  </div>
                  <span className="text-gray-500 text-xs">({category.count})</span>
                </label>
              ))}
              
              {/* View More button */}
              {hasMore && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => handleViewMoreClick('categories', filteredCategories, e)}
                    className="view-more-btn w-full text-center text-sm text-blue-600 hover:text-blue-700 py-1 flex items-center justify-center gap-1"
                  >
                    View More ({filteredCategories.length - 5} more)
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {filteredCategories.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-3">
                No categories found
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Education Filter with search
  const renderEducationFilter = () => {
    if (!shouldShowSection(educationLevels)) return null;

    const visibleEducation = filteredEducationLevels.slice(0, 5);
    const hasMore = filteredEducationLevels.length > 5;
    const activeCount = filters.education?.length || 0;

    return (
      <div className="mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white" ref={filterRefs.education}>
        <div 
          className="bg-blue-50 border-b border-gray-200 px-4 py-3 font-medium flex justify-between items-center cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => toggleSection('education')}
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gray-600" />
            <span className="text-gray-800">Education Level</span>
            {activeCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <span className="text-gray-500 text-sm">{openSections.education ? '−' : '+'}</span>
        </div>
        
        {openSections.education && (
          <div className="p-3 space-y-2">
            <div className="mb-2">
              <input
                type="text"
                placeholder="Search education levels..."
                value={educationSearch}
                onChange={(e) => setEducationSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="max-h-60 overflow-y-auto pr-1">
              {/* Visible education levels */}
              {visibleEducation.map((education, index) => (
                <label key={index} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={isChecked("education", education.value)}
                      onChange={(e) => handleFilterChange("education", education.value, e.target.checked)}
                      className="accent-purple-600 w-4 h-4"
                    />
                    <span className="text-gray-700 text-sm">{education.label}</span>
                  </div>
                  <span className="text-gray-500 text-xs">({education.count})</span>
                </label>
              ))}
              
              {/* View More button */}
              {hasMore && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={(e) => handleViewMoreClick('education', filteredEducationLevels, e)}
                    className="view-more-btn w-full text-center text-sm text-blue-600 hover:text-blue-700 py-1 flex items-center justify-center gap-1"
                  >
                    View More ({filteredEducationLevels.length - 5} more)
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            
            {filteredEducationLevels.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-3">
                No education levels found
              </p>
            )}
            
            {activeCount > 0 && (
              <button
                onClick={() => clearFilter('education')}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear selection
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 relative">
      {/* View More Popup */}
      {renderViewMorePopup()}

      {/* Filters Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">{activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active</span>
          </p>
        </div>
      )}

      {/* Dynamic filters - only show if data exists */}
      {renderCategoryFilter()}
      {renderFilterWithViewMore('employmentType', 'Employment Type', employmentTypes)}
      {renderFilterWithViewMore('workMode', 'Work Mode', workModes)}
      {renderEducationFilter()}
      {renderFilterWithViewMore('country', 'Country', countries, null, true)}
      {renderFilterWithViewMore('salaryRange', 'Salary Range', salaryRanges, null, true)}
      {renderFilterWithViewMore('experience', 'Experience Level', experienceLevels, null, true)}

      {/* Show message if no filters available */}
      {!shouldShowSection(employmentTypes) && 
       !shouldShowSection(workModes) && 
       !shouldShowSection(educationLevels) && 
       !shouldShowSection(categories) && 
       !shouldShowSection(countries) && 
       !shouldShowSection(salaryRanges) && 
       !shouldShowSection(experienceLevels) && (
        <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-sm">No filters available</p>
          <p className="text-gray-400 text-xs mt-1">Try searching for different jobs</p>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
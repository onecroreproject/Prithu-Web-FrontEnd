import React, { useState, useMemo } from "react";
import categoryData from "../../../JsonFile/jobSelection.json";

// Move FilterSection component outside to prevent re-renders
const FilterSection = ({ title, sectionKey, children, isOpen, onToggle }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-2">
    <div 
      className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
      onClick={() => onToggle(sectionKey)}
    >
      <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      <svg 
        className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
    
    {isOpen && (
      <div className="p-3 border-t border-gray-100">
        {children}
      </div>
    )}
  </div>
);

// Move CheckboxItem component outside
const CheckboxItem = ({ label, checked, onChange, value }) => (
  <label className="flex items-center py-1 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      value={value}
      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    />
    <span className="ml-2 text-sm text-gray-700">{label}</span>
  </label>
);

// Move RadioItem component outside
const RadioItem = ({ label, checked, onChange, value, name }) => (
  <label className="flex items-center py-1 cursor-pointer">
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      value={value}
      className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300"
    />
    <span className="ml-2 text-sm text-gray-700">{label}</span>
  </label>
);

const JobFilter = ({
  onOpenFullTimeJobs,
  onOpenFreelancer,
  selectedCategory,
  onSelectCategory,
  onCountryChange,
  onCityChange,
  filters,
  onFilterChange,
}) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    employmentType: false,
    workMode: false,
    salaryRange: false,
    experience: false
  });

  const [categorySearch, setCategorySearch] = useState("");

  // Filter options
  const employmentTypes = [
    { value: "full-time", label: "Full Time" },
    { value: "part-time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "internship", label: "Internship" },
    { value: "freelance", label: "Freelance" }
  ];

  const workModes = [
    { value: "onsite", label: "On-site" },
    { value: "remote", label: "Remote" },
    { value: "hybrid", label: "Hybrid" }
  ];

  const salaryRanges = [
    { value: "0-3", label: "₹0-3L" },
    { value: "3-6", label: "₹3-6L" },
    { value: "6-10", label: "₹6-10L" },
    { value: "10-15", label: "₹10-15L" },
    { value: "15-25", label: "₹15-25L" },
    { value: "25+", label: "₹25L+" }
  ];

  const experienceLevels = [
    { value: "0", label: "Fresher" },
    { value: "1-3", label: "1-3 yrs" },
    { value: "3-5", label: "3-5 yrs" },
    { value: "5-8", label: "5-8 yrs" },
    { value: "8+", label: "8+ yrs" }
  ];

  const popularSkills = [
    "JavaScript", "React", "Node.js", "Python", "Java", "HTML/CSS",
    "SQL", "AWS", "Docker", "Git"
  ];

  // Get all unique categories
  const allCategories = useMemo(() => 
    [...new Set(categoryData.mainCategories.flatMap(section => section.items))],
    []
  );

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) {
      return categoryData.mainCategories;
    }

    const searchTerm = categorySearch.toLowerCase();
    
    return categoryData.mainCategories.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.toLowerCase().includes(searchTerm)
      )
    })).filter(section => section.items.length > 0);
  }, [categorySearch]);

  // Toggle section
  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Get active filters for display
  const activeFilters = useMemo(() => {
    const filtersList = [];

    if (selectedCategory && selectedCategory !== "All") {
      filtersList.push({
        key: 'category',
        label: selectedCategory,
        onRemove: () => onSelectCategory("All")
      });
    }

    if (filters?.employmentType?.length > 0) {
      filters.employmentType.forEach(type => {
        const typeObj = employmentTypes.find(t => t.value === type);
        if (typeObj) {
          filtersList.push({
            key: `employment-${type}`,
            label: typeObj.label,
            onRemove: () => {
              const newTypes = filters.employmentType.filter(t => t !== type);
              onFilterChange('employmentType', newTypes);
            }
          });
        }
      });
    }

    if (filters?.workMode?.length > 0) {
      filters.workMode.forEach(mode => {
        const modeObj = workModes.find(m => m.value === mode);
        if (modeObj) {
          filtersList.push({
            key: `workmode-${mode}`,
            label: modeObj.label,
            onRemove: () => {
              const newModes = filters.workMode.filter(m => m !== mode);
              onFilterChange('workMode', newModes);
            }
          });
        }
      });
    }

    if (filters?.salaryRange) {
      const range = salaryRanges.find(r => r.value === filters.salaryRange);
      if (range) {
        filtersList.push({
          key: 'salary',
          label: range.label,
          onRemove: () => onFilterChange('salaryRange', '')
        });
      }
    }

    if (filters?.experience) {
      const exp = experienceLevels.find(e => e.value === filters.experience);
      if (exp) {
        filtersList.push({
          key: 'experience',
          label: exp.label,
          onRemove: () => onFilterChange('experience', '')
        });
      }
    }

    if (filters?.skills?.length > 0) {
      filters.skills.forEach(skill => {
        filtersList.push({
          key: `skill-${skill}`,
          label: skill,
          onRemove: () => {
            const newSkills = filters.skills.filter(s => s !== skill);
            onFilterChange('skills', newSkills);
          }
        });
      });
    }

    return filtersList;
  }, [selectedCategory, filters, employmentTypes, workModes, salaryRanges, experienceLevels]);

  // Clear all filters
  const clearAllFilters = () => {
    onSelectCategory("All");
    onCountryChange("");
    onCityChange("");
    setCategorySearch("");
    
    const filterKeys = [
      'employmentType', 'workMode', 'salaryRange', 'experience', 
      'skills'
    ];
    
    filterKeys.forEach(key => {
      onFilterChange(key, Array.isArray(filters?.[key]) ? [] : '');
    });
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg  p-2">
        <h2 className="font-semibold text-gray-900 text-lg mb-3">Filters</h2>
        
        
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Active Filters</span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map(filter => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
              >
                {filter.label}
                <button
                  onClick={filter.onRemove}
                  className="hover:bg-blue-100 rounded text-xs w-3 h-3 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <FilterSection 
        title="Categories" 
        sectionKey="categories"
        isOpen={openSections.categories}
        onToggle={toggleSection}
      >
        {/* Search Bar */}
        <div className="mb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {categorySearch && (
              <button
                onClick={() => setCategorySearch("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="space-y-1 max-h-48 overflow-y-auto">
          <div
            className={`flex items-center p-2 rounded cursor-pointer text-sm ${
              selectedCategory === "All" ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"
            }`}
            onClick={() => onSelectCategory("All")}
          >
            <div className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
              selectedCategory === "All" ? "border-blue-600 bg-blue-600" : "border-gray-400"
            }`}>
              {selectedCategory === "All" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            All Categories
          </div>

          {filteredCategories.length > 0 ? (
            filteredCategories.map((section) => (
              <div key={section.title} className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide pt-2">
                  {section.title}
                </div>
                {section.items.map((category) => (
                  <div
                    key={category}
                    className={`flex items-center p-2 rounded cursor-pointer text-sm ${
                      selectedCategory === category ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50"
                    }`}
                    onClick={() => onSelectCategory(category)}
                  >
                    <div className={`w-3.5 h-3.5 rounded-full border mr-2 flex items-center justify-center ${
                      selectedCategory === category ? "border-blue-600 bg-blue-600" : "border-gray-400"
                    }`}>
                      {selectedCategory === category && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    {category}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              No categories found matching "{categorySearch}"
            </div>
          )}
        </div>
      </FilterSection>

      {/* Employment Type */}
      <FilterSection 
        title="Employment Type" 
        sectionKey="employmentType"
        isOpen={openSections.employmentType}
        onToggle={toggleSection}
      >
        <div className="space-y-0">
          {employmentTypes.map((type) => (
            <CheckboxItem
              key={type.value}
              label={type.label}
              value={type.value}
              checked={filters?.employmentType?.includes(type.value) || false}
              onChange={(e) => {
                const newTypes = e.target.checked
                  ? [...(filters?.employmentType || []), type.value]
                  : (filters?.employmentType || []).filter(t => t !== type.value);
                onFilterChange('employmentType', newTypes);
              }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Work Mode */}
      <FilterSection 
        title="Work Mode" 
        sectionKey="workMode"
        isOpen={openSections.workMode}
        onToggle={toggleSection}
      >
        <div className="space-y-0">
          {workModes.map((mode) => (
            <CheckboxItem
              key={mode.value}
              label={mode.label}
              value={mode.value}
              checked={filters?.workMode?.includes(mode.value) || false}
              onChange={(e) => {
                const newModes = e.target.checked
                  ? [...(filters?.workMode || []), mode.value]
                  : (filters?.workMode || []).filter(m => m !== mode.value);
                onFilterChange('workMode', newModes);
              }}
            />
          ))}
        </div>
      </FilterSection>

      {/* Salary Range */}
      <FilterSection 
        title="Salary Range" 
        sectionKey="salaryRange"
        isOpen={openSections.salaryRange}
        onToggle={toggleSection}
      >
        <div className="space-y-0">
          {salaryRanges.map((range) => (
            <RadioItem
              key={range.value}
              label={range.label}
              value={range.value}
              name="salaryRange"
              checked={filters?.salaryRange === range.value}
              onChange={(e) => onFilterChange('salaryRange', e.target.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Experience Level */}
      <FilterSection 
        title="Experience" 
        sectionKey="experience"
        isOpen={openSections.experience}
        onToggle={toggleSection}
      >
        <div className="space-y-0">
          {experienceLevels.map((level) => (
            <RadioItem
              key={level.value}
              label={level.label}
              value={level.value}
              name="experience"
              checked={filters?.experience === level.value}
              onChange={(e) => onFilterChange('experience', e.target.value)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Skills */}
      <FilterSection 
        title="Skills" 
        sectionKey="skills"
        isOpen={openSections.skills}
        onToggle={toggleSection}
      >
        <div className="space-y-0 max-h-40 overflow-y-auto">
          {popularSkills.map((skill) => (
            <CheckboxItem
              key={skill}
              label={skill}
              value={skill}
              checked={filters?.skills?.includes(skill) || false}
              onChange={(e) => {
                const newSkills = e.target.checked
                  ? [...(filters?.skills || []), skill]
                  : (filters?.skills || []).filter(s => s !== skill);
                onFilterChange('skills', newSkills);
              }}
            />
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default JobFilter;
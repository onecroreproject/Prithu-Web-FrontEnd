import React, { useState, useMemo } from "react";
import categoryData from "../../../JsonFile/jobSelection.json";

const JobFilter = ({
  onOpenFullTimeJobs,
  onOpenFreelancer,
  selectedCategory,
  onSelectCategory,
  onCountryChange,
  onCityChange,
  filters,
  onFilterChange,
  searchText,
  onSearchChange
}) => {
  const [openSections, setOpenSections] = useState({
    categories: true,
    locations: true,
    employmentType: false,
    workMode: false,
    salaryRange: false,
    experience: false,
    education: false,
    skills: false,
    companyIndustry: false,
    jobFreshness: false
  });

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
    { value: "0-3", label: "₹0 - 3 LPA" },
    { value: "3-6", label: "₹3 - 6 LPA" },
    { value: "6-10", label: "₹6 - 10 LPA" },
    { value: "10-15", label: "₹10 - 15 LPA" },
    { value: "15-25", label: "₹15 - 25 LPA" },
    { value: "25+", label: "₹25+ LPA" }
  ];

  const experienceLevels = [
    { value: "0", label: "Fresher" },
    { value: "1-3", label: "1-3 years" },
    { value: "3-5", label: "3-5 years" },
    { value: "5-8", label: "5-8 years" },
    { value: "8+", label: "8+ years" }
  ];

  const educationLevels = [
    { value: "high-school", label: "High School" },
    { value: "diploma", label: "Diploma" },
    { value: "bachelor", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" }
  ];

  const popularSkills = [
    "JavaScript", "React", "Node.js", "Python", "Java", "HTML/CSS",
    "SQL", "MongoDB", "AWS", "Docker", "Git", "TypeScript"
  ];

  const jobFreshnessOptions = [
    { value: "1", label: "Last 24 hours" },
    { value: "7", label: "Last 7 days" },
    { value: "30", label: "Last 30 days" }
  ];

  const industries = [
    "IT Services", "Finance", "Healthcare", "Education", "E-commerce",
    "Manufacturing", "Marketing", "Consulting"
  ];

  // Get all unique categories
  const allCategories = useMemo(() => 
    [...new Set(categoryData.mainCategories.flatMap(section => section.items))],
    []
  );

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

    // Category filter
    if (selectedCategory && selectedCategory !== "All") {
      filtersList.push({
        key: 'category',
        label: selectedCategory,
        onRemove: () => onSelectCategory("All")
      });
    }

    // Employment Type filters
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

    // Work Mode filters
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

    // Salary Range
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

    // Experience
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

    // Education
    if (filters?.education?.length > 0) {
      filters.education.forEach(edu => {
        const eduObj = educationLevels.find(e => e.value === edu);
        if (eduObj) {
          filtersList.push({
            key: `education-${edu}`,
            label: eduObj.label,
            onRemove: () => {
              const newEducation = filters.education.filter(e => e !== edu);
              onFilterChange('education', newEducation);
            }
          });
        }
      });
    }

    // Skills
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

    // Company Industry
    if (filters?.companyIndustry) {
      filtersList.push({
        key: 'industry',
        label: filters.companyIndustry,
        onRemove: () => onFilterChange('companyIndustry', '')
      });
    }

    // Job Freshness
    if (filters?.jobFreshness) {
      const freshness = jobFreshnessOptions.find(f => f.value === filters.jobFreshness);
      if (freshness) {
        filtersList.push({
          key: 'freshness',
          label: freshness.label,
          onRemove: () => onFilterChange('jobFreshness', '')
        });
      }
    }

    return filtersList;
  }, [selectedCategory, filters, employmentTypes, workModes, salaryRanges, experienceLevels, educationLevels, jobFreshnessOptions]);

  // Clear all filters
  const clearAllFilters = () => {
    onSelectCategory("All");
    onCountryChange("");
    onCityChange("");
    
    const filterKeys = [
      'employmentType', 'workMode', 'salaryRange', 'experience', 
      'education', 'skills', 'companyIndustry', 'jobFreshness'
    ];
    
    filterKeys.forEach(key => {
      onFilterChange(key, Array.isArray(filters?.[key]) ? [] : '');
    });
  };

  // Filter section component
  const FilterSection = ({ title, sectionKey, children }) => (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => toggleSection(sectionKey)}
      >
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            openSections[sectionKey] ? "rotate-180" : ""
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <div className={`transition-all duration-200 overflow-hidden ${
        openSections[sectionKey] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}>
        <div className="p-4 border-t border-gray-100">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Job Posting Buttons */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onOpenFullTimeJobs}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Full Time Jobs
          </button>
          <button
            onClick={onOpenFreelancer}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
          >
            Freelance Work
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
            placeholder="Search jobs..."
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Active Filters</h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map(filter => (
              <span
                key={filter.key}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {filter.label}
                <button
                  onClick={filter.onRemove}
                  className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <FilterSection title="Categories" sectionKey="categories">
        <div className="space-y-2 max-h-60 overflow-y-auto">
          <div
            className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
              selectedCategory === "All" ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
            }`}
            onClick={() => onSelectCategory("All")}
          >
            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
              selectedCategory === "All" ? "border-blue-600 bg-blue-600" : "border-gray-300"
            }`}>
              {selectedCategory === "All" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </div>
            <span className="text-sm">All Categories</span>
          </div>

          {categoryData.mainCategories.map((section) => (
            <div key={section.title} className="space-y-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {section.title}
              </div>
              {section.items.map((category) => (
                <div
                  key={category}
                  className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === category ? "bg-blue-50 text-blue-700" : "hover:bg-gray-50"
                  }`}
                  onClick={() => onSelectCategory(category)}
                >
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                    selectedCategory === category ? "border-blue-600 bg-blue-600" : "border-gray-300"
                  }`}>
                    {selectedCategory === category && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                  <span className="text-sm">{category}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </FilterSection>


      {/* Employment Type */}
      <FilterSection title="Employment Type" sectionKey="employmentType">
        <div className="space-y-2">
          {employmentTypes.map((type) => (
            <label key={type.value} className="flex items-center">
              <input
                type="checkbox"
                value={type.value}
                checked={filters?.employmentType?.includes(type.value) || false}
                onChange={(e) => {
                  const newTypes = e.target.checked
                    ? [...(filters?.employmentType || []), type.value]
                    : (filters?.employmentType || []).filter(t => t !== type.value);
                  onFilterChange('employmentType', newTypes);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Work Mode */}
      <FilterSection title="Work Mode" sectionKey="workMode">
        <div className="space-y-2">
          {workModes.map((mode) => (
            <label key={mode.value} className="flex items-center">
              <input
                type="checkbox"
                value={mode.value}
                checked={filters?.workMode?.includes(mode.value) || false}
                onChange={(e) => {
                  const newModes = e.target.checked
                    ? [...(filters?.workMode || []), mode.value]
                    : (filters?.workMode || []).filter(m => m !== mode.value);
                  onFilterChange('workMode', newModes);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{mode.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Salary Range */}
      <FilterSection title="Salary Range" sectionKey="salaryRange">
        <div className="space-y-2">
          {salaryRanges.map((range) => (
            <label key={range.value} className="flex items-center">
              <input
                type="radio"
                name="salaryRange"
                value={range.value}
                checked={filters?.salaryRange === range.value}
                onChange={(e) => onFilterChange('salaryRange', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Experience Level */}
      <FilterSection title="Experience Level" sectionKey="experience">
        <div className="space-y-2">
          {experienceLevels.map((level) => (
            <label key={level.value} className="flex items-center">
              <input
                type="radio"
                name="experience"
                value={level.value}
                checked={filters?.experience === level.value}
                onChange={(e) => onFilterChange('experience', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Education Level */}
      <FilterSection title="Education Level" sectionKey="education">
        <div className="space-y-2">
          {educationLevels.map((level) => (
            <label key={level.value} className="flex items-center">
              <input
                type="checkbox"
                value={level.value}
                checked={filters?.education?.includes(level.value) || false}
                onChange={(e) => {
                  const newEducation = e.target.checked
                    ? [...(filters?.education || []), level.value]
                    : (filters?.education || []).filter(l => l !== level.value);
                  onFilterChange('education', newEducation);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Skills */}
      <FilterSection title="Skills" sectionKey="skills">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {popularSkills.map((skill) => (
            <label key={skill} className="flex items-center">
              <input
                type="checkbox"
                value={skill}
                checked={filters?.skills?.includes(skill) || false}
                onChange={(e) => {
                  const newSkills = e.target.checked
                    ? [...(filters?.skills || []), skill]
                    : (filters?.skills || []).filter(s => s !== skill);
                  onFilterChange('skills', newSkills);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Company Industry */}
      <FilterSection title="Company Industry" sectionKey="companyIndustry">
        <select
          value={filters?.companyIndustry || ""}
          onChange={(e) => onFilterChange('companyIndustry', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        >
          <option value="">All Industries</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </FilterSection>

      {/* Job Freshness */}
      <FilterSection title="Job Posted" sectionKey="jobFreshness">
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="jobFreshness"
              value=""
              checked={!filters?.jobFreshness}
              onChange={(e) => onFilterChange('jobFreshness', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">Any time</span>
          </label>
          {jobFreshnessOptions.map(option => (
            <label key={option.value} className="flex items-center">
              <input
                type="radio"
                name="jobFreshness"
                value={option.value}
                checked={filters?.jobFreshness === option.value}
                onChange={(e) => onFilterChange('jobFreshness', e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
};

export default JobFilter;
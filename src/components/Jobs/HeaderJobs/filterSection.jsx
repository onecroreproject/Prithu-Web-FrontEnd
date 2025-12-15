import React, { useState, useMemo } from "react";
import categoryData from "../../../JsonFile/jobSelection.json";

const FilterSection = ({
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
    experience: false,
    skills: false
  });

  const [categorySearch, setCategorySearch] = useState("");

  // Filter options
  const employmentTypes = [
    { value: "freelance", label: "Freelance" },
    { value: "full-time", label: "Full Time" },
    { value: "internship", label: "Internship" },
    { value: "part-time", label: "Part Time" },
    { value: "temporary", label: "Temporary" }
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
    "SQL", "AWS", "Docker", "Git", "frontend", "backend", "design", 
    "marketing", "seo", "social media", "php", "web", "mobile", 
    "graphics", "illustrator", "medical", "data"
  ];

  const jobLocations = [
    { name: "Delhi", count: 6 },
    { name: "Chennai", count: 2 },
    { name: "Bangalore", count: 1 },
    { name: "Hyderabad", count: 1 },
    { name: "Mumbai", count: 1 },
    { name: "Remote", count: 2 }
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

  // Count items by category
  const countItemsByCategory = (categoryName) => {
    // This would come from your actual job data
    // For now, returning mock counts
    const mockCounts = {
      "Accounting": 1,
      "Developer": 7,
      "Educations": 0,
      "Government": 0,
      "Media & News": 4,
      "Medical": 2,
      "Design": 3,
      "Technology": 8,
      "Business": 5,
      "Marketing": 4
    };
    return mockCounts[categoryName] || 0;
  };

  // Count items by type
  const countItemsByType = (typeValue) => {
    // This would come from your actual job data
    const mockCounts = {
      "freelance": 9,
      "full-time": 3,
      "internship": 2,
      "part-time": 3,
      "temporary": 2
    };
    return mockCounts[typeValue] || 0;
  };

  const filterBoxes = [
    {
      title: "Jobs By Types",
      items: employmentTypes.map(type => [type.label, countItemsByType(type.value)]),
      type: "checkbox",
      key: "employmentType"
    },
    {
      title: "Jobs By Category",
      items: allCategories.slice(0, 6).map(cat => [cat, countItemsByCategory(cat)]),
      type: "radio",
      key: "category"
    },
    {
      title: "Jobs By Location",
      items: jobLocations.map(loc => [loc.name, loc.count]),
      type: "checkbox",
      key: "location"
    },
    {
      title: "Jobs By Skills",
      items: popularSkills.slice(0, 6).map(skill => [skill, 0]),
      type: "checkbox",
      key: "skills"
    }
  ];

  const handleFilterChange = (boxKey, value, isChecked) => {
    if (boxKey === "employmentType") {
      const newTypes = isChecked
        ? [...(filters?.employmentType || []), value]
        : (filters?.employmentType || []).filter(v => v !== value);
      onFilterChange('employmentType', newTypes);
    } 
    else if (boxKey === "category") {
      onSelectCategory(value);
    }
    else if (boxKey === "skills") {
      const newSkills = isChecked
        ? [...(filters?.skills || []), value]
        : (filters?.skills || []).filter(v => v !== value);
      onFilterChange('skills', newSkills);
    }
    else if (boxKey === "location") {
      // Handle location filter
      onCityChange(value);
    }
  };

  const isChecked = (boxKey, value) => {
    if (boxKey === "employmentType") {
      return (filters?.employmentType || []).includes(value);
    }
    else if (boxKey === "category") {
      return selectedCategory === value;
    }
    else if (boxKey === "skills") {
      return (filters?.skills || []).includes(value);
    }
    else if (boxKey === "location") {
      // For location, you might want to check city or country
      return false; // Implement based on your needs
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {filterBoxes.map((box, index) => (
        <div
          key={index}
          className="border border-gray-300 rounded-lg overflow-hidden"
        >
          <div className="bg-cyan-400 text-white px-4 py-2 font-semibold">
            {box.title}
          </div>

          <div className="p-4 space-y-3">
            {box.items.map(([name, count], i) => (
              <label key={i} className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-1 rounded">
                <div className="flex items-center gap-2">
                  <input 
                    type={box.type}
                    checked={isChecked(box.key, name.toLowerCase())}
                    onChange={(e) => handleFilterChange(box.key, name.toLowerCase(), e.target.checked)}
                    className="accent-red-500"
                  />
                  <span className="text-gray-700">{name}</span>
                </div>
                <span className="text-cyan-500 text-sm">({count})</span>
              </label>
            ))}
            
            {/* Show more link for categories */}
            {box.key === "category" && (
              <div className="pt-2 border-t border-gray-200">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredCategories.map((section) => (
                    <div key={section.title} className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide pt-2">
                        {section.title}
                      </div>
                      {section.items.map((category) => (
                        <label 
                          key={category}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category}
                            onChange={() => onSelectCategory(category)}
                            className="accent-cyan-500"
                          />
                          <span className="text-sm text-gray-700">{category}</span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-cyan-600 text-sm cursor-pointer mt-2 hover:text-cyan-700">
              View More »
            </p>
          </div>
        </div>
      ))}

      {/* Additional Filters for Salary and Experience */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-cyan-400 text-white px-4 py-2 font-semibold">
          Salary Range
        </div>
        <div className="p-4 space-y-3">
          {salaryRanges.map((range) => (
            <label key={range.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name="salaryRange"
                checked={filters?.salaryRange === range.value}
                onChange={() => onFilterChange('salaryRange', range.value)}
                className="accent-red-500"
              />
              <span className="text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div className="bg-cyan-400 text-white px-4 py-2 font-semibold">
          Experience Level
        </div>
        <div className="p-4 space-y-3">
          {experienceLevels.map((level) => (
            <label key={level.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="radio"
                name="experience"
                checked={filters?.experience === level.value}
                onChange={() => onFilterChange('experience', level.value)}
                className="accent-red-500"
              />
              <span className="text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSection;
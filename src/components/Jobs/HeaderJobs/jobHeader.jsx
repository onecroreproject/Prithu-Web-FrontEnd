import React, { useState } from "react";
import { FiTag, FiMapPin, FiBriefcase } from "react-icons/fi";
import { Search, Filter } from "lucide-react";

const JobHeader = ({ 
  searchText, 
  onSearchChange, 
  selectedCity, 
  onCityChange, 
  selectedCountry, 
  onCountryChange,
  selectedCategory,
  onCategoryChange,
  filters,
  onFilterChange
}) => {
  const [localSearch, setLocalSearch] = useState(searchText);
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

  const handleJobTypeToggle = (type) => {
    const newTypes = selectedJobTypes.includes(type)
      ? selectedJobTypes.filter(t => t !== type)
      : [...selectedJobTypes, type];
    
    setSelectedJobTypes(newTypes);
    onFilterChange('employmentType', newTypes);
  };

  return (
    <div className="w-full bg-[#0d1c2e] py-20 px-4">
      <div className="max-w-6xl mx-auto text-center text-white">
        
        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-bold">
          <span className="text-cyan-400">1000+</span> Job Opportunities Await
        </h1>

        <p className="mt-3 text-lg opacity-90">
          Discover Careers, Vacancies & Professional Paths
        </p>

        {/* Search Box */}
        <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 md:p-8 mt-10 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Keywords */}
            <div className="flex flex-col text-left">
              <label className="text-sm mb-1 opacity-80 flex items-center gap-1">
                <Search className="w-4 h-4" />
                Keywords
              </label>
              <input
                type="text"
                placeholder="Job title, skills or tags..."
                value={localSearch}
                onChange={handleSearch}
                className="w-full rounded-lg px-4 py-3 bg-white text-gray-900 outline-none border border-gray-300 focus:border-cyan-400"
              />
            </div>

            {/* Location */}
            <div className="flex flex-col text-left">
              <label className="text-sm mb-1 opacity-80 flex items-center gap-1">
                <FiMapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                placeholder="Enter city..."
                value={selectedCity}
                onChange={(e) => onCityChange(e.target.value)}
                className="w-full rounded-lg px-4 py-3 bg-white text-gray-900 outline-none border border-gray-300 focus:border-cyan-400"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col text-left">
              <label className="text-sm mb-1 opacity-80 flex items-center gap-1">
                <FiBriefcase className="w-4 h-4" />
                Category
              </label>
              <input
                type="text"
                placeholder="Enter job category..."
                value={selectedCategory !== "All" ? selectedCategory : ""}
                onChange={(e) => onCategoryChange(e.target.value || "All")}
                className="w-full rounded-lg px-4 py-3 bg-white text-gray-900 outline-none border border-gray-300 focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Job Types */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-white mt-6 px-1">
            {jobTypes.map((type) => (
              <label 
                key={type.value} 
                className="flex items-center gap-2 cursor-pointer hover:text-cyan-300 transition-colors"
              >
                <input
                  type="checkbox"
                  className="accent-cyan-400"
                  checked={selectedJobTypes.includes(type.value)}
                  onChange={() => handleJobTypeToggle(type.value)}
                />
                <span>{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Trending Keywords */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center text-white gap-2">
          <div className="flex items-center gap-2">
            <FiTag className="text-cyan-400" />
            <span className="font-medium">Popular Searches:</span>
          </div>
          <span className="opacity-90 text-sm md:text-base">
            software engineer, graphic design, tech firms, media sector, latest roles, hiring now, workspace, healthcare jobs
          </span>
        </div>
      </div>
    </div>
  );
};

export default JobHeader;
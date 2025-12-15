import React, { useState, useEffect } from "react";
import JobHeader from "./JobLayout";
import TopCompanies from "./topCompanies";
import FilterSection from "./filterSection";
import JobCards from "./JobCards";
import { getAllJobs } from "../../../Service/jobservices";
import { useLocation, useSearchParams } from "react-router-dom";
import { Heart, X, Briefcase , MapPin  } from "lucide-react";
import Header from "../../Header";

const JobLayout = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const jobIdParam = searchParams.get("jobId");

  const location = useLocation();

  // Get URL parameters
  const roleParam = searchParams.get("role");
  const cityParam = searchParams.get("city");
  const stateParam = searchParams.get("state");
  const countryParam = searchParams.get("country");
  const companyParam = searchParams.get("company");

  // Check if we're viewing a single job
  const isSingleJobView = Boolean(jobIdParam);

  // Initialize search text and filters from URL on component mount
  useEffect(() => {
    console.log("URL Parameters:", {
      role: roleParam,
      city: cityParam,
      state: stateParam,
      country: countryParam,
      company: companyParam,
      jobId: jobIdParam
    });

    // Don't reset any filters when jobId is present - keep existing UI state
    // Only set search text if role param exists
    if (roleParam) {
      setSearchText(roleParam);
    }

    // Set location filters from URL
    if (cityParam) {
      setSelectedCity(cityParam);
    }
    if (countryParam) {
      setSelectedCountry(countryParam);
    }

    // Update selected category based on role (optional)
    if (roleParam) {
      const roleToCategoryMap = {
        'Designer': 'Design',
        'Developer': 'Technology',
        'Manager': 'Business',
      };
      
      if (roleToCategoryMap[roleParam]) {
        setSelectedCategory(roleToCategoryMap[roleParam]);
      }
    }
  }, [roleParam, cityParam, stateParam, countryParam, companyParam, jobIdParam]);

  const [filters, setFilters] = useState({
    employmentType: [],
    workMode: [],
    salaryRange: "",
    experience: "",
    education: [],
    skills: [],
    companyIndustry: "",
    jobFreshness: "",
  });

  // Calculate active filters count
  useEffect(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedCity) count++;
    if (selectedCountry) count++;
    if (filters.employmentType.length > 0) count++;
    if (filters.workMode.length > 0) count++;
    if (filters.salaryRange) count++;
    if (filters.experience) count++;
    if (filters.education.length > 0) count++;
    if (filters.skills.length > 0) count++;
    if (filters.companyIndustry) count++;
    if (filters.jobFreshness) count++;
    setActiveFiltersCount(count);
  }, [selectedCategory, selectedCity, selectedCountry, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    setFadeOut(true);

    try {
      const apiFilters = {};

      if (jobIdParam) {
        apiFilters.jobId = jobIdParam;
        const jobsFromApi = await getAllJobs(apiFilters);
        setJobs(jobsFromApi);
        setFadeOut(false);
        return;
      }

      // Apply category filter
      if (selectedCategory && selectedCategory !== "All")
        apiFilters.category = selectedCategory;

      // Apply location filters from URL
      if (cityParam) {
        apiFilters.city = cityParam;
      } else if (selectedCity) {
        apiFilters.location = selectedCity;
      }
      
      if (countryParam) {
        apiFilters.country = countryParam;
      } else if (selectedCountry) {
        apiFilters.country = selectedCountry;
      }

      // Apply search text (from role parameter or manual input)
      if (searchText) apiFilters.search = searchText;

      // Add company filter from URL
      if (companyParam) apiFilters.companyId = companyParam;

      // Advanced filters
      if (filters.employmentType.length > 0)
        apiFilters.employmentType = filters.employmentType;

      if (filters.workMode.length > 0)
        apiFilters.workMode = filters.workMode;

      if (filters.salaryRange)
        apiFilters.salaryRange = filters.salaryRange;

      if (filters.experience)
        apiFilters.experience = filters.experience;

      if (filters.education.length > 0)
        apiFilters.education = filters.education;

      if (filters.skills.length > 0)
        apiFilters.skills = filters.skills;

      if (filters.companyIndustry)
        apiFilters.companyIndustry = filters.companyIndustry;

      if (filters.jobFreshness)
        apiFilters.jobFreshness = filters.jobFreshness;

     
      const jobsFromApi = await getAllJobs(apiFilters);
   

      setTimeout(() => {
        setJobs(jobsFromApi);
        setFadeOut(false);
      }, 200);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
      setFadeOut(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedCity, selectedCountry, searchText, filters, cityParam, countryParam, companyParam, jobIdParam]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedCity("");
    setSelectedCountry("");
    setSearchText("");
    setFilters({
      employmentType: [],
      workMode: [],
      salaryRange: "",
      experience: "",
      education: [],
      skills: [],
      companyIndustry: "",
      jobFreshness: "",
    });
    
    // Clear URL parameters if they exist
    if (searchParams.toString()) {
      setSearchParams({});
    }
  };

  const updateUrlFilters = () => {
    const params = new URLSearchParams(searchParams); // keep existing query params
    
    if (jobIdParam) return;  // ⛔ Never overwrite when jobId is present
    
    params.set("role", searchText || "");
    
    if (selectedCity) params.set("city", selectedCity);
    else params.delete("city");

    if (selectedCountry) params.set("country", selectedCountry);
    else params.delete("country");

    setSearchParams(params);
  };

  // Call updateUrlFilters when relevant filters change
  useEffect(() => {
    if (jobIdParam) return; // ⛔ Do NOT modify URL when viewing single job
    
    updateUrlFilters();
  }, [searchText, selectedCity, selectedCountry]);

  return (
    <>
      <JobHeader 
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {/* Mobile Filters Button */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="relative bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-700 transition-colors"
        >
          <FilterSection className="w-6 h-6" />
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && !isSingleJobView && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="absolute inset-0 bg-white overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Filters</h2>
              <div className="flex items-center gap-4">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <FilterSection
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
                selectedCity={selectedCity}
                onCityChange={setSelectedCity}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 mt-10">
        {/* Active Filters Display */}
        {(roleParam || cityParam || countryParam || companyParam || activeFiltersCount > 0) && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Active Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-cyan-600 hover:text-cyan-700 font-medium hover:bg-cyan-50 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {roleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
                  Role: {roleParam}
                </span>
              )}
              {cityParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  {cityParam}
                </span>
              )}
              {countryParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  Country: {countryParam}
                </span>
              )}
              {companyParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  Company: {companyParam}
                </span>
              )}
              {selectedCategory !== "All" && !roleParam && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Category: {selectedCategory}
                </span>
              )}
            </div>
          </div>
        )}

        <TopCompanies jobs={jobs} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-10">
          {/* Left Filters - Desktop */}
          <div className="hidden md:block md:col-span-1">
            <FilterSection
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Job Cards */}
          <div className="md:col-span-3">
            {/* Results Count */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Available Jobs
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {isSingleJobView 
                      ? `Showing job details` 
                      : `${jobs.length} job${jobs.length !== 1 ? "s" : ""} found`}
                    {activeFiltersCount > 0 &&
                      ` • ${activeFiltersCount} filter${
                        activeFiltersCount !== 1 ? "s" : ""
                      } active`}
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                    <option>Most Relevant</option>
                    <option>Newest First</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-600 border-t-transparent"></div>
                <p className="text-gray-600">
                  {isSingleJobView ? "Loading job details..." : "Finding the best jobs for you..."}
                </p>
              </div>
            ) : (
              <>
                {/* Job Cards with Animation */}
                <div
                  className={`transition-all duration-300 ease-out ${
                    fadeOut
                      ? "opacity-0 translate-y-4"
                      : "opacity-100 translate-y-0"
                  }`}
                >
                  {jobs.length > 0 ? (
                    <JobCards jobs={jobs} />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <Briefcase className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {isSingleJobView ? "Job not found" : "No jobs found"}
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        {isSingleJobView 
                          ? "The job you're looking for doesn't exist or has been removed."
                          : roleParam || cityParam || countryParam 
                            ? `No jobs found for "${roleParam || ''}"${
                                cityParam ? ` in ${cityParam}` : ''
                              }${countryParam ? `, ${countryParam}` : ''}.`
                            : "We couldn't find any jobs matching your criteria."
                        }
                      </p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default JobLayout;
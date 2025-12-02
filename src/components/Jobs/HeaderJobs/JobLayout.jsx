import React, { useState, useEffect } from "react";
import JobCards from "./JobCards";
import FullTimeJobs from "./FullTimeJobs";
import JobFilter from "./filterSection";
import Freelancer from "./Freelancer";
import { getAllJobs } from "../../../Service/jobservices";
import { Search, Briefcase, MapPin, Filter, X } from "lucide-react";
import Header from "../../Header";
import { useLocation } from "react-router-dom";



export default function JobsHomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showFullTimeJobs, setShowFullTimeJobs] = useState(false);
  const [showFreelancer, setShowFreelancer] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [fadeOut, setFadeOut] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const companyParam = queryParams.get("company");


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
    if (filters.employmentType.length > 0) count++;
    if (filters.workMode.length > 0) count++;
    if (filters.salaryRange) count++;
    if (filters.experience) count++;
    if (filters.education.length > 0) count++;
    if (filters.skills.length > 0) count++;
    if (filters.companyIndustry) count++;
    if (filters.jobFreshness) count++;
    setActiveFiltersCount(count);
  }, [selectedCategory, selectedCity, filters]);

  const fetchJobs = async () => {
  setLoading(true);
  setFadeOut(true);

  try {
    const apiFilters = {};

    if (selectedCategory && selectedCategory !== "All")
      apiFilters.category = selectedCategory;

    if (selectedCity) apiFilters.location = selectedCity;
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
  }, [selectedCategory, selectedCity, searchText, filters,  companyParam]);

  const handleOpenFullTimeJobs = () => {
    setShowFullTimeJobs(true);
  };

  const handleCloseFullTimeJobs = () => {
    setShowFullTimeJobs(false);
  };

  const handleOpenFreelancer = () => {
    setShowFreelancer(true);
  };

  const handleCloseFreelancer = () => {
    setShowFreelancer(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedCity("");
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
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        {/* Use Header component for mobile */}
        <Header />
        
        {/* Mobile Filter Button and Search Bar - Below Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Briefcase className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-800">Jobs</h1>
                <p className="text-xs text-gray-500">Find your dream job</p>
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="relative p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Mobile Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search jobs, companies, keywords..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filters Overlay */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50">
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
            <div className="h-[calc(100vh-80px)] overflow-y-auto">
              <div className="p-4">
                <JobFilter
                  onOpenFullTimeJobs={handleOpenFullTimeJobs}
                  onOpenFreelancer={handleOpenFreelancer}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  selectedCountry={selectedCountry}
                  onCountryChange={setSelectedCountry}
                  selectedCity={selectedCity}
                  onCityChange={setSelectedCity}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  searchText={searchText}
                  onSearchChange={setSearchText}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="flex min-h-screen bg-gray-50">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 bg-white border-r mt-10 border-gray-200 fixed left-0 top-0 h-screen overflow-y-auto z-10">
          <div className="p-6">
            {/* Use Header component at top of desktop sidebar */}
            <div className="mb-6">
              <Header />
            </div>
            
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Briefcase className="w-8 h-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Jobs</h1>
                  <p className="text-sm text-gray-500">Find your dream job</p>
                </div>
              </div>
            </div>

            <JobFilter
              onOpenFullTimeJobs={handleOpenFullTimeJobs}
              onOpenFreelancer={handleOpenFreelancer}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountry}
              selectedCity={selectedCity}
              onCityChange={setSelectedCity}
              filters={filters}
              onFilterChange={handleFilterChange}
              searchText={searchText}
              onSearchChange={setSearchText}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-80 min-h-screen mt-12">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Desktop Header Info Section */}
            {companyParam && (
  <p className="text-blue-600 mt-1 font-medium">
    Showing jobs for company: {jobs[0]?.companyName}
  </p>
)}

            <div className="hidden lg:flex items-center justify-between mb-8">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Available Jobs
                </h1>
                <p className="text-gray-600 mt-1">
                  {jobs.length} job{jobs.length !== 1 ? "s" : ""} found
                  {activeFiltersCount > 0 &&
                    ` • ${activeFiltersCount} filter${
                      activeFiltersCount !== 1 ? "s" : ""
                    } active`}
                </p>
              </div>
                    
              {/* Desktop Search - Centered */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-full max-w-2xl">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search jobs, companies, keywords..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-b border-gray-400 bg-transparent transition-all duration-200 
                             focus:outline-none focus:ring-0 focus:border-blue-600"
                  />
                </div>
              </div>
              
              {/* Clear Filters Button */}
              <div className="flex-1 flex justify-end">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-600">
                  Finding the best jobs for you...
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
                        No jobs found
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        We couldn't find any jobs matching your criteria. Try
                        adjusting your filters or search terms.
                      </p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearAllFilters}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
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
        </main>
      </section>

      {/* Modals */}
      {showFullTimeJobs && <FullTimeJobs onClose={handleCloseFullTimeJobs} />}
      {showFreelancer && <Freelancer onClose={handleCloseFreelancer} />}
    </>
  );
}
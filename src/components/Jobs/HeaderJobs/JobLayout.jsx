import React, { useState, useEffect } from "react";
import JobCards from "./JobCards";
import FullTimeJobs from "./FullTimeJobs";
import JobFilter from "./filterSection";
import Freelancer from "./Freelancer";
import { getAllJobs } from "../../../Service/jobservices";

export default function JobsHomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showFullTimeJobs, setShowFullTimeJobs] = useState(false);
  const [showFreelancer, setShowFreelancer] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState({
    employmentType: [],
    workMode: [],
    salaryRange: '',
    experience: '',
    education: [],
    skills: [],
    companyIndustry: '',
    jobFreshness: ''
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const apiFilters = {};
      if (selectedCategory && selectedCategory !== "All") apiFilters.category = selectedCategory;
      if (selectedCity) apiFilters.location = selectedCity;
      if (searchText) apiFilters.search = searchText;
      
      // Add advanced filters
      if (filters.employmentType.length > 0) apiFilters.employmentType = filters.employmentType;
      if (filters.workMode.length > 0) apiFilters.workMode = filters.workMode;
      if (filters.salaryRange) apiFilters.salaryRange = filters.salaryRange;
      if (filters.experience) apiFilters.experience = filters.experience;
      if (filters.education.length > 0) apiFilters.education = filters.education;
      if (filters.skills.length > 0) apiFilters.skills = filters.skills;
      if (filters.companyIndustry) apiFilters.companyIndustry = filters.companyIndustry;
      if (filters.jobFreshness) apiFilters.jobFreshness = filters.jobFreshness;
      
      console.log("API Filters:", apiFilters);
      const jobsFromApi = await getAllJobs(apiFilters);
      setJobs(jobsFromApi);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchJobs();
    }, 300); // Debounce API calls
    
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, selectedCity, searchText, filters]);

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
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="text-lg font-semibold text-gray-800 text-center">
          Jobs
        </div>
      </div>

      <section className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        {/* Mobile Filters - Collapsible */}
        <div className="lg:hidden w-full bg-white border-b border-gray-200">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
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

        {/* Desktop Sidebar - Fixed with independent scrolling */}
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 fixed left-0 top-0 h-screen overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">Jobs</h1>
              <p className="text-sm text-gray-500 mt-1">Find your dream job</p>
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

        {/* Main Content - Independent scrolling */}
        <main className="flex-1 lg:ml-80 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-200">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Available Jobs
                </h1>
                <p className="text-gray-600 mt-1">
                  {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              {/* Search for mobile */}
              <div className="lg:hidden w-full sm:w-64">
                <div className="relative">
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Job Cards */}
                {jobs.length > 0 ? (
                  <JobCards jobs={jobs} />
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                    <p className="text-gray-500">Try adjusting your filters or search terms</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </section>

      {/* Modals */}
      {showFullTimeJobs && (
        <FullTimeJobs onClose={handleCloseFullTimeJobs} />
      )}

      {showFreelancer && (
        <Freelancer onClose={handleCloseFreelancer} />
      )}
    </>
  );
}
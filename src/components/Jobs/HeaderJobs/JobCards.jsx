import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiHeart, FiTag, FiDollarSign, FiBriefcase, FiClock, FiGrid, FiList, FiChevronLeft, FiChevronRight, FiImage } from "react-icons/fi";
import { updateJobEngagement } from "../../../Service/jobservices";
const JobCards = ({ jobs = [] }) => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState({});
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  console.log(jobs)

  // Calculate total pages
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  
  // Get current jobs for the page
  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = jobs.slice(indexOfFirstJob, indexOfLastJob);

  // Helper function to fix image URLs - now handles both localhost and live server


const handleJobClick = async (job) => {
  try {
    const token = localStorage.getItem("token");

    // 🔁 Update engagement (view)
    if (token) {
      await updateJobEngagement(job._id, "view", token);
    }
  } catch (err) {
    console.error("View update failed:", err);
  }

  // 🔍 Same role jobs logic
  const sameRoleJobs = jobs.filter(
    (j) => j.jobRole === job.jobRole
  );

  const currentIndexInRole = sameRoleJobs.findIndex(
    (j) => j._id === job._id
  );

  // 🚀 Navigate after engagement update
  navigate(`/job/${job._id}`, {
    state: {
      job,
      jobs: sameRoleJobs,
      index: currentIndexInRole,
    },
  });
};


  const handleClickCompany = (company) => (e) => {
    e.stopPropagation();
    if (company) {
      navigate(`/company/${company}`);
    }
  };

  const toggleSaveJob = (jobId) => (e) => {
    e.stopPropagation();
    setSavedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  // Format salary range
  const formatSalary = (job) => {
    if (!job.salaryMin && !job.salaryMax) return "Salary not specified";
    
    const min = job.salaryMin?.toLocaleString() || '';
    const max = job.salaryMax?.toLocaleString() || '';
    
    if (min && max) {
      return `₹${min} - ${max} ${job.salaryType === 'monthly' ? '/month' : job.salaryType === 'yearly' ? '/year' : '/hour'}`;
    } else if (min) {
      return `From ₹${min} ${job.salaryType === 'monthly' ? '/month' : job.salaryType === 'yearly' ? '/year' : '/hour'}`;
    } else if (max) {
      return `Up to ₹${max} ${job.salaryType === 'monthly' ? '/month' : job.salaryType === 'yearly' ? '/year' : '/hour'}`;
    }
    
    return "Salary not specified";
  };

  // Get location text
  const getLocationText = (job) => {
    if (job.workMode === 'remote') return 'Remote';
    if (job.workMode === 'hybrid') return 'Hybrid';
    
    const locationParts = [job.city, job.state].filter(Boolean);
    return locationParts.length > 0 ? locationParts.join(', ') : 'Location not specified';
  };

  // Get employment type display text and color
  const getEmploymentType = (type) => {
    const typeMap = {
      'full-time': { label: 'FULL TIME', color: 'bg-blue-600' },
      'part-time': { label: 'PART TIME', color: 'bg-orange-500' },
      'contract': { label: 'CONTRACT', color: 'bg-purple-600' },
      'internship': { label: 'INTERNSHIP', color: 'bg-green-600' },
      'freelance': { label: 'FREELANCE', color: 'bg-purple-600' },
      'temporary': { label: 'TEMPORARY', color: 'bg-red-500' }
    };
    
    return typeMap[type] || { label: type?.toUpperCase() || 'JOB', color: 'bg-gray-600' };
  };

  // Get initials for avatar
  const getInitials = (companyName) => {
    if (!companyName) return 'JD';
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format experience
  const formatExperience = (job) => {
    if (job.freshersAllowed) return "Freshers welcome";
    
    const min = job.minimumExperience || 0;
    const max = job.maximumExperience || 0;
    
    if (min === 0 && max === 0) return "Experience not specified";
    if (min === max) return `${min} year${min > 1 ? 's' : ''}`;
    if (min > 0 && max > 0) return `${min} - ${max} years`;
    if (min > 0) return `Min ${min} year${min > 1 ? 's' : ''}`;
    if (max > 0) return `Up to ${max} year${max > 1 ? 's' : ''}`;
    
    return "Experience not specified";
  };

  // Generate a unique key for each job
  const getJobKey = (job, idx) => {
    return job._id || `job-${job.jobTitle}-${job.companyName}-${idx}`;
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <>
      {/* View Toggle and Page Info - Hidden on mobile */}
      <div className="hidden md:flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
            >
              <FiGrid className={`w-5 h-5 ${viewMode === "grid" ? "text-blue-600" : "text-gray-500"}`} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"}`}
            >
              <FiList className={`w-5 h-5 ${viewMode === "list" ? "text-blue-600" : "text-gray-500"}`} />
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Showing {indexOfFirstJob + 1}-{Math.min(indexOfLastJob, jobs.length)} of {jobs.length} jobs
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Mobile View Info - Only show job count */}
      <div className="md:hidden flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          {jobs.length} jobs found
        </div>
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      </div>

      {/* Job Cards Grid/List */}
      <div className={viewMode === "grid" || window.innerWidth < 768
        ? "grid grid-cols-1 sm:grid-cols-2 gap-6" 
        : "space-y-6"
      }>
        {currentJobs.map((job, idx) => {
          const employmentType = getEmploymentType(job.employmentType);
          const logoUrl =job.companyLogo
          
          {/* Always show grid view on mobile, respect viewMode on desktop */}
          if (viewMode === "grid" || window.innerWidth < 768) {
            return (
              <div
                key={getJobKey(job, idx)}
                className="border border-gray-300 rounded-lg p-6 hover:shadow-xl transition-all duration-300 bg-white hover:border-cyan-300 cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                {/* Logo + Title */}
                <div className="flex items-start gap-4">
                  <div 
                    onClick={handleClickCompany(job.companyId)}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {logoUrl ? (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
                        <img 
                          src={logoUrl}
                          alt={job.companyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg';
                            fallback.textContent = getInitials(job.companyName);
                            parent.appendChild(fallback);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        {getInitials(job.companyName)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {job.jobTitle || "Untitled Position"}
                    </h2>
                    <div 
                      onClick={handleClickCompany(job.companyId)}
                      className="cursor-pointer"
                    >
                      <p className="text-cyan-600 font-medium text-sm mt-1 hover:text-cyan-700 transition-colors">
                        {job.companyName || "Unknown Company"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-700 font-medium mt-2">
                      <FiDollarSign className="text-green-600" />
                      <span className="text-sm">{formatSalary(job)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 mt-1">
                      <FiMapPin />
                      <span className="text-sm">{getLocationText(job)}</span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 mt-4">
                  <button 
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job);
                    }}
                  >
                    APPLY
                  </button>

                  <button
                    className={`text-white px-4 py-2 rounded-md text-sm font-medium ${employmentType.color}`}
                  >
                    {employmentType.label}
                  </button>

              
                </div>

                {/* Key Details */}
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiBriefcase className="w-4 h-4 mr-2 text-purple-600" />
                    <span>{formatExperience(job)}</span>
                  </div>
                  
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiTag className="w-4 h-4 mr-2 text-cyan-500" />
                      <span className="font-medium">Tags:</span>
                      <div className="ml-2 flex flex-wrap gap-1">
                        {job.requiredSkills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="text-cyan-600 text-xs">
                            {skill},
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="text-cyan-600 text-xs">
                            +{job.requiredSkills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <div className="flex items-center text-xs text-gray-500">
                    <FiClock className="w-3 h-3 mr-1" />
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Date not available"}
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    {(job.openingsCount || 0)} opening{(job.openingsCount || 0) > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            );
          } else {
            // List View (Desktop only)
            return (
              <div
                key={getJobKey(job, idx)}
                className="border border-gray-300 rounded-lg p-6 hover:shadow-xl transition-all duration-300 bg-white hover:border-cyan-300 cursor-pointer"
                onClick={() => handleJobClick(job)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Left: Company Logo */}
                  <div 
                    onClick={handleClickCompany(job.companyId)}
                    className="cursor-pointer flex-shrink-0"
                  >
                    {logoUrl ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
                        <img 
                          src="http://localhost:5000/media/company/692d618262ef432795815850/logo/692d618262ef432795815850_2025-12-19_18-27-06_9e223937-5025-4dd0-bbc6-b8a24f504b81.jpg"
                          alt={job.companyName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            const fallback = document.createElement('div');
                            fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-xl';
                            fallback.textContent = getInitials(job.companyName);
                            parent.appendChild(fallback);
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
                        {getInitials(job.companyName)}
                      </div>
                    )}
                  </div>

                  {/* Center: Job Details */}
                  <div className="flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {job.jobTitle || "Untitled Position"}
                        </h2>
                        <div 
                          onClick={handleClickCompany(job.companyId)}
                          className="cursor-pointer"
                        >
                          <p className="text-cyan-600 font-medium text-base mt-1 hover:text-cyan-700 transition-colors">
                            {job.companyName || "Unknown Company"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button 
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJobClick(job);
                          }}
                        >
                          APPLY
                        </button>
                        
                        <button 
                          className={`p-2 border rounded-md hover:border-red-300 transition-colors ${
                            savedJobs[job._id] 
                              ? 'text-red-500 border-red-300' 
                              : 'text-gray-500 border-gray-300'
                          }`}
                          onClick={toggleSaveJob(job._id)}
                        >
                          <FiHeart />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <FiDollarSign className="text-green-600" />
                        <span className="font-medium">{formatSalary(job)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <FiMapPin />
                        <span>{getLocationText(job)}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <FiBriefcase className="text-purple-600" />
                        <span>{formatExperience(job)}</span>
                      </div>
                    </div>

                    {job.requiredSkills && job.requiredSkills.length > 0 && (
                      <div className="flex items-center gap-2 mt-4">
                        <FiTag className="text-cyan-500" />
                        <div className="flex flex-wrap gap-2">
                          {job.requiredSkills.slice(0, 5).map((skill, i) => (
                            <span key={i} className="px-3 py-1 bg-cyan-50 text-cyan-600 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                          {job.requiredSkills.length > 5 && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                              +{job.requiredSkills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Job Type and Date */}
                  <div className="flex flex-col items-end gap-3">
                    <button
                      className={`text-white px-4 py-2 rounded-md text-sm font-medium ${employmentType.color}`}
                    >
                      {employmentType.label}
                    </button>
                    
                    <div className="text-xs text-gray-500 text-right">
                      <div className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Date not available"}
                      </div>
                      <div className="mt-1">
                      
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-600 hidden sm:block">
            Showing {indexOfFirstJob + 1}-{Math.min(indexOfLastJob, jobs.length)} of {jobs.length} jobs
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md border ${currentPage === 1 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-1">
              {getPageNumbers().map((pageNum, index) => (
                <React.Fragment key={index}>
                  {pageNum === '...' ? (
                    <span className="px-3 py-2 text-gray-500 hidden sm:inline">...</span>
                  ) : (
                    <button
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-md border hidden sm:inline-flex items-center justify-center ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  )}
                </React.Fragment>
              ))}
              
              {/* Mobile pagination - show only prev/next and current page */}
              <div className="sm:hidden flex items-center gap-2">
                <span className="text-gray-700">Page {currentPage}</span>
              </div>
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md border ${currentPage === totalPages ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600 hidden sm:flex items-center gap-2">
            <span>Go to page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                }
              }}
              className="w-16 px-2 py-1 border border-gray-300 rounded-md text-center"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default JobCards;
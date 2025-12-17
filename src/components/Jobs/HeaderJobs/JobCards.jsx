import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiMapPin, FiHeart, FiTag, FiDollarSign, FiBriefcase, FiClock } from "react-icons/fi";

const JobCards = ({ jobs = [] }) => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState({});

  const handleJobClick = (job) => {
    const sameRoleJobs = jobs.filter((j) => j.jobRole === job.jobRole);
    const currentIndexInRole = sameRoleJobs.findIndex((j) => j._id === job._id);

    navigate(`/job/${job._id}`, {
      state: {
        job,
        jobs: sameRoleJobs,
        index: currentIndexInRole,
      },
    });
  };

  const handleClickCompany = (companyId) => (e) => {
    e.stopPropagation();
    if (companyId) {
      navigate(`/company/${companyId._id}`);
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

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No jobs found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {jobs.map((job, idx) => {
        const employmentType = getEmploymentType(job.employmentType);
        
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
                className="cursor-pointer"
              >{job.companyLogo?  <img className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm"
                  src={job.companyLogo}>
                </img>:  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {getInitials(job.companyName)}
                </div>}
              
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

            {/* Job Description
            <p className="text-gray-600 text-sm mt-4 line-clamp-3 leading-relaxed">
              {job.jobDescription || "No description available"}
            </p> */}

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
      })}
    </div>
  );
};

export default JobCards;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobModal from "./JobModal";

export default function JobCards({ jobs = [], filterDomain = null }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const navigate = useNavigate();

  // Filter jobs by domain if provided
  const filteredJobs = filterDomain
    ? jobs.filter((job) => job.domain === filterDomain)
    : jobs;

  const handleJobClick = (job, index) => {
    setSelectedJob(job);
    setCurrentJobIndex(index);
  };

  const handleClose = () => {
    setSelectedJob(null);
  };

  const handleNext = () => {
    if (currentJobIndex < filteredJobs.length - 1) {
      const nextJob = filteredJobs[currentJobIndex + 1];
      setCurrentJobIndex((prev) => prev + 1);
      setSelectedJob(nextJob);
    }
  };

  const handlePrevious = () => {
    if (currentJobIndex > 0) {
      const prevJob = filteredJobs[currentJobIndex - 1];
      setCurrentJobIndex((prev) => prev - 1);
      setSelectedJob(prevJob);
    }
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

  // Get employment type display text
  const getEmploymentType = (type) => {
    const typeMap = {
      'full-time': 'Full Time',
      'part-time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    };
    return typeMap[type] || type;
  };

  // Get initials for avatar
  const getInitials = (companyName) => {
    return companyName
      ? companyName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)
      : 'JD';
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

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.map((job, idx) => (
          <div
            key={job._id || idx}
            onClick={() => handleJobClick(job, idx)}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-blue-300 hover:transform hover:-translate-y-1"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {getInitials(job.companyName)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                    {job.companyName}
                  </h3>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span className="line-clamp-1">{getLocationText(job)}</span>
                  </div>
                </div>
              </div>
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap">
                {getEmploymentType(job.employmentType)}
              </span>
            </div>

            {/* Job Title */}
            <h2 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 leading-tight">
              {job.jobTitle}
            </h2>

            {/* Job Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
              {job.jobDescription || "No description available"}
            </p>

            {/* Key Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>{formatSalary(job)}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{formatExperience(job)}</span>
              </div>

              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex items-start text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2 text-orange-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="line-clamp-1">
                    Skills: {job.requiredSkills.slice(0, 2).join(', ')}
                    {job.requiredSkills.length > 2 && ` +${job.requiredSkills.length - 2} more`}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(job.createdAt).toLocaleDateString()}
              </div>
              
              <div className="text-xs text-gray-500">
                {job.openingsCount} opening{job.openingsCount > 1 ? 's' : ''}
              </div>
            </div>

            {/* Quick Apply Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleJobClick(job, idx);
              }}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Quick Apply
            </button>
          </div>
        ))}
      </div>

      {/* Job Modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentIndex={currentJobIndex}
          totalJobs={filteredJobs.length}
        />
      )}
    </>
  );
}
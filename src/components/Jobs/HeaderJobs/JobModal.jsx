import React from "react";

const JobModal = ({ 
  job, 
  isOpen, 
  onClose, 
  onNext, 
  onPrevious, 
  currentIndex, 
  totalJobs 
}) => {
  if (!isOpen) return null;

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
    
    const locationParts = [job.city, job.state, job.country].filter(Boolean);
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

  // Format skills array
  const formatSkills = (skills) => {
    if (!skills || skills.length === 0) return ["Not specified"];
    return skills;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with Company Logo and Basic Info */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col items-center space-y-6">
            
            {/* Top Row: Logo and Close Button */}
            <div className="flex items-center justify-between w-full">
              {/* Empty div for balance */}
              <div className="w-10"></div>
              
              {/* Company Logo - Centered */}
              <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg">
                {job.companyLogo ? (
                  <img 
                    src={job.companyLogo} 
                    alt={job.companyName}
                    className="w-full h-full rounded-xl object-cover"
                  />
                ) : (
                  getInitials(job.companyName)
                )}
              </div>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Job Information - Centered */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold text-gray-900">{job.jobTitle}</h1>
              <div className="space-y-2">
                <p className="text-xl text-gray-700 font-medium">{job.companyName}</p>
                <div className="flex items-center justify-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="text-lg">{getLocationText(job)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons - Centered */}
            <div className="flex items-center gap-4">
              {/* Save Button */}
              <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save Job
              </button>
              
              {/* Apply Button */}
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-lg">
                Apply Now
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Job Description */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Description */}
              <div className="bg-white rounded-lg">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h3>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {job.jobDescription || "No job description provided."}
                  </p>
                </div>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="bg-white rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Responsibilities</h3>
                  <ul className="space-y-2">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index} className="flex items-start text-gray-700">
                        <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{responsibility}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills */}
              {(job.requiredSkills && job.requiredSkills.length > 0) && (
                <div className="bg-white rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {(job.technicalSkills && job.technicalSkills.length > 0) && (
                <div className="bg-white rounded-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Technical Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {job.technicalSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply Button for Mobile */}
              <div className="lg:hidden mt-6">
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-lg">
                  Apply for this Job
                </button>
              </div>
            </div>

            {/* Right Column - Job Details Card */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 sticky top-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
                
                <div className="space-y-4">
                  {/* Salary */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Salary</div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatSalary(job)}
                    </div>
                  </div>

                  {/* Employment Type */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Employment Type</div>
                    <div className="text-base font-medium text-gray-900">
                      {getEmploymentType(job.employmentType)}
                    </div>
                  </div>

                  {/* Work Mode */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Work Mode</div>
                    <div className="text-base font-medium text-gray-900 capitalize">
                      {job.workMode || "Not specified"}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Location</div>
                    <div className="text-base font-medium text-gray-900 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {getLocationText(job)}
                    </div>
                  </div>

                  {/* Experience */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Experience</div>
                    <div className="text-base font-medium text-gray-900">
                      {formatExperience(job)}
                    </div>
                  </div>

                  {/* Education Level */}
                  {job.educationLevel && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Education</div>
                      <div className="text-base font-medium text-gray-900">
                        {job.educationLevel}
                      </div>
                    </div>
                  )}

                  {/* Job Category */}
                  {job.jobCategory && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Category</div>
                      <div className="text-base font-medium text-gray-900">
                        {job.jobCategory}
                      </div>
                    </div>
                  )}

                  {/* Job Role */}
                  {job.jobRole && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Role</div>
                      <div className="text-base font-medium text-gray-900">
                        {job.jobRole}
                      </div>
                    </div>
                  )}

                  {/* Openings Count */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Openings</div>
                    <div className="text-base font-medium text-gray-900">
                      {job.openingsCount || 1} position{job.openingsCount > 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Job Posted Date */}
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Job Posted</div>
                    <div className="text-base font-medium text-gray-900">
                      {new Date(job.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Application Deadline */}
                  {job.endDate && (
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Application Deadline</div>
                      <div className="text-base font-medium text-gray-900">
                        {new Date(job.endDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button for Desktop */}
                <div className="mt-6 hidden lg:block">
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center text-lg">
                    Apply for this Job
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Navigation */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onPrevious}
                disabled={currentIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentIndex === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={onNext}
                disabled={currentIndex === totalJobs - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentIndex === totalJobs - 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} of {totalJobs} jobs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
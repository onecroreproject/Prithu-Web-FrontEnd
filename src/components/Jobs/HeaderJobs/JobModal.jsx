import React, { useState, useEffect } from "react";
import JobApplication from "./JobApplication";

const JobModal = ({ job, isOpen, onClose, onNext, onPrevious, currentIndex, totalJobs }) => {
  const [showApplication, setShowApplication] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApplyClick = () => {
    setShowApplication(true);
  };

  const handleCloseApplication = () => {
    setShowApplication(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="flex items-center justify-center min-h-screen p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col mx-2 sm:mx-4">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white p-4 sm:p-6 flex-shrink-0">
              <div className="flex justify-between items-start mb-3 sm:mb-4">
                <div className="flex-1 min-w-0 mr-3">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 line-clamp-2">{job.title}</h1>
                  <p className="text-gray-300 text-sm sm:text-lg truncate">{job.company} • {job.location}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white hover:text-gray-300 transition-colors duration-200 p-1 sm:p-2 rounded-full hover:bg-white/10 flex-shrink-0"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">{job.type}</div>
                <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">{job.experience} experience</div>
                {job.onsiteRequired && (
                  <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Onsite Required</div>
                )}
                <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">Posted {job.time}</div>
              </div>
            </div>

            {/* Content - Scrollable Area */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6">
              {/* About the Role */}
              <section className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">About the Role</h2>
                <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{job.description}</p>
              </section>

              {/* What We're Looking For */}
              <section className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">What We're Looking For</h2>
                <ul className="space-y-2 sm:space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700 leading-relaxed text-sm sm:text-base">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Why Join */}
              <section className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Why {job.company}</h2>
                <p className="text-gray-700 leading-relaxed bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100 text-sm sm:text-base">
                  {job.benefits}
                </p>
              </section>
            </div>

            {/* Footer - Fixed to be fully visible */}
            <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50 flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                {/* Navigation Buttons */}
                <div className="flex space-x-2 sm:space-x-3 order-2 sm:order-1 w-full sm:w-auto justify-center sm:justify-start">
                  <button
                    onClick={onPrevious}
                    disabled={currentIndex === 0}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 font-medium text-sm sm:text-base flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px] ${
                      currentIndex === 0
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 bg-white'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={onNext}
                    disabled={currentIndex === totalJobs - 1}
                    className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border transition-all duration-200 font-medium text-sm sm:text-base flex-1 sm:flex-none min-w-[80px] sm:min-w-[100px] ${
                      currentIndex === totalJobs - 1
                        ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'border-gray-300 text-gray-700 hover:bg-white hover:border-gray-400 bg-white'
                    }`}
                  >
                    Next
                  </button>
                </div>
                
                {/* Apply Button */}
                <div className="flex space-x-2 sm:space-x-3 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end mb-3 sm:mb-0">
                  <button
                    onClick={handleApplyClick}
                    className="px-4 sm:px-6 lg:px-8 py-2.5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm sm:text-base w-full sm:w-auto"
                  >
                    Apply Job
                  </button>
                </div>
              </div>
              
              {/* Job Counter */}
              <div className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Job {currentIndex + 1} of {totalJobs}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Application Modal */}
      {showApplication && (
        <JobApplication 
          job={job}
          onClose={handleCloseApplication}
        />
      )}
    </>
  );
};

export default JobModal;
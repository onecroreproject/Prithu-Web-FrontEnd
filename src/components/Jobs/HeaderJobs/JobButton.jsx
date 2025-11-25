import React, { useState } from "react";

const JobButton = ({ onOpenFullTimeJobs, onOpenFreelancer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePostFullTimeJob = () => {
    setIsModalOpen(false);
    if (onOpenFullTimeJobs) {
      onOpenFullTimeJobs();
    }
  };

  const handleFindFreelancer = () => {
    setIsModalOpen(false);
    if (onOpenFreelancer) {
      onOpenFreelancer();
    }
  };

  return (
    <>
      {/* Main Button */}
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl py-2.5 sm:py-3 font-bold text-base sm:text-lg mb-6 sm:mb-8 flex justify-center items-center transition-all duration-300 shadow-lg hover:shadow-xl"
      >
        <span className="text-lg sm:text-xl mr-2">+</span>New Job
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-2xl relative mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header with Close Button */}
            <div className="p-4 sm:p-6 border-b border-gray-100 relative flex-shrink-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 text-center">Create a Job</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 sm:p-2 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content - Scrollable Area */}
            <div className="overflow-y-auto flex-1 p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {/* Freelance Section */}
                <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 border border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 transition-colors duration-200">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded">
                      Freelance
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Hire a Freelancer</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Find the perfect creator in minutes.</p>
                    
                    <ul className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-sm"></div>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">Get proposals from creators matching your needs</span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-green-500 bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">Discuss, share files & schedule video calls</span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-sm"></div>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">Pay seamlessly and securely with a credit card</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={handleFindFreelancer}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base"
                    >
                      Find a Freelancer Today
                    </button>
                  </div>
                </div>

                {/* Full-Time Section */}
                <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 border border-gray-200 rounded-lg sm:rounded-xl hover:border-blue-300 transition-colors duration-200">
                  <div className="flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 sm:px-2.5 py-1 rounded">
                      Full-Time
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Post a Full-Time Job</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">Promote your full-time opportunity.</p>
                    
                    <ul className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-green-500 bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">Share your job opportunity with millions of designers</span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-gray-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-sm"></div>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">Redirect applications to your favorite external tool</span>
                      </li>
                      <li className="flex items-start space-x-2 sm:space-x-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded border border-green-500 bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700 text-sm sm:text-base">Job posts are free and expire after 30 days</span>
                      </li>
                    </ul>
                    
                    <button
                      onClick={handlePostFullTimeJob}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg font-semibold transition-colors duration-200 text-sm sm:text-base"
                    >
                      Post a Full-Time Job
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobButton;
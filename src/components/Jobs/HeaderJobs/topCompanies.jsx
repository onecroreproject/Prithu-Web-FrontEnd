import React, { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const TopCompanies = ({ jobs = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  // Extract top companies from jobs data
const companies = useMemo(() => {
  if (!jobs || jobs.length === 0) return [];
  
  const companyMap = {};

  jobs.forEach(job => {
    const companyId = job.companyId;
    if (companyId) {
      if (!companyMap[companyId]) {
        companyMap[companyId] = {
          id: companyId,
          name: job.companyName,
          location: `${job.city}, ${job.state}` || job.country || "Multiple Locations",
          positions: 0, // Renamed from openings to positions
          logo: job.companyLogo || null,
          uniqueJobTitles: new Set()
        };
      }
      
      // Add job title to set
      if (job.jobTitle) {
        const beforeSize = companyMap[companyId].uniqueJobTitles.size;
        companyMap[companyId].uniqueJobTitles.add(job.jobTitle);
        const afterSize = companyMap[companyId].uniqueJobTitles.size;
        
        // Only increment positions count if we added a new unique job title
        if (afterSize > beforeSize) {
          companyMap[companyId].positions += 1;
        }
      }
    }
  });

  // Convert to array, filter companies with multiple unique job titles
  return Object.values(companyMap)
    .filter(company => company.uniqueJobTitles.size >= 2) // Only show companies with 2+ different job roles
    .sort((a, b) => b.positions - a.positions) // Sort by number of positions
    .slice(0, 8);
}, [jobs]);

  // Get initials for company avatar
  const getInitials = (companyName) => {
    if (!companyName) return 'Co';
    return companyName
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate items per view based on screen size
  const itemsPerView = 4;

  // Calculate visible companies
  const visibleCompanies = companies.slice(currentIndex, currentIndex + itemsPerView);

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex + itemsPerView < companies.length) {
      setCurrentIndex(prev => prev + itemsPerView);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - itemsPerView);
    } else {
      // Go to last page
      const lastPageStart = Math.max(0, companies.length - itemsPerView);
      setCurrentIndex(lastPageStart);
    }
  };

  const handleClickCompany = (company) => {
    
    if (company) {
      navigate(`/company/${(company.id)}`);
    }
  };

  const handleViewAllJobs =(company) =>{
    if(company){
      navigate(`?company=${company.id}`)
    }
  }


  // If no companies, show not available
  if (companies.length === 0) {
    return (
      <div className="w-full max-w-6xl mx-auto bg-white p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            TOP HIRING COMPANIES
          </h2>
        </div>

        {/* Blue Underline */}
        <div className="w-10 h-[2px] bg-cyan-400 mt-1 mb-6"></div>

        {/* Not Available Message - Updated without icon */}
        <div className="text-center py-4">
          <p className="text-gray-600 text-base font-medium mb-1">Not Available</p>
          <p className="text-gray-500 text-sm">
            Companies will appear here as jobs are posted
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-white p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          TOP HIRING COMPANIES
        </h2>

        {/* Navigation Buttons - Only show if there are more than itemsPerView companies */}
        {companies.length > itemsPerView && (
          <div className="flex space-x-2 text-gray-500">
            <button 
              onClick={handlePrev}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
              aria-label="Previous companies"
            >
              <FiChevronLeft size={18} />
            </button>
            <button 
              onClick={handleNext}
              className="p-1.5 rounded-full hover:bg-gray-100 transition"
              aria-label="Next companies"
            >
              <FiChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Blue Underline */}
      <div className="w-10 h-[2px] bg-cyan-400 mt-1 mb-4"></div>

      {/* Companies Grid - Reduced width only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleCompanies.map((company, index) => (
          <div
            key={`${company.name}-${index}`}
            className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white p-4 text-center hover:border-cyan-300 cursor-pointer"
          >
            {/* Company Logo/Initials */}
            <div 
              className="flex justify-center mb-3"
            >
              {company.logo? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-14 h-14 object-contain"
                  onClick={() => handleClickCompany(company)}
                />
              ) : (
                <div 
                  onClick={() => handleClickCompany(company)}
                  className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm"
                >
                  {getInitials(company.name)}
                </div>
              )}
            </div>

            {/* Company Name */}
            <h3 className="text-base font-semibold text-gray-800 mb-1 line-clamp-1">
              {company.name}
            </h3>
            
            {/* Location */}
            <p className="text-gray-600 text-xs mb-2 line-clamp-1">
              {company.location}
            </p>
{/* Opening Count */}
<div className="text-xs text-gray-500 mb-3">
  {company.positions === 1 ? "1 Openings" : `${company.positions} Openings`}
</div>

            {/* Opening Button */}
            <button
              className="
                bg-cyan-600 text-white text-xs py-1.5 px-4 rounded-md 
                transition-all duration-300 
                hover:bg-red-500 hover:shadow-sm
                font-medium w-full
              "
              onClick={(e) => {
              handleViewAllJobs(company)
              }}
            >
              VIEW JOBS
            </button>
          </div>
        ))}
      </div>

      {/* Dots indicator for mobile */}
      {companies.length > itemsPerView && (
        <div className="flex justify-center mt-4 space-x-1.5 lg:hidden">
          {Array.from({ length: Math.ceil(companies.length / itemsPerView) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * itemsPerView)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === Math.floor(currentIndex / itemsPerView) 
                  ? 'bg-cyan-600' 
                  : 'bg-gray-300'
              }`}
              aria-label={`Go to page ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TopCompanies;
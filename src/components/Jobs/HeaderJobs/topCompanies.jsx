import React, { useState, useMemo } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const TopCompanies = ({ jobs = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Extract top companies from jobs data
  const companiesFromJobs = useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    
    // Group jobs by company and count openings
    const companyMap = {};
    
    jobs.forEach(job => {
      if (job.companyName) {
        if (!companyMap[job.companyName]) {
          companyMap[job.companyName] = {
            name: job.companyName,
            location: job.city || job.country || "Multiple Locations",
            openings: 0,
            logo: null,
            companyId: job.companyId
          };
        }
        companyMap[job.companyName].openings += (job.openingsCount || 1);
      }
    });

    // Convert to array and sort by openings
    return Object.values(companyMap)
      .sort((a, b) => b.openings - a.openings)
      .slice(0, 8);
  }, [jobs]);

  // Use actual companies or fallback to sample data
  const companies = companiesFromJobs.length > 0 
    ? companiesFromJobs
    : [
        {
          name: "Akshay INC.",
          location: "New York",
          openings: 3,
          logo: "https://upload.wikimedia.org/wikipedia/commons/6/61/Wordpress_logo.png",
        },
        {
          name: "Pay Walt",
          location: "Ohio",
          openings: 2,
          logo: "https://cdn-icons-png.flaticon.com/512/5968/5968523.png",
        },
        {
          name: "Apus Inc.",
          location: "New York",
          openings: 1,
          logo: "https://cdn-icons-png.flaticon.com/512/889/889123.png",
        },
        {
          name: "Envato Inc.",
          location: "India",
          openings: 2,
          logo: "https://upload.wikimedia.org/wikipedia/commons/9/99/Magento.svg",
        },
        {
          name: "TechNova Pvt Ltd",
          location: "Chennai",
          openings: 4,
          logo: "https://cdn-icons-png.flaticon.com/512/732/732212.png",
        },
        {
          name: "DesignHive Studio",
          location: "Bangalore",
          openings: 3,
          logo: "https://cdn-icons-png.flaticon.com/512/5968/5968705.png",
        },
        {
          name: "MediaSpark",
          location: "Delhi",
          openings: 2,
          logo: "https://cdn-icons-png.flaticon.com/512/732/732200.png",
        },
        {
          name: "NextGen Systems",
          location: "Hyderabad",
          openings: 5,
          logo: "https://cdn-icons-png.flaticon.com/512/919/919825.png",
        },
      ];

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

  const handleCompanyClick = (companyName, companyId) => {
    // Navigate to company page or filter by company
    if (companyId) {
      // Navigate to company details page
      console.log(`Navigate to company: ${companyName}, ID: ${companyId}`);
    } else {
      // Filter jobs by company name
      console.log(`Filter jobs by company: ${companyName}`);
    }
  };

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
            onClick={() => handleCompanyClick(company.name, company.companyId)}
          >
            {/* Company Logo/Initials */}
            <div className="flex justify-center mb-3">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-14 h-14 object-contain"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
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
              {company.openings === 1 ? "1 OPENING" : `${company.openings} OPENINGS`}
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
                e.stopPropagation();
                handleCompanyClick(company.name, company.companyId);
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

      {/* Empty State */}
      {companies.length === 0 && (
        <div className="text-center py-6">
          <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <FiChevronLeft size={18} className="text-gray-400" />
            <FiChevronRight size={18} className="text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">No company data available</p>
          <p className="text-gray-400 text-xs mt-1">Companies will appear here as jobs are posted</p>
        </div>
      )}
    </div>
  );
};

export default TopCompanies;
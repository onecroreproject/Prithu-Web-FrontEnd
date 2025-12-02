import React, { useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../../../Service/jobservices";
import { useNavigate } from "react-router-dom"; // Add this import
import { Star, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function JobFeaturedCompaniesCard() {
  const navigate = useNavigate(); // Initialize navigate
  const { data: jobs = [], isLoading, isError } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Group jobs by company to get complete company info
  const getFeaturedCompanies = () => {
    const companyMap = new Map();
    
    jobs.forEach((job) => {
      const companyName = job.companyName || job.postedBy?.companyName;
      if (companyName && !companyMap.has(companyName)) {
        // Get the most complete company info available
        const companyData = {
          name: companyName,
          companyId: job.companyId, // This is the ID we need for navigation
          companyProfile: job.companyProfile || null,
          postedBy: job.postedBy || null,
          location: job.city || job.state || job.country || null,
          // You can add more company details here if available
        };
        companyMap.set(companyName, companyData);
      }
    });
    
    return Array.from(companyMap.values()).slice(0, 5);
  };

  const featuredCompanies = getFeaturedCompanies();

const handleCompanyClick = (company) => {
  if (company.companyId) {
    navigate(`/jobs?company=${company.companyId}`);
  } else {
    const slug = company.name.toLowerCase().replace(/\s+/g, "-");
    navigate(`/jobs?company=${slug}`);
  }
};


  if (isLoading) return <div className="p-4 bg-white rounded-xl">Loading…</div>;
  if (isError) return <div className="p-4 bg-red-100 rounded-xl">Error</div>;

  return (
    <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <FeaturedCompanies 
        companies={featuredCompanies} 
        onCompanySelect={handleCompanyClick} // Changed to handleCompanyClick
      />
    </div>
  );
}

/* ============================================================================
   ⭐ Combined FeaturedCompanies Component
   ============================================================================ */
const FeaturedCompanies = memo(function FeaturedCompanies({ companies = [], onCompanySelect }) {
  const fade = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  return (
    <div className="pb-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-gray-50 dark:bg-[#252530] text-yellow-600">
          <Star className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base">
          Featured Companies
        </h3>
      </div>

      {/* List */}
      {companies.length > 0 ? (
        <ul className="grid gap-2 sm:gap-3">
          {companies.map((company, i) => (
            <motion.li
              key={company?.companyId || company?.name || i}
              variants={fade}
              initial="hidden"
              animate="visible"
              onClick={() => onCompanySelect && onCompanySelect(company)}
              className="flex items-center justify-between gap-2 p-3 rounded-lg
                         bg-gray-50/50 dark:bg-[#202024]/50
                         hover:bg-yellow-50 dark:hover:bg-yellow-900/20
                         hover:shadow-sm transition-all duration-200 cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="shrink-0 w-8 h-8 rounded-md bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-yellow-500" />
                </div>
                
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 truncate block">
                    {company.name || "Unnamed Company"}
                  </span>
                  {company.location && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">
                      {company.location}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Optional: Show job count if available */}
              <div className="shrink-0">
                <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors">
                  View
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          No featured companies.
        </p>
      )}
    </div>
  );
});
import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../../../Service/jobservices";
import { Briefcase, MapPin, AlertCircle, RefreshCw, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function JobTopRolesCard() {
  const navigate = useNavigate();
  
  /* ---------------------- 🔹 Fetch Ranked Jobs ---------------------- */
  const { 
    data: jobs = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const topRoles = jobs.slice(0, 5);
 

  // Fixed: Enhanced handleRoleClick function
  const handleRoleClick = (role) => {
    
    
    // Prepare query parameters
    const queryParams = new URLSearchParams();
    
    // Add job role/title
    if (role.jobRole) {
      queryParams.append("role", role.jobRole);
    } else if (role.jobTitle) {
      queryParams.append("role", role.jobTitle);
    }
    
    // Add other relevant filters if available
    if (role.city) queryParams.append("city", role.city);
    if (role.state) queryParams.append("state", role.state);
    if (role.country) queryParams.append("country", role.country);
    if (role.jobType) queryParams.append("type", role.jobType);
    if (role.experienceLevel) queryParams.append("experience", role.experienceLevel);
    
    // Navigate with query parameters
    navigate(`/jobs?${queryParams.toString()}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-green-100 dark:hover:shadow-green-900/20 transition-all duration-300"
    >
      <TopJobRoles 
        roles={topRoles} 
        onRoleSelect={handleRoleClick}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
      />
    </motion.div>
  );
}

/* ============================================================================
   ⭐ Combined TopJobRoles Component
   ============================================================================ */
const TopJobRoles = memo(function TopJobRoles({ 
  roles = [], 
  onRoleSelect,
  isLoading,
  isError,
  error,
  onRetry 
}) {
  const fade = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="pb-2">
        <Header />
        <div className="space-y-1.5">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-2 rounded-lg bg-gray-50 dark:bg-[#202024] animate-pulse"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded flex-1" />
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="pb-2">
        <Header />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Failed to load roles
              </h4>
              <p className="text-xs text-red-600 dark:text-red-300 mb-2">
                {error?.message || "Unable to fetch top job roles"}
              </p>
              <button
                onClick={onRetry}
                className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-700/30 text-red-700 dark:text-red-300 px-2.5 py-1 rounded transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Handle click on a role
  const handleClick = (role) => {
    if (onRoleSelect) {
      onRoleSelect(role); // Pass the entire role object
    }
  };

  return (
    <div className="pb-2">
      {/* Header */}
      <Header />

      {/* Roles List */}
      {roles.length > 0 ? (
        <motion.ul
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-1.5"
        >
          {roles.map((role, i) => (
            <motion.li
              key={role._id || i}
              variants={fade}
              onClick={() => handleClick(role)} // Pass the entire role object
              className="p-2 rounded-lg bg-gray-50/60 dark:bg-[#202024]/60 
                         hover:bg-green-50 dark:hover:bg-green-900/20 
                         border border-transparent hover:border-green-200 dark:hover:border-green-800/50
                         hover:shadow-sm cursor-pointer group transition-all duration-200"
            >
              {/* Role Title */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:bg-green-600 transition-colors flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors truncate block">
                    {role.jobTitle || role.jobRole || "Untitled Role"}
                  </span>
                  
                  {/* Company Name */}
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate block">
                    {role.companyName || role.postedBy?.companyName || "Company"}
                  </span>
                </div>
              </div>

              {/* Location & Salary */}
              <div className="flex flex-col gap-0.5">
                {(role.city || role.state || role.country) && (
                  <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                    <MapPin className="w-3 h-3 text-green-500 flex-shrink-0" />
                    <span className="truncate">
                      {[role.city, role.state, role.country]
                        .filter(Boolean)
                        .slice(0, 2)
                        .join(", ")}
                    </span>
                  </div>
                )}

                {/* Salary Information - Added this section */}
                {(role.salaryMin !== undefined || role.salaryMax !== undefined) && (
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs">
                    <Briefcase className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">
                      {(() => {
                        const min = role.salaryMin;
                        const max = role.salaryMax;
                        const hasMin = min !== undefined && min !== null && min !== 0;
                        const hasMax = max !== undefined && max !== null && max !== 0;

                        if (!hasMin && !hasMax) {
                          return "Attractive Salary";
                        } else if (hasMin && hasMax) {
                          return `₹${min} - ₹${max}`;
                        } else if (hasMin) {
                          return `₹${min}`;
                        } else if (hasMax) {
                          return `₹${max}`;
                        }
                        return "Attractive Salary";
                      })()}
                      {(() => {
                        const min = role.salaryMin;
                        const max = role.salaryMax;
                        const hasMin = min !== undefined && min !== null && min !== 0;
                        const hasMax = max !== undefined && max !== null && max !== 0;

                        if ((hasMin || hasMax) && role.salaryType) {
                          return ` per ${role.salaryType}`;
                        }
                        return '';
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 text-center rounded-lg bg-gray-50 dark:bg-[#202024] border border-gray-100 dark:border-gray-800"
        >
          <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-0.5">
            No trending roles
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs">
            Roles will appear based on engagement
          </p>
        </motion.div>
      )}
    </div>
  );
});

// Separate Header Component
const Header = memo(() => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/30">
      <Briefcase className="w-4 h-4" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight">
        Top Job Roles
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Most sought-after positions
      </p>
    </div>
  </div>
));
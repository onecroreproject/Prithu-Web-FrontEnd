import React, { useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../../../Service/jobservice";
import UnifiedJobPopup from "./unifiedJobPopUp";
import { Star, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function JobFeaturedCompaniesCard() {
   const { data: jobs = [], isLoading, isError } = useQuery({
      queryKey: ["rankedJobs"],
      queryFn: fetchRankedJobs,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  const featuredCompanies = [...new Set(jobs.map((j) => j.companyName))].slice(0, 5);

  const [popup, setPopup] = useState({ open: false, data: null });

  const openPopup = (company) =>
    setPopup({ open: true, data: { name: company } });

  const closePopup = () => setPopup({ open: false, data: null });

  if (isLoading) return <div className="p-4 bg-white rounded-xl">Loading…</div>;
  if (isError) return <div className="p-4 bg-red-100 rounded-xl">Error</div>;

  return (
    <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <FeaturedCompanies companies={featuredCompanies} onCompanySelect={openPopup} />

      <UnifiedJobPopup
        open={popup.open}
        onClose={closePopup}
        type="company"
        data={popup.data}
        allJobs={jobs}
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
              key={company?._id || company || i}
              variants={fade}
              initial="hidden"
              animate="visible"
              onClick={() => onCompanySelect && onCompanySelect(company)}
              className="flex items-center gap-2 p-3 rounded-lg
                         bg-gray-50/50 dark:bg-[#202024]/50
                         hover:bg-yellow-50 dark:hover:bg-yellow-900/20
                         hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-yellow-500 shrink-0" />

              <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 truncate">
                {company?.name || company || "Unnamed Company"}
              </span>
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

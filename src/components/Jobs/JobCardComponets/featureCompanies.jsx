// ✅ src/components/jobs/FeaturedCompanies.jsx
import React, { memo } from "react";
import { Star, Building2 } from "lucide-react";
import { motion } from "framer-motion";

const FeaturedCompanies = ({ companies = [], onCompanySelect }) => {
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

      {/* Companies List */}
      {companies.length > 0 ? (
        <ul className="grid gap-2 sm:gap-3">
          {companies.map((company, i) => (
            <motion.li
              key={company?._id || i}
              variants={fade}
              initial="hidden"
              animate="visible"
              onClick={() => onCompanySelect && onCompanySelect(company)} // ✅ Added callback
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
};

export default memo(FeaturedCompanies);

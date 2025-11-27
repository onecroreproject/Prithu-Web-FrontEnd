// ✅ src/components/jobs/JobCard.jsx
import React, { memo, lazy, Suspense, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../Service/jobservices";
import { motion, AnimatePresence } from "framer-motion";

/* --------------------------- 🔹 Lazy-loaded components --------------------------- */
const TopJobRoles = lazy(() => import("./Jobs/JobCardComponets/topRoles"));
const LatestOpenings = lazy(() => import("./Jobs/JobCardComponets/latestOpenings"));
const FeaturedCompanies = lazy(() => import("./Jobs/JobCardComponets/featureCompanies"));
const UnifiedJobPopup = lazy(() => import("./Jobs/JobCardComponets/unifiedJobPopUp"));

/* --------------------------- 🔹 Skeleton Loader --------------------------- */
const SkeletonBlock = ({ width = "w-full", height = "h-4" }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded-md ${width} ${height} animate-pulse`} />
);

const SkeletonJobCard = memo(() => (
  <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5 min-h-[420px] flex flex-col justify-center">
    <SkeletonBlock width="w-1/3" height="h-6" />
    <div className="space-y-3 mt-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBlock key={i} width="w-full" height="h-4" />
      ))}
    </div>
  </div>
));

/* --------------------------- 🔹 Empty State Components --------------------------- */
const EmptyState = ({ title, message, icon }) => (
  <div className="flex flex-col items-center justify-center h-[280px] text-center p-6">
    <div className="text-gray-400 dark:text-gray-500 mb-3">
      {icon}
    </div>
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-sm">{message}</p>
  </div>
);

const EmptyRolesIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EmptyOpeningsIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
  </svg>
);

const EmptyCompaniesIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

/* --------------------------- 🔹 Motion Config --------------------------- */
const fade = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.4, ease: "easeInOut" } },
};

/* --------------------------- 🔹 Main Component --------------------------- */
function JobCard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // ✅ Handle the new response structure from controller
  const jobs = Array.isArray(data?.jobs) ? data.jobs : 
               Array.isArray(data) ? data : 
               [];
console.log(jobs)
  // ✅ Slice early for performance
  const topRoles = jobs.slice(0, 5);
  const latestOpenings = jobs
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const featuredCompanies = [...new Set(jobs.map((job) => job.companyName))].slice(0, 5);

  /* --------------------------- 🔹 Popup State --------------------------- */
  const [popup, setPopup] = useState({ open: false, type: null, data: null });
  const openPopup = (type, data) => setPopup({ open: true, type, data });
  const closePopup = () => setPopup({ open: false, type: null, data: null });

  /* --------------------------- 🔹 Auto-Rotation Logic --------------------------- */
  const sections = ["roles", "openings", "companies"];
  const [activeSection, setActiveSection] = useState("roles");
  const intervalRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!paused && jobs.length > 0) {
      intervalRef.current = setInterval(() => {
        setActiveSection((prev) => {
          const currentIndex = sections.indexOf(prev);
          const nextIndex = (currentIndex + 1) % sections.length;
          return sections[nextIndex];
        });
      }, 7000);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused, jobs.length]);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

  // Stop rotation if no data
  useEffect(() => {
    if (jobs.length === 0) {
      setPaused(true);
    }
  }, [jobs.length]);

  return (
    <div
      className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SkeletonJobCard key="skeleton" />
        ) : isError ? (
          <motion.div
            key="error"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 min-h-[420px] flex flex-col items-center justify-center text-center p-8"
          >
            <div className="text-red-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Jobs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              {error?.message || "We encountered an issue while fetching job data. Please try refreshing the page."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        ) : jobs.length === 0 ? (
          <motion.div
            key="empty"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 min-h-[420px] flex flex-col items-center justify-center text-center p-8"
          >
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Jobs Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md">
              There are currently no active job listings. Please check back later for new opportunities.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 p-5 sm:p-8 transition-all overflow-hidden min-h-[420px] flex flex-col justify-between"
          >
            {/* 🔹 Section Title */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-6 select-none">
              {activeSection === "roles"
                ? "Top Roles"
                : activeSection === "openings"
                ? "Latest Openings"
                : "Featured Companies"}
            </h2>

            {/* 🌀 Animated Section Content */}
            <Suspense fallback={<SkeletonBlock width="w-full" height="h-8" />}>
              <div className="flex-1 overflow-hidden transition-all duration-500">
                <AnimatePresence mode="wait">
                  {activeSection === "roles" && (
                    <motion.div
                      key="roles"
                      variants={fade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {topRoles.length > 0 ? (
                        <TopJobRoles
                          roles={topRoles}
                          onRoleSelect={(role) => openPopup("role", role)}
                        />
                      ) : (
                        <EmptyState
                          title="No Top Roles Available"
                          message="There are currently no featured job roles. Check back later for new opportunities."
                          icon={<EmptyRolesIcon />}
                        />
                      )}
                    </motion.div>
                  )}

                  {activeSection === "openings" && (
                    <motion.div
                      key="openings"
                      variants={fade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {latestOpenings.length > 0 ? (
                        <LatestOpenings
                          openings={latestOpenings}
                          onOpeningSelect={(job) => openPopup("role", job)}
                        />
                      ) : (
                        <EmptyState
                          title="No Latest Openings"
                          message="No recent job openings found. New opportunities will be posted soon."
                          icon={<EmptyOpeningsIcon />}
                        />
                      )}
                    </motion.div>
                  )}

                  {activeSection === "companies" && (
                    <motion.div
                      key="companies"
                      variants={fade}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      {featuredCompanies.length > 0 ? (
                        <FeaturedCompanies
                          companies={featuredCompanies}
                          onCompanySelect={(company) =>
                            openPopup("company", { name: company })
                          }
                        />
                      ) : (
                        <EmptyState
                          title="No Featured Companies"
                          message="There are currently no featured companies. Check back later for updates."
                          icon={<EmptyCompaniesIcon />}
                        />
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 🧠 Unified Popup */}
              <UnifiedJobPopup
                open={popup.open}
                onClose={closePopup}
                type={popup.type}
                data={popup.data}
                allJobs={jobs}
              />
            </Suspense>

            {/* 🔹 Navigation Dots */}
            {jobs.length > 0 && (
              <div className="flex justify-center space-x-2 mt-6">
                {sections.map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      activeSection === section
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                    }`}
                    aria-label={`Show ${section}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(JobCard);
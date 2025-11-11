// ✅ src/components/jobs/JobCard.jsx
import React, { memo, lazy, Suspense, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../Service/jobservice";
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

/* --------------------------- 🔹 Motion Config --------------------------- */
const fade = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.4, ease: "easeInOut" } },
};

/* --------------------------- 🔹 Main Component --------------------------- */
function JobCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const jobs = Array.isArray(data?.jobs) ? data.jobs : Array.isArray(data) ? data : [];

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
    if (!paused) {
      intervalRef.current = setInterval(() => {
        setActiveSection((prev) => {
          const currentIndex = sections.indexOf(prev);
          const nextIndex = (currentIndex + 1) % sections.length;
          return sections[nextIndex];
        });
      }, 7000);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused]);

  const handleMouseEnter = () => setPaused(true);
  const handleMouseLeave = () => setPaused(false);

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
            className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 min-h-[420px] flex items-center justify-center text-red-500 text-center"
          >
            Failed to load jobs. Please try again later.
          </motion.div>
        ) : !jobs.length ? (
          <motion.div
            key="empty"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 min-h-[420px] flex items-center justify-center text-gray-500 text-center"
          >
            No active jobs found.
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
                      {topRoles.length ? (
                        <TopJobRoles
                          roles={topRoles}
                          onRoleSelect={(role) => openPopup("role", role)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[280px]">
                          <p className="text-gray-500 dark:text-gray-400">
                            No top roles available.
                          </p>
                        </div>
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
                      {latestOpenings.length ? (
                        <LatestOpenings
                          openings={latestOpenings}
                          onOpeningSelect={(job) => openPopup("role", job)}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[280px]">
                          <p className="text-gray-500 dark:text-gray-400">
                            No openings found.
                          </p>
                        </div>
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
                      {featuredCompanies.length ? (
                        <FeaturedCompanies
                          companies={featuredCompanies}
                          onCompanySelect={(company) =>
                            openPopup("company", { name: company })
                          }
                        />
                      ) : (
                        <div className="flex items-center justify-center h-[280px]">
                          <p className="text-gray-500 dark:text-gray-400">
                            No featured companies available.
                          </p>
                        </div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default memo(JobCard);

// ✅ src/components/aptitude/TopAptitudePerformersCard.jsx
import React, { memo, lazy, Suspense, useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, AlertCircle, RefreshCw, Star, Clock, User, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* --------------------------- 🔹 Service Function --------------------------- */
const fetchTopAptitudePerformers = async () => {
  try {
    const { data } = await api.get("/api/top/aptitude/performers");
    if (data.success) {
      return data.data || [];
    } else {
      throw new Error(data.message || "Failed to fetch top aptitude performers");
    }
  } catch (error) {
    if (error.response?.status === 401) {
      console.error("Unauthorized access");
    }
    throw new Error(error.response?.data?.message || error.message || "Network error");
  }
};

/* --------------------------- 🔹 Skeleton Loader --------------------------- */
const SkeletonCard = memo(() => (
  <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
    <div className="pb-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 animate-pulse">
          <Trophy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <div className="h-4 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-1" />
          <div className="h-3 w-40 bg-gray-300 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#202024] animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            </div>
            <div className="flex items-center gap-1 mt-1.5">
              <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

/* --------------------------- 🔹 Empty State Components --------------------------- */
const EmptyState = ({ title, message, icon: Icon = Trophy }) => (
  <div className="p-3 text-center rounded-lg bg-gray-50 dark:bg-[#202024]">
    <Icon className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
    <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
    <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{message}</p>
  </div>
);

/* --------------------------- 🔹 Motion Config --------------------------- */
const fade = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
};

/* --------------------------- 🔹 Main Component --------------------------- */
function TopAptitudePerformersCard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const {
    data: performers = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["topAptitudePerformers"],
    queryFn: fetchTopAptitudePerformers,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    refetchIntervalInBackground: true, // Continue polling even when tab is not active
  });

  // ✅ Prepare data for different sections
  const topPerformers = performers.slice(0, 10);
  const recentPerformers = [...performers]
    .sort((a, b) => new Date(b.receivedAt) - new Date(a.receivedAt))
    .slice(0, 5);

  /* --------------------------- 🔹 Section Rotation Logic --------------------------- */
  const sections = ["performers", "stats"];
  const [activeSection, setActiveSection] = useState("performers");
  const rotationIntervalRef = useRef(null);
  const [rotationPaused, setRotationPaused] = useState(false);

  useEffect(() => {
    if (!rotationPaused && performers.length > 0) {
      rotationIntervalRef.current = setInterval(() => {
        setActiveSection((prev) => {
          const currentIndex = sections.indexOf(prev);
          const nextIndex = (currentIndex + 1) % sections.length;
          return sections[nextIndex];
        });
      }, 8000);
    }
    return () => {
      if (rotationIntervalRef.current) {
        clearInterval(rotationIntervalRef.current);
      }
    };
  }, [rotationPaused, performers.length]);

  const handleMouseEnter = () => setRotationPaused(true);
  const handleMouseLeave = () => setRotationPaused(false);

  /* --------------------------- 🔹 Event Handlers --------------------------- */
  const handleViewProfile = (userId) => {
    // Navigate to user profile
    navigate(`/profile/${userId}`);
  };

  const handleManualRefresh = async () => {
    try {
      await refetch();
      console.log("Data manually refreshed");
    } catch (err) {
      console.error("Refresh failed:", err);
    }
  };

  // Header Component
  const Header = memo(() => (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-md bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-800/30">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight">
            Aptitude Performance of the Week
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Top 10 aptitude performers
          </p>
        </div>
      </div>
  
    </div>
  ));

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-purple-100 dark:hover:shadow-purple-900/20 transition-all duration-300">
        <SkeletonCard />
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm">
        <div className="pb-3">
          <Header />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                  Failed to load performers
                </h4>
                <p className="text-xs text-red-600 dark:text-red-300 mb-3">
                  {error?.message || "Unable to fetch top aptitude performers"}
                </p>
                <button
                  onClick={handleManualRefresh}
                  className="flex items-center gap-1.5 text-xs bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-700/30 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-md transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-purple-100 dark:hover:shadow-purple-900/20 transition-all duration-300"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pb-3">
        {/* Header */}
        <Header />

        {/* Animated Content */}
        <Suspense fallback={<div className="h-40"></div>}>
          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              {activeSection === "performers" ? (
                <motion.div
                  key="performers"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {topPerformers.length > 0 ? (
                    <PerformersSection 
                      performers={topPerformers}
                      onViewProfile={handleViewProfile}
                    />
                  ) : (
                    <EmptyState
                      title="No performers available"
                      message="Check back later for new results"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <StatsSection 
                    performers={performers}
                    recentPerformers={recentPerformers}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Suspense>

        {/* Navigation Dots */}
        {performers.length > 0 && (
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-center space-x-1.5 flex-1">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    activeSection === section
                      ? "bg-purple-600 w-4"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400"
                  }`}
                  aria-label={`Show ${section}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   ⭐ Performers Section Component
   ============================================================================ */
const PerformersSection = memo(({ performers, onViewProfile }) => {
  return (
    <motion.ul
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid gap-1.5"
    >
      {performers.map((performer, index) => (
        <motion.li
          key={performer._id || index}
          variants={fade}
          onClick={() => onViewProfile(performer.user.userId)}
          className="p-2.5 rounded-lg bg-gray-50/70 dark:bg-[#202024]/70 
                     hover:bg-purple-50 dark:hover:bg-purple-900/20 
                     border border-transparent hover:border-purple-200 dark:hover:border-purple-800/50
                     hover:shadow-sm transition-all duration-200 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Rank Badge */}
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                ${index === 0 ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50' :
                  index === 1 ? 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/30 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800/50' :
                  index === 2 ? 'bg-gradient-to-r from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800/50' :
                  'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800/50'
                }`}>
                {index + 1}
              </div>

              {/* Profile Avatar */}
              <div className="flex-shrink-0 relative">
                {performer.user.profileAvatar ? (
                  <>
                    <img 
                      src={performer.user.profileAvatar} 
                      alt={`${performer.user.name || "User"} avatar`}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="avatar-fallback hidden w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 items-center justify-center text-white font-semibold text-sm">
                      {(performer.user.name?.[0] || performer.user.userName?.[0] || "U").toUpperCase()}
                    </div>
                  </>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {(performer.user.name?.[0] || performer.user.userName?.[0] || "U").toUpperCase()}
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <User className="w-3 h-3 text-purple-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                    {performer.user.name ? 
                      `${performer.user.name} ${performer.user.lastName || ""}`.trim() : 
                      performer.user.userName || "Anonymous User"}
                  </span>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {performer.testName || "Aptitude Test"}
                </div>
              </div>
            </div>

            {/* Score & Time */}
            <div className="flex flex-col items-end gap-0.5 ml-2">
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                  {performer.score}%
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-2.5 h-2.5" />
                <span>{Math.round(performer.timeTaken / 60)}m</span>
              </div>
            </div>
          </div>

          {/* Location if available */}
          {(performer.user.city || performer.user.country) && (
            <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-1.5">
              <span className="truncate">
                {[performer.user.city, performer.user.country]
                  .filter(Boolean)
                  .slice(0, 2)
                  .join(", ")}
              </span>
            </div>
          )}
        </motion.li>
      ))}
    </motion.ul>
  );
});

/* ============================================================================
   ⭐ Stats Section Component
   ============================================================================ */
const StatsSection = memo(({ performers, recentPerformers }) => {
  if (performers.length === 0) {
    return <EmptyState title="No stats available" message="Performance data will appear here" />;
  }

  const avgScore = performers.length > 0
    ? (performers.reduce((sum, p) => sum + p.score, 0) / performers.length).toFixed(1)
    : 0;

  const topScore = performers.length > 0
    ? Math.max(...performers.map(p => p.score))
    : 0;

  const recentCount = recentPerformers.length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Top Score</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{topScore}%</div>
        </div>
        
        <div className="p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800/30">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Avg Score</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{avgScore}%</div>
        </div>
        
        <div className="p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/10 dark:to-amber-900/10 border border-orange-100 dark:border-orange-800/30">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Recent</span>
          </div>
          <div className="text-lg font-bold text-gray-900 dark:text-white">{recentCount}</div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentPerformers.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recent Achievements
          </h4>
          <div className="space-y-2">
            {recentPerformers.slice(0, 3).map((performer) => (
              <div key={performer._id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50/50 dark:bg-[#202024]/50">
                <div className="flex items-center gap-2">
                  {/* Profile Avatar */}
                  <div className="relative">
                    {performer.user.profileAvatar ? (
                      <>
                        <img 
                          src={performer.user.profileAvatar} 
                          alt={`${performer.user.name || "User"} avatar`}
                          className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            const fallback = e.target.parentElement.querySelector('.recent-avatar-fallback');
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <div className="recent-avatar-fallback hidden w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 items-center justify-center text-white font-semibold text-xs">
                          {(performer.user.name?.[0] || performer.user.userName?.[0] || "U").toUpperCase()}
                        </div>
                      </>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-xs">
                        {(performer.user.name?.[0] || performer.user.userName?.[0] || "U").toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                      {performer.user.name?.substring(0, 12) || performer.user.userName?.substring(0, 12) || "User"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">scored {performer.score}%</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(performer.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default memo(TopAptitudePerformersCard);
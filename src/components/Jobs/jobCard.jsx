// src/components/Jobs/jobCard.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ShareOutlined,
  FavoriteBorder,
  Favorite,
  WorkOutline,
  LocationOn,
  AccessTime,
  Star,
  Bolt,
  BookmarkBorder,
  Bookmark,
  Visibility,
} from "@mui/icons-material";
import api from "../../api/axios";
import JobDetailsPopup from "./jobCardPop-Up";
import { updateJobEngagement } from "../../Service/jobservices";
import { FEED_CARD_STYLE } from "../../constance/feedLayout";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const JobCard = ({ jobData }) => {
  const [isLiked, setIsLiked] = useState(jobData?.isLiked || false);
  const [isSaved, setIsSaved] = useState(jobData?.isSaved || false);
  const [stats, setStats] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  const {
    _id,
    title = "Software Engineer",
    companyName = "Unknown Company",
    city = "Remote",
    state,
    country,
    employmentType = "Full-time",
    workMode = "On-site",
    experience = "—",
    salaryRange = "Based on Experience",
    description = "No description provided",
    companyLogo = "https://cdn-icons-png.flaticon.com/512/1187/1187541.png",
    postedUserName = "Anonymous",
    postedAt = "Recently",
    createdAt,
    isPaid = false,
    isFeatured = false,
    boostLevel = 0,
    tags = [],
    likeCount = 0,
    shareCount = 0,
    saveCount = 0,
    viewCount = 0,
  } = jobData || {};

  // Format location
  const location = useMemo(() => {
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (state) return state;
    return "Remote";
  }, [city, state, country]);

  // Format job type badge
  const jobTypeBadge = useMemo(() => {
    if (employmentType === "full-time") return "Full Time";
    if (employmentType === "part-time") return "Part Time";
    if (employmentType === "contract") return "Contract";
    if (employmentType === "internship") return "Internship";
    if (employmentType === "freelance") return "Freelance";
    return employmentType;
  }, [employmentType]);

  // Format work mode badge
  const workModeBadge = useMemo(() => {
    if (workMode === "remote") return "Remote";
    if (workMode === "hybrid") return "Hybrid";
    if (workMode === "onsite") return "On-site";
    return workMode;
  }, [workMode]);

  // 🔥 NEW — Detect if job was posted today
  const isNew = useMemo(() => {
    if (!createdAt) return false;
    const posted = new Date(createdAt);
    const today = new Date();
    return (
      posted.getDate() === today.getDate() &&
      posted.getMonth() === today.getMonth() &&
      posted.getFullYear() === today.getFullYear()
    );
  }, [createdAt]);

  // Show boost badge for promoted jobs
  const showBoost = useMemo(() => isPaid || boostLevel > 0, [isPaid, boostLevel]);
  const navigate=useNavigate();
  const fetchStats = useCallback(async () => {
    try {
      const { data } = await api.get(`/job/stats/${_id}`);
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      console.error("Stats error:", err);
    }
  }, [_id]);

  // Observe visibility and fetch stats only when visible
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (visible) fetchStats();
  }, [visible, fetchStats]);

  const handleLike = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await updateJobEngagement(_id, "like", token);
      
      setIsLiked((prev) => !prev);
      fetchStats();
      
      toast.success(!isLiked ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Failed to update like.");
    }
  }, [_id, isLiked, fetchStats]);

  const handleSave = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await updateJobEngagement(_id, "save", token);
      
      setIsSaved((prev) => !prev);
      fetchStats();
      
      toast.success(!isSaved ? "Job saved" : "Job unsaved");
    } catch {
      toast.error("Failed to update save status.");
    }
  }, [_id, isSaved, fetchStats]);

  const handleShare = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const shareUrl = `${window.location.origin}/jobs/${_id}`;
      
      await navigator.clipboard.writeText(shareUrl);
      await updateJobEngagement(_id, "share", token);
      
      fetchStats();
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to share job.");
    }
  }, [_id, fetchStats]);

  const handleView = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await updateJobEngagement(_id, "view", token);
      fetchStats();
    } catch (err) {
      console.error("View update failed:", err);
    }
  }, [_id, fetchStats]);

  const handleViewDetails = useCallback(() => {
    handleView(); // Trigger view engagement
    navigate(`/job/${_id}`)
  }, [handleView]);

  // Clean description for card preview
  const cleanDescription = useMemo(() => {
    const text = description.replace(/<[^>]*>/g, '');
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
  }, [description]);

  return (
    <>
      <div ref={cardRef} className={`${FEED_CARD_STYLE} hover:shadow-lg transition-all duration-300 border border-gray-200`}>
        <div className="flex flex-col sm:flex-row">
          {/* LEFT - Company Image */}
          <div className="sm:w-1/4 p-3 flex items-center justify-center bg-gray-50 rounded-l-lg">
            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white border border-gray-200">
              <img
                loading="lazy"
                src={companyLogo}
                alt={companyName}
                className="w-full h-full object-cover"
              />
              
              {/* Badges */}
              <div className="absolute -top-1 -left-1 flex flex-col gap-1">
                {isNew && (
                  <span className="bg-red-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                    NEW
                  </span>
                )}
                {showBoost && (
                  <span className="bg-amber-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Bolt sx={{ fontSize: 8 }} />
                    BOOST
                  </span>
                )}
                {isFeatured && (
                  <span className="bg-blue-500 text-white text-[7px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Star sx={{ fontSize: 8 }} />
                    FEATURED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT - Job Details */}
          <div className="sm:w-3/4 p-3 sm:pl-0">
            {/* Header with title and actions */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-1">{title}</h3>
                <p className="text-blue-600 font-semibold text-sm line-clamp-1">{companyName}</p>
              </div>
              <div className="flex space-x-1 ml-2">
                {/* Share Button */}
                <button 
                  onClick={handleShare} 
                  className="text-gray-400 hover:text-blue-600 p-1 transition-colors relative group"
                  aria-label="Share job"
                >
                  <ShareOutlined fontSize="small" />
                  {shareCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {shareCount}
                    </span>
                  )}
                </button>
                
                {/* Save Button */}
                <button 
                  onClick={handleSave} 
                  className="text-gray-400 hover:text-green-600 p-1 transition-colors relative group"
                  aria-label="Save job"
                >
                  {isSaved ? 
                    <Bookmark fontSize="small" className="text-green-600" /> : 
                    <BookmarkBorder fontSize="small" />
                  }
                </button>
                
                {/* Like Button */}
                <button 
                  onClick={handleLike} 
                  className="text-gray-400 hover:text-red-500 p-1 transition-colors relative group"
                  aria-label="Like job"
                >
                  {isLiked ? 
                    <Favorite fontSize="small" className="text-red-500" /> : 
                    <FavoriteBorder fontSize="small" />
                  }
                </button>
              </div>
            </div>

            {/* Key Details */}
            <div className="space-y-1.5 mb-2">
              <div className="flex flex-wrap gap-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <LocationOn fontSize="small" />
                  <span className="line-clamp-1">{location}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <WorkOutline fontSize="small" />
                  <span>{jobTypeBadge}</span>
                </div>
                <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                  <AccessTime fontSize="small" />
                  <span>{workModeBadge}</span>
                </div>
                {experience !== "—" && (
                  <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <span>{experience}</span>
                  </div>
                )}
              </div>
              
              <div className="text-sm font-semibold text-green-600">
                {salaryRange}
              </div>
            </div>

            {/* Description Preview */}
            <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
              {cleanDescription}
            </p>

            {/* Tags (if any) */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index}
                    className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full border border-blue-100"
                  >
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="bg-gray-50 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                    +{tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Footer with user info and CTA */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                  <span className="text-xs font-medium text-gray-600">
                    {postedUserName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>Posted {postedAt}</span>
                  {viewCount > 0 && (
                    <div className="flex items-center gap-1">
                      <Visibility fontSize="small" />
                      <span>{viewCount}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <button
                onClick={handleViewDetails}
                className="bg-black text-white text-xs font-medium rounded-md px-3 py-1.5 hover:bg-gray-800 transition-all flex items-center gap-1"
              >
                <Visibility fontSize="small" />
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPopup && (
        <JobDetailsPopup 
          open={showPopup} 
          isSaved={isSaved}
          onSave={handleSave}
          onClose={() => setShowPopup(false)}
          job={jobData} 
        />
      )}
    </>
  );
};

export default React.memo(JobCard);
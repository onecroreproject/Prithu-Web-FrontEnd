// src/components/Jobs/jobCard.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  ShareOutlined,
  FavoriteBorder,
  Favorite,
  MoreVert,
  WorkOutline,
  LocationOn,
  AccessTime,
} from "@mui/icons-material";
import api from "../../api/axios";
import JobDetailsPopup from "./jobCardPop-Up";
import { FEED_CARD_STYLE } from "../../constance/feedLayout";
import { toast } from "react-hot-toast";

const JobCard = ({ jobData }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [stats, setStats] = useState({});
  const [showPopup, setShowPopup] = useState(false);
  const [visible, setVisible] = useState(false);
  const cardRef = useRef(null);

  const {
    _id,
    title = "Software Engineer",
    companyName = "Unknown Company",
    location = "Not specified",
    jobType = "Full-time",
    experience = "—",
    salaryRange = "Based on Experience",
    description = "No description provided",
    image = "",
    profileAvatar = "",
    userName = "Anonymous",
    postedAt = "Recently",
    createdAt,
  } = jobData || {};

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
      await api.post("/job/update", { jobId: _id, actionType: "like" });
      setIsLiked((p) => !p);
      fetchStats();
      toast.success(isLiked ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update like.");
    }
  }, [_id, fetchStats, isLiked]);

  const handleShare = useCallback(async () => {
    try {
      const shareUrl = `${window.location.origin}/jobs/${_id}`;
      await navigator.clipboard.writeText(shareUrl);
      await api.post("/job/update", { jobId: _id, actionType: "share" });
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to share job.");
    }
  }, [_id]);

  return (
    <>
      <div ref={cardRef} className={FEED_CARD_STYLE}>
        {/* TOP IMAGE SECTION */}
        <div className="relative h-40 sm:h-48 w-full overflow-hidden">
          <img
            loading="lazy"
            src={image || "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"}
            alt={title}
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* 🔥 NEW Badge */}
          {isNew && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse shadow-md">
              NEW
            </span>
          )}

          {/* Right Actions */}
          <div className="absolute top-2 right-2 flex space-x-2 text-white">
            <button onClick={handleShare} className="hover:text-gray-200" aria-label="Share job">
              <ShareOutlined fontSize="small" />
            </button>

            <button onClick={handleLike} className="hover:text-red-400" aria-label="Like job">
              {isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
            </button>

            <button className="hover:text-gray-200" aria-hidden>
              <MoreVert fontSize="small" />
            </button>
          </div>
        </div>

        {/* USER INFO (POSTED BY) */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <img
            loading="lazy"
            src={profileAvatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
            alt={userName}
            className="w-10 h-10 rounded-full border border-gray-300 object-cover"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500">Posted {postedAt}</p>
          </div>
        </div>

        {/* JOB DETAILS */}
        <div className="px-5 py-4">
          <p className="text-lg font-bold text-gray-900">{title}</p>
          <p className="text-sm font-semibold text-blue-700 mt-1">{companyName}</p>
          <p className="text-sm font-semibold text-gray-800 mt-1 mb-2">
            Salary: {salaryRange}
          </p>

          <div className="text-xs text-gray-600 space-y-1 mb-3">
            <div className="flex items-center gap-1">
              <LocationOn fontSize="small" /> {location}
            </div>
            <div className="flex items-center gap-1">
              <WorkOutline fontSize="small" /> {jobType}
            </div>
            <div className="flex items-center gap-1">
              <AccessTime fontSize="small" /> Experience: {experience}
            </div>
          </div>

    <div
  className="text-sm text-gray-600 line-clamp-3"
  dangerouslySetInnerHTML={{ __html: description }}
/>

        </div>

        {/* VIEW JOB BUTTON */}
        <div className="py-3 flex justify-center">
          <button
            onClick={() => setShowPopup(true)}
            className="bg-black text-white text-sm font-semibold rounded-lg px-6 py-2 hover:bg-gray-900 transition-all flex items-center gap-1"
          >
            View Job <span className="rotate-[-45deg]">↗</span>
          </button>
        </div>
      </div>

      {showPopup && (
        <JobDetailsPopup open={showPopup} onClose={() => setShowPopup(false)} job={jobData} />
      )}
    </>
  );
};

export default React.memo(JobCard);

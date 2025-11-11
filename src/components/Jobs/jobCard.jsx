/* ✅ src/components/JobPageComponent/JobCard.jsx */
import React, { useState, useEffect } from "react";
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

const JobCard = ({ jobData }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [stats, setStats] = useState({ totalLikes: 0, totalShares: 0 });
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

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
  } = jobData || {};

  /* 🧠 Fetch Engagement Stats */
  const fetchStats = async () => {
    try {
      const { data } = await api.get(`/job/stats/${_id}`);
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      console.error("Error fetching job stats:", err);
    }
  };
console.log(jobData)
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => mounted && setLoading(false), 300);
    fetchStats();
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [_id]);

  /* ❤️ Like */
  const handleLike = async () => {
    try {
      await api.post("/job/update", { jobId: _id, actionType: "like" });
      setIsLiked((prev) => !prev);
      fetchStats();
      setToastMsg(isLiked ? "Removed from favorites" : "Added to favorites");
    } catch {
      setToastMsg("Failed to update like.");
    }
  };

  /* 🔗 Share */
  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/jobs/${_id}`;
      await navigator.clipboard.writeText(shareUrl);
      await api.post("/job/update", { jobId: _id, actionType: "share" });
      fetchStats();
      setToastMsg("Job link copied!");
    } catch {
      setToastMsg("Failed to share job.");
    }
  };

  /* 🧱 Loading Skeleton */
  if (loading) {
    return (
      <div className="w-[600px] h-[500px] mx-auto rounded-2xl bg-gray-100 animate-pulse shadow-md" />
    );
  }

  /* 🎨 Render Job Card */
  return (
    <>
      <div className="w-[600px] h-[500px] bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 mx-auto flex flex-col overflow-hidden border border-gray-100">
        {/* 🖼️ Header Image */}
        <div
          className="relative h-44 w-full bg-gray-100 flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: image
              ? `url(${image})`
              : "url('https://cdn-icons-png.flaticon.com/512/1187/1187541.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          {/* Top Right Icons */}
          <div className="absolute top-2 right-2 flex space-x-2 text-white">
            <button onClick={handleShare} className="hover:text-gray-200">
              <ShareOutlined fontSize="small" />
            </button>
            <button onClick={handleLike} className="hover:text-red-400">
              {isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
            </button>
            <button className="hover:text-gray-200">
              <MoreVert fontSize="small" />
            </button>
          </div>
        </div>

        {/* 👤 Posted By */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
          <img
            src={
              profileAvatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={userName}
            className="w-10 h-10 rounded-full border border-gray-200"
          />
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-800">{userName}</p>
            <p className="text-xs text-gray-500">Posted {postedAt}</p>
          </div>
        </div>

        {/* 📋 Job Details */}
        <div className="flex-1 px-5 py-4">
          <p className="text-lg font-bold text-gray-900 leading-tight mb-1">
            {title}
          </p>

          <p className="text-sm font-semibold text-blue-700 mb-1">
            {companyName}
          </p>

          <p className="text-sm font-semibold text-gray-800 mb-2">
            Salary: {salaryRange}
          </p>

          <div className="text-xs text-gray-600 space-y-1.5 mb-3">
            <div className="flex items-center gap-1">
              <LocationOn fontSize="small" className="text-gray-400" />
              <span>{location}</span>
            </div>
            <div className="flex items-center gap-1">
              <WorkOutline fontSize="small" className="text-gray-400" />
              <span>{jobType}</span>
            </div>
            <div className="flex items-center gap-1">
              <AccessTime fontSize="small" className="text-gray-400" />
              <span>Experience: {experience}</span>
            </div>
          </div>

          {/* 📝 Description */}
          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
            {description}
          </p>
        </div>

        {/* 🔹 Footer */}
        <div className="border-t border-gray-100 flex justify-center py-3">
          <button
            onClick={() => setShowPopup(true)}
            className="bg-black text-white text-sm font-semibold rounded-lg px-6 py-2 hover:bg-gray-900 transition-all flex items-center gap-1"
          >
            View Job
            <span className="rotate-[-45deg]">↗</span>
          </button>
        </div>
      </div>

      {/* 🪟 Popup */}
      {showPopup && (
        <JobDetailsPopup
          open={showPopup}
          onClose={() => setShowPopup(false)}
          job={jobData}
        />
      )}

      {/* 🍞 Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 bg-black text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toastMsg}
        </div>
      )}
    </>
  );
};

export default JobCard;

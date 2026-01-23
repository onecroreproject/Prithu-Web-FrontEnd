import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../../api/axios";

const SearchJobDetailsPopup = () => {
  const { id } = useParams(); // ✅ Job ID from route params
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* -------------------------------------------------------------------------- */
  /* 🟢 Fetch job by ID from API                                                */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchJobById = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get(`/job/get/job/${id}`);
        setJob(data?.job || null);
      } catch (err) {
        console.error("❌ Error fetching job:", err);
        setError(err.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };
    fetchJobById();
  }, [id]);

  const onClose = () => navigate(-1); // ✅ Close popup and go back

  /* -------------------------------------------------------------------------- */
  /* 🔹 Helpers                                                                 */
  /* -------------------------------------------------------------------------- */
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", { dateStyle: "medium" })
      : "—";

  /* -------------------------------------------------------------------------- */
  /* 🔸 Loading or Error States                                                 */
  /* -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <CircularProgress size={36} />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">
            {error || "Job not found"}
          </p>
          <button
            onClick={onClose}
            className="mt-3 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------------------- */
  /* 🔹 Extract fields safely from job data                                     */
  /* -------------------------------------------------------------------------- */
  const {
    _id,
    title,
    companyName,
    category,
    location,
    jobRole,
    jobType,
    salary,
    experience,
    description,
    image,
    tags = [],
    postedBy = {},
    status,
    isApproved,
    isPaid,
    startDate,
    endDate,
    postedAt,
  } = job;

  const tagArray =
    typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : tags;

  /* -------------------------------------------------------------------------- */
  /* 🧩 Render UI                                                               */
  /* -------------------------------------------------------------------------- */
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* 🌿 Modal Container */}
        <motion.div
          className="relative w-full h-[600px] max-w-6xl mx-auto bg-white/90 dark:bg-[#1e1e28]/90 backdrop-blur-xl 
                     border border-white/20 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(34,197,94,0.3)] flex flex-col md:flex-row"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          {/* 🌈 Mobile Header */}
          <div className="md:hidden relative bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white py-3 text-center">
            <h2 className="text-lg font-semibold tracking-wide drop-shadow-md">
              {title}
            </h2>
          </div>

          {/* 🖼️ Left Section — Job Image */}
          <div className="relative md:w-1/2 w-full h-64 md:h-auto overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            {/* 🔹 Blurred Background */}
            <img
              src={
                image ||
                "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
              }
              alt={title}
              className="absolute inset-0 w-full h-full object-cover blur-lg scale-105 opacity-70"
            />

            {/* 🔹 Foreground Image */}
            <img
              src={
                image ||
                "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
              }
              alt={title}
              className="relative z-10 w-full h-full object-contain transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
          </div>

          {/* 📋 Right Section — Job Details */}
          <div className="flex-1 flex flex-col justify-between p-5 md:p-8 overflow-y-auto max-h-[90vh] relative">
            {/* ❌ Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-white bg-black hover:text-black hover:bg-white rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div>
              {/* Job Title & Company */}
              <div className="hidden md:block mb-3">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {companyName} — {location}
                </p>
              </div>

              {/* 👤 Posted By */}
              <div className="flex items-center gap-3 mt-3">
                <img
                  src={
                    postedBy.profileAvatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={postedBy.userName}
                  className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    Posted by{" "}
                    <span className="font-semibold">
                      {postedBy.userName || "Unknown User"}
                    </span>
                  </p>
                  {postedBy.email && (
                    <p className="text-xs text-gray-500">{postedBy.email}</p>
                  )}
                </div>
              </div>

              {/* 📊 Job Info */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mt-4 mb-4">
                <p>
                  <strong>Experience:</strong> {experience || "—"}
                </p>
                <p>
                  <strong>Salary:</strong> {salary || "—"}
                </p>
                <p>
                  <strong>Job Role:</strong> {jobRole || "—"}
                </p>
                <p>
                  <strong>Job Type:</strong> {jobType || "—"}
                </p>
                <p>
                  <strong>Category:</strong> {category || "—"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`font-semibold ${
                      status === "active" ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {status || "—"}
                  </span>
                </p>
                <p>
                  <strong>Posted:</strong> {postedAt || "—"}
                </p>
                <p>
                  <strong>Start Date:</strong> {formatDate(startDate)}
                </p>
                <p>
                  <strong>End Date:</strong> {formatDate(endDate)}
                </p>
              </div>

              {/* 🏷️ Tags */}
              {tagArray.length > 0 && (
                <div className="mb-4">
                  <strong className="text-gray-900 dark:text-white">
                    Tags:
                  </strong>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tagArray.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-semibold rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 📝 Description */}
              <div className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Description:
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-[#2a2a37] border border-gray-200 dark:border-gray-700 rounded-lg p-3 leading-relaxed">
                  {description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchJobDetailsPopup;

/* ✅ src/components/JobPageComponent/UnifiedJobPopup.jsx */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const UnifiedJobPopup = ({ open, onClose, type, data, allJobs = [] }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  if (!data) return null;

  /* 🧩 Determine data type */
  const isArrayData = Array.isArray(data);
  const isSingleJob = !isArrayData && data?._id && data?.title;

  /* 🔹 Filter jobs by company or role */
  const companyJobs =
    type === "company"
      ? allJobs.filter(
          (job) =>
            job.companyName?.toLowerCase().replace(/\s+/g, "") ===
            data.name?.toLowerCase().replace(/\s+/g, "")
        )
      : [];

  const roleJobs =
    type === "role"
      ? allJobs.filter((job) =>
          job.title
            ?.toLowerCase()
            .replace(/\s+/g, "")
            .includes(
              (data.title || data)?.toLowerCase?.()?.replace(/\s+/g, "") || ""
            )
        )
      : [];

  const listToShow = isArrayData
    ? data
    : type === "company"
    ? companyJobs
    : type === "role"
    ? roleJobs
    : [];

  const handleViewJob = (job) => setSelectedJob(job);
  const jobToShow = selectedJob || (isSingleJob ? data : null);

  /* 🧠 If a single job is selected, show detailed popup */
  if (jobToShow) {
    const {
      title,
      companyName,
      location,
      salaryRange,
      description,
      experience,
      contactLink,
      mobileNumber,
      image,
      profileAvatar,
      userName,
      tags = [],
    } = jobToShow;

    const tagArray =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim()).filter(Boolean)
        : tags;

    return (
      <AnimatePresence>
        {open && (
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
              {/* 🌈 Header for mobile */}
              <div className="md:hidden relative bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white py-3 text-center">
                <h2 className="text-lg font-semibold tracking-wide drop-shadow-md">
                  {title}
                </h2>
              </div>

              {/* 🖼️ Left Section — Full Job Image */}
      <div className="relative md:w-1/2 w-full h-64 md:h-auto overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900">
  {/* 🔹 Blurred Background Image */}
  <img
    src={
      image ||
      "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
    }
    alt={title}
    className="absolute inset-0 w-full h-full object-cover blur-lg scale-105 opacity-70"
  />

  {/* 🔹 Foreground (clear) Image */}
  <img
    src={
      image ||
      "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
    }
    alt={title}
    className="relative z-10 w-full h-full object-contain transition-transform duration-500"
  />

  {/* 🔹 Mobile gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
</div>

              {/* 📋 Right Section — Job Details */}
              <div className="flex-1 flex flex-col justify-between p-5 md:p-8 overflow-y-auto max-h-[90vh] relative">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    onClose();
                  }}
                  className="absolute top-3 right-3 text-white bg-black hover:text-black hover:bg-white rounded-full transition"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Job Header */}
                <div>
                  <div className="hidden md:block mb-3">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {companyName} — {location}
                    </p>
                  </div>

                  {/* Posted By */}
                  <div className="flex items-center gap-3 mt-3">
                    <img
                      src={
                        profileAvatar ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt={userName}
                      className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600"
                    />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      Posted by <span className="font-semibold">{userName}</span>
                    </p>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mt-4 mb-4">
                    <p>
                      <strong>Experience:</strong> {experience || "—"}
                    </p>
                    <p>
                      <strong>Salary:</strong> {salaryRange || "—"}
                    </p>
                    <p>
                      <strong>Job Type:</strong> {jobToShow.jobType || "—"}
                    </p>
                    <p>
                      <strong>Location:</strong> {location || "—"}
                    </p>
                  </div>

                  {/* Tags */}
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

                  {/* Description */}
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-1">
                      Description:
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-[#2a2a37] border border-gray-200 dark:border-gray-700 rounded-lg p-3 leading-relaxed">
                      {description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* 📞 Contact Section */}
                <div className="mt-4 flex flex-col items-center gap-3">
                  {contactLink && (
                    <a
                      href={contactLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-lg px-6 py-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-400/40"
                    >
                      Contact via Link
                    </a>
                  )}
                  {mobileNumber && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      📞 <strong>Mobile:</strong> {mobileNumber}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  /* 🧩 Default Listing View (if multiple jobs) */
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-2xl bg-white/90 dark:bg-[#1e1e28]/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_40px_rgba(34,197,94,0.3)] p-6 overflow-y-auto max-h-[80vh]"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {type === "company"
              ? data.name || "Company Jobs"
              : type === "role"
              ? `Jobs for ${data.title || data}`
              : "Available Jobs"}
          </h2>
          <button
            onClick={onClose}
            className="text-white bg-black hover:text-black hover:bg-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Jobs List */}
        {listToShow.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-300 text-sm">
            No related jobs found.
          </p>
        ) : (
          <div className="space-y-3">
            {listToShow.map((job, i) => (
              <div
                key={job._id || i}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-emerald-400 hover:shadow-md transition"
              >
                <h3 className="text-gray-900 dark:text-white font-semibold">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.companyName} — {job.location || "Remote"}
                </p>
                <button
                  onClick={() => handleViewJob(job)}
                  className="mt-2 text-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-1 rounded-md hover:from-green-600 hover:to-emerald-700 transition"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default UnifiedJobPopup;

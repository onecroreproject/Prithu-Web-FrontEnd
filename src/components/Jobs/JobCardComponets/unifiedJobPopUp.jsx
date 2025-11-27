// ✅ src/components/JobPageComponent/UnifiedJobPopup.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const UnifiedJobPopup = ({ open, onClose, type, data, allJobs = [] }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  if (!data) return null;

  /* 🧩 Determine data type */
  const isArrayData = Array.isArray(data);
  const isSingleJob = !isArrayData && data?._id && data?.jobTitle;

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
          job.jobTitle
            ?.toLowerCase()
            .replace(/\s+/g, "")
            .includes(
              (data.jobTitle || data)?.toLowerCase?.()?.replace(/\s+/g, "") || ""
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
      jobTitle,
      companyName,
      city,
      state,
      country,
      salaryMin,
      salaryMax,
      salaryCurrency,
      salaryType,
      jobDescription,
      employmentType,
      workMode,
      requiredSkills = [],
      preferredSkills = [],
      toolsAndTechnologies = [],
      companyLogo,
      openingsCount,
      freshersAllowed,
      remoteEligibility,
      shiftType,
      createdAt,
      tags = [],
      stats = {}
    } = jobToShow;

    // Format location
    const location = [city, state, country].filter(Boolean).join(", ") || "Location not specified";
    
    // Format salary
    const salaryRange = salaryMin && salaryMax 
      ? `${salaryCurrency} ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()} per ${salaryType}`
      : "Salary not specified";

    // Format experience/employment info
    const experienceInfo = `${employmentType || "Full-time"} • ${workMode || "On-site"}${freshersAllowed ? " • Freshers Welcome" : ""}`;

    // Combine all skills
    const allSkills = [...requiredSkills, ...preferredSkills, ...toolsAndTechnologies];
    const uniqueSkills = [...new Set(allSkills)].filter(Boolean);

    const tagArray = Array.isArray(tags) ? tags : 
                    typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];

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
                  {jobTitle}
                </h2>
              </div>

              {/* 🖼️ Left Section — Company/Job Image */}
              <div className="relative md:w-1/2 w-full h-64 md:h-auto overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                {/* 🔹 Blurred Background Image */}
                <img
                  src={
                    companyLogo ||
                    "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
                  }
                  alt={companyName}
                  className="absolute inset-0 w-full h-full object-cover blur-lg scale-105 opacity-70"
                />

                {/* 🔹 Foreground (clear) Company Logo */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-6">
                  <img
                    src={
                      companyLogo ||
                      "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
                    }
                    alt={companyName}
                    className="w-32 h-32 object-contain mb-4 bg-white/20 rounded-xl p-2"
                  />
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">{companyName}</h3>
                  <p className="text-white/90 text-sm mt-2 drop-shadow-md">{jobTitle}</p>
                </div>

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
                  className="absolute top-3 right-3 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 backdrop-blur-sm transition"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Job Header */}
                <div>
                  <div className="hidden md:block mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {jobTitle}
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold">
                      {companyName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {location}
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <p className="font-semibold text-green-700 dark:text-green-300">Open Positions</p>
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">{openingsCount || 1}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <p className="font-semibold text-blue-700 dark:text-blue-300">Views</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.views || 0}</p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mb-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Salary Range:</p>
                      <p>{salaryRange}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Employment Type:</p>
                      <p>{experienceInfo}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Shift Type:</p>
                      <p>{shiftType || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Remote Eligible:</p>
                      <p>{remoteEligibility ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  {/* Skills */}
                  {uniqueSkills.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Required Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {uniqueSkills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-sm font-medium rounded-full border border-emerald-200 dark:border-emerald-700"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {tagArray.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {tagArray.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-semibold rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description */}
                  <div className="mb-4">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">Job Description:</p>
                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#2a2a37] border border-gray-200 dark:border-gray-700 rounded-lg p-4 leading-relaxed max-h-40 overflow-y-auto">
                      {jobDescription || "No detailed description provided."}
                    </div>
                  </div>
                </div>

                {/* 📞 Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg px-6 py-3 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-400/40 text-center">
                    Apply Now
                  </button>
                  <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-center">
                    Save Job
                  </button>
                </div>

                {/* Posted Date */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                  Posted on {new Date(createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  /* 🧩 Default Listing View (if multiple jobs) */
  return (
    <AnimatePresence>
      {open && (
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
                  ? `Jobs for ${data.jobTitle || data}`
                  : "Available Jobs"}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Jobs List */}
            {listToShow.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-300 text-sm text-center py-8">
                No related jobs found.
              </p>
            ) : (
              <div className="space-y-3">
                {listToShow.map((job, i) => (
                  <div
                    key={job._id || i}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    onClick={() => handleViewJob(job)}
                  >
                    <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                      {job.jobTitle}
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {job.companyName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {[job.city, job.state, job.country].filter(Boolean).join(", ")}
                    </p>
                    {job.salaryMin && job.salaryMax && (
                      <p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-1">
                        {job.salaryCurrency} {job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {job.requiredSkills?.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnifiedJobPopup;
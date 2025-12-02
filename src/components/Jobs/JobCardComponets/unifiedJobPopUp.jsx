// ✅ src/components/JobPageComponent/UnifiedJobPopup.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Briefcase, MapPin, DollarSign, Clock } from "lucide-react";

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

  /* 🧠 Error State */
  if ((!isArrayData && !isSingleJob && listToShow.length === 0) || !open) {
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
              className="relative w-full max-w-md bg-white/95 dark:bg-[#1e1e28]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_30px_rgba(34,197,94,0.25)] p-6"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No Job Data Available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  We couldn't find any job information to display at the moment.
                </p>
                <button
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg px-4 py-2.5 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-400/30"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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
            {/* 🌿 Premium Modal Container */}
            <motion.div
              className="relative w-full h-[580px] max-w-5xl mx-auto bg-white/95 dark:bg-[#1e1e28]/95 backdrop-blur-xl 
                         border border-white/20 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(34,197,94,0.35)] flex flex-col md:flex-row"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              {/* 🌈 Header for mobile */}
              <div className="md:hidden relative bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white py-2 text-center">
                <h2 className="text-base font-semibold tracking-wide drop-shadow-md line-clamp-1 px-2">
                  {jobTitle}
                </h2>
              </div>

              {/* 🖼️ Left Section — Company/Job Image */}
              <div className="relative md:w-2/5 w-full h-48 md:h-auto overflow-hidden flex items-center justify-center bg-gray-100 dark:bg-gray-900">
                <img
                  src={
                    companyLogo ||
                    "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
                  }
                  alt={companyName}
                  className="absolute inset-0 w-full h-full object-cover blur-lg scale-105 opacity-70"
                />

                {/* 🔹 Foreground (clear) Company Logo */}
                <div className="relative z-10 flex flex-col items-center justify-center text-center p-4">
                  <img
                    src={
                      companyLogo ||
                      "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
                    }
                    alt={companyName}
                    className="w-20 h-20 object-contain mb-3 bg-white/20 rounded-xl p-1"
                  />
                  <h3 className="text-lg font-bold text-white drop-shadow-lg line-clamp-2">{companyName}</h3>
                  <p className="text-white/90 text-xs mt-1 drop-shadow-md line-clamp-2">{jobTitle}</p>
                </div>

                {/* 🔹 Mobile gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
              </div>

              {/* 📋 Right Section — Job Details */}
              <div className="flex-1 flex flex-col justify-between p-4 md:p-6 overflow-y-auto max-h-[90vh] relative">
                {/* Close Button */}
                <button
                  onClick={() => {
                    setSelectedJob(null);
                    onClose();
                  }}
                  className="absolute top-2 right-2 z-10 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-white/80 dark:bg-gray-800/80 rounded-full p-1 backdrop-blur-sm transition"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Job Header */}
                <div className="space-y-3">
                  <div className="hidden md:block">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {jobTitle}
                    </h2>
                    <p className="text-base text-gray-700 dark:text-gray-300 font-semibold line-clamp-1">
                      {companyName}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">{location}</span>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
                      <Briefcase className="w-4 h-4 mx-auto mb-1 text-green-600 dark:text-green-400" />
                      <p className="text-xs text-green-700 dark:text-green-300 font-medium">Openings</p>
                      <p className="text-sm font-bold text-green-600 dark:text-green-400">{openingsCount || 1}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
                      <Clock className="w-4 h-4 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Views</p>
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400">{stats.views || 0}</p>
                    </div>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-center">
                      <DollarSign className="w-4 h-4 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
                      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">Salary</p>
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 line-clamp-1">
                        {salaryMin ? "Provided" : "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Employment Type:</span>
                      <span className="text-gray-900 dark:text-white">{employmentType || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Work Mode:</span>
                      <span className="text-gray-900 dark:text-white">{workMode || "Not specified"}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Remote Eligible:</span>
                      <span className={`font-semibold ${remoteEligibility ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {remoteEligibility ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100 dark:border-gray-700">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Freshers Allowed:</span>
                      <span className={`font-semibold ${freshersAllowed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {freshersAllowed ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  {/* Skills */}
                  {uniqueSkills.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {uniqueSkills.slice(0, 8).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-700"
                          >
                            {skill}
                          </span>
                        ))}
                        {uniqueSkills.length > 8 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 text-xs rounded-full">
                            +{uniqueSkills.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {tagArray.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Tags:</p>
                      <div className="flex flex-wrap gap-1">
                        {tagArray.slice(0, 6).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-semibold rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description */}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Job Description:</p>
                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-[#2a2a37] border border-gray-200 dark:border-gray-700 rounded-lg p-3 leading-relaxed max-h-32 overflow-y-auto">
                      {jobDescription || "No detailed description provided."}
                    </div>
                  </div>
                </div>

                {/* 📞 Action Buttons */}
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg px-4 py-2.5 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-400/30 text-sm">
                    Apply Now
                  </button>
                  <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm">
                    Save Job
                  </button>
                </div>

                {/* Posted Date */}
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                  Posted on {createdAt ? new Date(createdAt).toLocaleDateString() : "Unknown date"}
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
            className="relative w-full max-w-2xl bg-white/95 dark:bg-[#1e1e28]/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_30px_rgba(34,197,94,0.25)] p-5 overflow-y-auto max-h-[70vh]"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
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
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-300 text-sm">
                  No related jobs found.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {listToShow.map((job, i) => (
                  <div
                    key={job._id || i}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-emerald-400 hover:shadow-[0_2px_12px_rgba(34,197,94,0.15)] transition-all cursor-pointer bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    onClick={() => handleViewJob(job)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-gray-900 dark:text-white font-semibold text-base line-clamp-1">
                          {job.jobTitle}
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium line-clamp-1">
                          {job.companyName}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mt-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">
                            {[job.city, job.state, job.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      </div>
                      {job.salaryMin && job.salaryMax && (
                        <div className="text-right">
                          <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                            {job.salaryCurrency} {job.salaryMin.toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400">
                            - {job.salaryMax.toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {job.requiredSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.requiredSkills.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                            +{job.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
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
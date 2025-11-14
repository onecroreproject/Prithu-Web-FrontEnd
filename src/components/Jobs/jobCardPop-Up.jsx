/* ✅ src/components/JobPageComponent/JobDetailsPopup.jsx */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const JobDetailsPopup = ({ open, onClose, job }) => {
  if (!open || !job) return null;

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

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", { dateStyle: "medium" })
      : "—";

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

              {/* 🔹 Foreground (clear) Image */}
              <img
                src={
                  image ||
                  "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
                }
                alt={title}
                className="relative z-10 w-full h-full object-contain transition-transform duration-500"
              />

              {/* 🔹 Mobile Gradient */}
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
                    <strong>Location:</strong> {location || "—"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`font-semibold ${
                        status === "active"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {status || "—"}
                    </span>
                  </p>

                  <p>
                    <strong>Posted:</strong> {postedAt || "—"}
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
      )}
    </AnimatePresence>
  );
};

export default JobDetailsPopup;

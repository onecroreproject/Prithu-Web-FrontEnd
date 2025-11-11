/* ✅ src/components/JobPageComponent/JobDetailsPopup.jsx */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const JobDetailsPopup = ({ open, onClose, job }) => {
  if (!open || !job) return null;

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
  } = job;

  const tagArray =
    typeof tags === "string"
      ? tags.split(",").map((t) => t.trim()).filter(Boolean)
      : tags;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50  flex items-center justify-center bg-black/40 backdrop-blur-sm px-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 🌿 Modal Container */}
          <motion.div
            className="relative w-full h-[700px] max-w-9xl mx-auto bg-white/90 dark:bg-[#1e1e28]/90 backdrop-blur-xl 
                       border border-white/20 rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(34,197,94,0.3)] flex flex-col md:flex-row"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
          >
            {/* 🌈 Header (Only on mobile view) */}
            <div className="md:hidden relative bg-gradient-to-r from-emerald-500 via-green-500 to-lime-500 text-white py-3 text-center">
              <h2 className="text-lg font-semibold tracking-wide drop-shadow-md">
                {title}
              </h2>
            </div>

            {/* 🖼️ Left Section — Full Job Image */}
            <div className="relative md:w-1/2 w-full h-64 md:h-auto overflow-hidden">
              <img
                src={
                  image ||
                  "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"
                }
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 "
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
            </div>

            {/* 📋 Right Section — Job Details */}
            <div className="flex-1 flex flex-col justify-between p-5 md:p-8 overflow-y-auto max-h-[90vh]">
              {/* Header with title + company */}
                <button
                onClick={onClose}
                className="absolute top-3 right-3 text-white bg-black hover:text-black hover:bg-white  rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
              <div>
                <div className="hidden md:block mb-3">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {companyName} — {location}
                  </p>
                </div>

                {/* Creator Info */}
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

                {/* Job Info Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300 mt-4 mb-4">
                  <p>
                    <strong>Experience:</strong> {experience || "—"}
                  </p>
                  <p>
                    <strong>Salary:</strong> {salaryRange || "—"}
                  </p>
                  <p>
                    <strong>Job Type:</strong> {job.jobType || "—"}
                  </p>
                  <p>
                    <strong>Location:</strong> {location || "—"}
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
};

export default JobDetailsPopup;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function JobManagePreviewModal({ job, onClose }) {
  if (!job) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <AnimatePresence>
      {job && (
        <motion.div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full relative overflow-y-auto max-h-[85vh]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Job Details
            </h3>

            {/* Job Info */}
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Title:</strong> {job.title || "—"}
              </p>
              <p>
                <strong>Company:</strong> {job.companyName || "—"}
              </p>
              <p>
                <strong>Category:</strong> {job.category || "—"}
              </p>
              <p>
                <strong>Role:</strong> {job.jobRole || "—"}
              </p>
              <p>
                <strong>Type:</strong> {job.jobType || "—"}
              </p>
              <p>
                <strong>Location:</strong> {job.location || "—"}
              </p>
              <p>
                <strong>Salary:</strong> {job.salaryRange || "—"}
              </p>
              <p>
                <strong>Experience:</strong> {job.experience || "—"}
              </p>

              <div className="border-t pt-3">
                <p>
                  <strong>Start Date:</strong> {formatDate(job.startDate)}
                </p>
                <p>
                  <strong>End Date:</strong> {formatDate(job.endDate)}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : job.status === "expired"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {job.status || "Unknown"}
                  </span>
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="font-semibold text-gray-800 mb-1">Description:</p>
                <p className="whitespace-pre-wrap border rounded p-2 bg-gray-50 text-gray-700">
                  {job.description || "No description provided."}
                </p>
              </div>

              {job.image && (
                <div className="mt-3">
                  <strong>Company Logo:</strong>
                  <div className="mt-2">
                    <img
                      src={job.image}
                      alt="Company Logo"
                      className="w-24 h-24 object-cover rounded-md border"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

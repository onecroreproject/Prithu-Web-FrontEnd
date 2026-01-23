import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function JobPreviewModal({ showPreview, setShowPreview, formData }) {
  if (!showPreview) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTags = (tags) => {
    if (!tags) return [];
    return tags
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t)
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase());
  };

  return (
    <AnimatePresence>
      {showPreview && (
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
            {/* ❌ Close Button */}
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>

            {/* 🏷️ Header */}
            <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Job Preview
            </h3>

            {/* 📋 Job Details */}
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Title:</strong> {formData.title || "—"}
              </p>
              <p>
                <strong>Company:</strong> {formData.companyName || "—"}
              </p>
              <p>
                <strong>Category:</strong> {formData.category || "—"}
              </p>
              <p>
                <strong>Role:</strong> {formData.jobRole || "—"}
              </p>
              <p>
                <strong>Type:</strong> {formData.jobType || "—"}
              </p>
              <p>
                <strong>Location:</strong> {formData.location || "—"}
              </p>
              <p>
                <strong>Salary:</strong> {formData.salaryRange || "—"}

              </p>
               <p>
                <strong>Experience:</strong> {job.experience || "—"}
              </p>

              <div className="border-t pt-3">
                <p>
                  <strong>Start Date:</strong> {formatDate(formData.startDate)}
                </p>
                <p>
                  <strong>End Date:</strong> {formatDate(formData.endDate)}
                </p>
              </div>

              {/* 🏷️ Tags */}
              {formData.tags && (
                <div className="border-t pt-3">
                  <strong>Tags:</strong>{" "}
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formatTags(formData.tags).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 🖼️ Company Logo */}
              {formData.image && (
                <div className="mt-3 border-t pt-3">
                  <strong>Company Logo:</strong>
                  <div className="mt-2">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Company Logo"
                      className="w-24 h-24 object-cover rounded-md border"
                    />
                  </div>
                </div>
              )}

              {/* 📝 Description */}
              <div className="border-t pt-3">
                <p className="font-semibold text-gray-800 mb-1">Description:</p>
                <p className="whitespace-pre-wrap border rounded p-2 bg-gray-50 text-gray-700">
                  {formData.description || "No description provided."}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

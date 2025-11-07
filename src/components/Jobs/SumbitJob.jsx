// src/components/jobs/submit/SubmitJob.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import JobForm from "./SubmitJobComponents/jobForm";
import JobPreviewModal from "./SubmitJobComponents/jobPreview";

export default function SubmitJob() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    companyName: "",
    location: "",
    category: "",
    jobRole: "",
    keyword: "",
    jobType: "Full-time",
    salaryRange: "",
    startDate: "",
    endDate: "",
    tags: "",
    image: null,
    isPaid: false,
    status: "draft",
    experience:"",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Format tags nicely
  const formatTags = (tags) =>
    tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
          .map((t) => t.charAt(0).toUpperCase() + t.slice(1).toLowerCase())
      : [];

  // Handle Job Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "tags") formatTags(value).forEach((tag) => data.append("tags[]", tag));
        else data.append(key, value);
      });
      data.set("status", "publish");

      await api.post("/job/user/job/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Job posted successfully!");
      setFormData({
        title: "",
        description: "",
        companyName: "",
        location: "",
        category: "",
        jobRole: "",
        keyword: "",
        jobType: "Full-time",
        salaryRange: "",
        startDate: "",
        endDate: "",
        tags: "",
        experience:"",
        image: null,
        isPaid: false,
        status: "draft",
      });
    } catch (err) {
      console.error("Error publishing job:", err);
      toast.error("Failed to post job. Please check all required fields.");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        <JobForm formData={formData} setFormData={setFormData} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Eye className="w-5 h-5" /> Preview
          </button>

          <button
            type="submit"
            disabled={publishing}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white transition ml-auto ${
              publishing ? "bg-purple-400 cursor-not-allowed" : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <Plus className="w-5 h-5" /> {publishing ? "Publishing..." : "Publish Job"}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <JobPreviewModal
  showPreview={showPreview}
  setShowPreview={setShowPreview}
  formData={formData}
/>

        )}
      </AnimatePresence>
    </motion.div>
  );
}

// src/components/jobs/manage/ManageJobs.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import api from "../../api/axios";

// Components
import JobTable from "./ManageJobsComponents/formTable";
import JobEditForm from "./ManageJobsComponents/jobEditForm";
import JobManagePreviewModal from "./ManageJobsComponents/jobPreviewModel"; 

export default function ManageJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editJob, setEditJob] = useState(null);
  const [previewJob, setPreviewJob] = useState(null); // ✅ used for modal

  // ✅ Fetch user's jobs
  const fetchUserJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/job/get/jobs/by/userId`);
      if (res.data.success) setJobs(res.data.jobs);
      else toast.error(res.data.message || "No jobs found");
    } catch (err) {
      console.error("Error fetching jobs:", err);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserJobs();
  }, []);

  // 🗑️ Delete job
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/job/delete/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error("Error deleting job:", err);
      toast.error("Failed to delete job");
    }
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Job Listings</h2>

      <AnimatePresence mode="wait">
        {!editJob ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <JobTable
              jobs={jobs}
              loading={loading}
              onEdit={setEditJob}
              onPreview={setPreviewJob} // ✅ sets preview data
              onDelete={handleDelete}
            />
          </motion.div>
        ) : (
          <JobEditForm
            key="editform"
            editJob={editJob}
            setEditJob={setEditJob}
            onCancel={() => setEditJob(null)}
            refreshJobs={fetchUserJobs}
          />
        )}
      </AnimatePresence>
<AnimatePresence>
  {previewJob && (
    <JobManagePreviewModal job={previewJob} onClose={() => setPreviewJob(null)} />
  )}
</AnimatePresence>

    </div>
  );
}

// src/components/jobs/AllJobs.jsx
import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  Building,
  Trash2,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AllJobs() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  // ✅ Fetch all jobs by logged-in user
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/job/get/jobs/by/userId");
      const fetchedJobs = res.data.jobs || [];
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // 🧠 Utility to check if job falls under filter time range
  const isWithinFilter = (date, range) => {
    if (!date) return false;
    const jobDate = new Date(date);
    const now = new Date();
    const diff = (now - jobDate) / (1000 * 60 * 60 * 24); // difference in days

    switch (range) {
      case "today":
        return jobDate.toDateString() === now.toDateString();
      case "yesterday":
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return jobDate.toDateString() === yesterday.toDateString();
      case "week":
        return diff <= 7;
      case "month":
        return diff <= 30;
      case "year":
        return diff <= 365;
      default:
        return true;
    }
  };

  // 🔍 Apply filters dynamically (search + date range)
  useEffect(() => {
    const filtered = jobs.filter((job) => {
      const title = job.title?.toLowerCase() || "";
      const searchTerm = search.toLowerCase();
      const matchesSearch =
        title.startsWith(searchTerm) ||
        title.split(" ").some((w) => w.startsWith(searchTerm));

      const matchesFilter =
        filter === "all" || isWithinFilter(job.createdAt, filter);

      return matchesSearch && matchesFilter;
    });

    setFilteredJobs(filtered);
  }, [search, filter, jobs]);

  // 🗑️ Delete job
  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    try {
      setDeleting(jobId);
      await api.delete(`/api/job/delete/jobs/${jobId}`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete job");
    } finally {
      setDeleting(null);
    }
  };

  // ♻️ Reset filters
  const handleReset = () => {
    setSearch("");
    setFilter("all");
    setFilteredJobs(jobs);
  };

  return (
    <div className="space-y-6">
      {/* 🔍 Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* Search bar */}
        <div className="flex-1 relative w-full">
          <input
            type="text"
            placeholder="Search by job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>

        {/* Filter dropdown */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
        >
          <option value="all">All Jobs</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="year">Last Year</option>
        </select>

        {/* Reset button */}
        <button
          onClick={handleReset}
          className="border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 text-gray-700 transition"
        >
          Reset
        </button>
      </div>

      {/* 🧾 Job Listings */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <p className="text-center text-gray-500 py-6">No jobs found.</p>
        ) : (
          <AnimatePresence>
            {filteredJobs.map((job) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                layout
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex justify-between items-start"
              >
                <div className="flex gap-4">
                  {job.image ? (
                    <img
                      src={job.image}
                      alt={job.title}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center rounded-lg bg-gray-100 border">
                      <Briefcase className="w-6 h-6 text-gray-500" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <Building className="w-4 h-4" /> {job.companyName}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-4 h-4" /> {job.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {job.status === "active" ? "Active" : "Draft"}
                  </span>

                  <button
                    onClick={() => handleDelete(job._id)}
                    disabled={deleting === job._id}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    {deleting === job._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

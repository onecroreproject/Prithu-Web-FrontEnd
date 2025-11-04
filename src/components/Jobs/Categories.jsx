// src/components/jobs/Categories.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { ChevronDown, ChevronUp, Briefcase, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function Categories() {
  const [jobs, setJobs] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all jobs by userId
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/job/get/jobs/by/userId");
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ✅ Group jobs by category
  const groupedCategories = jobs.reduce((acc, job) => {
    const category = job.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(job);
    return acc;
  }, {});

  // ✅ Toggle expand/collapse
  const handleCategoryClick = (category) => {
    setExpandedCategory((prev) => (prev === category ? null : category));
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Job Categories</h2>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
        </div>
      ) : Object.keys(groupedCategories).length === 0 ? (
        <p className="text-gray-500 text-center py-6">No jobs found.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedCategories).map(([category, catJobs]) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Category Header */}
              <div
                onClick={() => handleCategoryClick(category)}
                className="p-5 flex justify-between items-center cursor-pointer"
              >
                <h3 className="font-medium text-gray-900">{category}</h3>
                <div className="flex items-center gap-3">
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {catJobs.length}
                  </span>
                  {expandedCategory === category ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>

              {/* Smooth Expand/Collapse Animation */}
              <AnimatePresence initial={false}>
                {expandedCategory === category && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 space-y-3">
                      {catJobs.map((job) => (
                        <motion.div
                          key={job._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex justify-between items-center border-t border-gray-100 pt-3"
                        >
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-800 text-sm">
                                {job.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                Expires:{" "}
                                {job.endDate
                                  ? new Date(job.endDate).toLocaleDateString()
                                  : "N/A"}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              job.status === "active"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {job.status || "N/A"}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

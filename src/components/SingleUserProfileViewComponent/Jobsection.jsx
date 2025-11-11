import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Grid3X3,
  Search,
  MapPin,
  Building,
  Loader2,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

export default function JobPortal({ userData }) {
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "categories", label: "Categories", Icon: Grid3X3 },
    { id: "all", label: "All Jobs", Icon: Briefcase },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "categories":
        return <CategoriesView userId={userData?._id} />;
      case "all":
      default:
        return <AllJobsView userId={userData?._id} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "border-b-2 border-purple-600 text-purple-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">{renderContent()}</div>
    </div>
  );
}

/* ────────────────────────────────
   ✅ All Jobs (View Only)
──────────────────────────────── */
function AllJobsView({ userId }) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchJobs = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const res = await api.post("/job/get/jobs/by/userId/params", { userId });
      const fetchedJobs = res.data.jobs || [];
      setJobs(fetchedJobs);
      setFilteredJobs(fetchedJobs);
    } catch (err) {
      console.error("❌ Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const isWithinFilter = (date, range) => {
    if (!date) return false;
    const jobDate = new Date(date);
    const now = new Date();
    const diff = (now - jobDate) / (1000 * 60 * 60 * 24);

    switch (range) {
      case "today":
        return jobDate.toDateString() === now.toDateString();
      case "yesterday": {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return jobDate.toDateString() === yesterday.toDateString();
      }
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

  const handleReset = () => {
    setSearch("");
    setFilter("all");
    setFilteredJobs(jobs);
  };

  return (
    <div className="space-y-6">
      {/* 🔍 Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
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
                transition={{ duration: 0.3 }}
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

                    {job.endDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          <b>Ends On:</b> {dayjs(job.endDate).format("YYYY-MM-DD")}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    job.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {job.status === "active" ? "Active" : "Draft"}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────
   ✅ Categories (View Only)
──────────────────────────────── */
function CategoriesView({ userId }) {
  const [jobs, setJobs] = useState([]);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      if (!userId) return;
      setLoading(true);
      const res = await api.post("/job/get/jobs/by/userId/params", { userId });
      setJobs(res.data.jobs || []);
    } catch (err) {
      console.error("❌ Failed to fetch jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const groupedCategories = jobs.reduce((acc, job) => {
    const category = job.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(job);
    return acc;
  }, {});

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

              <AnimatePresence initial={false}>
                {expandedCategory === category && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
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

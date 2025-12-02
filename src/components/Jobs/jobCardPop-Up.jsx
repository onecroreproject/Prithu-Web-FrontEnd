/* ✅ src/components/JobPageComponent/JobDetailsPopup.jsx */
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  User, 
  Mail, 
  Star,
  Zap,
  TrendingUp,
  Shield,
  Bookmark,
  BookmarkCheck,
  Send,
  Calendar,
  Globe,
  Users,
  Eye
} from "lucide-react";

const JobDetailsPopup = ({ open, onClose, job, onSave, isSaved }) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  if (!open || !job) return null;

  const {
    _id,
    title,
    companyName,
    category,
    city,
    state,
    country,
    jobRole,
    employmentType,
    workMode,
    salaryRange,
    experience,
    description,
    companyLogo,
    tags = [],
    postedBy = {},
    status,
    isApproved,
    isPaid,
    isFeatured,
    isPromoted,
    engagementScore,
    createdAt,
    postedAt,
    viewCount,
    likeCount,
    saveCount
  } = job;

  const tagArray = Array.isArray(tags) ? tags.filter(Boolean) : [];
  
  const location = [city, state, country].filter(Boolean).join(", ") || "Remote";

  const handleSaveClick = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleApply = () => {
    navigate(`/job/${_id}`)
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("en-IN", { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : "—";

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'inactive': return 'text-slate-500 bg-slate-50 border-slate-200';
      case 'closed': return 'text-rose-600 bg-rose-50 border-rose-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  // Lightweight animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.3
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  const staggerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[95vh]"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 border-b border-slate-200 p-6">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 text-slate-600 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-start gap-4">
                <motion.div 
                  className="relative"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <img
                    src={companyLogo || "https://cdn-icons-png.flaticon.com/512/1187/1187541.png"}
                    alt={companyName}
                    className="w-20 h-20 rounded-2xl bg-white p-2 shadow-sm border border-slate-200"
                  />
                  {/* Status Badge */}
                  <div className="absolute -top-1 -right-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                      {status || 'Active'}
                    </span>
                  </div>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <motion.h1 
                    className="text-2xl font-bold text-slate-900 mb-2 leading-tight"
                    variants={itemVariants}
                  >
                    {title}
                  </motion.h1>
                  <motion.p 
                    className="text-lg font-semibold text-blue-600 mb-3"
                    variants={itemVariants}
                  >
                    {companyName}
                  </motion.p>
                  
                  <motion.div 
                    className="flex flex-wrap items-center gap-3 text-sm text-slate-600"
                    variants={staggerVariants}
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      {location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {jobRole || "—"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      Posted {postedAt}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Premium Badges */}
              <motion.div 
                className="flex flex-wrap gap-2 mt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isPaid && (
                  <span className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium border border-amber-200">
                    <Zap className="w-4 h-4" />
                    Promoted
                  </span>
                )}
                {isFeatured && (
                  <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
                    <Star className="w-4 h-4" />
                    Featured
                  </span>
                )}
                {isApproved && (
                  <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium border border-emerald-200">
                    <Shield className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
                {/* Main Details - 2/3 width */}
                <div className="xl:col-span-2 space-y-6">
                  {/* Job Description */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl p-6 border border-slate-200"
                  >
                    <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-500" />
                      Job Description
                    </h3>
                    <div 
                      className="text-slate-700 leading-relaxed prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: description || 
                        "<p class='text-slate-500 italic'>No description provided for this position.</p>" 
                      }}
                    />
                  </motion.div>

                  {/* Skills & Requirements */}
                  {tagArray.length > 0 && (
                    <motion.div
                      variants={itemVariants}
                      className="bg-white rounded-xl p-6 border border-slate-200"
                    >
                      <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-500" />
                        Skills & Requirements
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {tagArray.map((tag, idx) => (
                          <motion.span
                            key={idx}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 * idx }}
                            className="px-4 py-2 bg-slate-50 text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-200"
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Sidebar - 1/3 width */}
                <div className="space-y-6">
                  {/* Job Overview */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl p-6 border border-slate-200"
                  >
                    <h4 className="font-semibold text-slate-900 mb-4 text-lg">Job Overview</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Role</p>
                          <p className="font-medium text-slate-900">{jobRole || "—"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Experience</p>
                          <p className="font-medium text-slate-900">{experience || "—"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Salary</p>
                          <p className="font-medium text-slate-900">{salaryRange || "—"}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Location</p>
                          <p className="font-medium text-slate-900">{location}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-cyan-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Type</p>
                          <p className="font-medium text-slate-900 capitalize">
                            {employmentType?.replace('-', ' ') || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                          <Users className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Work Mode</p>
                          <p className="font-medium text-slate-900 capitalize">
                            {workMode?.replace('-', ' ') || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Engagement Stats */}
                  <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl p-6 border border-slate-200"
                  >
                    <h4 className="font-semibold text-slate-900 mb-4 text-lg">Job Engagement</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <Eye className="w-4 h-4 text-slate-600 mx-auto mb-1" />
                        <p className="font-semibold text-slate-900">{viewCount || 0}</p>
                        <p className="text-slate-500 text-xs">Views</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <Star className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                        <p className="font-semibold text-slate-900">{likeCount || 0}</p>
                        <p className="text-slate-500 text-xs">Likes</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <Bookmark className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                        <p className="font-semibold text-slate-900">{saveCount || 0}</p>
                        <p className="text-slate-500 text-xs">Saves</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <Send className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
                        <p className="font-semibold text-slate-900">—</p>
                        <p className="text-slate-500 text-xs">Applications</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <motion.div 
              className="border-t border-slate-200 p-6 bg-slate-50/50"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span className="font-mono text-slate-500">ID: {_id?.slice(-8) || "—"}</span>
                  {engagementScore > 0 && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {engagementScore} engagements
                    </span>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <motion.button 
                    onClick={handleSaveClick}
                    disabled={isSaving}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all duration-200 font-medium ${
                      isSaved 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400"
                    } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                    whileHover={{ scale: isSaving ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : isSaved ? (
                      <>
                        <BookmarkCheck className="w-5 h-5" />
                        Saved in Your List
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-5 h-5" />
                        Save for Later
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button 
                    onClick={handleApply}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Send className="w-5 h-5" />
                    Apply Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default JobDetailsPopup;
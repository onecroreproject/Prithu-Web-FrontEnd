import React from "react";
import { motion } from "framer-motion";
import {
  BellRing,
  Trash2,
  User,
  Briefcase,
  Heart,
  MessageCircle,
  UserPlus,
  Share2,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

export default function NotificationItem({ notif, onClick, onDelete }) {
  const sender = notif.sender || {};

  // Check if it's a job status notification
  const isJobStatusUpdate = notif.type === "JOB_STATUS_UPDATE";
  const jobInfo = notif.job || {};

  // Get notification icon based on type
  const getNotificationIcon = () => {
    switch (notif.type?.toLowerCase()) {
      case 'job_status_update':
        return <Briefcase size={10} className="text-blue-600" />;
      case 'like':
      case 'like_post':
        return <Heart size={10} className="text-pink-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle size={10} className="text-blue-500" />;
      case 'follow':
        return <UserPlus size={10} className="text-green-500" />;
      case 'share':
      case 'shared':
      case 'repost':
        return <Share2 size={10} className="text-green-600" />;
      case 'story_like':
        return <Heart size={10} className="text-purple-500" />;
      case 'story_view':
        return <Eye size={10} className="text-blue-400" />;
      case 'new_feed':
        return <BellRing size={10} className="text-orange-500" />;
      default:
        return <BellRing size={10} className="text-gray-500" />;
    }
  };

  // Get status icon and color for job notifications
  const getJobStatusInfo = () => {
    const status = jobInfo.status?.toLowerCase();
    switch (status) {
      case 'accepted':
        return {
          icon: <CheckCircle size={10} className="text-green-600" />,
          badgeClass: "bg-green-100 text-green-800 border-green-200",
          text: "Accepted"
        };
      case 'rejected':
        return {
          icon: <XCircle size={10} className="text-red-600" />,
          badgeClass: "bg-red-100 text-red-800 border-red-200",
          text: "Rejected"
        };
      case 'reviewed':
        return {
          icon: <Eye size={10} className="text-blue-600" />,
          badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
          text: "Reviewed"
        };
      case 'pending':
        return {
          icon: <Clock size={10} className="text-yellow-600" />,
          badgeClass: "bg-yellow-100 text-yellow-800 border-yellow-200",
          text: "Pending"
        };
      default:
        return {
          icon: <Briefcase size={10} className="text-gray-600" />,
          badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
          text: jobInfo.status || "Updated"
        };
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Get type badge color
  const getTypeColor = (type) => {
    const typeColors = {
      alert: "bg-red-100 text-red-800 border-red-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
      success: "bg-green-100 text-green-800 border-green-200",
      warning: "bg-amber-100 text-amber-800 border-amber-200",
      job_status_update: "bg-indigo-100 text-indigo-800 border-indigo-200",
      new_feed: "bg-orange-100 text-orange-800 border-orange-200",
      default: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return typeColors[type?.toLowerCase()] || typeColors.default;
  };

  // Determine sender name and avatar for job notifications
  const getSenderInfo = () => {
    if (isJobStatusUpdate) {
      return {
        name: jobInfo.companyName || "Company",
        avatar: jobInfo.companyLogo,
        isCompany: true
      };
    }
    return {
      name: sender.userName || sender.displayName || sender.name || notif.senderName || "System",
      avatar: sender.profileAvatar || sender.avatar,
      isCompany: false
    };
  };

  const senderInfo = getSenderInfo();
  const jobStatusInfo = getJobStatusInfo();

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: "#f8fafc" }}
      whileTap={{ scale: 0.995 }}
      className={`relative p-3 sm:p-4 border-b border-gray-100 last:border-b-0 flex items-start gap-3 sm:gap-4 cursor-pointer transition-all duration-200 group ${!notif.isRead
          ? "bg-blue-50/60 hover:bg-blue-50"
          : "bg-white hover:bg-gray-50"
        }`}
    >
      {/* Unread Indicator */}
      {!notif.isRead && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 sm:h-10 bg-blue-500 rounded-r-full"></div>
      )}

      {/* Avatar with fallback */}
      <div className="flex-shrink-0 relative">
        {senderInfo.avatar ? (
          <img
            src={senderInfo.avatar}
            alt={senderInfo.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-sm ${isJobStatusUpdate
              ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
              : "bg-gradient-to-br from-blue-500 to-blue-600"
            }`}>
            {isJobStatusUpdate ? (
              <Briefcase size={16} className="text-white" />
            ) : (
              <User size={16} className="text-white" />
            )}
          </div>
        )}

        {/* Notification Type Icon Badge */}
        <div className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-200 flex items-center justify-center shadow-sm ${isJobStatusUpdate ? "bg-indigo-50" : "bg-white"
          }`}>
          {getNotificationIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
        {/* Header with sender and type */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {isJobStatusUpdate ? `📌 ${senderInfo.name}` : senderInfo.name}
              </p>
              {isJobStatusUpdate && (
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${jobStatusInfo.badgeClass}`}>
                  {jobStatusInfo.text}
                </span>
              )}
            </div>

            {notif.type && !isJobStatusUpdate && (
              <span className={`hidden sm:inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(notif.type)}`}>
                {notif.type.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <span className="text-xs text-gray-500 font-medium whitespace-nowrap flex-shrink-0">
            {formatTime(notif.createdAt)}
          </span>
        </div>

        {/* Title */}
        <h4 className="text-sm sm:text-[15px] font-semibold text-gray-900 leading-tight">
          {notif.title || "New Notification"}
        </h4>

        {/* Message */}
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-2">
          {notif.message}
        </p>

        {/* Job details for job status updates */}
        {isJobStatusUpdate && jobInfo.jobTitle && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-medium text-gray-700">
              Position:
            </span>
            <span className="text-xs font-semibold text-gray-900">
              {jobInfo.jobTitle}
            </span>
            {jobInfo.status && (
              <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-xs">
                {jobStatusInfo.icon}
                <span className={`text-xs font-medium ${jobInfo.status === 'accepted' ? 'text-green-600' :
                  jobInfo.status === 'rejected' ? 'text-red-600' :
                    jobInfo.status === 'reviewed' ? 'text-blue-600' : 'text-gray-600'}`}>
                  {jobInfo.status.charAt(0).toUpperCase() + jobInfo.status.slice(1)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Additional metadata */}
        <div className="flex items-center gap-2 pt-1">
          {notif.type && !isJobStatusUpdate && (
            <span className={`sm:hidden inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(notif.type)}`}>
              {notif.type.replace(/_/g, ' ')}
            </span>
          )}
          {notif.priority && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${notif.priority === "high"
                ? "bg-red-50 text-red-700"
                : notif.priority === "medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-blue-50 text-blue-700"
              }`}>
              {notif.priority}
            </span>
          )}
        </div>
      </div>

      {/* Right side - Image or Icon */}
      <div className="flex flex-col items-end gap-2 sm:gap-3 flex-shrink-0">
        {notif.image || (isJobStatusUpdate && jobInfo.companyLogo) ? (
          <img
            src={isJobStatusUpdate ? jobInfo.companyLogo : notif.image}
            alt={isJobStatusUpdate ? "Company logo" : "Notification"}
            className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg object-cover border border-gray-200 shadow-sm"
          />
        ) : (
          <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm ${isJobStatusUpdate
              ? "bg-gradient-to-br from-indigo-50 to-indigo-100"
              : "bg-gradient-to-br from-gray-100 to-gray-200"
            }`}>
            {isJobStatusUpdate ? (
              <Briefcase size={16} className={notif.isRead ? "text-indigo-400" : "text-indigo-500"} />
            ) : (
              <BellRing size={16} className={notif.isRead ? "text-gray-400" : "text-gray-500"} />
            )}
          </div>
        )}

        {/* Delete Button - Shows on hover */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notif._id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 sm:p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all duration-200"
          title="Delete notification"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

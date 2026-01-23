import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, User, ExternalLink, Bell, Image as ImageIcon, Video } from "lucide-react";

export default function NotificationPopup({ notification, onClose }) {
  if (!notification) return null;

  console.log("NOTIFICATION POPUP DATA:", notification);

  const senderName = notification?.sender?.userName || "Someone";
  const notifImage = notification?.image;
  const feed = notification?.feedInfo;

  // theme color
  const themePrimary = feed?.themeColor?.primary || "#4C6EF5";
  const themeGradient =
    feed?.themeColor?.gradient || `linear-gradient(135deg, ${themePrimary}, #00000020)`;

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isLikePost = notification.type === "LIKE_POST";

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-gray-400/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      >
        {/* Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col border border-white/30"
        >
          {/* LIKE POST SPECIAL HEADER */}
          {isLikePost ? (
            <div
              className="p-6 text-gray-800"
              style={{
                background: themeGradient,
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Sender profile initial */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg text-lg font-semibold"
                    style={{ background: "#ffffff33", backdropFilter: "blur(4px)" }}
                  >
                    {senderName?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">
                      {senderName} <span className="text-red-500 text-sm">liked your post ❤️</span>
                    </h3>
                    <p className="text-sm opacity-80">{formatTime(notification.createdAt)}</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-xl transition"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
          ) : (
            /* Regular header for other types */
            <div className="bg-white border-b border-gray-100 p-4 sm:p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Bell size={20} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                  <p className="text-sm text-gray-500">{formatTime(notification.createdAt)}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">

            {!isLikePost && (
              <>
                {/* Message */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                    Message
                  </label>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-gray-700">{notification.message}</p>
                  </div>
                </div>

                {/* Sender */}
                {senderName && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                      From
                    </label>
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={16} className="text-gray-400" />
                      <span>{senderName}</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Feed preview – always shown */}
            {feed && (
              <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">
                  Liked Post
                </label>

                <div className="rounded-xl overflow-hidden shadow border bg-white">
                  {/* Preview Media */}
                  <img
                    src={feed.contentUrl}
                    className="w-full max-h-60 object-cover"
                    alt="feed"
                  />

                  <div className="p-3">
                    <p className="text-gray-700 text-sm">{feed.dec || "No description"}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Posted {formatTime(feed.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Buttons */}
          <div className="bg-gray-50 border-t border-gray-100 p-4 sm:p-6">
            <button
              onClick={onClose}
              className="w-full text-gray-700 hover:text-gray-900 font-medium px-4 py-3 rounded-xl hover:bg-white transition border border-gray-300"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

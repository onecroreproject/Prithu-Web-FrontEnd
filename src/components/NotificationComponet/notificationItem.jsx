import React from "react";
import { motion } from "framer-motion";
import { BellRing} from "lucide-react";

export default function NotificationItem({ notif, onClick, onDelete }) {
  const sender = notif.sender || {};

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ backgroundColor: "#f9fafb" }}
      className={`px-4 py-3 border-b last:border-0 flex items-start gap-3 cursor-pointer transition ${
        !notif.isRead ? "bg-blue-50" : "bg-white"
      }`}
    >
      {/* Avatar */}
      <img
        src={
          sender.profileAvatar ||
          "https://cdn-icons-png.flaticon.com/512/847/847969.png"
        }
        alt={sender.userName || "User"}
        className="w-10 h-10 rounded-full object-cover border border-gray-200"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-gray-800 text-sm font-semibold truncate">
            {sender.userName || sender.displayName || "Unknown"}
          </p>
          <span className="text-gray-500 text-xs">• {notif.type || ""}</span>
        </div>

        <p className="text-gray-700 text-sm mt-0.5 font-medium">
          {notif.title || "Untitled"}
        </p>
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
          {notif.message}
        </p>
        <span className="text-[10px] text-gray-400 mt-1 block">
          {new Date(notif.createdAt).toLocaleString()}
        </span>
      </div>

      {/* Image or Icon */}
      {notif.image ? (
        <img
          src={notif.image}
          alt="Notification"
          className="w-12 h-12 rounded-lg object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
          <BellRing className="w-5 h-5 text-gray-500" />
        </div>
      )}

      {/* Delete */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notif._id);
        }}
        title="Delete notification"
        className="text-gray-400 hover:text-red-500 transition"
      >

      </button>
    </motion.div>
  );
}

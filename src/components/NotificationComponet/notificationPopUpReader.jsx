import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPopup({ notification, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-black/40 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-96 rounded-xl shadow-lg p-5 relative"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {notification.title}
          </h3>

          {notification.image && (
            <img
              src={notification.image}
              alt="Notification"
              className="w-full h-40 object-cover rounded-md mb-3"
            />
          )}

          <p className="text-gray-600 text-sm mb-3">{notification.message}</p>

          {notification.senderId?.userName && (
            <p className="text-xs text-gray-500 mb-1">
              From: <strong>{notification.senderId.userName}</strong>
            </p>
          )}
          <p className="text-xs text-gray-400">
            {new Date(notification.createdAt).toLocaleString()}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

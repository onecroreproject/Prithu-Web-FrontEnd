import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import NotificationPopup from "./notificationPopUpReader";
import NotificationHeader from "./notificationHeader";
import NotificationItem from "./notificationItem";

export default function NotificationDropdown({
  isOpen,
  onClose,
  onMarkAllRead,
  onUpdateCount,
}) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const dropdownRef = useRef(null);

  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // ✅ Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.get("/api/user/all/notification", authHeader);
      const data = res.data?.notifications || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  // ✅ Mark all notifications as read
  const markAllAsRead = async () => {
    setMarkingAll(true);
    try {
      await api.put("/api/mark/all/notification/read", {}, authHeader);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      onMarkAllRead?.();
      onUpdateCount?.();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setMarkingAll(false);
    }
  };

  // ✅ Delete single notification
  const deleteNotification = async (id) => {
    try {
      await api.delete("/api/user/delete/notification", {
        ...authHeader,
        data: { notificationId: id },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      onUpdateCount?.();
      toast.success("Notification deleted");
    } catch {
      toast.error("Failed to delete notification");
    }
  };

  // ✅ Clear all notifications
  const clearAllNotifications = async () => {
    setClearingAll(true);
    try {
      await api.delete("/api/user/delete/all/notification", authHeader);
      setNotifications([]);
      onUpdateCount?.();
      toast.success("All notifications cleared");
    } catch {
      toast.error("Failed to clear notifications");
    } finally {
      setClearingAll(false);
    }
  };

  // ✅ Handle single notification click
  const handleNotificationClick = async (notif) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      try {
        await api.put(
          "/api/user/read",
          { notificationId: notif._id },
          authHeader
        );
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        onUpdateCount?.();
      } catch (err) {
        console.error("❌ Error marking notification as read:", err);
      }
    }
  };

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-10 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <NotificationHeader
              notifications={notifications}
              markingAll={markingAll}
              clearingAll={clearingAll}
              onMarkAllAsRead={markAllAsRead}
              onClearAll={clearAllNotifications}
            />

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-center py-4 text-gray-400 text-sm">
                  Loading...
                </p>
              ) : notifications.length === 0 ? (
                <p className="text-center py-4 text-gray-400 text-sm">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((notif) => (
                  <NotificationItem
                    key={notif._id}
                    notif={notif}
                    onClick={() => handleNotificationClick(notif)}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup Reader */}
      {selectedNotif && (
        <NotificationPopup
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
        />
      )}
    </>
  );
}

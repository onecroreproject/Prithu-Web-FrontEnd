


import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import NotificationHeader from "./notificationHeader";
import NotificationItem from "./notificationItem";
import NotificationPopup from "./notificationPopUpReader";
import { Bell, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification } from "../../hooks/useNotifications";

export default function NotificationDropdown({ isOpen, onClose, onUpdateCount, toggleRef, isSidebarMode }) {
  const [selectedNotif, setSelectedNotif] = useState(null);
  const dropdownRef = useRef(null);
  const observerRef = useRef(null);
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useNotifications(token);

  const deleteNotif = useDeleteNotification();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  // ✅ Flatten notifications for infinite list
  const allNotifications = data?.pages?.flatMap(page => page.notifications) || [];
  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  // ✅ Live socket pulse update
  useEffect(() => {
    const handlePulse = () => {
      refetch();
      onUpdateCount?.();
    };
    document.addEventListener("socket:notificationPulse", handlePulse);
    return () => document.removeEventListener("socket:notificationPulse", handlePulse);
  }, [refetch, onUpdateCount]);

  // ✅ Infinite Scroll Intersection Observer
  const lastElementRef = useCallback(node => {
    if (isLoading || isFetchingNextPage) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });

    if (node) observerRef.current.observe(node);
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // ✅ Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllRead.mutateAsync();
      onUpdateCount?.();
      toast.success("All notifications marked as read!");
    } catch (err) {
      toast.error("Failed to mark notifications as read");
    }
  };

  // ✅ Delete individual notification
  const handleDeleteNotification = async (notifId) => {
    try {
      await deleteNotif.mutateAsync(notifId);
      onUpdateCount?.();
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notif) => {
    setSelectedNotif({ ...notif });
    if (!notif.isRead) {
      try {
        await markRead.mutateAsync(notif._id);
        onUpdateCount?.();
      } catch (err) {
        console.error("❌ Mark read error:", err);
      }
    }
  };

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        // Only close if we didn't click on the toggle button (to allow toggle off)
        if (toggleRef?.current && toggleRef.current.contains(e.target)) return;
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose, toggleRef]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            initial={isSidebarMode ? { x: -280 } : { opacity: 0, scale: 0.95, y: -10 }}
            animate={isSidebarMode ? { x: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={isSidebarMode ? { x: -280 } : { opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={isSidebarMode
              ? "absolute left-0 top-0 w-full h-[100dvh] bg-white z-[60] flex flex-col overflow-hidden"
              : "fixed sm:absolute right-0 top-14 sm:top-12 w-full sm:w-96 max-w-sm mx-auto sm:mx-0 bg-white rounded-none sm:rounded-xl shadow-2xl sm:shadow-xl border-0 sm:border border-gray-200 overflow-hidden z-50 h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[80vh] flex flex-col"}
          >
            {/* Header */}
            <NotificationHeader
              notifications={allNotifications}
              onMarkAllAsRead={handleMarkAllAsRead}
              onDeleteAll={() => { }} // Could implement if needed
              unreadCount={unreadCount}
              onClose={onClose}
            />

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto h-full sm:max-h-96 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
              ) : allNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                    <Bell size={28} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
                  <p className="text-gray-500 text-sm">When you get notifications, they'll appear here</p>
                </div>
              ) : (
                <div className="p-2 sm:p-0">
                  {allNotifications.map((notif, index) => (
                    <div
                      key={notif._id}
                      ref={index === allNotifications.length - 1 ? lastElementRef : null}
                    >
                      <NotificationItem
                        notif={notif}
                        onClick={() => handleNotificationClick(notif)}
                        onDelete={handleDeleteNotification}
                      />
                    </div>
                  ))}

                  {isFetchingNextPage && (
                    <div className="flex justify-center p-4">
                      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            {allNotifications.length > 0 && (
              <div className="bg-white border-t border-gray-100 p-4 sm:p-3">
                <button
                  onClick={() => onClose()} // Could link to a full notification page
                  className="w-full text-center text-sm text-gray-700 font-medium hover:text-gray-900 py-3 sm:py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                >
                  View All Notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 sm:hidden"
          onClick={onClose}
        />
      )}

      {selectedNotif && (
        <NotificationPopup
          notification={selectedNotif}
          onClose={() => setSelectedNotif(null)}
        />
      )}
    </>
  );
}


// src/components/MobileMenu.jsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Video, X, LogOut } from "lucide-react";
import ProfileAvatar from "./profileAvatar";
import { NavLink } from "react-router-dom";

export default function MobileMenu({
  mobileMenuOpen, setMobileMenuOpen, mobileMenuRef,
  user, navItems, setIsCreatePostOpen, isReelsActive, handleReelClick, logout
}) {
  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <motion.div
          ref={mobileMenuRef}
          initial={{ opacity: 0, x: "100%" }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 h-full w-full bg-white shadow-2xl z-[200] sm:hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-green-50 to-yellow-50">
            <div className="flex items-center gap-3">
              <ProfileAvatar user={user} />
              <div>
                <p className="font-semibold">{user?.userName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Content */}
          <div className="p-4 space-y-2 h-[calc(100vh-80px)] overflow-y-auto">
            <div className="flex gap-2 pb-4 border-b">
              <button
                onClick={() => {
                  setIsCreatePostOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg"
              >
                <Plus className="w-5 h-5" /> Create Post
              </button>
              <button
                onClick={() => {
                  handleReelClick();
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${
                  isReelsActive
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                <Video className="w-5 h-5" /> Reels
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 rounded-lg"
                >
                  <Icon className="w-5 h-5 text-green-600" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full mt-4 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

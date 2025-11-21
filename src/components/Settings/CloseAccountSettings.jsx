// src/pages/settings/CloseAccountSettings.jsx
import React, { useState } from "react";
import { AlertCircle, Download, Check, X, Shield, Trash2, Clock, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

const CloseAccountSettings = () => {
  const [confirmed, setConfirmed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const {logout}=useAuth();

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
    setReason("");
    setReasonError("");
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalType("");
    setReason("");
    setReasonError("");
  };

  const validateReason = () => {
    if (!reason.trim()) {
      setReasonError("Please provide a reason for this action");
      return false;
    }
    if (reason.trim().length < 10) {
      setReasonError("Please provide a more detailed reason (at least 10 characters)");
      return false;
    }
    setReasonError("");
    return true;
  };

  const handleDeactivate = async () => {
    if (!validateReason()) return;

    try {
      setLoading(true);
      const response = await api.patch(`/api/user/deactivate`, {
        reason: reason.trim()
      });
      logout()
      alert("Account deactivated successfully. It will be permanently deleted after 20 days.");
      handleCloseModal();
    } catch (error) {
      console.error("Deactivation error:", error);
      alert("Failed to deactivate account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNow = async () => {
    if (!validateReason()) return;

    try {
      setLoading(true);
      const response = await api.delete(`/api/user/delete`, {
        data: { reason: reason.trim() }
      });
      logout()
      alert("Account permanently deleted successfully.");
      handleCloseModal();
      // Redirect to home or login page
      window.location.href = "/";
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current user ID (replace with your actual implementation)
  const getUserId = () => {
    // This should be replaced with your actual user ID retrieval logic
    return localStorage.getItem("userId") || "current-user-id";
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <AlertCircle className="w-8 h-8 text-red-600" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Before you go...</h2>
        <p className="text-gray-600">We're sorry to see you leave</p>
      </motion.div>

      
      {/* Confirmation Checkbox */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-5 h-5 text-red-600 rounded focus:ring-red-500 mt-0.5 transition-transform group-hover:scale-110"
          />
          <div>
            <span className="text-sm font-medium text-gray-900 block">
              I understand that this action is irreversible
            </span>
          </div>
        </label>
      </motion.div>

      {/* Options Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        
        {/* Deactivate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-orange-200 rounded-xl p-6 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
          onClick={() => handleOpenModal("deactivate")}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Deactivate Account</h3>
              <p className="text-sm text-gray-600 mb-3">
                Temporarily disable your account. You can recover it within 20 days.
              </p>
              <div className="flex items-center gap-1 text-xs text-orange-600">
                <Info className="w-3 h-3" />
                <span>Auto-deletes after 20 days of inactivity</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delete Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border border-red-200 rounded-xl p-6 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
          onClick={() => handleOpenModal("delete")}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Delete Permanently</h3>
              <p className="text-sm text-gray-600 mb-3">
                Immediately and permanently delete your account and all data.
              </p>
              <div className="flex items-center gap-1 text-xs text-red-600">
                <AlertCircle className="w-3 h-3" />
                <span>This action cannot be undone</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>


      {/* Footer Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-gray-500 text-center mt-8"
      >
        Need help? Contact our support team before making this decision.
      </motion.p>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  modalType === "delete" ? "bg-red-100" : "bg-orange-100"
                }`}>
                  {modalType === "delete" ? (
                    <Trash2 className="w-8 h-8 text-red-600" />
                  ) : (
                    <Clock className="w-8 h-8 text-orange-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {modalType === "delete" ? "Delete Account Permanently?" : "Deactivate Account?"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {modalType === "delete" 
                    ? "This will immediately and permanently delete your account and all associated data. This action cannot be undone."
                    : "Your account will be deactivated and scheduled for deletion after 20 days. You can recover it during this period."
                  }
                </p>
              </div>

              {/* Reason Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Please tell us why you're leaving *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (reasonError) setReasonError("");
                  }}
                  placeholder="Share your feedback to help us improve... (minimum 10 characters)"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                />
                {reasonError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-600 text-xs mt-1 flex items-center gap-1"
                  >
                    <AlertCircle className="w-3 h-3" />
                    {reasonError}
                  </motion.p>
                )}
                <p className="text-gray-500 text-xs mt-1">
                  {reason.length}/10 characters minimum
                </p>
              </div>

              {/* Additional Info for Deactivate */}
              {modalType === "deactivate" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Recovery Period</p>
                      <p className="text-xs text-blue-700">
                        You have 20 days to recover your account. After this period, all data will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={modalType === "delete" ? handleDeleteNow : handleDeactivate}
                  disabled={loading || !confirmed}
                  className={`flex-1 px-4 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    modalType === "delete" 
                      ? "bg-red-600 hover:bg-red-700" 
                      : "bg-orange-600 hover:bg-orange-700"
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : modalType === "delete" ? (
                    "Delete Permanently"
                  ) : (
                    "Deactivate Account"
                  )}
                </button>
              </div>

              {/* Final Warning */}
              <p className="text-xs text-gray-500 text-center mt-4">
                {!confirmed && "Please confirm your understanding above to proceed"}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CloseAccountSettings;
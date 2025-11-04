import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { ArrowLeft } from "lucide-react"; // import back icon

export default function SubscriptionDetails() {
  const navigate = useNavigate(); // for back navigation
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);
      const response = await api.post(
        "http://localhost:5000/api/user/cancel/subscription",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert(response.data.message || "Subscription cancelled successfully.");
      setShowModal(false);
    } catch (error) {
      console.error("Cancel subscription error:", error);
      alert(error.response?.data?.message || "Failed to cancel subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50 p-8">
      
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)} // go back
        className="flex items-center gap-2 text-gray-700 mb-6 hover:text-gray-900"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      {/* Page Header */}
      <h2 className="text-2xl font-bold mb-6">Subscription Details</h2>

      {/* Subscription Card */}
      <div className="bg-white rounded-xl shadow-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="inline-block p-3 bg-gray-200 rounded-full">
              {/* Crown Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-yellow-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l4.36 8.73a.5.5 0 00.44.27h8.4a.5.5 0 00.44-.27L21 8M3 8l5.3 2.3a.5.5 0 00.7-.2l2-3a.5.5 0 01.9 0l2 3a.5.5 0 00.7.2L21 8"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.5 19.5h13" />
              </svg>
            </span>
            <span className="font-medium text-gray-700 text-lg">Your Plan</span>
          </div>
          <span className="px-4 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
            Current Plan
          </span>
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex flex-col">
            <span className="text-gray-500">Cost</span>
            <span className="font-medium">₹0/month</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Duration</span>
            <span className="font-medium">3 days</span>
          </div>
          <div className="flex flex-col">
            <span className="text-gray-500">Next Billing Date</span>
            <span className="font-medium">10/02/2025</span>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition duration-200 font-semibold"
        >
          Cancel Subscription
        </button>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-white/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          ></div>

          <div className="relative bg-white rounded-lg shadow-lg p-6 w-96 border">
            <h3 className="text-lg font-semibold mb-4">Cancel Subscription</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel your subscription? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {loading ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

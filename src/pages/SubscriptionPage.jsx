import React, { useState, useContext } from "react";
import axios from "../api/axios";               // <-- your axios instance
import { AuthContext } from "../../context/AuthContext";

const plans = [
  { title: "3 Months", price: 1, features: ["Unlimited access to podcasts", "Unlimited songs download", "Unlimited skips"] },
  { title: "6 Months", price: 1, features: ["Unlimited access to podcasts", "Unlimited songs download", "Unlimited skips"] },
  {
    title: "12 Months",
    price: 1,
    features: ["Unlimited access to podcasts", "Unlimited songs download", "Unlimited skips"],
    highlight: true,
    discount: "Most Popular - Save 40%",
  },
];

const SubscriptionPage = () => {
  const { token } = useContext(AuthContext);               // <-- JWT from AuthContext
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [alertMsg, setAlertMsg] = useState("");

  /* --------------------------------------------------- */
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setModalOpen(true);
  };

  /* --------------------------------------------------- */
  const confirmSubscribe = async () => {
    if (!selectedPlan) return;

    try {
      const payload = {
        planId: selectedPlan.title,                     // <-- only planId required
        result: { paymentId: "test123", status: "success" }, // fake Razorpay result
      };

      const { data } = await axios.post(
        "/api/user/plan/subscription",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAlertMsg(`Subscribed Successfully to ${selectedPlan.title}`);
    } catch (err) {
      console.error(err);
      setAlertMsg("Subscription Failed");
    } finally {
      setModalOpen(false);
      setSelectedPlan(null);
      setTimeout(() => setAlertMsg(""), 3000);
    }
  };

  /* --------------------------------------------------- */
  const cancelSubscription = async (subscriptionId) => {
    try {
      await axios.put(
        "/api/user/cancel/subscription",
        { subscriptionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAlertMsg("Subscription cancelled successfully");
    } catch (err) {
      console.error(err);
      setAlertMsg("Cancel failed");
    } finally {
      setTimeout(() => setAlertMsg(""), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4 relative">
      {/* ---------- Alert ---------- */}
      {alertMsg && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-green-200 text-green-800 px-6 py-3 rounded-lg shadow-md">
          {alertMsg}
        </div>
      )}

      <h2 className="text-3xl font-bold mb-12">Choose a Subscription Plan</h2>

      {/* ---------- Plans Grid ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`relative bg-white rounded-3xl shadow-2xl p-8 flex flex-col border-2 
                        ${plan.highlight ? "border-green-400 ring-2 ring-green-400" : "border-gray-200"}
                        transition-transform hover:scale-105`}
          >
            {plan.discount && (
              <div className="absolute -top-3 right-0 bg-green-400 text-white px-3 py-1 rounded-l-full text-sm font-semibold">
                {plan.discount}
              </div>
            )}
            <h3 className="text-2xl font-semibold mb-2">{plan.title}</h3>
            <p className="text-3xl font-bold mb-4">₹{plan.price}</p>

            <ul className="mb-6 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-500 font-bold">Check</span> {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan)}
              className={`py-3 rounded-xl font-semibold text-white 
                         ${plan.highlight ? "bg-green-500 hover:bg-green-600" : "bg-gray-800 hover:bg-gray-700"}`}
            >
              Subscribe Now
            </button>
          </div>
        ))}
      </div>

      {/* ---------- Confirmation Modal ---------- */}
      {modalOpen && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Subscription</h3>
            <p className="mb-6">
              Subscribe to <strong>{selectedPlan.title}</strong> plan for ₹{selectedPlan.price}?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmSubscribe}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                Yes, Subscribe
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- OPTIONAL: Cancel button (example) ---------- */}
      <button
        onClick={() => cancelSubscription("YOUR_SUBSCRIPTION_ID_HERE")}
        className="mt-8 text-red-600 underline"
      >
        Cancel current subscription
      </button>
    </div>
  );
};

export default SubscriptionPage;
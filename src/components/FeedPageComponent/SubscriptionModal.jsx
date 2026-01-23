import React, { useState } from "react";

const plans = [
  {
    title: "3 Months",
    price: 299,
    features: [
      "Unlimited access to podcasts",
      "Unlimited songs download",
      "Unlimited skips",
    ],
    highlight: false,
  },
  {
    title: "6 Months",
    price: 549,
    features: [
      "Unlimited access to podcasts",
      "Unlimited songs download",
      "Unlimited skips",
    ],
    highlight: false,
  },
  {
    title: "12 Months",
    price: 959,
    features: [
      "Unlimited access to podcasts",
      "Unlimited songs download",
      "Unlimited skips",
    ],
    highlight: true,
    discount: "Most Popular - Save 40%",
  },
];

const SubscriptionModal = ({ open, onClose }) => {
  const [alertMsg, setAlertMsg] = useState("");

  if (!open) return null;

  const handleSubscribe = (plan) => {
    // You can integrate your backend API here
    // Example: api.post("/user/plan/subscription", { planId: plan.title, userId })
    
    setAlertMsg(`Subscribed Successfully to ${plan.title} ✅`);
    setTimeout(() => setAlertMsg(""), 3000); // Hide alert after 3 seconds
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-xl p-8 overflow-y-auto max-h-[90vh] relative">
        {/* Close button */}
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Alert message */}
        {alertMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-200 text-green-800 px-6 py-3 rounded-lg shadow-md">
            {alertMsg}
          </div>
        )}

        <h1 className="text-4xl font-extrabold text-gray-800 mb-3 text-center">
          Upgrade to Premium
        </h1>
        <p className="text-center text-gray-600 mb-12">
          Get unlimited access to our podcasts, songs, and skips
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-between border-2 transition-transform duration-300 ${
                plan.highlight
                  ? "border-green-400 scale-105"
                  : "border-gray-200 hover:scale-105"
              }`}
            >
              {plan.discount && (
                <div className="absolute -top-3 right-0 bg-green-400 text-white px-3 py-1 rounded-l-full text-sm font-semibold">
                  {plan.discount}
                </div>
              )}

              <div>
                <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
                <p className="text-3xl font-bold mb-6">{plan.price} / year</p>

                <ul className="space-y-4 mb-6">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-green-400 text-white rounded-full font-bold text-lg">
                        ✔
                      </span>
                      <span className="text-gray-700">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe button */}
              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 rounded-xl font-semibold text-white text-lg transition ${
                  plan.highlight
                    ? "bg-gradient-to-r from-green-400 to-yellow-400 hover:opacity-90"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                Subscribe Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;

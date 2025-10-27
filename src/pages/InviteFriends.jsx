import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const InviteFriends = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("referrals");

  // Use user referral code if exists, otherwise fallback
  const referralCode = user?.referralCode || "EVEc039";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success(`Referral code "${referralCode}" copied!`, {
      duration: 3000,
      position: "top-right",
    });
  };

  return (
    <div className="min-h-screen w-full bg-pink-50 flex flex-col items-center py-10 px-4">
      {/* Tabs */}
      <div className="flex gap-2 mb-6 w-full max-w-3xl">
        <button
          className={`flex-1 py-3 rounded-t-lg font-semibold text-lg transition-colors ${
            activeTab === "referrals"
              ? "bg-gradient-to-r from-green-400 to-yellow-300 text-gray-800"
              : "bg-gray-200 text-gray-400"
          }`}
          onClick={() => setActiveTab("referrals")}
        >
          Your Referrals
        </button>
        <button
          className={`flex-1 py-3 rounded-t-lg font-semibold text-lg transition-colors ${
            activeTab === "invited"
              ? "bg-gradient-to-r from-pink-200 to-pink-100 text-gray-800"
              : "bg-gray-200 text-gray-400"
          }`}
          onClick={() => setActiveTab("invited")}
        >
          Invited Friends (26)
        </button>
      </div>

      {/* Illustration */}
      <div className="flex justify-center mb-6 w-full max-w-3xl">
        <img
          src="https://www.svgrepo.com/show/366790/refer-a-friend.svg"
          alt="Invite Illustration"
          className="w-full max-w-sm h-auto"
          draggable={false}
        />
      </div>

      {/* Heading and Referral Code */}
      <p className="text-center mb-4 font-semibold text-gray-700 text-lg max-w-3xl">
        Invite Friends, Get 1,000 Points Per Friend!
      </p>

      <div className="flex mb-6 w-full max-w-3xl">
        <input
          className="flex-1 px-4 py-3 rounded-l-lg bg-gray-100 border border-gray-200 font-semibold text-gray-700"
          value={referralCode}
          readOnly
        />
        <button
          className="px-4 py-3 bg-gray-200 rounded-r-lg font-semibold hover:bg-gray-300"
          onClick={handleCopy}
        >
          Copy
        </button>
      </div>

      {/* Checklist */}
      <div className="space-y-4 mb-6 w-full max-w-3xl">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🔗</span>
          <span className="flex-1 text-gray-700 text-sm">
            Invite your friend to install the app with the link.
          </span>
          <span className="text-green-500 text-xl">✔️</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛒</span>
          <span className="flex-1 text-gray-700 text-sm">
            Your friend places a minimum order of ₹300.
          </span>
          <span className="text-green-500 text-xl">✔️</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl">💸</span>
          <span className="flex-1 text-gray-700 text-sm">
            You get ₹150 once the return period is over.
          </span>
          <span className="text-green-500 text-xl">✔️</span>
        </div>
      </div>

      {/* Share Button */}
      <button className="w-full max-w-3xl py-4 rounded-full bg-gradient-to-r from-green-400 to-yellow-400 text-white font-bold text-lg shadow hover:opacity-90 transition">
        Share my Referral Code
      </button>
    </div>
  );
};

export default InviteFriends;

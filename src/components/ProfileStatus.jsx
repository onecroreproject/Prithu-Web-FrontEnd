import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // axios instance configured
 
// ───────── Circular Progress ─────────
function CircularProgress({ percent }) {
  const radius = 32;
  const stroke = 4;
  const norm = 2 * Math.PI * radius;
  const [animatedOffset, setAnimatedOffset] = useState(norm);
 
  useEffect(() => {
    const timeout = setTimeout(() => {
      setAnimatedOffset(norm * (1 - percent / 100));
    }, 200);
    return () => clearTimeout(timeout);
  }, [percent, norm]);
 
  return (
    <svg width="80" height="80" className="block mx-auto">
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke="rgba(237, 237, 237, 0.8)"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={norm}
        strokeDashoffset="0"
      />
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke="#22c55e"
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={norm}
        strokeDashoffset={animatedOffset}
        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
        strokeLinecap="round"
      />
      <text
        x="40"
        y="38"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#23236A"
        dominantBaseline="middle"
      >
        {percent}%
      </text>
      <text
        x="40"
        y="52"
        textAnchor="middle"
        fontSize="10"
        fill="#555"
        dominantBaseline="middle"
      >
        Complete
      </text>
    </svg>
  );
}
 
// ───────── Main Component ─────────
export default function ProfileStatus() {
  const [percent, setPercent] = useState(0);
  const [missingItems, setMissingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
 
  useEffect(() => {
    const fetchProfileStatus = async () => {
      try {
        const response = await api.get("/api/user/profile/completion");
 
        if (response.data.success) {
          const { completionPercentage, missingFields } = response.data;
 
          const fieldLabels = {
            displayName: "Display Name",
            userName: "Username",
            bio: "Bio",
            gender: "Gender",
            dateOfBirth: "Date of Birth",
            maritalStatus: "Marital Status",
            phoneNumber: "Phone Number",
            country: "Country",
            city: "City",
            profileAvatar: "Profile Picture",
            coverPhoto: "Cover Photo",
            socialLinks: "Social Links",
          };
 
          const missingData = missingFields.map((field, i) => ({
            label: fieldLabels[field] || field,
            field,
            num: i + 1,
          }));
 
          setPercent(completionPercentage || 0);
          setMissingItems(missingData);
        }
      } catch (error) {
        console.error("Error fetching profile status:", error);
      } finally {
        setLoading(false);
      }
    };
 
    fetchProfileStatus();
  }, []);
 
  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading profile status...</p>
      </div>
    );
  }
 
  return (
    <div
      onClick={() => navigate("/home/profile")}
      className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer"
    >
      {/* HEADER */}
      <div className="p-5 border-b border-gray-100">
        <div className="font-semibold text-lg text-gray-900"> {/* Changed to black */}
          Complete Your Profile
        </div>
      </div>
 
      {/* CONTENT */}
      <div className="p-5">
        {/* PROGRESS CIRCLE */}
        <div className="mb-4">
          <CircularProgress percent={percent} />
        </div>
 
        
      </div>
    </div>
  );
}
 
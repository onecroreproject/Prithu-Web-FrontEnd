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

          // Only keep missing fields
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
      <div className="w-[230px] h-[230px] flex items-center justify-center bg-white rounded-lg shadow">
        <p className="text-gray-500 text-sm">Loading profile status...</p>
      </div>
    );
  }

  return (
    <div
      className="w-[230px] h-[230px] p-4 rounded-[9px] shadow-xl relative flex flex-col items-center justify-start overflow-hidden backdrop-blur-xl border border-white/20"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8))",
        boxShadow:
          "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      {/* HEADER */}
      <div className="text-center mb-2">
        <div className="font-semibold text-[15px] text-[#23236A]">
          Complete Your Profile
        </div>
      </div>

      {/* PROGRESS CIRCLE */}
      <div className="mb-3 -mt-2">
        <CircularProgress percent={percent} />
      </div>

      {/* MISSING FIELDS */}
      <div className="space-y-[6px] w-full flex-1 overflow-y-auto">
        {missingItems.length > 0 ? (
          missingItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate("/profile/edit")}
              className="flex items-center justify-between text-[12px] px-1 py-[2px] rounded cursor-pointer transition-all duration-200 hover:bg-red-50 group"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-medium text-gray-400 truncate group-hover:underline">
                  {item.label}
                </span>
              </div>
              <span className="font-semibold text-[11px] text-gray-400">
                {item.num}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center text-[12px] text-green-600 font-medium">
            🎉 All fields completed!
          </p>
        )}
      </div>
    </div>
  );
}

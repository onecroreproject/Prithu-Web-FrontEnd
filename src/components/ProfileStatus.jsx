import React, { useEffect, useState } from "react";

// Circular progress with percent inside
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
        style={{
          opacity: 0,
          animation: "fadeIn 1s ease-in-out forwards",
          animationDelay: "0.3s",
        }}
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
        style={{
          opacity: 0,
          animation: "fadeIn 1s ease-in-out forwards",
          animationDelay: "0.5s",
        }}
      >
        Complete
      </text>
    </svg>
  );
}

export default function ProfileStatus() {
  const percent = 73;
  const items = [
    { label: "General Information", done: false, num: "5/6" },
    { label: "Work Experience", done: false, num: "1/3" },
    { label: "Profile Photo", done: true, num: "1/1" },
    
  ];

  return (
    <div
      className="w-[230px] h-[230px] p-4 rounded-[9px] shadow-xl relative flex flex-col items-center justify-start overflow-hidden backdrop-blur-xl border border-white/20"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.8))",
        boxShadow: "0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>

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

      {/* PROGRESS ITEMS */}
      <div className="space-y-[6px] w-full flex-1">
        {items.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-[12px] px-1 py-[2px] rounded transition-all duration-200 hover:bg-gray-50/50"
            style={{
              opacity: 0,
              animation: `slideIn 0.5s ease-out forwards`,
              animationDelay: `${0.1 * (i + 1)}s`,
            }}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className={`flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center text-white text-[10px] transition-all duration-200 ${
                  item.done 
                    ? "bg-green-500 shadow-sm" 
                    : "border border-gray-400 bg-white shadow-sm"
                }`}
              >
                {item.done && (
                  <svg width="8" height="8" viewBox="0 0 12 12">
                    <path
                      d="M3 6.25l2 2 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </span>
              <span 
                className={`font-medium truncate transition-colors duration-200 ${
                  item.done ? "text-green-700" : "text-gray-700"
                }`}
                title={item.label}
              >
                {item.label}
              </span>
            </div>
            <span 
              className={`flex-shrink-0 font-semibold text-[11px] ml-2 transition-colors duration-200 ${
                item.done ? "text-green-600" : "text-gray-500"
              }`}
            >
              {item.num}
            </span>
          </div>
        ))}
      </div>

      {/* FOOTER - Overall Progress */}
      <div className="w-full pt-2 border-t border-gray-200/50 mt-2">
        <div className="flex justify-between items-center text-[11px] text-gray-600">
          <span>Overall Progress</span>
          <span className="font-bold text-[#23236A]">{percent}% Complete</span>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200/50 rounded-full h-1.5 mt-1 overflow-hidden">
          <div 
            className="bg-green-500 h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
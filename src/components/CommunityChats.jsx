// src/components/CommunityChats.jsx
import React from "react";
import { Briefcase, Flame, Star } from "lucide-react"; // Optional: install lucide-react for icons

// Fallback icons if you don't want to install lucide
const BriefcaseIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 0h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const FlameIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8.5 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM15.5 14.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM12 18.5a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" />
    <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8 0-1.82.61-3.51 1.64-4.86l1.11 1.11C6.9 9.15 6.5 10.07 6.5 11c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5c0-.93-.4-1.85-1.11-2.75l1.11-1.11C18.39 8.49 19 10.18 19 12c0 4.41-3.59 8-8 8z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export default function CommunityChats() {
  const sections = [
    {
      title: "Top Job Roles",
      icon: <BriefcaseIcon />,
      color: "text-blue-600",
      items: [
        "Frontend Developer",
        "UI/UX Designer",
        "React.js Intern",
        "Full Stack Developer",
        "Software Tester",
      ],
    },
    {
      title: "Latest Openings",
      icon: <FlameIcon />,
      color: "text-orange-600",
      items: [
        "Junior Web Developer – Remote",
        "Product Designer – Bangalore",
        "Backend Engineer – Chennai",
        "QA Analyst – Hyderabad",
        "App Developer – Pune",
      ],
    },
    {
      title: "Featured Companies",
      icon: <StarIcon />,
      color: "text-yellow-600",
      items: ["Infosys", "TCS", "Wipro", "Zoho", "Accenture"],
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      {sections.map((section, idx) => (
        <div
          key={idx}
          className={`pb-5 ${idx < sections.length - 1 ? "mb-5 border-b border-gray-100" : ""}`}
        >
          {/* Section Header */}
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-lg bg-gray-50 ${section.color}`}>
              {section.icon}
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {section.title}
            </h3>
          </div>

          {/* List */}
          <ul className="space-y-2">
            {section.items.map((item, i) => (
              <li
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group"
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${section.color} group-hover:scale-125 transition-transform`}
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
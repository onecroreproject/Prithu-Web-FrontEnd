// src/components/UpcomingEvents.jsx
import React from "react";

export default function UpcomingEvents() {
  const events = [
    { title: "Garden BBQ", subtitle: "Sat 16 June, Tom's Garden" },
    { title: "City Council Vote", subtitle: "Sat 16 June, Town Hall" },
    { title: "Post-punk Festival", subtitle: "Sat 16 June, Tom's Garden" },
    { title: "Maybe Boring Stand-up", subtitle: "Sat 16 June, Tom's Garden" },
    { title: "Yeboncé Tour 2023", subtitle: "Sat 16 June, Tom's Garden" },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="font-semibold text-gray-800 mb-3">Your upcoming events</h3>

      <ul className="relative">
        {events.map((event, index) => (
          <li key={index} className="flex items-start gap-3 relative">
            {/* Timeline Line – connects icons */}
            {index < events.length - 1 && (
              <div
                className="absolute left-4.5 top-10 bottom-0 w-0.5 bg-gray-200 -z-10"
                style={{ height: "calc(100% - 2.5rem)" }}
              />
            )}

            {/* Purple Icon with Calendar */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center z-10">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Text Content */}
            <div className="flex-1 pb-8">
              <p className="font-semibold text-gray-900 text-sm leading-tight">
                {event.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {event.subtitle}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
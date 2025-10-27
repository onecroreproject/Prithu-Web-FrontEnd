// src/components/Birthdays.jsx
import React from "react";

export default function Birthdays() {
  const birthdayGroups = [
    {
      date: "20 August",
      people: [
        {
          name: "Bob Hammond",
          age: 28,
          avatar: "https://i.pravatar.cc/150?img=33",
        },
        {
          name: "Haasper Mitchell",
          age: 21,
          avatar: "https://i.pravatar.cc/150?img=45",
        },
      ],
    },
    {
      date: "22 August",
      people: [
        {
          name: "Mason Cooper",
          age: 30,
          avatar: "https://i.pravatar.cc/150?img=12",
        },
      ],
    },
    {
      date: "1 September",
      people: [
        {
          name: "Isabel Hughes",
          age: 19,
          avatar: "https://i.pravatar.cc/150?img=20",
        },
      ],
    },
  ];

  return (
    <div className="max-w-sm bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Birthdays</h2>
      </div>

      {/* List */}
      <ul className="divide-y divide-gray-200">
        {birthdayGroups.map((group, groupIdx) => (
          <li key={groupIdx} className={groupIdx < birthdayGroups.length - 1 ? "border-b border-gray-200" : ""}>
            {/* Date Header */}
            <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-900">
              {group.date}
            </div>

            {/* People */}
            {group.people.map((person, personIdx) => (
              <div
                key={personIdx}
                className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                  personIdx < group.people.length - 1 ? "border-b border-gray-200" : ""
                }`}
              >
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-10 h-10 rounded-full object-cover mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Turning {person.age} years old
                  </p>
                </div>
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
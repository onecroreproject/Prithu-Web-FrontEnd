
// src/components/jobs/Categories.jsx
import React from "react";

const categories = [
  { name: "Administrative", count: 1 },
  { name: "Commercial", count: 5 },
  { name: "Engineering", count: 2 },
  { name: "Finance", count: 2 },
  { name: "Healthcare", count: 0 },
  { name: "Marketing", count: 5 },
  { name: "Multimedia", count: 0 },
  { name: "Programming", count: 2 },
  { name: "Telecommunication", count: 0 },
];

export default function Categories() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Job Categories</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-900">{cat.name}</h3>
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                {cat.count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

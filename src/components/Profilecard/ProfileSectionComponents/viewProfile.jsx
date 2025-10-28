// src/components/Profile/ViewProfile.jsx
import React from "react";

export default function ViewProfile({ user }) {
  const fields = [
    { label: "Name", value: user?.displayName || "-" },
    { label: "Date of Birth", value: user?.dob ? new Date(user.dob).toLocaleDateString() : "-" },
    { label: "Sex", value: user?.sex || "-" },
    { label: "City", value: user?.city || "-" },
    { label: "Country", value: user?.country || "-" },
    { label: "Bio", value: user?.bio || "-" },
    { label: "Phone", value: user?.phone || "-" },
    { label: "Marital Status", value: user?.maritalStatus || "-" },
    { label: "Language", value: user?.language || "-" },
  ];

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">View Profile</h3>
      <p className="text-sm text-gray-600 mb-6">Base</p>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((f) => (
          <div key={f.label} className="flex">
            <dt className="w-32 text-sm font-medium text-gray-500">{f.label}</dt>
            <dd className="flex-1 text-sm text-gray-900">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

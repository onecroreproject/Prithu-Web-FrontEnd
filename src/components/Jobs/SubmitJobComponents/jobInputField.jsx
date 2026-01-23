// src/components/jobs/submit/JobInputField.jsx
import React from "react";

export default function JobInputField({ label, name, value, onChange, type = "text", required, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
      />
    </div>
  );
}

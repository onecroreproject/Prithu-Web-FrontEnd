import React from "react";

export default function LocationInput({ location, setLocation }) {
  return (
    <div className="mt-4 p-3 border rounded bg-[#F9FAFB]">
      <input
        type="text"
        placeholder="Enter location (e.g. Paris, France)"
        className="w-full border-b border-gray-300 px-2 py-1 focus:outline-none"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      {location && (
        <p className="mt-2 text-sm text-gray-600">
          Location: <strong>{location}</strong>
        </p>
      )}
    </div>
  );
}

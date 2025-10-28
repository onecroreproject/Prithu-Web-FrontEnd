// src/components/Profile/EditProfile.jsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EditProfile({ user, uploadProfileDetail, loading }) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    dob: user?.dob ? new Date(user.dob) : null,
    sex: user?.sex || "",
    city: user?.city || "",
    country: user?.country || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    maritalStatus: user?.maritalStatus || "Single",
    language: user?.language || "English",
  });

  useEffect(() => {
    setFormData({
      displayName: user?.displayName || "",
      dob: user?.dob ? new Date(user.dob) : null,
      sex: user?.sex || "",
      city: user?.city || "",
      country: user?.country || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
      maritalStatus: user?.maritalStatus || "Single",
      language: user?.language || "English",
    });
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([k, v]) =>
      v != null && payload.append(k, v instanceof Date ? v.toISOString().split("T")[0] : v)
    );
    await uploadProfileDetail(payload);
  };

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
      {/* Input Fields */}
      {[
        ["Name", "displayName", "text"],
        ["City", "city", "text"],
        ["Country", "country", "text"],
        ["Bio", "bio", "textarea"],
        ["Phone", "phone", "tel"],
      ].map(([label, key, type]) => (
        <div key={key}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
          {type === "textarea" ? (
            <textarea
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          ) : (
            <input
              type={type}
              value={formData[key]}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          )}
        </div>
      ))}

      {/* Date Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <DatePicker
          selected={formData.dob}
          onChange={(date) => handleChange("dob", date)}
          dateFormat="dd/MM/yyyy"
          maxDate={new Date()}
          showYearDropdown
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      {/* Save & Cancel */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-2.5 font-medium rounded-lg transition ${
            loading ? "bg-gray-400" : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          {loading ? "Saving…" : "Save Changes"}
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

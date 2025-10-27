// src/components/PostSection.jsx
import React, { useState } from "react";

export default function PostSection() {
  const [activeOption, setActiveOption] = useState("view");

  const options = [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "profile-photo", label: "Change Profile Photo" },
    { id: "cover-image", label: "Change Cover Image" },
    { id: "settings", label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeOption) {
      case "view":
        return <ViewProfile />;
      case "edit":
        return <EditProfile />;
      case "profile-photo":
        return <ChangeProfilePhoto />;
      case "cover-image":
        return <ChangeCoverImage />;
      case "settings":
        return <ProfileSettings />;
      default:
        return <ViewProfile />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* ────── 5 Navigation Tabs ────── */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveOption(opt.id)}
            className={`
              pb-3 text-sm font-medium border-b-2 transition-all duration-200
              ${activeOption === opt.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ────── Dynamic Content Area ────── */}
      <div className="mt-6">{renderContent()}</div>
    </div>
  );
}

/* ────── 1. View Profile ────── */
function ViewProfile() {
  const fields = [
    { label: "Name", value: "Alice" },
    { label: "Date of Birth", value: "2035-01-07" },
    { label: "Sex", value: "Female" },
    { label: "City", value: "Buenos Aires" },
    { label: "Country", value: "Belize" },
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

/* ────── 2. Edit Profile ────── */
function EditProfile() {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h3>

      <form className="space-y-6 max-w-2xl">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            defaultValue="Alice"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            defaultValue="2035-01-07"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent">
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            defaultValue="Buenos Aires"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            defaultValue="Belize"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
          >
            Save Changes
          </button>
          <button
            type="button"
            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ────── 3. Change Profile Photo ────── */
function ChangeProfilePhoto() {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Change Profile Photo</h3>

      <div className="flex items-center gap-10">
        {/* Placeholder */}
        <div className="w-36 h-36 rounded-xl bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center">
          <span className="text-5xl text-gray-400">+</span>
        </div>

        <div className="max-w-md">
          <p className="text-sm text-gray-600 mb-4">
            Upload a new profile picture. Recommended size: <strong>400x400px</strong>
          </p>
          <label className="inline-block">
            <input type="file" accept="image/*" className="hidden" />
            <span className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg cursor-pointer hover:bg-purple-700 transition">
              Choose File
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

/* ────── 4. Change Cover Image ────── */
function ChangeCoverImage() {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Change Cover Image</h3>

      <div className="space-y-6">
        {/* Preview Area */}
        <div className="h-56 bg-gray-100 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center">
          <span className="text-6xl text-gray-400">+</span>
        </div>

        <p className="text-sm text-gray-600">
          Upload a new cover image. Recommended size: <strong>1200x400px</strong>
        </p>

        <label className="inline-block">
          <input type="file" accept="image/*" className="hidden" />
          <span className="px-5 py-2.5 bg-purple-600 text-white font-medium rounded-lg cursor-pointer hover:bg-purple-700 transition">
            Upload Cover
          </span>
        </label>
      </div>
    </div>
  );
}

/* ────── 5. Settings ────── */
function ProfileSettings() {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">Profile Settings</h3>

      <div className="space-y-8 max-w-2xl">
        {/* Privacy */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Privacy</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">Show profile to everyone</span>
          </label>
        </div>

        {/* Notifications */}
        <div>
          <h4 className="font-medium text-gray-800 mb-3">Notifications</h4>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              defaultChecked
              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600">Email me when someone follows me</span>
          </label>
        </div>

        {/* Danger Zone */}
        <div className="pt-6 border-t border-gray-200">
          <button className="text-sm font-medium text-red-600 hover:text-red-700 transition">
            Delete Profile
          </button>
        </div>
      </div>
    </div>
  );
}
// src/components/ProfileAvatar.jsx
import React from "react";

export default function ProfileAvatar({ user }) {
  const fallback = user?.displayName?.[0]?.toUpperCase() || "U";
  return user?.profileAvatar ? (
    <img
      src={user.profileAvatar}
      alt="Avatar"
      className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-green-200"
    />
  ) : (
    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-green-100 flex items-center justify-center text-sm text-green-600 font-bold border-2 border-green-200">
      {fallback}
    </div>
  );
}

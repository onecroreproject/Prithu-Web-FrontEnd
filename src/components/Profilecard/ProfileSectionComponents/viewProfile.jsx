import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewProfile({ user }) {
  if (!user) return <p className="text-gray-500">No user data available.</p>;

  // Basic Info
  const fields = [
    { label: "Name", value: user?.displayName || "-" },
    {
      label: "Date of Birth",
      value: user?.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString()
        : "-",
    },
    { label: "City", value: user?.city || "-" },
    { label: "Country", value: user?.country || "-" },
    { label: "Bio", value: user?.bio || "-" },
    { label: "Phone", value: user?.phoneNumber || "-" },
    { label: "Marital Status", value: user?.maritalStatus || "-" },
    { label: "Language", value: user?.language || "-" },
    { label: "Email", value: user?.userEmail || "-" },
    { label: "Username", value: user?.userName || "-" },
    { label: "Theme", value: user?.theme || "-" },
    { label: "Timezone", value: user?.timezone || "-" },
  ];

  // Social Media
  const socialLinks = [
    { label: "Facebook", value: user?.socialLinks?.facebook },
    { label: "Instagram", value: user?.socialLinks?.instagram },
    { label: "Twitter", value: user?.socialLinks?.twitter },
    { label: "LinkedIn", value: user?.socialLinks?.linkedin },
    { label: "GitHub", value: user?.socialLinks?.github },
    { label: "YouTube", value: user?.socialLinks?.youtube },
    { label: "Website", value: user?.socialLinks?.website },
  ].filter((link) => link.value);

  return (
    <motion.div
      className="p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-2">Profile Details</h3>
      <p className="text-sm text-gray-600 mb-6">
        Basic information and account preferences
      </p>

      {/* Basic Info */}
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {fields.map((f) => (
          <motion.div
            key={f.label}
            className="flex items-start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <dt className="w-40 text-sm font-medium text-gray-500">
              {f.label}
            </dt>
            <dd className="flex-1 text-sm text-gray-900 break-words">
              {f.value}
            </dd>
          </motion.div>
        ))}
      </dl>

      {/* Social Links */}
      <AnimatePresence>
        {socialLinks.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h4 className="text-lg font-semibold text-gray-800 mb-4">
              Social Media Links
            </h4>
            <ul className="space-y-2">
              {socialLinks.map((link) => (
                <li key={link.label} className="text-sm">
                  <span className="font-medium text-gray-600 mr-2">
                    {link.label}:
                  </span>
                  <a
                    href={link.value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {link.value}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

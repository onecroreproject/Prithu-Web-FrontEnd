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

    {/* Basic Info Table */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="overflow-x-auto"
    >
      <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
        <tbody>
          {fields.map((f) => (
            <motion.tr
              key={f.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-600 w-1/3">
                {f.label}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900 break-words">
                {f.value || "-"}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>

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
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
              <tbody>
                {socialLinks.map((link) => (
                  <tr
                    key={link.label}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-600 w-1/3">
                      {link.label}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={link.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {link.value}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

}

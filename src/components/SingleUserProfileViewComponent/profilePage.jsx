import React from "react";
import { motion } from "framer-motion";
import { User2 } from "lucide-react";
import dayjs from "dayjs";

/**
 * ✅ ProfilePage (View-Only Table Format)
 * - Displays only available user details in a responsive table
 * - Automatically hides empty or null fields
 */
export default function ProfilePage({ user }) {
  if (!user) {
    return (
      <div className="text-center text-gray-500 py-10">
        No user profile data available.
      </div>
    );
  }

  const socialLinks = user.socialLinks || {};
  const filteredSocials = Object.entries(socialLinks).filter(
    ([, value]) => value && value.trim() !== ""
  );

  // ✅ Flattened data for table rendering
  const userDetails = [
    { label: "First Name", value: user.name },
    { label: "Last Name", value: user.lastName },
    { label: "Username", value: user.userName },
    { label: "Phone Number", value: user.phoneNumber },
    { label: "WhatsApp Number", value: user.whatsAppNumber },
    { label: "Address", value: user.address },
    { label: "City", value: user.city },
    { label: "Country", value: user.country },
    {
      label: "Date of Birth",
      value: user.dateOfBirth ? dayjs(user.dateOfBirth).format("DD/MM/YYYY") : "",
    },
    {
      label: "Marital Date",
      value: user.maritalDate ? dayjs(user.maritalDate).format("DD/MM/YYYY") : "",
    },
    { label: "Bio", value: user.bio },
    {
      label: "PhoneNumber",
      value: user.phoneNumber?.showPhoneNumber,
    },
  ].filter((item) => item.value && item.value !== "-");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      {/* 🔹 Header */}
      <div className="flex items-center gap-3 mb-6">
        <User2 className="w-6 h-6 text-green-600" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {user.displayName || user.userName}'s Profile Details
        </h2>
      </div>

      {/* 🔹 Basic Details Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-[#242429] text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300 dark:border-gray-700 w-1/3">
                Field
              </th>
              <th className="px-4 py-2 text-left font-semibold border-b border-gray-300 dark:border-gray-700">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-800 dark:text-gray-300">
            {userDetails.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-[#1f1f23]">
                <td className="px-4 py-2 font-medium">{item.label}</td>
                <td className="px-4 py-2">{item.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 🌐 Social Links Table */}
      {filteredSocials.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Social Media Links
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <thead className="bg-gray-100 dark:bg-[#242429] text-gray-700 dark:text-gray-300">
                <tr>
                  <th className="px-4 py-2 text-left font-semibold border-b border-gray-300 dark:border-gray-700 w-1/3">
                    Platform
                  </th>
                  <th className="px-4 py-2 text-left font-semibold border-b border-gray-300 dark:border-gray-700">
                    Link
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-800 dark:text-gray-300">
                {filteredSocials.map(([platform, link]) => (
                  <tr
                    key={platform}
                    className="hover:bg-gray-50 dark:hover:bg-[#1f1f23]"
                  >
                    <td className="px-4 py-2 font-medium capitalize">
                      {platform}
                    </td>
                    <td className="px-4 py-2">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline"
                      >
                        {link}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}

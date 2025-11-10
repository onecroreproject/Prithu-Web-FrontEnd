/* ✅ src/components/sideBar.jsx */
import { motion } from "framer-motion";
import {
  Calendar,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import {
  FaFacebook,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaYoutube,
  FaGlobe,
} from "react-icons/fa";

export default function PortfolioSidebar({ user }) {
  console.log("Sidebar User:", user);

  const social = user?.socialLinks || {};
  const visibility = user?.socialLinksVisibility || {};

  // 🧠 Prepare social icons dynamically
  const socialIcons = [
    {
      name: "facebook",
      icon: <FaFacebook className="text-blue-600 hover:text-blue-700" size={20} />,
      link: social.facebook,
      visible: visibility.facebook,
    },
    {
      name: "instagram",
      icon: <FaInstagram className="text-pink-500 hover:text-pink-600" size={20} />,
      link: social.instagram,
      visible: visibility.instagram,
    },
    {
      name: "twitter",
      icon: <FaTwitter className="text-sky-500 hover:text-sky-600" size={20} />,
      link: social.twitter,
      visible: visibility.twitter,
    },
    {
      name: "linkedin",
      icon: <FaLinkedin className="text-blue-700 hover:text-blue-800" size={20} />,
      link: social.linkedin,
      visible: visibility.linkedin,
    },
    {
      name: "github",
      icon: <FaGithub className="text-gray-800 hover:text-black dark:text-white" size={20} />,
      link: social.github,
      visible: visibility.github,
    },
    {
      name: "youtube",
      icon: <FaYoutube className="text-red-600 hover:text-red-700" size={20} />,
      link: social.youtube,
      visible: visibility.youtube,
    },
    {
      name: "website",
      icon: <FaGlobe className="text-green-600 hover:text-green-700" size={20} />,
      link: social.website,
      visible: visibility.website,
    },
  ];

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-b from-white to-gray-50 dark:from-[#1a1a24] dark:to-[#1f1f2b]
                 p-6 lg:w-80 lg:min-h-screen flex flex-col items-center shadow-xl
                 rounded-b-3xl border-r border-gray-200 dark:border-gray-700 relative"
    >
      {/* 🖼 Profile Photo */}
      <div className="mt-5 w-full">
        <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
          <img
            src={
              user?.profileAvatar ||
              user?.modifyAvatar ||
              "https://via.placeholder.com/400x250?text=Profile+Cover"
            }
            alt="cover"
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
      </div>

      {/* 🧾 Info Section */}
      <div className="w-full mt-6 bg-white dark:bg-[#1f1f2b] rounded-xl shadow p-4 space-y-3">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <MapPin size={16} className="text-[#ffc107]" />
          <span>
            {user?.city || "Unknown"}, {user?.country || ""}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Calendar size={16} className="text-[#ffc107]" />
          <span>
            Birthday:{" "}
            {user?.dateOfBirth
              ? new Date(user.dateOfBirth).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <Briefcase size={16} className="text-[#ffc107]" />
          <span>{user?.experience?.[0]?.jobTitle || "Freelancer"}</span>
        </div>

        {user?.user?.email && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Mail size={16} className="text-[#ffc107]" />
            <a href={`mailto:${user.user.email}`} className="hover:text-[#ffb300] break-all">
              {user.user.email}
            </a>
          </div>
        )}

        {user?.phoneNumber && (
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Phone size={16} className="text-[#ffc107]" />
            <a href={`tel:${user.phoneNumber}`} className="hover:text-[#ffb300]">
              {user.phoneNumber}
            </a>
          </div>
        )}
      </div>

  
      {/* 🌐 Social Media Links */}
      <div className="w-full mt-6 bg-white dark:bg-[#1f1f2b] rounded-xl shadow p-4">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Connect with Me
        </h3>

        <div className="flex flex-wrap gap-3">
          {socialIcons
            .filter((item) => item.link && item.visible)
            .map((item) => (
              <a
                key={item.name}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:scale-110 transition-transform"
              >
                {item.icon}
              </a>
            ))}
        </div>

        {/* If no links available */}
        {socialIcons.filter((item) => item.link && item.visible).length === 0 && (
          <p className="text-xs text-gray-400 text-center mt-2">
            No social media links available
          </p>
        )}
      </div>

      {/* ✨ Decorative Pulses */}
      <div className="absolute bottom-8 left-8 w-3 h-3 rounded-full bg-[#ffc107] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-16 right-10 w-4 h-4 rounded-full bg-pink-300 opacity-30 animate-ping"></div>
      <div className="absolute bottom-4 right-20 w-2 h-2 rounded-full bg-green-300 opacity-30 animate-bounce"></div>
    </motion.aside>
  );
}

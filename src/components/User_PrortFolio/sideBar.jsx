/* ✅ src/components/sideBar.jsx */
import { motion } from "framer-motion";
import {
  Calendar,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Award,
  FileText,
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

export default function PortfolioSidebar({ user, profileSettings, curriculum, shareableLink }) {
  const social = profileSettings?.socialLinks || {};
  const visibility = profileSettings?.socialLinksVisibility || {};

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
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full"
    >
      {/* 🖼 Profile Photo */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-32 h-32 mb-4">
          <img
            src={profileSettings?.profileAvatar || profileSettings?.modifyAvatar}
            alt={profileSettings?.displayName || user?.userName}
            className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
          />
          {profileSettings?.isPublished && (
            <div className="absolute -bottom-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              Published
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {profileSettings?.displayName || user?.userName}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {curriculum?.headline || "Professional"}
        </p>
      </div>

      {/* 🧾 Contact Info */}
      <div className="space-y-4 mb-6">
        {user?.email && (
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Mail size={16} className="text-blue-500" />
            <a href={`mailto:${user.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 break-all text-sm">
              {user.email}
            </a>
          </div>
        )}

        {profileSettings?.phoneNumber && (
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Phone size={16} className="text-green-500" />
            <a href={`tel:${profileSettings.phoneNumber}`} className="hover:text-green-600 dark:hover:text-green-400 text-sm">
              {profileSettings.phoneNumber}
            </a>
          </div>
        )}

        {profileSettings?.address && (
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <MapPin size={16} className="text-red-500" />
            <span className="text-sm">
              {profileSettings.address}, {profileSettings.city}
            </span>
          </div>
        )}

        {profileSettings?.dateOfBirth && (
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
            <Calendar size={16} className="text-purple-500" />
            <span className="text-sm">
              {new Date(profileSettings.dateOfBirth).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {/* 📊 Quick Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {curriculum?.experience?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Experiences</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {curriculum?.projects?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Projects</div>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {curriculum?.certifications?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Certifications</div>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-center">
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
            {curriculum?.skills?.length || 0}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Skills</div>
        </div>
      </div>

      {/* 🌐 Social Links */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Connect with Me
        </h3>
        <div className="flex flex-wrap gap-2">
          {socialIcons
            .filter((item) => item.link && item.visible)
            .map((item) => (
              <a
                key={item.name}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:scale-110 transition-transform"
                title={item.name}
              >
                {item.icon}
              </a>
            ))}
        </div>
      </div>

      {/* 📄 Resume Download */}
      {shareableLink && (
        <a
          href={shareableLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
        >
          <FileText size={16} />
          View Online Resume
        </a>
      )}
    </motion.aside>
  );
}

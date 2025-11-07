/* ✅ src/components/sideBar.jsx */
import { motion } from "framer-motion";
import { Calendar, Briefcase, Mail, Phone, MapPin, Download } from "lucide-react";

export default function PortfolioSidebar({ user }) {


  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gradient-to-b from-white to-gray-50 dark:from-[#1a1a24] dark:to-[#1f1f2b]
                 p-6 lg:w-80 lg:min-h-screen flex flex-col items-center shadow-xl
                 rounded-b-3xl border-r border-gray-200 dark:border-gray-700"
    >
    

      {/* 🖼 Profile Photo */}
      <div className="mt-5 w-full">
        <div className="relative w-full rounded-xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-700">
          <img
            src={
              user?.profileAvatar ||
              user?.modifiedCoverPhoto ||
              "https://via.placeholder.com/400x250?text=Profile+Cover"
            }
            alt="cover"
            className="w-full h-48 object-cover rounded-xl"
          />
        </div>
      </div>

      {/* 🧾 Info List */}
      <div className="w-full mt-6 bg-white   text-xl space-y-4 transition-all duration-300">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
          <MapPin size={16} className="text-[#ffc107]" />
          <span>
            {user?.city}, {user?.country}
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
            <a href={`mailto:${user.user.email}`} className="hover:text-[#ffb300]">
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

  

      {/* Footer Shadow Circles for Decoration */}
      <div className="absolute bottom-8 left-8 w-3 h-3 rounded-full bg-[#ffc107] opacity-40 animate-pulse"></div>
      <div className="absolute bottom-16 right-10 w-4 h-4 rounded-full bg-pink-300 opacity-30 animate-ping"></div>
      <div className="absolute bottom-4 right-20 w-2 h-2 rounded-full bg-green-300 opacity-30 animate-bounce"></div>
    </motion.aside>
  );
}

/* ✅ src/components/profileLayout.jsx */
import React, { useEffect, useState } from "react";
import PortfolioSidebar from "./sideBar";
import HeroSection from "./heroSection";
import StatsBar from "./statusBar";
import ServicesSection from "./serviceSection";
import RecommendationsSection from "./recomentedSection";
import { motion } from "framer-motion";
import api from "../../api/axios";
import SkillSetSection from "./skillSetSection";

export default function PortfolioLayout() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await api.get("/api/user/portfolio", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserData(data.data);
      } catch (err) {
        console.error("❌ Failed to fetch resume:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#1a1a24]">
        <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-[#ffc107] rounded-full" />
      </div>
    );

  if (!userData)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
        Portfolio not found.
      </div>
    );

  return (
    <>
      {/* 🎨 Hero Section */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <HeroSection user={userData} />
      </motion.div>

      <div
        className="min-h-screen flex flex-col lg:flex-row transition-colors
        bg-white text-gray-800 dark:bg-[#1a1a24] dark:text-gray-100"
      >
        {/* Sidebar */}
        <PortfolioSidebar user={userData} />

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-12 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <StatsBar stats={userData?.experience?.length || 0} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <ServicesSection services={userData?.skills} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <SkillSetSection skills={userData?.skills} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <RecommendationsSection skills={userData?.skills} />
          </motion.div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} {userData?.name || "Portfolio"}
            </p>
            {userData?.user?.email && (
              <p className="text-gray-500 text-sm mt-2">
                Email:{" "}
                <a
                  href={`mailto:${userData.user.email}`}
                  className="hover:text-[#ffc107]"
                >
                  {userData.user.email}
                </a>
              </p>
            )}
          </footer>
        </div>
      </div>
    </>
  );
}

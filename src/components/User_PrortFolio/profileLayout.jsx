/* ✅ src/components/profileLayout.jsx */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../../api/axios";

import PortfolioSidebar from "./sideBar";
import HeroSection from "./heroSection";
import StatsBar from "./statusBar";
import ServicesSection from "./serviceSection";
import SkillSetSection from "./skillSetSection";
import RecommendationsSection from "./recomentedSection";
import PortfolioUnderConstruction from "../../UnderConstructionPages/portfolioUnderConstruction";

export default function PortfolioLayout() {
  const { username } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data } = await api.get(`/api/user/portfolio/${username}`);

        setUserData(data.data);
      } catch (err) {
        console.error("❌ Failed to fetch portfolio:", err);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchPortfolio();
  }, [username]);

  // ✅ Loading State
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1a1a24]">
        <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-[#ffc107] rounded-full" />
      </div>
    );

  // ✅ Not Found State
  if (!userData)
    return (
     <PortfolioUnderConstruction username={username}/>
    );

  return (
    <>
      {/* 🎨 Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <HeroSection user={userData} />
      </motion.div>

      {/* ✅ Responsive Layout */}
      <div
        className="
          min-h-screen flex flex-col lg:flex-row
          bg-white text-gray-800 dark:bg-[#1a1a24] dark:text-gray-100
          transition-colors duration-300
        "
      >
        {/* ✅ Sidebar (collapses on mobile) */}
        <div
          className="
            w-full lg:w-[300px]
            border-b lg:border-b-0 lg:border-r
            border-gray-200 dark:border-gray-700
            flex-shrink-0
          "
        >
          <PortfolioSidebar user={userData} />
        </div>

        {/* ✅ Main Content */}
        <div
          className="
            flex-1 flex flex-col
            p-4 sm:p-6 md:p-8 lg:p-10
            space-y-8 sm:space-y-10
            overflow-x-hidden
          "
        >
          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <StatsBar stats={userData?.experience?.length || 0} />
          </motion.div>

          {/* Services Section */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <ServicesSection user={userData}/>
          </motion.div>

          {/* SkillSet Section */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <SkillSetSection skills={userData?.skills} />
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <RecommendationsSection skills={userData?.skills} />
          </motion.div>

          {/* ✅ Footer */}
          <footer
            className="
              mt-10 pt-8 border-t
              border-gray-200 dark:border-gray-700
              text-center text-sm sm:text-base
            "
          >
            <p className="text-gray-500">
              © {new Date().getFullYear()} {userData?.name || username}
            </p>
            {userData?.user?.email && (
              <p className="text-gray-500 mt-2 break-all">
                Email:{" "}
                <a
                  href={`mailto:${userData.user.email}`}
                  className="hover:text-[#ffc107] transition"
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

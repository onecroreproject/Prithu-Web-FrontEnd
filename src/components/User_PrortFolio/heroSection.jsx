/* ✅ src/components/heroSection.jsx */
import React from "react";
import { motion } from "framer-motion";
import { Download, Share2, ExternalLink } from "lucide-react";

export default function HeroSection({ user }) {
  // 🧠 Safely get job title from experience array
  const jobTitle = user?.experience?.[0]?.jobTitle || "Professional Developer";

  // 🌐 Resume Links
  const resumeUrl = user?.resumeFile || user?.shareableLink;

  // 📥 Handle download
  const handleDownloadResume = () => {
    if (resumeUrl) {
      const link = document.createElement("a");
      link.href = resumeUrl;
      link.download = `${user?.name || "Resume"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Resume file not available.");
    }
  };

  // 📤 Share resume (via native share API or fallback)
  const handleShareResume = async () => {
    if (!resumeUrl) return alert("Resume not available to share.");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name || "Resume"}`,
          text: `Check out ${user?.name || "this"}'s resume.`,
          url: resumeUrl,
        });
      } catch (err) {
        console.log("Share canceled", err);
      }
    } else {
      navigator.clipboard.writeText(resumeUrl);
      alert("Resume link copied to clipboard!");
    }
  };

  return (
    <motion.section
      className="relative overflow-hidden bg-gray-200 dark:bg-[#2d2d3a] text-center py-20 px-6 sm:px-10 lg:px-20 transition-all duration-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* 🖼️ Background Cover Photo */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-80 dark:opacity-25"
        style={{
          backgroundImage: `url(${
            user?.coverPhoto ||
            user?.modifiedCoverPhoto ||
            "https://via.placeholder.com/1200x500"
          })`,
        }}
      ></div>

      {/* 🧩 Top-Right Resume Icons */}
      <div className="absolute top-6 right-6 flex gap-4 z-20">
        {/* 🌐 View Resume */}
        {user?.shareableLink && (
          <a
            href={user.shareableLink}
            target="_blank"
            rel="noopener noreferrer"
            title="View Online Resume"
            className="bg-white/80 dark:bg-[#333] p-2.5 rounded-full shadow-md hover:bg-[#ffc107] hover:text-black text-gray-800 dark:text-gray-200 transition-all"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}

        {/* 📤 Share Resume */}
        <button
          onClick={handleShareResume}
          title="Share Resume"
          className="bg-white/80 dark:bg-[#333] p-2.5 rounded-full shadow-md hover:bg-[#ffc107] hover:text-black text-gray-800 dark:text-gray-200 transition-all"
        >
          <Share2 className="w-5 h-5" />
        </button>

        {/* 📥 Download Resume */}
        <button
          onClick={handleDownloadResume}
          title="Download Resume"
          className="bg-white/80 dark:bg-[#333] p-2.5 rounded-full shadow-md hover:bg-[#ffc107] hover:text-black text-gray-800 dark:text-gray-200 transition-all"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* 🧩 Content Layer */}
      <div className="relative z-10 flex flex-col items-center justify-center mt-8">
        {/* 👤 Name */}
        <motion.h1
          className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent drop-shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Hi, I'm {user?.name || "Your Name"}
        </motion.h1>

        {/* 💼 Job Title */}
        <motion.h2
          className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {jobTitle}
        </motion.h2>
      </div>
    </motion.section>
  );
}

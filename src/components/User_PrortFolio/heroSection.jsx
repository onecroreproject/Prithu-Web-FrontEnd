/* ✅ src/components/heroSection.jsx */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Download, Share2, ExternalLink, X, Copy } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function HeroSection({ user }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // 🧠 Safely get job title
  const jobTitle = user?.experience?.[0]?.jobTitle || "Professional Developer";

  // 🌐 Detect environment (localhost vs production)
  const host = window.location.origin;
  const portfolioUrl = `${host}/portfolio/${user?.userName}`;

  // 📥 Handle resume download
  const handleDownloadResume = () => {
    const resumeUrl = user?.resumeFile || user?.shareableLink;
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

  // 📤 Share modal toggle
  const handleShareClick = () => setShowShareModal(true);

  // 📋 Copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ Copy failed:", err);
    }
  };

  return (
    <>
      {/* 🌿 Hero Section */}
      <motion.section
        className="relative overflow-hidden text-center py-20 px-6 sm:px-10 lg:px-20 transition-all duration-500"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          background:
            "linear-gradient(135deg, #b3ffab 0%, #12fff7 100%)", // ✅ fresh green gradient
        }}
      >
        {/* 🌸 Subtle pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)",
          }}
        ></div>

        {/* 🧩 Top-Right Action Icons */}
        <div className="absolute top-6 right-6 flex gap-4 z-20">
          {/* 🌐 View Online Resume */}
          {user?.shareableLink && (
            <a
              href={user.shareableLink}
              target="_blank"
              rel="noopener noreferrer"
              title="View Online Resume"
              className="bg-white/80 dark:bg-[#333] p-2.5 rounded-full shadow-md hover:bg-[#16a34a] hover:text-white text-gray-800 dark:text-gray-200 transition-all"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}

          {/* 📤 Share Portfolio */}
          <button
            onClick={handleShareClick}
            title="Share Portfolio"
            className="bg-white/80 dark:bg-[#333] p-2.5 rounded-full shadow-md hover:bg-[#16a34a] hover:text-white text-gray-800 dark:text-gray-200 transition-all"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* 📥 Download Resume */}
          <button
            onClick={handleDownloadResume}
            title="Download Resume"
            className="bg-white/80 dark:bg-[#333] p-2.5 rounded-full shadow-md hover:bg-[#16a34a] hover:text-white text-gray-800 dark:text-gray-200 transition-all"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>

        {/* 🧩 Content Layer */}
        <div className="relative z-10 flex flex-col items-center justify-center mt-8">
          {/* 👤 Name */}
          <motion.h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 bg-gradient-to-r from-green-700 to-teal-600 bg-clip-text text-transparent drop-shadow-md"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Hi, I'm {user?.name || "Your Name"}
          </motion.h1>

          {/* 💼 Job Title */}
          <motion.h2
            className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {jobTitle}
          </motion.h2>
        </div>
      </motion.section>

      {/* 🪩 Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1a1a24] rounded-xl p-6 w-[90%] max-w-md relative shadow-2xl text-center">
            {/* ❌ Close */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h2 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Share Your Portfolio
            </h2>

            {/* 🔗 Link Box */}
            <div className="flex items-center justify-between border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 mb-4">
              <span className="truncate text-sm text-gray-700 dark:text-gray-300">
                {portfolioUrl}
              </span>
              <button
                onClick={handleCopy}
                className="ml-2 text-green-600 hover:text-green-700"
              >
                {copied ? "✅" : <Copy size={16} />}
              </button>
            </div>

            {/* 🧠 QR Code with logo */}
            <div className="relative inline-block">
              <QRCodeCanvas
                value={portfolioUrl}
                size={200}
                bgColor="white"
                fgColor="#000000"
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: "https://res.cloudinary.com/dzp2c7ed9/image/upload/v1761117129/profile/images/y7onrvr4do1h5vgd7ldc.jpg",
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Scan or copy the link to view this portfolio.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

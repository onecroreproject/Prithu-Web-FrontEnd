/* ✅ src/components/heroSection.jsx */
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

export default function HeroSection({ user, profileSettings, curriculum, shareableLink }) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentGradient, setCurrentGradient] = useState(0);

  // 🧠 Get display data
  const displayName = profileSettings?.name || user?.userName;
  const jobTitle = curriculum?.headline || "Professional Developer";

  // 🌐 Get current URL for sharing
  const host = window.location.origin;
  const portfolioUrl = shareableLink || `${host}/portfolio/${user?.userName}`;

  // 🎨 Color gradients array
  const gradients = [
    "from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    "from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    "from-rose-50 via-pink-50 to-fuchsia-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    "from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    "from-violet-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900",
    "from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
  ];

  // 🎨 Gradient colors for decorative elements
  const accentColors = [
    "bg-gradient-to-r from-blue-400 to-indigo-500",
    "bg-gradient-to-r from-emerald-400 to-teal-500",
    "bg-gradient-to-r from-rose-400 to-pink-500",
    "bg-gradient-to-r from-amber-400 to-orange-500",
    "bg-gradient-to-r from-violet-400 to-purple-500",
    "bg-gradient-to-r from-green-400 to-emerald-500"
  ];

  // 🎨 Button gradients matching the theme
  const buttonGradients = [
    "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    "from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700",
    "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    "from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
    "from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
  ];

  // 🎨 Resume button gradients
  const resumeButtonGradients = [
    "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    "from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700",
    "from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700",
    "from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
    "from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
    "from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
  ];

  // 🔄 Rotate gradient every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGradient((prev) => (prev + 1) % gradients.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [gradients.length]);

  // 📥 Handle resume download
  const handleDownloadResume = () => {
    if (curriculum?.resumeURL) {
      const link = document.createElement("a");
      link.href = curriculum.resumeURL;
      link.download = `${displayName}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert("Resume file not available.");
    }
  };

  // 📤 Copy to clipboard
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
      {/* 🌟 Minimal Hero Section with Rotating Gradient */}
      <motion.section
        className={`relative overflow-hidden py-16 md:py-20 bg-gradient-to-br ${gradients[currentGradient]} transition-all duration-2000 ease-in-out`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute top-0 right-0 w-96 h-96 rounded-full"
            animate={{
              background: [
                'radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(244, 63, 94, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.2) 0%, transparent 50%)'
              ][currentGradient]
            }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
            animate={{
              background: [
                'radial-gradient(circle at 20% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(20, 184, 166, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(249, 115, 22, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 80%, rgba(5, 150, 105, 0.2) 0%, transparent 50%)'
              ][currentGradient]
            }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* Subtle animated lines */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 w-full h-1"
            animate={{
              background: [
                'linear-gradient(to right, transparent, rgba(59, 130, 246, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(16, 185, 129, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(244, 63, 94, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(245, 158, 11, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(34, 197, 94, 0.2), transparent)'
              ][currentGradient]
            }}
            transition={{ duration: 1 }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-full h-1"
            animate={{
              background: [
                'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(20, 184, 166, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(236, 72, 153, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(249, 115, 22, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(99, 102, 241, 0.2), transparent)',
                'linear-gradient(to right, transparent, rgba(5, 150, 105, 0.2), transparent)'
              ][currentGradient]
            }}
            transition={{ duration: 1 }}
          />
        </div>

        {/* Animated floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 4 + 2,
                height: Math.random() * 4 + 2,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
                background: [
                  'rgb(59, 130, 246)',
                  'rgb(16, 185, 129)',
                  'rgb(244, 63, 94)',
                  'rgb(245, 158, 11)',
                  'rgb(139, 92, 246)',
                  'rgb(34, 197, 94)'
                ][currentGradient]
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex flex-col items-center justify-center text-center">
            {/* Name & Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <motion.h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4"
               
                transition={{ duration: 1 }}
              >
                <span className="bg-clip-text text-gray-400">
                  {displayName}
                </span>
              </motion.h1>
              <div className="inline-flex items-center justify-center gap-2">
                <motion.div
                  className="w-3 h-3 rounded-full"
                  animate={{
                    background: accentColors[currentGradient]
                  }}
                  transition={{ duration: 1 }}
                />
                <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-medium">
                  {jobTitle}
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
            >
              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className={`group relative px-8 py-4 bg-gradient-to-r ${buttonGradients[currentGradient]} text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 min-w-[200px]`}
              >
                <div className="flex items-center justify-center gap-3">
                  <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Share Portfolio</span>
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all"></div>
              </button>

              {/* Download Resume Button */}
              {curriculum?.resumeURL && (
                <button
                  onClick={handleDownloadResume}
                  className={`group relative px-8 py-4 bg-gradient-to-r ${resumeButtonGradients[currentGradient]} text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 min-w-[200px]`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    <span>Download Resume</span>
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-white/20 group-hover:border-white/40 transition-all"></div>
                </button>
              )}
            </motion.div>
          </div>
        </div>

        {/* Animated decorative elements */}
        <motion.div
          className="absolute left-10 top-1/4 w-1 h-16"
          animate={{
            background: [
              'linear-gradient(to bottom, rgba(59, 130, 246, 0.3), transparent)',
              'linear-gradient(to bottom, rgba(16, 185, 129, 0.3), transparent)',
              'linear-gradient(to bottom, rgba(244, 63, 94, 0.3), transparent)',
              'linear-gradient(to bottom, rgba(245, 158, 11, 0.3), transparent)',
              'linear-gradient(to bottom, rgba(139, 92, 246, 0.3), transparent)',
              'linear-gradient(to bottom, rgba(34, 197, 94, 0.3), transparent)'
            ][currentGradient]
          }}
          transition={{ duration: 1 }}
        />
        <motion.div
          className="absolute right-10 bottom-1/4 w-1 h-16"
          animate={{
            background: [
              'linear-gradient(to top, rgba(139, 92, 246, 0.3), transparent)',
              'linear-gradient(to top, rgba(20, 184, 166, 0.3), transparent)',
              'linear-gradient(to top, rgba(236, 72, 153, 0.3), transparent)',
              'linear-gradient(to top, rgba(249, 115, 22, 0.3), transparent)',
              'linear-gradient(to top, rgba(99, 102, 241, 0.3), transparent)',
              'linear-gradient(to top, rgba(5, 150, 105, 0.3), transparent)'
            ][currentGradient]
          }}
          transition={{ duration: 1 }}
        />

        {/* Gradient indicator dots */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {gradients.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentGradient(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentGradient 
                  ? 'w-8 bg-white/50' 
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              aria-label={`Switch to theme ${index + 1}`}
            />
          ))}
        </div>
      </motion.section>

      {/* 🪩 Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md relative shadow-2xl border border-gray-100 dark:border-gray-700"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Share My Portfolio
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Share this link with recruiters, colleagues, or friends
              </p>
            </div>

            {/* Link Box */}
            <div className="mb-8">
              <div className="relative group">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 pr-20 border border-gray-200 dark:border-gray-600 group-hover:border-blue-500/50 transition-all">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                      {portfolioUrl}
                    </p>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`absolute right-4 flex items-center gap-2 bg-gradient-to-r ${buttonGradients[currentGradient]} text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-sm mt-2 text-center">
                    ✓ Link copied to clipboard!
                  </p>
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <motion.div
                className="bg-white p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg mb-4"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <QRCodeCanvas
                  value={portfolioUrl}
                  size={140}
                  bgColor="white"
                  fgColor="#1e40af"
                  level="H"
                />
              </motion.div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Scan QR code for mobile access
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
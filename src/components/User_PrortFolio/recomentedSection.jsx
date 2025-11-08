import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// 🧠 Dynamic Logo Fetcher
const getDynamicLogo = async (skillName) => {
  if (!skillName) return null;

  // Clean skill name: remove spaces and lowercase
  const cleanName = skillName.trim().toLowerCase().replace(/\s+/g, "");

  const deviconUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${cleanName}/${cleanName}-original.svg`;
  try {
    const res = await fetch(deviconUrl, { method: "HEAD" });
    if (res.ok) return deviconUrl;
  } catch {}
  return "https://cdn-icons-png.flaticon.com/512/5968/5968292.png"; // fallback icon
};

// 🧩 Default fallback skills
const defaultList = [
  { name: "React" },
  { name: "Node.js" },
  { name: "MongoDB" },
  { name: "Plumber" },
  { name: "Electrician" },
];

export default function SkillLogoRoller({ skills = [] }) {
  const [logos, setLogos] = useState([]);

  // Load dynamic logos
  useEffect(() => {
    const load = async () => {
      const skillData = skills?.length ? skills : defaultList;

      const result = await Promise.all(
        skillData.map(async (s) => {
          const cleanName = s.name?.trim()?.toLowerCase()?.replace(/\s+/g, "");
          const logo = await getDynamicLogo(cleanName);
          return { name: s.name, logo };
        })
      );
      setLogos(result);
    };
    load();
  }, [skills]);

  // ✅ Duplicate list for infinite scroll loop
  const displayLogos = [...logos, ...logos];

  const LOGO_WIDTH = 120;
  const GAP = 40;
  const totalWidth = (LOGO_WIDTH + GAP) * displayLogos.length;

  return (
    <div className="relative w-full h-48 overflow-hidden flex items-center justify-center bg-transparent">
      {/* 🌀 Infinite Motion */}
      <motion.div
        className="flex items-center"
        style={{ gap: `${GAP}px` }}
        animate={{ x: [0, -totalWidth / 2] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 40, // adjust for speed
        }}
      >
        {displayLogos.map((l, i) => (
          <div
            key={i + l.name}
            className="flex flex-col items-center justify-center"
            style={{ width: `${LOGO_WIDTH}px` }}
          >
            <img
              src={l.logo}
              alt={l.name}
              className="h-24 w-24 object-contain mb-2 drop-shadow-md hover:scale-110 transition-transform duration-300"
            />
            <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 text-center">
              {l.name}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ✨ Gradient fade edges */}
      <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white dark:from-[#1a1a24] to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white dark:from-[#1a1a24] to-transparent pointer-events-none" />
    </div>
  );
}

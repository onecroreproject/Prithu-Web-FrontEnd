/* ✅ src/components/SkillSetSection.jsx */
import { motion } from "framer-motion";
import {
  Code2,
  Server,
  Database,
  Globe,
  Cloud,
  Shield,
  Palette,
  Terminal,
} from "lucide-react";

export default function SkillSetSection({ skills = [] }) {


  // ✅ Map categories to icons + default color
  const iconMap = {
    Frontend: <Code2 className="w-6 h-6 text-[#ffc107]" />,
    Backend: <Server className="w-6 h-6 text-blue-400" />,
    Database: <Database className="w-6 h-6 text-green-500" />,
    API: <Globe className="w-6 h-6 text-indigo-400" />,
    Cloud: <Cloud className="w-6 h-6 text-cyan-400" />,
    Security: <Shield className="w-6 h-6 text-red-500" />,
    Design: <Palette className="w-6 h-6 text-pink-400" />,
    Tools: <Terminal className="w-6 h-6 text-purple-400" />,
  };

  // ✅ Convert string level to numeric percentage
  const getLevelPercentage = (level) => {
    switch ((level || "").toLowerCase()) {
      case "intermediate":
        return { percent: 25, color: "#ef4444" }; // red
      case "advanced":
        return { percent: 50, color: "#facc15" }; // yellow
      case "expert":
        return { percent: 100, color: "#22c55e" }; // green
      default:
        return { percent: 0, color: "#9ca3af" }; // gray (unknown)
    }
  };

  // ✅ Default fallback data if no backend data exists
  const defaultSkills = [
    {
      name: "Frontend Development",
      description:
        "Building modern, responsive UIs using React, Vue, and Tailwind CSS.",
      level: "Expert",
      category: "Frontend",
    },
    {
      name: "Backend Development",
      description:
        "Creating robust APIs with Node.js and Express.js.",
      level: "Intermediate",
      category: "Backend",
    },
  ];

  const skillList = skills.length > 0 ? skills : defaultSkills;

  return (
    <section className="mb-16">
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900 dark:text-white text-center">
        My Skill Set
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skillList.map((skill, index) => {
          const { name, description, level, category } = skill;
          const { percent, color } = getLevelPercentage(level);
          const icon =
            iconMap[category] || <Terminal className="w-6 h-6 text-gray-400" />;

          return (
            <motion.div
              key={skill._id || index}
              className="relative p-6 sm:p-8 rounded-2xl shadow-md border border-gray-200 
                        dark:border-gray-700 bg-white dark:bg-[#2d2d3a]
                        hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              {/* 🧩 Icon + Title */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ rotate: -15, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="p-3 rounded-full bg-gray-100 dark:bg-[#3a3a4a] shadow-inner"
                  >
                    {icon}
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                    {name}
                  </h3>
                </div>
              </div>

              {/* 🧠 Description */}
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 leading-relaxed">
                {description || "No description available for this skill."}
              </p>

              {/* 🎚️ Animated Skill Level Bar */}
              <div className="w-full bg-gray-200 dark:bg-[#3a3a4a] rounded-full h-3 overflow-hidden relative">
                <motion.div
                  className="h-3 rounded-full absolute top-0 left-0"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${percent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>

              {/* 📊 Level Percentage Display */}
              <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Knowledge Level</span>
                <motion.span
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                >
                  {percent}%
                </motion.span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

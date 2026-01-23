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
  Smartphone,
  Layers,
  Cpu,
} from "lucide-react";

export default function SkillSetSection({ skills = [] }) {
  // ✅ Map categories to icons
  const iconMap = {
    Frontend: <Smartphone className="w-6 h-6" />,
    Backend: <Server className="w-6 h-6" />,
    Database: <Database className="w-6 h-6" />,
    API: <Globe className="w-6 h-6" />,
    Cloud: <Cloud className="w-6 h-6" />,
    Security: <Shield className="w-6 h-6" />,
    Design: <Palette className="w-6 h-6" />,
    Tools: <Terminal className="w-6 h-6" />,
    Fullstack: <Layers className="w-6 h-6" />,
    Mobile: <Smartphone className="w-6 h-6" />,
    default: <Cpu className="w-6 h-6" />,
  };

  // ✅ Color mapping for categories
  const colorMap = {
    Frontend: "from-blue-500 to-cyan-500",
    Backend: "from-purple-500 to-pink-500",
    Database: "from-green-500 to-emerald-500",
    Fullstack: "from-orange-500 to-red-500",
    Mobile: "from-indigo-500 to-purple-500",
    Cloud: "from-cyan-500 to-blue-500",
    default: "from-gray-500 to-gray-700",
  };

  // ✅ Convert string level to percentage
  const getLevelPercentage = (level) => {
    const levelMap = {
      'beginner': 30,
      'intermediate': 60,
      'advanced': 80,
      'expert': 95,
      'novice': 20,
    };
    return levelMap[(level || '').toLowerCase()] || 50;
  };

  // Group skills by category
  const groupedSkills = skills.reduce((groups, skill) => {
    const category = skill.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(skill);
    return groups;
  }, {});

  // Default skills if empty
  const defaultSkills = [
    {
      name: "Frontend Development",
      description: "Building modern, responsive UIs using React, Vue, and Tailwind CSS.",
      level: "Expert",
      category: "Frontend",
    },
    {
      name: "Backend Development",
      description: "Creating robust APIs with Node.js and Express.js.",
      level: "Intermediate",
      category: "Backend",
    },
  ];

  const skillList = skills.length > 0 ? skills : defaultSkills;

  return (
    <section className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Skills & Expertise
        </h2>

        {Object.keys(groupedSkills).length > 0 ? (
          Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="mb-8 last:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${colorMap[category] || colorMap.default} text-white`}>
                  {iconMap[category] || iconMap.default}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {category}
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorySkills.map((skill, index) => {
                  const percent = getLevelPercentage(skill.level);
                  return (
                    <motion.div
                      key={skill._id || index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {skill.name}
                        </h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {skill.level || 'Intermediate'}
                        </span>
                      </div>
                      
                      {skill.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                          {skill.description}
                        </p>
                      )}
                      
                      {skill.yearsOfExperience && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                          <span>{skill.yearsOfExperience} year(s) experience</span>
                        </div>
                      )}
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percent}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {skillList.map((skill, index) => {
              const percent = getLevelPercentage(skill.level);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      {iconMap[skill.category] || iconMap.default}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {skill.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {skill.level || 'Intermediate'}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {skill.description}
                  </p>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <motion.div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${percent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ✅ src/components/statusBar.jsx */
import React, { useMemo } from "react";
import { Briefcase, Code, Award, Star, BookOpen, Globe, Users } from "lucide-react";

export default function StatsBar({ experience, projects, skills, certifications }) {
  // 🧠 Calculate total experience in years
  const totalExperienceYears = useMemo(() => {
    if (!experience || experience.length === 0) return 0;

    let totalMonths = 0;

    experience.forEach((exp) => {
      if (!exp.startDate) return;

      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const diffInMonths =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      totalMonths += diffInMonths > 0 ? diffInMonths : 0;
    });

    return (totalMonths / 12).toFixed(1);
  }, [experience]);

  // 🧩 Stats cards
  const stats = [
    {
      icon: <Briefcase className="w-6 h-6" />,
      value: experience?.length || 0,
      label: "Experiences",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      icon: <Code className="w-6 h-6" />,
      value: projects?.length || 0,
      label: "Projects",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      icon: <Award className="w-6 h-6" />,
      value: certifications?.length || 0,
      label: "Certifications",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      icon: <Star className="w-6 h-6" />,
      value: skills?.length || 0,
      label: "Skills",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      value: totalExperienceYears,
      label: "Years Exp",
      suffix: "+",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`${stat.bgColor} rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
              {stat.suffix && <span className="text-lg">{stat.suffix}</span>}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
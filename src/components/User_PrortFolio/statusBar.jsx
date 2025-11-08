/* ✅ src/components/statusBar.jsx */
import React, { useMemo } from "react";

export default function StatsBar({ user }) {
  // 🧠 Calculate total experience in years
  const totalExperience = useMemo(() => {
    if (!user?.experience || user.experience.length === 0) return 0;

    let totalMonths = 0;

    user.experience.forEach((exp) => {
      if (!exp.startDate) return; // Skip if invalid

      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date(); // use current date if still working
      const diffInMonths =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      totalMonths += diffInMonths > 0 ? diffInMonths : 0;
    });

    // Convert months → years with one decimal (e.g., 3.5 years)
    return (totalMonths / 12).toFixed(1);
  }, [user]);

  // 🧩 Define stats to display
  const stats = [
    { value: totalExperience, label: "Years Experience", suffix: "+" },
    {
      value: user?.projects?.length || 10,
      label: "Completed Projects",
      suffix: "",
    },
  ];

  return (
    <div className="flex flex-wrap justify-between gap-6 mb-12">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center gap-3 bg-white dark:bg-[#2d2d3a] rounded-xl shadow-md px-4 py-3 transition hover:scale-105 hover:shadow-lg"
        >
          <div className="text-[#ffc107] text-4xl font-bold flex items-start">
            {stat.value}
            <span className="text-2xl">{stat.suffix}</span>
          </div>
          <div className="text-gray-800 dark:text-gray-300 text-sm leading-tight">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}

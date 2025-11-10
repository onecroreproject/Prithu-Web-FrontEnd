// src/components/Birthdays.jsx
import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";

/* --------------------------- 🔹 API CALL --------------------------- */
const fetchUpcomingBirthdays = async () => {
  const { data } = await api.get(`/api/get/user/birthday`);
  return data;
};

/* --------------------------- 🔹 Skeleton Loader --------------------------- */
const SkeletonBirthdayCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    className="max-w-sm w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-pulse sm:max-w-md md:max-w-lg"
  >
    <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-1">
            <div className="w-32 h-3 bg-gray-200 rounded"></div>
            <div className="w-20 h-2 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

/* --------------------------- 🔹 Main Component --------------------------- */
function Birthdays() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming-birthdays"],
    queryFn: fetchUpcomingBirthdays,
    staleTime: 1000 * 60 * 10, // cache for 10 mins
    refetchOnWindowFocus: false,
  });

  // ✅ Loading
  if (isLoading) return <SkeletonBirthdayCard />;

  // ✅ Error
  if (isError) {
    return (
      <div className="max-w-sm w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center sm:max-w-md md:max-w-lg">
        <p className="text-sm text-red-500 font-medium">
          {error?.message || "Failed to fetch birthdays."}
        </p>
      </div>
    );
  }

  // ✅ No data
  if (!data?.success || !data?.users?.length) {
    return (
      <div className="max-w-sm w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-center sm:max-w-md md:max-w-lg">
        <p className="text-sm text-gray-500">
          {data?.message || "No upcoming birthdays 🎂"}
        </p>
      </div>
    );
  }

  /* --------------------------- 🔹 Grouping --------------------------- */
  const grouped = data.users.reduce((acc, user) => {
    const nextBDay = new Date(user.nextBirthday);
    const monthName = nextBDay.toLocaleString("default", { month: "long" });
    const day = nextBDay.getDate();
    const key = `${day} ${monthName}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(user);
    return acc;
  }, {});

  const birthdayGroups = Object.entries(grouped).map(([date, people]) => ({
    date,
    people,
  }));

  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  /* --------------------------- 🔹 Render --------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="max-w-sm w-full bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden sm:max-w-md md:max-w-lg"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          🎉 Upcoming Birthdays
        </h2>
        <span className="text-xs text-gray-500">
          {data.users.length} {data.users.length > 1 ? "people" : "person"}
        </span>
      </div>

      {/* Scrollable List */}
      <div className="max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400">
        <ul className="divide-y divide-gray-200">
          <AnimatePresence>
            {birthdayGroups.map((group, groupIdx) => (
              <motion.li
                key={groupIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: groupIdx * 0.05 }}
              >
                {/* Date Header */}
                <div className="px-4 py-2 bg-gray-50 text-xs font-medium text-gray-900 sticky top-0">
                  {group.date}
                </div>

                {/* People */}
                {group.people.map((person, personIdx) => {
                  const dob = new Date(person.dateOfBirth);
                  const birthYear = dob.getFullYear();
                  const nextBirthday = new Date(person.nextBirthday);
                  const turningAge = nextBirthday.getFullYear() - birthYear;

                  return (
                    <motion.div
                      key={personIdx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, delay: personIdx * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center px-4 py-3 hover:bg-gray-50 transition-all duration-200"
                    >
                      <img
                        src={
                          person.profileAvatar ||
                          `https://i.pravatar.cc/150?u=${person._id}`
                        }
                        alt={person.displayName || person.userName}
                        className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {person.displayName || person.userName}
                        </p>
                        <p className="text-xs text-gray-500">
                          🎂 {getOrdinal(turningAge)} Birthday –{" "}
                          {nextBirthday.toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </motion.div>
  );
}

export default memo(Birthdays);

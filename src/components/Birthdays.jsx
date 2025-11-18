// src/components/Birthdays.jsx
import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cake, Gift } from "lucide-react";
import api from "../api/axios";

/* --------------------------- 🔹 API CALL --------------------------- */
const fetchUpcomingBirthdays = async () => {
  const { data } = await api.get(`/api/get/user/birthday`);
  return data;
};

/* --------------------------- 🔹 Skeleton Loader --------------------------- */
const SkeletonBirthdayCard = () => (
  <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
    <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* --------------------------- 🔹 Main Component --------------------------- */
function Birthdays() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming-birthdays"],
    queryFn: fetchUpcomingBirthdays,
    staleTime: 600000,
  });

  /* ---------------------- LOADING ---------------------- */
  if (isLoading) return <SkeletonBirthdayCard />;

  /* ---------------------- ERROR ---------------------- */
  if (isError)
    return (
      <div className="w-full p-6 bg-white rounded-xl border border-gray-200 shadow-sm text-center">
        <p className="text-red-500 font-medium text-sm">
          {error?.message || "Error fetching birthdays."}
        </p>
      </div>
    );

  const today = new Date().toDateString();

  /* ---------------------- Filter Today's Birthdays ---------------------- */
  const todaysBirthdays =
    data?.users?.filter((user) => {
      if (!user.nextBirthday) return false;
      const bd = new Date(user.nextBirthday);
      return bd.toDateString() === today;
    }) || [];

  /* ---------------------- Show fallback if no birthdays ---------------------- */
  if (todaysBirthdays.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-3">
          <Cake className="w-6 h-6 text-blue-600" />
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          No Birthdays Today 🎂
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Check back tomorrow to celebrate!
        </p>
      </motion.div>
    );
  }

  const ordinal = (n) =>
    n + (["th", "st", "nd", "rd"][(n % 100 - 20) % 10] || ["th", "st", "nd", "rd"][n % 100] || "th");

  /* --------------------------- 🔹 Render (Matching UI Sample) --------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      {/* ---------- HEADER ---------- */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Cake className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Today’s Birthdays
            </h2>
            <p className="text-sm text-gray-500">
              {todaysBirthdays.length}{" "}
              {todaysBirthdays.length > 1 ? "people" : "person"} celebrating today
            </p>
          </div>
        </div>
      </div>

      {/* ---------- BIRTHDAY LIST ---------- */}
      <div className="p-2">
        {todaysBirthdays.map((person, index) => {
          const dob = new Date(person.dateOfBirth);
          const next = new Date(person.nextBirthday);
          const age = next.getFullYear() - dob.getFullYear();

          return (
            <motion.div
              key={person._id}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group cursor-pointer"
            >
              {/* Avatar with Celebration Badge */}
              <div className="relative flex-shrink-0">
                <img
                  src={
                    person.profileAvatar ||
                    `https://i.pravatar.cc/150?u=${person._id}`
                  }
                  className="w-12 h-12 rounded-full border-2 border-blue-200 object-cover group-hover:border-blue-300 transition-colors"
                  alt={person.displayName || person.userName}
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Gift className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Person Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors truncate">
                    {person.displayName || person.userName}
                  </h3>

                  {dob && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full whitespace-nowrap">
                      {ordinal(age)} Birthday!
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500">Wish them a happy birthday! 🎉</p>
              </div>

              {/* Celebration Icon */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-sm">🎂</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ---------- FOOTER ---------- */}
      <div className="p-4 border-t border-gray-100 bg-blue-50 rounded-b-xl">
        <p className="text-xs text-gray-600 text-center">
          Send your wishes and make their day special! 🎉
        </p>
      </div>
    </motion.div>
  );
}

export default memo(Birthdays);

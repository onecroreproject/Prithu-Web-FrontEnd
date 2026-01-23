// src/components/Birthdays.jsx
import React, { memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cake, Gift, Calendar, Users, ChevronRight } from "lucide-react";
import api from "../api/axios";

/* --------------------------- 🔹 API CALL --------------------------- */
const fetchUpcomingBirthdays = async () => {
  const { data } = await api.get(`/api/get/user/birthday`);
  return data;
};

/* --------------------------- 🔹 Skeleton Loader --------------------------- */
const SkeletonBirthdayCard = () => (
  <div className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="space-y-2">
        <div className="h-5 w-40 bg-gray-200 rounded"></div>
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="h-3 w-24 bg-gray-200 rounded"></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-200"></div>
        </div>
      ))}
    </div>
  </div>
);

/* --------------------------- 🔹 Utility Functions --------------------------- */
const getOrdinalSuffix = (n) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatDate = (date) => {
  const d = new Date(date);
  const options = { month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-US', options);
};

const calculateAge = (birthDate) => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

/* --------------------------- 🔹 Main Component --------------------------- */
function Birthdays() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["upcoming-birthdays"],
    queryFn: fetchUpcomingBirthdays,
    staleTime: 600000,
  });

  /* ---------------------- Calculate birthdays ---------------------- */
  const { todaysBirthdays, upcomingBirthdays } = useMemo(() => {
    if (!data?.birthdays) {
      return { todaysBirthdays: [], upcomingBirthdays: [] };
    }

    const today = new Date();
    const todayMonth = today.getMonth() + 1;
    const todayDate = today.getDate();

    const todayBdays = [];
    const upcomingBdays = [];

    data.birthdays.forEach(person => {
      if (!person.dateOfBirth) return;
      
      const birthDate = new Date(person.dateOfBirth);
      const birthMonth = birthDate.getMonth() + 1;
      const birthDay = birthDate.getDate();
      
      // Check if birthday is today
      if (birthMonth === todayMonth && birthDay === todayDate) {
        todayBdays.push({
          ...person,
          isToday: true,
          age: calculateAge(person.dateOfBirth) + 1 // Turning age
        });
      } else {
        upcomingBdays.push({
          ...person,
          isToday: false,
          upcomingDate: new Date(today.getFullYear(), birthMonth - 1, birthDay),
          daysUntil: Math.ceil((new Date(today.getFullYear(), birthMonth - 1, birthDay) - today) / (1000 * 60 * 60 * 24))
        });
      }
    });

    // Sort upcoming birthdays by date
    upcomingBdays.sort((a, b) => a.daysUntil - b.daysUntil);

    return {
      todaysBirthdays: todayBdays,
      upcomingBirthdays: upcomingBdays.slice(0, 5) // Show only next 5
    };
  }, [data]);

  const totalBirthdays = todaysBirthdays.length + upcomingBirthdays.length;

  /* ---------------------- LOADING ---------------------- */
  if (isLoading) return <SkeletonBirthdayCard />;

  /* ---------------------- ERROR ---------------------- */
  if (isError)
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6 text-center"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 rounded-xl mb-3">
          <Cake className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-sm text-red-500 font-medium">
          {error?.message || "Error fetching birthdays"}
        </p>
      </motion.div>
    );

  /* ---------------------- EMPTY STATE ---------------------- */
  if (totalBirthdays === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Cake className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Birthdays
            </h2>
          </div>
        </div>

        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-base font-medium text-gray-900 mb-2">
            No upcoming birthdays
          </h3>
          <p className="text-sm text-gray-500">
            Follow more users to celebrate their special days!
          </p>
        </div>
      </motion.div>
    );
  }

  /* --------------------------- 🔹 Render Component --------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
    >
      {/* ---------- HEADER ---------- */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
              <Cake className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Birthdays
              </h2>
              <p className="text-sm text-gray-500">
                {totalBirthdays} {totalBirthdays === 1 ? 'birthday' : 'birthdays'} in the next 60 days
              </p>
            </div>
          </div>
          {todaysBirthdays.length > 0 && (
            <div className="px-3 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 rounded-full">
              <span className="text-xs font-semibold text-amber-700">
                {todaysBirthdays.length} Today
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ---------- TODAY'S BIRTHDAYS ---------- */}
      {todaysBirthdays.length > 0 && (
        <div className="border-b border-gray-100">
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
              <h3 className="text-sm font-semibold text-gray-900">Celebrating Today 🎉</h3>
            </div>
            
            <div className="space-y-3">
              {todaysBirthdays.map((person, index) => (
                <motion.div
                  key={person._id || person.userId || index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-100 hover:from-yellow-100 hover:to-amber-100 transition-all duration-200 group cursor-pointer"
                >
                  {/* Avatar with Celebration Badge */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={
                        person.profileAvatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=3B82F6&color=fff`
                      }
                      className="w-11 h-11 rounded-full border-2 border-yellow-300 object-cover group-hover:border-yellow-400 transition-colors"
                      alt={person.name || person.userName}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=3B82F6&color=fff`;
                      }}
                    />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-sm">
                      <Gift className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>

                  {/* Person Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {person.name || person.userName}
                        {person.lastName && ` ${person.lastName}`}
                      </h3>
                      <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800 text-xs font-medium rounded-full whitespace-nowrap">
                        Turns {person.age}!
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <span className="text-yellow-500">🎂</span>
                      <span>Wish them a happy birthday!</span>
                    </p>
                  </div>

                  {/* Celebration Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-200 to-amber-300 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="text-sm">🎉</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- UPCOMING BIRTHDAYS ---------- */}
      {upcomingBirthdays.length > 0 && (
        <div className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-900">
              Coming Soon
            </h3>
          </div>

          <div className="space-y-4">
            {upcomingBirthdays.map((person, index) => (
              <motion.div
                key={person._id || person.userId || index}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 group cursor-pointer"
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      person.profileAvatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=6366F1&color=fff`
                    }
                    className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover group-hover:border-blue-300 transition-colors"
                    alt={person.name || person.userName}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name || 'User')}&background=6366F1&color=fff`;
                    }}
                  />
                  {person.daysUntil <= 7 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-[8px] text-white font-bold">{person.daysUntil}</span>
                    </div>
                  )}
                </div>

                {/* Person Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {person.name || person.userName}
                      {person.lastName && ` ${person.lastName}`}
                    </h3>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(person.dateOfBirth)}</span>
                    <span className="text-gray-300">•</span>
                    <span>
                      {person.daysUntil === 1 
                        ? 'Tomorrow' 
                        : person.daysUntil <= 7 
                          ? `${person.daysUntil} days`
                          : 'Next month'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ---------- FOOTER ---------- */}
      <div className="px-5 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
        <p className="text-xs text-gray-600 text-center">
          {todaysBirthdays.length > 0 
            ? "Send your wishes and make their day special! 🎉"
            : "Stay tuned for upcoming celebrations! 🎂"
          }
        </p>
      </div>
    </motion.div>
  );
}

export default memo(Birthdays);
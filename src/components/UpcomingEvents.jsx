// ✅ src/components/UpcomingEvents.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import { CalendarDays, MapPin, Home, PartyPopper } from "lucide-react";
import excitedImage from "../assets/excited1.jpg"

export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch events from backend using userId and auth token
        const res = await api.get(`/api/get/upcomming/events`);

        if (res.data?.success && Array.isArray(res.data.events)) {
          setEvents(res.data.events);
        } else {
          setError("No upcoming events found near you.");
        }
      } catch (err) {
        console.error("❌ Error fetching events:", err);
        setError("Unable to fetch upcoming events.");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const handleGoHome = () => {
    navigate("/");
  };

  // 🧩 Skeleton loader
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1b1b1f] rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-gray-800 dark:text-gray-100">
            Your Upcoming Events
          </h3>
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="w-12 h-12 bg-purple-200 dark:bg-purple-900 rounded-xl"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // ⚠️ Error or empty state
  if (error || events.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1b1b1f] rounded-2xl shadow-lg p-8 text-center border border-gray-100 dark:border-gray-800"
      >
        {/* Excited Human Image */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-32 h-32 mx-auto mb-6 relative"
        >
          <img
            src={excitedImage}
            alt="Excited person"
            className="w-full h-full rounded-full object-cover border-4 border-purple-200 dark:border-purple-800"
          />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-2"
          >
            <PartyPopper className="w-6 h-6 text-white" />
          </motion.div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-bold text-2xl text-gray-800 dark:text-gray-100 mb-3"
        >
          {error ? "Oops! No Events Yet" : "No Upcoming Events"}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 mb-6 text-lg"
        >
          {error || "Stay tuned for exciting events coming your way! 🎉"}
        </motion.p>


      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white dark:bg-[#1b1b1f] rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800"
    >
      {/* Header with Home Button */}
      <div className="flex items-center justify-between mb-6">
        <motion.h3
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="font-bold text-2xl text-gray-800 dark:text-gray-100 flex items-center gap-3"
        >
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            🎪
          </motion.div>
          Your Upcoming Events
        </motion.h3>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleGoHome}
          className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="Go to Home"
        >
          <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </motion.button>
      </div>

      {/* Events List */}
      <ul className="relative">
        <AnimatePresence>
          {events.map((event, index) => (
            <motion.li
              key={event.id || index}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 10 }}
              className="flex items-start gap-4 relative group p-4 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-300"
            >
              {/* Timeline Line */}
              {index < events.length - 1 && (
                <div
                  className="absolute left-6 top-14 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-transparent dark:from-purple-700 dark:to-transparent -z-10"
                  style={{ height: "calc(100% - 3.5rem)" }}
                />
              )}

              {/* Animated Icon */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
              >
                <CalendarDays className="w-6 h-6 text-white" />
              </motion.div>

              {/* Event Info */}
              <div className="flex-1">
                <motion.p
                  className="font-bold text-gray-900 dark:text-gray-100 text-lg leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                >
                  {event.name}
                </motion.p>

                <motion.p
                  className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4 text-purple-500" />
                  {event.venue}, {event.city}
                </motion.p>

                <motion.p
                  className="text-sm text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-2"
                >
                  <span className="text-purple-500">📅</span>
                  {event.date || "TBA"} • {event.time || "—"}
                </motion.p>

                {event.url && (
                  <motion.a
                    whileHover={{ x: 5 }}
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                  >
                    View Details
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </motion.a>
                )}
              </div>

              {/* Floating Animation Element */}
              <motion.div
                animate={{ 
                  y: [0, -5, 0],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.2
                }}
                className="absolute -right-2 -top-2 w-3 h-3 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center"
      >
        <motion.p
          className="text-gray-500 dark:text-gray-400 text-sm mb-4"
        >
          Ready for more excitement?
        </motion.p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGoHome}
          className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
        >
          Explore More Events
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
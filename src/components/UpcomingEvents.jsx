// ✅ src/components/UpcomingEvents.jsx
import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { CalendarDays, MapPin } from "lucide-react";


export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {

      try {
        setLoading(true);
        setError(null);

        // ✅ Fetch events from backend using userId and auth token
        const res = await api.get(
          `/api/get/upcomming/events`,
        );

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

  // 🧩 Skeleton loader
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1b1b1f] rounded-xl shadow p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Your Upcoming Events
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-9 h-9 bg-purple-300 rounded-full" />
              <div className="flex-1">
                <div className="h-3 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-2 w-1/2 bg-gray-100 dark:bg-gray-800 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ⚠️ Error or empty state
  if (error || events.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1b1b1f] rounded-xl shadow p-5 text-center">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
          Upcoming Events
        </h3>
        <p className="text-gray-500 text-sm">{error || "No upcoming events."}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1b1b1f] rounded-xl shadow p-5">
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">
        Your Upcoming Events
      </h3>

      <ul className="relative">
        {events.map((event, index) => (
          <li key={event.id || index} className="flex items-start gap-3 relative">
            {/* Timeline Line – connects icons */}
            {index < events.length - 1 && (
              <div
                className="absolute left-4.5 top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -z-10"
                style={{ height: "calc(100% - 2.5rem)" }}
              />
            )}

            {/* Purple Icon with Calendar */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center z-10">
              <CalendarDays className="w-5 h-5 text-white" />
            </div>

            {/* Event Info */}
            <div className="flex-1 pb-8">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-tight">
                {event.name}
              </p>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={12} className="text-purple-500" />
                {event.venue}, {event.city}
              </p>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                📅 {event.date || "TBA"} • {event.time || "—"}
              </p>

              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-medium text-purple-600 hover:text-purple-700"
                >
                  View Details →
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

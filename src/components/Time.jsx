import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import api from "../api/axios";

const WEATHER_BACKGROUNDS = {
  clear: "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?w=1200&q=80",
  clouds: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=80",
  rain: "https://images.unsplash.com/photo-1521207418485-99c705420785?w=1200&q=80",
  snow: "https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200&q=80",
  default: "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200&q=80",
};

const pad = (n) => (n < 10 ? `0${n}` : n);

const getFormattedDate = (date) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

function AnalogClock({ date }) {
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12 + minutes / 60;
  const minuteAngle = minutes * 6;
  const hourAngle = hours * 30;

  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="absolute top-4 right-4 z-20">
      <circle cx="38" cy="38" r="36" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      <line
        x1="38"
        y1="38"
        x2={38 + 16 * Math.sin((hourAngle * Math.PI) / 180)}
        y2={38 - 16 * Math.cos((hourAngle * Math.PI) / 180)}
        stroke="#23236A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="38"
        y1="38"
        x2={38 + 22 * Math.sin((minuteAngle * Math.PI) / 180)}
        y2={38 - 22 * Math.cos((minuteAngle * Math.PI) / 180)}
        stroke="#26Aeee"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function TimeWeather() {
  const [now, setNow] = useState(new Date());
  const [weather, setWeather] = useState(null);
  const [bgImage, setBgImage] = useState(WEATHER_BACKGROUNDS.default);

  // Update clock every second
  useEffect(() => {
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  // Fetch weather (and auto refresh every 5 min)
  useEffect(() => {
    let lat, lon;

    const fetchWeather = async () => {
      try {
        const loc = await api.get("/api/get/user/location");
        if (!loc.data?.data) return console.warn("No user location found");

        ({ latitude: lat, longitude: lon } = loc.data.data);

        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
        );
        console.log(res.data)
        const data = res.data;
        setWeather(data);

        const condition = data.weather[0].main.toLowerCase();
        if (condition.includes("clouds")) setBgImage(WEATHER_BACKGROUNDS.clouds);
        else if (condition.includes("rain")) setBgImage(WEATHER_BACKGROUNDS.rain);
        else if (condition.includes("clear")) setBgImage(WEATHER_BACKGROUNDS.clear);
        else if (condition.includes("snow")) setBgImage(WEATHER_BACKGROUNDS.snow);
        else setBgImage(WEATHER_BACKGROUNDS.default);
      } catch (err) {
        console.error("Error fetching weather:", err.message);
      }
    };

    fetchWeather();
    const refresh = setInterval(fetchWeather, 5 * 60 * 1000); // 5 min refresh
    return () => clearInterval(refresh);
  }, []);

  return (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="relative w-[230px] h-[230px] sm:w-[230px] sm:h-[230px] rounded-[16px] overflow-hidden shadow-xl flex flex-col items-center justify-center text-white"
    style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0 bg-black/40 z-0" />

    {/* Header Row — Clock (Left) + Weather (Right) */}
    <div className="flex items-center justify-between w-full px-4 mt-2 z-10">
      {/* Clock Left */}
      <AnalogClock date={now} />

      {/* Weather Right */}
      {weather ? (
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="text-right"
        >
          <div className="text-sm sm:text-sm font-semibold">{weather.name}</div>
          <div className="text-sm sm:text-sm font-bold">
            {Math.round(weather.main.temp)}°C
          </div>
          <div className="text-xs capitalize leading-tight">
            {weather.weather[0].description}
          </div>
        </motion.div>
      ) : (
        <div className="text-xs italic">Loading...</div>
      )}
    </div>

    {/* Time Center */}
    <motion.div
      key={now.getMinutes()}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="z-10 mt-4 text-[38px] font-bold drop-shadow-md tracking-wide"
    >
      {pad(now.getHours())}:{pad(now.getMinutes())}
    </motion.div>

    {/* Date Bottom */}
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="z-10 text-sm sm:text-base font-medium text-center mt-1"
    >
      {getFormattedDate(now)}
    </motion.div>
  </motion.div>
);

}

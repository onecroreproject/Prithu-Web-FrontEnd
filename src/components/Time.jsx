import React, { useEffect, useState } from "react";

// High-quality background images (replace with your own)
const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1507009091461-4e13c08e8257?w=1200&q=80", // Nature
  "https://images.unsplash.com/photo-1519389950470-47ba2d7c4f96?w=1200&q=80", // Tech
  "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80", // Abstract
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80", // City
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1200&q=80", // Office
];

function pad(n) {
  return n < 10 ? `0${n}` : n;
}

function getFormattedDate(date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function AnalogClock({ date }) {
  const minutes = date.getMinutes();
  const hours = date.getHours() % 12 + minutes / 60;
  const minuteAngle = minutes * 6;
  const hourAngle = hours * 30;

  return (
    <svg width="76" height="76" viewBox="0 0 76 76" className="absolute top-3 right-4 z-20">
      <circle cx="38" cy="38" r="36" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
      {/* Hour hand */}
      <line
        x1="38"
        y1="38"
        x2={38 + 16 * Math.sin((hourAngle * Math.PI) / 180)}
        y2={38 - 16 * Math.cos((hourAngle * Math.PI) / 180)}
        stroke="#23236A"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Minute hand */}
      <line
        x1="38"
        y1="38"
        x2={38 + 22 * Math.sin((minuteAngle * Math.PI) / 180)}
        y2={38 - 22 * Math.cos((minuteAngle * Math.PI) / 180)}
        stroke="#26Aeee"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Dots for numbers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x = 38 + 30 * Math.sin(angle);
        const y = 38 - 30 * Math.cos(angle);
        return <circle key={i} cx={x} cy={y} r="1.2" fill="#23236A" />;
      })}
      {/* Hour numbers */}
      {[3, 6, 9, 12].map((num) => {
        const angle = ((num - 3) * 30 * Math.PI) / 180;
        const x = 38 + 28 * Math.cos(angle);
        const y = 43 + 28 * Math.sin(angle);
        return (
          <text
            key={num}
            x={x}
            y={y}
            fontSize="7"
            fontWeight="bold"
            fill="#444"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {num}
          </text>
        );
      })}
    </svg>
  );
}

export default function Time() {
  const [now, setNow] = useState(new Date());
  const [bgIndex, setBgIndex] = useState(0);

  // Update time every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Background rotation every 20 seconds
  useEffect(() => {
    const id = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      className="w-[230px] h-[230px] p-4 rounded-[9px] shadow-2xl relative flex flex-col items-center justify-center overflow-hidden backdrop-blur-xl border border-white/20"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
        boxShadow: "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
      }}
    >
      {/* DYNAMIC BACKGROUND IMAGES */}
      {BACKGROUND_IMAGES.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === bgIndex ? 1 : 0,
            zIndex: -2,
          }}
        />
      ))}

      {/* BLUR + GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-[-1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-[-1]" />

      {/* ANALOG CLOCK */}
      <AnalogClock date={now} />

      {/* DIGITAL TIME */}
      <div className="relative z-10 mt-8 text-[38px] text-[#26Aeee9] font-bold leading-none tracking-wider drop-shadow-lg">
        {pad(now.getHours())}:{pad(now.getMinutes())}
      </div>

      {/* DATE */}
      <div
        className="relative z-10 text-center mt-2 text-[18px] leading-tight text-white font-semibold drop-shadow-md"
        style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}
      >
        {getFormattedDate(now).split(",")[0]},{" "}
        {getFormattedDate(now).split(",")[1]}
        <br />
        {now.getFullYear()}
      </div>
    </div>
  );
}
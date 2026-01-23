import React from "react";
import { buttons } from "./constants";

export default function LeftSidebarButtons({ selectedBtn, onSelect }) {
  return (
    <div className="w-60 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {buttons.slice(0, 6).map((btn, i) => (
          <button
            key={i}
            onClick={() => onSelect(btn.type)}
            className={`flex items-center gap-2 text-sm bg-[#F2F4F7] text-[#5D5D5D]
              hover:bg-blue-100 py-2 pl-4 pr-1 rounded-lg transition-all
              ${selectedBtn === btn.type ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}
          >
            <span className="text-lg">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {buttons.slice(6).map((btn, i) => (
          <button
            key={i}
            onClick={() => onSelect(btn.type)}
            className={`flex items-center gap-2 text-sm bg-[#F2F4F7] text-[#5D5D5D]
              hover:bg-blue-100 py-2 pl-4 pr-1 rounded-lg transition-all
              ${selectedBtn === btn.type ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}
          >
            <span className="text-lg">{btn.icon}</span>
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

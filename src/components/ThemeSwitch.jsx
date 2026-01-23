import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeSwitch = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="px-4 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition"
    >
      {theme === "light" ? "🌞 Light Mode" : "🌙 Dark Mode"}
    </button>
  );
};

export default ThemeSwitch;

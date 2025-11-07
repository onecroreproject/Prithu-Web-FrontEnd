/* ✅ src/components/ThemeToggle.jsx */
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm
                 border-gray-200 bg-white text-gray-700 hover:bg-gray-50
                 dark:border-gray-700 dark:bg-[#1e1e28] dark:text-gray-200 dark:hover:bg-[#242433]
                 transition-colors"
      aria-label="Toggle theme"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
      <span className="hidden sm:inline">{dark ? "Light" : "Dark"} mode</span>
    </button>
  );
}

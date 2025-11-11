// ✅ src/app/Layout.jsx
import Header from "./Header";
import Feed from "../pages/Feed";
import UpcomingEvents from "./UpcomingEvents";
import Birthdays from "./Birthdays";
import JobCard from "./jobCard";
import LeftColumn from "./LeftColumn";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();

  const fullWidthPaths = ["/search", "/profile", "/reels"];
  const isFullWidth = fullWidthPaths.includes(location.pathname);
  const isHome = location.pathname === "/";
  const showColumns = !isFullWidth && isHome;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      {/* 🧭 Fixed Header */}
      <Header />

      {/* 🧱 Main Container */}
      <main className="flex-1 pt-[88px] px-2 sm:px-4 md:px-6 w-full max-w-[1550px] mx-auto">
        <div className="flex gap-4 md:gap-6">
          {/* 🧩 LEFT COLUMN */}
          {showColumns && (
            <aside className="hidden mt-5 lg:flex w-[220px] flex-shrink-0">
              <LeftColumn />
            </aside>
          )}

          {/* 🏠 CENTER CONTENT */}
          <section
            className={`flex-1 min-w-0 ${
              isFullWidth || !isHome ? "" : "max-w-2xl mx-auto"
            }`}
          >
            {isHome ? <Feed /> : <Outlet />}
          </section>

          {/* 🧩 RIGHT COLUMN */}
          {showColumns && (
            <aside className="hidden xl:flex gap-2 w-[600px] flex-shrink-0">
              <div className="w-[250px] mt-6 flex flex-col gap-3">
                <UpcomingEvents />
                <Birthdays />
              </div>
              <div className="flex-1 min-w-[280px]">
                <JobCard />
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* 📱 Mobile Bottom Nav Placeholder */}
      <div className="lg:hidden" />

      {/* 🎨 Scrollbar Styling */}
      <style>
        {`
          html {
            scrollbar-width: thin;
            scrollbar-color: rgba(136, 136, 136, 0.5) transparent;
          }
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          ::-webkit-scrollbar-thumb {
            background-color: rgba(136, 136, 136, 0.4);
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background-color: rgba(136, 136, 136, 0.6);
          }
        `}
      </style>
    </div>
  );
}

// ✅ src/app/Layout.jsx
import Header from "./Header";
import Feed from "../pages/Feed";
import Birthdays from "./Birthdays";
import { Outlet, useLocation } from "react-router-dom";
import LeftColumn from "./LeftColumn";

import JobTopRolesCard from "./Jobs/JobCardComponets/topRoles";
import JobLatestOpeningsCard from "./Jobs/JobCardComponets/latestOpenings";
import JobFeaturedCompaniesCard from "./Jobs/JobCardComponets/featureCompanies";

export default function Layout() {
  const location = useLocation();

  const fullWidthPaths = ["/search", "/profile", "/reels"];
  const isFullWidth = fullWidthPaths.includes(location.pathname);
  const isHome = location.pathname === "/";
  const showColumns = !isFullWidth && isHome;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      {/* -------------------- Fixed Header -------------------- */}
      <Header />

      {/* -------------------- Main Scrollable Content -------------------- */}
      <main className="flex-1 pt-20 px-4 w-full max-w-[1400px] mx-auto">
        <div className="flex gap-3 pb-20 lg:pb-0">
          
          {/* -------------------- LEFT COLUMN (280px) -------------------- */}
          {showColumns && (
            <aside className="hidden lg:flex w-[280px] flex-shrink-0 mt-3">
              <LeftColumn />
            </aside>
          )}

          {/* -------------------- CENTER FEED -------------------- */}
          <section
            className={`flex-1 min-w-0 ${
              isFullWidth || !isHome ? "" : "w-full"
            }`}
          >
            {isHome ? <Feed /> : <Outlet />}
          </section>

          {/* -------------------- RIGHT COLUMN (280px) -------------------- */}
          {showColumns && (
            <aside className="hidden xl:flex w-[280px] flex-shrink-0 mt-3">
              <div className="flex flex-col gap-4 w-full">
                <Birthdays />
                <JobTopRolesCard />
                <JobLatestOpeningsCard />
                <JobFeaturedCompaniesCard />
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* -------------------- Mobile Bottom Nav Placeholder -------------------- */}
      <div className="lg:hidden"></div>

      {/* -------------------- Scrollbar Styling -------------------- */}
      <style>
        {`
          html {
            scrollbar-width: thin;
            scrollbar-color: rgba(136, 136, 136, 0.6) transparent;
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

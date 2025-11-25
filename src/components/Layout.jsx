// ✅ src/app/Layout.jsx
import Header from "./Header";
import Feed from "../pages/Feed";
import Birthdays from "./Birthdays";
import { Outlet, useLocation, useParams } from "react-router-dom";
import LeftColumn from "./LeftColumn";
import JobTopRolesCard from "./Jobs/JobCardComponets/topRoles";
import JobLatestOpeningsCard from "./Jobs/JobCardComponets/latestOpenings";
import JobFeaturedCompaniesCard from "./Jobs/JobCardComponets/featureCompanies";

export default function Layout() {
  const location = useLocation();
  const params = useParams();

  // Get tagname from URL: /hashtag/:tagname
  const tagname = params.tagname || null;

  // For notification route: /retrivefeed/:notifyfeedid
  const notifyfeedid = params.notifyfeedid || null;

  // full-width pages (no side columns)
  const fullWidthPaths = ["/search", "/profile", "/reels"];
  const isFullWidth = fullWidthPaths.includes(location.pathname);

  // Home page or hashtag page or retrivefeed page
  const isRetrieveFeed = location.pathname.startsWith("/retrivefeed");
  const isHashtagPage = location.pathname.startsWith("/hashtag/");
  const isHome = location.pathname === "/" || isRetrieveFeed || isHashtagPage;

  const showColumns = !isFullWidth && isHome;

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />

      <main className="flex-1 pt-20 px-4 w-full max-w-[1400px] mx-auto">
        <div className="flex gap-3 pb-20 lg:pb-0">

          {/* LEFT COLUMN */}
          {showColumns && (
            <aside className="hidden lg:flex w-[280px] flex-shrink-0 mt-3">
              <LeftColumn />
            </aside>
          )}

          {/* CENTER FEED */}
          <section className="flex-1 min-w-0">
            {isHashtagPage ? (
              <Feed tagname={tagname} />
            ) : isRetrieveFeed ? (
              <Feed notifyfeedid={notifyfeedid} />
            ) : location.pathname === "/" ? (
              <Feed />
            ) : (
              <Outlet />
            )}
          </section>

          {/* RIGHT COLUMN */}
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
    </div>
  );
}

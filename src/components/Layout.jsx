// ✅ src/app/Layout.jsx
import Header from "./homeHeader";
import Feed from "../pages/Feed";
import Birthdays from "./Birthdays";
import { Outlet, useLocation, useParams } from "react-router-dom";
import LeftColumn from "./LeftColumn";
import { Skeleton, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TagIcon from "@mui/icons-material/Tag";
import JobTopRolesCard from "./Jobs/JobCardComponets/topRoles";
import JobLatestOpeningsCard from "./Jobs/JobCardComponets/latestOpenings";
import JobFeaturedCompaniesCard from "./Jobs/JobCardComponets/featureCompanies";
import { useNavigate } from "react-router-dom";
import TopAptitudePerformace from "./topAptitudePerformace";

export default function Layout() {
  const location = useLocation();
  const params = useParams();
  const navigate=useNavigate();
  // Get tagname from URL: /hashtag/:tagname
  const tagname = params.tagname || null;

  // For notification route: /retrivefeed/:notifyfeedid
  const notifyfeedid = params.notifyfeedid || null;

  // full-width pages (no side columns)
  const fullWidthPaths = ["/search", "/profile", "/reels", "/explore", "/messages", "/notifications", "/saved", "/events", "/community", "/aptitude", "/activity", "/settings"];
  const isFullWidth = fullWidthPaths.some(path => location.pathname.startsWith(path));

  // Home page or hashtag page or retrivefeed page
  const isRetrieveFeed = location.pathname.startsWith("/retrivefeed");
  const isHashtagPage = location.pathname.startsWith("/hashtag/");
  const isHome = location.pathname === "/home" || isRetrieveFeed || isHashtagPage;

  const showRightColumn = !isFullWidth && isHome;

  const handleBackClick = () => {
    navigate("/home");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#121212]">
      <Header />
          
      {/* ⭐ HASHTAG HEADER SECTION */}
      {isHashtagPage && (
        <div className="sticky top-0 lg:top-0 lg:left-[280px] z-40 bg-white h-20 shadow-sm rounded-xl mb-6 p-4 ml-0 lg:ml-[280px]">
          <div className="flex items-center gap-3">
            <IconButton 
              onClick={handleBackClick} 
              className="hover:bg-gray-100"
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-full">
                <TagIcon className="text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  #{tagname}
                </h1>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 pt-0 lg:pt-0  w-full">
        <div className="flex pb-20 lg:pb-0 lg:ml-[280px]">
          {/* CENTER FEED */}
          <section className="flex-1 min-w-0 px-2 ">
            {isHashtagPage ? (
              <Feed tagname={tagname} />
            ) : isRetrieveFeed ? (
              <Feed notifyfeedid={notifyfeedid} />
            ) : location.pathname === "/home" ? (
              <Feed />
            ) : (
              <Outlet />
            )}
          </section>

          {/* RIGHT COLUMN - Now includes LeftColumn at the top */}
          {showRightColumn && (
            <aside className="hidden xl:flex w-[350px] mt-2 flex-shrink-0 mr-4"> {/* Added mr-4 for right margin */}
              <div className="flex flex-col w-[350px] gap-4 ">
                {/* LeftColumn moved here - above Birthdays */}
                <LeftColumn />
                
                {/* Hide Birthdays on hashtag pages */}
                {!isHashtagPage && <Birthdays />}
                <JobTopRolesCard />
                <JobLatestOpeningsCard />
                <JobFeaturedCompaniesCard />
                <TopAptitudePerformace/>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
}
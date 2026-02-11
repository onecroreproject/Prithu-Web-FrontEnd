// ✅ src/app/Layout.jsx
import Header from "./homeHeader";
import Feed from "../pages/Feed";
import Birthdays from "./Birthdays";
import { Outlet, useLocation, useParams } from "react-router-dom";
import LeftColumn from "./LeftColumn";
import { Skeleton, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TagIcon from "@mui/icons-material/Tag";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";

export default function Layout() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Track mobile menu state
  const [viewMode, setViewMode] = useState("grid"); // Lifted from Feed.jsx
  // Get tagname from URL: /hashtag/:tagname
  const tagname = params.tagname || null;

  // For notification route: /retrivefeed/:notifyfeedid
  const notifyfeedid = params.notifyfeedid || null;

  // full-width pages (no side columns)
  const fullWidthPaths = ["/search", "/profile", "/reels", "/explore", "/messages", "/notifications", "/saved", "/activity", "/settings"];
  const isFullWidth = fullWidthPaths.some(path => location.pathname.startsWith(path));

  // Home page or hashtag page or retrivefeed page
  const isRetrieveFeed = location.pathname.startsWith("/retrivefeed");
  const isHashtagPage = location.pathname.startsWith("/hashtag/");
  const isHome = location.pathname === "/home" || isRetrieveFeed || isHashtagPage;

  const shouldSidebarStayExpanded = isHome && viewMode !== 'grid';
  const showRightColumn = !isFullWidth && isHome && viewMode !== 'grid';

  const handleBackClick = () => {
    navigate("/home");
  };


  useEffect(() => {
    let timer;

    const onScroll = () => {
      document.body.classList.add("scrolling");

      clearTimeout(timer);
      timer = setTimeout(() => {
        document.body.classList.remove("scrolling");
      }, 1200); // idle delay
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex flex-col bg-white dark:bg-[#121212] min-h-screen">

      <Header
        onSidebarHoverChange={setIsSidebarHovered}
        isHome={shouldSidebarStayExpanded}
        onMobileMenuToggle={setIsMobileMenuOpen}
      />

      {/* ⭐ HASHTAG HEADER SECTION */}
      {isHashtagPage && (
        <div className={`sticky top-14 lg:top-0 z-40 bg-white h-20 shadow-sm rounded-xl mb-6 p-4 transition-all duration-300 ${(isSidebarHovered || shouldSidebarStayExpanded) ? "lg:ml-[280px]" : "lg:ml-[80px]"}`}>
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

      <main className="flex-1 w-full pt-14 lg:pt-0">
        <div className={`flex pb-20 lg:pb-0 transition-all duration-300 ${(isSidebarHovered || shouldSidebarStayExpanded) ? "lg:ml-[280px]" : "lg:ml-[80px]"}`}>
          <section className="flex-1 min-w-0 px-0 sm:px-2">
            {isHashtagPage ? (
              <Feed tagname={tagname} viewMode={viewMode} setViewMode={setViewMode} />
            ) : isRetrieveFeed ? (
              <Feed notifyfeedid={notifyfeedid} viewMode={viewMode} setViewMode={setViewMode} />
            ) : location.pathname === "/home" ? (
              <Feed viewMode={viewMode} setViewMode={setViewMode} />
            ) : (
              <Outlet context={{ viewMode, setViewMode }} />
            )}
          </section>

          {showRightColumn && (
            <aside className="hidden xl:flex w-[350px] mt-2 flex-shrink-0 mr-4">
              <div className="flex flex-col w-[350px] gap-4">
                <LeftColumn />
                {/* {!isHashtagPage && <Birthdays />} */}
              </div>
            </aside>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hide when mobile menu is open */}
      {!isMobileMenuOpen && <BottomNav />}
    </div>
  );
}

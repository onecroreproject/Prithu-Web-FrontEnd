// src/app/Layout.jsx
import Header from './Header';
import Feed from './Feed';
import UpcomingEvents from './UpcomingEvents';
import Birthdays from './Birthdays';
import CommunityChats from './CommunityChats';
import LeftColumn from './LeftColumn';
import { Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();

  const fullWidthPaths = ['/search', '/profile', '/reels'];
  const isFullWidth = fullWidthPaths.includes(location.pathname);
  const isHome = location.pathname === '/';
  const showColumns = !isFullWidth && isHome;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Fixed Header */}
      <Header />

      {/* Main Scrollable Area (One Single Scroll) */}
      <div className="flex-1 pt-20 px-4 w-full max-w-[1400px] mx-auto overflow-y-auto scrollbar-hide">
        <div className="flex gap-6 pb-20 lg:pb-0">
          
          {/* LEFT COLUMN – SCROLLABLE (Same scroll as Feed) */}
          {showColumns && (
            <div className="hidden lg:flex w-[220px] flex-shrink-0">
              <LeftColumn />
            </div>
          )}

          {/* CENTER: Feed or Page */}
          <div
            className={`flex-1 min-w-0 ${
              isFullWidth || !isHome ? '' : 'max-w-2xl mx-auto'
            }`}
          >
            {isHome ? <Feed /> : <Outlet />}
          </div>

          {/* RIGHT COLUMN – SCROLLABLE (Same scroll) */}
          {showColumns && (
            <div className="hidden xl:flex gap-4 w-[470px] flex-shrink-0">
              <div className="w-[250px] flex flex-col gap-4">
                <UpcomingEvents />
                <Birthdays />
              </div>
              <div className="w-[220px]">
                <CommunityChats />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        {/* Replace with MobileNav if needed */}
      </div>

      {/* Hide Scrollbar */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
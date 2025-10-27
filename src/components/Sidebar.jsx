// import React, { useContext, useEffect } from "react";
// import { NavLink, useNavigate } from "react-router-dom";
// import { Home, Search, Video, BellRing, User, Gift, Settings, LogOut } from "lucide-react";
// import { AuthContext } from "../../context/AuthContext";

// const navItems = [
//   { to: "/", label: "Home", Icon: Home },
//   { to: "/search", label: "Search", Icon: Search },
//   { to: "/reels", label: "Reels", Icon: Video },
//   { to: "/subscriptions", label: "Subscriptions", Icon: BellRing },
//   { to: "/profile", label: "Profile", Icon: User },
//   { to: "/referral", label: "Referral", Icon: Gift },
//   { to: "/settings", label: "Settings", Icon: Settings },
// ];

// const Sidebar = () => {
//   const navigate = useNavigate();
//   const { user, logout, fetchUserProfile, token } = useContext(AuthContext);

//   useEffect(() => {
//     if (token && !user) fetchUserProfile();
//   }, [token, user, fetchUserProfile]);

//   const handleSignOut = () => logout();

//   return (
//     <>
//       {/* Desktop Sidebar */}
//       <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-md border-r border-gray-200 z-40">
//         {/* ✅ Removed logo block */}

//         {/* Navigation */}
//         <nav className="flex-1 px-2 py-4 space-y-2 overflow-y-auto">
//           {navItems.map(({ to, label, Icon }) => (
//             <NavLink
//               key={to}
//               to={to}
//               className={({ isActive }) =>
//                 `flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-all duration-300 ${
//                   isActive
//                     ? "bg-gradient-to-r from-green-500 to-yellow-400 text-white shadow-md"
//                     : "text-gray-700 hover:text-green-600 hover:bg-gray-100"
//                 }`
//               }
//             >
//               <Icon className="w-5 h-5" />
//               <span>{label}</span>
//             </NavLink>
//           ))}
//         </nav>

//         {/* Profile & Logout */}
//         <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
//           <div
//             className="flex items-center gap-2 cursor-pointer"
          
//           >
            
//             <div>
//               <h1 className="text-sm font-medium">{"Logout"}</h1>
//             </div>
//           </div>
//           <LogOut
//             onClick={handleSignOut}
//             className="w-5 h-5 text-gray-400 hover:text-gray-700 cursor-pointer transition"
//           />
//         </div>
//       </aside>

//       {/* Mobile Bottom Navbar */}
//       <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-2 shadow-md z-50">
//         {navItems.map(({ to, Icon }) => (
//           <NavLink
//             key={to}
//             to={to}
//             className={({ isActive }) =>
//               `flex flex-col items-center transition duration-300 ${
//                 isActive ? "text-green-600" : "text-gray-600 hover:text-yellow-500"
//               }`
//             }
//           >
//             <Icon className="w-6 h-6" />
//           </NavLink>
//         ))}
//       </nav>
//     </>
//   );
// };

// export default Sidebar;

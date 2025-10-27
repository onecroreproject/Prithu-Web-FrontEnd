// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import {
//   User,
//   Bell,
//   Shield,
//   Settings as Cog,
//   Info,
//   Bookmark,
//   Layout,
//   Sun,
//   CreditCard,
//   Users,
//   Box,
//   LogOut,
// } from "lucide-react";

// const settingsItems = [
//   { title: "Account Type", icon: <User /> },
//   { title: "Notification", icon: <Bell /> },
//   { title: "Security", icon: <Shield /> },
//   { title: "Account", icon: <Cog /> },
//   { title: "About", icon: <Info /> },
//   { title: "Save", icon: <Bookmark />, route: "saved-posts" },
//   { title: "Feed", icon: <Layout /> },
//   { title: "Theme", icon: <Sun /> },
//   { title: "Payment", icon: <CreditCard /> },
//   { title: "Referral", icon: <Users /> },
//   { title: "Subscription", icon: <Box />, route: "subscription-details" },
//   { title: "Invite Friends", icon: <Users /> },
//   { title: "Logout", icon: <LogOut />, highlight: true },
// ];

// const LeftSidebar = () => {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const isSettingsPage = location.pathname.startsWith("/settings");

//   return (
//     <div className="w-64 bg-white border-r border-gray-200 h-screen p-4 hidden lg:flex flex-col fixed left-0 top-0 overflow-y-auto">
      
//       {/* SETTINGS PAGE MENU */}
//       {isSettingsPage ? (
//         <>
//           <h2 className="font-bold text-lg mb-4">Settings</h2>
//           <div className="space-y-2">
//             {settingsItems.map((item, idx) => {
//               const isActive = location.pathname.includes(item.route);

//               return (
//                 <button
//                   key={idx}
//                   className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition ${
//                     item.highlight
//                       ? "text-red-600 font-semibold"
//                       : isActive
//                       ? "bg-gray-200 text-gray-900 font-semibold"
//                       : "text-gray-700 hover:bg-gray-100"
//                   }`}
//                   onClick={() => {
//                     if (item.route) navigate(item.route);
//                     else console.log(`${item.title} clicked`);
//                   }}
//                 >
//                   <div className="flex items-center gap-3">
//                     {item.icon}
//                     <span className="font-medium">{item.title}</span>
//                   </div>
//                   {!item.highlight && (
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-4 w-4 text-gray-400"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M9 5l7 7-7 7"
//                       />
//                     </svg>
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </>
//       ) : (
//         <>
//           {/* OTHER PAGES: Show Suggestions */}
//           <h2 className="font-bold text-lg mb-4">Suggestions For You</h2>
//           <div className="space-y-4">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <img
//                     src={`https://i.pravatar.cc/40?img=${i + 20}`}
//                     alt="suggestion"
//                     className="w-10 h-10 rounded-full"
//                   />
//                   <p className="font-medium text-sm">User {i + 20}</p>
//                 </div>
//                 <button className="text-blue-500 text-sm font-semibold">Follow</button>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default LeftSidebar;

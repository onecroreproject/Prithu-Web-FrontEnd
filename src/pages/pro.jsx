// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaGift, FaCrown, FaUserPlus } from "react-icons/fa";
// import { useAuth } from "../../context/AuthContext";
// import axios from "../api/axios"; // make sure axios instance points to your backend

// const ProfilePage = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [showFollowing, setShowFollowing] = useState(false);
//   const [followingList, setFollowingList] = useState([]);
//   const [followingCount, setFollowingCount] = useState(user?.followingCount || 0);
//   const [loadingFollowing, setLoadingFollowing] = useState(false);

//   const accountOptions = [
//     { label: "My Profile", icon: "👤", path: "/edit-profile" },
//     { label: "Referral Dashboard", icon: <FaGift className="text-green-500" />, path: "/referrals" },
//     { label: "Subscription", icon: <FaCrown className="text-orange-500" />, path: "/subscription" },
//     { label: "Invite Friends", icon: <FaUserPlus className="text-pink-500" />, path: "/invite" },
//   ];

//   // Fetch following list and count on page load
//   useEffect(() => {
//     const fetchFollowing = async () => {
//       try {
//         const res = await api.get("/api/user/following/data");
//         const list = res.data?.data?.followers || [];
//         const count = res.data?.data?.followersCount || 0;
//         setFollowingList(list);
//         setFollowingCount(count);
//       } catch (err) {
//         console.error("Failed to fetch following list on mount", err);
//       }
//     };

//     fetchFollowing();
//   }, []);

//   // Toggle following list visibility and fetch if opening
//   const toggleFollowing = async () => {
//     setShowFollowing(prev => !prev);

//     if (!showFollowing) {
//       try {
//         setLoadingFollowing(true);
//         const res = await api.get("/api/user/following/data");
//         const list = res.data?.data?.followers || [];
//         const count = res.data?.data?.followersCount || 0;
//         setFollowingList(list);
//         setFollowingCount(count);

//         console.log("Fetched following list:", list);
//         console.log("Fetched following count:", count);
//       } catch (err) {
//         console.error("Failed to fetch following list", err);
//       } finally {
//         setLoadingFollowing(false);
//       }
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex flex-col items-center">

//       {/* Top Section */}
//       <div className="w-full bg-[#0B1B3F] flex flex-col items-center py-16 relative">
//         {/* Avatar */}
//         <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-white flex items-center justify-center bg-gray-300 text-white text-7xl">
//           {user?.profileAvatar ? (
//             <img
//               src={user.profileAvatar}
//               alt={user.displayName || "User"}
//               className="w-full h-full object-cover"
//             />
//           ) : "👤"}
//         </div>

//         <h1 className="text-3xl font-bold text-white">{user?.displayName || "userName"}</h1>

//         {/* Following Count */}
//         <div
//           onClick={toggleFollowing}
//           className="absolute bottom-0 -translate-y-1/2 bg-white bg-opacity-90 px-6 py-2 rounded-full shadow-md cursor-pointer hover:bg-opacity-100 transition text-gray-800 font-medium"
//         >
//           {followingCount} Following
//         </div>
//       </div>

//       {/* Account Overview */}
//       <div className="w-full max-w-md mt-12 bg-white rounded-xl shadow-md overflow-hidden z-10">
//         <div className="px-6 py-4 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-800">Account Overview</h2>
//         </div>
//         <div className="flex flex-col divide-y divide-gray-200">
//           {accountOptions.map((option) => (
//             <button
//               key={option.label}
//               onClick={() => navigate(option.path)}
//               className="flex items-center gap-4 px-6 py-4 text-gray-700 font-medium hover:bg-gray-50 transition"
//             >
//               <span className="text-xl">{option.icon}</span>
//               <span className="flex-1">{option.label}</span>
//               <span className="text-gray-400 font-semibold">&gt;</span>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Following List */}
//       {showFollowing && (
//         <div className="w-full max-w-md mt-4 bg-white rounded-xl shadow-md p-4">
//           {loadingFollowing ? (
//             <p className="text-gray-500 text-center">Loading...</p>
//           ) : followingList.length > 0 ? (
//             followingList.map((f) => (
//               <div key={f._id} className="flex items-center gap-4 py-2">
//                 <img
//                   src={f.avatar || "https://i.pravatar.cc/40"}
//                   alt={f.name}
//                   className="w-10 h-10 rounded-full"
//                 />
//                 <span className="flex-1">{f.name}</span>
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500 text-center">Not following anyone yet</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProfilePage;

// import React, { useState } from 'react';
// import { MessageSquare, User, Star, Users, UserPlus, Megaphone, Search, MessageCircle, MoreHorizontal } from 'lucide-react';

// const TabNavigation = () => {
//   const [activeTab, setActiveTab] = useState('personal');

//   const tabs = [
//     { id: 'personal', icon: MessageSquare, label: 'Personal', badge: null },
//     { id: 'profile', icon: User, label: 'Profile', badge: null },
//     { id: 'friends', icon: UserPlus, label: 'Friends', badge: null },
//     { id: 'groups', icon: Users, label: 'Groups', badge: 3 },
//     { id: 'adverts', icon: Megaphone, label: 'Adverts', badge: 1 },
//     { id: 'forums', icon: MessageCircle, label: 'Forums', badge: 5 },
//     { id: 'more', icon: MoreHorizontal, label: 'More', badge: null },
//   ];

//   return (
//     <div className="bg-white rounded-lg shadow-sm mb-4">
//       <div className="flex items-center border-b border-gray-200 overflow-x-auto">
//         {tabs.map((tab) => {
//           const Icon = tab.icon;
//           return (
//             <button
//               key={tab.id}
//               onClick={() => setActiveTab(tab.id)}
//               className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all whitespace-nowrap ${
//                 activeTab === tab.id
//                   ? 'border-purple-600 text-purple-600'
//                   : 'border-transparent text-gray-600 hover:text-gray-900'
//               }`}
//             >
//               <Icon size={20} />
//               <span className="font-medium">{tab.label}</span>
//               {tab.badge && (
//                 <span className="ml-1 px-2 py-0.5 bg-purple-100 text-purple-600 text-xs font-semibold rounded-full">
//                   {tab.badge}
//                 </span>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* Sub Navigation */}
//       <div className="flex items-center gap-6 px-6 py-3 border-b border-gray-200 text-sm">
//         <button className="font-semibold text-purple-600 border-b-2 border-purple-600 pb-3 -mb-3">
//           Personal
//         </button>
//         <button className="text-gray-600 hover:text-gray-900">Mentions</button>
//         <button className="text-gray-600 hover:text-gray-900">Favorites</button>
//         <button className="text-gray-600 hover:text-gray-900">Friends</button>
//         <button className="text-gray-600 hover:text-gray-900">Groups</button>
//       </div>
//     </div>
//   );
// };

// export default TabNavigation;

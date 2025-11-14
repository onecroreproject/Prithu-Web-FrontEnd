// import React from "react";
// import { Lock, Unlock } from "lucide-react";
// import {Star} from "lucide-react";
// const ReferralPage = () => {
//   // Example data, replace with dynamic values as needed
//   const totalEarned = 15000;
//   const availableBalance = 14000;
//   const redeemedBalance = 1000;
//   const totalSignedUp = 2;
//   const totalInvested = 0;
//   const tier = 1; // Current unlocked tier
//   const referralsForNextTier = 1; // To unlock Tier 2

//   return (
//     <div className="min-h-screen flex justify-center items-start bg-gray-100 px-4 py-10">
//       <div className="w-full max-w-4xl">
//         {/* Rewards Card */}
//         <div className="bg-white rounded-2xl shadow p-6 mb-5">
//           <h1 className="text-2xl font-semibold text-gray-700 mb-4">
//             Referral Dashboard
//           </h1>

//           {/* Rewards Summary */}
//           <div className="bg-gray-50 p-6 rounded-xl mb-6 flex flex-col items-center">
//             <div className="text-sm font-medium text-gray-500 mb-1">
//               Total Rewards Earned
//             </div>
//             <div className="text-4xl font-bold text-green-700 mb-4">
//               ₹{totalEarned.toLocaleString()}
//             </div>
//             <div className="flex justify-between w-full mb-4 text-gray-600">
//               <div>
//                 <div className="text-sm">Available balance</div>
//                 <div className="font-semibold">
//                   ₹{availableBalance.toLocaleString()}
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="text-sm">Redeemed balance</div>
//                 <div className="font-semibold">
//                   ₹{redeemedBalance.toLocaleString()}
//                 </div>
//               </div>
//             </div>
//             <button className="w-full py-2 rounded bg-gradient-to-r from-yellow-400 to-green-500 text-white font-bold hover:opacity-90 transition">
//               Redeem Now
//             </button>
//           </div>

//           {/* Stats */}
//           <div className="grid grid-cols-2 gap-4 mb-6">
//             <div className="bg-gray-50 rounded-xl p-4 text-center">
//               <div className="text-sm text-gray-500 mb-1">
//                 Total friends who signed up
//               </div>
//               <div className="text-xl font-bold text-green-600">
//                 {totalSignedUp.toString().padStart(2, "0")}
//               </div>
//             </div>
//             <div className="bg-gray-50 rounded-xl p-4 text-center">
//               <div className="text-sm text-gray-500 mb-1">
//                 Total friends who invested
//               </div>
//               <div className="text-xl font-bold text-green-600">
//                 {totalInvested.toString().padStart(2, "0")}
//               </div>
//             </div>
//           </div>

//           <div className="flex justify-between mb-6">
//             <button className="py-1 px-4 bg-gray-200 rounded text-sm font-medium hover:bg-gray-300 transition">
//               Nudge All
//             </button>
//             <button className="py-1 px-4 bg-green-100 rounded text-sm font-medium text-green-700 hover:bg-green-200 transition">
//               Refer more friends
//             </button>
//           </div>

//           {/* Tier Progress Card */}
//           <div className="bg-gradient-to-r from-yellow-300 to-green-400 rounded-2xl p-6 text-gray-800 mb-6">
//             <div className="mb-4 flex items-center">
//               <div className="bg-white-700 text-black rounded px-3 py-1 text-sm font-medium mr-2">
//                 You're here
//               </div>
//               <div className="font-bold text-lg">Tier {tier}</div>
//             </div>

//             {/* Progress Bar with Steps */}
//             <div className="relative mb-6">
//               {/* Progress Line */}
//               <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2"></div>
//               <div
//                 className="absolute top-1/2 left-0 h-1 bg-green-600 -translate-y-1/2 transition-all"
//                 style={{ width: `${(tier / 3) * 100}%` }}
//               ></div>

//               {/* Tiers */}
//               <div className="flex justify-between relative z-10">
//                 {/* Tier 1 */}
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
//                       tier >= 1 ? "bg-green-600 text-white" : "bg-gray-300"
//                     }`}
//                   >
//                     {tier >= 1 ? <Unlock size={18} /> : <Lock size={18} />}
//                   </div>
//                   <span className="text-xs mt-1">Tier 1</span>
//                 </div>

//                 {/* Tier 2 */}
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
//                       tier >= 2 ? "bg-green-600 text-white" : "bg-gray-300"
//                     }`}
//                   >
//                     {tier >= 2 ? <Unlock size={18} /> : <Lock size={18} />}
//                   </div>
//                   <span className="text-xs mt-1">Tier 2</span>
//                 </div>

//                 {/* Tier 3 */}
//                 <div className="flex flex-col items-center">
//                   <div
//                     className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
//                       tier >= 3 ? "bg-green-600 text-white" : "bg-gray-300"
//                     }`}
//                   >
//                     {tier >= 3 ? <Unlock size={18} /> : <Lock size={18} />}
//                   </div>
//                   <span className="text-xs mt-1">Tier 3</span>
//                 </div>
//               </div>
//             </div>

//             <div className="text-sm mt-2">
//               Refer {referralsForNextTier} more friend to unlock <b>Tier 2</b> and
//               earn <b>2X Rewards</b>.
//             </div>

//             {/* Tier Benefits Box inside */}
//             <div className="bg-gray-900 rounded-xl p-5 mt-4 text-white">
//               <div className="font-bold mb-1">Tier 1</div>
//               <div className="text-xs mb-2">for first 2 referrals</div>
//               <div className="flex justify-between font-semibold">
//                 <span>You get ₹400</span>
//                 <span>Friends get ₹400</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReferralPage;



import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Gift, Sun, Moon } from "lucide-react";

const ReferralUnderConstruction = () => {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-500 ${
        darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-700"
      }`}
    >
 

      {/* 💬 Animated Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-md"
      >
        <motion.div
          className="flex justify-center mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Gift className="w-16 h-16 text-blue-500 dark:text-blue-400" />
        </motion.div>

        <motion.h1
          className="text-3xl font-semibold mb-3"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          Referral Program Coming Soon 🎁
        </motion.h1>

        <p className="text-lg leading-relaxed mb-6">
          Invite your friends and earn exciting rewards! 🚀 <br />
          We’re setting up your <strong>referral system</strong> — stay tuned!
          <button onClick={navigate("/")} className="underline text-blue-500 cursor-pointer">Go to Home Page</button>
        </p>

        <motion.div
          className="flex justify-center mt-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-10 h-10 border-4 border-blue-400 dark:border-blue-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReferralUnderConstruction;


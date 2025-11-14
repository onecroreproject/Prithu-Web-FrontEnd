// import React, { useState, useEffect, useContext } from "react";
// import api from "../api/axios";
// import { AuthContext } from "../context/AuthContext";

// const SubscriptionPage = () => {
//   const { token } = useContext(AuthContext);
//   const [plans, setPlans] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedPlan, setSelectedPlan] = useState(null);
//   const [alertMsg, setAlertMsg] = useState("");
//   const [errorMsg, setErrorMsg] = useState("");

//   /* --------------------------------------------------- */
//   // ✅ Fetch all subscription plans from backend
//   useEffect(() => {
//     const fetchPlans = async () => {
//       try {
//         const { data } = await api.get("/api/user/getall/subscriptions", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         console.log(data)
//         setPlans(data.plans || []);
//       } catch (err) {
//         console.error("Error fetching plans:", err);
//         setErrorMsg("Failed to load subscription plans");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchPlans();
//   }, [token]);

//   /* --------------------------------------------------- */
//   const handleSelectPlan = (plan) => {
//     setSelectedPlan(plan);
//     setModalOpen(true);
//   };

//   /* --------------------------------------------------- */
//   const confirmSubscribe = async () => {
//     if (!selectedPlan) return;

//     try {
//       const payload = {
//         planId: selectedPlan._id,
//         result: { paymentId: "test123", status: "success" },
//       };

//       await api.post("/api/user/plan/subscription", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       setAlertMsg(`Subscribed Successfully to ${selectedPlan.planName}`);
//     } catch (err) {
//       console.error(err);
//       setAlertMsg("Subscription Failed");
//     } finally {
//       setModalOpen(false);
//       setSelectedPlan(null);
//       setTimeout(() => setAlertMsg(""), 3000);
//     }
//   };

//   /* --------------------------------------------------- */
//   const cancelSubscription = async (subscriptionId) => {
//     try {
//       await api.put(
//         "/api/user/cancel/subscription",
//         { subscriptionId },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setAlertMsg("Subscription cancelled successfully");
//     } catch (err) {
//       console.error(err);
//       setAlertMsg("Cancel failed");
//     } finally {
//       setTimeout(() => setAlertMsg(""), 3000);
//     }
//   };

//   /* --------------------------------------------------- */
//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-gray-500 text-lg">Loading plans...</p>
//       </div>
//     );
//   }

//   if (errorMsg) {
//     return (
//       <div className="min-h-screen flex items-center justify-center text-red-600 text-lg">
//         {errorMsg}
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4 relative">
//       {/* ---------- Alert ---------- */}
//       {alertMsg && (
//         <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-green-200 text-green-800 px-6 py-3 rounded-lg shadow-md">
//           {alertMsg}
//         </div>
//       )}

//       <h2 className="text-3xl font-bold mb-12">Choose a Subscription Plan</h2>

//       {/* ---------- Plans Grid ---------- */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
//         {plans.map((plan) => (
//           <div
//             key={plan._id}
//             className={`relative bg-white rounded-3xl shadow-2xl p-8 flex flex-col border-2 
//                         ${
//                           plan.highlight
//                             ? "border-green-400 ring-2 ring-green-400"
//                             : "border-gray-200"
//                         }
//                         transition-transform hover:scale-105`}
//           >
//             {plan.discount && (
//               <div className="absolute -top-3 right-0 bg-green-400 text-white px-3 py-1 rounded-l-full text-sm font-semibold">
//                 {plan.discount}
//               </div>
//             )}
//             <h3 className="text-2xl font-semibold mb-2">{plan.planName}</h3>
//             <p className="text-3xl font-bold mb-4">₹{plan.price}</p>

//             <p className="text-gray-600 mb-4">
//               Duration: {plan.durationYears} year
//               {plan.durationYears > 1 ? "s" : ""}
//             </p>

//             {plan.features && (
//               <ul className="mb-6 space-y-2">
//                 {plan.features.map((f, idx) => (
//                   <li key={idx} className="flex items-center gap-2">
//                     <span className="text-green-500 font-bold">✔</span> {f}
//                   </li>
//                 ))}
//               </ul>
//             )}

//             <button
//               onClick={() => handleSelectPlan(plan)}
//               className={`py-3 rounded-xl font-semibold text-white 
//                          ${
//                            plan.highlight
//                              ? "bg-green-500 hover:bg-green-600"
//                              : "bg-gray-800 hover:bg-gray-700"
//                          }`}
//             >
//               Subscribe Now
//             </button>
//           </div>
//         ))}
//       </div>

//       {/* ---------- Confirmation Modal ---------- */}
//       {modalOpen && selectedPlan && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <div
//             className="absolute inset-0 bg-white/30 backdrop-blur-sm"
//             onClick={() => setModalOpen(false)}
//           />
//           <div className="relative bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
//             <h3 className="text-xl font-bold mb-4">Confirm Subscription</h3>
//             <p className="mb-6">
//               Subscribe to{" "}
//               <strong>{selectedPlan.planName}</strong> plan for ₹
//               {selectedPlan.price}?
//             </p>
//             <div className="flex justify-center gap-4">
//               <button
//                 onClick={confirmSubscribe}
//                 className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
//               >
//                 Yes, Subscribe
//               </button>
//               <button
//                 onClick={() => setModalOpen(false)}
//                 className="bg-gray-300 px-6 py-2 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ---------- OPTIONAL: Cancel button (example) ---------- */}
//       <button
//         onClick={() => cancelSubscription("YOUR_SUBSCRIPTION_ID_HERE")}
//         className="mt-8 text-red-600 underline"
//       >
//         Cancel current subscription
//       </button>
//     </div>
//   );
// };

// export default SubscriptionPage;




import React, { useState } from "react";
import { motion } from "framer-motion";
import { Users, Gift, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReferralUnderConstruction = () => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
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


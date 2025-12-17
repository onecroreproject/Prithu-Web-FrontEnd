import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Gift, Users, TrendingUp, Award, Coins, GiftIcon } from "lucide-react";

const ReferralComingSoon = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-4xl h-[500px] bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
              >
                <X className="w-5 h-5 text-blue-600" />
              </button>
              
              {/* Header Section */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-cyan-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <GiftIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Referral Program</h2>
                      <p className="text-blue-100 text-sm">Earn rewards for every friend you refer • Launching <span className="font-bold text-white">Soon!</span></p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Share2 className="w-4 h-4 text-yellow-300" />
                    <span className="text-white font-medium">Coming Soon</span>
                  </div>
                </div>
              </div>
              
              {/* Main Content */}
              <div className="p-6 h-[calc(500px-100px)] flex flex-col">
                {/* Feature Cards Row */}
                <div className="grid grid-cols-3 gap-4 flex-1">
                  {/* Feature Card 1 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <Coins className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Earn Rewards</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Get exclusive bonuses and credits for every successful referral.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>Up to $50 per referral</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 2 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-green-100 group-hover:bg-green-200 transition-colors">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Share Easily</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Unique referral links and easy sharing options across all platforms.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                      <Share2 className="w-4 h-4" />
                      <span>One-click sharing</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 3 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                          <Award className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Track Progress</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Real-time dashboard to monitor your referrals and earnings.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>Live analytics</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Stats & Action Section */}
                <div className="mt-6 flex items-center justify-between">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">3X</p>
                      <p className="text-xs text-gray-600 mt-1">Reward Multiplier</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">∞</p>
                      <p className="text-xs text-gray-600 mt-1">Unlimited Referrals</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">24h</p>
                      <p className="text-xs text-gray-600 mt-1">Instant Payouts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cyan-600">100%</p>
                      <p className="text-xs text-gray-600 mt-1">Success Rate</p>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onClose();
                      // Add notification logic here
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <Share2 className="w-5 h-5" />
                    Get Notified
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReferralComingSoon;
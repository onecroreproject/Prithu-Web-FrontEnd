import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Sparkles, Heart, MessageCircle, Globe, TrendingUp, Target } from "lucide-react";

const CommunityComingSoon = ({ isOpen, onClose }) => {
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
          
          {/* Modal - 500px height, no scroll */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-5xl h-[500px] bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl shadow-2xl overflow-hidden border border-purple-100">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
              >
                <X className="w-5 h-5 text-purple-600" />
              </button>
              
              {/* Header Section */}
              <div className="p-6 bg-gradient-to-r from-purple-500 to-pink-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Community Hub</h2>
                      <p className="text-purple-100 text-sm">Connect with like-minded people • Launching <span className="font-bold text-white"></span></p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span className="text-white font-medium">Coming Soon</span>
                  </div>
                </div>
              </div>
              
              {/* Main Content - No Scroll */}
              <div className="p-6 h-[calc(500px-100px)] flex flex-col">
                {/* Feature Cards Row */}
                <div className="grid grid-cols-3 gap-4 flex-1">
                  {/* Feature Card 1 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-purple-100 group-hover:bg-purple-200 transition-colors">
                          <Users className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Interest Groups</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Join communities based on your passions, skills, and professional interests.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <Target className="w-4 h-4" />
                      <span>100+ specialized groups</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 2 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-pink-100 hover:border-pink-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-pink-100 group-hover:bg-pink-200 transition-colors">
                          <MessageCircle className="w-6 h-6 text-pink-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Live Discussions</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Real-time conversations, expert AMAs, and interactive forums for meaningful exchanges.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-pink-600 font-medium">
                      <Globe className="w-4 h-4" />
                      <span>Global conversations</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 3 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <Heart className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Support Network</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Get guidance, share experiences, and grow together in a supportive environment.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>Peer-to-peer mentorship</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Stats & Action Section */}
                <div className="mt-6 flex items-center justify-between">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">5K+</p>
                      <p className="text-xs text-gray-600 mt-1">Expected Members</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-pink-600">100+</p>
                      <p className="text-xs text-gray-600 mt-1">Interest Groups</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">24/7</p>
                      <p className="text-xs text-gray-600 mt-1">Active Community</p>
                    </div>
                   
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onClose();
                      // Add notification logic here
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-purple-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-5 h-5" />
              
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

export default CommunityComingSoon;
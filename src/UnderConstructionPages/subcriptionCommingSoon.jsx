import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Zap, Shield, Globe, Star, CheckCircle, Sparkles } from "lucide-react";

const SubscriptionComingSoon = ({ isOpen, onClose }) => {
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
            <div className="relative w-full max-w-4xl h-[500px] bg-gradient-to-br from-gold-50 via-white to-amber-50 rounded-2xl shadow-2xl overflow-hidden border border-gold-100">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
              >
                <X className="w-5 h-5 text-amber-600" />
              </button>
              
              {/* Header Section */}
              <div className="p-6 bg-gradient-to-r from-amber-500 to-yellow-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Premium Subscription</h2>
                      <p className="text-amber-100 text-sm">Unlock exclusive features and benefits • Launching <span className="font-bold text-white">Soon!</span></p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
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
                    className="bg-white p-5 rounded-xl border border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors">
                          <Zap className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Premium Features</h3>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Advanced analytics</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Priority support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Custom branding</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                      <Zap className="w-4 h-4" />
                      <span>Premium tools</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 2 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <Shield className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Enhanced Security</h3>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Advanced encryption</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Data backup</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Multi-factor auth</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <Shield className="w-4 h-4" />
                      <span>Enterprise-grade</span>
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
                          <Globe className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Global Access</h3>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Multi-language support</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Global servers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>24/7 availability</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <Globe className="w-4 h-4" />
                      <span>Worldwide access</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Pricing & Action Section */}
                <div className="mt-6 flex items-center justify-between">
                 
                  
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onClose();
                      // Add notification logic here
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-amber-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <Star className="w-5 h-5" />
                    Get Early Access
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

export default SubscriptionComingSoon;
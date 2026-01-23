import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Ticket, Music, Globe, PartyPopper, Users, TrendingUp, MapPin, Video } from "lucide-react";

const EventsComingSoon = ({ isOpen, onClose }) => {
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
            <div className="relative w-full max-w-5xl h-[500px] bg-gradient-to-br from-amber-50 via-white to-rose-50 rounded-2xl shadow-2xl overflow-hidden border border-amber-100">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
              >
                <X className="w-5 h-5 text-amber-600" />
              </button>
              
              {/* Header Section */}
              <div className="p-6 bg-gradient-to-r from-amber-500 to-rose-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Events Hub</h2>
                      <p className="text-amber-100 text-sm">Discover amazing experiences • Launching <span className="font-bold text-white"></span></p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <PartyPopper className="w-4 h-4 text-yellow-300" />
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
                    className="bg-white p-5 rounded-xl border border-amber-100 hover:border-amber-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-amber-100 group-hover:bg-amber-200 transition-colors">
                          <Calendar className="w-6 h-6 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Smart Calendar</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Personalized event recommendations based on your interests, location, and past attendance.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-amber-600 font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>AI-powered suggestions</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 2 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-rose-100 hover:border-rose-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-rose-100 group-hover:bg-rose-200 transition-colors">
                          <Ticket className="w-6 h-6 text-rose-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Easy Registration</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">One-click registration, secure ticketing, and hassle-free event management for organizers.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-rose-600 font-medium">
                      <Users className="w-4 h-4" />
                      <span>Group bookings available</span>
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
                        <h3 className="text-lg font-bold text-gray-800">Global Reach</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Join events worldwide, from virtual conferences to local meetups, with hybrid options.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <MapPin className="w-4 h-4" />
                      <span>50+ cities worldwide</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Stats & Action Section */}
                <div className="mt-6 flex items-center justify-between">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">300+</p>
                      <p className="text-xs text-gray-600 mt-1">Events Planned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-rose-600">150+</p>
                      <p className="text-xs text-gray-600 mt-1">Virtual Events</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">50+</p>
                      <p className="text-xs text-gray-600 mt-1">Cities Worldwide</p>
                    </div>
                 
                  </div>
                  
                  {/* Event Types Preview */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-center">
                      <p className="text-xs font-semibold text-amber-700">Conferences</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-rose-50 to-rose-100 border border-rose-200 text-center">
                      <p className="text-xs font-semibold text-rose-700">Networking</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-center">
                      <p className="text-xs font-semibold text-blue-700">Workshops</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-center">
                      <p className="text-xs font-semibold text-purple-700">Summits</p>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onClose();
                      // Add notification logic here
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-amber-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <Calendar className="w-5 h-5" />
                    
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

export default EventsComingSoon;
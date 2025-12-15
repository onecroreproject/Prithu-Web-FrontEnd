import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, BookOpen, GraduationCap, Target, Brain, Award, Clock, Users, TrendingUp, Zap } from "lucide-react";

const LearningComingSoon = ({ isOpen, onClose }) => {
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
            <div className="relative w-full max-w-5xl h-[500px] bg-gradient-to-br from-blue-50 via-white to-emerald-50 rounded-2xl shadow-2xl overflow-hidden border border-blue-100">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm transition-all hover:scale-110 shadow-lg"
              >
                <X className="w-5 h-5 text-blue-600" />
              </button>
              
              {/* Header Section */}
              <div className="p-6 bg-gradient-to-r from-blue-500 to-emerald-500">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Learning Hub</h2>
                      <p className="text-blue-100 text-sm">Master skills, earn certifications • Launching <span className="font-bold text-white"></span></p>
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full">
                    <Brain className="w-4 h-4 text-yellow-300" />
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
                    className="bg-white p-5 rounded-xl border border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                          <BookOpen className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Interactive Courses</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Hands-on learning with real-world projects, quizzes, and practical exercises.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <Clock className="w-4 h-4" />
                      <span>Self-paced learning</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 2 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-emerald-100 hover:border-emerald-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                          <Target className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Personalized Paths</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Custom learning journeys tailored to your goals, skill level, and career aspirations.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                      <Brain className="w-4 h-4" />
                      <span>AI-powered recommendations</span>
                    </div>
                  </motion.div>
                  
                  {/* Feature Card 3 */}
                  <motion.div 
                    className="bg-white p-5 rounded-xl border border-violet-100 hover:border-violet-300 transition-all duration-300 hover:shadow-lg group flex flex-col justify-between"
                    whileHover={{ y: -5 }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 rounded-xl bg-violet-100 group-hover:bg-violet-200 transition-colors">
                          <Award className="w-6 h-6 text-violet-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Certifications</h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">Industry-recognized certifications that boost your credibility and career prospects.</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-violet-600 font-medium">
                      <Zap className="w-4 h-4" />
                      <span>Career advancement</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Stats & Action Section */}
                <div className="mt-6 flex items-center justify-between">
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">200+</p>
                      <p className="text-xs text-gray-600 mt-1">Courses Planned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">50+</p>
                      <p className="text-xs text-gray-600 mt-1">Expert Instructors</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-violet-600">15+</p>
                      <p className="text-xs text-gray-600 mt-1">Certification Tracks</p>
                    </div>
                   
                  </div>
                  
                  {/* Categories Preview */}
                  <div className="grid grid-cols-4 gap-2">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-center">
                      <p className="text-xs font-semibold text-blue-700">Tech</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-center">
                      <p className="text-xs font-semibold text-emerald-700">Business</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 text-center">
                      <p className="text-xs font-semibold text-purple-700">Creative</p>
                    </div>
                    <div className="p-2 rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 text-center">
                      <p className="text-xs font-semibold text-amber-700">Growth</p>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <button
                    onClick={() => {
                      onClose();
                      // Add notification logic here
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
                  >
                    <BookOpen className="w-5 h-5" />
                  
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

export default LearningComingSoon;
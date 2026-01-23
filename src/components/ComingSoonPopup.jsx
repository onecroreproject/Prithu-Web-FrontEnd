import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BellRing, Gift, Rocket, Sparkles } from 'lucide-react';

const ComingSoonPopup = ({ isOpen, onClose, title, icon: Icon, description }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-center p-8"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>

                    {/* Icon Header */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-100 rounded-full blur-xl opacity-50 animate-pulse"></div>
                            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                                <Icon className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -top-2 -right-2">
                                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        {title} Coming Soon!
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {description || "We're working hard to bring this feature to you. Stay tuned for updates!"}
                    </p>

                    {/* Action Button */}
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-6 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-all shadow-md active:scale-95"
                    >
                        Got it, thanks!
                    </button>

                    {/* Footer Decoration */}
                    <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-gray-400 uppercase tracking-widest">
                        <Rocket className="w-4 h-4" />
                        <span>Coming Early 2026</span>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ComingSoonPopup;

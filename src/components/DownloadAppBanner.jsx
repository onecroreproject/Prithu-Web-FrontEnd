import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, X, Download } from 'lucide-react';
import { useDownloads } from '../context/DownloadContext';
import prithuLogo from '../assets/prithulogo.png';

const DownloadAppBanner = ({ className = "" }) => {
    const [isVisible, setIsVisible] = useState(true);
    const { setIsDownloadPopUpOpen } = useDownloads();

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className={`fixed bottom-0 right-0 z-[50] bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-[0_-10px_40px_rgba(37,99,235,0.2)] transition-all duration-300 ${className}`}
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between flex-wrap">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg hidden sm:flex items-center justify-center overflow-hidden flex-shrink-0">
                                <img src={prithuLogo} alt="Prithu Logo" className="w-8 h-8 object-contain" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-sm sm:text-base leading-tight">
                                    Prithu App is Now Live! 🚀
                                </span>
                                <span className="text-[10px] sm:text-xs text-blue-100 hidden sm:block">
                                    Enjoy faster downloads and premium mobile features on the Play Store
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsDownloadPopUpOpen(true)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-gray-900 rounded-full text-xs sm:text-sm font-black transition-all active:scale-95 shadow-lg shadow-amber-900/20"
                            >
                                <Download className="w-4 h-4" />
                                <span>Get App</span>
                            </button>
                            <button
                                onClick={() => setIsVisible(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                                aria-label="Dismiss"
                            >
                                <X className="w-5 h-5 text-blue-100" />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default DownloadAppBanner;

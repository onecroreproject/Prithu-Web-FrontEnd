import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Download, Star } from 'lucide-react';
import prithuLogo from '../assets/prithulogo.png';

const DownloadAppPopUp = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md landscape:max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto"
                >
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="p-8 landscape:p-10">
                        <div className="landscape:flex landscape:items-center landscape:gap-10">
                            {/* Left Side: QR Code (Visible on right in landscape or swapped if preferred, let's put QR on right) */}
                            <div className="flex-1 text-center landscape:text-left order-1 landscape:order-1">
                                <div className="mb-6 relative inline-block landscape:mb-4">
                                    <div className="w-16 h-16 landscape:w-14 landscape:h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 animate-bounce overflow-hidden border border-gray-100">
                                        <img src={prithuLogo} alt="Prithu Logo" className="w-10 h-10 landscape:w-8 landscape:h-8 object-contain" />
                                    </div>
                                    <motion.div
                                        animate={{ rotate: [0, 15, -15, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-2 -right-2 bg-amber-400 p-1 rounded-lg shadow-lg"
                                    >
                                        <Star className="w-3 h-3 text-white fill-current" />
                                    </motion.div>
                                </div>

                                <h2 className="text-2xl landscape:text-3xl font-black text-gray-900 mb-3">
                                    Exciting News! 🎉
                                </h2>
                                <p className="text-gray-600 font-medium mb-6 landscape:mb-8 leading-relaxed text-sm landscape:text-base">
                                    We've officially launched the Prithu App on the <span className="text-blue-600 font-bold">Play Store</span>! <br className="hidden landscape:block" />
                                    Experience faster downloads and premium features on your mobile device.
                                </p>

                                <div className="hidden landscape:block space-y-4">
                                    <a
                                        href="https://play.google.com/store/apps/details?id=com.dlktechnologies.Prithu"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
                                    >
                                        <Download className="w-6 h-6 text-amber-400" />
                                        Get it on Play Store
                                    </a>
                                </div>
                            </div>

                            {/* Right Side: QR Code Container */}
                            <div className="flex-shrink-0 order-2 landscape:order-2 mt-8 landscape:mt-0">
                                <div className="bg-gray-50 rounded-3xl p-6 landscape:p-8 border-2 border-dashed border-gray-200 text-center">
                                    <img
                                        src="/qr-download.png"
                                        alt="Download on Play Store"
                                        className="w-40 h-40 landscape:w-48 landscape:h-48 mx-auto rounded-xl shadow-md border-4 border-white"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-black">
                                        Scan to Download
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mobile/Portrait Bottom Actions */}
                        <div className="landscape:hidden mt-8 space-y-4">
                            <a
                                href="https://play.google.com/store/apps/details?id=com.dlktechnologies.Prithu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-[0.98]"
                            >
                                <Download className="w-6 h-6 text-amber-400" />
                                Get it on Play Store
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DownloadAppPopUp;

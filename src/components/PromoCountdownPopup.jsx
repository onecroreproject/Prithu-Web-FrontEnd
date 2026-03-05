import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import promoImage from '../assets/promo_offer.png';

const PromoCountdownPopup = ({ isOpen, onClose }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    const targetDate = new Date('2026-03-15T00:00:00');

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const now = new Date();
            const difference = targetDate.getTime() - now.getTime();

            if (difference <= 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl transition-all"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 50 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-md bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col items-center text-center p-6 border border-white/20"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Background Glows */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-400 rounded-full blur-[120px] opacity-20" />
                    <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-purple-400 rounded-full blur-[100px] opacity-20" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-[100] w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all backdrop-blur-md"
                        title="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Main Promotion Image */}
                    <div className="relative mb-4 transform hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-blue-500 rounded-full blur-[30px] opacity-30 animate-pulse" />
                        <img
                            src={promoImage}
                            alt="Mega Promotion"
                            className="w-36 h-36 md:w-44 md:h-44 object-contain relative z-10"
                        />
                    </div>

                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative z-20 space-y-4"
                    >
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
                            Mega Launch <br />
                            <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Coming Soon!</span>
                        </h2>

                        <p className="text-blue-100/80 text-sm md:text-base font-medium max-w-sm mx-auto">
                            Subscriptions and Referrals are launching globally!
                        </p>
                    </motion.div>

                    {/* Countdown Timer */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="grid grid-cols-4 gap-3 md:gap-4 mt-6 relative z-20"
                    >
                        {[
                            { value: timeLeft.days, label: 'Days' },
                            { value: timeLeft.hours, label: 'Hours' },
                            { value: timeLeft.minutes, label: 'Mins' },
                            { value: timeLeft.seconds, label: 'Secs' }
                        ].map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl border border-white/20 flex items-center justify-center mb-1 shadow-inner">
                                    <span className="text-lg md:text-xl font-black text-white">
                                        {String(item.value).padStart(2, '0')}
                                    </span>
                                </div>
                                <span className="text-[10px] md:text-xs font-bold text-blue-200/60 uppercase tracking-widest">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </motion.div>

                    {/* Disclaimer/Note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-blue-200/40 text-[10px] font-medium uppercase tracking-[0.2em]"
                    >
                        Official Launch • March 15th, 2026
                    </motion.div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PromoCountdownPopup;

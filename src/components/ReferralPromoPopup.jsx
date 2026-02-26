import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Gift, TrendingUp, Sparkles, Rocket } from 'lucide-react';
import ExcitedImg from '../assets/referral_excited.png';
import MoneyImg from '../assets/referral_money.png';

const ReferralPromoPopup = ({ isOpen, onClose, title = "Coming Soon!" }) => {
    const targetDate = new Date('2026-03-01T00:00:00');
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +targetDate - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    }

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeLeft(left);

            // If countdown finished while open, close automatically
            if (Object.keys(left).length === 0) {
                onClose();
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const TimeUnit = ({ value, label }) => (
        <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-xl p-2 min-w-[60px] border border-white/20">
            <span className="text-xl font-bold text-white">{value || 0}</span>
            <span className="text-[9px] uppercase tracking-wider text-blue-200 mt-0.5">{label}</span>
        </div>
    );

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 30 }}
                    className="relative w-full max-w-lg bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 rounded-3xl shadow-2xl overflow-hidden border border-white/10"
                >
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-60 h-60 bg-blue-500/20 rounded-full blur-[80px]"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-60 h-60 bg-purple-500/20 rounded-full blur-[80px]"></div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all backdrop-blur-md"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="relative z-10 p-6 flex flex-col items-center text-center">
                        {/* Featured Images Section */}
                        <div className="relative w-full flex justify-center items-center mb-4 gap-4 pt-2">
                            <motion.div
                                initial={{ x: -50, opacity: 0, rotate: -10 }}
                                animate={{ x: 0, opacity: 1, rotate: -5 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="w-24 h-24 md:w-32 md:h-32 relative group"
                            >
                                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-2xl group-hover:bg-blue-400/40 transition-all"></div>
                                <img
                                    src={ExcitedImg}
                                    alt="Excited User"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                />
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0, scale: 0.8 }}
                                animate={{ y: 0, opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 }}
                                className="bg-yellow-400/90 p-2 rounded-xl shadow-lg relative z-20 -mx-3 rotate-12"
                            >
                                <Sparkles className="w-5 h-5 text-white animate-pulse" />
                            </motion.div>

                            <motion.div
                                initial={{ x: 50, opacity: 0, rotate: 10 }}
                                animate={{ x: 0, opacity: 1, rotate: 5 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="w-24 h-24 md:w-32 md:h-32 relative group"
                            >
                                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-2xl group-hover:bg-purple-400/40 transition-all"></div>
                                <img
                                    src={MoneyImg}
                                    alt="Earn Rewards"
                                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl"
                                />
                            </motion.div>
                        </div>

                        {/* Title & Desc */}
                        <motion.div
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <h2 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-white to-purple-200 mb-2 tracking-tight">
                                {title}
                            </h2>
                            <p className="text-blue-100/80 text-xs md:text-sm mb-4 max-w-sm mx-auto leading-relaxed">
                                Get ready to invite your friends and unlock premium benefits! Our new <span className="text-yellow-400 font-semibold italic">Referral & Subscription</span> program launches soon.
                            </p>
                        </motion.div>

                        {/* Countdown Container */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex gap-2 md:gap-3 mb-6"
                        >
                            <TimeUnit value={timeLeft.days} label="Days" />
                            <TimeUnit value={timeLeft.hours} label="Hours" />
                            <TimeUnit value={timeLeft.minutes} label="Mins" />
                            <TimeUnit value={timeLeft.seconds} label="Secs" />
                        </motion.div>

                        {/* Action Details */}
                        <motion.div
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="w-full flex flex-col gap-3"
                        >
                            <div className="flex items-center justify-center gap-4 py-3 px-5 bg-white/5 rounded-xl border border-white/5">
                                <div className="flex items-center gap-2">
                                    <Gift className="w-4 h-4 text-pink-400" />
                                    <span className="text-[10px] font-semibold text-white/90">Invite & Earn</span>
                                </div>
                                <div className="w-px h-3 bg-white/20"></div>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    <span className="text-[10px] font-semibold text-white/90">Premium Access</span>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full py-3.5 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)] active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Rocket className="w-4 h-4" />
                                <span>Notify Me on Launch</span>
                            </button>
                        </motion.div>

                        <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Launching March 1, 2026</span>
                            <Sparkles className="w-2.5 h-2.5" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReferralPromoPopup;

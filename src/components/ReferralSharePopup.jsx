import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import { FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaRegCopy } from 'react-icons/fa';
import { logReferralActivity } from '../API_Services/referralServices';
import toast from 'react-hot-toast';

const ReferralSharePopup = ({ isOpen, onClose, referralCode }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const referralLink = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareContent = `Join me on Prithu! Use my link to sign up and get ₹25 bonus: ${referralLink}`;

    const copyToClipboard = async (medium = 'Copy Link') => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Referral link copied!");

            // Log activity
            await logReferralActivity({
                referralCode,
                activityType: 'share',
                sharingMedium: medium
            });
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    const handleShare = async (medium, url) => {
        // Log activity first
        try {
            await logReferralActivity({
                referralCode,
                activityType: 'share',
                sharingMedium: medium
            });
        } catch (error) {
            console.error("Error logging share:", error);
        }

        // Open share window
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: <FaWhatsapp className="w-6 h-6" />,
            color: 'bg-[#25D366]',
            hover: 'hover:bg-[#128C7E]',
            url: `https://wa.me/?text=${encodeURIComponent(shareContent)}`
        },
        {
            name: 'Facebook',
            icon: <FaFacebook className="w-6 h-6" />,
            color: 'bg-[#1877F2]',
            hover: 'hover:bg-[#0d65d9]',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareContent)}`
        },
        {
            name: 'Twitter',
            icon: <FaTwitter className="w-6 h-6" />,
            color: 'bg-[#1DA1F2]',
            hover: 'hover:bg-[#0c85d0]',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareContent)}`
        },
        {
            name: 'Instagram',
            icon: <FaInstagram className="w-6 h-6" />,
            color: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]',
            hover: 'opacity-90',
            url: `https://www.instagram.com/` // Instagram doesn't support direct link sharing via web URL like others, typically just opens the app
        }
    ];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Share & Earn</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Referral Code Box */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-8">
                        <p className="text-sm text-gray-500 mb-2 font-medium">Your referral code</p>
                        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3">
                            <code className="text-lg font-mono font-bold text-blue-600 tracking-wider">
                                {referralCode}
                            </code>
                            <button
                                onClick={() => copyToClipboard('Copy Link')}
                                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>
                    </div>

                    {/* Share Options Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {shareOptions.map((option) => (
                            <div key={option.name} className="flex flex-col items-center gap-2">
                                <button
                                    onClick={() => handleShare(option.name, option.url)}
                                    className={`w-14 h-14 ${option.color} ${option.hover} text-white rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90`}
                                >
                                    {option.icon}
                                </button>
                                <span className="text-xs font-medium text-gray-600">{option.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Other Share Button */}
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({
                                    title: 'Join Prithu!',
                                    text: shareContent,
                                    url: window.location.origin
                                });
                            } else {
                                copyToClipboard('Other');
                            }
                        }}
                        className="w-full py-3 px-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                    >
                        <Share2 className="w-5 h-5" />
                        More Options
                    </button>

                    <p className="mt-6 text-center text-xs text-gray-400 font-medium uppercase tracking-widest">
                        Invite friends, earn together
                    </p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReferralSharePopup;

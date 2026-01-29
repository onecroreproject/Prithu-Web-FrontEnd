import React, { useState, useRef, useEffect } from "react";
import {
    ContentCopy as CopyIcon,
    Facebook,
    WhatsApp,
    Email,
    Twitter,
    LinkedIn,
    Telegram,
    Message,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-hot-toast";
import { logReferralActivity } from "../../API_Services/referralServices";

const ReferralSharePopUp = ({
    isOpen,
    onClose,
    referralCode,
}) => {
    const [isLinkCopied, setIsLinkCopied] = useState(false);
    const popupRef = useRef(null);

    const shareUrl = `${window.location.origin}/signup?ref=${referralCode}`;
    const shareMessage = `Join me on Prithu and get rewards! Use my referral code: ${referralCode}`;

    const trackShareAction = async (platform) => {
        try {
            await logReferralActivity({
                referralCode: referralCode,
                activityType: 'share',
                sharingMedium: platform
            });
        } catch (error) {
            console.error('Failed to track share:', error);
        }
    };

    const shareOptions = [
        { id: "whatsapp", name: "WhatsApp", icon: <WhatsApp />, color: "#25D366" },
        { id: "facebook", name: "Facebook", icon: <Facebook />, color: "#1877F2" },
        { id: "twitter", name: "Twitter", icon: <Twitter />, color: "#1DA1F2" },
        { id: "linkedin", name: "LinkedIn", icon: <LinkedIn />, color: "#0A66C2" },
        { id: "telegram", name: "Telegram", icon: <Telegram />, color: "#0088cc" },
        { id: "email", name: "Email", icon: <Email />, color: "#EA4335" },
        { id: "messenger", name: "Messenger", icon: <Message />, color: "#006AFF" },
        { id: "copy", name: "Copy Link", icon: <CopyIcon />, color: "#6B7280" },
    ];

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsLinkCopied(true);
            await trackShareAction('copy_link');
            toast.success("Link copied!");
            setTimeout(() => setIsLinkCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy");
        }
    };

    const handleSocialShare = async (platform) => {
        const encodedUrl = encodeURIComponent(shareUrl);
        const encodedMessage = encodeURIComponent(shareMessage);
        const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

        if (platform !== "copy") {
            await trackShareAction(platform);
        }

        switch (platform) {
            case "whatsapp":
                window.open(isMobile ? `whatsapp://send?text=${encodedMessage}%20${encodedUrl}` : `https://web.whatsapp.com/send?text=${encodedMessage}%20${encodedUrl}`, "_blank");
                break;
            case "facebook":
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
                break;
            case "messenger":
                window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=500");
                break;
            case "twitter":
                window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}`, "_blank");
                break;
            case "telegram":
                window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`, "_blank");
                break;
            case "linkedin":
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank");
                break;
            case "email":
                window.location.href = `mailto:?subject=${encodeURIComponent("Join me on Prithu")}&body=${encodedMessage}%20${encodedUrl}`;
                break;
            case "copy":
                await copyToClipboard();
                return;
        }
        onClose();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div
                ref={popupRef}
                className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300"
            >
                <div className="p-6 text-center border-b border-gray-50">
                    <div className="flex justify-end -mt-2 -mr-2">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <CloseIcon className="text-gray-400" />
                        </button>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <WhatsApp className="text-blue-600 w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Invite Friends</h2>
                    <p className="text-gray-500 mt-2">Earn rewards by inviting your friends to join Prithu</p>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                        {shareOptions.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => handleSocialShare(opt.id)}
                                className="flex flex-col items-center gap-2 group transition-all active:scale-95"
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110"
                                    style={{ backgroundColor: opt.color }}
                                >
                                    {opt.icon}
                                </div>
                                <span className="text-[11px] font-medium text-gray-600">{opt.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3">
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Your referral code</p>
                            <p className="text-lg font-mono font-bold text-gray-800 truncate">{referralCode}</p>
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
                        >
                            {isLinkCopied ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralSharePopUp;

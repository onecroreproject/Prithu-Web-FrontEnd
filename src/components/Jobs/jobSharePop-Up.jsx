// src/components/Jobs/JobSharePopup.jsx
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
  Share as ShareIcon,
  WorkOutline,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const JobSharePopup = ({
  isOpen,
  onClose,
  jobId,
  jobTitle = "",
  companyName = "",
  location = "",
  salaryRange = "",
  postedUserName = "",
  onShareComplete,
  authUser,
}) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const popupRef = useRef(null);

  const shareUrl = `${window.location.origin}/jobs/${jobId}`;
  const shareText = `Check out this job opportunity: ${jobTitle} at ${companyName}${location ? ` (${location})` : ''}${salaryRange ? ` - ${salaryRange}` : ''}`;

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
      toast.success("Job link copied to clipboard!");
      setTimeout(() => setIsLinkCopied(false), 2000);
      if (onShareComplete) onShareComplete();
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleSocialShare = async (platform) => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(shareUrl);
    
    let shareUrlWithOG = "";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    switch (platform) {
      case "whatsapp":
        shareUrlWithOG = isMobile 
          ? `whatsapp://send?text=${text}%0A%0A${url}`
          : `https://web.whatsapp.com/send?text=${text}%0A%0A${url}`;
        break;
      case "facebook":
        shareUrlWithOG = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case "twitter":
        shareUrlWithOG = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case "linkedin":
        shareUrlWithOG = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case "telegram":
        shareUrlWithOG = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
      case "email":
        const subject = encodeURIComponent(`Job Opportunity: ${jobTitle} at ${companyName}`);
        const emailBody = `${shareText}\n\nView job: ${shareUrl}\n\nShared via Job Portal`;
        shareUrlWithOG = `mailto:?subject=${subject}&body=${encodeURIComponent(emailBody)}`;
        break;
      case "messenger":
        shareUrlWithOG = `https://www.facebook.com/dialog/send?link=${url}&app_id=542599432471018&redirect_uri=${encodeURIComponent(shareUrl)}`;
        break;
      case "copy":
        copyToClipboard();
        return;
      default:
        toast.error("Unknown platform");
        return;
    }

    if (platform === "email") {
      window.location.href = shareUrlWithOG;
    } else {
      window.open(shareUrlWithOG, '_blank', 'noopener,noreferrer');
    }

    if (onShareComplete) onShareComplete();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Job: ${jobTitle} at ${companyName}`,
          text: shareText,
          url: shareUrl,
        });
        if (onShareComplete) onShareComplete();
        onClose();
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error("Failed to share");
        }
      }
    } else {
      copyToClipboard();
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        ref={popupRef}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <WorkOutline />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share Job</h2>
              <p className="text-sm text-gray-500">{jobTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <CloseIcon className="text-gray-600" />
          </button>
        </div>

      

        {/* Social Share Grid */}
        <div className="p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Share to platforms</h3>
          <div className="grid grid-cols-4 gap-4">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSocialShare(option.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50"
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
                  style={{ backgroundColor: option.color }}
                >
                  {option.icon}
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {option.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Link Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Shareable Link</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white truncate"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-lg font-medium ${
                isLinkCopied 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLinkCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSharePopup;
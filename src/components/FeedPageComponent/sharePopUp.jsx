import React, { useState, useRef, useEffect } from "react";
import {
  Search as SearchIcon,
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

const SharePopup = ({ 
  isOpen, 
  onClose, 
  postId, 
  postCaption = "",
  userName = "",
  onShareComplete 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const popupRef = useRef(null);
  const openedTabsRef = useRef({}); // Track opened tabs by platform

  // Sample users data (replace with your actual data)
  const users = [
    { id: 1, name: "Mohamed Haarish", avatar: null },
    { id: 2, name: "Chennai IT Hub", avatar: null },
    { id: 3, name: "Yasar K", avatar: null },
    { id: 4, name: "Hiring TalentElite", avatar: null },
    { id: 5, name: "Shamita Thomas", avatar: null },
    { id: 6, name: "SLA Institute", avatar: null },
    { id: 7, name: "SLA Institute", avatar: null },
    { id: 8, name: "Chennai React", avatar: null },
  ];

  const shareOptions = [
    { id: "whatsapp", name: "WhatsApp", icon: <WhatsApp />, color: "#25D366" },
    { id: "facebook", name: "Facebook", icon: <Facebook />, color: "#1877F2" },
    { id: "twitter", name: "Twitter", icon: <Twitter />, color: "#1DA1F2" },
    { id: "linkedin", name: "LinkedIn", icon: <LinkedIn />, color: "#0A66C2" },
    { id: "telegram", name: "Telegram", icon: <Telegram />, color: "#0088cc" },
    { id: "email", name: "Email", icon: <Email />, color: "#EA4335" },
    { id: "messenger", name: "Messenger", icon: <Message />, color: "#006AFF" },
    { id: "threads", name: "Threads", icon: <span className="text-sm font-bold">t</span>, color: "#000000" },
  ];

  // Clean up opened tabs when component unmounts
  useEffect(() => {
    return () => {
      // Optionally close all opened tabs when component unmounts
      // Object.values(openedTabsRef.current).forEach(tab => {
      //   if (tab && !tab.closed) tab.close();
      // });
    };
  }, []);

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Generate share link
  const shareLink = `${window.location.origin}/post/${postId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
      if (onShareComplete) onShareComplete();
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  const handleShareToUser = (userId) => {
    console.log(`Sharing post ${postId} to user ${userId}`);
    // Add your share logic here
    if (onShareComplete) onShareComplete();
    toast.success(`Shared with user ${userId}`);
    onClose();
  };

  const handleSocialShare = (platform) => {
    const text = encodeURIComponent(`${userName}: ${postCaption}`);
    const url = encodeURIComponent(shareLink);
    
    let shareUrl = "";
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    switch (platform) {
      case "whatsapp":
        if (isMobile) {
          // For mobile, try to open WhatsApp app
          shareUrl = `whatsapp://send?text=${text} ${url}`;
          // Try to open the app, fallback to web if it fails
          window.location.href = shareUrl;
          setTimeout(() => {
            // If WhatsApp app doesn't open, open web version
            const whatsappTab = openedTabsRef.current.whatsapp;
            if (whatsappTab && !whatsappTab.closed) {
              whatsappTab.location.href = `https://web.whatsapp.com/send?text=${text} ${url}`;
              whatsappTab.focus();
            } else {
              openedTabsRef.current.whatsapp = window.open(`https://web.whatsapp.com/send?text=${text} ${url}`, '_blank');
            }
          }, 250);
          if (onShareComplete) onShareComplete();
          onClose();
          return;
        } else {
          // For desktop, open WhatsApp Web
          shareUrl = `https://web.whatsapp.com/send?text=${text} ${url}`;
        }
        break;
        
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
        
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
        
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
        
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
        break;
        
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent(`Check out this post by ${userName}`)}&body=${encodeURIComponent(`${postCaption}\n\n${shareLink}`)}`;
        // For email, open email client
        window.location.href = shareUrl;
        if (onShareComplete) onShareComplete();
        onClose();
        return;
        
      case "messenger":
        // Messenger doesn't have a direct share URL, use Facebook messenger web
        shareUrl = `https://www.facebook.com/dialog/send?link=${url}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(window.location.origin)}`;
        break;
        
      case "threads":
        // Threads doesn't have official share API yet
        const threadsText = `${postCaption}\n\n${shareLink}`;
        navigator.clipboard.writeText(threadsText)
          .then(() => {
            toast.success("Threads share text copied to clipboard!");
            if (onShareComplete) onShareComplete();
            onClose();
          })
          .catch(() => toast.error("Failed to copy text"));
        return;
        
      default:
        return;
    }

    // Check if tab for this platform is already open
    const existingTab = openedTabsRef.current[platform];
    
    if (existingTab && !existingTab.closed) {
      // Tab exists and is not closed - navigate to new URL and focus
      existingTab.location.href = shareUrl;
      existingTab.focus();
    } else {
      // No existing tab or tab was closed - open new tab
      openedTabsRef.current[platform] = window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    
    if (onShareComplete) onShareComplete();
    onClose();
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

  // Import toast if not already available
  const toast = {
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.error(`❌ ${msg}`)
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-md bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={popupRef}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-fadeIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Share</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="text-gray-600" />
          </button>
        </div>

        {/* Search Bar */}
        

        {/* Users List */}
       

        {/* Copy Link Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={copyToClipboard}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <CopyIcon className="text-gray-600" />
            <span className="text-gray-900 font-medium">
              {isLinkCopied ? "Link Copied!" : "Copy link"}
            </span>
          </button>
        </div>

        {/* Social Share Options */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Share to</h3>
          <div className="grid grid-cols-4 gap-3">
            {shareOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleSocialShare(option.id)}
                className="flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md hover:shadow-lg transition-shadow"
                  style={{ backgroundColor: option.color }}
                >
                  {option.icon}
                </div>
                <span className="text-xs text-gray-700 font-medium mt-1">{option.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
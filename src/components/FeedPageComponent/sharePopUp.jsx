// Updated SharePopup.jsx - Uses correct URLs for different purposes
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
  Image as ImageIcon,
  Link as LinkIcon,
  Videocam as VideoIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../api/axios";
import { toast } from "react-hot-toast";

const SharePopup = ({
  isOpen,
  onClose,
  postId,
  postCaption = "",
  userName = "",
  onShareComplete,
}) => {
  const [shareData, setShareData] = useState(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);
  const openedTabsRef = useRef({});

  // Fetch share data when popup opens
  useEffect(() => {
    if (isOpen && postId) {
      fetchShareData();
    } else {
      // Reset state when closing
      setShareData(null);
      setError(null);
      setIsLinkCopied(false);
    }
  }, [isOpen, postId]);

  const fetchShareData = async () => {
    if (!postId) {
      setError("Post ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get OG data from backend API
      const response = await api.get(`/api/feed/share/${postId}`);
      console.log("Share data from backend:", response.data);

      if (!response.data) {
        throw new Error("No data received from server");
      }
      
      // DO NOT swap URLs - use them as intended
      const enhancedData = {
        ...response.data,
        // Keep URLs as they are meant to be:
        // shareUrl: for platforms/crawlers (has OG tags)
        // frontendUrl: for users (prithu.app domain)
        // appRedirectUrl: for deep linking to app
      };
      
      setShareData(enhancedData);
      
    } catch (err) {
      console.error("Failed to fetch share data:", err);
      setError("Failed to load share options. Please try again.");
      toast.error("Failed to load share options");
    } finally {
      setLoading(false);
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
    // Copy FRONTEND URL for users
    const urlToCopy = shareData?.frontendUrl || shareData?.shareUrl;
    
    if (!urlToCopy) {
      toast.error("No share URL available");
      return;
    }
    
    try {
      await navigator.clipboard.writeText(urlToCopy);
      setIsLinkCopied(true);
      toast.success("Link copied to clipboard!");
      
      if (onShareComplete) onShareComplete();
      
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  // Enhanced share function - uses appropriate URLs for different purposes
  const handleSocialShare = async (platform) => {
    if (!shareData) {
      toast.error("Share data not loaded yet");
      return;
    }
    
    // Use the CORRECT URL for each purpose:
    // - For crawlers (WhatsApp, Facebook, etc.): use shareUrl (backend with OG tags)
    // - For direct user sharing: use frontendUrl
    const crawlerUrl = shareData.shareUrl; // For platforms that crawl OG tags
    const userUrl = shareData.frontendUrl; // For users to see/share
    
    const { mediaType } = shareData;
    const displayName = shareData.userName || userName || 'User';
    const caption = shareData.caption || postCaption || '';
    
    let shareUrl = "";
    let textToShare = "";
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // Decide which URL to use based on platform
    const shouldUseCrawlerUrl = ["whatsapp", "facebook", "twitter", "linkedin", "telegram", "messenger"].includes(platform);
    const urlToShare = shouldUseCrawlerUrl ? userUrl :crawlerUrl ;
    const encodedUrl = encodeURIComponent(urlToShare);

    // Platform-specific optimizations
    switch (platform) {
      case "whatsapp":
        // WhatsApp will crawl OG tags from shareUrl
        textToShare = mediaType === 'video' 
          ? `${caption}\n\n🎥 Watch video: ${userUrl}`
          : `${caption}\n\n📸 ${userUrl}`;
        
        const whatsappText = encodeURIComponent(textToShare);
        shareUrl = isMobile 
          ? `whatsapp://send?text=${whatsappText}`
          : `https://web.whatsapp.com/send?text=${whatsappText}`;
        break;

      case "facebook":
        // Facebook scrapes OG tags from shareUrl
        const fbQuote = encodeURIComponent(`${displayName}: ${caption}`);
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${fbQuote}`;
        break;

      case "twitter":
        // Twitter shows card preview from OG tags in shareUrl
        const twitterText = encodeURIComponent(
          mediaType === 'video' ? `🎥 ${caption}\n\n${userUrl}` : `${caption}\n\n${userUrl}`
        );
        shareUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodedUrl}`;
        break;

      case "linkedin":
        // LinkedIn uses OG tags from shareUrl
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;

      case "telegram":
        // Telegram shows link preview from shareUrl
        const telegramText = encodeURIComponent(
          mediaType === 'video' ? `🎬 ${caption}\n\n${userUrl}` : `${caption}\n\n${userUrl}`
        );
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${telegramText}`;
        break;

      case "email":
        // Email - use user-friendly URL
        const subject = mediaType === 'video'
          ? `Watch this video by ${displayName}`
          : `Check out this post by ${displayName}`;
        
        const emailBody = `${caption}\n\n${mediaType === 'video' ? 'Watch here' : 'View here'}: ${userUrl}\n\nShared via Prithu App`;
        
        shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
        break;

      case "messenger":
        // Messenger - use crawler URL for preview
        shareUrl = `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=542599432471018&redirect_uri=${encodeURIComponent(userUrl)}`;
        break;

      case "copy":
        copyToClipboard();
        return;

      default:
        toast.error("Unknown platform");
        return;
    }

    // Handle platform-specific opening
    try {
      if (platform === "email") {
        window.location.href = shareUrl;
      } else if (platform === "whatsapp" && isMobile) {
        // Try to open WhatsApp app
        window.location.href = shareUrl;
        setTimeout(() => {
          const tab = openedTabsRef.current.whatsapp;
          if (tab && !tab.closed) {
            try {
              tab.location.href = shareUrl.replace('whatsapp://', 'https://web.whatsapp.com/');
              tab.focus();
            } catch (e) {
              // Open new tab if can't access
              openedTabsRef.current.whatsapp = window.open(
                shareUrl.replace('whatsapp://', 'https://web.whatsapp.com/'),
                '_blank'
              );
            }
          } else {
            openedTabsRef.current.whatsapp = window.open(
              shareUrl.replace('whatsapp://', 'https://web.whatsapp.com/'),
              '_blank'
            );
          }
        }, 300);
      } else {
        // Open in new tab
        const existingTab = openedTabsRef.current[platform];
        if (existingTab && !existingTab.closed) {
          try {
            existingTab.location.href = shareUrl;
            existingTab.focus();
          } catch (e) {
            // Open new tab if can't access
            openedTabsRef.current[platform] = window.open(
              shareUrl,
              '_blank',
              'noopener,noreferrer'
            );
          }
        } else {
          openedTabsRef.current[platform] = window.open(
            shareUrl,
            '_blank',
            'noopener,noreferrer'
          );
        }
      }
    } catch (err) {
      console.error("Error opening share:", err);
      toast.error("Could not open share window");
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

  // Don't render if not open
  if (!isOpen) return null;

  // Determine which URL to show in the input field (show user-friendly URL)
  const displayUrl = shareData?.frontendUrl || shareData?.shareUrl || "";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        ref={popupRef}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${shareData?.mediaType === 'video' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
              {shareData?.mediaType === 'video' ? <VideoIcon /> : <ImageIcon />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Share {shareData?.mediaType === 'video' ? 'Video' : 'Photo'}
              </h2>
              <p className="text-sm text-gray-500">
                {shareData?.userName ? `Shared by ${shareData.userName}` : 'Share this post'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <CloseIcon className="text-gray-600" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2 text-red-700">
              <span className="text-sm">⚠️</span>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={fetchShareData}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Info Banner */}
        {shareData && (
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-center gap-2 text-blue-700 text-sm">
              <span className="text-sm">ℹ️</span>
              <div>
                <p className="font-medium">Smart Link System</p>
                <div className="text-xs mt-1 space-y-1">
                  <p className="flex items-center gap-1">
                    <span className="text-green-500">✓</span>
                    <span>For users: Clean, easy-to-share link</span>
                  </p>
                  <p className="flex items-center gap-1">
                    <span className="text-blue-500">✓</span>
                    <span>For platforms: Rich previews automatically</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Social Share Grid */}
        {!error && (
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
              Share to platforms
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSocialShare(option.id)}
                  disabled={loading || !shareData}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div 
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: option.color }}
                  >
                    {option.icon}
                  </div>
                  <span className="text-xs font-medium text-gray-700 mt-1">
                    {option.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Link Section */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <LinkIcon className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Shareable Link</span>
            {shareData?.mediaType && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {shareData.mediaType === 'video' ? '🎥 Video' : '📸 Photo'}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              // Show the user-friendly URL (frontend)
              value={displayUrl || (loading ? "Loading..." : "Not available")}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white truncate"
              disabled={loading}
              onClick={(e) => e.target.select()}
            />
            <button
              onClick={copyToClipboard}
              disabled={!displayUrl || loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors min-w-[80px] ${
                isLinkCopied 
                  ? 'bg-green-100 text-green-700 border border-green-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {isLinkCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          {/* URL Information */}
          {shareData && (
            <div className="mt-3 text-xs text-gray-600 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <div>
                  <p className="font-medium">How it works:</p>
                  <ul className="mt-1 space-y-1">
                    <li className="flex items-center gap-1">
                      <span className="text-blue-500">•</span>
                      <span>Copy & share the link above with anyone</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-purple-500">•</span>
                      <span>On WhatsApp/Facebook: Shows rich preview</span>
                    </li>
                    <li className="flex items-center gap-1">
                      <span className="text-green-500">•</span>
                      <span>When clicked: Opens in app if installed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Preparing share options...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SharePopup;
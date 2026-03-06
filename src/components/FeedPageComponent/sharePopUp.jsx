import React, { useState, useRef, useEffect } from "react";
import {
  ContentCopy as CopyIcon,
  Facebook,
  WhatsApp,
  Email,
  Twitter,
  Telegram,
  Message,
  Image as ImageIcon,
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
  category = "direct",
  sharingUserId = "",
  designMetadata = {}
}) => {
  const [shareData, setShareData] = useState(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const popupRef = useRef(null);

  const backendBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace("/web", "");
  const shareUrl = postId
    ? `${backendBaseUrl}/share/post/${postId}?u=${sharingUserId}&type=${category}`
    : "";

  useEffect(() => {
    if (isOpen && postId) {
      fetchShareData();
    } else {
      setShareData(null);
      setError(null);
      setIsLinkCopied(false);
    }
  }, [isOpen, postId]);

  const fetchShareData = async () => {
    if (!postId) {
      console.warn("⚠️ [SharePopup] No postId provided to fetchShareData");
      setError("Post ID is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("🔥 [SharePopup] Starting share-process for postId:", postId, "category:", category);
      console.log("📤 [SharePopup] Request payload:", { type: category, customMetadata: designMetadata });

      const response = await api.post(`/api/user/feed/share-process/${postId}`, {
        type: category,
        customMetadata: designMetadata
      });

      console.log("✅ [SharePopup] Share process success. Data received:", response.data);
      setShareData(response.data);
    } catch (err) {
      console.error("❌ [SharePopup] Share process failed. Error:", err);
      if (err.response) {
        console.error("❌ [SharePopup] Response error details:", err.response.data);
      }
      // Fallback: stay on simple sharing
    } finally {
      setLoading(false);
    }
  };

  const trackShareAction = async (platform, target = null) => {
    try {
      const shareChannelMap = {
        'whatsapp': 'whatsapp',
        'facebook': 'facebook',
        'twitter': 'twitter',
        'telegram': 'telegram',
        'email': 'email',
        'messenger': 'messenger',
        'copy': 'copy_link'
      };

      await api.post('/api/user/feed/share', {
        feedId: postId,
        shareChannel: shareChannelMap[platform] || platform,
        shareTarget: target
      });
    } catch (error) {
      console.error('Failed to track share:', error);
    }
  };

  const shareOptions = [
    { id: "whatsapp", name: "WhatsApp", icon: <WhatsApp />, color: "#25D366" },
    { id: "facebook", name: "Facebook", icon: <Facebook />, color: "#1877F2" },
    { id: "twitter", name: "Twitter", icon: <Twitter />, color: "#1DA1F2" },
    { id: "telegram", name: "Telegram", icon: <Telegram />, color: "#0088cc" },
    { id: "email", name: "Email", icon: <Email />, color: "#EA4335" },
    { id: "messenger", name: "Messenger", icon: <Message />, color: "#006AFF" },
    { id: "copy", name: "Copy Link", icon: <CopyIcon />, color: "#6B7280" },
  ];

  const copyToClipboard = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsLinkCopied(true);
      await trackShareAction('copy');
      toast.success("Link copied!");
      if (onShareComplete) onShareComplete();
      setTimeout(() => setIsLinkCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const handleSocialShare = async (platform) => {
    const urlToShare = shareUrl;
    const encodedUrl = encodeURIComponent(urlToShare);
    const caption = shareData?.caption || postCaption || "";
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    await trackShareAction(platform);

    switch (platform) {
      case "whatsapp": window.open(isMobile ? `whatsapp://send?text=${encodeURIComponent(`${caption}\n\n${urlToShare}`)}` : `https://web.whatsapp.com/send?text=${encodeURIComponent(`${caption}\n\n${urlToShare}`)}`, "_blank"); break;
      case "facebook": window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank"); break;
      case "messenger": window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank", "width=600,height=500"); break;
      case "twitter": window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(caption)}`, "_blank"); break;
      case "telegram": window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(caption)}`, "_blank"); break;
      case "email": {
        const mailto = `mailto:?subject=${encodeURIComponent("Check out this post")}&body=${encodeURIComponent(`${caption}\n\n${urlToShare}`)}`;
        window.location.href = mailto;
        break;
      }
      case "copy": await copyToClipboard(); return;
    }

    if (onShareComplete) onShareComplete();
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div ref={popupRef} className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              {shareData?.mediaType === 'video' ? <VideoIcon /> : <ImageIcon />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Share Post</h2>
              <p className="text-sm text-gray-500">Share this post with others</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><CloseIcon /></button>
        </div>

        <div className="p-6">
          {/* Media Preview Section */}
          <div className="mb-6 bg-gray-50 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center border border-gray-100 shadow-inner">
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-500">Processing preview...</p>
              </div>
            ) : shareData ? (
              (() => {
                console.log("🎬 [SharePopup] Rendering preview:", {
                  mediaType: shareData.mediaType,
                  videoUrl: shareData.videoUrl,
                  thumbUrl: shareData.thumbUrl
                });
                return shareData.mediaType === 'video' ? (
                  <video
                    src={shareData.videoUrl}
                    poster={shareData.thumbUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                    loop
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const error = e.target.error;
                      console.error("❌ [SharePopup] Video element error:", {
                        code: error?.code,
                        message: error?.message,
                        url: shareData.videoUrl
                      });
                    }}
                    onLoadedData={() => console.log("✅ [SharePopup] Video loaded successfully")}
                  />
                ) : (
                  <img
                    src={shareData.videoUrl || shareData.thumbUrl}
                    alt="Share preview"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                    onError={(e) => console.error("❌ [SharePopup] Image element error:", {
                      url: shareData.videoUrl || shareData.thumbUrl
                    })}
                    onLoad={() => console.log("✅ [SharePopup] Image loaded successfully")}
                  />
                );
              })()
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <ImageIcon sx={{ fontSize: 40 }} />
                <p className="text-xs">Preview not available</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-4 gap-4">
            {shareOptions.map((opt) => (
              <button key={opt.id} onClick={() => handleSocialShare(opt.id)} className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-all active:scale-95">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: opt.color }}>
                  {opt.icon}
                </div>
                <span className="text-[10px] font-medium text-gray-700">{opt.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;

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
  const [progress, setProgress] = useState(0);
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
      setProgress(0);
      console.log("🔥 [SharePopup] Starting share-process for postId:", postId, "category:", category);

      const response = await api.post(`/api/user/feed/share-process/${postId}`, {
        type: category,
        customMetadata: designMetadata
      });

      console.log("✅ [SharePopup] Share process initiated. Job ID:", response.data.jobId);
      // We don't set shareData yet, we wait for the socket completion event
    } catch (err) {
      console.error("❌ [SharePopup] Share process failed. Error:", err);
      setLoading(false);
      setError("Failed to start processing");
    }
  };

  // Real-time Progress Logic via WebSockets
  useEffect(() => {
    const handleProgress = (e) => {
      const { jobId, progress, status } = e.detail;
      // You could optionally filter by jobId if multiple shares happen at once
      console.log(`[SharePopup] Progress update: ${progress}%`);
      setProgress(progress);
    };

    const handleComplete = (e) => {
      const { jobId, videoUrl, thumbUrl, mediaType } = e.detail;
      console.log("✅ [SharePopup] Share processing complete!", videoUrl);
      setShareData({ videoUrl, thumbUrl, mediaType });
      setProgress(100);
      setLoading(false);
    };

    const handleFailed = (e) => {
      const { jobId, error } = e.detail;
      console.error("❌ [SharePopup] Share processing failed:", error);
      setError(error || "Processing failed");
      setLoading(false);
      setProgress(0);
    };

    document.addEventListener('socket:shareProgress', handleProgress);
    document.addEventListener('socket:shareComplete', handleComplete);
    document.addEventListener('socket:shareFailed', handleFailed);

    return () => {
      document.removeEventListener('socket:shareProgress', handleProgress);
      document.removeEventListener('socket:shareComplete', handleComplete);
      document.removeEventListener('socket:shareFailed', handleFailed);
    };
  }, []);

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
    {
      id: "native_share",
      name: shareData?.mediaType === 'video' ? "Share Video" : "Share Image",
      icon: shareData?.mediaType === 'video' ? <VideoIcon /> : <ImageIcon />,
      color: "#4F46E5"
    },
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

  const handleFileShare = async () => {
    if (!shareData || !shareData.videoUrl) {
      toast.error("Media not ready for sharing");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(shareData.videoUrl, { mode: 'cors' });
      const blob = await response.blob();
      const fileName = shareData.mediaType === 'video' ? 'video.mp4' : 'image.jpg';
      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: shareData.caption || "Check out this post",
          text: shareData.caption || "",
        });
        await trackShareAction('native_file_share');
        if (onShareComplete) onShareComplete();
      } else {
        toast.error("Sharing files is not supported on this browser");
        // Fallback to normal share if needed, or just let them know
      }
    } catch (err) {
      console.error("❌ [SharePopup] File sharing failed:", err);
      toast.error("Failed to share file");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialShare = async (platform) => {
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

    // On mobile, if it's the native share button OR if the user clicks any social icon,
    // we try to share the actual file via the system share sheet first.
    if (isMobile && platform !== 'copy' && platform !== 'email') {
      try {
        // If they clicked a specific icon, we still try to share the file
        // because that's what's expected for media content on mobile.
        await handleFileShare();
        return;
      } catch (err) {
        console.warn("⚠️ [SharePopup] Native file share failed, falling back to link share:", err);
        // Fall through to standard link sharing
      }
    }

    if (platform === 'native_share') {
      await handleFileShare();
      return;
    }

    const urlToShare = shareUrl;
    const encodedUrl = encodeURIComponent(urlToShare);
    const caption = shareData?.caption || postCaption || "";

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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={popupRef}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] md:h-[500px] overflow-y-auto md:overflow-hidden shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 md:bg-gray-100 md:hover:bg-gray-200 text-white md:text-gray-900 rounded-full z-[60] transition-colors shadow-lg"
          title="Close"
        >
          <CloseIcon sx={{ fontSize: 24 }} />
        </button>

        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side: Media Preview */}
          <div className="w-full md:w-3/5 bg-black flex items-center justify-center md:min-h-0 h-auto md:h-full max-h-[80vh] md:max-h-none flex-shrink-0 overflow-hidden">
            {loading && !shareData ? (
              <div className="flex flex-col items-center gap-6 text-white w-full max-w-xs px-6">
                <div className="relative w-20 h-20">
                  {/* Outer Spin */}
                  <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  {/* Inner Percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">{Math.round(progress)}%</span>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <p className="text-center text-sm font-medium tracking-wide text-blue-100/80">
                    {progress < 40 ? "Initializing..." : progress < 80 ? "Processing Media..." : "Finalizing Preview..."}
                  </p>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ) : shareData ? (
              <div className="w-full h-full relative group">
                {shareData.mediaType === 'video' ? (
                  <video
                    src={shareData.videoUrl}
                    poster={shareData.thumbUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    muted
                    loop
                    crossOrigin="anonymous"
                  />
                ) : (
                  <img
                    src={shareData.videoUrl || shareData.thumbUrl}
                    alt="Share preview"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-500">
                <ImageIcon sx={{ fontSize: 60, opacity: 0.3 }} />
                <p className="text-sm">Preview not available</p>
              </div>
            )}
          </div>

          {/* Right Side: Share Options */}
          <div className="w-full md:w-2/5 md:p-6 flex flex-col h-full overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:block mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Share Post</h2>
              <p className="text-sm text-gray-500">Share with your friends</p>
            </div>

            <div className="flex-1 flex flex-col justify-end md:justify-center">
              {/* Mobile View: Single Centered Large Share Button */}
              <div className="md:hidden flex items-center justify-center w-full py-2 bg-white border-t border-gray-100">
                <button
                  onClick={() => handleSocialShare('native_share')}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-12 h-12 bg-[#4F46E5] text-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all">
                    {shareData?.mediaType === 'video' ? <VideoIcon sx={{ fontSize: 24 }} /> : <ImageIcon sx={{ fontSize: 24 }} />}
                  </div>
                  <span className="text-[11px] font-bold text-gray-700">
                    {shareData?.mediaType === 'video' ? "Share Video" : "Share Image"}
                  </span>
                </button>
              </div>

              {/* Desktop View: Social Grid */}
              <div className="hidden md:grid grid-cols-2 gap-3 overflow-y-auto">
                {shareOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSocialShare(opt.id)}
                    className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 transition-all active:scale-95 group"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: opt.color }}
                    >
                      {React.cloneElement(opt.icon, { sx: { fontSize: 20 } })}
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{opt.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Link Copy Shortcut (Desktop only) */}
            {shareUrl && (
              <div className="hidden md:flex mt-6 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200 items-center justify-between gap-3">
                <div className="truncate text-[10px] text-gray-400 font-mono flex-1">
                  {shareUrl}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  {isLinkCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePopup;

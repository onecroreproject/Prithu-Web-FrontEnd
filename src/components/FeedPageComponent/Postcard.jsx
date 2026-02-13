import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PostHeader from "./postCardComponent/postHeader";
import PostMedia from "./postCardComponent/postMeadia";
import PostActions from "./postCardComponent/postsActions";
import SharePopup from "./sharePopUp";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

import {
  useDownloadFeed,
  useFollowUser,
  useLikePost,
  useSavePost,
  useSharePost,
  useUnfollowUser,
  getDownloadStatus,
} from "../../hooks/usePostActions";

import {
  userImageViewCount,
  userVideoViewCount
} from "../../Service/userViewCount";

import FeedOverlayRenderer from "./postCardComponent/FeedOverlayRenderer";
import useFeedAudioPlayer from "../../hooks/useFeedAudioPlayer";
import prithuLogo from "../../assets/prithulogo.png";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

function Postcard({
  postData = {},
  authUser,
  token,
  isVisible,
  onHideFromUI,
  onNotInterested,
  viewMode = "list",
  activeVideoId = null,
  setActiveVideoId,
}) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const mediaContainerRef = useRef(null);

  /* v4: Destructure using new normalized format */
  const {
    feedId = "",
    contentUrl = "",
    type = "image",
    caption = "",
    likesCount: initialLikes = 0,
    timeAgo = "",
    description = "",
    uploadMode = "normal",

    // v4: Objects
    postedBy = {},
    viewer = {},

    // v4: Stats & Interact
    stats = {},
    userInteractions = {},

    // v4: Design & Audio
    overlayElements = [],
    hasFooter = false,
    aspectRatio: postAspectRatio = "1:1",
    designMetadata = {},
    category = "",
  } = postData || {};

  const editMetadata = designMetadata.editMetadata || postData.editMetadata || {};

  const isTemplate = uploadMode === "template" || postData.uploadType === "template";

  // ✅ Header should show postedBy (creator)
  const userId = postedBy?.id || "";
  const userName = postedBy?.name || "Unknown";
  const profileAvatar = postedBy?.avatar || defaultAvatar;

  // ✅ Overlays + Audio must use viewer / designMetadata
  const audioConfig = designMetadata?.audioConfig || null;

  // v3: Stats Fallbacks
  // const initialComments = stats.comments || postData.commentsCount || 0;

  const tempUser = authUser || { _id: "guest", userName: "You" };

  // ✅ Type detection
  const isVideo = type === "video";
  const isImage = type === "image";

  // Local state
  const [isLiked, setIsLiked] = useState(userInteractions.isLiked || postData.isLiked || false);
  const [isSaved, setIsSaved] = useState(userInteractions.isSaved || postData.isSaved || false);
  // const [comments, setComments] = useState([]);
  // const [commentCount, setCommentCount] = useState(initialComments);
  const { isGlobalMuted, setIsGlobalMuted } = useAuth();
  const isMuted = isGlobalMuted; // Alias for cleaner diff
  const setIsMuted = setIsGlobalMuted; // Alias for cleaner diff
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasAnimatedOnce, setHasAnimatedOnce] = useState(false);
  const [likesCount, setLikesCount] = useState(stats.likes || initialLikes);
  const [sharesCount, setSharesCount] = useState(stats.shares || postData.shareCount || 0);
  const [downloadCount, setDownloadCount] = useState(stats.downloads || postData.downloadCount || 0);
  const [isFollowing, setIsFollowing] = useState(
    userInteractions.isFollowing || postData?.isFollowing || false
  );
  const [loading, setLoading] = useState(true);
  // const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const [showSharePopup, setShowSharePopup] = useState(false);

  const [imageViewCounted, setImageViewCounted] = useState(false);
  const [videoViewCounted, setVideoViewCounted] = useState(false);
  const [videoSessionId, setVideoSessionId] = useState(0);

  // const { data: commentsData } = useComments(feedId, showCommentsModal);

  const likeMutation = useLikePost();
  const saveMutation = useSavePost(feedId);
  const shareMutation = useSharePost(feedId, viewer.id || tempUser._id);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const downloadMutation = useDownloadFeed();

  /* ---------------------------- Audio Logic Hook (ONLY for image + audio) ---------------------------- */
  const {
    hasAudio,
    isPlayingAudio = false,
    isBlocked,
    manualToggle,
    playSessionId,
    currentTime,
    duration
  } = useFeedAudioPlayer({
    audioConfig: audioConfig,
    isVisible,
  });

  const audioProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // ✅ Immediate "Best Guess" Color to avoid initial black flicker
  const getInitialColor = (url) => {
    if (!url) return "#1a1a1a";
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = url.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;
    return `rgb(${Math.abs(r % 120 + 20)}, ${Math.abs(g % 120 + 20)}, ${Math.abs(b % 120 + 20)})`;
  };

  const [dominantColor, setDominantColor] = useState(() => getInitialColor(contentUrl));

  // ✅ Immediately sync color when URL changes to avoid seeing previous post's color
  useEffect(() => {
    setDominantColor(getInitialColor(contentUrl));
  }, [contentUrl]);

  // ✅ Stable callback for color extraction from PostMedia
  const handleColorExtract = useCallback((color) => {
    if (color) {
      setDominantColor(color);
    }
  }, []);

  // ✅ Stabilize editMetadata to prevent constant re-renders/re-extractions in PostMedia
  const stabilizedEditMetadata = useMemo(() => ({
    ...editMetadata,
    onColorExtract: handleColorExtract
  }), [editMetadata, handleColorExtract]);

  // ✅ FINAL animation switch: video animates ONCE per viewport session
  const isAnimating = isVideo
    ? (isVideoPlaying && !hasAnimatedOnce)
    : (isTemplate && isPlayingAudio);

  // ✅ Reset animation flag when out of viewport (new session)
  useEffect(() => {
    if (!isVisible) {
      setHasAnimatedOnce(false);
    }
  }, [isVisible]);

  // Update comments
  // useEffect(() => {
  //   if (commentsData) {
  //     setComments(commentsData.slice(0, 10));
  //   }
  // }, [commentsData]);

  // IMAGE VIEW COUNT
  useEffect(() => {
    if (type !== "image") return;
    if (!feedId || !isVisible) return;
    if (imageViewCounted) return;

    userImageViewCount(feedId)
      .then(() => {
        setImageViewCounted(true);
      })
      .catch((err) =>
        console.error("❌ Image view failed →", feedId, err)
      );
  }, [type, feedId, isVisible, imageViewCounted]);

  // VIDEO VIEW COUNT
  useEffect(() => {
    if (type !== "video") return;
    if (!feedId || !isVisible) return;
    if (videoViewCounted) return;

    const video = videoRef.current;
    if (!video) return;

    let watchThresholdMet = false;

    const handleVideoTracking = () => {
      if (videoViewCounted || watchThresholdMet) return;

      userVideoViewCount(feedId)
        .then(() => {
          setVideoViewCounted(true);
          watchThresholdMet = true;
        })
        .catch((err) =>
          console.error("❌ Video view failed →", feedId, err)
        );
    };

    // Trigger on 'ended'
    video.addEventListener("ended", handleVideoTracking);

    // Trigger after 3 seconds of watch time (or when 50% reached for short videos)
    const handleTimeUpdate = () => {
      if (!videoViewCounted && video.currentTime >= Math.min(3, video.duration / 2)) {
        handleVideoTracking();
        video.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("ended", handleVideoTracking);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [type, feedId, isVisible, videoViewCounted]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [postData]);

  // ✅ COORDINATED Viewport control for VIDEO (pause when out of viewport OR another video is active)
  useEffect(() => {
    if (!isVideo) return;
    const vid = videoRef.current;
    if (!vid) return;

    const isCurrentActive = activeVideoId === feedId;
    const shouldPause = !isVisible || (!isCurrentActive && activeVideoId !== null);

    if (shouldPause) {
      vid.pause();
      setIsPlaying(false);
    } else if (isVisible && (isCurrentActive || activeVideoId === null)) {
      // ✅ Only autoplay if in LIST view
      if (viewMode === 'list') {
        // Only start if not already playing
        if (vid.paused) {
          vid.currentTime = 0;
          setVideoSessionId((prev) => prev + 1);
          vid.play().then(() => setIsPlaying(true)).catch((err) => {
            if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
              console.error("Autoplay failed:", err);
            }
            setIsPlaying(false);
          });
        }
      } else {
        // In grid view, ensure it's paused initially
        vid.pause();
        setIsPlaying(false);
      }
    }
  }, [isVisible, isVideo, viewMode, activeVideoId, feedId]);

  // ✅ Immediately sync color when URL changes to avoid seeing previous post's color
  useEffect(() => {
    setDominantColor(getInitialColor(contentUrl));
  }, [contentUrl]);

  // Handle browser tab/window switch
  useEffect(() => {
    if (!isVideo) return;

    const handleVisibilityChange = () => {
      const vid = videoRef.current;
      if (!vid) return;

      if (document.hidden) {
        vid.pause();
      } else if (isVisible) {
        // Only restart if it's currently visible in the feed
        vid.currentTime = 0;
        setVideoSessionId((prev) => prev + 1);
        vid.play().catch(() => { });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isVideo, isVisible]);

  /* ---------------------------- ACTION HANDLERS ---------------------------- */

  const togglePlayPause = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      if (setActiveVideoId) setActiveVideoId(feedId);
      // ✅ Restart from beginning when played after a pause
      vid.currentTime = 0;
      setVideoSessionId((prev) => prev + 1);

      vid.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error("Manual play failed:", err);
          }
          setIsPlaying(false);
        });
    } else {
      vid.pause();
      setIsPlaying(false);
    }
  }, [feedId, setActiveVideoId]);

  const toggleMute = useCallback(() => {
    setIsGlobalMuted((p) => !p);
  }, [setIsGlobalMuted]);

  const stableFeedId = useRef(feedId);
  useEffect(() => {
    stableFeedId.current = feedId;
  }, [feedId]);

  const handleLikeFeed = useCallback(() => {
    const updated = !isLiked;

    setIsLiked(updated);
    setLikesCount((p) => (updated ? p + 1 : Math.max(p - 1, 0)));

    likeMutation.mutate(
      {
        feedId: stableFeedId.current,
        userId: tempUser._id,
        action: updated ? "like" : "unlike",
      },
      {
        onError: () => {
          setIsLiked(!updated);
          setLikesCount((p) =>
            updated ? Math.max(p - 1, 0) : p + 1
          );
          toast.error("Failed to update like");
        },
      }
    );
  }, [isLiked, likeMutation, tempUser._id]);

  const handleDoubleTapLike = useCallback((tapX, tapY) => {
    if (isLiked) return;

    if (mediaContainerRef.current) {
      const rect = mediaContainerRef.current.getBoundingClientRect();
      const x = tapX - rect.left;
      const y = tapY - rect.top;
      setHeartPosition({ x, y });
    } else {
      setHeartPosition({ x: 0, y: 0 });
    }

    setShowHeartAnimation(true);

    const updated = true;
    setIsLiked(updated);
    setLikesCount((p) => p + 1);

    likeMutation.mutate(
      {
        feedId: stableFeedId.current,
        userId: tempUser._id,
        action: "like",
      },
      {
        onError: () => {
          setIsLiked(false);
          setLikesCount((p) => Math.max(p - 1, 0));
          toast.error("Failed to update like");
        },
      }
    );

    setTimeout(() => {
      setShowHeartAnimation(false);
    }, 600);
  }, [isLiked, likeMutation, tempUser._id]);

  const handleSave = useCallback(async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    saveMutation.mutate(
      { feedId },
      {
        onSuccess: (data) => {
          const saved =
            data?.savedFeeds?.some((f) => f.feedId === feedId) ??
            newSavedState;
          setIsSaved(saved);
          toast.success(saved ? "Post saved!" : "Post unsaved!");
        },
        onError: () => {
          setIsSaved(!newSavedState);
          toast.error("Save failed");
        },
      }
    );
  }, [isSaved, feedId, saveMutation]);

  const handleShare = useCallback(async () => {
    setShowSharePopup(true);
    setSharesCount((p) => p + 1);
    shareMutation.mutate({
      feedId,
      userId: tempUser._id,
      shareChannel: "share_popup",
    }, {
      onError: () => {
        setSharesCount((p) => Math.max(p - 1, 0));
      }
    });
  }, [feedId, tempUser._id, shareMutation]);

  // Download Logic

  const handleDownload = () => {
    if (!feedId) return toast.error("Invalid feed!");

    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.prithu.app';
    const token = localStorage.getItem('token');
    const activeUserId = localStorage.getItem('userId');

    if (!token || activeUserId === "guest") {
      return toast.error("Please login to download");
    }

    setDownloadCount((p) => p + 1);

    // Trigger direct browser download
    const downloadUrl = `${BACKEND_URL}/api/user/feed/${feedId}/direct-download?userId=${activeUserId}&token=${token}`;

    toast.success("Download started!");
    window.location.href = downloadUrl;
  };

  const handleFollow = useCallback(() => {
    const optimistic = !isFollowing;
    setIsFollowing(optimistic);

    const mutation = optimistic ? followMutation : unfollowMutation;

    mutation.mutate(
      {
        targetUserId: userId,
        currentUserId: tempUser._id,
      },
      {
        onSuccess: () => {
          if (optimistic) {
            // setShowCommentsModal(true);
          }
        },
        onError: () => {
          setIsFollowing(!optimistic);
          toast.error(optimistic ? "Follow failed" : "Unfollow failed");
        },
      }
    );
  }, [isFollowing, followMutation, unfollowMutation, userId, tempUser._id]);

  const handleUnfollow = useCallback(() => {
    handleFollow();
  }, [handleFollow]);

  if (loading) {
    return (
      <div className="w-full max-w-[470px] mx-auto bg-gray-200 animate-pulse mb-6 rounded-none">
        <div className="w-full aspect-square"></div>
      </div>
    );
  }


  return (
    <>
      <div className={`w-full ${viewMode === 'grid' ? 'max-w-none rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-0 aspect-[9/16] flex flex-col' : 'max-w-[470px] sm:max-w-[320px] sm:border-b border-gray-300 sm:mb-6 last:mb-0 snap-start h-full sm:h-auto sm:max-h-[700px] flex flex-col '} mx-auto bg-white transition-all duration-300`}>
        {/* ✅ 1. USER HEADER (Restored) */}
        {!isTemplate && viewMode === 'list' && (
          <div className="shrink-0 w-full">
            <PostHeader
              authUser={authUser}
              data={postData}
              onUnfollow={handleUnfollow}
              onHideFromUI={onHideFromUI}
              onNotInterested={onNotInterested}
            />
          </div>
        )}

        <div
          ref={mediaContainerRef}
          className="relative bg-white w-full flex-1 min-h-0 flex flex-col items-center justify-center overflow-hidden"
          onClick={() => {
            if (isVideo) {
              togglePlayPause();
            } else {
              // setShowCommentsModal(true);
            }
          }}
        >
          {/* 1. MEDIA PART */}
          <div className="relative w-full flex-1 min-h-0 flex flex-col items-center overflow-hidden">
            <PostMedia
              type={type}
              contentUrl={contentUrl}
              videoRef={videoRef}
              isMuted={isMuted}
              // onCommentsClick={() => setShowCommentsModal(true)}
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              toggleMute={toggleMute}
              onDoubleTap={handleDoubleTapLike}
              aspectRatio={(designMetadata?.canvasSettings?.aspectRatio || postAspectRatio || "1:1")}
              editMetadata={stabilizedEditMetadata}
              isTemplate={isTemplate}
              viewMode={viewMode}
              onVideoPlay={() => {
                setIsVideoPlaying(true);
                if (!hasAnimatedOnce) {
                  setHasAnimatedOnce(true);
                }
              }}
              onVideoPause={() => setIsVideoPlaying(false)}
              onVideoEnded={() => {
                setIsVideoPlaying(false);
                const vid = videoRef.current;
                if (vid) {
                  vid.currentTime = 0;
                  setVideoSessionId((prev) => prev + 1);
                  vid.play().catch((err) => {
                    if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
                      console.error("Loop play failed:", err);
                    }
                  });
                }
              }}
              overlaySlot={
                <>
                  {/* ✅ Mute/Unmute Toggle for Video (Top Right of Media Area ONLY) */}
                  {isVideo && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="absolute z-40 top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition cursor-pointer pointer-events-auto shadow-md"
                    >
                      {isMuted ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.65.52-1.37.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                      )}
                    </button>
                  )}

                  {/* ✅ OVERLAYS - Positioned absolute OVER the media pixels ONLY */}
                  {overlayElements?.length > 0 && (isVideo ? isVideoPlaying : true) && (
                    <div className="absolute inset-0 pointer-events-none z-30">
                      <FeedOverlayRenderer
                        overlayElements={overlayElements}
                        viewer={viewer}
                        visibilityConfig={postData.footerDisplay?.showElements}
                        prithuLogoUrl={prithuLogo}
                        playSessionId={isVideo ? videoSessionId : playSessionId}
                        isVisible={isVisible && (isVideo ? isVideoPlaying : true)}
                        freezeAtEnd={!isVisible}
                      />
                    </div>
                  )}

                  {/* ✅ AUDIO CONTROL BUTTON - (Bottom Right of Media Area ONLY) */}
                  {isTemplate && hasAudio && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        manualToggle();
                      }}
                      className="absolute z-40 bottom-3 right-3 bg-black/60 text-white text-[10px] px-2 py-1.5 rounded-full hover:bg-black/80 transition cursor-pointer pointer-events-auto border border-white/20"
                    >
                      {isPlayingAudio ? "🔊 Pause" : "🔇 Play Audio"}
                    </button>
                  )}

                  {/* ✅ AUDIO PROGRESS BAR - (Top of Media Area ONLY) */}
                  {isTemplate && hasAudio && isPlayingAudio && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
                      <div
                        className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-[width] duration-100 ease-linear"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Optional: show autoplay blocked warning */}
                  {isTemplate && hasAudio && isBlocked && !isPlayingAudio && (
                    <div className="absolute bottom-12 right-3 z-40 bg-red-500 text-white px-2 py-1 rounded text-[10px] animate-pulse">
                      Tap to start audio
                    </div>
                  )}
                </>
              }
              footerSlot={
                /* 2. FOOTER CONFIG (Placed below isolated media area) */
                isTemplate && hasFooter && (() => {
                  const footer = postData.footerDisplay || {};
                  const showElements = footer.showElements || {};
                  const icons = (footer.socialIcons || []).filter(
                    (i) => i.visible && (i.urlTemplate || i.url)
                  );
                  const hasAnyElementEnabled =
                    showElements.userName ||
                    showElements.email ||
                    showElements.phone ||
                    (showElements.socialIcons && icons.length > 0);

                  if (!hasAnyElementEnabled) return null;

                  const footerBg = footer.useDominantColor ? dominantColor : (footer.backgroundColor || "#000000");

                  // Helper to determine if color is light
                  const isLight = (() => {
                    if (!footerBg) return false;
                    let r, g, b;
                    if (footerBg.startsWith("rgb")) {
                      const values = footerBg.match(/\d+/g);
                      if (!values) return false;
                      [r, g, b] = values.map(Number);
                    } else {
                      const hex = footerBg.replace("#", "");
                      r = parseInt(hex.substring(0, 2), 16) || 0;
                      g = parseInt(hex.substring(2, 4), 16) || 0;
                      b = parseInt(hex.substring(4, 6), 16) || 0;
                    }
                    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                    return luminance > 0.6;
                  })();

                  const textColor = isLight ? "text-gray-900" : "text-white";
                  const subTextColor = isLight ? "text-gray-700" : "text-white/90";

                  return (
                    <div
                      className={`relative w-full z-30 py-2 shrink-0 flex flex-col gap-1 border-t transition-colors duration-1000 ease-in-out ${isLight ? 'border-black/10' : 'border-white/10'}`}
                      style={{
                        backgroundColor: footerBg,
                        background: footerBg,
                        boxSizing: 'border-box',
                      }}
                    >
                      {/* Top Row: Username + Social Icons */}
                      <div
                        className={`flex items-center gap-2 px-4 ${showElements.userName && showElements.socialIcons && icons.length > 0
                          ? "justify-between"
                          : "justify-center"
                          }`}
                      >
                        {showElements.userName && (
                          <span
                            className={`font-bold truncate ${textColor}`}
                            style={{ fontSize: "14px" }}
                          >
                            {viewer?.userName || "Username"}
                          </span>
                        )}

                        {showElements.socialIcons && icons.length > 0 && (
                          <div className="flex items-center gap-2.5">
                            {icons.map((icon, idx) => (
                              <a
                                key={idx}
                                href={icon.urlTemplate || icon.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`${isLight ? 'bg-black/10 hover:bg-black/20' : 'bg-white/20 hover:bg-white/40'} p-1.5 rounded-full backdrop-blur-sm transition-all shadow-lg active:scale-90 pointer-events-auto cursor-pointer`}
                              >
                                <img
                                  src={`https://cdn.simpleicons.org/${icon.platform === "twitter" ? "x" : icon.platform}`}
                                  className={`w-3.5 h-3.5 object-contain ${isLight ? "" : "invert"}`}
                                  alt={icon.platform}
                                  onError={(e) => { e.currentTarget.src = defaultAvatar; }}
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Bottom Row: Email + Phone */}
                      {((showElements.email && viewer?.email) || (showElements.phone && viewer?.phoneNumber)) && (
                        <div className="flex items-center justify-between gap-4 w-full px-4">
                          {showElements.email && viewer?.email && (
                            <span className={`${subTextColor} font-medium truncate`} style={{ fontSize: "12px" }}>
                              {viewer.email}
                            </span>
                          )}
                          {showElements.phone && viewer?.phoneNumber && (
                            <span className={`${subTextColor} font-medium truncate`} style={{ fontSize: "12px" }}>
                              {viewer.phoneNumber}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              }
            />
          </div>

          {showHeartAnimation && (
            <div
              className="absolute pointer-events-none z-30"
              style={{
                left: `${heartPosition.x}px`,
                top: `${heartPosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="animate-heart-pulse">
                <svg
                  className="w-24 h-24 text-red-500 filter drop-shadow-lg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
          )}

          <div className="shrink-0 w-full mt-auto bg-white border-t border-gray-100/50">
            <PostActions
              isLiked={isLiked}
              isSaved={isSaved}
              likesCount={likesCount}
              shareCount={sharesCount}
              downloadCount={downloadCount}
              viewsCount={postData.stats?.views || postData.viewsCount || 0}
              post={postData}
              handleLikeFeed={handleLikeFeed}
              handleShare={handleShare}
              handleSave={handleSave}
              caption={caption}
              userName={userName}
              handleDownload={handleDownload}
              // onCommentsClick={() => setShowCommentsModal(true)}
              feedId={feedId}
              categoryId={postData.category}
              tempUser={tempUser}
              token={token}
              onHideFromUI={onHideFromUI}
              onNotInterested={onNotInterested}
              viewMode={viewMode}
            />
          </div>

          {/* <PostCommentsModal
             open={showCommentsModal}
             onClose={() => setShowCommentsModal(false)}
             post={postData}
             authUser={tempUser}
             feedId={feedId}
             setCommentCount={setCommentCount}
             comments={comments}
             setComments={setComments}
             onFollowUpdate={setIsFollowing}
             isFollowing={isFollowing}
           /> */}

          <SharePopup
            isOpen={showSharePopup}
            onClose={() => setShowSharePopup(false)}
            postId={feedId}
            postCaption={description || caption || ""}
            userName={userName}
            mediaFiles={contentUrl ? [{ url: contentUrl, type: type }] : []}
          />
        </div>
      </div>
    </>
  );
}

export default React.memo(Postcard);

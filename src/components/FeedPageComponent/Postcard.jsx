import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import PostHeader from "./postCardComponent/postHeader";
import PostMedia from "./postCardComponent/postMeadia";
import PostActions from "./postCardComponent/postsActions";
import PostCommentsModal from "./PostCommentsModal";
import SharePopup from "./sharePopUp";
import { toast } from "react-hot-toast";
import { useComments } from "../../hooks/useComments";

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
  } = postData || {};
  console.log("footer", designMetadata)
  const editMetadata = designMetadata.editMetadata || postData.editMetadata || {};

  const isTemplate = uploadMode === "template" || postData.uploadType === "template";

  // ✅ Header should show postedBy (creator)
  const userId = postedBy?.id || "";
  const userName = postedBy?.name || "Unknown";
  const profileAvatar = postedBy?.avatar || defaultAvatar;

  // ✅ Overlays + Audio must use viewer / designMetadata
  const audioConfig = designMetadata?.audioConfig || null;

  // v3: Stats Fallbacks
  const initialComments = stats.comments || postData.commentsCount || 0;

  const tempUser = authUser || { _id: "guest", userName: "You" };

  // ✅ Type detection
  const isVideo = type === "video";
  const isImage = type === "image";

  // Local state
  const [isLiked, setIsLiked] = useState(userInteractions.isLiked || postData.isLiked || false);
  const [isSaved, setIsSaved] = useState(userInteractions.isSaved || postData.isSaved || false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(initialComments);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [hasAnimatedOnce, setHasAnimatedOnce] = useState(false);
  const [likesCount, setLikesCount] = useState(stats.likes || initialLikes);
  const [isFollowing, setIsFollowing] = useState(
    userInteractions.isFollowing || postData?.isFollowing || false
  );
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const [showSharePopup, setShowSharePopup] = useState(false);

  const [imageViewCounted, setImageViewCounted] = useState(false);
  const [videoViewCounted, setVideoViewCounted] = useState(false);
  const [videoSessionId, setVideoSessionId] = useState(0);

  const { data: commentsData } = useComments(feedId, showCommentsModal);

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
    audioConfig: isTemplate ? audioConfig : null,
    isVisible,
  });

  const audioProgress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const [dominantColor, setDominantColor] = useState("#1a1a1a");

  const extractColorFromURL = (url) => {
    if (!url) return "#1a1a1a";
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = url.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;
    return `rgb(${Math.abs(r)}, ${Math.abs(g)}, ${Math.abs(b)})`;
  };

  useEffect(() => {
    if (contentUrl) {
      setDominantColor(extractColorFromURL(contentUrl));
    }
  }, [contentUrl]);

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
  useEffect(() => {
    if (commentsData) {
      setComments(commentsData.slice(0, 10));
    }
  }, [commentsData]);

  // IMAGE VIEW COUNT
  useEffect(() => {
    if (type !== "image") return;
    if (!feedId || !token) return;
    if (!isVisible) return;
    if (imageViewCounted) return;

    userImageViewCount(feedId)
      .then(() => {
        setImageViewCounted(true);
      })
      .catch((err) =>
        console.error("❌ Image view failed →", feedId, err)
      );
  }, [type, feedId, token, isVisible, imageViewCounted]);

  // VIDEO VIEW COUNT
  useEffect(() => {
    if (type !== "video") return;
    if (!feedId || !token) return;
    if (!isVisible) return;
    if (videoViewCounted) return;

    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      userVideoViewCount(feedId)
        .then(() => {
          setVideoViewCounted(true);
        })
        .catch((err) =>
          console.error("❌ Video view failed →", feedId, err)
        );
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [type, feedId, token, isVisible, videoViewCounted]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [postData]);

  // ✅ Viewport control for VIDEO (pause when out of viewport)
  useEffect(() => {
    if (!isVideo) return;
    const vid = videoRef.current;
    if (!vid) return;

    if (!isVisible) {
      vid.pause();
    } else {
      vid.currentTime = 0;
      setVideoSessionId((prev) => prev + 1);
      vid.play().catch(() => { });
    }
  }, [isVisible, isVideo]);

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
    isPlaying ? vid.pause() : vid.play();
    setIsPlaying((p) => !p);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    const vid = videoRef.current;
    if (vid) vid.muted = !isMuted;
    setIsMuted((p) => !p);
  }, [isMuted]);

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
    shareMutation.mutate({
      feedId,
      userId: tempUser._id,
      shareChannel: "share_popup",
    });
  }, [feedId, tempUser._id, shareMutation]);

  // Download Logic

  const handleDownload = () => {
    if (!feedId) return toast.error("Invalid feed!");

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://prithubackend.1croreprojects.com';
    const token = localStorage.getItem('token');
    const activeUserId = localStorage.getItem('userId');

    if (!token || activeUserId === "guest") {
      return toast.error("Please login to download");
    }

    // Trigger direct browser download
    const downloadUrl = `${BACKEND_URL}/api/user/feed/${feedId}/direct-download?userId=${activeUserId}&token=${token}`;

    // We show a simple toast as native browsers don't give immediate feedback during the processing phase
    toast.success("Download started! Your browser will manage the progress.");

    // Trigger download
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
            setShowCommentsModal(true);
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
      <div className="w-[470px] mx-auto bg-gray-200 animate-pulse mb-6 rounded-none">
        <div className="w-full h-[470px]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="w-[470px] mx-auto bg-white border-b border-gray-300 mb-6 last:mb-0">
        {/* <PostHeader
          userId={userId}
          userName={userName}
          post={postData}
          profileAvatar={profileAvatar}
          timeAgo={timeAgo}
          navigate={navigate}
          feedId={feedId}
          tempUser={tempUser}
          token={token}
          description={description || postData.description || ""}
          onHideFromUI={onHideFromUI}
          onNotInterested={onNotInterested}
          isFollowing={isFollowing}
          onCommentsClick={() => setShowCommentsModal(true)}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        /> */}

        <div
          ref={mediaContainerRef}
          className="relative bg-transparent flex justify-center items-center"
        >
          {/* Fixed aspect-ratio canvas wrapper - matches editor's coordinate system */}
          <div
            className="relative overflow-hidden w-full flex flex-col"
            style={{
              aspectRatio: (editMetadata?.crop?.ratio === 'original'
                ? (designMetadata?.canvasSettings?.aspectRatio?.replace(':', '/') || postAspectRatio?.replace(':', '/') || '9/16')
                : (editMetadata?.crop?.ratio?.replace(':', '/') || '9/16')),
              maxHeight: "max(650px, 80vh)",
              backgroundColor: "transparent"
            }}
          >
            {/* ✅ BACKGROUND LAYER (Blur Image / Glass Video) */}
            <div className="absolute inset-0 z-0">
              {isImage ? (
                <div
                  className="w-full h-full bg-center bg-cover scale-110 blur-2xl"
                  style={{
                    backgroundImage: `url(${contentUrl})`,
                  }}
                />
              ) : (
                <div className="w-full h-full bg-white/30 backdrop-blur-2xl" />
              )}

              {/* ✅ Extra dark overlay only if needed */}
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Media Area (Top) */}
            <div className="flex-1 relative overflow-hidden z-10">
              {/* Media fills the top area */}
              <div className="absolute inset-0">
                <PostMedia
                  type={type}
                  contentUrl={contentUrl}
                  videoRef={videoRef}
                  isMuted={isMuted}
                  onCommentsClick={() => setShowCommentsModal(true)}
                  isPlaying={isPlaying}
                  togglePlayPause={togglePlayPause}
                  toggleMute={toggleMute}
                  onDoubleTap={handleDoubleTapLike}
                  aspectRatio={(designMetadata?.canvasSettings?.aspectRatio || postAspectRatio || "1:1")}
                  editMetadata={{
                    ...editMetadata,
                    onColorExtract: (color) => setDominantColor(color)
                  }}
                  isTemplate={isTemplate}
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
                      vid.play().catch(() => { });
                    }
                  }}
                />
              </div>

              {/* ✅ Mute/Unmute Toggle for Video (Top Right) */}
              {isVideo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="absolute z-40 top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition cursor-pointer pointer-events-auto"
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

              {/* ✅ OVERLAYS - Positioned relative to media area */}
              {isTemplate && overlayElements.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  <FeedOverlayRenderer
                    overlayElements={overlayElements}
                    viewer={viewer}
                    prithuLogoUrl={prithuLogo}
                    playSessionId={isVideo ? videoSessionId : playSessionId}
                    isVisible={isVisible}
                    freezeAtEnd={isTemplate && !isVisible}
                  />
                </div>
              )}

              {/* ✅ AUDIO CONTROL BUTTON - Moved inside media area */}
              {isTemplate && hasAudio && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    manualToggle();
                  }}
                  className="absolute z-40 bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-2 rounded-full hover:bg-black/80 transition cursor-pointer pointer-events-auto"
                >
                  {isPlayingAudio ? "🔊 Pause Audio" : "🔇 Play Audio"}
                </button>
              )}

              {/* ✅ AUDIO PROGRESS BAR - Moved inside media area */}
              {isTemplate && hasAudio && isPlayingAudio && (
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-50">
                  <div
                    className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-[width] duration-100 ease-linear"
                    style={{ width: `${audioProgress}%` }}
                  />
                </div>
              )}

              {/* Optional: show autoplay blocked warning - Moved inside media area */}
              {isTemplate && hasAudio && isBlocked && !isPlayingAudio && (
                <div className="absolute bottom-12 right-3 z-40 bg-red-500 text-white px-3 py-1 rounded text-xs">
                  Tap Play to start audio
                </div>
              )}
            </div>

            {/* v4: Footer Renderer (Inside frame, bottom area) */}
            {/* v4: Footer Renderer (Inside frame, bottom area) */}
            {isTemplate && hasFooter && (() => {
              const footer = postData.footerDisplay || {};
              const showElements = footer.showElements || {};

              const icons = (footer.socialIcons || []).filter(
                (i) => i.visible && (i.urlTemplate || i.url)
              );


              const hasAnyElementEnabled =
                showElements.name ||
                showElements.email ||
                showElements.phone ||
                (showElements.socialIcons && icons.length > 0);

              if (!hasAnyElementEnabled) return null;

              return (
                <div
                  className="relative w-full z-30 px-4 py-2 shrink-0 flex flex-col gap-1"
                  style={{
                    backgroundColor: footer.useDominantColor ? dominantColor : (footer.backgroundColor || "#000000"),
                    background: footer.useDominantColor ? dominantColor : (footer.backgroundColor || "#000000"),
                  }}
                >
                  {/* Top Row: Username + Social Icons */}
                  <div
                    className={`flex items-center gap-2 ${showElements.name && showElements.socialIcons && icons.length > 0
                      ? "justify-between"
                      : "justify-center"
                      }`}
                  >
                    {showElements.name && (
                      <span
                        className="font-bold text-white truncate"
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
                            className="bg-white/20 hover:bg-white/40 p-1.5 rounded-full backdrop-blur-sm transition-all shadow-lg active:scale-90 pointer-events-auto cursor-pointer"
                          >{icon.platform === "twitter" ? <img
                            src={`https://cdn.simpleicons.org/x`}
                            className="w-3.5 h-3.5 object-contain invert"
                            alt={icon.platform}
                            onError={(e) => {
                              e.currentTarget.src = defaultAvatar;
                            }}
                          /> : <img
                            src={`https://cdn.simpleicons.org/${icon.platform}`}
                            className="w-3.5 h-3.5 object-contain invert"
                            alt={icon.platform}
                            onError={(e) => {
                              e.currentTarget.src = defaultAvatar;
                            }}
                          />}

                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom Row: Email + Phone */}
                  {((showElements.email && viewer?.email) || (showElements.phone && viewer?.phoneNumber)) && (
                    <div className="flex items-center justify-between gap-4 w-full">
                      {showElements.email && viewer?.email && (
                        <span className="text-white font-medium truncate opacity-95" style={{ fontSize: "16px" }}>
                          {viewer.email}
                        </span>
                      )}
                      {showElements.phone && viewer?.phoneNumber && (
                        <span className="text-white font-medium truncate opacity-95" style={{ fontSize: "16px" }}>
                          {viewer.phoneNumber}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

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
        </div >

        <PostActions
          isLiked={isLiked}
          isSaved={isSaved}
          likesCount={likesCount}
          post={postData}
          handleLikeFeed={handleLikeFeed}
          handleShare={() => setShowSharePopup(true)}
          handleSave={handleSave}
          caption={caption}
          userName={userName}
          commentCount={commentCount}
          handleDownload={handleDownload}
          onCommentsClick={() => setShowCommentsModal(true)}
        />

        <PostCommentsModal
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
        />

        <SharePopup
          isOpen={showSharePopup}
          onClose={() => setShowSharePopup(false)}
          postId={feedId}
          postCaption={description || caption || ""}
          userName={userName}
          mediaFiles={contentUrl ? [{ url: contentUrl, type: type }] : []}
        />
      </div>
    </>
  );
}

export default React.memo(Postcard);

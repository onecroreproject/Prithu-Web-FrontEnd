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
} from "../../Service/feedService";

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
      vid.play().catch(() => { });
    }
  }, [isVisible, isVideo]);

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

  const handleDownload = () => {
    if (!feedId) return toast.error("Invalid feed!");

    const loadingToast = toast.loading("Preparing download...");

    downloadMutation.mutate(
      { feedId },
      {
        onSuccess: async (data) => {
          const jobId = data?.jobId;
          if (!jobId) {
            toast.dismiss(loadingToast);
            return toast.error("Failed to start download job");
          }

          // Polling function
          const pollStatus = async () => {
            try {
              const statusData = await getDownloadStatus(jobId);

              if (statusData.status === "completed" || statusData.downloadLink || statusData.result?.downloadUrl) {
                const downloadLink = statusData.downloadLink || statusData.result?.downloadUrl;
                if (!downloadLink) {
                  toast.dismiss(loadingToast);
                  return toast.error("No download link found!");
                }

                toast.success("Download ready!", { id: loadingToast });

                // Trigger browser download
                const response = await fetch(downloadLink, { mode: "cors" });
                const blob = await response.blob();
                const blobUrl = window.URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = downloadLink.split("/").pop();
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(blobUrl);
              } else if (statusData.status === "failed") {
                toast.dismiss(loadingToast);
                toast.error("Download processing failed");
              } else {
                // Still processing, poll again in 2 seconds
                setTimeout(pollStatus, 2000);
              }
            } catch (err) {
              toast.dismiss(loadingToast);
              toast.error("Error checking download status");
            }
          };

          pollStatus();
        },
        onError: () => {
          toast.dismiss(loadingToast);
          toast.error("Download request failed");
        },
      }
    );
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
        <PostHeader
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
        />

        <div
          ref={mediaContainerRef}
          className="relative bg-transparent flex justify-center items-center"
        >
          {/* Fixed aspect-ratio canvas wrapper - matches editor's coordinate system */}
          <div
            className="relative overflow-hidden w-full flex flex-col"
            style={{
              aspectRatio: (designMetadata?.canvasSettings?.aspectRatio || postAspectRatio || "1:1").replace(":", "/"),
              maxHeight: "max(520px, 80vh)",
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
                  editMetadata={designMetadata.editMetadata || postData.editMetadata || {}}
                  isTemplate={isTemplate}
                  onVideoPlay={() => {
                    setIsVideoPlaying(true);
                    if (!hasAnimatedOnce) {
                      setHasAnimatedOnce(true);
                    }
                  }}
                  onVideoPause={() => setIsVideoPlaying(false)}
                  onVideoEnded={() => setIsVideoPlaying(false)}
                />
              </div>

              {/* ✅ OVERLAYS - Positioned relative to media area */}
              {isTemplate && overlayElements.length > 0 && (
                <div className="absolute inset-0 pointer-events-none z-30">
                  <FeedOverlayRenderer
                    overlayElements={overlayElements}
                    viewer={viewer}
                    prithuLogoUrl={prithuLogo}
                    playSessionId={playSessionId}
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
console.log(showElements)
  return (
    <div
      className="relative w-full z-30 px-4 py-2 shrink-0 flex flex-col gap-1"
      style={{
        backgroundColor: footer.backgroundColor || "#000000",
        background: footer.backgroundColor || "#000000",
      }}
    >
      {/* Top Row: Username + Social Icons */}
      <div
        className={`flex items-center gap-2 ${
          showElements.name && showElements.socialIcons && icons.length > 0
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
              >
                <img
                  src={`https://cdn.simpleicons.org/${icon.platform}`}
                  className="w-3.5 h-3.5 object-contain invert"
                  alt={icon.platform}
                  onError={(e) => {
                    e.currentTarget.src = defaultAvatar;
                  }}
                />
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

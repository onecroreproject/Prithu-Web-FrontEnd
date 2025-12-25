// ✅ src/components/FeedPageComponent/Postcard.jsx
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
import SharePopup from "./sharePopUp"; // Import the SharePopup
import { toast } from "react-hot-toast";
import {
  useLikePost,
  useSavePost,
  useSharePost,
  useFollowUser,
  useUnfollowUser,
  useDownloadFeed,
} from "../../hooks/usePostActions";
import { useComments } from "../../hooks/useComments";
import {
  userImageViewCount,
  userVideoViewCount,
} from "../../Service/userViewCount";

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

  const {
    feedId = "",
    userId = "",
    userName = "Unknown",
    profileAvatar,
    contentUrl = "",
    type = "image",
    caption = "",
    likesCount: initialLikes = 0,
    timeAgo = "",
    aspectRatio: postAspectRatio = "1:1",
    dec = "",
  } = postData || {};

  const tempUser = authUser || { _id: "guest", userName: "You" };

  // Local state
  const [isLiked, setIsLiked] = useState(postData.isLiked || false);
  const [isSaved, setIsSaved] = useState(postData.isSaved || false);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(
    postData.commentsCount || 0
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isFollowing, setIsFollowing] = useState(
    postData?.isFollowing || false
  );
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [heartPosition, setHeartPosition] = useState({ x: 0, y: 0 });
  const [showSharePopup, setShowSharePopup] = useState(false); // New state for share popup

  const [imageViewCounted, setImageViewCounted] = useState(false);
  const [videoViewCounted, setVideoViewCounted] = useState(false);

  const { data: commentsData } = useComments(feedId, showCommentsModal);

  const likeMutation = useLikePost();
  const saveMutation = useSavePost(feedId);
  const shareMutation = useSharePost(feedId, userId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const downloadMutation = useDownloadFeed();

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
  }, [isLiked, likeMutation]);

  // Double tap to like handler with position
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
  }, [isLiked, likeMutation]);

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
        },
        onError: () => {
          setIsSaved(!newSavedState);
          toast.error("Save failed");
        },
      }
    );
  }, [isSaved, feedId, saveMutation]);

  // Updated handleShare function
  const handleShare = useCallback(async () => {
    // Show the share popup instead of immediately sharing
    setShowSharePopup(true);
    
    // Log share attempt
    shareMutation.mutate({
      feedId,
      userId: tempUser._id,
      shareChannel: "share_popup",
    });
  }, [feedId, tempUser._id, shareMutation]);

  // Handle share completion from SharePopup
  const handleShareComplete = useCallback(() => {
   
  }, []);

  const handleDownload = () => {
    if (!feedId) return toast.error("Invalid feed!");

    downloadMutation.mutate(
      { feedId, userId: tempUser._id },
      {
        onSuccess: async ({ downloadLink }) => {
          if (!downloadLink) return toast.error("No download link found!");

          try {
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
          } catch (error) {
            toast.error("Failed to download");
          }
        },

        onError: () => toast.error("Download failed"),
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
        onError: () => {
          setIsFollowing(!optimistic);
          toast.error(optimistic ? "Follow failed" : "Unfollow failed");
        },
      }
    );
  }, [isFollowing, followMutation, unfollowMutation, userId, tempUser._id]);

  const handleUnfollow = useCallback(() => {
    handleFollow(); // Same logic toggles
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
        {/* Instagram-style Header */}
        <PostHeader
          userId={userId}
          userName={userName}
          post={postData}
          profileAvatar={profileAvatar}
          timeAgo={timeAgo}
          navigate={navigate}
          feedId={feedId}
          tempUser={tempUser}
          toggleSaved={postData.isSaved}
          token={token}
          dec={dec || postData.description || ""}
          onHideFromUI={onHideFromUI}
          onNotInterested={onNotInterested}
          isFollowing={isFollowing}
          onCommentsClick={() => setShowCommentsModal(true)}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />

        {/* Media Container - Dynamic height */}
        <div 
          ref={mediaContainerRef} 
          className="relative bg-transparent"
        >
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
            aspectRatio={postAspectRatio}
          />

          {/* Heart Animation Overlay */}
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
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Instagram-style Actions and Caption */}
        <PostActions
          isLiked={isLiked}
          isSaved={isSaved}
          likesCount={likesCount}
          post={postData}
          handleLikeFeed={handleLikeFeed}
          handleShare={() => setShowSharePopup(true)} // Updated to open popup
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
        />
      </div>

      {/* Share Popup Modal */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        postId={feedId}
        postCaption={dec || caption || ""}
        userName={userName}
        onShareComplete={handleShareComplete}
      />
    </>
  );
}

export default React.memo(Postcard);
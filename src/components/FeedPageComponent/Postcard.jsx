// src/components/FeedPageComponent/Postcard.jsx
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
import PostCommentsModal from "./PostCommentsModal";
import { FEED_CARD_STYLE } from "../../constance/feedLayout";
import { toast } from "react-hot-toast";

/**
 * Optimized Postcard:
 * - Memoized (export default React.memo(Postcard))
 * - Comments fetched on demand (when opening modal)
 * - Double-tap like via onDoubleTap prop in PostMedia
 * - Uses toast for notifications (global)
 */

function Postcard({
  postData = {},
  authUser,
  token,
  onHidePost,
  onNotInterested,
  nextItem, // optional hint for preloading next media
}) {
  const navigate = useNavigate();
  const videoRef = useRef(null);

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
  } = postData || {};

  const tempUser = authUser || { _id: "guest", userName: "You" };

  // Local state
  const [isLiked, setIsLiked] = useState(postData.isLiked || false);
  const [isSaved, setIsSaved] = useState(postData.isSaved || false);
  const [comments, setComments] = useState([]);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isFollowing, setIsFollowing] = useState(postData?.isFollowing || false);
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // fetchComments on demand only
  const fetchComments = useCallback(async () => {
    try {
      const res = await api.post(`/api/get/comments/for/feed`, { feedId });
      setComments(res.data.comments?.slice(0, 10) || []);
    } catch (err) {
      console.error("Comments error:", err);
    }
  }, [feedId]);

  // Simulated initial shimmer — kept small
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [postData]);

  // video control toggles
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

  const handleFollow = useCallback(async () => {
  try {
    setIsFollowing(true); // optimistic update
    await api.post("/api/user/follow/creator", {
      userId,                 // creator to follow
      currentUserId: tempUser._id,
    });

    toast.success("Following");
  } catch (err) {
    setIsFollowing(false); // revert on fail
    toast.error(err?.response?.data?.message || "Follow failed");
  }
}, [userId, tempUser._id]);

// --- UNFOLLOW USER ---
const handleUnfollow = useCallback(async () => {
  try {
    setIsFollowing(false); // optimistic
    await api.post("/api/user/unfollow/creator", {
      userId,
      currentUserId: tempUser._id,
    });

    toast.success("Unfollowed");
  } catch (err) {
    setIsFollowing(true);
    toast.error(err?.response?.data?.message || "Unfollow failed");
  }
}, [userId, tempUser._id]);

  // like action (optimistic)
  const handleLikeFeed = useCallback(async () => {
    const updated = !isLiked;
    setIsLiked(updated);
    setLikesCount((p) => (updated ? p + 1 : Math.max(p - 1, 0)));
    try {
      await api.post("/api/user/feed/like", { feedId, userId: tempUser._id });
    } catch {
      setIsLiked(!updated);
      toast.error("Failed to update like");
    }
  }, [isLiked, feedId, tempUser._id]);

  const handleSave = useCallback(async () => {
    try {
      const res = await api.post("/api/user/feed/save", { feedId });
      const saved = res.data.savedFeeds?.some((f) => f.feedId === feedId);
      setIsSaved(saved);
      toast.success(saved ? "Saved!" : "Removed!");
    } catch {
      toast.error("Save failed");
    }
  }, [feedId]);

  const handleDownload = useCallback(async () => {
    try {
      const res = await api.post("/api/user/feed/download", { feedId });
      const link = res.data?.downloadLink;
      if (link) {
        const a = document.createElement("a");
        a.href = link;
        a.download = `post-${feedId}`;
        a.click();
        return toast.success("Downloaded!");
      }
      toast.error("Could not download");
    } catch {
      toast.error("Download failed");
    }
  }, [feedId]);

const handleShare = useCallback(async () => {
  try {
    // Request backend to log/share
    const { data } = await api.post("/api/user/feed/share", {
      feedId,
      userId: tempUser._id,
    });

    // FRONTEND SHARE URL (Universal)
    const shareUrl = `${window.location.origin}/post/${feedId}?ref=share`;

    // Copy to clipboard
    await navigator.clipboard.writeText(shareUrl);

    toast.success("Share link copied!");
  } catch (err) {
    console.error("Share error:", err);
    toast.error(err?.response?.data?.message || "Share failed");
  }
}, [feedId, tempUser._id]);



  // double-tap handler (passed to PostMedia)
  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((p) => p + 1);
      api.post("/api/user/feed/like", { feedId, userId: tempUser._id }).catch(() => {});
    }
    // show quick heart animation inside PostMedia via prop (PostMedia will show it visually)
  }, [isLiked, feedId, tempUser._id]);

  if (loading) {
    return <div className="w-full h-80 bg-gray-200 animate-pulse rounded-2xl mx-auto" />;
  }

  return (
    <div className={FEED_CARD_STYLE}>
      <PostHeader
        userId={userId}
        userName={userName}
        profileAvatar={profileAvatar}
        timeAgo={timeAgo}
        navigate={navigate}
        feedId={feedId}
        tempUser={tempUser}
        token={token}
        dec={postData.description}
        onHidePost={onHidePost}
        onNotInterested={onNotInterested}
          isFollowing={postData.isFollowing}              
  onFollow={handleFollow}                
  onUnfollow={handleUnfollow}
      />

      <PostMedia
        type={type}
        contentUrl={contentUrl}
        videoRef={videoRef}
        isMuted={isMuted}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        toggleMute={toggleMute}
        onDoubleTap={handleDoubleTap}
        preloadNext={nextItem?.contentUrl} // optional hint for preloading the next media
      />

      <PostActions
        isLiked={isLiked}
        isSaved={isSaved}
        likesCount={likesCount}
        post={postData}
        handleLikeFeed={handleLikeFeed}
        handleShare={handleShare}
        handleDownload={handleDownload}
        handleSave={handleSave}
        caption={caption}
        userName={userName}
        onCommentsClick={() => {
          fetchComments();
          setShowCommentsModal(true);
        }}
      />

      <PostCommentsModal
        open={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        post={postData}
        authUser={tempUser}
        feedId={feedId}
        comments={comments}
      />
    </div>
  );
}

export default React.memo(Postcard);

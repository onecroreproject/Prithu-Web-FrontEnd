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
import { useLikePost, useSavePost, useSharePost, useFollowUser,useUnfollowUser } from "../../hooks/usePostActions";
import { useComments } from "../../hooks/useComments";

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
  const [commentCount, setCommentCount] = useState(postData.commentsCount || 0);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted - sound plays by default
  const [isPlaying, setIsPlaying] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [isFollowing, setIsFollowing] = useState(postData?.isFollowing || false);
  const [loading, setLoading] = useState(true);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // React Query hooks for post actions
  const { data: commentsData } = useComments(feedId, showCommentsModal);
  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const shareMutation = useSharePost();
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  // Update comments when data changes
  useEffect(() => {
    if (commentsData) {
      setComments(commentsData.slice(0, 10));
    }
  }, [commentsData]);

  // Simulated initial shimmer — kept small
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 180);
    return () => clearTimeout(t);
  }, [postData]);

  // Sync isFollowing state when postData changes from cache updates
  useEffect(() => {
    setIsFollowing(postData?.isFollowing || false);
  }, [postData?.isFollowing]);

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

 const handleFollow = useCallback(() => {
  setIsFollowing(true);

  followMutation.mutate(
    { targetUserId: userId, currentUserId: tempUser._id },
    {
      onError: (err) => {
        setIsFollowing(false);
        toast.error(err?.response?.data?.message || "Follow failed");
      }
    }
  );
}, [userId, followMutation]);


  // --- UNFOLLOW USER ---
const handleUnfollow = useCallback(() => {
  setIsFollowing(false);

  unfollowMutation.mutate(
    { targetUserId: userId, currentUserId: tempUser._id },
    {
      onError: (err) => {
        setIsFollowing(true);
        toast.error(err?.response?.data?.message || "Unfollow failed");
      }
    }
  );
}, [userId, unfollowMutation]);


  // like action (using React Query mutation)
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
        setLikesCount((p) => (updated ? Math.max(p - 1, 0) : p + 1));
        toast.error("Failed to update like");
      },
    }
  );
}, [isLiked, likeMutation]);


  const handleSave = useCallback(async () => {
    const newSavedState = !isSaved;
    setIsSaved(newSavedState);

    saveMutation.mutate({ feedId }, {
      onSuccess: (data) => {
        const saved = data?.savedFeeds?.some((f) => f.feedId === feedId) ?? newSavedState;
        setIsSaved(saved);
        toast.success(saved ? "Saved!" : "Removed!");
      },
      onError: () => {
        setIsSaved(!newSavedState);
        toast.error("Save failed");
      }
    });
  }, [isSaved, feedId, saveMutation]);

  const handleDownload = useCallback(async () => {
    try {
      // Step 1: Get JSON with downloadLink
      const res = await api.post("/api/user/feed/download", { feedId });
      const link = res.data?.downloadLink;

      if (link) {
        // Step 2: Fetch the media file as a blob
        const mediaResponse = await fetch(link, { mode: 'cors' }); // Or include credentials if required
        if (!mediaResponse.ok) throw new Error("Media download failed");

        const blob = await mediaResponse.blob();
        const url = window.URL.createObjectURL(blob);

        // Step 3: Create a link, trigger download
        const a = document.createElement("a");
        a.href = url;

        // Optional: extract extension from the link
        const ext = link.split('.').pop().split(/\#|\?/)[0];
        a.download = `post-${feedId}.${ext}`; // preserves file type

        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Downloaded!");
        return;
      }

      toast.error("Could not download the file");
    } catch {
      toast.error("Download failed");
    }
  }, [feedId]);




  const handleShare = useCallback(async () => {
    const shareChannel = navigator.share ? "native_share" : "copy_link";
    const shareUrl = `${window.location.origin}/post/${feedId}?ref=share`;

    // Log share in backend using React Query mutation
    shareMutation.mutate({
      feedId,
      userId: tempUser._id,
      shareChannel,
      shareTarget: null,
    });

    // Native mobile/desktop share
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this post",
          text: "Look at this post!",
          url: shareUrl,
        });
        toast.success("Shared successfully");
        return;
      } catch (error) {
        console.warn("Native share cancelled → fallback");
      }
    }

    // Fallback: copy link
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Share link copied to clipboard!");
    } catch (err) {
      console.error("Share error:", err);
      toast.error("Share failed");
    }
  }, [feedId, tempUser._id, shareMutation]);





  // double-tap handler (passed to PostMedia)
  const handleDoubleTap = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount((p) => p + 1);
      api.post("/api/user/feed/like", { feedId, userId: tempUser._id }).catch(() => { });
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
        toggleSaved={postData.isSaved}
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
        commentCount={commentCount}
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

      />
    </div>
  );
}

export default React.memo(Postcard);


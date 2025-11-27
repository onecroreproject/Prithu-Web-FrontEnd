// src/components/FeedPageComponent/Postcard.jsx
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

import { FEED_CARD_STYLE } from "../../constance/feedLayout";

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
  isVisible,   // <-- NEW
  onHidePost,
  onNotInterested,
  nextItem,
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

  const [imageViewCounted, setImageViewCounted] = useState(false);
  const [videoViewCounted, setVideoViewCounted] = useState(false);

  const { data: commentsData } = useComments(feedId, showCommentsModal);

  const likeMutation = useLikePost();
  const saveMutation = useSavePost();
  const shareMutation = useSharePost(feedId,userId);
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

    console.log("🟢 IMAGE TRIGGERED →", feedId);

    userImageViewCount(feedId)
      .then(() => {
        console.log("🟢 IMAGE VIEW COUNTED →", feedId);
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
      console.log("🎬 Video FULL END →", feedId);

      userVideoViewCount(feedId)
        .then(() => {
          console.log("🟢 VIDEO FULL VIEW COUNTED →", feedId);
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
          toast.success(saved ? "Saved!" : "Removed!");
        },
        onError: () => {
          setIsSaved(!newSavedState);
          toast.error("Save failed");
        },
      }
    );
  }, [isSaved, feedId, saveMutation]);

  const handleShare = useCallback(async () => {
    const shareUrl = `${window.location.origin}/retrivefeed/${feedId}?ref=share`;

    shareMutation.mutate({
      feedId,
      userId: tempUser._id,
      shareChannel: navigator.share
        ? "native_share"
        : "copy_link",
    });

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this post",
          url: shareUrl,
        });
        toast.success("Shared successfully");
        return;
      } catch {}
    }

    navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied!");
  }, [feedId, tempUser._id, shareMutation]);



  
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
          toast.success("Download started!");
        } catch (error) {
          toast.error("Failed to download");
        }
      },

      onError: () => toast.error("Download failed"),
    }
  );
};



  if (loading) {
    return (
      <div className="w-full h-80 bg-gray-200 animate-pulse rounded-2xl mx-auto" />
    );
  }

  return (
    <div className={FEED_CARD_STYLE}>
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
        dec={postData.description}
        onHidePost={onHidePost}
        onNotInterested={onNotInterested}
        isFollowing={postData.isFollowing}
        onCommentsClick={() => setShowCommentsModal(true)}
        onFollow={() =>
          followMutation.mutate({
            targetUserId: userId,
            currentUserId: tempUser._id,
          })
        }
        onUnfollow={() =>
          unfollowMutation.mutate({
            targetUserId: userId,
            currentUserId: tempUser._id,
          })
        }
      />

      <PostMedia
        type={type}
        contentUrl={contentUrl}
        videoRef={videoRef}
        isMuted={isMuted}
        onCommentsClick={() => setShowCommentsModal(true)}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        toggleMute={toggleMute}
      />

      <PostActions
        isLiked={isLiked}
        isSaved={isSaved}
        likesCount={likesCount}
        post={postData}
        handleLikeFeed={handleLikeFeed}
        handleShare={handleShare}
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
  );
}

export default React.memo(Postcard);

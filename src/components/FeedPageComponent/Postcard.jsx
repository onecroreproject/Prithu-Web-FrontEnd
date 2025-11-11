import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

import PostHeader from "./postCardComponent/postHeader";
import PostMedia from "./postCardComponent/postMeadia";
import PostActions from "./postCardComponent/postActions";
import PostCommentsModal from "./PostCommentsModal";

export default function Postcard({
  postData = {},
  authUser,
  token,
  onHidePost,
  onNotInterested,
}) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [isLiked, setIsLiked] = useState(postData.isLiked || false);
  const [isSaved, setIsSaved] = useState(postData.isSaved || false);
  const [comments, setComments] = useState([]);
  const [currentCommentIndex, setCurrentCommentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [showCommentsModal, setShowCommentsModal] = useState(false);

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
  } = postData;

  const [likesCount, setLikesCount] = useState(initialLikes);
  const tempUser = authUser || { _id: "guestUser", userName: "You" };

  /* ----------------------------- Fetch comments ----------------------------- */
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await api.post(`/api/get/comments/for/feed`, { feedId });
        setComments(res.data.comments?.slice(0, 10) || []);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    if (feedId) fetchComments();
  }, [feedId]);

  /* --------------------------- Rotate visible comments --------------------------- */
  useEffect(() => {
    if (!comments.length) return;
    const interval = setInterval(
      () => setCurrentCommentIndex((prev) => (prev + 1) % comments.length),
      3500
    );
    return () => clearInterval(interval);
  }, [comments]);

  /* ------------------------------- Simulate loading ------------------------------ */
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [postData]);

  /* --------------------------- Video play/pause toggle --------------------------- */
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  /* ----------------------------- Like post handler ----------------------------- */
  const handleLikeFeed = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(prev - 1, 0)));
    try {
      await api.post("/api/user/feed/like", { feedId, userId: tempUser._id });
    } catch {
      setIsLiked(!newLiked);
    }
  };

  /* ---------------------------- Save post handler ---------------------------- */
  const handleSave = async () => {
    try {
      const res = await api.post("/api/user/feed/save", { feedId });
      const savedIds = res.data.savedFeeds?.map((f) => f.feedId) || [];
      const saved = savedIds.includes(feedId);
      setIsSaved(saved);
      setToastMsg(saved ? "Post saved!" : "Post unsaved!");
    } catch {
      setToastMsg("Error saving post");
    }
  };

  /* --------------------------- Download post handler --------------------------- */
  const handleDownload = async () => {
    try {
      const res = await api.post("/api/user/feed/download", { feedId });
      if (res.data?.downloadLink) {
        const a = document.createElement("a");
        a.href = res.data.downloadLink;
        a.setAttribute("download", `post-${feedId}`);
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setToastMsg("Downloaded successfully!");
        return;
      }
      if (res.data instanceof Blob) {
        const blob = new Blob([res.data], { type: res.headers["content-type"] });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.setAttribute("download", `post-${feedId}`);
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        setToastMsg("Downloaded successfully!");
        return;
      }
      console.warn("Unexpected download response:", res.data);
      setToastMsg("Unable to download file.");
    } catch (err) {
      console.error("Download failed:", err);
      setToastMsg("Download failed.");
    }
  };

  /* ----------------------------- Share post handler ----------------------------- */
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${feedId}`;
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => setToastMsg("Link copied!"))
      .catch(() => setToastMsg("Failed to copy link"));
  };

  /* --------------------------- Loading placeholder --------------------------- */
  if (loading) {
    return (
      <div className="max-w-xl mx-auto mb-4 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-sm overflow-hidden animate-pulse">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-3 w-1/3 bg-gray-300 mb-2 rounded"></div>
            <div className="h-3 w-1/5 bg-gray-300 rounded"></div>
          </div>
        </div>
        <div className="w-full h-[480px] bg-gray-300"></div>
      </div>
    );
  }

  /* ------------------------------- Main Post UI ------------------------------- */
  return (
    <div className="w-full max-w-xl mx-auto mb-6 bg-white dark:bg-[#1c1c1e] rounded-2xl shadow-md  dark:border-gray-700 overflow-hidden transition-all">
      {/* 🔹 Header */}
      <PostHeader
        userId={userId}
        userName={userName}
        profileAvatar={profileAvatar}
        timeAgo={timeAgo}
        navigate={navigate}
        feedId={feedId}
        tempUser={tempUser}
        token={token}
        onHidePost={onHidePost}
        onNotInterested={onNotInterested}
      />

      {/* 🔹 Media (Image/Video) */}
      <PostMedia
        type={type}
        contentUrl={contentUrl}
        videoRef={videoRef}
        isMuted={isMuted}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        toggleMute={toggleMute}
      />

      {/* 🔹 Actions (Facebook-style bar) */}
      <PostActions
        isLiked={isLiked}
        isSaved={isSaved}
        likesCount={likesCount}
        handleLikeFeed={handleLikeFeed}
        handleShare={handleShare}
        handleDownload={handleDownload}
        handleSave={handleSave}
        onCommentsClick={() => setShowCommentsModal(true)}
        userName={userName}
        caption={caption}
      />

      {/* 🔹 Comments modal */}
      <PostCommentsModal
        open={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        post={postData}
        authUser={tempUser}
        feedId={feedId}
      />

      {/* 🔹 Toast message */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm py-2 px-4 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}

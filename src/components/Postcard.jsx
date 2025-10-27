import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Avatar, Card, CardMedia, IconButton, Stack, Typography,
  Box, Snackbar
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  ShareOutlined as ShareOutlinedIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Download as DownloadIcon
} from "@mui/icons-material";

import axios from "../api/axios";
import SubscriptionModal from "./SubscriptionModal";
import PostCommentsModal from "./PostCommentsModal";
import PostOptionsMenu from "./PostOptionsMenu";

const Postcard = ({ postData = {}, authUser, token, onHidePost, onNotInterested }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(postData.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(postData.commentsCount || 0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [savedPosts, setSavedPosts] = useState([]);
  const [isLiked, setIsLiked] = useState(postData.isLiked || false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  const tempUser = authUser || { _id: "guestUser", userName: "You" };

  const {
    feedId = "",
    type = "image",
    contentUrl = "",
    _id,
    userName,
    profileAvatar,
    caption,
    timeAgo = "",
  } = postData;

  // Update isLiked when postData changes
  useEffect(() => {
    setIsLiked(postData.isLiked || false);
    setLikesCount(postData.likesCount || 0);
  }, [postData.isLiked, postData.likesCount]);

  // Video auto-play/pause
  useEffect(() => {
    if (!videoRef.current || type !== "video") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current.play();
            setIsPlaying(true);
          } else {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.7 }
    );
    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [type]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.post("/api/get/comments/for/feed", { feedId });
      if (res.data.comments) {
        setComments(res.data.comments);
        setCommentsCount(res.data.comments.length);
      }
    } catch (err) {
      console.error(err);
    }
  }, [feedId]);

  useEffect(() => {
    if (showCommentsModal) fetchComments();
  }, [showCommentsModal, fetchComments]);

  const handleLikeFeed = async () => {
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount((prev) => (newIsLiked ? prev + 1 : Math.max(prev - 1, 0)));
    
    try {
      await axios.post("/api/user/feed/like", { 
        feedId,
        userId: tempUser._id 
      });
      // Update local storage or context to persist the like state
      updatePersistedLikes(feedId, newIsLiked);
    } catch (err) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount((prev) => (newIsLiked ? Math.max(prev - 1, 0) : prev + 1));
      console.error("Like action failed:", err);
    }
  };

  // Helper function to persist likes in localStorage (optional)
  const updatePersistedLikes = (feedId, liked) => {
    try {
      const persistedLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
      if (liked) {
        persistedLikes[feedId] = true;
      } else {
        delete persistedLikes[feedId];
      }
      localStorage.setItem('userLikes', JSON.stringify(persistedLikes));
    } catch (err) {
      console.error("Failed to persist likes:", err);
    }
  };

  // Check persisted likes on component mount
  useEffect(() => {
    try {
      const persistedLikes = JSON.parse(localStorage.getItem('userLikes') || '{}');
      if (persistedLikes[feedId]) {
        setIsLiked(true);
      }
    } catch (err) {
      console.error("Failed to load persisted likes:", err);
    }
  }, [feedId]);

  

  const handleSave = async () => {
    try {
      const res = await axios.post("/api/user/feed/save", { feedId });
      const savedFeedIds = res.data.savedFeeds?.map((f) => f.feedId) || [];
      setSavedPosts(savedFeedIds);
      setIsSaved(savedFeedIds.includes(feedId));
      setToastMsg(savedFeedIds.includes(feedId) ? "Post saved!" : "Post unsaved!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await axios.post(
        "/api/user/feed/download",
        { feedId },
        { responseType: "blob" }
      );
      const contentType = res.headers["content-type"] || "application/octet-stream";
      const extension = contentType.split("/")[1] || (type === "image" ? "jpg" : "mp4");
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `post-${feedId}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setToastMsg("Downloaded! Check your Downloads folder.");
    } catch (err) {
      console.error("Download failed:", err);
      setToastMsg("Download failed.");
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${feedId}`;
    if (navigator.share) {
      navigator.share({
        title: "Check this post",
        text: caption || "Check this post",
        url: shareUrl,
      }).catch((err) => {
        console.error("Share failed:", err);
        setToastMsg("Share failed.");
      });
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => setToastMsg("Link copied!"))
        .catch(() => setToastMsg("Failed to copy link"));
    }
  };

  return (
    <Card sx={{ width: 590, margin: "0 auto", mb: 4, borderRadius: 2, minHeight: 650 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/profile/${_id}`)}
        >
          <Avatar src={profileAvatar || "https://i.pravatar.cc/150"} />
          <Stack>
            <Typography fontWeight={500}>{userName}</Typography>
            <Typography variant="caption" color="gray">{timeAgo}</Typography>
          </Stack>
        </Stack>
        <PostOptionsMenu
          feedId={feedId}
          authUserId={tempUser._id}
          token={token}
          onHidePost={(id) => {
    if (onHidePost) onHidePost(id); // Remove post from parent UI
  }}
  onNotInterested={(id) => {
    if (onNotInterested) onNotInterested(id); // Remove post from parent UI
  }}
          
          
        />
      </Stack>
      <Box sx={{ width: "100%", height: 470, position: "relative", background: "#000", overflow: "hidden" }}>
        {type === "image" ? (
          <CardMedia component="img" image={contentUrl} sx={{ width: "100%", height: "470px", objectFit: "cover" }} />
        ) : (
          <>
            <video
              ref={videoRef}
              src={contentUrl}
              loop
              muted={isMuted}
              playsInline
              onClick={togglePlayPause}
              style={{ width: "100%", height: "470px", objectFit: "cover", cursor: "pointer" }}
            />
            <IconButton
              onClick={togglePlayPause}
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
                opacity: isPlaying ? 0 : 1,
                transition: "opacity 0.3s",
              }}
            >
              {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
            </IconButton>
            <IconButton
              onClick={toggleMute}
              sx={{
                position: "absolute",
                bottom: 16,
                right: 16,
                color: "#fff",
                bgcolor: "rgba(0,0,0,0.5)",
                "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
              }}
            >
              {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>
          </>
        )}
      </Box>
      <Stack px={2} pt={1} spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleLikeFeed}>
              {isLiked ? <FavoriteIcon sx={{ color: "red" }} /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton onClick={() => setShowCommentsModal(true)}>
              <ChatBubbleOutlineIcon />
            </IconButton>
            <IconButton onClick={handleShare}>
              <ShareOutlinedIcon />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleDownload}>
              <DownloadIcon />
            </IconButton>
            <IconButton onClick={handleSave}>
              {isSaved ? <BookmarkIcon sx={{ color: "primary.main" }} /> : <BookmarkBorderIcon />}
            </IconButton>
          </Stack>
        </Stack>
        <Typography fontWeight={500}>{likesCount} likes</Typography>
        {caption && (
          <Typography
            variant="body2"
            sx={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.5em",
              lineHeight: 1.4,
            }}
          >
            <b>{userName}</b> {caption}
          </Typography>
        )}
        {commentsCount > 0 && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ cursor: "pointer" }}
            onClick={() => setShowCommentsModal(true)}
          >
            View all {commentsCount} comments
          </Typography>
        )}
      </Stack>
      <PostCommentsModal
        open={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        feedId={feedId}
        authUser={tempUser}
      />
      <Snackbar open={!!toastMsg} autoHideDuration={2000} onClose={() => setToastMsg("")} message={toastMsg} />
      <SubscriptionModal open={false} onClose={() => {}} />
    </Card>
  );
};

export default Postcard;
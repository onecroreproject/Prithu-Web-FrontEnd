/* ✅ src/components/FeedPageComponent/Postcard.jsx */
import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Card,
  CardMedia,
  IconButton,
  Stack,
  Typography,
  Box,
  Snackbar,
  Skeleton,
  Button,
  Paper,
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
  Download as DownloadIcon,
} from "@mui/icons-material";

import api from "../../api/axios";
import SubscriptionModal from "./SubscriptionModal";
import PostCommentsModal from "./PostCommentsModal";
import PostOptionsMenu from "./PostOptionsMenu";

const Postcard = ({ postData = {}, authUser, token, onHidePost, onNotInterested }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);

  // 🔹 UI States
  const [isLiked, setIsLiked] = useState(postData.isLiked || false);
  const [isSaved, setIsSaved] = useState(postData.isSaved || false);
  const [isFollowing, setIsFollowing] = useState(postData.isFollowing || false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  // 🧠 Tooltip Profile State
  const [hoverProfile, setHoverProfile] = useState(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const hoverTimeout = useRef(null);

  const {
    feedId = "",
    userId = "",
    userName = "Unknown",
    profileAvatar,
    contentUrl = "",
    type = "image",
    caption = "",
    likesCount: initialLikes = 0,
    commentsCount: initialComments = 0,
    timeAgo = "",
  } = postData;

  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount] = useState(initialComments);
  const tempUser = authUser || { _id: "guestUser", userName: "You" };

  // ✅ Simulated loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [postData]);

  // ✅ Video autoplay/pause
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

  // 🎥 Video control
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
  };

  // ❤️ Like
  const handleLikeFeed = async () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikesCount((prev) => (newLiked ? prev + 1 : Math.max(prev - 1, 0)));
    try {
      await api.post("/api/user/feed/like", { feedId, userId: tempUser._id });
    } catch (err) {
      console.error("Like failed:", err);
      setIsLiked(!newLiked);
    }
  };

  // 💾 Save
  const handleSave = async () => {
    try {
      const res = await api.post("/api/user/feed/save", { feedId });
      const savedIds = res.data.savedFeeds?.map((f) => f.feedId) || [];
      const saved = savedIds.includes(feedId);
      setIsSaved(saved);
      setToastMsg(saved ? "Post saved!" : "Post unsaved!");
    } catch (err) {
      console.error("Save error:", err);
      setToastMsg("Error saving post");
    }
  };

  // ⬇️ Download
  const handleDownload = async () => {
    try {
      const res = await api.post(
        "/api/user/feed/download",
        { feedId },
        { responseType: "blob" }
      );
      const contentType = res.headers["content-type"];
      const ext = contentType?.split("/")[1] || (type === "image" ? "jpg" : "mp4");
      const blob = new Blob([res.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `post-${feedId}.${ext}`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setToastMsg("Downloaded successfully!");
    } catch (err) {
      console.error("Download failed:", err);
      setToastMsg("Download failed.");
    }
  };

  // 👤 Follow/Unfollow
  const handleFollowToggle = async (shouldFollow) => {
    if (isFollowLoading) return;
    setIsFollowLoading(true);
    try {
      const url = shouldFollow
        ? "/api/user/follow/creator"
        : "/api/user/unfollow/creator";
      const res = await api.post(
        url,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setIsFollowing(shouldFollow);
        setToastMsg(
          shouldFollow ? "✅ Followed successfully!" : "👋 Unfollowed successfully!"
        );
      }
    } catch (err) {
      console.error("Follow toggle error:", err.response?.data || err.message);
      setToastMsg(err.response?.data?.message || "Action failed");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // 📤 Share
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${feedId}`;
    if (navigator.share) {
      navigator
        .share({ title: "Check this post", text: caption, url: shareUrl })
        .catch(() => setToastMsg("Share failed."));
    } else {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => setToastMsg("Link copied!"))
        .catch(() => setToastMsg("Failed to copy link"));
    }
  };

  // 👁️‍🗨️ Hover profile preview fetch
  const fetchProfilePreview = async (id) => {
    try {
      const res = await api.get(`/api/user/profile/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHoverProfile(res.data?.profile || null);
    } catch (err) {
      console.error("Profile preview fetch error:", err);
    }
  };

  const handleMouseEnter = () => {
    if (!userId) return;
    hoverTimeout.current = setTimeout(() => {
      fetchProfilePreview(userId);
      setShowProfileCard(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setShowProfileCard(false);
  };

  // 🦴 Loading skeleton
  if (loading) {
    return (
      <Card sx={{ maxWidth: 600, mx: "auto", mb: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} p={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Stack flex={1}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="20%" />
          </Stack>
        </Stack>
        <Skeleton variant="rectangular" width="100%" height={480} />
      </Card>
    );
  }

  // 🧩 Main Postcard
  return (
    <Card
      sx={{
        width: "100%",
        maxWidth: 600,
        mx: "auto",
        mb: 4,
        borderRadius: 3,
        boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* 🧠 Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        p={2}
        onMouseLeave={handleMouseLeave}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{ cursor: "pointer", position: "relative" }}
          onMouseEnter={handleMouseEnter}
          onClick={() => navigate(`/profile/${userId}`)}
        >
          <Avatar src={profileAvatar} sx={{ width: 44, height: 44 }} />
          <Stack>
            <Typography fontWeight={600}>{userName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {timeAgo || "Recently"}
            </Typography>
          </Stack>

          {/* 🔥 Hover Profile Preview */}
          {showProfileCard && hoverProfile && (
            <Paper
              elevation={5}
              sx={{
                p: 2,
                width: 240,
                borderRadius: 3,
                backgroundColor: "#fff",
                position: "absolute",
                top: "60px",
                left: "0",
                zIndex: 50,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={hoverProfile.profileAvatar || "https://i.pravatar.cc/100"}
                  sx={{ width: 44, height: 44 }}
                />
                <Stack>
                  <Typography fontWeight={600}>
                    {hoverProfile.userName || "Unknown"}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {hoverProfile.bio || "No bio available"}
                  </Typography>
                </Stack>
              </Stack>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Followers: {hoverProfile.followerCount || 0}
              </Typography>
              {tempUser._id !== userId && (
                <Button
                  fullWidth
                  size="small"
                  sx={{ mt: 1, textTransform: "none", borderRadius: "10px" }}
                  variant={hoverProfile.isFollowing ? "outlined" : "contained"}
                  color={hoverProfile.isFollowing ? "secondary" : "primary"}
                  onClick={() => handleFollowToggle(!hoverProfile.isFollowing)}
                >
                  {hoverProfile.isFollowing ? "Unfollow" : "Follow"}
                </Button>
              )}
            </Paper>
          )}
        </Stack>

        <PostOptionsMenu
          feedId={feedId}
          authUserId={tempUser._id}
          token={token}
          onHidePost={onHidePost}
          onNotInterested={onNotInterested}
        />
      </Stack>

      {/* 🎞️ Media Section (Fixed Height, No Crop) */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 480,
          backgroundColor: "#000",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {type === "image" ? (
          <CardMedia
            component="img"
            image={contentUrl}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // 👈 shows full image without cropping
              backgroundColor: "#000",
            }}
          />
        ) : (
          <video
            ref={videoRef}
            src={contentUrl}
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlayPause}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain", // 👈 keeps full video in frame
              backgroundColor: "#000",
              cursor: "pointer",
            }}
          />
        )}

        {/* 🎛 Video controls */}
        {type === "video" && (
          <>
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

      {/* ❤️ Actions */}
      <Stack px={2} pt={1.5} pb={2}>
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

        <Typography fontWeight={500} sx={{ mt: 0.5 }}>
          {likesCount} likes
        </Typography>

        {caption && (
          <Typography
            variant="body2"
            sx={{
              mt: 0.5,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            <b>{userName}</b> {caption}
          </Typography>
        )}

        {commentsCount > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, cursor: "pointer" }}
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

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={2000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
      />

      <SubscriptionModal open={false} onClose={() => {}} />
    </Card>
  );
};

export default Postcard;

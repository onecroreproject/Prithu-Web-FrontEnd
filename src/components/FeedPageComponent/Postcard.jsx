/* ✅ src/components/FeedPageComponent/Postcard.jsx */
import React, { useState, useEffect, useRef, useCallback } from "react";
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
} from "@mui/material";
import { motion } from "framer-motion";
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

  const [comments, setComments] = useState([]);
  const [likesCount, setLikesCount] = useState(postData.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(postData.commentsCount || 0);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [isLiked, setIsLiked] = useState(postData.isLiked || false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const tempUser = authUser || { _id: "guestUser", userName: "You" };

  const {
    feedId = "",
    type = "image",
    contentUrl = "",
    _id,
    userName,
    profileAvatar,
    caption,
    description,
    timeAgo = "",
  } = postData;

  // ✅ Simulated loading animation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [postData]);

  // ✅ Video autoplay / pause when in view
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

  // ✅ Like post
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

  const handleSave = async () => {
    try {
      const res = await api.post("/api/user/feed/save", { feedId });
      const savedIds = res.data.savedFeeds?.map((f) => f.feedId) || [];
      setIsSaved(savedIds.includes(feedId));
      setToastMsg(savedIds.includes(feedId) ? "Post saved!" : "Post unsaved!");
    } catch (err) {
      console.error(err);
    }
  };

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

  // ✅ Skeleton while loading
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 600,
            margin: "0 auto",
            mb: 3,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} p={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Stack flex={1}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="20%" />
            </Stack>
          </Stack>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Card>
      </motion.div>
    );
  }

  // ✅ Main Postcard
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          mb: 4,
          borderRadius: 3,
          boxShadow: "0px 3px 10px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* 🧠 Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          p={2}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ cursor: "pointer" }}
            onClick={() => navigate(`/profile/${_id}`)}
          >
            <Avatar
              src={profileAvatar || "https://i.pravatar.cc/150"}
              sx={{ width: 44, height: 44 }}
            />
            <Stack>
              <Typography fontWeight={600}>{userName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {timeAgo}
              </Typography>
            </Stack>
          </Stack>
          <PostOptionsMenu
            feedId={feedId}
            authUserId={tempUser._id}
            token={token}
            onHidePost={onHidePost}
            onNotInterested={onNotInterested}
          />
        </Stack>

        {/* 🎞️ Media */}
        <Box
          sx={{
            width: "100%",
            height: { xs: 280, sm: 400, md: 470 },
            position: "relative",
            background: "#000",
          }}
        >
          {type === "image" ? (
            <CardMedia
              component="img"
              image={contentUrl}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <>
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
                  objectFit: "cover",
                  cursor: "pointer",
                }}
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
                {isPlaying ? (
                  <PauseIcon fontSize="large" />
                ) : (
                  <PlayArrowIcon fontSize="large" />
                )}
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
                {isSaved ? (
                  <BookmarkIcon sx={{ color: "primary.main" }} />
                ) : (
                  <BookmarkBorderIcon />
                )}
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

        {/* 💬 Comments Modal */}
        <PostCommentsModal
          open={showCommentsModal}
          onClose={() => setShowCommentsModal(false)}
          feedId={feedId}
          authUser={tempUser}
        />

        {/* 🔔 Toast */}
        <Snackbar
          open={!!toastMsg}
          autoHideDuration={2000}
          onClose={() => setToastMsg("")}
          message={toastMsg}
        />

        <SubscriptionModal open={false} onClose={() => {}} />
      </Card>
    </motion.div>
  );
};

export default Postcard;

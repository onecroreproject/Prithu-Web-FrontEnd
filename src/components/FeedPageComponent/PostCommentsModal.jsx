import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  Stack,
  Avatar,
  Typography,
  Box,
  IconButton,
  TextField,
  Snackbar,
  Button,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { FiMessageCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import CommentItem from "./CommentItem";
import api from "../../api/axios";
import EmojiPicker from "../EmojiPicker";
import ModernPostHeader from "./postModelPostHeader";
import { useAuth } from "../../context/AuthContext";

const PostCommentsModal = ({
  open,
  onClose,
  post,
  feedId,
  setCommentCount,
  comments,
  setComments,
}) => {
  const [newComment, setNewComment] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);

  const inputRef = useRef(null);
  const currentFeedId = feedId || post?._id;
  const postCreatorId = post?.userId;

  const authUser =localStorage.getItem("userId");

  /* ------------------------ Check Follow Status ------------------------ */
  const checkFollowStatus = async () => {
    if (!postCreatorId || !authUser) return;
    
    // If current user is the post creator, allow commenting
    if (postCreatorId === authUser) {
      setIsOwnPost(true);
      setIsFollowing(true); // User "follows" themselves for commenting purposes
      return;
    }

    setIsOwnPost(false);
    setCheckingFollow(true);
    
    try {
      const res = await api.post("/api/check/follow/status", {
        creatorId: postCreatorId,
      });
      
      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);
      }
    } catch (err) {
      console.error("Error checking follow status:", err);
      setIsFollowing(false); // Default to false on error
    } finally {
      setCheckingFollow(false);
    }
  };

  /* ------------------------ Follow User ------------------------ */
  const handleFollowUser = async () => {
    if (!postCreatorId || !authUser?._id) return;
    
    setIsFollowingLoading(true);
    
    try {
      const res = await api.post("/api/user/follow/creator", {
        userId: postCreatorId,
      });
      
      if (res.data.success) {
        // Immediately update UI
        setIsFollowing(true);
        setToastMsg(`You are now following ${post?.userName || "this user"}`);
        
        // Focus the comment input after successful follow
        setTimeout(() => {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }, 100);
      }
    } catch (err) {
      console.error("Error following user:", err);
      setToastMsg("Failed to follow user");
    } finally {
      setIsFollowingLoading(false);
    }
  };

  /* ------------------------ Fetch Comments ------------------------ */
  const fetchComments = async () => {
    if (!currentFeedId) return;

    try {
      setCommentLoading(true);
      const res = await api.post("/api/get/comments/for/feed", {
        feedId: currentFeedId,
      });

      if (res.data.comments) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setToastMsg("Error loading comments");
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchComments();
      checkFollowStatus(); // Check follow status when modal opens
      
      // Focus input after a short delay
      setTimeout(() => {
        if (inputRef.current && (isFollowing || isOwnPost)) {
          inputRef.current.focus();
        }
      }, 300);
    } else {
      // Reset states when modal closes
      setIsFollowing(false);
      setIsOwnPost(false);
      setIsFollowingLoading(false);
      setNewComment("");
    }
  }, [open, postCreatorId, authUser?._id]);

  /* ---------------------------- Submit Comment ---------------------------- */
  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!isFollowing && !isOwnPost) return;

    try {
      await api.post("/api/user/feed/comment", {
        feedId: currentFeedId,
        commentText: newComment,
      });

      // Reload comments to get fresh data with proper IDs and counts
      await fetchComments();
      setCommentCount((prev) => prev + 1);
      setNewComment("");
      setToastMsg("Comment posted");
      
      // Keep focus on input after posting
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } catch (err) {
      console.error("Error posting comment:", err);
      setToastMsg(err.response?.data?.message || "Failed to post");
    }
  };

  // Determine if comment input should be disabled
  const isCommentDisabled = checkingFollow || (!isFollowing && !isOwnPost);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: "95vw",
          maxWidth: 1100,
          height: "85vh",
          borderRadius: 4,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 20,
          bgcolor: "rgba(0,0,0,0.55)",
          color: "white",
        }}
      >
        <CloseIcon />
      </IconButton>

      <Stack direction={{ xs: "column", md: "row" }} sx={{ height: "100%" }}>
        {/* ---------------------------- Media Section ---------------------------- */}
        <Box
          sx={{
            flex: 1,
            minHeight: { xs: "40vh", md: "100%" },
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            bgcolor: "black",
          }}
        >
          {post?.contentUrl &&
            (post.type === "image" ? (
              <img
                src={post.contentUrl}
                alt="Post"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  position: "relative",
                }}
              />
            ) : (
              <video
                src={post.contentUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
                controls
                autoPlay
                loop
                muted
              />
            ))}
        </Box>

        {/* --------------------------- Comments Section --------------------------- */}
        <Box
          sx={{
            width: { xs: "100%", md: 420 },
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            borderLeft: { md: "1px solid #eee" },
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
            <ModernPostHeader post={post} />
            
            {/* Follow status indicator - ONLY SHOW IF NOT FOLLOWING AND NOT OWN POST */}
            {!isOwnPost && !checkingFollow && !isFollowing && (
              <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
               
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleFollowUser}
                  disabled={isFollowingLoading}
                  sx={{ 
                    textTransform: "none", 
                    fontSize: "0.75rem",
                    minWidth: 80
                  }}
                >
                  {isFollowingLoading ? (
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        border: "2px solid white", 
                        borderTopColor: "transparent", 
                        borderRadius: "50%", 
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" }
                        }
                      }} 
                    />
                  ) : (
                    `Follow ${post?.userName || ""} for comment`
                  )}
                </Button>
              </Box>
            )}
          </Box>

          {/* Comments List */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
            {commentLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "grey.200" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        width: "60%",
                        height: 16,
                        bgcolor: "grey.200",
                        mb: 1,
                        borderRadius: 1,
                      }}
                    />
                    <Box
                      sx={{
                        width: "80%",
                        height: 14,
                        bgcolor: "grey.200",
                        borderRadius: 1,
                      }}
                    />
                  </Box>
                </Stack>
              ))
            ) : comments.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "text.secondary",
                }}
              >
                <FiMessageCircle
                  style={{
                    fontSize: 32,
                    opacity: 0.4,
                    margin: "0 auto 8px",
                  }}
                />
                <Typography variant="body2" fontWeight="medium">
                  No comments yet
                </Typography>
     <Typography
  variant="caption"
  fontWeight="bold"
  color="black"
>
  {isCommentDisabled && !isOwnPost
    ? "Follow to comment"
    : "Be the first to comment"}
</Typography>


              </Box>
            ) : (
              <AnimatePresence>
                {comments.map((comment) => (
                  <motion.div
                    key={comment.commentId || comment._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <CommentItem
                      comment={comment}
                      authUser={authUser}
                      feedId={currentFeedId}
                      refreshParentComments={(updater) => {
                        if (typeof updater === "function") {
                          setComments((prev) => updater(prev)); // 🔥 instant UI update
                        } else {
                          fetchComments(); // fallback, optional
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </Box>

          {/* Add Comment */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ p: 2, borderTop: "1px solid #eee" }}
            alignItems="center"
            position="relative"
          >
            {/* Avatar */}
            <Avatar
              src={authUser?.profileAvatar}
              sx={{ width: 36, height: 36 }}
            />

            {/* Input Box */}
            <Box sx={{ flex: 1, position: "relative" }}>
              <TextField
  variant="standard"
  placeholder={
    checkingFollow
      ? "Checking follow status..."
      : isCommentDisabled && !isOwnPost
      ? `Follow ${post?.userName || "this user"} to comment`
      : "Write a comment..."
  }
  value={newComment}
  inputRef={inputRef}
  onChange={(e) => setNewComment(e.target.value)}
  fullWidth
  InputProps={{ disableUnderline: true }}
  onKeyDown={(e) =>
    e.key === "Enter" &&
    newComment.trim() &&
    !isCommentDisabled &&
    handlePostComment()
  }
  disabled={isCommentDisabled}
  sx={{
    pr: 5,
    opacity: isCommentDisabled ? 0.6 : 1,
    pointerEvents: isCommentDisabled ? "none" : "auto",

    "& .MuiInput-input": {
      cursor: isCommentDisabled ? "not-allowed" : "text",
      fontWeight: 600,
      color: "#000",
    },

    // 🔥 Placeholder styling
    "& .MuiInput-input::placeholder": {
      fontWeight: 700,
      color: "#000",
      opacity: 1, // important for Chrome
    },

    // 🔥 Disabled placeholder override
    "& .MuiInput-input.Mui-disabled::placeholder": {
      color: "#000",
      opacity: 1,
    },
  }}
/>


              {/* Emoji Picker Button */}
              {!isCommentDisabled && (
                <Box
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                >
                  <EmojiPicker
                    onEmojiSelect={(emoji) => setNewComment(newComment + emoji)}
                    buttonClassName="p-1 text-gray-500 hover:text-blue-600 rounded"
                  />
                </Box>
              )}
            </Box>

            {/* Send Button */}
            <IconButton
              onClick={handlePostComment}
              disabled={!newComment.trim() || isCommentDisabled}
              sx={{
                color:
                  !newComment.trim() || isCommentDisabled
                    ? "#aaa"
                    : "#1976d2",
                cursor: isCommentDisabled ? "not-allowed" : "pointer",
              }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Stack>

      {/* Toast Message */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={2000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
      />
    </Dialog>
  );
};

export default PostCommentsModal;
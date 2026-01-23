import React, { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import {
  Dialog,
  Stack,
  Avatar,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { FiMessageCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
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
  onFollowUpdate,
  isFollowing: parentIsFollowing,
}) => {
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [isOwnPost, setIsOwnPost] = useState(false);
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [optimisticFollow, setOptimisticFollow] = useState(false);

  const inputRef = useRef(null);
  const currentFeedId = feedId || post?._id;
  const postCreatorId = post?.postedBy?.id || post?.userId;

  const { user: authUser } = useAuth();
  const isFollowing = optimisticFollow || parentIsFollowing;
  const isCommentDisabled = checkingFollow || (!isFollowing && !isOwnPost);

  const checkFollowStatus = async () => {
    if (!postCreatorId || !authUser || optimisticFollow) return;

    if (postCreatorId === authUser?.userId || postCreatorId === authUser?._id) {
      setIsOwnPost(true);
      return;
    }

    setIsOwnPost(false);
    setCheckingFollow(true);

    try {
      const res = await api.post("/api/check/follow/status", {
        creatorId: postCreatorId,
      });
      if (res.data.success && !optimisticFollow) {
        onFollowUpdate(res.data.data?.isFollowing ?? false);
      }
    } catch (err) {
      // toast.error("Failed to check follow status");
    } finally {
      setCheckingFollow(false);
    }
  };

  const handleFollowUser = async () => {
    if (!postCreatorId || !authUser || isFollowingLoading || isFollowing) return;

    flushSync(() => {
      setOptimisticFollow(true);
      setCheckingFollow(false);
    });

    setIsFollowingLoading(true);

    try {
      const res = await api.post("/api/user/follow/creator", {
        userId: postCreatorId,
      });

      if (res.data.success) {
        onFollowUpdate(true);
        toast.success(`You are now following ${post?.userName || "this user"}`);
      } else {
        throw new Error("Follow failed");
      }
    } catch (err) {
      flushSync(() => {
        setOptimisticFollow(false);
      });
      onFollowUpdate(false);
      toast.error("Failed to follow user");
    } finally {
      setIsFollowingLoading(false);
    }
  };

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
      toast.error("Error loading comments");
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchComments();
      checkFollowStatus();
    } else {
      setIsOwnPost(false);
      setIsFollowingLoading(false);
      setNewComment("");
      setOptimisticFollow(false);
    }
  }, [open, postCreatorId, authUser]);

  useEffect(() => {
    if (open && !isCommentDisabled && inputRef.current) {
      const timer = setTimeout(() => {
        try {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        } catch (error) { }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isCommentDisabled, open]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!isFollowing && !isOwnPost) return;

    try {
      await api.post("/api/user/feed/comment", {
        feedId: currentFeedId,
        commentText: newComment,
      });

      await fetchComments();
      setCommentCount((prev) => prev + 1);
      setNewComment("");
      toast.success("Comment posted");

      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 50);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post");
    }
  };

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
          <Box sx={{ p: 2, borderBottom: "1px solid #eee" }}>
            <ModernPostHeader post={post} />

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
                    minWidth: 80,
                    backgroundColor: "#1976d2",
                    "&:hover": {
                      backgroundColor: "#1565c0",
                    }
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
                    `Follow ${post?.userName || post?.postedBy?.name || ""} to comment`
                  )}
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
            {commentLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Stack key={i} direction="row" spacing={1} sx={{ mb: 2 }}>
                  <Avatar
                    sx={{ width: 32, height: 32, bgcolor: "grey.200" }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ width: "60%", height: 16, bgcolor: "grey.200", mb: 1, borderRadius: 1 }} />
                    <Box sx={{ width: "80%", height: 14, bgcolor: "grey.200", borderRadius: 1 }} />
                  </Box>
                </Stack>
              ))
            ) : comments.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                <FiMessageCircle style={{ fontSize: 32, opacity: 0.4, margin: "0 auto 8px" }} />
                <Typography variant="body2" fontWeight="medium">No comments yet</Typography>
                <Typography variant="caption" fontWeight="bold" color="black">
                  {isCommentDisabled && !isOwnPost ? "Follow to comment" : "Be the first to comment"}
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
                          setComments((prev) => updater(prev));
                        } else {
                          fetchComments();
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </Box>

          <Stack
            direction="row"
            spacing={1.5}
            sx={{ p: 2, borderTop: "1px solid #eee" }}
            alignItems="center"
            position="relative"
          >
            <Avatar src={authUser?.profileAvatar} sx={{ width: 36, height: 36 }} />

            <Box sx={{ flex: 1, position: "relative" }}>
              <motion.div
                initial={{ opacity: 0.6, y: 4 }}
                animate={{
                  opacity: isCommentDisabled ? 0.6 : 1,
                  y: isCommentDisabled ? 4 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <TextField
                  variant="standard"
                  placeholder={
                    checkingFollow
                      ? "Checking follow status..."
                      : isCommentDisabled
                        ? `Follow ${post?.userName || post?.postedBy?.name || "this user"} to comment`
                        : "Write a comment..."
                  }
                  value={newComment}
                  inputRef={inputRef}
                  onChange={(e) => setNewComment(e.target.value)}
                  fullWidth
                  InputProps={{ disableUnderline: true }}
                  disabled={isCommentDisabled}
                />
              </motion.div>

              {!isCommentDisabled && (
                <Box sx={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)" }}>
                  <EmojiPicker
                    onEmojiSelect={(emoji) => setNewComment(newComment + emoji)}
                    buttonClassName="p-1 text-gray-500 hover:text-blue-600 rounded"
                  />
                </Box>
              )}
            </Box>

            <IconButton
              onClick={handlePostComment}
              disabled={!newComment.trim() || isCommentDisabled}
              sx={{ color: !newComment.trim() || isCommentDisabled ? "#aaa" : "#1976d2" }}
            >
              <SendIcon />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Dialog>
  );
};

export default PostCommentsModal;
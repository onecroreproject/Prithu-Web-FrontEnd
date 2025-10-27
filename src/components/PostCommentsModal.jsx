import React, { useState, useEffect } from "react";
import {
  Dialog,
  Stack,
  Avatar,
  Typography,
  Box,
  IconButton,
  TextField,
  Snackbar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CommentItem from "./CommentItem";
import axios from "../api/axios";

const PostCommentsModal = ({ open, onClose, post, authUser, feedId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Use feedId from props or fallback to post._id
  const currentFeedId = feedId || post?._id;

  const fetchComments = async () => {
    if (!currentFeedId) return;
    try {
      const res = await axios.post("/api/get/comments/for/feed", { feedId: currentFeedId });
      if (res.data.comments) setComments(res.data.comments);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    if (open) fetchComments();
  }, [open, currentFeedId]);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    try {
      const response = await axios.post("/api/user/feed/comment", {
        feedId: currentFeedId,
        commentText: newComment,
        userId: authUser._id,
        parentCommentId: null,
      });
      setNewComment("");
      fetchComments();
      setToastMsg(response.data.message || "Comment posted successfully");
    } catch (err) {
      console.error("Error posting comment:", err);
      setToastMsg(err.response?.data?.message || "Failed to post comment");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: "90vw",
          maxWidth: 1000,
          height: "80vh",
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 20,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <CloseIcon />
        </IconButton>

        <Stack
          direction={{ xs: "column", md: "row" }}
          sx={{ height: "100%" }}
        >
          {/* Left Side - Post */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              bgcolor: "#000", // optional for better video/image display
            }}
          >
            {post?.contentUrl && (
              post.type === "image" ? (
                <img
                  src={post.contentUrl}
                  alt="Post"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <video
                  src={post.contentUrl}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  controls
                  autoPlay
                  loop
                  muted
                />
              )
            )}
          </Box>

          {/* Right Side - Comments */}
          <Box
            sx={{
              width: { xs: "100%", md: 400 },
              bgcolor: "white",
              display: "flex",
              flexDirection: "column",
              borderLeft: { md: "1px solid #ddd" },
            }}
          >
            {/* Comments list */}
            <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
              {comments.length === 0 && (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  textAlign="center"
                  mt={4}
                >
                  No comments yet. Be the first to comment!
                </Typography>
              )}
              {comments.map((comment) => (
                <CommentItem
                  key={comment.commentId}
                  comment={comment}
                  authUser={authUser}
                  feedId={currentFeedId}
                  refreshComments={fetchComments}
                />
              ))}
            </Box>

            {/* Add new comment input */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 2, borderTop: "1px solid #eee" }}
              alignItems="center"
            >
              <Avatar
                src={authUser?.profileAvatar}
                sx={{ width: 36, height: 36 }}
              />
              <TextField
                variant="standard"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                fullWidth
                InputProps={{ disableUnderline: true }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newComment.trim()) handlePostComment();
                }}
              />
              <IconButton
                onClick={handlePostComment}
                disabled={!newComment.trim()}
              >
                <SendIcon />
              </IconButton>
            </Stack>
          </Box>
        </Stack>
      </Box>

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
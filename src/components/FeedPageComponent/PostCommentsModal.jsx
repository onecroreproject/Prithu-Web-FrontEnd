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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import CommentItem from "./CommentItem";
import api from "../../api/axios";

const PostCommentsModal = ({
  open,
  onClose,
  post,
  authUser,
  feedId,
  setCommentCount
}) => {

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const inputRef = useRef(null);
  const currentFeedId = feedId || post?._id;

  /* ------------------------ Fetch Comments ------------------------ */
  const fetchComments = async () => {
    if (!currentFeedId) return;

    try {
      const res = await api.post("/api/get/comments/for/feed", {
        feedId: currentFeedId,
      });

      if (res.data.comments) {
        setComments(res.data.comments);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchComments();
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  /* ---------------------------- Submit Comment ---------------------------- */
  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await api.post("/api/user/feed/comment", {
        feedId: currentFeedId,
        commentText: newComment,
        userId: authUser._id,
        parentCommentId: null,
      });

      const createdComment = response.data.comment;

      // Add new comment instantly
      setComments(prev => [createdComment, ...prev]);

      // Increase count instantly
      setCommentCount(prev => prev + 1);

      setNewComment("");
      setToastMsg("Comment posted");

    } catch (err) {
      console.error("Error posting comment:", err);
      setToastMsg(err.response?.data?.message || "Failed to post");
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
          {/* Comments List */}
          <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
            {comments.length === 0 && (
              <Typography
                variant="body2"
                textAlign="center"
                color="textSecondary"
                mt={4}
              >
                No comments yet — be the first!
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

          {/* Add Comment */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ p: 2, borderTop: "1px solid #eee" }}
            alignItems="center"
          >
            <Avatar src={authUser?.profileAvatar} sx={{ width: 36, height: 36 }} />

            <TextField
              variant="standard"
              placeholder="Write a comment..."
              value={newComment}
              inputRef={inputRef}
              onChange={(e) => setNewComment(e.target.value)}
              fullWidth
              InputProps={{ disableUnderline: true }}
              onKeyDown={(e) =>
                e.key === "Enter" && newComment.trim() && handlePostComment()
              }
            />

            <IconButton
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              sx={{ color: "#1976d2" }}
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

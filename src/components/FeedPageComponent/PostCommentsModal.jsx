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

const PostCommentsModal = ({ open, onClose, post, authUser, feedId }) => {
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

      setNewComment("");
      fetchComments();
      setToastMsg(response.data.message || "Comment posted");
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
          animation: "fadeIn 0.25s ease-out",
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
          "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Stack
        direction={{ xs: "column", md: "row" }}
        sx={{
          width: "100%",
          height: "100%",
          position: "relative",
        }}
      >
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
          {/* ------ Blurred Background ------ */}
          {post?.contentUrl && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  post.type === "image" ? `url(${post.contentUrl})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(28px)",
                transform: "scale(1.2)",
                opacity: 0.55,
                zIndex: 1,
              }}
            >
              {/* Video blurred background */}
              {post.type === "video" && (
                <video
                  src={post.contentUrl}
                  autoPlay
                  loop
                  muted
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: "blur(28px)",
                    transform: "scale(1.2)",
                    opacity: 0.55,
                  }}
                />
              )}
            </Box>
          )}

          {/* ------ Main Media (Foreground) ------ */}
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
                  zIndex: 2,
                }}
              />
            ) : (
              <video
                src={post.contentUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  position: "relative",
                  zIndex: 2,
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
            animation: "slideIn 0.35s ease",
            borderLeft: { md: "1px solid #eee" },
          }}
        >
          {/* Comments List */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 1,
              pr: 1,
              scrollBehavior: "smooth",
            }}
          >
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
            sx={{
              p: 2,
              borderTop: "1px solid #eee",
              bgcolor: "#fafafa",
            }}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" && newComment.trim()) {
                  handlePostComment();
                }
              }}
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

/* ---------- Smooth Animations ---------- */
const styles = document.createElement("style");
styles.innerHTML = `
@keyframes fadeIn {
  from { opacity:0; transform:scale(0.96); }
  to { opacity:1; transform:scale(1); }
}

@keyframes slideIn {
  from { opacity:0; transform:translateX(30px); }
  to { opacity:1; transform:translateX(0); }
}
`;
document.head.appendChild(styles);

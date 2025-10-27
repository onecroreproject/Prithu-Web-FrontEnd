import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stack, Avatar, Typography, Button, Box, TextField, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import axios from "../api/axios";

const CommentItem = ({ comment, authUser, feedId, refreshComments }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [replies, setReplies] = useState([]);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  const repliesContainerRef = useRef(null);

  const fetchReplies = useCallback(async () => {
    try {
      const res = await axios.post("/api/get/comments/relpy/for/feed", {
        parentCommentId: comment.commentId,
      });

      if (res.data.replies) {
        setReplies(res.data.replies);
        setReplyCount(res.data.replies.length);
      }

      setTimeout(() => {
        if (repliesContainerRef.current) {
          repliesContainerRef.current.scrollTop = repliesContainerRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error("Error fetching replies:", err);
    }
  }, [comment.commentId]);

  useEffect(() => {
    if (showReplyBox && replies.length === 0) fetchReplies();
  }, [showReplyBox, fetchReplies, replies.length]);

  const handleLikeComment = async () => {
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(likeCount - 1, 0) : likeCount + 1);

    try {
      await axios.post("/api/user/comment/like", { commentId: comment.commentId });
      refreshComments();
    } catch (err) {
      console.error(err);
      setIsLiked(prevLiked);
      setLikeCount(prevLiked ? likeCount + 1 : Math.max(likeCount - 1, 0));
    }
  };

  const handleReplyPost = async () => {
    if (!replyText.trim()) return;
    try {
      await axios.post("/api/user/feed/reply/comment", {
        parentCommentId: comment.commentId,
        commentText: replyText,
        userId: authUser._id,
      });

      setReplyText("");
      await fetchReplies(); // refresh local replies
      setReplyCount((prev) => prev + 1);
      refreshComments(); // optionally refresh parent comment list
    } catch (err) {
      console.error("Reply post error:", err);
    }
  };

  return (
    <Stack direction="column" spacing={0.5} sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Avatar
          src={comment.avatar || comment.user?.profileAvatar}
          sx={{ width: 32, height: 32, cursor: "pointer" }}
          onClick={() => navigate(`/profile/${comment.user?._id}`)}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">
            <b
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${comment.user?._id}`)}
            >
              {comment.username || comment.user?.userName || "Anonymous"}
            </b>{" "}
            {comment.commentText || comment.comment}
          </Typography>

          <Typography variant="caption" color="textSecondary">
            {comment.timeAgo || "Just now"}
          </Typography>

          <Stack direction="row" spacing={2} mt={0.5}>
            <Button size="small" onClick={handleLikeComment}>
              {isLiked ? `❤️ ${likeCount}` : `🤍 ${likeCount}`}
            </Button>
            <Button size="small" onClick={() => setShowReplyBox((prev) => !prev)}>
              💬 Reply ({replyCount})
            </Button>
          </Stack>

          {showReplyBox && (
            <Stack direction="row" spacing={1} mt={1} alignItems="center">
              <TextField
                variant="standard"
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                fullWidth
                InputProps={{ disableUnderline: true }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && replyText.trim()) handleReplyPost();
                }}
              />
              <IconButton onClick={handleReplyPost} disabled={!replyText.trim()}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}

          {replies.length > 0 && (
            <Box ref={repliesContainerRef} sx={{ pl: 4, mt: 1, maxHeight: 200, overflowY: "auto" }}>
              {replies.map((r) => (
                <CommentItem
                  key={r.commentId}
                  comment={r}
                  authUser={authUser}
                  feedId={feedId}
                  refreshComments={fetchReplies} // recursive refresh
                />
              ))}
            </Box>
          )}
        </Box>
      </Stack>
    </Stack>
  );
};
export default CommentItem;
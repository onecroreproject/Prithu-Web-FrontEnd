import React, { useState, useEffect, useRef, useCallback } from "react";
import { Stack, Avatar, Typography, Button, Box, TextField, IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import api from "../../api/axios";

const CommentItem = ({ comment, authUser, feedId, refreshComments, isReply = false }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [replies, setReplies] = useState([]);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyCount, setReplyCount] = useState(comment.replyCount || 0);
  const repliesContainerRef = useRef(null);

  /* ======================================================
     FETCH REPLIES - MAP REPLY PROPERLY
  ====================================================== */
  const fetchReplies = useCallback(async () => {
    try {
      const res = await api.post("/api/get/comments/relpy/for/feed", {
        parentCommentId: comment.commentId,
      });

      if (res?.data?.replies) {
        const mappedReplies = res.data.replies.map(r => ({
          commentId: r.replyId,       // use replyId as commentId internally
          replyId: r.replyId,         // keep original replyId
          commentText: r.replyText,
          likeCount: r.likeCount,
          isLiked: r.isLiked,
          username: r.username,
          avatar: r.avatar,
          timeAgo: r.timeAgo,
          replyCount: 0
        }));

        setReplies(mappedReplies);
        setReplyCount(mappedReplies.length);
      }

      setTimeout(() => {
        if (repliesContainerRef.current) {
          repliesContainerRef.current.scrollTop =
            repliesContainerRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      console.error("Error fetching replies:", err);
    }
  }, [comment.commentId]);

  useEffect(() => {
    if (showReplyBox && replies.length === 0) fetchReplies();
  }, [showReplyBox, fetchReplies, replies.length]);

  /* ======================================================
     LIKE MAIN COMMENT / LIKE REPLY COMMENT
  ====================================================== */
  const handleLikeComment = async () => {
    const prevLiked = isLiked;

    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? likeCount - 1 : likeCount + 1);

    try {
      if (!isReply) {
        await api.post("/api/user/comment/like", {
          commentId: comment.commentId,
        });
      } else {
        await api.post("/api/user/replyComment/like", {
          replyCommentId: comment.replyId, // correct field
        });
      }

      refreshComments();
    } catch (err) {
      console.error(err);
      setIsLiked(prevLiked);
      setLikeCount(prevLiked ? likeCount + 1 : likeCount - 1);
    }
  };

  /* ======================================================
     POST A REPLY (MAIN COMMENT ONLY)
  ====================================================== */
  const handleReplyPost = async () => {
    if (!replyText.trim()) return;
    try {
      await api.post("/api/user/feed/reply/comment", {
        parentCommentId: comment.commentId,
        commentText: replyText,
        userId: authUser._id,
      });

      setReplyText("");
      await fetchReplies();
      setReplyCount(prev => prev + 1);
      refreshComments();
    } catch (err) {
      console.error("Reply post error:", err);
    }
  };

  return (
    <Stack direction="column" spacing={0.5} sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Avatar
          src={comment.avatar}
          sx={{ width: 32, height: 32, cursor: "pointer" }}
        />

        <Box sx={{ flex: 1 }}>
          <Typography variant="body2">
            <b style={{ cursor: "pointer" }}>{comment.username}</b>{" "}
            {comment.commentText}
          </Typography>

          <Typography variant="caption" color="textSecondary">
            {comment.timeAgo || "Just now"}
          </Typography>

          <Stack direction="row" spacing={2} mt={0.5}>
            <Button size="small" onClick={handleLikeComment}>
              {isLiked ? `❤️ ${likeCount}` : `🤍 ${likeCount}`}
            </Button>

            {!isReply && (
              <Button size="small" onClick={() => setShowReplyBox(prev => !prev)}>
                💬 Reply ({replyCount})
              </Button>
            )}
          </Stack>

          {!isReply && showReplyBox && (
            <Stack direction="row" spacing={1} mt={1} alignItems="center">
              <TextField
                variant="standard"
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                fullWidth
                InputProps={{ disableUnderline: true }}
                onKeyDown={(e) =>
                  e.key === "Enter" && replyText.trim() && handleReplyPost()
                }
              />
              <IconButton onClick={handleReplyPost} disabled={!replyText.trim()}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Stack>
          )}

          {!isReply && replies.length > 0 && (
            <Box
              ref={repliesContainerRef}
              sx={{ pl: 4, mt: 1, maxHeight: 200, overflowY: "auto" }}
            >
              {replies.map((reply) => (
                <CommentItem
                  key={reply.commentId}
                  comment={reply}
                  authUser={authUser}
                  feedId={feedId}
                  refreshComments={fetchReplies}
                  isReply={true}
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

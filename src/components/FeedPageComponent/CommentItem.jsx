// src/components/comments/CommentItemTailwind.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { FiChevronDown, FiChevronUp, FiHeart, FiSend } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

/**
 * ReplyItem component - renders a single reply and supports nested replies (unlimited).
 */
const ReplyItem = ({
  reply,
  feedId,
  authUser,
  onRefreshReplies,
  depth = 0,
  maxDepth = 999,
}) => {
  const [isLiked, setIsLiked] = useState(Boolean(reply.isLiked));
  const [likeCount, setLikeCount] = useState(reply.likeCount || 0);
  const [showNested, setShowNested] = useState(false);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [nestedLoading, setNestedLoading] = useState(false);

  // local reply box (replying to THIS reply)
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

  const nestedContainerRef = useRef(null);

  const fetchNestedReplies = useCallback(async () => {
    if (!reply.replyId) return;
    try {
      setNestedLoading(true);
      const res = await api.post("/api/get/nested/replies", { parentReplyId: reply.replyId });
      const arr = res.data?.replies || [];
      setNestedReplies(arr);
      return arr;
    } catch (err) {
      console.error("fetchNestedReplies error", err);
      return [];
    } finally {
      setNestedLoading(false);
    }
  }, [reply.replyId]);

  const toggleNested = async () => {
    if (showNested) {
      setShowNested(false);
      return;
    }

    setShowNested(true);

    if (nestedReplies.length === 0) {
      await fetchNestedReplies();

      setTimeout(() => {
        if (nestedContainerRef.current) {
          nestedContainerRef.current.scrollTop =
            nestedContainerRef.current.scrollHeight;
        }
      }, 30);
    }
  };

  const handleLikeReply = async () => {
    const prevLiked = isLiked;
    const prevCount = likeCount;
    // optimistic update
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const id = reply.replyId || reply._id;
      const res = await api.post("/api/user/replycomment/like", { replyCommentId: id });
      if (res?.data?.liked !== undefined) {
        setIsLiked(res.data.liked);
        if (typeof res.data.likeCount === "number") setLikeCount(res.data.likeCount);
      } else {
        await onRefreshReplies?.();
      }
    } catch (err) {
      // rollback on error
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      console.error("like reply error", err);
    }
  };

  const handlePostNestedReply = async () => {
    const text = (replyText || "").trim();
    if (!text) return;
    try {
      await api.post("/api/user/feed/reply/comment", {
        feedId,
        parentCommentId: reply.commentId || reply.parentCommentId,
        parentReplyId: reply.replyId || reply._id,
        commentText: text,
      });
      setReplyText("");
      setShowReplyBox(false);
      // reload nested replies & inform parent
      await fetchNestedReplies();
      await onRefreshReplies?.();
    } catch (err) {
      console.error("post nested reply error", err);
    }
  };

  return (
    <div className={`relative flex space-x-2 ${depth > 0 ? "pl-3" : ""}`}>
      {depth > 0 && <div className="absolute left-1 top-0 bottom-0 w-px bg-gray-100" />}
      <img src={reply.avatar || "/default-avatar.png"} className="w-6 h-6 rounded-full object-cover" alt={reply.username} />
      <div className="flex-1">
        <div className="px-2">
          <div className="flex justify-between gap-1">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{reply.username}</div>
              <div className="text-xs text-gray-500">{reply.timeAgo}</div>
              <div className="text-sm text-gray-700 break-words">{reply.replyText}</div>
            </div>

            <button onClick={handleLikeReply} className={`flex items-center text-xs ${isLiked ? "text-red-500" : "text-gray-400"} shrink-0`}>
              <FiHeart /> <span className="ml-1">{likeCount}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
          {depth < maxDepth && (
            <button onClick={() => setShowReplyBox(prev => !prev)} className="hover:text-blue-600">Reply</button>
          )}

          <button onClick={toggleNested} className="flex items-center gap-1 hover:text-blue-600">
            {showNested ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />} 
            <span>{reply.nestedCount ? `Replies (${reply.nestedCount})` : "Replies"}</span>
          </button>
        </div>

        <AnimatePresence>
          {showReplyBox && depth < maxDepth && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1">
              <div className="flex items-center gap-1">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${reply.username}...`}
                  className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handlePostNestedReply()}
                />
                <button onClick={handlePostNestedReply} disabled={!replyText.trim()} className="p-1 bg-blue-600 text-white rounded disabled:opacity-40">
                  <FiSend size={12} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showNested && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="pl-3 mt-1 border-l border-gray-100" ref={nestedContainerRef}>
              {nestedLoading ? (
                <p className="text-xs text-gray-400">Loading...</p>
              ) : nestedReplies.length > 0 ? (
                nestedReplies.map((child) => (
                  <ReplyItem
                    key={child.replyId || child._id}
                    reply={child}
                    feedId={feedId}
                    authUser={authUser}
                    onRefreshReplies={onRefreshReplies}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-400">No replies yet</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * CommentItem (top-level comment)
 */
const CommentItem = ({ comment, feedId, authUser, refreshParentComments, maxDepth = 999 }) => {
  const [isLiked, setIsLiked] = useState(Boolean(comment.isLiked));
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);

  const [topReplies, setTopReplies] = useState([]);
  const [allReplies, setAllReplies] = useState([]);
  const [showReplies, setShowReplies] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");
  const repliesContainerRef = useRef(null);

  const fetchReplies = useCallback(async () => {
    if (!comment.commentId && !comment._id) return;
    try {
      setReplyLoading(true);
      const res = await api.post("/api/get/replies/for/comment", {
        parentCommentId: comment.commentId || comment._id,
      });
      const arr = res.data?.replies || [];

      const childrenMap = {};
      arr.forEach(r => {
        const key = r.parentReplyId ? String(r.parentReplyId) : null;
        if (!childrenMap[key]) childrenMap[key] = [];
        childrenMap[key].push(r);
      });

      const top = arr.filter(r => !r.parentReplyId).map(r => ({
        ...r,
        nestedCount: (childrenMap[String(r.replyId)] || []).length
      }));

      setAllReplies(arr);
      setTopReplies(top);
      return arr;
    } catch (err) {
      console.error("fetchReplies error", err);
      return [];
    } finally {
      setReplyLoading(false);
      setTimeout(() => {
        if (repliesContainerRef.current) repliesContainerRef.current.scrollTop = repliesContainerRef.current.scrollHeight;
      }, 40);
    }
  }, [comment.commentId, comment._id]);

  const toggleReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }
    setShowReplies(true);
    if (topReplies.length === 0) {
      await fetchReplies();
    }
  };

  const handleLikeComment = async () => {
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!prevLiked);
    setLikeCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const id = comment.commentId || comment._id;
      const res = await api.post("/api/user/comment/like", { commentId: id });
      if (res?.data?.liked !== undefined) {
        setIsLiked(res.data.liked);
        if (typeof res.data.likeCount === "number") setLikeCount(res.data.likeCount);
      } else {
        await refreshParentComments?.();
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
      console.error("like comment error", err);
    }
  };

  const handlePostReply = async () => {
    const text = (replyText || "").trim();
    if (!text) return;
    try {
      await api.post("/api/user/feed/reply/comment", {
        feedId,
        parentCommentId: comment.commentId || comment._id,
        commentText: text,
      });
      setReplyText("");
      setShowReplyBox(false);

      await fetchReplies();
      await refreshParentComments?.();
    } catch (err) {
      console.error("post reply error", err);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-start space-x-2">
        <img src={comment.avatar || comment.profileAvatar || "/default-avatar.png"} alt={comment.username || comment.userName || "User"} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1">
          <div className="px-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{comment.username || comment.userName || "Unknown User"}</div>
                <div className="text-xs text-gray-500">{comment.timeAgo || "Just now"}</div>
                <div className="text-sm text-gray-700 break-words">{comment.commentText}</div>
              </div>

              <button onClick={handleLikeComment} className={`flex items-center space-x-1 text-xs ${isLiked ? "text-red-500" : "text-gray-400"} shrink-0`}>
                <FiHeart size={12} />
                <span>{likeCount}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
            <button onClick={() => setShowReplyBox(prev => !prev)} className="hover:text-blue-600">Reply</button>
            <button onClick={toggleReplies} className="flex items-center gap-1 hover:text-blue-600">
              {showReplies ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
              <span>{topReplies.length > 0 ? `Replies (${topReplies.length})` : "Replies"}</span>
            </button>
          </div>

          <AnimatePresence>
            {showReplyBox && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.12 }} className="mt-1">
                <div className="flex items-center gap-1">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                    onKeyDown={(e) => e.key === "Enter" && handlePostReply()}
                  />
                  <button onClick={handlePostReply} disabled={!replyText.trim()} className="p-1 bg-blue-600 text-white rounded disabled:opacity-50">
                    <FiSend size={12} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showReplies && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.14 }} className="mt-2 space-y-1 pl-3 border-l border-gray-100" ref={repliesContainerRef}>
                {replyLoading ? (
                  <div className="text-xs text-gray-400">Loading replies...</div>
                ) : topReplies.length > 0 ? (
                  topReplies.map(r => (
                    <ReplyItem
                      key={r.replyId || r._id}
                      reply={r}
                      feedId={feedId}
                      authUser={authUser}
                      onRefreshReplies={fetchReplies}
                      depth={0}
                      maxDepth={maxDepth}
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-400">No replies yet</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
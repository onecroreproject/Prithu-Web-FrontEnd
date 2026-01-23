// src/components/comments/CommentItemTailwind.jsx
import React, { useState, useCallback, useEffect, useRef } from "react";
import { FiChevronDown, FiChevronUp, FiHeart, FiSend, FiTrash2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import EmojiPicker from "../EmojiPicker";
import defaultAvater from "../../assets/user.png"

/**
 * Helper function to count words in text
 */
const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};

/**
 * Helper function to check if text exceeds word limit
 */
const isOverWordLimit = (text, limit = 100) => {
  return countWords(text) > limit;
};

/**
 * WordCountIndicator component
 */
const WordCountIndicator = ({ text, limit = 100, className = "" }) => {
  const wordCount = countWords(text);
  const isOverLimit = wordCount > limit;

  if (wordCount === 0) return null;

  return (
    <div className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500'} ${className}`}>
      {wordCount}/{limit} words
      {isOverLimit && (
        <span className="ml-2 font-medium">Word limit exceeded</span>
      )}
    </div>
  );
};

/**
 * ReplyItem component - renders a single reply and supports nested replies (unlimited).
 */
const ReplyItem = ({
  reply,
  feedId,
  onRefreshReplies,
  depth = 0,
  maxDepth = 999,
  refreshParentComments,
}) => {
  const [isLiked, setIsLiked] = useState(Boolean(reply.isLiked));
  const [likeCount, setLikeCount] = useState(reply.likeCount || 0);
  const [showNested, setShowNested] = useState(false);
  const [nestedReplies, setNestedReplies] = useState([]);
  const [nestedLoading, setNestedLoading] = useState(false);
  const authUser=localStorage.getItem("userId")
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

  const handleDeleteReply = async () => {
   
    try {
      const id = reply.replyId || reply._id;
      await api.delete(`/api/user/delete/reply/comment/${id}`);
      
      // Refresh replies after deletion
      await onRefreshReplies?.();
    } catch (err) {
      console.error("delete reply error", err);
      alert("Failed to delete reply");
    }
  };

  const handlePostNestedReply = async () => {
    const text = (replyText || "").trim();
    if (!text) return;
    
    // Check word limit
    if (isOverWordLimit(text)) {
      alert("Reply cannot exceed 100 words");
      return;
    }

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

  // Check if current user is the owner of this reply
  const isOwner = authUser && reply.userId === authUser;

  // Calculate if reply text is over limit
  const isReplyOverLimit = isOverWordLimit(replyText);

  return (
    <div className={`relative flex space-x-2 ${depth > 0 ? "pl-3" : ""}`}>
      {depth > 0 && <div className="absolute left-1 top-0 bottom-0 w-px bg-gray-100" />}
      <img src={reply.avatar || defaultAvater} className="w-6 h-6 rounded-full object-cover" alt={reply.username} />
      <div className="flex-1">
        <div className="px-2">
          <div className="flex justify-between gap-1">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-gray-800 truncate">{reply.username}</div>
              <div className="text-xs text-gray-500">{reply.timeAgo}</div>
              <div className="text-sm text-gray-700 break-words">{reply.replyText}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={handleLikeReply} className={`flex items-center text-xs ${isLiked ? "text-red-500" : "text-gray-400"}`}>
                <FiHeart /> <span className="ml-1">{likeCount}</span>
              </button>
              
              {/* Delete button for reply owner */}
              {isOwner && (
                <button 
                  onClick={handleDeleteReply}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete reply"
                >
                  <FiTrash2 size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
          {depth < maxDepth && (
            <button onClick={() => setShowReplyBox(prev => !prev)} className="hover:text-blue-600">Reply</button>
          )}

          {reply.nestedCount > 0 && (
            <button onClick={toggleNested} className="flex items-center gap-1 hover:text-blue-600">
              {showNested ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
              <span>Replies ({reply.nestedCount})</span>
            </button>
          )}
        </div>

        <AnimatePresence>
          {showReplyBox && depth < maxDepth && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-1">
              <div className="space-y-2">
                {/* Word count indicator - only shows when typing */}
                <WordCountIndicator text={replyText} />
                
                <div className="flex items-center gap-1 relative">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to ${reply.username}...`}
                    className={`flex-1 border rounded px-2 py-1 text-sm pr-20 focus:outline-none focus:ring-1 ${
                      isReplyOverLimit 
                        ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                        : 'border-gray-200 focus:ring-blue-400'
                    }`}
                    onKeyDown={(e) => e.key === "Enter" && !isReplyOverLimit && handlePostNestedReply()}
                  />
                  <div className="absolute right-10">
                    <EmojiPicker
                      onEmojiSelect={(emoji) => setReplyText(replyText + emoji)}
                      buttonClassName="p-0.5 text-gray-400 hover:text-blue-600 rounded"
                    />
                  </div>
                  <button 
                    onClick={handlePostNestedReply} 
                    disabled={!replyText.trim() || isReplyOverLimit} 
                    className="p-1 bg-blue-600 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FiSend size={12} />
                  </button>
                </div>
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
                    onRefreshReplies={fetchNestedReplies}
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
const CommentItem = ({ comment, feedId, refreshParentComments, maxDepth = 999 }) => {
  const [isLiked, setIsLiked] = useState(Boolean(comment.isLiked));
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const authUser=localStorage.getItem("userId")
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

  const handleDeleteComment = async () => {
  
    try {
      const id = comment.commentId || comment._id;
      await api.delete(`/api/user/delete/comment/${id}`);
      
      // Refresh comments after deletion
      await refreshParentComments?.();
    } catch (err) {
      console.error("delete comment error", err);
      alert("Failed to delete comment");
    }
  };

  const handlePostReply = async () => {
    const text = (replyText || "").trim();
    if (!text) return;
    
    // Check word limit
    if (isOverWordLimit(text)) {
      alert("Reply cannot exceed 100 words");
      return;
    }

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

  // Check if current user is the owner of this comment
  const isOwner = authUser && comment.userId === authUser;

  // Calculate if reply text is over limit
  const isReplyOverLimit = isOverWordLimit(replyText);

  return (
    <div className="w-full">
      <div className="flex items-start space-x-2">
        <img src={comment.avatar || comment.profileAvatar || defaultAvater} alt={comment.username || comment.userName || "User"} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
        <div className="flex-1">
          <div className="px-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">{comment.username || comment.userName || "Unknown User"}</div>
                <div className="text-xs text-gray-500">{comment.timeAgo || "Just now"}</div>
                <div className="text-sm text-gray-700 break-words">{comment.commentText}</div>
              </div>
             
              <div className="flex items-center space-x-2 shrink-0">
                <button onClick={handleLikeComment} className={`flex items-center space-x-1 text-xs ${isLiked ? "text-red-500" : "text-gray-400"}`}>
                  <FiHeart size={12} />
                  <span>{likeCount}</span>
                </button>
                
                {/* Delete button for comment owner */}
                {isOwner && (
                  <button 
                    onClick={handleDeleteComment}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete comment"
                  >
                    <FiTrash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
            <button onClick={() => setShowReplyBox(prev => !prev)} className="hover:text-blue-600">Reply</button>
            
            {/* Show replies button only if there are replies */}
            {(comment.replyCount > 0 || topReplies.length > 0) && (
              <button onClick={toggleReplies} className="flex items-center gap-1 hover:text-blue-600">
                {showReplies ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                <span>Replies ({comment.replyCount || topReplies.length})</span>
              </button>
            )}
          </div>

          <AnimatePresence>
            {showReplyBox && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.12 }} className="mt-1">
                <div className="space-y-2">
                  {/* Word count indicator - only shows when typing */}
                  <WordCountIndicator text={replyText} />
                  
                  <div className="flex items-center gap-1 relative">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write a reply..."
                      className={`flex-1 bg-white border rounded px-2 py-1 text-sm pr-20 focus:outline-none focus:ring-1 ${
                        isReplyOverLimit 
                          ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                          : 'border-gray-200 focus:ring-blue-400'
                      }`}
                      onKeyDown={(e) => e.key === "Enter" && !isReplyOverLimit && handlePostReply()}
                    />
                    <div className="absolute right-10">
                      <EmojiPicker
                        onEmojiSelect={(emoji) => setReplyText(replyText + emoji)}
                        buttonClassName="p-0.5 text-gray-400 hover:text-blue-600 rounded"
                      />
                    </div>
                    <button 
                      onClick={handlePostReply} 
                      disabled={!replyText.trim() || isReplyOverLimit} 
                      className="p-1 bg-blue-600 text-white rounded disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FiSend size={12} />
                    </button>
                  </div>
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

/**
 * Main Comment Input Component with Emoji Picker and Word Limit
 */
const CommentInputWithEmoji = ({ feedId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim() || isOverWordLimit(commentText)) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/user/feed/comment', {
        feedId,
        commentText: commentText.trim()
      });

      if (response.data.comment) {
        setCommentText("");
        onCommentAdded?.(response.data.comment);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !isOverWordLimit(commentText)) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const isOverLimit = isOverWordLimit(commentText);

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      <div className="space-y-2">
        {/* Word count indicator - only shows when typing */}
        <WordCountIndicator text={commentText} />
        
        <div className="flex items-center gap-2 relative">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (max 100 words)"
            className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition-colors ${
              isOverLimit 
                ? 'border-red-300 focus:ring-red-400 bg-red-50' 
                : 'border-gray-300 focus:ring-blue-400 focus:border-blue-400'
            }`}
            disabled={isSubmitting}
          />
          
          {/* Emoji Picker */}
          <div className="absolute right-16">
            <EmojiPicker
              onEmojiSelect={(emoji) => setCommentText(commentText + emoji)}
              buttonClassName="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
            />
          </div>
          
          {/* Send Button */}
          <button
            onClick={handleAddComment}
            disabled={!commentText.trim() || isOverLimit || isSubmitting}
            className={`px-3 py-2 rounded-lg transition-colors ${
              !commentText.trim() || isOverLimit || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiSend size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export { CommentInputWithEmoji, WordCountIndicator, countWords, isOverWordLimit };
export default CommentItem;

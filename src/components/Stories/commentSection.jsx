import React, { useState, useEffect } from "react";
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";

const CommentsSection = ({ feed }) => {
  // State management
  const [comments, setComments] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  // Replies state
  const [replies, setReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [activeReplyInput, setActiveReplyInput] = useState(null);
  
  // Nested replies state
  const [nestedReplies, setNestedReplies] = useState({});
  const [nestedReplyInputs, setNestedReplyInputs] = useState({});
  const [showNestedReplies, setShowNestedReplies] = useState({});
  const [activeNestedReplyInput, setActiveNestedReplyInput] = useState(null);
  const [nestedReplyLoading, setNestedReplyLoading] = useState({});

  // Fetch comments for the feed
  const fetchComments = async () => {
    if (!feed?._id) return;
    
    try {
      setCommentLoading(true);
      const response = await api.post('/api/get/comments/for/feed', {
        feedId: feed._id
      });
      
      setComments(response.data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Add new comment
  const handleAddComment = async (feedId) => {
    if (!newComment.trim()) return;

    try {
      const response = await api.post('/api/user/feed/comment', {
        feedId,
        commentText: newComment.trim()
      });

      if (response.data.comment) {
        setComments(prev => [response.data.comment, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Like main comment
  const likeComment = async (commentId, feedId) => {
    try {
      const response = await api.post('/api/user/comment/like', {
        commentId
      });

      if (response.data.liked !== undefined) {
        setComments(prev => prev.map(comment => 
          comment.commentId === commentId || comment._id === commentId
            ? {
                ...comment,
                isLiked: response.data.liked,
                likeCount: response.data.liked 
                  ? (comment.likeCount || 0) + 1 
                  : Math.max(0, (comment.likeCount || 1) - 1)
              }
            : comment
        ));
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  // Fetch replies for a comment
  const fetchReplies = async (commentId) => {
    try {
      setReplyLoading(prev => ({ ...prev, [commentId]: true }));
      
      const response = await api.post('/api/get/replies/for/comment', {
        parentCommentId: commentId
      });

      setReplies(prev => ({ 
        ...prev, 
        [commentId]: response.data.replies || [] 
      }));
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setReplyLoading(prev => ({ ...prev, [commentId]: false }));
    }
  };

  // Post reply (both regular and nested)
  const postReply = async ({ feedId, parentCommentId, parentReplyId = null, replyText }) => {
    try {
      const response = await api.post('/api/user/feed/reply/comment', {
        commentText: replyText,
        parentCommentId,
        parentReplyId
      });

      if (response.data.reply) {
        const newReply = response.data.reply;
        
        // Update replies state
        if (parentReplyId) {
          // This is a nested reply
          const key = `${parentCommentId}_${parentReplyId}`;
          setNestedReplies(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), newReply]
          }));
        } else {
          // This is a regular reply
          setReplies(prev => ({
            ...prev,
            [parentCommentId]: [...(prev[parentCommentId] || []), newReply]
          }));
        }

        // Update comment reply count
        setComments(prev => prev.map(comment => 
          comment.commentId === parentCommentId || comment._id === parentCommentId
            ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
            : comment
        ));
      }

      return response.data;
    } catch (error) {
      console.error("Error posting reply:", error);
      throw error;
    }
  };

  // Like reply
  const likeReply = async (replyId, commentId) => {
    try {
      const response = await api.post('/api/user/replycomment/like', {
        replyCommentId: replyId
      });

      if (response.data.liked !== undefined) {
        // Update in regular replies
        setReplies(prev => ({
          ...prev,
          [commentId]: (prev[commentId] || []).map(reply => 
            reply.replyId === replyId || reply._id === replyId
              ? {
                  ...reply,
                  isLiked: response.data.liked,
                  likeCount: response.data.liked 
                    ? (reply.likeCount || 0) + 1 
                    : Math.max(0, (reply.likeCount || 1) - 1)
                }
              : reply
          )
        }));

        // Update in nested replies
        Object.keys(nestedReplies).forEach(key => {
          if (nestedReplies[key].some(reply => reply.replyId === replyId || reply._id === replyId)) {
            setNestedReplies(prev => ({
              ...prev,
              [key]: prev[key].map(reply => 
                reply.replyId === replyId || reply._id === replyId
                  ? {
                      ...reply,
                      isLiked: response.data.liked,
                      likeCount: response.data.liked 
                        ? (reply.likeCount || 0) + 1 
                        : Math.max(0, (reply.likeCount || 1) - 1)
                    }
                  : reply
              )
            }));
          }
        });
      }
    } catch (error) {
      console.error("Error liking reply:", error);
    }
  };

  // Toggle replies section
  const toggleReplySection = async (commentId) => {
    if (showReplies[commentId]) {
      setShowReplies(prev => ({ ...prev, [commentId]: false }));
      setActiveReplyInput(null);
    } else {
      setShowReplies(prev => ({ ...prev, [commentId]: true }));
      setActiveReplyInput(commentId);
      if (!replies[commentId]) {
        await fetchReplies(commentId);
      }
    }
  };

  // Fetch nested replies
  const fetchNestedReplies = async (parentReplyId, commentId) => {
    const key = `${commentId}_${parentReplyId}`;
    
    try {
      setNestedReplyLoading(prev => ({ ...prev, [key]: true }));
      
      const response = await api.post('/api/get/nested/replies', {
        parentReplyId 
      });

      setNestedReplies(prev => ({ 
        ...prev, 
        [key]: response.data.replies || [] 
      }));
    } catch (error) {
      console.error("Error fetching nested replies:", error);
    } finally {
      setNestedReplyLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Toggle nested replies section
  const toggleNestedReplySection = async (parentReplyId, commentId) => {
    const key = `${commentId}_${parentReplyId}`;
    
    if (showNestedReplies[key]) {
      setShowNestedReplies(prev => ({ ...prev, [key]: false }));
      setActiveNestedReplyInput(null);
    } else {
      setShowNestedReplies(prev => ({ ...prev, [key]: true }));
      setActiveNestedReplyInput(null);
      await fetchNestedReplies(parentReplyId, commentId);
    }
  };

  // Handle nested reply input
  const handleNestedReplyInput = (commentId, parentReplyId, value) => {
    setNestedReplyInputs(prev => ({
      ...prev,
      [`${commentId}_${parentReplyId}`]: value
    }));
  };

  // Open nested reply input
  const openNestedReplyInput = (commentId, parentReplyId, targetUsername) => {
    setActiveNestedReplyInput(`${commentId}_${parentReplyId}`);
    setNestedReplyInputs(prev => ({ 
      ...prev, 
      [`${commentId}_${parentReplyId}`]: `@${targetUsername} ` 
    }));
  };

  // Unified function to handle both regular and nested replies
  const handlePostReply = async (feedId, commentId, parentReplyId = null, targetUsername = null) => {
    const isNestedReply = parentReplyId !== null;
    const text = isNestedReply 
      ? nestedReplyInputs[`${commentId}_${parentReplyId}`]?.trim()
      : replyInputs[commentId]?.trim();
    
    if (!text) return;

    try {
      await postReply({
        feedId,
        parentCommentId: commentId,
        parentReplyId,
        replyText: text
      });

      // Clear input
      if (isNestedReply) {
        setNestedReplyInputs(prev => ({ ...prev, [`${commentId}_${parentReplyId}`]: "" }));
        setActiveNestedReplyInput(null);
      } else {
        setReplyInputs(prev => ({ ...prev, [commentId]: "" }));
        setActiveReplyInput(null);
      }

      // Refresh data
      if (isNestedReply) {
        await fetchNestedReplies(parentReplyId, commentId);
        await fetchReplies(commentId);
      } else {
        await fetchReplies(commentId);
      }

    } catch (error) {
      console.error("Error posting reply:", error);
    }
  };

  // Get nested reply count
  const getNestedReplyCount = (parentReplyId, commentId) => {
    const key = `${commentId}_${parentReplyId}`;
    
    if (nestedReplies[key]) {
      return nestedReplies[key].length;
    }
    
    const allReplies = replies[commentId] || [];
    const nestedCount = allReplies.filter(reply => 
      reply.parentReplyId === parentReplyId
    ).length;
    
    return nestedCount;
  };

  // Organize replies by parentReplyId
  const organizeReplies = (repliesArray) => {
    const firstLevelReplies = [];
    const nestedRepliesMap = {};
    
    repliesArray?.forEach(reply => {
      if (reply.parentReplyId) {
        if (!nestedRepliesMap[reply.parentReplyId]) {
          nestedRepliesMap[reply.parentReplyId] = [];
        }
        nestedRepliesMap[reply.parentReplyId].push(reply);
      } else {
        firstLevelReplies.push(reply);
      }
    });
    
    return { firstLevelReplies, nestedRepliesMap };
  };

  // Recursive component for nested replies
  const ReplyItem = ({ reply, commentId, depth = 0, parentUsername = "" }) => {
    const maxDepth = 3;
    const canNest = depth < maxDepth;
    const nestedRepliesKey = `${commentId}_${reply.replyId || reply._id}`;
    const isNestedRepliesOpen = showNestedReplies[nestedRepliesKey];
    const nestedReplyCount = getNestedReplyCount(reply.replyId || reply._id, commentId);
    const hasNestedReplies = nestedReplyCount > 0;
    const isNestedInputActive = activeNestedReplyInput === nestedRepliesKey;
    const isLoading = nestedReplyLoading[nestedRepliesKey];

    return (
      <div className={`flex items-start space-x-2 pt-3 ${depth > 0 ? 'ml-4' : ''}`}>
        <img
          src={reply.avatar || reply.profileAvatar || "/default-avatar.png"}
          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
          alt=""
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-xs truncate">
                  {reply.username || reply.userName || "Unknown User"}
                </span>
                <span className="text-[10px] text-gray-500 flex-shrink-0">
                  {reply.timeAgo || "Just now"}
                </span>
              </div>
              <p className="text-xs text-gray-800 mt-1 break-words">
                {reply.replyText || reply.commentText}
              </p>
            </div>
            <button
              onClick={() => likeReply(reply.replyId || reply._id, commentId)}
              className={`text-xs flex items-center space-x-1 flex-shrink-0 ${
                reply.isLiked ? "text-red-500" : "text-gray-500"
              }`}
            >
              <span>{reply.isLiked ? "♥" : "♡"}</span>
              <span>{reply.likeCount || 0}</span>
            </button>
          </div>

          {/* Nested Reply buttons */}
          {canNest && (
            <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
              {hasNestedReplies && (
                <button
                  onClick={() => toggleNestedReplySection(reply.replyId || reply._id, commentId)}
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
                  disabled={isLoading}
                >
                  <span>{isNestedRepliesOpen ? <FiChevronUp size={10} /> : <FiChevronDown size={10} />}</span>
                  <span className="font-medium">
                    {isLoading ? "Loading..." : `Replies (${nestedReplyCount})`}
                  </span>
                </button>
              )}
              
              <button
                onClick={() => openNestedReplyInput(
                  commentId, 
                  reply.replyId || reply._id, 
                  reply.username || reply.userName
                )}
                className="hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
              >
                Reply
              </button>
            </div>
          )}

          {/* Nested Reply Input */}
          <AnimatePresence>
            {isNestedInputActive && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="flex items-center space-x-2 pt-3"
              >
                <input
                  value={nestedReplyInputs[nestedRepliesKey] || ""}
                  onChange={(e) => handleNestedReplyInput(
                    commentId, 
                    reply.replyId || reply._id, 
                    e.target.value
                  )}
                  placeholder={`Reply to ${reply.username || reply.userName}...`}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyPress={(e) => e.key === "Enter" && handlePostReply(
                    feed._id, 
                    commentId, 
                    reply.replyId || reply._id, 
                    reply.username || reply.userName
                  )}
                  autoFocus
                />
                <button
                  onClick={() => handlePostReply(
                    feed._id, 
                    commentId, 
                    reply.replyId || reply._id, 
                    reply.username || reply.userName
                  )}
                  disabled={!nestedReplyInputs[nestedRepliesKey]?.trim()}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <FiSend size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested Replies Section */}
          <AnimatePresence>
            {isNestedRepliesOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-3 space-y-3"
              >
                {isLoading ? (
                  <div className="text-xs text-gray-500 py-2">Loading replies...</div>
                ) : nestedReplies[nestedRepliesKey]?.length > 0 ? (
                  nestedReplies[nestedRepliesKey].map((nestedReply) => (
                    <ReplyItem 
                      key={nestedReply.replyId || nestedReply._id} 
                      reply={nestedReply} 
                      commentId={commentId}
                      depth={depth + 1}
                      parentUsername={reply.username || reply.userName}
                    />
                  ))
                ) : (
                  <div className="text-xs text-gray-500 py-2">No replies yet</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  // Component to render organized replies
  const OrganizedReplies = ({ commentId }) => {
    const repliesArray = replies[commentId] || [];
    const { firstLevelReplies, nestedRepliesMap } = organizeReplies(repliesArray);

    return (
      <div className="space-y-3">
        {firstLevelReplies.map((reply) => (
          <div key={reply.replyId || reply._id}>
            <ReplyItem 
              reply={reply} 
              commentId={commentId}
            />
            
            {nestedRepliesMap[reply.replyId || reply._id]?.map((nestedReply) => (
              <div key={nestedReply.replyId || nestedReply._id} className="ml-4">
                <ReplyItem 
                  reply={nestedReply} 
                  commentId={commentId}
                  depth={1}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  // Load comments when feed changes
  useEffect(() => {
    if (feed?._id) {
      fetchComments();
    }
  }, [feed?._id]);

  return (
    <div className="flex flex-col w-full sm:w-[400px] h-full bg-white">
      {/* HEADER */}
      <div className="flex items-center p-4 bg-white">
        <img
          src={feed.createdByProfile?.profileAvatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover mr-3"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm sm:text-base truncate">
            {feed.createdByProfile?.userName || "Unknown User"}
          </div>
          <div className="text-xs text-gray-500 truncate">{feed.location || "Unknown place"}</div>
        </div>
      </div>

      {/* COMMENTS LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {commentLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-20 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-32 animate-pulse" />
              </div>
            </div>
          ))
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const isRepliesOpen = showReplies[comment.commentId || comment._id];
            const hasReplies = (comment.replyCount || 0) > 0;
            const isReplyInputActive = activeReplyInput === (comment.commentId || comment._id);

            return (
              <motion.div
                key={comment.commentId || comment._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start space-x-3 pb-3"
              >
                <img
                  src={comment.avatar || comment.profileAvatar || "/default-avatar.png"}
                  alt=""
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm truncate">
                          {comment.username || comment.userName || "Unknown User"}
                        </span>
                        <span className="text-gray-500 text-xs flex-shrink-0">
                          {comment.timeAgo || "Just now"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 mt-1 break-words">{comment.commentText}</p>
                    </div>

                    <button
                      onClick={() => likeComment(comment.commentId || comment._id, feed._id)}
                      className={`text-xs flex items-center space-x-1 flex-shrink-0 ${
                        comment.isLiked ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      <span>{comment.isLiked ? "♥" : "♡"}</span>
                      <span>{comment.likeCount || 0}</span>
                    </button>
                  </div>

                  {/* Reply buttons */}
                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
                    {hasReplies && (
                      <button
                        onClick={() => toggleReplySection(comment.commentId || comment._id)}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>{isRepliesOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}</span>
                        <span>Replies ({comment.replyCount || 0})</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        setActiveReplyInput(comment.commentId || comment._id);
                        setReplyInputs(prev => ({ ...prev, [comment.commentId || comment._id]: "" }));
                        if (!isRepliesOpen && hasReplies) {
                          toggleReplySection(comment.commentId || comment._id);
                        }
                      }}
                      className="hover:text-blue-600 transition-colors"
                    >
                      Reply
                    </button>
                  </div>

                  {/* Reply Input */}
                  <AnimatePresence>
                    {isReplyInputActive && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center space-x-2 pt-3"
                      >
                        <input
                          value={replyInputs[comment.commentId || comment._id] || ""}
                          onChange={(e) =>
                            setReplyInputs((prev) => ({
                              ...prev,
                              [comment.commentId || comment._id]: e.target.value,
                            }))
                          }
                          placeholder="Write a reply..."
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                          onKeyPress={(e) => e.key === "Enter" && handlePostReply(feed._id, comment.commentId || comment._id)}
                          autoFocus
                        />
                        <button
                          onClick={() => handlePostReply(feed._id, comment.commentId || comment._id)}
                          disabled={!replyInputs[comment.commentId || comment._id]?.trim()}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          <FiSend size={12} />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* REPLIES SECTION */}
                  <AnimatePresence>
                    {isRepliesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 space-y-3"
                      >
                        {replyLoading[comment.commentId || comment._id] ? (
                          <div className="text-xs text-gray-500 py-2">Loading replies...</div>
                        ) : replies[comment.commentId || comment._id]?.length > 0 ? (
                          <OrganizedReplies commentId={comment.commentId || comment._id} />
                        ) : (
                          <div className="text-xs text-gray-500 py-2">No replies yet</div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FiMessageCircle className="text-2xl mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment</p>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="p-4 bg-white">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddComment(feed._id)}
            className="flex-1 text-sm outline-none bg-transparent"
          />
          <button
            onClick={() => handleAddComment(feed._id)}
            disabled={!newComment.trim()}
            className={`p-1 rounded transition-colors ${
              !newComment.trim()
                ? "text-blue-300 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-700"
            }`}
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommentsSection);
import React, { useState } from "react";
import { FiHeart, FiMessageCircle, FiSend, FiBookmark, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const CommentsSection = ({
  feed,
  comments = [],
  commentLoading,
  newComment,
  setNewComment,
  handleAddComment,
  likeComment,
  replies = {},
  replyInputs = {},
  setReplyInputs,
  replyLoading = {},
  showReplies = {},
  setShowReplies,
  fetchReplies,
  postReply,
  likeReply,
  likeFeedAction,
  toggleSaveFeed,
  shareFeedAction,
  selectedFeedIndex,
  showComments,
  setShowComments,
}) => {
  const [activeReplyInput, setActiveReplyInput] = useState(null);

  const toggleReplySection = async (commentId) => {
    if (showReplies[commentId]) {
      // Close if already open
      setShowReplies(prev => ({ ...prev, [commentId]: false }));
      setActiveReplyInput(null);
    } else {
      // Open and fetch replies if not loaded
      setShowReplies({ [commentId]: true });
      setActiveReplyInput(commentId);
      if (!replies[commentId]) {
        await fetchReplies(commentId);
      }
    }
  };
const handlePostReply = async (feedId, commentId) => {
  const text = replyInputs[commentId]?.trim();
  if (!text) return;
await postReply({
  feedId,
  parentCommentId: commentId,
  replyText: text,
});




  // Clear input
  setReplyInputs(prev => ({ ...prev, [commentId]: "" }));

  // Refresh replies
  fetchReplies(commentId);

  // Close reply box
  setActiveReplyInput(null);
};


  return (
    <div className="flex flex-col w-full sm:w-[400px] h-full bg-white border-l border-gray-200">

      {/* HEADER */}
      <div className="flex items-center p-4 border-b bg-white">
        <img
          src={feed.createdByProfile?.profileAvatar || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover mr-3 ring-1 ring-gray-200"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm sm:text-base truncate">
            {feed.createdByProfile?.userName || "Unknown User"}
          </div>
          <div className="text-xs text-gray-500 truncate">{feed.location || "Unknown place"}</div>
        </div>
      </div>

      {/* COMMENTS LIST */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {commentLoading ? (
          // Skeleton loading
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
            const isRepliesOpen = showReplies[comment.commentId];
            const hasReplies = comment.replyCount > 0;

            return (
              <motion.div
                key={comment.commentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-start space-x-3"
              >
                <img
                  src={comment.avatar || "/default-avatar.png"}
                  alt=""
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-1 ring-gray-200 flex-shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm truncate">{comment.username}</span>
                        <span className="text-gray-500 text-xs flex-shrink-0">{comment.timeAgo}</span>
                      </div>
                      <p className="text-sm text-gray-800 mt-1 break-words">{comment.commentText}</p>
                    </div>

                    <button
                      onClick={() => likeComment(comment.commentId, feed._id)}
                      className={`text-xs flex items-center space-x-1 flex-shrink-0 ${
                        comment.isLiked ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      <span>{comment.isLiked ? "♥" : "♡"}</span>
                      <span>{comment.likeCount}</span>
                    </button>
                  </div>

                  {/* Reply buttons */}
                  <div className="flex items-center space-x-3 mt-2 text-xs text-gray-600">
                    {hasReplies && (
                      <button
                        onClick={() => toggleReplySection(comment.commentId)}
                        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                      >
                        <span>{isRepliesOpen ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}</span>
                        <span>Replies ({comment.replyCount})</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => {
                        if (!isRepliesOpen) {
                          toggleReplySection(comment.commentId);
                        }
                        setActiveReplyInput(comment.commentId);
                      }}
                      className="hover:text-blue-600 transition-colors"
                    >
                      Write reply
                    </button>
                  </div>

                  {/* REPLIES SECTION */}
                  <AnimatePresence>
                    {isRepliesOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-3 ml-2 space-y-3"
                      >
                        {/* Replies List */}
                        {replyLoading[comment.commentId] ? (
                          <div className="text-xs text-gray-500 py-2">Loading replies...</div>
                        ) : replies[comment.commentId]?.length > 0 ? (
                          replies[comment.commentId].map((reply) => (
                            <div key={reply.replyId} className="flex items-start space-x-2">
                              <img
                                src={reply.avatar || "/default-avatar.png"}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full ring-1 ring-gray-200 flex-shrink-0"
                                alt=""
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2">
                                      <span className="font-semibold text-xs truncate">{reply.username}</span>
                                      <span className="text-[10px] text-gray-500 flex-shrink-0">{reply.timeAgo}</span>
                                    </div>
                                    <p className="text-xs text-gray-800 mt-1 break-words">{reply.replyText}</p>
                                  </div>
                                  <button
                                    onClick={() => likeReply(reply.replyId, comment.commentId)}
                                    className={`text-xs flex items-center space-x-1 flex-shrink-0 ${
                                      reply.isLiked ? "text-red-500" : "text-gray-500"
                                    }`}
                                  >
                                    <span>{reply.isLiked ? "♥" : "♡"}</span>
                                    <span>{reply.likeCount}</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500 py-2">No replies yet</div>
                        )}

                        {/* Reply Input - Only show when active */}
                        <AnimatePresence>
                          {activeReplyInput === comment.commentId && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="flex items-center space-x-2 pt-2"
                            >
                              <input
                                value={replyInputs[comment.commentId] || ""}
                                onChange={(e) =>
                                  setReplyInputs((prev) => ({
                                    ...prev,
                                    [comment.commentId]: e.target.value,
                                  }))
                                }
                                placeholder="Write a reply..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
                                onKeyPress={(e) => e.key === "Enter" && handlePostReply(feed._id, comment.commentId)}
                              />
                              <button
                                onClick={() => handlePostReply(feed._id, comment.commentId)}
                                disabled={!replyInputs[comment.commentId]?.trim()}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                              >
                                <FiSend size={12} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        ) : (
          // Empty state
          <div className="text-center text-gray-500 py-8">
            <FiMessageCircle className="text-2xl mx-auto mb-2 opacity-40" />
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs mt-1">Be the first to comment</p>
          </div>
        )}
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="p-3 sm:p-4 border-t bg-white">
        <div className="flex items-center justify-between mb-3">
        </div>
        {/* COMMENT INPUT */}
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
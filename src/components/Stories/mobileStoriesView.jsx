import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiMessageCircle, FiSend, FiBookmark, FiChevronUp, FiChevronDown, FiPlay, FiPause, FiTrash2, FiArrowLeft } from "react-icons/fi";
import EmojiPicker from "../EmojiPicker";
import defaultAvatar from "../../assets/user.png";

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
 * CommentItem component for mobile stories
 */
const CommentItem = ({ comment, feedId, authUser, refreshParentComments }) => {
  const [isLiked, setIsLiked] = useState(Boolean(comment.isLiked));
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState("");

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
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      const id = comment.commentId || comment._id;
      await api.delete("/api/user/delete/comment", {
        data: { commentId: id }
      });
      
      await refreshParentComments?.();
    } catch (err) {
      console.error("delete comment error", err);
      alert("Failed to delete comment");
    }
  };

  const handlePostReply = async () => {
    const text = (replyText || "").trim();
    if (!text) return;
    
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
      await refreshParentComments?.();
    } catch (err) {
      console.error("post reply error", err);
    }
  };

  const isOwner = authUser && comment.userId === authUser.userId;
  const isReplyOverLimit = isOverWordLimit(replyText);

  return (
    <div className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
      <img
        src={comment.avatar || defaultAvatar}
        alt="avatar"
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-sm text-gray-900">{comment.username}</span>
              <span className="text-gray-500 text-xs">{comment.timeAgo}</span>
            </div>
            <p className="text-sm text-gray-800 mt-1 break-words">{comment.commentText}</p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button 
              onClick={handleLikeComment}
              className={`flex items-center space-x-1 text-xs ${isLiked ? "text-red-500" : "text-gray-500"}`}
            >
              <FiHeart size={12} />
              <span>{likeCount}</span>
            </button>
            
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

        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
          <button 
            onClick={() => setShowReplyBox(prev => !prev)}
            className="hover:text-blue-600 font-medium"
          >
            Reply
          </button>
          {comment.replyCount > 0 && (
            <span className="text-gray-500">
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        <AnimatePresence>
          {showReplyBox && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <WordCountIndicator text={replyText} />
              
              <div className="flex items-center gap-2 relative">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className={`flex-1 bg-gray-50 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                    isReplyOverLimit 
                      ? 'border-red-300 focus:ring-red-400' 
                      : 'border-gray-200 focus:ring-blue-400'
                  }`}
                  onKeyDown={(e) => e.key === "Enter" && !isReplyOverLimit && handlePostReply()}
                />
                <div className="absolute right-12">
                  <EmojiPicker
                    onEmojiSelect={(emoji) => setReplyText(replyText + emoji)}
                    buttonClassName="p-1 text-gray-400 hover:text-blue-600 rounded"
                  />
                </div>
                <button
                  onClick={handlePostReply}
                  disabled={!replyText.trim() || isReplyOverLimit}
                  className="p-2 bg-blue-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <FiSend size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Comments Page Component - Full screen Facebook-style comments
 */
const CommentsPage = ({ 
  feed, 
  comments, 
  commentLoading, 
  newComment, 
  setNewComment, 
  handleAddComment, 
  authUser, 
  refreshComments,
  onClose 
}) => {
  const [isCommentOverLimit, setIsCommentOverLimit] = useState(false);
  const commentInputRef = useRef(null);

  const handleAddCommentWithLimit = async (feedId) => {
    if (isOverWordLimit(newComment)) {
      alert("Comment cannot exceed 100 words");
      return;
    }
    await handleAddComment(feedId);
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
    setIsCommentOverLimit(isOverWordLimit(e.target.value));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isCommentOverLimit && newComment.trim()) {
      handleAddCommentWithLimit(feed?._id);
    }
  };

  // Auto-focus on input when comments page opens
  useEffect(() => {
    if (commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 400);
    }
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex flex-col"
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ 
        type: "spring", 
        damping: 40, 
        stiffness: 400
      }}
    >
      {/* Header - Facebook Style */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h3 className="font-bold text-lg text-gray-900">Comments</h3>
            <p className="text-sm text-gray-500">{comments?.length || 0} comments</p>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto">
        {commentLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 text-sm">Loading comments...</p>
          </div>
        ) : comments && comments.length > 0 ? (
          <div className="p-4 space-y-6">
            {comments.map((comment) => (
              <CommentItem
                key={comment.commentId || comment._id}
                comment={comment}
                feedId={feed?._id}
                authUser={authUser}
                refreshParentComments={refreshComments}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiMessageCircle className="text-2xl text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No comments yet</h3>
            <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
          </div>
        )}
      </div>

      {/* Add Comment Input - Facebook Style Sticky Bottom */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          <img
            src={authUser?.avatar || defaultAvatar}
            alt="Your avatar"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
          />
          <div className="flex-1">
            <WordCountIndicator text={newComment} className="mb-2" />
            <div className="flex items-center space-x-2">
              <div className="flex-1 relative">
                <input
                  ref={commentInputRef}
                  type="text"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={handleCommentChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full bg-gray-50 border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition-all ${
                    isCommentOverLimit 
                      ? 'border-red-300 focus:ring-red-400' 
                      : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <EmojiPicker
                    onEmojiSelect={(emoji) => setNewComment(newComment + emoji)}
                    buttonClassName="p-1 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
                  />
                </div>
              </div>
              <button
                onClick={() => handleAddCommentWithLimit(feed?._id)}
                disabled={!newComment.trim() || isCommentOverLimit}
                className={`p-3 rounded-full transition-all duration-200 ${
                  !newComment.trim() || isCommentOverLimit
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm'
                }`}
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MobileStoriesView = ({
  feed,
  selectedFeedIndex,
  videoRef,
  progress,
  setProgress,
  setSelectedFeedIndex,
  setShowComments,
  showComments,
  navigateFeed,
  comments = [],
  commentLoading,
  newComment,
  setNewComment,
  handleAddComment,
  likeFeedAction,
  toggleSaveFeed,
  shareFeedAction,
  authUser,
  refreshComments
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const imageTimerRef = useRef(null);

  /* -------------------------
       VIDEO CONTROL
     ------------------------- */
  useEffect(() => {
    if (feed?.type === 'video' && videoRef?.current) {
      const video = videoRef.current;

      if (isPaused) {
        video.pause();
      } else {
        video.play().catch(() => { });
      }

      const handlePlay = () => setIsPaused(false);
      const handlePause = () => setIsPaused(true);
      const handleEnded = () => {
        navigateFeed("next");
      };

      video.addEventListener('play', handlePlay);
      video.addEventListener('pause', handlePause);
      video.addEventListener('ended', handleEnded);

      return () => {
        video.removeEventListener('play', handlePlay);
        video.removeEventListener('pause', handlePause);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, [isPaused, feed?.type, videoRef, navigateFeed]);

  /* -------------------------
       IMAGE AUTO-ADVANCE & PROGRESS
     ------------------------- */
  useEffect(() => {
    if (feed?.type === 'image') {
      setProgress(0);

      if (!isPaused) {
        const duration = 5000;
        const intervalTime = 50;
        const increment = (intervalTime / duration) * 100;
        let currentProgress = 0;

        const progressInterval = setInterval(() => {
          currentProgress += increment;
          setProgress(Math.min(currentProgress, 100));
        }, intervalTime);

        imageTimerRef.current = setTimeout(() => {
          navigateFeed("next");
        }, duration);

        return () => {
          clearInterval(progressInterval);
          if (imageTimerRef.current) {
            clearTimeout(imageTimerRef.current);
          }
        };
      }
    }
  }, [feed?.type, feed?._id, isPaused, navigateFeed, setProgress]);

  /* -------------------------
       RESET ON FEED CHANGE
     ------------------------- */
  useEffect(() => {
    setIsPaused(false);
  }, [feed?._id]);

  /* -------------------------
       PROGRESS TRACKING
     ------------------------- */
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(newProgress);
    }
  };

  /* -------------------------
       CLICK HANDLER
     ------------------------- */
  const handleStoryClick = (e) => {
    const clickX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;

    // Left 30% - Previous
    if (clickX < width * 0.3) {
      navigateFeed("prev");
      return;
    }

    // Right 30% - Next
    if (clickX > width * 0.7) {
      navigateFeed("next");
      return;
    }

    // Center - Toggle pause
    setIsPaused((prev) => !prev);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const handleCloseComments = () => {
    setShowComments(false);
  };

  const handleAddCommentWithLimit = async (feedId) => {
    if (isOverWordLimit(newComment)) {
      alert("Comment cannot exceed 100 words");
      return;
    }
    await handleAddComment(feedId);
  };

  const isCommentOverLimit = isOverWordLimit(newComment);

  return (
    <>
      {/* Main Stories View */}
      <motion.div
        className="flex flex-col w-full h-full bg-black relative"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress Bar - Top */}
        <div className="absolute top-0 left-0 right-0 z-30 p-4">
          <div className="h-1 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Top Bar - Navigation & Close */}
        <div className="absolute top-14 left-0 right-0 z-30 flex items-center justify-between px-4">
          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateFeed("prev");
              }}
              className="bg-black/50 p-3 rounded-full text-white active:bg-black/70 transition-all"
              aria-label="Previous"
            >
              <FiChevronUp size={22} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigateFeed("next");
              }}
              className="bg-black/50 p-3 rounded-full text-white active:bg-black/70 transition-all"
              aria-label="Next"
            >
              <FiChevronDown size={22} />
            </button>
          </div>

          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFeedIndex(null);
              setShowComments(false);
            }}
            className="bg-black/50 p-3 rounded-full text-white active:bg-black/70 transition-all"
            aria-label="Close"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* User Info */}
        <div className="absolute top-28 left-4 z-20 flex items-center space-x-3">
          <img
            src={feed?.createdByProfile?.profileAvatar || defaultAvatar}
            alt="avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-white/80"
          />
          <span className="text-white font-semibold text-sm drop-shadow-lg bg-black/30 px-3 py-1 rounded-full">
            {feed?.createdByProfile?.userName || "Unknown User"}
          </span>
        </div>

        {/* Media Content */}
        <div
          className="flex-1 flex items-center justify-center relative"
          onClick={handleStoryClick}
        >
          {feed?.type === "video" ? (
            <>
              <video
                ref={videoRef}
                src={feed?.contentUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={() => {
                  videoRef.current?.play().catch(() => { });
                }}
                playsInline
                autoPlay
                muted
              />
              {/* Pause Indicator for Video */}
              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 rounded-full p-6 backdrop-blur-sm">
                    <FiPause className="w-16 h-16 text-white" />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <img
                src={feed?.contentUrl}
                alt="Story"
                className="w-full h-full object-contain"
              />
              {/* Play Indicator for Paused Image */}
              {isPaused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-black/60 rounded-full p-6 backdrop-blur-sm">
                    <FiPlay className="w-16 h-16 text-white" />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Action Buttons - Bottom */}
        <div className="absolute bottom-4 left-4 right-4 z-20">
          {/* Action Icons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  likeFeedAction(feed?._id, selectedFeedIndex);
                }}
                className="text-white text-2xl active:scale-95 transition-transform"
              >
                <FiHeart className={feed?.isLiked ? "fill-red-500 text-red-500" : ""} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleComments();
                }}
                className="text-white text-2xl active:scale-95 transition-transform"
              >
                <FiMessageCircle />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  shareFeedAction(feed?._id);
                }}
                className="text-white text-2xl active:scale-95 transition-transform"
              >
                <FiSend />
              </button>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveFeed(feed?._id, selectedFeedIndex);
              }}
              className="text-white text-2xl active:scale-95 transition-transform"
            >
              <FiBookmark className={feed?.isSaved ? "fill-yellow-500 text-yellow-500" : ""} />
            </button>
          </div>

          {/* Likes Count */}
          <div className="text-white text-sm font-semibold mb-3 bg-black/30 px-3 py-1 rounded-full inline-block">
            {feed?.likesCount || 0} likes
          </div>

          {/* Add Comment Input - Hidden when comments page is open */}
          {!showComments && (
            <div className="bg-black/50 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/10">
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isCommentOverLimit && handleAddCommentWithLimit(feed?._id)}
                  className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 p-0 placeholder-white/60"
                />
                <div className="flex items-center space-x-2">
                  <EmojiPicker
                    onEmojiSelect={(emoji) => setNewComment(newComment + emoji)}
                    buttonClassName="p-1 text-white/60 hover:text-white transition-colors"
                  />
                  <button
                    onClick={() => handleAddCommentWithLimit(feed?._id)}
                    disabled={!newComment.trim() || isCommentOverLimit}
                    className={`font-semibold text-sm px-3 py-1 rounded-full transition-all ${
                      !newComment.trim() || isCommentOverLimit
                        ? 'text-blue-400/30 cursor-not-allowed'
                        : 'text-blue-400 bg-blue-400/20 hover:bg-blue-400/30'
                    }`}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Comments Page Overlay - Full Screen Facebook Style */}
      <AnimatePresence>
        {showComments && (
          <CommentsPage
            feed={feed}
            comments={comments}
            commentLoading={commentLoading}
            newComment={newComment}
            setNewComment={setNewComment}
            handleAddComment={handleAddComment}
            authUser={authUser}
            refreshComments={refreshComments}
            onClose={handleCloseComments}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileStoriesView;

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi";
 
const MobileStoriesView = ({
  feed,
  selectedFeedIndex,
  videoRef,
  progress,
  setProgress,
  setShowComments,
  showComments,
  closePopup,
  navigateFeed,
  comments = [],
  commentLoading,
  newComment,
  setNewComment,
  handleAddComment,
  likeComment,
  likeFeedAction,
  toggleSaveFeed,
  shareFeedAction,
}) => {
 
  // Handle video time update for progress
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && videoRef.current.duration) {
      const newProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(newProgress);
    }
  };
 
  // Handle video ended to go to next story
  const handleVideoEnd = () => {
    navigateFeed("next");
  };
 
  // Click handlers for navigation
  const handleStoryClick = (e) => {
    const clickX = e.nativeEvent.offsetX;
    const width = e.currentTarget.offsetWidth;
   
    if (clickX < width / 3) {
      navigateFeed("prev");
    } else if (clickX > (2 * width) / 3) {
      navigateFeed("next");
    }
    // Center click does nothing (no pause/play)
  };
 
  // Mobile-specific toggle comments
  const toggleComments = () => {
    setShowComments(!showComments);
  };
 
  return (
    <motion.div
      className="md:hidden flex flex-col w-full h-full bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progress Bar with smooth transition */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="h-1.5 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
 
      {/* Close button */}
      <button
        onClick={closePopup}
        className="absolute top-6 right-4 text-white text-xl z-20"
      >
        <FiX />
      </button>
 
      {/* User Info */}
      <div className="absolute top-16 left-4 z-10 flex items-center space-x-3">
        <img
          src={feed.createdByProfile?.profileAvatar || "https://default-avatar.example.com/default.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover border-2 border-white"
        />
        <span className="text-white font-semibold text-sm">
          {feed.createdByProfile?.userName || "Unknown User"}
        </span>
      </div>
 
      {/* Media Content - Full Screen with click zones */}
      <div
        className="flex-1 flex items-center justify-center relative"
        onClick={handleStoryClick}
      >
        {feed.type === "video" ? (
          <video
            ref={videoRef}
            src={feed.contentUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={() => {
              videoRef.current?.play().catch(error => {
                console.log("Video play failed:", error);
              });
            }}
            onEnded={handleVideoEnd}
            playsInline
            muted={false}
            autoPlay
          />
        ) : (
          <img
            src={feed.contentUrl}
            alt="Feed content"
            className="w-full h-full object-contain"
          />
        )}
       
        {/* Invisible click zones for navigation */}
        <div className="absolute inset-0 flex">
          <div className="flex-1" onClick={() => navigateFeed("prev")} />
          <div className="flex-1" /> {/* Center zone does nothing */}
          <div className="flex-1" onClick={() => navigateFeed("next")} />
        </div>
      </div>
 
      {/* Action Buttons - Bottom Section */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        {/* Like, Comment, Share Buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => likeFeedAction(feed._id, selectedFeedIndex)}
              className="text-white text-2xl hover:text-red-400 transition"
            >
              <FiHeart className={feed.isLiked ? "text-red-500" : ""} />
            </button>
            <button
              className="text-white text-2xl hover:text-blue-400 transition"
              onClick={toggleComments}
            >
              <FiMessageCircle />
            </button>
            <button
              onClick={() => shareFeedAction(feed._id)}
              className="text-white text-2xl hover:text-green-400 transition"
            >
              <FiSend />
            </button>
          </div>
          <button
            onClick={() => toggleSaveFeed(feed._id, selectedFeedIndex)}
            className="text-white text-2xl hover:text-yellow-400 transition"
          >
            <FiBookmark className={feed.isSaved ? "text-yellow-500" : ""} />
          </button>
        </div>
 
        {/* Likes count */}
        <div className="text-white text-base font-semibold mb-3">
          {feed.likesCount || 0} likes
        </div>
 
        {/* Add Comment Input */}
        <div className="flex items-center space-x-3 bg-black/70 rounded-xl px-4 py-3 backdrop-blur-sm">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(feed._id)}
            className="flex-1 bg-transparent border-none text-white text-base focus:ring-0 p-0 placeholder-gray-300"
          />
          <button
            onClick={() => handleAddComment(feed._id)}
            disabled={!newComment.trim()}
            className={`font-semibold text-base px-3 py-1 rounded-full transition ${
              !newComment.trim()
                ? 'text-blue-400/50 cursor-not-allowed'
                : 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/20'
            }`}
          >
            Post
          </button>
        </div>
      </div>
 
      {/* Comments Panel for Mobile - Slides up from bottom */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            className="absolute inset-0 bg-white z-30"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3 }}
          >
            {/* Comments Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-semibold text-lg">Comments</h3>
              <button onClick={toggleComments} className="text-gray-600 text-xl">
                <FiX />
              </button>
            </div>
 
            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 h-[calc(100vh-140px)]">
              {commentLoading ? (
                <div>Loading comments...</div>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.commentId} className="flex items-start space-x-4">
                    <img
                      src={comment.avatar || "https://default-avatar.example.com/default.png"}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className="font-semibold text-base">{comment.username}</span>
                        <span className="text-gray-500 text-sm">{comment.timeAgo}</span>
                      </div>
                      <p className="text-base text-gray-800 leading-relaxed">{comment.commentText}</p>
                      <div className="flex items-center space-x-3 mt-1">
                        <button
                          className={`text-xs ${comment.isLiked ? "text-red-500" : "text-gray-500"}`}
                          onClick={() => likeComment(comment.commentId, feed._id)}
                        >
                          {comment.isLiked ? "♥" : "♡"} {comment.likeCount}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <FiMessageCircle className="text-4xl mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">No comments yet</p>
                  <p className="text-sm">Be the first to comment!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
 
export default MobileStoriesView;
 
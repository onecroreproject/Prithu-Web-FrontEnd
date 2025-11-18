import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiMessageCircle, FiSend, FiBookmark } from "react-icons/fi";

const MobileStoriesView = ({
  feed,
  selectedFeedIndex,
  setSelectedFeedIndex,
  videoRef,
  progress,
  isPaused,
  setIsPaused,
  setShowComments,
  showComments,
  touchStartTime,
  setTouchStartTime,
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
  navigateFeed,
  handleVideoTimeUpdate,
}) => {
  return (
    <motion.div className="md:hidden flex flex-col w-full h-full bg-black" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()} onTouchStart={() => { setTouchStartTime(Date.now()); setIsPaused(true); }} onTouchEnd={() => { if (touchStartTime && Date.now() - touchStartTime < 300) { setIsPaused(false); } setTouchStartTime(null); }}>
      {/* Progress */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-150" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Close */}
      <button onClick={() => { setSelectedFeedIndex(null); setIsPaused(false); setShowComments(false); }} className="absolute top-6 right-4 text-white text-xl z-30">
        <FiX />
      </button>

      {/* User info */}
      <div className="absolute top-16 left-4 z-20 flex items-center space-x-3">
        <img src={feed.createdByProfile?.profileAvatar || ""} alt="avatar" className="w-10 h-10 rounded-full border-2 border-white" />
        <span className="text-white font-semibold text-sm">{feed.createdByProfile?.userName || "Unknown User"}</span>
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center relative" onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const x = e.clientX - rect.left; const width = rect.width; if (x < width / 3) { navigateFeed("prev"); } else if (x > (2 * width) / 3) { navigateFeed("next"); } else { setIsPaused((p) => !p); if (videoRef.current) { if (isPaused) videoRef.current.play().catch(() => setIsPaused(true)); else videoRef.current.pause(); } } }}>
        {feed.type === "video" ? (
          <video ref={videoRef} src={feed.contentUrl} className="w-full h-full object-contain" onTimeUpdate={() => { if (typeof handleVideoTimeUpdate === "function") handleVideoTimeUpdate(); }} onLoadedMetadata={() => { if (!isPaused) videoRef.current?.play().catch(() => setIsPaused(true)); }} onEnded={() => navigateFeed("next")} autoPlay muted playsInline />
        ) : (
          <img src={feed.contentUrl} className="w-full h-full object-contain" alt="feed" />
        )}
      </div>

      {/* Bottom action bar */}
      <div className="absolute bottom-4 left-4 right-4 z-30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <button onClick={() => likeFeedAction(feed._id, selectedFeedIndex)} className="text-white text-2xl">
              <FiHeart className={feed.isLiked ? "text-red-500" : ""} />
            </button>

            <button onClick={() => setShowComments((s) => !s)} className="text-white text-2xl"><FiMessageCircle /></button>

            <button onClick={() => shareFeedAction(feed._id)} className="text-white text-2xl"><FiSend /></button>
          </div>

          <button onClick={() => toggleSaveFeed(feed._id, selectedFeedIndex)} className="text-white text-2xl">
            <FiBookmark className={feed.isSaved ? "text-yellow-500" : ""} />
          </button>
        </div>

        <div className="text-white text-base font-semibold mb-3">{feed.likesCount || 0} likes</div>

        {/* Add comment (mobile) */}
        <div className="flex items-center space-x-3 bg-black/70 rounded-xl px-4 py-3">
          <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className="flex-1 bg-transparent text-white text-base" />
          <button onClick={() => handleAddComment(feed._id)} disabled={!newComment.trim()} className={`text-blue-400 text-base ${!newComment.trim() ? "opacity-40" : "opacity-100"}`}>Post</button>
        </div>
      </div>

      {/* Mobile Comments Panel */}
      <AnimatePresence>
        {showComments && (
          <motion.div className="absolute inset-0 bg-white z-40" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.3 }}>
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="font-semibold text-lg">Comments</h3>
              <button onClick={() => setShowComments(false)} className="text-gray-600"><FiX /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {commentLoading ? (
                <div>Loading...</div>
              ) : comments && comments.length ? (
                comments.map((comment) => (
                  <div key={comment.commentId} className="flex items-start space-x-4">
                    <img src={comment.avatar || ""} className="w-10 h-10 rounded-full" alt="" />

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{comment.username}</span>
                        <button className={`text-sm ${comment.isLiked ? "text-red-500" : "text-gray-500"}`} onClick={() => likeComment(comment.commentId, feed._id)}>
                          {comment.isLiked ? "♥" : "♡"} {comment.likeCount}
                        </button>
                      </div>

                      <p className="text-gray-800">{comment.commentText}</p>
                      <p className="text-xs text-gray-400">{comment.timeAgo}</p>

                      <button className="text-xs text-blue-600 mt-1" onClick={() => { setShowReplies((prev) => ({ ...prev, [comment.commentId]: true })); fetchReplies(comment.commentId); }}>
                        Reply ({comment.replyCount})
                      </button>

                      {showReplies[comment.commentId] && (
                        <div className="pl-6 mt-3">
                          {replyLoading[comment.commentId] ? (
                            <div className="text-xs">Loading...</div>
                          ) : (
                            replies[comment.commentId]?.map((r) => (
                              <div key={r.replyId} className="mb-3">
                                <div className="flex items-start gap-3">
                                  <img src={r.avatar || ""} className="w-8 h-8 rounded-full" alt="" />
                                  <div>
                                    <div className="flex justify-between">
                                      <span className="font-semibold text-sm">{r.username}</span>
                                      <button onClick={() => likeReply(r.replyId, comment.commentId)} className={`text-xs ${r.isLiked ? "text-red-500" : "text-gray-400"}`}>{r.isLiked ? "♥" : "♡"} {r.likeCount}</button>
                                    </div>
                                    <p className="text-sm">{r.replyText}</p>
                                    <p className="text-xs text-gray-400">{r.timeAgo}</p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}

                          <div className="mt-2 flex items-center space-x-2">
                            <input value={replyInputs[comment.commentId] || ""} onChange={(e) => setReplyInputs((prev) => ({ ...prev, [comment.commentId]: e.target.value }))} placeholder="Write a reply..." className="flex-1 border px-3 py-2 text-sm rounded" />
                            <button className="bg-blue-500 text-white px-3 py-1 rounded text-sm" onClick={() => postReply(feed._id, comment.commentId)}>Post</button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500">No comments yet</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MobileStoriesView;

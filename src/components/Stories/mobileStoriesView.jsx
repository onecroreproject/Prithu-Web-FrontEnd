import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiHeart, FiMessageCircle, FiSend, FiBookmark, FiChevronUp, FiChevronDown, FiPlay, FiPause } from "react-icons/fi";

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
    likeComment,
    likeFeedAction,
    toggleSaveFeed,
    shareFeedAction,
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

    return (
        <motion.div
            className="flex flex-col w-full h-full bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Progress Bar - Top */}
            <div className="absolute top-0 left-0 right-0 z-30 p-3">
                <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white transition-all duration-200"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Top Bar - Navigation & Close */}
            <div className="absolute top-12 left-0 right-0 z-30 flex items-center justify-between px-4">
                {/* Navigation Arrows */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateFeed("prev");
                        }}
                        className="bg-black/40 p-2 rounded-full text-white active:bg-black/60"
                        aria-label="Previous"
                    >
                        <FiChevronUp size={20} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateFeed("next");
                        }}
                        className="bg-black/40 p-2 rounded-full text-white active:bg-black/60"
                        aria-label="Next"
                    >
                        <FiChevronDown size={20} />
                    </button>
                </div>

                {/* Close Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeedIndex(null);
                        setShowComments(false);
                    }}
                    className="bg-black/40 p-2 rounded-full text-white active:bg-black/60"
                    aria-label="Close"
                >
                    <FiX size={20} />
                </button>
            </div>

            {/* User Info */}
            <div className="absolute top-24 left-4 z-20 flex items-center space-x-3">
                <img
                    src={feed.createdByProfile?.profileAvatar || "https://via.placeholder.com/40"}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-white"
                />
                <span className="text-white font-semibold text-sm drop-shadow-lg">
                    {feed.createdByProfile?.userName || "Unknown User"}
                </span>
            </div>

            {/* Media Content */}
            <div
                className="flex-1 flex items-center justify-center relative"
                onClick={handleStoryClick}
            >
                {feed.type === "video" ? (
                    <>
                        <video
                            ref={videoRef}
                            src={feed.contentUrl}
                            className="w-full h-full object-contain"
                            onTimeUpdate={handleVideoTimeUpdate}
                            onLoadedMetadata={() => {
                                videoRef.current?.play().catch(() => { });
                            }}
                            playsInline
                            autoPlay
                        />
                        {/* Pause Indicator for Video */}
                        {isPaused && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/70 rounded-full p-6">
                                    <FiPause className="w-16 h-16 text-white" />
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <img
                            src={feed.contentUrl}
                            alt="Story"
                            className="w-full h-full object-contain"
                        />
                        {/* Play Indicator for Paused Image */}
                        {isPaused && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="bg-black/70 rounded-full p-6">
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
                                likeFeedAction(feed._id, selectedFeedIndex);
                            }}
                            className="text-white text-2xl active:scale-95 transition"
                        >
                            <FiHeart className={feed.isLiked ? "fill-red-500 text-red-500" : ""} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleComments();
                            }}
                            className="text-white text-2xl active:scale-95 transition"
                        >
                            <FiMessageCircle />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                shareFeedAction(feed._id);
                            }}
                            className="text-white text-2xl active:scale-95 transition"
                        >
                            <FiSend />
                        </button>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleSaveFeed(feed._id, selectedFeedIndex);
                        }}
                        className="text-white text-2xl active:scale-95 transition"
                    >
                        <FiBookmark className={feed.isSaved ? "fill-yellow-500 text-yellow-500" : ""} />
                    </button>
                </div>

                {/* Likes Count */}
                <div className="text-white text-sm font-semibold mb-3">
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
                        className="flex-1 bg-transparent border-none text-white text-sm focus:ring-0 p-0 placeholder-gray-300"
                    />
                    <button
                        onClick={() => handleAddComment(feed._id)}
                        disabled={!newComment.trim()}
                        className={`font-semibold text-sm px-3 py-1 rounded-full transition ${!newComment.trim()
                                ? 'text-blue-400/50 cursor-not-allowed'
                                : 'text-blue-400 active:bg-blue-400/20'
                            }`}
                    >
                        Post
                    </button>
                </div>
            </div>

            {/* Comments Panel */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        className="absolute inset-0 bg-white z-40"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Comments Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">Comments</h3>
                            <button onClick={toggleComments} className="text-gray-600 text-xl">
                                <FiX />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100vh-80px)]">
                            {commentLoading ? (
                                <div className="text-center text-gray-500 py-8">Loading...</div>
                            ) : comments && comments.length > 0 ? (
                                comments.map((comment) => (
                                    <div key={comment.commentId} className="flex items-start space-x-3">
                                        <img
                                            src={comment.avatar || "https://via.placeholder.com/40"}
                                            alt="avatar"
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="font-semibold text-sm">{comment.username}</span>
                                                <span className="text-gray-500 text-xs">{comment.timeAgo}</span>
                                            </div>
                                            <p className="text-sm text-gray-800">{comment.commentText}</p>
                                            <button
                                                className={`text-xs mt-1 ${comment.isLiked ? "text-red-500" : "text-gray-500"}`}
                                                onClick={() => likeComment(comment.commentId, feed._id)}
                                            >
                                                {comment.isLiked ? "♥" : "♡"} {comment.likeCount}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-12">
                                    <FiMessageCircle className="text-4xl mx-auto mb-3 opacity-50" />
                                    <p className="text-base font-medium">No comments yet</p>
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

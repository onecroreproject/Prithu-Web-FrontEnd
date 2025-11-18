import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStories } from "../components/Stories/hooks/useStories";
import StoriesThumbnails from "../components/Stories/storiesThumbnail";
import StoriesModal from "../components/Stories/storiesModel";
import MobileStoriesView from "../components/Stories/mobileStoriesView";

const Stories = () => {
  const {
    // states
    feeds,
    selectedFeedIndex,
    thumbnails,
    loading,
    comments,
    newComment,
    commentLoading,
    replies,
    replyInputs,
    replyLoading,
    showReplies,
    progress,
    isPaused,
    showComments,
    isHovering,
    touchStartTime,
    showArrows,
    showLeftArrow,
    showRightArrow,

    // refs
    videoRef,
    scrollContainerRef,

    // setters
    setSelectedFeedIndex,
    setNewComment,
    setReplyInputs,
    setShowReplies,
    setIsPaused,
    setShowComments,
    setIsHovering,
    setTouchStartTime,
    setShowArrows,
    setShowLeftArrow,
    setShowRightArrow,
    setProgress,

    // functions
    fetchComments,
    handleAddComment,
    likeComment,
    fetchReplies,
    postReply,
    likeReply,
    likeFeedAction,
    toggleSaveFeed,
    shareFeedAction,
    navigateFeed,
    handleVideoTimeUpdate,
  } = useStories();

  const selectedFeed = selectedFeedIndex !== null ? feeds[selectedFeedIndex] : null;

  return (
    <motion.div
      className="bg-white p-4 md:p-5 max-w-[900px] mx-auto relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <StoriesThumbnails
        feeds={feeds}
        loading={loading}
        thumbnails={thumbnails}
        setSelectedFeedIndex={(i) => setSelectedFeedIndex(i)}
        fetchComments={fetchComments}
        setProgress={setProgress}
        setIsPaused={setIsPaused}
        setShowComments={setShowComments}
        scrollContainerRef={scrollContainerRef}
        showLeftArrow={showLeftArrow}
        showRightArrow={showRightArrow}
        showArrows={showArrows}
        setShowLeftArrow={setShowLeftArrow}
        setShowRightArrow={setShowRightArrow}
      />

      <AnimatePresence>
        {selectedFeedIndex !== null && selectedFeed && (
          <motion.div
            key="modal"
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setSelectedFeedIndex(null);
              setIsPaused(false);
              setShowComments(false);
            }}
            style={{ overflow: "hidden" }}
          >
            {/* Desktop */}
            <div className="hidden md:block">
              <StoriesModal
                feed={selectedFeed}
                selectedFeedIndex={selectedFeedIndex}
                setSelectedFeedIndex={(i) => setSelectedFeedIndex(i)}
                setIsPaused={setIsPaused}
                setShowComments={setShowComments}
                videoRef={videoRef}
                progress={progress}
                isPaused={isPaused}
                isHovering={isHovering}
                setIsHovering={setIsHovering}
                navigateFeed={navigateFeed}
                handleVideoTimeUpdate={handleVideoTimeUpdate}

                // comments (pass array safely)
                comments={selectedFeed?._id ? comments[selectedFeed._id] || [] : []}
                commentLoading={commentLoading}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={() => handleAddComment(selectedFeed._id)}
                likeComment={(commentId) => likeComment(commentId, selectedFeed._id)}

                // replies
                replies={replies}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                replyLoading={replyLoading}
                showReplies={showReplies}
                setShowReplies={setShowReplies}
                fetchReplies={fetchReplies}
                postReply={(commentId) =>
  postReply({
    feedId: selectedFeed._id,
    parentCommentId: commentId,
    replyText: replyInputs[commentId] || ""
  })}
                likeReply={likeReply}

                // feed actions
                likeFeedAction={(idx) => likeFeedAction(selectedFeed._id, idx)}
                toggleSaveFeed={() => toggleSaveFeed(selectedFeed._id, selectedFeedIndex)}
                shareFeedAction={() => shareFeedAction(selectedFeed._id)}
              />
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              <MobileStoriesView
                feed={selectedFeed}
                selectedFeedIndex={selectedFeedIndex}
                setSelectedFeedIndex={(i) => setSelectedFeedIndex(i)}
                videoRef={videoRef}
                progress={progress}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                setShowComments={setShowComments}
                showComments={showComments}
                touchStartTime={touchStartTime}
                setTouchStartTime={setTouchStartTime}
                handleVideoTimeUpdate={handleVideoTimeUpdate}

                // comments (array)
                comments={selectedFeed?._id ? comments[selectedFeed._id] || [] : []}
                commentLoading={commentLoading}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={() => handleAddComment(selectedFeed._id)}
                likeComment={(commentId) => likeComment(commentId, selectedFeed._id)}

                // replies
                replies={replies}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                replyLoading={replyLoading}
                showReplies={showReplies}
                setShowReplies={setShowReplies}
                fetchReplies={fetchReplies}
                postReply={(commentId) => postReply(selectedFeed._id, commentId)}
                likeReply={likeReply}

                // feed actions
                likeFeedAction={(idx) => likeFeedAction(selectedFeed._id, idx)}
                toggleSaveFeed={() => toggleSaveFeed(selectedFeed._id, selectedFeedIndex)}
                shareFeedAction={() => shareFeedAction(selectedFeed._id)}
                navigateFeed={navigateFeed}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stories;

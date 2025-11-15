import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStories } from '../components/Stories/hooks/useStories';
import StoriesThumbnails from '../components/Stories/storiesThumbnail';
import StoriesModal from '../components/Stories/storiesModel';
import MobileStoriesView from '../components/Stories/mobileStoriesView';

const Stories = () => {
  const {
    // States
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
    
    // Refs
    videoRef,
    scrollContainerRef,
    
    // Setters
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
    
    // Functions
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
        setSelectedFeedIndex={setSelectedFeedIndex}
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

      {/* Modal */}
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
            style={{ overflow: 'hidden' }}
          >
            {/* Desktop Layout */}
            <div className="hidden md:block">
              <StoriesModal
                feed={selectedFeed}
                selectedFeedIndex={selectedFeedIndex}
                setSelectedFeedIndex={setSelectedFeedIndex}
                setIsPaused={setIsPaused}
                setShowComments={setShowComments}
                videoRef={videoRef}
                progress={progress}
                isPaused={isPaused}
                isHovering={isHovering}
                setIsHovering={setIsHovering}
                navigateFeed={navigateFeed}
                // Comments props
                comments={comments}
                commentLoading={commentLoading}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                likeComment={likeComment}
                replies={replies}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                replyLoading={replyLoading}
                showReplies={showReplies}
                setShowReplies={setShowReplies}
                fetchReplies={fetchReplies}
                postReply={postReply}
                likeReply={likeReply}
                likeFeedAction={likeFeedAction}
                toggleSaveFeed={toggleSaveFeed}
                shareFeedAction={shareFeedAction}
              />
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
              <MobileStoriesView
                feed={selectedFeed}
                selectedFeedIndex={selectedFeedIndex}
                setSelectedFeedIndex={setSelectedFeedIndex}
                videoRef={videoRef}
                progress={progress}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                setShowComments={setShowComments}
                showComments={showComments}
                touchStartTime={touchStartTime}
                setTouchStartTime={setTouchStartTime}
                comments={comments}
                commentLoading={commentLoading}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={handleAddComment}
                likeComment={likeComment}
                replies={replies}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                replyLoading={replyLoading}
                showReplies={showReplies}
                setShowReplies={setShowReplies}
                fetchReplies={fetchReplies}
                postReply={postReply}
                likeReply={likeReply}
                likeFeedAction={likeFeedAction}
                toggleSaveFeed={toggleSaveFeed}
                shareFeedAction={shareFeedAction}
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
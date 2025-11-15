import React from 'react';
import { motion } from 'framer-motion';
import StoriesPlayer from './storiesPlayer';
import CommentsSection from './commentSection';

const StoriesModal = ({
  feed,
  selectedFeedIndex,
  setSelectedFeedIndex,
  setIsPaused,
  setShowComments,
  videoRef,
  progress,
  isPaused,
  isHovering,
  setIsHovering,
  navigateFeed,
  // Comments props
  comments,
  commentLoading,
  newComment,
  setNewComment,
  handleAddComment,
  likeComment,
  replies,
  replyInputs,
  setReplyInputs,
  replyLoading,
  showReplies,
  setShowReplies,
  fetchReplies,
  postReply,
  likeReply,
  likeFeedAction,
  toggleSaveFeed,
  shareFeedAction,
}) => {
  return (
    <motion.div
      className="hidden md:flex relative h-[90vh] max-h-[700px] w-[850px] bg-white rounded-lg overflow-hidden mx-auto"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.95 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <StoriesPlayer
        feed={feed}
        videoRef={videoRef}
        progress={progress}
        isPaused={isPaused}
        isHovering={isHovering}
        setIsPaused={setIsPaused}
        navigateFeed={navigateFeed}
        setSelectedFeedIndex={setSelectedFeedIndex}
        setShowComments={setShowComments}
        fetchComments={() => {}} // Handled in navigateFeed
      />

      <CommentsSection
        feed={feed}
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
        selectedFeedIndex={selectedFeedIndex}
        showComments={false} // Not used in desktop
        setShowComments={setShowComments}
      />
    </motion.div>
  );
};

export default StoriesModal;
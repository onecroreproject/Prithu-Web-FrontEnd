import React from "react";
import { motion } from "framer-motion";
import StoriesPlayer from "./storiesPlayer";
import CommentsSection from "./commentSection";

const StoriesModal = ({
  feed,
  selectedFeedIndex,
  setSelectedFeedIndex,
  setShowComments,
  videoRef,
  progress,
  setProgress,
  navigateFeed,
  setIsHovering,

  // Comments props
  comments,
  commentLoading,
  newComment,
  setNewComment,
  handleAddComment,
  likeComment,

  // Replies
  replies,
  replyInputs,
  setReplyInputs,
  replyLoading,
  showReplies,
  setShowReplies,
  fetchReplies,
  postReply,
  likeReply,

  // Feed actions
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
    >
      <StoriesPlayer
        feed={feed}
        videoRef={videoRef}
        progress={progress}
        setProgress={setProgress}
        navigateFeed={navigateFeed}
        setIsHovering={setIsHovering}
        setSelectedFeedIndex={setSelectedFeedIndex}
        setShowComments={setShowComments}
        likeFeedAction={likeFeedAction}
        shareFeedAction={shareFeedAction}
      />

      <CommentsSection
        feed={feed}
        comments={comments || []}
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
        showComments={false}
        setShowComments={setShowComments}
      />
    </motion.div>
  );
};

export default StoriesModal;

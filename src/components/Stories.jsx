import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

import { useStories } from "../components/Stories/hooks/useStories";
import StoriesThumbnails from "../components/Stories/storiesThumbnail";
import StoriesModal from "../components/Stories/storiesModel";
import MobileStoriesView from "../components/Stories/mobileStoriesView";

import { useLikePost, useSharePost } from "../hooks/usePostActions";


// Detect mobile/desktop
const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const Stories = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  const {
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
    isMuted,

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
    setIsMuted,

    // functions
    fetchComments,
    handleAddComment,
    likeComment,
    fetchReplies,
    postReply,
    likeReply,
    toggleSaveFeed,
    navigateFeed,
    handleVideoTimeUpdate,
  } = useStories();


  // -------------------------------------------------
  // 1️⃣ SELECTED FEED
  // -------------------------------------------------
  const selectedFeed =
    selectedFeedIndex !== null ? feeds[selectedFeedIndex] : null;

  if (!selectedFeed) {
    // Prevent errors on first render
  }

  const feedId = selectedFeed?._id || null;

  // IMPORTANT: your feed uses totalLikes
  const apiTotalLikes = selectedFeed?.totalLikes ?? 0;

  // -------------------------------------------------
  // 2️⃣ LIKE STATE
  // -------------------------------------------------
  const [isLikedState, setIsLiked] = useState(selectedFeed?.isLiked || false);
  const [likesCount, setLikesCount] = useState(apiTotalLikes);
  const [totalViews,setTotalViews] =useState(selectedFeed?.totalViews||0);
  const [totalShare,setTotalShare] =useState(selectedFeed?.totalShares||0);

  const stableFeedId = useRef(feedId);

  // when changing feed slide, update UI
  useEffect(() => {
    if (feedId) {
      stableFeedId.current = feedId;

      setIsLiked(selectedFeed?.isLiked || false);
      setLikesCount(selectedFeed?.totalLikes ?? 0);
      setTotalViews(selectedFeed?.totalViews ?? 0);
      setTotalShare(selectedFeed?.totalShares ?? 0);
    }
  }, [feedId, selectedFeed]);


  const UserId = localStorage.getItem("userId");
  const likeMutation = useLikePost();
  const shareMutation = useSharePost(feedId, UserId);


  // -------------------------------------------------
  // 3️⃣ SHARE POST
  // -------------------------------------------------
const handleShare = useCallback(async () => {
  if (!feedId) return;



  const shareUrl = `${window.location.origin}/post/${feedId}?ref=share`;

  shareMutation.mutate({
    shareChannel: navigator.share ? "native_share" : "copy_link",
    shareTarget: null
  });

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Check this post",
        url: shareUrl,
      });
      return;
    } catch {}
  }

  navigator.clipboard.writeText(shareUrl);
  toast.success("Share link copied!");
}, [feedId, shareMutation]);

  // -------------------------------------------------
  // 4️⃣ LIKE POST (Optimistic)
  // -------------------------------------------------
  const handleLikeFeed = useCallback(() => {
    if (!feedId) return;

    const updated = !isLikedState;

    // Update UI instantly
    setIsLiked(updated);
    setLikesCount((prev) => (updated ? prev + 1 : Math.max(prev - 1, 0)));

    likeMutation.mutate(
      {
        feedId,
        userId: UserId,
        action: updated ? "like" : "unlike",
      },
      {
        onError: () => {
          // Revert UI on failure
          setIsLiked(!updated);
          setLikesCount((prev) =>
            updated ? Math.max(prev - 1, 0) : prev + 1
          );
          toast.error("Failed to update like");
        },
      }
    );
  }, [feedId, isLikedState, likeMutation, UserId]);


  return (
    <motion.div
      className="bg-white p-4 md:p-5 max-w-[900px] mx-auto relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      {/* Thumbnails */}
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
        {selectedFeed && (
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
            {!isMobile ? (
              <StoriesModal
                feed={selectedFeed}
                selectedFeedIndex={selectedFeedIndex}
                setSelectedFeedIndex={setSelectedFeedIndex}

                // PLAYER
                videoRef={videoRef}
                progress={progress}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isHovering={isHovering}
                setIsHovering={setIsHovering}
                handleVideoTimeUpdate={handleVideoTimeUpdate}
                navigateFeed={navigateFeed}

                // LIKE & SHARE
                onLike={handleLikeFeed}
                onShare={handleShare}
                likesCount={likesCount}
                isLikedState={isLikedState}
                totalViews={totalViews}
                totalShare={totalShare}

                // COMMENTS
                comments={comments[feedId] || []}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={() => handleAddComment(feedId)}
                likeComment={(commentId) => likeComment(commentId, feedId)}
                commentLoading={commentLoading}
                setShowComments={setShowComments}

                // REPLIES
                replies={replies}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                showReplies={showReplies}
                setShowReplies={setShowReplies}
                fetchReplies={fetchReplies}
                postReply={(commentId) =>
                  postReply({
                    feedId,
                    parentCommentId: commentId,
                    replyText: replyInputs[commentId] || "",
                  })
                }
                likeReply={likeReply}

                // SAVE
                toggleSaveFeed={() => toggleSaveFeed(feedId, selectedFeedIndex)}
              />
            ) : (
              <MobileStoriesView
                feed={selectedFeed}
                selectedFeedIndex={selectedFeedIndex}
                setSelectedFeedIndex={setSelectedFeedIndex}
                setShowComments={setShowComments}
                // PLAYER
                videoRef={videoRef}
                progress={progress}
                isPaused={isPaused}
                setIsPaused={setIsPaused}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                touchStartTime={touchStartTime}
                setTouchStartTime={setTouchStartTime}
                handleVideoTimeUpdate={handleVideoTimeUpdate}
                navigateFeed={navigateFeed}
                setProgress={setProgress}

                // LIKE & SHARE
                onLike={handleLikeFeed}
                onShare={handleShare}
                likesCount={likesCount}
                isLiked={isLikedState}

                // COMMENTS
                comments={comments[feedId] || []}
                newComment={newComment}
                setNewComment={setNewComment}
                handleAddComment={() => handleAddComment(feedId)}
                likeComment={(commentId) => likeComment(commentId, feedId)}
                commentLoading={commentLoading}

                // REPLIES
                replies={replies}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                showReplies={showReplies}
                setShowReplies={setShowReplies}
                fetchReplies={fetchReplies}
                postReply={(commentId) => postReply(feedId, commentId)}
                likeReply={likeReply}

                // SAVE
                toggleSaveFeed={() => toggleSaveFeed(feedId, selectedFeedIndex)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stories;

import { useState, useEffect, useRef } from 'react';
import api from '../../../api/axios';

export const useStories = () => {
  const [feeds, setFeeds] = useState([]);
  const [selectedFeedIndex, setSelectedFeedIndex] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [replies, setReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [showReplies, setShowReplies] = useState({});
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStartTime, setTouchStartTime] = useState(null);
  const [showArrows, setShowArrows] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const imageIntervalRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Thumbnail generation
  const getVideoThumbnail = (videoUrl) =>
    new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.currentTime = 1;

      video.addEventListener('loadeddata', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/png'));
      });
      video.addEventListener('error', (e) => reject(e));
    });

  // Fetch feeds
  useEffect(() => {
    const fetchTrendingFeeds = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/get/trending/feed');
        const data = res.data?.data || [];
        setFeeds(data);

        data.forEach(async (feed) => {
          if (feed.type === 'video' && feed.contentUrl) {
            try {
              const thumb = await getVideoThumbnail(feed.contentUrl);
              setThumbnails((prev) => ({ ...prev, [feed._id]: thumb }));
            } catch (err) {
              console.warn('Thumbnail generation failed:', err);
            }
          }
        });
      } catch (err) {
        console.error('Error fetching trending feeds:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingFeeds();
  }, []);

  // Handle video time update for progress bar
  const handleVideoTimeUpdate = () => {
    if (videoRef.current && !isPaused) {
      const video = videoRef.current;
      if (!isPaused && video.duration && video.currentTime) { // Only update when NOT paused
        const newProgress = (video.currentTime / video.duration) * 100;
        setProgress(newProgress);

        // Auto-advance to next story when video ends
        if (newProgress >= 100) {
          navigateFeed("next");
        }
      }
    }
  };

  // Progress bar logic for images (5 seconds) and video duration
  useEffect(() => {
    if (selectedFeedIndex !== null) {
      const currentFeed = feeds[selectedFeedIndex];
      if (!currentFeed) return;

      const isVideo = currentFeed.type === "video";

      // Clear any existing intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      if (imageIntervalRef.current) {
        clearInterval(imageIntervalRef.current);
        imageIntervalRef.current = null;
      }

      if (isVideo && videoRef.current) {
        // For videos, use actual video duration
        const video = videoRef.current;

        const updateVideoProgress = () => {
          if (!isPaused && video.duration && video.currentTime) { // Only update when NOT paused
            const newProgress = (video.currentTime / video.duration) * 100;
            setProgress(newProgress);

            if (newProgress >= 100) {
              navigateFeed("next");
            }
          }
        };

        // Update progress based on video timeupdate
        video.addEventListener('timeupdate', updateVideoProgress);

        // Handle video events
        const handleVideoEnded = () => {
          navigateFeed("next");
        };

        video.addEventListener('ended', handleVideoEnded);

        return () => {
          video.removeEventListener('timeupdate', updateVideoProgress);
          video.removeEventListener('ended', handleVideoEnded);
        };
      } else {
        // For images, use 5 seconds
        const duration = 5000; // 5 seconds as requested
        const intervalTime = 50; // Update every 50ms for smooth progress
        const increment = (intervalTime / duration) * 100;

        let currentProgress = 0;

        imageIntervalRef.current = setInterval(() => {
          if (isPaused) return; // Don't update if paused

          currentProgress += increment;
          setProgress(Math.min(currentProgress, 100));

          if (currentProgress >= 100) {
            clearInterval(imageIntervalRef.current);
            imageIntervalRef.current = null;
            navigateFeed("next");
          }
        }, intervalTime);

        return () => {
          if (imageIntervalRef.current) {
            clearInterval(imageIntervalRef.current);
            imageIntervalRef.current = null;
          }
        };
      }
    }
  }, [selectedFeedIndex, feeds, isPaused]);

  // Reset progress when changing stories
  useEffect(() => {
    setProgress(0);
    setIsPaused(false); // Reset pause state when changing stories
  }, [selectedFeedIndex]);

  // Pause/resume management
  useEffect(() => {
    if (selectedFeedIndex !== null) {
      const currentFeed = feeds[selectedFeedIndex];
      if (currentFeed?.type === 'video' && videoRef.current) {
        const video = videoRef.current;

        if (isPaused) {
          video.pause();
        } else {
          video.play().catch(() => { }); // Ignore autoplay errors
        }
      }
    }
  }, [isPaused, selectedFeedIndex, feeds]);

  const closePopup = () => {
    setSelectedFeedIndex(null);
    setShowComments(false);
    setIsPaused(false);

    // Clear all intervals
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    if (imageIntervalRef.current) {
      clearInterval(imageIntervalRef.current);
    }
  };

  // ========== COMMENT & REPLY FUNCTIONS ==========

  // Fetch comments
  const fetchComments = async (feedId) => {
    try {
      setCommentLoading(true);
      const res = await api.post('/api/get/comments/for/feed', { feedId });
      setComments((prev) => ({
        ...prev,
        [feedId]: res.data?.comments || [],
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments((prev) => ({
        ...prev,
        [feedId]: [],
      }));
    } finally {
      setCommentLoading(false);
    }
  };

  // Add comment
  const handleAddComment = async (feedId) => {
    if (!newComment.trim()) return;
    try {
      const res = await api.post('/api/user/feed/comment', {
        feedId,
        commentText: newComment,
      });
      const newCommentObj = res.data?.comment;
      if (!newCommentObj) return;
      setComments((prev) => ({
        ...prev,
        [feedId]: [...(prev[feedId] || []), newCommentObj],
      }));
      setNewComment('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  // Like comment
  const likeComment = async (commentId, feedId) => {
    try {
      const { data } = await api.post('/api/user/comment/like', { commentId });

      setComments((prev) => ({
        ...prev,
        [feedId]: prev[feedId].map((c) =>
          c.commentId === commentId
            ? {
              ...c,
              isLiked: data.liked,
              likeCount: data.likeCount,
            }
            : c
        ),
      }));
    } catch (err) {
      console.error("Comment like failed:", err);
    }
  };

  // Fetch replies
  const fetchReplies = async (commentId) => {
    const parentReplyId = commentId;
    console.log(commentId)
    try {
      setReplyLoading((prev) => ({ ...prev, [commentId]: true }));

      const res = await api.post('/api/get/nested/replies', { parentReplyId });
      console.log(res.data)
      setReplies((prev) => ({
        ...prev,
        [commentId]: res.data?.replies || [],
      }));
    } catch (err) {
      console.error("Error fetching replies:", err);
    } finally {
      setReplyLoading((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  // Post reply - FIXED VERSION
  const postReply = async (feedId, parentCommentId) => {
    console.log(parentCommentId)
    const replyText = replyInputs[parentCommentId]?.trim();
    if (!replyText) return;

    try {
      const res = await api.post('/api/user/feed/reply/comment', {
        feedId: feedId.feedId,
        parentCommentId: feedId.parentCommentId,
        commentText: replyText,
      });

      const replyObj = res.data?.comment;
      if (!replyObj) return;

      setReplies(prev => ({
        ...prev,
        [parentCommentId]: [...(prev[parentCommentId] || []), replyObj],
      }));

      setReplyInputs(prev => ({
        ...prev,
        [parentCommentId]: "",
      }));

      // Fetch updated replies to ensure consistency
      await fetchReplies(parentCommentId);
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };

  // Like reply
  const likeReply = async (replyId, commentId) => {
    const replyCommentId = replyId;
    try {
      const { data } = await api.post('/api/user/replycomment/like', { replyCommentId });

      setReplies((prev) => ({
        ...prev,
        [commentId]: prev[commentId].map((r) =>
          r.replyId === replyId
            ? {
              ...r,
              isLiked: data.liked,
              likeCount: data.likeCount,
            }
            : r
        ),
      }));
    } catch (err) {
      console.error("Reply like failed:", err);
    }
  };

  // ========== FEED ACTIONS ==========

  // Like feed
  const likeFeedAction = async (feedId, index) => {
    try {
      const { data } = await api.post('/api/user/feed/like', { feedId });

      setFeeds((prev) =>
        prev.map((f, i) =>
          i === index
            ? {
              ...f,
              isLiked: data.message === "Liked successfully",
              likesCount: data.message === "Liked successfully"
                ? f.likesCount + 1
                : f.likesCount - 1,
            }
            : f
        )
      );
    } catch (err) {
      console.error("Feed like failed", err);
    }
  };

  // Save feed
  const toggleSaveFeed = async (feedId, index) => {
    try {
      await api.post('/api/user/feed/save', { feedId });
      setFeeds((prev) =>
        prev.map((f, i) => (i === index ? { ...f, isSaved: !f.isSaved } : f))
      );
    } catch (err) {
      console.error('Save feed failed', err);
    }
  };

  // Share feed
  const shareFeedAction = async (feedId) => {
    try {
      await api.post('/api/user/feed/share', { feedId });
      const url = `${window.location.origin}/post/${feedId}`;
      await navigator.clipboard.writeText(url);
      alert('Share link copied!');
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  // ========== NAVIGATION ==========

  // Navigation with pause state reset
  const navigateFeed = (direction) => {
    setSelectedFeedIndex((prev) => {
      if (prev === null) return prev;

      const newIndex = direction === 'next'
        ? (prev === feeds.length - 1 ? 0 : prev + 1)
        : (prev === 0 ? feeds.length - 1 : prev - 1);

      if (feeds[newIndex]) {
        fetchComments(feeds[newIndex]._id);
      }

      // Reset pause state when navigating
      setIsPaused(false);
      return newIndex;
    });

    setProgress(0);
    setShowComments(false);
  };

  return {
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
    showComments,
    isHovering,
    isPaused,
    touchStartTime,
    showArrows,
    showLeftArrow,
    showRightArrow,

    // Refs
    videoRef,
    progressIntervalRef,
    scrollContainerRef,

    // Setters
    setSelectedFeedIndex,
    setNewComment,
    setReplyInputs,
    setShowReplies,
    setShowComments,
    setIsHovering,
    setTouchStartTime,
    setShowArrows,
    setShowLeftArrow,
    setShowRightArrow,
    setProgress,
    setIsPaused,

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
    closePopup,
    handleVideoTimeUpdate,
  };
};

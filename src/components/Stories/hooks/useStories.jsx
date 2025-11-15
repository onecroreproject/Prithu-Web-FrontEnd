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
  try {
    setReplyLoading((prev) => ({ ...prev, [commentId]: true }));

    const res = await api.post('/api/get/comments/relpy/for/feed', { commentId });

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


  // Post reply
const postReply = async (feedId, commentId) => {
  const text = replyInputs[commentId];
  if (!text?.trim()) return;

  try {
    const res = await api.post('/api/user/feed/reply/comment', {
      feedId,
      parentCommentId: commentId,
      commentText: text,
    });

    const replyObj = res.data?.comment; // ⬅ backend sends { comment: {...} }

    setReplies((prev) => ({
      ...prev,
      [commentId]: [...(prev[commentId] || []), replyObj],
    }));

    setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
  } catch (err) {
    console.error("Reply failed:", err);
  }
};


  // Like reply
 const likeReply = async (replyId, commentId) => {
  try {
    const { data } = await api.post('/api/user/comment/reply/like', { replyId });

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


  // Like feed
 const likeFeedAction = async (feedId, index) => {
  try {
    const { data } = await api.post('/api/user/feed/like', { feedId });

    setFeeds((prev) =>
      prev.map((f, i) =>
        i === index
          ? {
              ...f,
              isLiked: data.message === "Liked successfully", // backend truth
              likesCount:
                data.message === "Liked successfully"
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

  // Navigation
  const navigateFeed = (direction) => {
    setSelectedFeedIndex((prev) => {
      if (prev === null) return prev;
      const newIndex = direction === 'next' 
        ? (prev === feeds.length - 1 ? 0 : prev + 1)
        : (prev === 0 ? feeds.length - 1 : prev - 1);
      
      if (feeds[newIndex]) {
        fetchComments(feeds[newIndex]._id);
      }
      return newIndex;
    });
    setProgress(0);
    setIsPaused(false);
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
    isPaused,
    showComments,
    isHovering,
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
  };
};
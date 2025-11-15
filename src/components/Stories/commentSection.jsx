import React from 'react';
import { FiHeart, FiMessageCircle, FiSend, FiBookmark } from 'react-icons/fi';

const CommentsSection = ({
  feed,
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
  selectedFeedIndex,
  showComments,
  setShowComments,
}) => {
  return (
    <div className="flex flex-col w-[400px] h-full bg-white border-l border-gray-200">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <img
          src={feed.createdByProfile?.profileAvatar || 'https://default-avatar.example.com/default.png'}
          alt="avatar"
          className="w-10 h-10 rounded-full object-cover mr-3"
        />
        <div className="flex-1">
          <div className="font-semibold text-base">
            {feed.createdByProfile?.userName || 'Unknown User'}
          </div>
          <div className="text-xs text-gray-500">
            {feed.location || 'Somewhere'}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => likeFeedAction(feed._id, selectedFeedIndex)}
            className="text-xl"
          >
            <FiHeart className={feed.isLiked ? 'text-red-500' : ''} />
          </button>

          <button
            onClick={() => shareFeedAction(feed._id)}
            className="text-xl"
          >
            <FiSend />
          </button>

          <button
            onClick={() => toggleSaveFeed(feed._id, selectedFeedIndex)}
            className="text-xl"
          >
            <FiBookmark className={feed.isSaved ? 'text-yellow-500' : ''} />
          </button>
        </div>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {commentLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start space-x-3 p-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-24 mb-2 animate-pulse" />
                <div className="h-3 bg-gray-300 rounded w-32 animate-pulse" />
              </div>
            </div>
          ))
        ) : comments[feed._id] && comments[feed._id].length ? (
          comments[feed._id].map((comment) => (
            <div key={comment.commentId} className="flex items-start space-x-4">
              <img
                src={comment.avatar || 'https://default-avatar.example.com/default.png'}
                alt="avatar"
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="font-semibold text-base">{comment.username}</span>
                    <span className="text-gray-500 text-sm">{comment.timeAgo}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => likeComment(comment.commentId, feed._id)}
                      className={`text-sm ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                    >
                      {comment.isLiked ? '♥' : '♡'} {comment.likeCount}
                    </button>
                  </div>
                </div>

                <p className="text-base text-gray-800 leading-relaxed">{comment.commentText}</p>

                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
                  <button
                    onClick={async () => {
                      setShowReplies((prev) => {
                        const next = !prev[comment.commentId];
                        if (next) fetchReplies(comment.commentId);
                        return { ...prev, [comment.commentId]: next };
                      });
                    }}
                  >
                    Reply ({comment.replyCount})
                  </button>

                  <button
                    onClick={() => {
                      setShowReplies((prev) => ({ ...prev, [comment.commentId]: true }));
                      if (!replies[comment.commentId]) fetchReplies(comment.commentId);
                    }}
                  >
                    Write reply
                  </button>
                </div>

                {/* Replies block */}
                {showReplies[comment.commentId] && (
                  <div className="mt-3 ml-10">
                    {replyLoading[comment.commentId] ? (
                      <div className="text-sm text-gray-500">Loading replies...</div>
                    ) : replies[comment.commentId] && replies[comment.commentId].length ? (
                      replies[comment.commentId].map((r) => (
                        <div key={r.replyId} className="flex items-start space-x-3 mb-3">
                          <img
                            src={r.avatar || 'https://default-avatar.example.com/default.png'}
                            className="w-8 h-8 rounded-full"
                            alt=""
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-semibold text-sm">{r.username}</div>
                                <div className="text-xs text-gray-500">{r.timeAgo}</div>
                              </div>
                              <button
                                onClick={() => likeReply(r.replyId, comment.commentId)}
                                className={`text-sm ${r.isLiked ? 'text-red-500' : 'text-gray-500'}`}
                              >
                                {r.isLiked ? '♥' : '♡'} {r.likeCount}
                              </button>
                            </div>
                            <p className="text-sm text-gray-800 mt-1">{r.commentText}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No replies yet</div>
                    )}

                    {/* Reply input */}
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        value={replyInputs[comment.commentId] || ''}
                        onChange={(e) =>
                          setReplyInputs((prev) => ({ ...prev, [comment.commentId]: e.target.value }))
                        }
                        placeholder="Write a reply..."
                        className="flex-1 border rounded px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => postReply(feed._id, comment.commentId)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            <FiMessageCircle className="text-2xl mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs">Be the first to comment!</p>
          </div>
        )}
      </div>

      {/* Action Buttons & Add comment */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => likeFeedAction(feed._id, selectedFeedIndex)}
              className="text-xl text-gray-700 hover:text-red-500 transition"
            >
              <FiHeart />
            </button>
            <button
              onClick={() => setShowComments((s) => !s)}
              className="text-xl text-gray-700 hover:text-blue-500 transition"
            >
              <FiMessageCircle />
            </button>
            <button
              onClick={() => shareFeedAction(feed._id)}
              className="text-xl text-gray-700 hover:text-green-500 transition"
            >
              <FiSend />
            </button>
          </div>
          <button
            onClick={() => toggleSaveFeed(feed._id, selectedFeedIndex)}
            className="text-xl text-gray-700 hover:text-yellow-500 transition"
          >
            <FiBookmark />
          </button>
        </div>

        <div className="text-sm font-semibold mb-3 text-gray-800">
          {feed.likesCount || 0} likes
        </div>

        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-300 px-3 py-2">
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(feed._id)}
            className="flex-1 border-none focus:ring-0 text-sm p-0 placeholder-gray-400"
          />
          <button
            onClick={() => handleAddComment(feed._id)}
            disabled={!newComment.trim()}
            className={`font-semibold text-sm px-3 py-1 rounded transition ${
              !newComment.trim() ? 'text-blue-300 cursor-not-allowed' : 'text-blue-500 hover:text-blue-600'
            }`}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentsSection;
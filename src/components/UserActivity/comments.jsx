import React, { useState } from "react";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/solid";

const Comments = ({ type }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  const fixedAvatar =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";

  /* -----------------------------------------
      MY COMMENTS (You commented on a post)
  ------------------------------------------ */
  const myCommentsData = [
    {
      id: 1,
      postImage:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop",
      postCaption: "Beautiful beach sunset in Hawaii! 🌅",
      comment:
        "This looks incredible! Which beach is this? Planning my next vacation!",
      commentedAt: "5 hours ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 245,
      comments: 34,
    },
    {
      id: 2,
      postImage:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
      postCaption: "Homemade pizza night! 🍕",
      comment: "The crust looks perfect! Can you share the recipe?",
      commentedAt: "1 day ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 189,
      comments: 27,
    },
  ];

  /* -----------------------------------------
      COMMENTS ON YOUR POSTS (Other people commented)
  ------------------------------------------ */
  const responseCommentsData = [
    {
      id: 1,
      postImage:
        "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=400&h=300&fit=crop",
      postCaption: "My latest architecture photography project 🏢",
      comment:
        "Amazing composition and colors! What camera do you use for these shots?",
      commentedAt: "1 hour ago",
      commentedBy: {
        name: "Mike Johnson",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        username: "@mikejohnson",
      },
      likes: 156,
      comments: 23,
    },
  ];

  const data = type === "my" ? myCommentsData : responseCommentsData;

  /* -----------------------------------------
      MODAL COMPONENT
  ------------------------------------------ */
  const PostModal = ({ post, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2">
            <img
              src={post.postImage}
              alt="Post"
              className="w-full h-64 md:h-full object-cover"
            />
          </div>

          <div className="md:w-1/2 p-6 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    type === "my" ? post.user.avatar : post.commentedBy.avatar
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {type === "my" ? post.user.name : post.commentedBy.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {type === "my"
                      ? post.user.username
                      : post.commentedBy.username}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Post Details */}
            <div className="flex-1 overflow-y-auto">
              <p className="text-gray-700 mb-4">{post.postCaption}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>

              {/* Comment Section */}
              <div className="border-t pt-4">
                <div className="flex items-start space-x-3 mb-3">
                  <img
                    src={
                      type === "my" ? post.user.avatar : post.commentedBy.avatar
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />

                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-medium text-sm text-gray-900">
                        {type === "my"
                          ? post.user.name
                          : post.commentedBy.name}
                      </p>

                      <p className="text-gray-700 mt-1">{post.comment}</p>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {post.commentedAt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-blue-600 mt-4">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="font-medium">
                    Commented by{" "}
                    {type === "my" ? "you" : post.commentedBy.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* -----------------------------------------
      MAIN UI
  ------------------------------------------ */
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {type === "my" ? "Your Comments" : "Comments on Your Posts"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedPost(item)}
          >
            {/* Image */}
            <img
              src={item.postImage}
              alt="Post"
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              {/* User info */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      type === "my" ? item.user.avatar : item.commentedBy.avatar
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {type === "my"
                        ? item.user.name
                        : item.commentedBy.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {type === "my"
                        ? item.user.username
                        : item.commentedBy.username}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-400">
                  {item.commentedAt}
                </span>
              </div>

              {/* Caption */}
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {item.postCaption}
              </p>

              {/* Comment preview */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                <p className="text-sm text-gray-700 line-clamp-2">
                  "{item.comment}"
                </p>
              </div>

              {/* Engagement */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    ❤️ <span>{item.likes}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <ChatBubbleLeftIcon className="w-4 h-4 text-blue-500" />
                    <span>{item.comments}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-blue-600">
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Commented</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Comments;

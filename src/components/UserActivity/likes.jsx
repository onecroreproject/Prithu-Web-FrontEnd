import React, { useState } from 'react';
import { HeartIcon } from '@heroicons/react/24/solid';

const Likes = ({ type }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  const fixedAvatar =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";

  const myLikesData = [
    {
      id: 1,
      postImage:
        "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=400&h=300&fit=crop",
      postCaption: "Beautiful sunset at the beach 🌅 #sunset #beach #vacation",
      likedAt: "2 hours ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 124,
      comments: 23,
    },
    {
      id: 2,
      postImage:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      postCaption:
        "Morning coffee vibes ☕ Starting the day right! #coffee #morning #vibes",
      likedAt: "1 day ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 89,
      comments: 15,
    },
    {
      id: 3,
      postImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      postCaption:
        "Mountain hiking adventure 🏔️ #hiking #adventure #mountains",
      likedAt: "3 days ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 256,
      comments: 42,
    },
    {
      id: 4,
      postImage:
        "https://images.unsplash.com/photo-1516937941344-00b4e0337589?w=400&h=300&fit=crop",
      postCaption: "Urban exploration in the city 🌆 #urban #city #exploration",
      likedAt: "1 week ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 167,
      comments: 31,
    },
    {
      id: 5,
      postImage:
        "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop",
      postCaption: "Music festival memories 🎵 #music #festival #memories",
      likedAt: "2 weeks ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 312,
      comments: 67,
    },
  ];

  const responseLikesData = [
    {
      id: 1,
      postImage:
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop",
      postCaption: "My latest artwork collection 🎨 #art #design #creative",
      likedAt: "30 minutes ago",
      likedBy: {
        name: "John Doe",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        username: "@johndoe",
      },
      likes: 89,
      comments: 12,
    },
    {
      id: 2,
      postImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      postCaption: "Weekend hiking adventure 🏞️ #nature #hiking #weekend",
      likedAt: "3 hours ago",
      likedBy: {
        name: "Sarah Smith",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        username: "@sarahsmith",
      },
      likes: 145,
      comments: 28,
    },
  ];

  const data = type === "my" ? myLikesData : responseLikesData;

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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <img
                  src={type === "my" ? post.user.avatar : post.likedBy.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {type === "my" ? post.user.name : post.likedBy.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {type === "my" ? post.user.username : post.likedBy.username}
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

            <div className="flex-1 overflow-y-auto">
              <p className="text-gray-700 mb-4">{post.postCaption}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 text-red-500">
                  <HeartIcon className="w-5 h-5" />
                  <span className="font-medium">
                    Liked by {type === "my" ? "you" : post.likedBy.name}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{post.likedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {type === "my" ? "Posts You Liked" : "Likes on Your Posts"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
            onClick={() => setSelectedPost(item)}
          >
            <img
              src={item.postImage}
              alt="Post"
              className="w-full h-48 object-cover"
            />

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={type === "my" ? item.user.avatar : item.likedBy.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {type === "my" ? item.user.name : item.likedBy.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {type === "my"
                        ? item.user.username
                        : item.likedBy.username}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{item.likedAt}</span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {item.postCaption}
              </p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4 text-red-500" />
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    💬 <span>{item.comments}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-red-600">
                  <HeartIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Liked</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
};

export default Likes;

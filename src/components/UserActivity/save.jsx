import React, { useState } from "react";
import { BookmarkIcon } from "@heroicons/react/24/solid";

const Saves = ({ type }) => {
  const [selectedPost, setSelectedPost] = useState(null);

  const fixedAvatar =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face";

  /* -----------------------------
        MY SAVED POSTS
  ------------------------------ */
  const mySavesData = [
    {
      id: 1,
      postImage:
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      postCaption:
        "Useful programming tips and tricks for developers 💻 #programming #tips #coding",
      savedAt: "1 day ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 345,
      comments: 67,
    },
    {
      id: 2,
      postImage:
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop",
      postCaption:
        "Healthy meal prep ideas for the week 🥗 #health #mealprep #nutrition",
      savedAt: "2 days ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 278,
      comments: 45,
    },
    {
      id: 3,
      postImage:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      postCaption:
        "Travel packing checklist for digital nomads ✈️ #travel #packing #digitalnomad",
      savedAt: "3 days ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 189,
      comments: 32,
    },
    {
      id: 4,
      postImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      postCaption:
        "Photography lighting techniques for beginners 📸 #photography #lighting #tips",
      savedAt: "1 week ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 423,
      comments: 78,
    },
    {
      id: 5,
      postImage:
        "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=300&fit=crop",
      postCaption:
        "Productivity apps that will change your life 📱 #productivity #apps #tools",
      savedAt: "2 weeks ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 312,
      comments: 56,
    },
    {
      id: 6,
      postImage:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
      postCaption:
        "Home workout routine with no equipment 🏋️ #fitness #workout #home",
      savedAt: "3 weeks ago",
      user: {
        name: "You",
        avatar: fixedAvatar,
        username: "@yourprofile",
      },
      likes: 267,
      comments: 41,
    },
  ];

  /* -----------------------------
        SAVES ON YOUR POSTS
  ------------------------------ */
  const responseSavesData = [
    {
      id: 1,
      postImage:
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      postCaption: "My programming tutorial for React developers",
      savedAt: "6 hours ago",
      savedBy: {
        name: "Code Learner",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        username: "@codelearner",
      },
      likes: 234,
      comments: 45,
    },
    {
      id: 2,
      postImage:
        "https://images.unsplash.com/photo-1545235617-9465d2a55698?w=400&h=300&fit=crop",
      postCaption: "My healthy recipes collection",
      savedAt: "1 day ago",
      savedBy: {
        name: "Health Enthusiast",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
        username: "@healthenthusiast",
      },
      likes: 189,
      comments: 32,
    },
    {
      id: 3,
      postImage:
        "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
      postCaption: "My travel guides for digital nomads",
      savedAt: "2 days ago",
      savedBy: {
        name: "Travel Blogger",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
        username: "@travelblogger",
      },
      likes: 156,
      comments: 28,
    },
    {
      id: 4,
      postImage:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
      postCaption: "My photography tutorials series",
      savedAt: "3 days ago",
      savedBy: {
        name: "Aspiring Photographer",
        avatar:
          "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face",
        username: "@aspiringphotographer",
      },
      likes: 278,
      comments: 51,
    },
    {
      id: 5,
      postImage:
        "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=300&fit=crop",
      postCaption: "My productivity system breakdown",
      savedAt: "1 week ago",
      savedBy: {
        name: "Productivity Seeker",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
        username: "@productivityseeker",
      },
      likes: 345,
      comments: 67,
    },
  ];

  const data = type === "my" ? mySavesData : responseSavesData;

  /* -----------------------------
         MODAL COMPONENT
  ------------------------------ */
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
                    type === "my" ? post.user.avatar : post.savedBy.avatar
                  }
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {type === "my" ? post.user.name : post.savedBy.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {type === "my"
                      ? post.user.username
                      : post.savedBy.username}
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              <p className="text-gray-700 mb-4">{post.postCaption}</p>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 text-purple-600">
                  <BookmarkIcon className="w-5 h-5" />
                  <span className="font-medium">
                    Saved by {type === "my" ? "you" : post.savedBy.name}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">{post.savedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* -----------------------------
        MAIN UI
  ------------------------------ */
  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">
        {type === "my" ? "Posts You Saved" : "Saves of Your Posts"}
      </h3>

      {/* Grid */}
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
              {/* USER INFO */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={
                      type === "my"
                        ? item.user.avatar
                        : item.savedBy.avatar
                    }
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {type === "my"
                        ? item.user.name
                        : item.savedBy.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {type === "my"
                        ? item.user.username
                        : item.savedBy.username}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-400">{item.savedAt}</span>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {item.postCaption}
              </p>

              {/* Engagement */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    ❤️ <span>{item.likes}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    💬 <span>{item.comments}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-purple-600">
                  <BookmarkIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Saved</span>
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

export default Saves;

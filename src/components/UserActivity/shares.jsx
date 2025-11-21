import React, { useState } from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
 
const Shares = ({ type }) => {
  const [selectedPost, setSelectedPost] = useState(null);
 
//   const mySharesData = [
//     {
//       id: 1,
//       postImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
//       postCaption: "Important tech news: AI breakthroughs in 2024! 🤖 #tech #ai #innovation",
//       sharedAt: "3 hours ago",
//       user: {
//         name: "You",
//         avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face%22,
//         username: "@yourprofile"
//       },
//       likes: 567,
//       comments: 89
//     },
//     {
//       id: 2,
//       postImage: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop",
//       postCaption: "Amazing art tutorial for beginners 🎨 #art #tutorial #creative",
//       sharedAt: "1 day ago",
//       user: {
//         name: "You",
//         avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face%22,
//         username: "@yourprofile"
//       },
//       likes: 234,
//       comments: 45
//     },
//     {
//       id: 3,
//       postImage: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=300&fit=crop",
//       postCaption: "Productivity tips that actually work! 💼 #productivity #tips #work",
//       sharedAt: "2 days ago",
//       user: {
//         name: "You",
//         avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face%22,
//         username: "@yourprofile"
//       },
//       likes: 189,
//       comments: 32
//     },
//     {
//       id: 4,
//       postImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
//       postCaption: "Fitness routine for busy professionals 💪 #fitness #health #routine",
//       sharedAt: "3 days ago",
//       user: {
//         name: "You",
//         avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face%22,
//         username: "@yourprofile"
//       },
//       likes: 312,
//       comments: 67
//     },
//     {
//       id: 5,
//       postImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
//       postCaption: "Business strategy insights for 2024 📈 #business #strategy #growth",
//       sharedAt: "1 week ago",
//       user: {
//         name: "You",
//         avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face%22,
//         username: "@yourprofile"
//       },
//       likes: 445,
//       comments: 78
//     }
//   ];
 
//   const responseSharesData = [
//     {
//       id: 1,
//       postImage: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=300&fit=crop",
//       postCaption: "My latest tech article about AI developments",
//       sharedAt: "2 hours ago",
//       sharedBy: {
//         name: "Tech Enthusiast",
//         avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face%22,
//         username: "@techenthusiast"
//       },
//       likes: 423,
//       comments: 56
//     },
//     {
//       id: 2,
//       postImage: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=400&h=300&fit=crop",
//       postCaption: "My art tutorial series for beginners",
//       sharedAt: "5 hours ago",
//       sharedBy: {
//         name: "Creative Artist",
//         avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face%22,
//         username: "@creativeartist"
//       },
//       likes: 198,
//       comments: 34
//     },
//     {
//       id: 3,
//       postImage: "https://images.unsplash.com/photo-1542744095-291d1f67b221?w=400&h=300&fit=crop",
//       postCaption: "Productivity methods that changed my life",
//       sharedAt: "1 day ago",
//       sharedBy: {
//         name: "Productivity Pro",
//         avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face%22,
//         username: "@productivitypro"
//       },
//       likes: 267,
//       comments: 45
//     },
//     {
//       id: 4,
//       postImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
//       postCaption: "My fitness journey transformation",
//       sharedAt: "2 days ago",
//       sharedBy: {
//         name: "Fitness Coach",
//         avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=100&h=100&fit=crop&crop=face%22,
//         username: "@fitnesscoach"
//       },
//       likes: 389,
//       comments: 72
//     },
//     {
//       id: 5,
//       postImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
//       postCaption: "Business insights from my startup journey",
//       sharedAt: "3 days ago",
//       sharedBy: {
//         name: "Entrepreneur",
//         avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face%22,
//         username: "@entrepreneur"
//       },
//       likes: 512,
//       comments: 89
//     },
//     {
//       id: 6,
//       postImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
//       postCaption: "Photography tips from my 10 years experience",
//       sharedAt: "1 week ago",
//       sharedBy: {
//         name: "Professional Photographer",
//         avatar: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=100&h=100&fit=crop&crop=face%22,
//         username: "@prophotographer"
//       },
//       likes: 345,
//       comments: 61
//     }
//   ];
 
  const data = type === 'my' ? mySharesData : responseSharesData;
 
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
                  src={type === 'my' ? post.user.avatar : post.sharedBy.avatar}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    {type === 'my' ? post.user.name : post.sharedBy.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {type === 'my' ? post.user.username : post.sharedBy.username}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
           
            <div className="flex-1 overflow-y-auto">
              <p className="text-gray-700 mb-4">{post.postCaption}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                <span>{post.likes} likes</span>
                <span>{post.comments} comments</span>
              </div>
             
              <div className="border-t pt-4">
                <div className="flex items-center space-x-2 text-green-600">
                  <ArrowRightIcon className="w-5 h-5" />
                  <span className="font-medium">Shared by {type === 'my' ? 'you' : post.sharedBy.name}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{post.sharedAt}</p>
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
        {type === 'my' ? 'Posts You Shared' : 'Shares of Your Posts'}
      </h3>
     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map(item => (
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
                    src={type === 'my' ? item.user.avatar : item.sharedBy.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {type === 'my' ? item.user.name : item.sharedBy.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {type === 'my' ? item.user.username : item.sharedBy.username}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{item.sharedAt}</span>
              </div>
             
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.postCaption}</p>
             
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span>{item.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
                    </svg>
                    <span>{item.comments}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-green-600">
                  <ArrowRightIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Shared</span>
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
 
export default Shares;
 
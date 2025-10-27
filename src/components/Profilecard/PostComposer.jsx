import React from 'react';
import { Image } from 'lucide-react';

const PostComposer = ({ userAvatar, userName }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex gap-3">
        <img
          src={userAvatar}
          alt={userName}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <input
            type="text"
            placeholder={`What's new, ${userName}?`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <Image size={20} />
        </button>
        <select className="px-4 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-600 focus:outline-none focus:border-purple-500">
          <option>— Everything —</option>
          <option>Public</option>
          <option>Friends</option>
          <option>Private</option>
        </select>
      </div>
    </div>
  );
};

export default PostComposer;

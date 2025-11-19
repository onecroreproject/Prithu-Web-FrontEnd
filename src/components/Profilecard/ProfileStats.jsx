import React from 'react';

const ProfileStats = ({ followersCount, followingCount, totalPost, onRefresh }) => {
  return (
    <div className="bg-white border-b border-gray-200 p-6 mb-6">
      <div className="flex justify-around gap-4">
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-black mb-1">{totalPost}</div>
          <div className="text-sm text-gray-600 font-medium">Posts</div>
        </div>

        <div className="w-px bg-gray-200 my-1" />

        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-black mb-1">{followersCount}</div>
          <div className="text-sm text-gray-600 font-medium">Followers</div>
        </div>

        <div className="w-px bg-gray-200 my-1" />

        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-black mb-1">{followingCount}</div>
          <div className="text-sm text-gray-600 font-medium">Following</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;
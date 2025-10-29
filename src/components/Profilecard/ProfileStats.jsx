import React from 'react';

const ProfileStats = ({ followersCount, followingCount }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{followersCount}</div>
          <div className="text-sm text-gray-600">Followers</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{followingCount}</div>
          <div className="text-sm text-gray-600">Followings</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;

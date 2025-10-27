import React from 'react';

const ProfileStats = ({ friendsCount, groupsCount }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
      <div className="flex justify-center gap-8">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{friendsCount}</div>
          <div className="text-sm text-gray-600">Friends</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{groupsCount}</div>
          <div className="text-sm text-gray-600">Groups</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;

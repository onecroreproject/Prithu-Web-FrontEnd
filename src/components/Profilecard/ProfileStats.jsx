import React from 'react';

const ProfileStats = ({
  downloadCount,
  shareCount
}) => {
  return (
    <div className="bg-white border-b border-gray-200 p-6 mb-6">
      <div className="flex justify-around gap-4">
        <div
          className="text-center flex-1 transition-all duration-200 hover:bg-gray-50 hover:rounded-lg hover:p-2"
        >
          <div className="text-2xl font-bold text-black mb-1">{downloadCount || 0}</div>
          <div className="text-sm text-gray-600 font-medium">Downloads</div>
        </div>

        <div className="w-px bg-gray-200 my-1" />

        <div
          className="text-center flex-1 transition-all duration-200 hover:bg-gray-50 hover:rounded-lg hover:p-2"
        >
          <div className="text-2xl font-bold text-black mb-1">{shareCount || 0}</div>
          <div className="text-sm text-gray-600 font-medium">Shares</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;

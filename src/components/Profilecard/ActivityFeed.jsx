// src/components/Profilecard.jsx/ActivityFeed.jsx
import React from 'react';
import { MoreVertical } from 'lucide-react';

const ActivityFeed = ({ activities = [] }) => {
  // If activities is undefined or not an array → show empty state
  if (!Array.isArray(activities) || activities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
        <p className="text-sm">No activities to show.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-start gap-3">
            <img
              src={activity.userAvatar || 'https://i.pravatar.cc/40'}
              alt={activity.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.userName}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition">
                  <MoreVertical size={20} />
                </button>
              </div>
              {activity.content && (
                <p className="text-sm text-gray-700 mt-2 pl-1">{activity.content}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
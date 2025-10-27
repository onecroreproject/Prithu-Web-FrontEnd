import React from 'react';

const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent activity</h3>
      <ul className="space-y-3">
        {activities.map((activity, index) => (
          <li key={index} className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-600 rounded-full mt-1.5 flex-shrink-0"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{activity.userName}</span>{' '}
                {activity.action}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentActivity;

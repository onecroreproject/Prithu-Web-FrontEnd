// src/components/aptitude/AptitudeCardComponents/TopPerformersList.jsx
import React from "react";

const TopPerformersList = ({ performers, onViewProfile }) => {
  return (
    <div className="space-y-4">
      {performers.map((performer, index) => (
        <div
          key={performer._id || index}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          onClick={() => onViewProfile(performer.user.userId)}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {index + 1}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">
                {performer.user.name ? `${performer.user.name} ${performer.user.lastName || ""}` : "Anonymous"}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {performer.testName} • Score: <span className="font-semibold text-green-600">{performer.score}%</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Time: <span className="font-medium">{Math.round(performer.timeTaken / 60)}m</span>
            </p>
            <p className="text-xs text-gray-400">
              {new Date(performer.receivedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopPerformersList;
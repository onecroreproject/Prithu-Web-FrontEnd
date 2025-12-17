// src/components/aptitude/AptitudeCardComponents/PerformanceStats.jsx
import React from "react";

const PerformanceStats = ({ performers, recentPerformers }) => {
  const avgScore = performers.length > 0
    ? (performers.reduce((sum, p) => sum + p.score, 0) / performers.length).toFixed(1)
    : 0;

  const avgTime = performers.length > 0
    ? (performers.reduce((sum, p) => sum + p.timeTaken, 0) / performers.length / 60).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Performers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{performers.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Score</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgScore}%</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Time</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{avgTime}m</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tests Taken</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{performers.length}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">Recent Achievements</h3>
        <div className="space-y-3">
          {recentPerformers.slice(0, 3).map((performer) => (
            <div key={performer._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {performer.user.name?.substring(0, 15) || "User"}
                  </p>
                  <p className="text-xs text-gray-500">scored {performer.score}%</p>
                </div>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(performer.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;
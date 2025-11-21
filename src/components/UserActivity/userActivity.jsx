 
import React, { useState } from 'react';
import MyActivity from './myActivity';
import Response from './responce';
 
const UserActivity = () => {
  const [activeTab, setActiveTab] = useState('myActivity');
 
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Activity</h1>
          <div className="inline-flex space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'myActivity'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('myActivity')}
            >
              My Activity
            </button>
            <button
              className={`px-6 py-2 rounded-md font-medium transition-all duration-200 ${
                activeTab === 'response'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab('response')}
            >
              Response
            </button>
          </div>
        </div>
 
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {activeTab === 'myActivity' ? <MyActivity /> : <Response />}
        </div>
      </div>
    </div>
  );
};
 
export default UserActivity;
 
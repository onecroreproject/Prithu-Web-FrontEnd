import React from "react";
import { FiCheckCircle } from "react-icons/fi";

const ProgressSidebar = ({
  tabs,
  activeTab,
  setActiveTab,
  getTabCompletion,
  isEditMode
}) => {
  return (
    <div className="lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-24">
        <h3 className="font-semibold text-gray-900 mb-6">
          {isEditMode ? 'Edit Job Steps' : 'Job Creation Steps'}
        </h3>
        <div className="space-y-2">
          {tabs.map((tab) => {
            const isCompleted = getTabCompletion(tab.id);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  isActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {React.cloneElement(tab.icon, {
                    className: `text-lg ${isActive ? 'text-blue-600' : 'text-gray-500'}`
                  })}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs mt-1">
                    {isCompleted ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <FiCheckCircle className="text-sm" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-gray-400">Pending</span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Progress Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Completion</span>
                <span className="font-medium text-gray-900">
                  {Math.round((tabs.filter(t => getTabCompletion(t.id)).length / tabs.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${(tabs.filter(t => getTabCompletion(t.id)).length / tabs.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="mb-1">Tips:</p>
              <ul className="space-y-1 text-xs">
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Complete all required fields (*)</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Save draft regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <FiCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Preview before publishing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSidebar;

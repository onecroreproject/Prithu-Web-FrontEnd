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
    <div className="lg:w-64">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-32">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Job' : 'Create Job'}
        </h3>
        
        <div className="space-y-2">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            const isCompleted = getTabCompletion(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : isCompleted 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {isCompleted && !isActive ? (
                        <FiCheckCircle className="text-green-600" />
                      ) : (
                        <span>{tab.icon || index + 1}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{tab.label}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {isActive ? 'Active' : isCompleted ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-2">Quick Tips:</p>
            <ul className="space-y-1 text-gray-500">
              <li>• Fill all required fields (*)</li>
              <li>• Be specific in job description</li>
              <li>• Save draft frequently</li>
              <li>• Preview before submitting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSidebar;
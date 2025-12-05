import React from "react";
import {
  MdDescription
} from "react-icons/md";
import { FiPlus, FiX } from "react-icons/fi";

const JobDetailsTab = ({
  formData,
  errors,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Description & Responsibilities</h2>
        <p className="text-gray-600">Describe the job role, responsibilities, and daily tasks.</p>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <div className="flex items-center gap-2">
            <MdDescription className="text-blue-600" />
            Job Description *
          </div>
        </label>
        <textarea
          name="jobDescription"
          value={formData.jobDescription}
          onChange={handleInputChange}
          required
          rows={8}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg resize-none ${
            errors.jobDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Describe the job role, expectations, company culture, and what makes this position exciting..."
        />
        {errors.jobDescription && <p className="text-red-500 text-sm mt-2">{errors.jobDescription}</p>}
        <div className="text-sm text-gray-500 mt-2">
          <p>Tip: Be specific about responsibilities, growth opportunities, and team culture.</p>
        </div>
      </div>

      {/* Responsibilities */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            Key Responsibilities
          </label>
          <button
            type="button"
            onClick={() => addArrayField('responsibilities')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Responsibility
          </button>
        </div>
        <div className="space-y-3">
          {formData.responsibilities.map((responsibility, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={responsibility}
                  onChange={(e) => handleArrayInputChange(index, 'responsibilities', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a key responsibility"
                />
              </div>
              {formData.responsibilities.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'responsibilities')}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            Daily Tasks & Activities
          </label>
          <button
            type="button"
            onClick={() => addArrayField('dailyTasks')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Task
          </button>
        </div>
        <div className="space-y-3">
          {formData.dailyTasks.map((task, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => handleArrayInputChange(index, 'dailyTasks', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a daily task"
                />
              </div>
              {formData.dailyTasks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'dailyTasks')}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Duties */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            Key Duties
          </label>
          <button
            type="button"
            onClick={() => addArrayField('keyDuties')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Duty
          </button>
        </div>
        <div className="space-y-3">
          {formData.keyDuties.map((duty, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={duty}
                  onChange={(e) => handleArrayInputChange(index, 'keyDuties', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a key duty"
                />
              </div>
              {formData.keyDuties.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'keyDuties')}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsTab;

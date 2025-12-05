import React from "react";
import {
  MdPerson,
  MdLocationOn
} from "react-icons/md";
import {
  FiClock,
  FiFolder,
  FiPlus,
  FiX
} from "react-icons/fi";

const HiringInfoTab = ({
  formData,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField
}) => {
  const interviewModes = ["online", "offline"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hiring Information</h2>
        <p className="text-gray-600">Define the hiring process and contact information.</p>
      </div>

      {/* Hiring Information */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          <div className="flex items-center gap-2">
            <MdPerson className="text-blue-600" />
            Hiring Manager Details
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Hiring Manager Name</label>
            <input
              type="text"
              name="hiringManagerName"
              value={formData.hiringManagerName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Enter hiring manager name"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Hiring Manager Email</label>
            <input
              type="email"
              name="hiringManagerEmail"
              value={formData.hiringManagerEmail}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="email@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Hiring Manager Phone</label>
            <input
              type="text"
              name="hiringManagerPhone"
              value={formData.hiringManagerPhone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Interview Mode</label>
            <select
              name="interviewMode"
              value={formData.interviewMode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Mode</option>
              {interviewModes.map(mode => (
                <option key={mode} value={mode} className="capitalize">
                  {mode}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <div className="flex items-center gap-2">
              <MdLocationOn className="text-blue-600" />
              Interview Location
            </div>
          </label>
          <input
            type="text"
            name="interviewLocation"
            value={formData.interviewLocation}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="Enter interview location"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">Interview Instructions</label>
          <textarea
            name="interviewInstructions"
            value={formData.interviewInstructions}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
            placeholder="Provide specific instructions for candidates"
          />
        </div>
      </div>

      {/* Interview Rounds */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiClock className="text-blue-600" />
              Interview Rounds
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('interviewRounds')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Round
          </button>
        </div>
        <div className="space-y-3">
          {formData.interviewRounds.map((round, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={round}
                  onChange={(e) => handleArrayInputChange(index, 'interviewRounds', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter an interview round"
                />
              </div>
              {formData.interviewRounds.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'interviewRounds')}
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

      {/* Hiring Process */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiFolder className="text-blue-600" />
              Hiring Process Steps
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('hiringProcess')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Step
          </button>
        </div>
        <div className="space-y-3">
          {formData.hiringProcess.map((step, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={step}
                  onChange={(e) => handleArrayInputChange(index, 'hiringProcess', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a hiring process step"
                />
              </div>
              {formData.hiringProcess.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'hiringProcess')}
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

export default HiringInfoTab;

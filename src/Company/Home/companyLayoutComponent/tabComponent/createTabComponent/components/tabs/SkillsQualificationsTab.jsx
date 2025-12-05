import React from "react";
import {
  FiTool,
  FiPackage,
  FiHeart,
  FiAward,
  FiPlus,
  FiX
} from "react-icons/fi";
import {
  MdSchool
} from "react-icons/md";

const SkillsQualificationsTab = ({
  formData,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField
}) => {
  const educationLevels = ["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "No Formal Education Required"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Skills & Qualifications</h2>
        <p className="text-gray-600">Define the required skills, qualifications, and experience for this position.</p>
      </div>

      {/* Required Skills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiTool className="text-blue-600" />
              Required Skills
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('requiredSkills')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Skill
          </button>
        </div>
        <div className="space-y-3">
          {formData.requiredSkills.map((skill, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayInputChange(index, 'requiredSkills', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a required skill"
                />
              </div>
              {formData.requiredSkills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'requiredSkills')}
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

      {/* Technical Skills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiPackage className="text-blue-600" />
              Technical Skills
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('technicalSkills')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Technical Skill
          </button>
        </div>
        <div className="space-y-3">
          {formData.technicalSkills.map((skill, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayInputChange(index, 'technicalSkills', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a technical skill"
                />
              </div>
              {formData.technicalSkills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'technicalSkills')}
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

      {/* Soft Skills */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiHeart className="text-blue-600" />
              Soft Skills
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('softSkills')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Soft Skill
          </button>
        </div>
        <div className="space-y-3">
          {formData.softSkills.map((skill, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayInputChange(index, 'softSkills', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a soft skill (communication, teamwork, etc.)"
                />
              </div>
              {formData.softSkills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'softSkills')}
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

      {/* Tools & Technologies */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiTool className="text-blue-600" />
              Tools & Technologies
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('toolsAndTechnologies')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Tool/Technology
          </button>
        </div>
        <div className="space-y-3">
          {formData.toolsAndTechnologies.map((tool, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={tool}
                  onChange={(e) => handleArrayInputChange(index, 'toolsAndTechnologies', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a tool or technology"
                />
              </div>
              {formData.toolsAndTechnologies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'toolsAndTechnologies')}
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

      {/* Qualifications */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          <div className="flex items-center gap-2">
            <MdSchool className="text-blue-600" />
            Qualifications
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Education Level</label>
            <select
              name="educationLevel"
              value={formData.educationLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Education Level</option>
              {educationLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Degree Required</label>
            <input
              type="text"
              name="degreeRequired"
              value={formData.degreeRequired}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Computer Science"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Minimum Experience (years)</label>
            <input
              type="number"
              name="minimumExperience"
              value={formData.minimumExperience}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Maximum Experience (years)</label>
            <input
              type="number"
              name="maximumExperience"
              value={formData.maximumExperience}
              onChange={handleInputChange}
              min="0"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            name="freshersAllowed"
            checked={formData.freshersAllowed}
            onChange={handleInputChange}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            id="freshersAllowed"
          />
          <label htmlFor="freshersAllowed" className="ml-3 text-gray-700">
            Freshers Allowed
          </label>
        </div>

        {/* Certifications Required */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-900">
              <div className="flex items-center gap-2">
                <FiAward className="text-blue-600" />
                Certifications Required
              </div>
            </label>
            <button
              type="button"
              onClick={() => addArrayField('certificationRequired')}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <FiPlus />
              Add Certification
            </button>
          </div>
          <div className="space-y-3">
            {formData.certificationRequired.map((cert, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleArrayInputChange(index, 'certificationRequired', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter a certification"
                  />
                </div>
                {formData.certificationRequired.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayField(index, 'certificationRequired')}
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
    </div>
  );
};

export default SkillsQualificationsTab;

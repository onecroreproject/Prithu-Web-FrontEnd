import React from "react";
import {
  FiBriefcase,
  FiMapPin,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";
import { MdWork } from "react-icons/md";

const BasicInfoTab = ({
  formData,
  errors,
  handleInputChange,
  categorySearch,
  setCategorySearch,
  showCategoryDropdown,
  setShowCategoryDropdown,
  roleSearch,
  setRoleSearch,
  showRoleDropdown,
  setShowRoleDropdown,
  filteredCategories,
  filteredRoles,
  categoryRef,
  roleRef
}) => {
  const employmentTypes = ["full-time", "part-time", "contract", "internship", "freelance"];
  const workModes = ["onsite", "remote", "hybrid"];
  const shiftTypes = ["day", "night", "rotational", "flexible"];
  const urgencyLevels = ["immediate", "15 days", "30 days"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Job Information</h2>
        <p className="text-gray-600">Start by providing the basic details about the job position.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center gap-2">
                <FiBriefcase className="text-blue-600" />
                Job Title *
              </div>
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
              className={`w-full px-4 py-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                errors.jobTitle ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., Senior Frontend Developer"
            />
            {errors.jobTitle && <p className="text-red-500 text-sm mt-2">{errors.jobTitle}</p>}
          </div>

          {/* Job Category & Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Category */}
            <div className="relative" ref={categoryRef}>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Job Category *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => {
                    setCategorySearch(e.target.value);
                    setShowCategoryDropdown(true);
                  }}
                  onFocus={() => setShowCategoryDropdown(true)}
                  placeholder="Search category..."
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10 ${
                    errors.jobCategory ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiSearch />
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCategoryDropdown ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
              
              {/* Category Dropdown */}
              {showCategoryDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCategories.length > 0 ? (
                    <div className="py-1">
                      {filteredCategories.map((category, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            handleInputChange({ 
                              target: { name: 'jobCategory', value: category } 
                            });
                            setCategorySearch('');
                            setShowCategoryDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors hover:text-blue-700"
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-gray-500">No categories found</div>
                  )}
                </div>
              )}
              
              {errors.jobCategory && (
                <p className="text-red-500 text-sm mt-2">{errors.jobCategory}</p>
              )}
              
              {formData.jobCategory && !showCategoryDropdown && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm">
                    {formData.jobCategory}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange({ 
                          target: { name: 'jobCategory', value: '' } 
                        });
                        setCategorySearch('');
                      }}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </span>
                </div>
              )}
            </div>

            {/* Job Role */}
            <div className="relative" ref={roleRef}>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Job Role
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={roleSearch}
                  onChange={(e) => {
                    setRoleSearch(e.target.value);
                    setShowRoleDropdown(true);
                  }}
                  onFocus={() => setShowRoleDropdown(true)}
                  placeholder="Search job role..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <FiSearch />
                </div>
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showRoleDropdown ? <FiChevronUp /> : <FiChevronDown />}
                </button>
              </div>
              
              {/* Role Dropdown */}
              {showRoleDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredRoles.length > 0 ? (
                    <div className="py-1">
                      {filteredRoles.map((role, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            handleInputChange({ 
                              target: { name: 'jobRole', value: role.value } 
                            });
                            setRoleSearch('');
                            setShowRoleDropdown(false);
                          }}
                          className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors hover:text-blue-700"
                        >
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-gray-500">{role.category}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-3 text-gray-500">No roles found</div>
                  )}
                </div>
              )}
              
              {formData.jobRole && !showRoleDropdown && (
                <div className="mt-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm">
                    {formData.jobRole}
                    <button
                      type="button"
                      onClick={() => {
                        handleInputChange({ 
                          target: { name: 'jobRole', value: '' } 
                        });
                        setRoleSearch('');
                      }}
                      className="text-green-500 hover:text-green-700"
                    >
                      <FiX className="text-sm" />
                    </button>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Employment Type & Work Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <div className="flex items-center gap-2">
                  <MdWork className="text-blue-600" />
                  Employment Type *
                </div>
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.employmentType ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Type</option>
                {employmentTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type.replace('-', ' ')}
                  </option>
                ))}
              </select>
              {errors.employmentType && <p className="text-red-500 text-sm mt-2">{errors.employmentType}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                <div className="flex items-center gap-2">
                  <FiBriefcase className="text-blue-600" />
                  Work Mode *
                </div>
              </label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.workMode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select Mode</option>
                {workModes.map(mode => (
                  <option key={mode} value={mode} className="capitalize">
                    {mode}
                  </option>
                ))}
              </select>
              {errors.workMode && <p className="text-red-500 text-sm mt-2">{errors.workMode}</p>}
            </div>
          </div>

          {/* Shift Type & Openings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Shift Type
              </label>
              <select
                name="shiftType"
                value={formData.shiftType}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="">Select Shift</option>
                {shiftTypes.map(shift => (
                  <option key={shift} value={shift} className="capitalize">
                    {shift}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Openings Count *
              </label>
              <input
                type="number"
                name="openingsCount"
                value={formData.openingsCount}
                onChange={handleInputChange}
                min="1"
                required
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.openingsCount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.openingsCount && <p className="text-red-500 text-sm mt-2">{errors.openingsCount}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Location Information */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-blue-600" />
                Location Details
              </div>
            </label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="Pincode"
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              <textarea
                name="fullAddress"
                value={formData.fullAddress}
                onChange={handleInputChange}
                rows={3}
                placeholder="Full Address"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
              />
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="remoteEligibility"
                  checked={formData.remoteEligibility}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  id="remoteEligibility"
                />
                <label htmlFor="remoteEligibility" className="ml-3 text-gray-700">
                  Remote work eligible
                </label>
              </div>
            </div>
          </div>

          {/* Urgency Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Urgency Level
            </label>
            <select
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select Urgency</option>
              {urgencyLevels.map(level => (
                <option key={level} value={level} className="capitalize">
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoTab;
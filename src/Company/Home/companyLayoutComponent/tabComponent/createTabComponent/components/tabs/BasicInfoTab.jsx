import React from "react";
import {
  FiBriefcase,
  FiMapPin,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiLoader
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
  roleRef,
  employmentTypes,
  workModes,
  shiftTypes,
  urgencyLevels,
  countries = [],
  states = [],
  cities = [],
  areas = [],
  pincodes = [],
  loading = {
    states: false,
    cities: false,
    areas: false,
    pincodes: false
  }
}) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Job Information</h2>
        <p className="text-gray-600">Start by providing the basic details about the job position.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN */}
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

        {/* RIGHT COLUMN - Location Selector */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center gap-2">
                <FiMapPin className="text-blue-600" />
                Location Details
              </div>
            </label>
            <div className="space-y-4">
              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none ${
                      errors.country ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Country</option>
                    {countries.map((country) => (
                      <option key={country.iso3 || country.name} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    <FiChevronDown />
                  </div>
                </div>
                {errors.country && <p className="text-red-500 text-sm mt-2">{errors.country}</p>}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                <div className="relative">
                  <select
                    name="state"
                    value={formData.state || ''}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.country || loading.states}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none ${
                      !formData.country ? 'bg-gray-100 cursor-not-allowed' : errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {loading.states ? 'Loading states...' : formData.country ? 'Select State' : 'Select country first'}
                    </option>
                    {states.map((state) => (
                      <option key={state.iso2 || state.name} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    {loading.states ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiChevronDown />
                    )}
                  </div>
                </div>
                {errors.state && <p className="text-red-500 text-sm mt-2">{errors.state}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <div className="relative">
                  <select
                    name="city"
                    value={formData.city || ''}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.state || loading.cities}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none ${
                      !formData.state ? 'bg-gray-100 cursor-not-allowed' : errors.city ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {loading.cities ? 'Loading cities...' : formData.state ? 'Select City' : 'Select state first'}
                    </option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    {loading.cities ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiChevronDown />
                    )}
                  </div>
                </div>
                {errors.city && <p className="text-red-500 text-sm mt-2">{errors.city}</p>}
              </div>

              {/* Area/Village (India specific) */}
              {formData.country === 'India' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area/Village
                  </label>
                  <div className="relative">
                    <select
                      name="area"
                      value={formData.area || ''}
                      onChange={handleInputChange}
                      disabled={!formData.city || loading.areas}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none ${
                        !formData.city ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300'
                      }`}
                    >
                      <option value="">
                        {loading.areas ? 'Loading areas...' : formData.city ? 'Select Area' : 'Select city first'}
                      </option>
                      {areas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      {loading.areas ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode/ZIP Code *
                </label>
                {formData.country === 'India' ? (
                  <div className="relative">
                    <select
                      name="pincode"
                      value={formData.pincode || ''}
                      onChange={handleInputChange}
                      required
                      disabled={loading.pincodes}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none ${
                        errors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">
                        {loading.pincodes ? 'Loading pincodes...' : 'Select Pincode'}
                      </option>
                      {pincodes.map((pincode) => (
                        <option key={pincode} value={pincode}>
                          {pincode}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                      {loading.pincodes ? (
                        <FiLoader className="animate-spin" />
                      ) : (
                        <FiChevronDown />
                      )}
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode || ''}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      errors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter ZIP/Pincode"
                  />
                )}
                {errors.pincode && <p className="text-red-500 text-sm mt-2">{errors.pincode}</p>}
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Address
                </label>
                <textarea
                  name="fullAddress"
                  value={formData.fullAddress || ''}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Street address, building, landmark, etc."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Remote Eligibility */}
              <div className="flex items-center pt-2">
                <input
                  type="checkbox"
                  name="remoteEligibility"
                  checked={formData.remoteEligibility || false}
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
              value={formData.urgencyLevel || ''}
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
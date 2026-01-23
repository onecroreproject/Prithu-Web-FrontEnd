import React, { useState, useEffect } from "react";
import {
  FiBriefcase,
  FiMapPin,
  FiSearch,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiCalendar,
  FiClock,
  FiPlus,
} from "react-icons/fi";
import { MdWork } from "react-icons/md";

const BasicInfoTab = ({
  formData,
  errors,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField,
  industrySearch,
  setIndustrySearch,
  showIndustryDropdown,
  setShowIndustryDropdown,
  roleSearch,
  setRoleSearch,
  showRoleDropdown,
  setShowRoleDropdown,
  filteredIndustries,
  filteredRoles,
  industryRef,
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
  },
  setErrors
}) => {
  // State for area/village input type
  const [areaInputType, setAreaInputType] = useState('select');
  const [pincodeInputType, setPincodeInputType] = useState('select');
  const [showDateValidation, setShowDateValidation] = useState(false);
  const [showContractDuration, setShowContractDuration] = useState(false);
  
  // State for role tag input
  const [roleInput, setRoleInput] = useState("");

  // Determine if area/village should be shown
  const shouldShowArea = formData.country && formData.state && formData.city;

  // Determine if pincode should be a dropdown
  const isIndia = formData.country?.toLowerCase() === 'india';
  const showPincodeDropdown = isIndia && formData.area && pincodes.length > 0;

  // Fallback implementations for array functions if not provided
  const safeHandleArrayInputChange = handleArrayInputChange || ((index, fieldName, value) => {
    console.warn(`handleArrayInputChange not implemented for ${fieldName}[${index}]`);
  });

  const safeAddArrayField = addArrayField || ((fieldName) => {
    console.warn(`addArrayField not implemented for ${fieldName}`);
  });

  const safeRemoveArrayField = removeArrayField || ((index, fieldName) => {
    console.warn(`removeArrayField not implemented for ${fieldName}[${index}]`);
  });

  useEffect(() => {
    if (formData.employmentType === 'contract') {
      setShowContractDuration(true);
    } else {
      // Clear contract duration when not contract
      if (formData.contractDuration || formData.contractDurationUnit !== 'months') {
        handleInputChange({ target: { name: 'contractDuration', value: '' } });
        handleInputChange({ target: { name: 'contractDurationUnit', value: 'months' } });
      }
      setShowContractDuration(false);
    }
  }, [formData.employmentType]);

  // Reset area type when city changes
  useEffect(() => {
    if (!formData.city) {
      setAreaInputType('select');
      setPincodeInputType('select');
    }
  }, [formData.city]);

  // Reset pincode type when area changes
  useEffect(() => {
    if (!formData.area) {
      setPincodeInputType('select');
    }
  }, [formData.area]);

  // Validate dates when they change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day

      if (startDate > endDate) {
        if (setErrors) {
          setErrors(prev => ({
            ...prev,
            endDate: 'End date must be after start date'
          }));
        }
        setShowDateValidation(true);
      } else if (startDate < today) {
        if (setErrors) {
          setErrors(prev => ({
            ...prev,
            startDate: 'Start date cannot be in the past'
          }));
        }
        setShowDateValidation(true);
      } else if (endDate < today) {
        if (setErrors) {
          setErrors(prev => ({
            ...prev,
            endDate: 'End date cannot be in the past'
          }));
        }
        setShowDateValidation(true);
      } else {
        // Clear date errors if validation passes
        if (setErrors) {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.startDate;
            delete newErrors.endDate;
            return newErrors;
          });
        }
        setShowDateValidation(false);
      }
    }
  }, [formData.startDate, formData.endDate, setErrors]);

  // Handle area input type toggle
  const handleAreaInputTypeToggle = (type) => {
    setAreaInputType(type);

    if (type === "manual") {
      // Clear selected area
      handleInputChange({ target: { name: "area", value: "" } });

      // Force pincode to manual when area is manual
      setPincodeInputType("manual");
      handleInputChange({ target: { name: "pincode", value: "" } });
    }

    if (type === "select") {
      // Reset pincode mode when going back to select
      setPincodeInputType("select");
      handleInputChange({ target: { name: "pincode", value: "" } });
    }
  };

  // Handle pincode input type toggle
  const handlePincodeInputTypeToggle = (type) => {
    setPincodeInputType(type);
    if (type === 'manual' && formData.pincode === '') {
      // Clear any previous pincode value when switching to manual
      handleInputChange({ target: { name: 'pincode', value: '' } });
    }
  };

  // Handle adding a role from dropdown
  const handleAddRole = (role) => {
    const roleValue = role.value || role;
    
    // Ensure jobRole is an array (using correct field name)
    const jobRoles = formData.jobRole || [];
    
    // Check if role already exists and limit to 5
    if (jobRoles.length >= 5) {
      alert('Maximum 5 job roles allowed');
      return;
    }
    
    if (!jobRoles.some(r => r === roleValue)) {
      // First add an empty field, then update it immediately
      const currentIndex = jobRoles.length;
      safeAddArrayField('jobRole');
      // Use handleArrayInputChange to set the value
      safeHandleArrayInputChange(currentIndex, 'jobRole', roleValue);
    }
    
    setRoleSearch('');
    setShowRoleDropdown(false);
  };

  // Handle adding a custom role from input
  const handleAddCustomRole = () => {
    if (roleInput.trim()) {
      // Ensure jobRole is an array (using correct field name)
      const jobRoles = formData.jobRole || [];
      
      // Check if role already exists and limit to 5
      if (jobRoles.length >= 5) {
        alert('Maximum 5 job roles allowed');
        return;
      }
      
      const newRole = roleInput.trim();
      if (!jobRoles.some(r => r === newRole)) {
        // First add an empty field, then update it immediately
        const currentIndex = jobRoles.length;
        safeAddArrayField('jobRole');
        // Use handleArrayInputChange to set the value
        safeHandleArrayInputChange(currentIndex, 'jobRole', newRole);
      }
      setRoleInput("");
    }
  };

  // Handle key press for role input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCustomRole();
    }
  };

  // Calculate min and max dates for date inputs
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const maxEndDate = new Date(today);
  maxEndDate.setFullYear(maxEndDate.getFullYear() + 1); // Max 1 year from today

  // Format dates for min/max attributes
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Render role tags
  const renderRoleTags = () => {
    // Ensure jobRole is an array (using correct field name)
    const jobRoles = formData.jobRole || [];
    
    return (
      <div className="mt-3">
        <div className="flex flex-wrap gap-2 mb-3">
          {jobRoles.map((role, index) => {
            if (!role || role.trim() === "") return null;
            
            return (
              <div
                key={index}
                className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200"
              >
                <span className="text-sm font-medium">{role}</span>
                <button
                  type="button"
                  onClick={() => safeRemoveArrayField(index, 'jobRole')}
                  className="text-green-700 hover:text-green-900 hover:bg-green-100 rounded-full p-0.5"
                  title="Remove"
                >
                  <FiX size={14} />
                </button>
              </div>
            );
          })}
        </div>
        
        {jobRoles.length > 0 && (
          <p className="text-xs text-gray-500">
            {jobRoles.length}/5 roles added
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
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

      {/* Job Posting Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              Post Start Date *
            </div>
          </label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate || ''}
            onChange={handleInputChange}
            required
            min={formatDateForInput(today)}
            max={formatDateForInput(maxEndDate)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.startDate && (
            <p className="text-red-500 text-sm mt-2">{errors.startDate}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Date when job becomes visible
          </p>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            <div className="flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              Post End Date *
            </div>
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate || ''}
            onChange={handleInputChange}
            required
            min={formData.startDate ? formatDateForInput(new Date(formData.startDate)) : formatDateForInput(tomorrow)}
            max={formatDateForInput(maxEndDate)}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
              errors.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-2">{errors.endDate}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Date when job stops being visible
          </p>
        </div>
      </div>

      {/* Show duration info if dates are selected */}
      {(formData.startDate || formData.endDate) && !showDateValidation && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-blue-600" />
            <div>
              <p className="font-medium text-blue-800">Posting Duration</p>
              <p className="text-sm text-blue-600">
                Job will be visible from {formData.startDate ? new Date(formData.startDate).toLocaleDateString() : 'start date'}
                {' to '}
                {formData.endDate ? new Date(formData.endDate).toLocaleDateString() : 'end date'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show error message if dates are invalid */}
      {showDateValidation && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <FiCalendar className="text-red-600" />
            <div>
              <p className="font-medium text-red-800">Invalid Date Range</p>
              <p className="text-sm text-red-600">
                Please ensure start date is today or later, and end date is after start date.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Job Industry */}
      <div className="relative" ref={industryRef}>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Industry *
        </label>
        <div className="relative">
          <input
            type="text"
            value={industrySearch}
            onChange={(e) => {
              setIndustrySearch(e.target.value);
              setShowIndustryDropdown(true);
            }}
            onFocus={() => setShowIndustryDropdown(true)}
            placeholder="Search industry..."
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10 ${
              errors.jobIndustry ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch />
          </div>
          <button
            type="button"
            onClick={() => setShowIndustryDropdown(!showIndustryDropdown)}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showIndustryDropdown ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
        
        {showIndustryDropdown && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredIndustries.length > 0 ? (
              <div className="py-1">
                {filteredIndustries.map((industry, index) => (
                  <div
                    key={industry.industryId || index}
                    onClick={() => {
                      handleInputChange({ 
                        target: { name: 'jobIndustry', value: industry.industryName } 
                      });
                      setIndustrySearch('');
                      setShowIndustryDropdown(false);
                    }}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors hover:text-blue-700"
                  >
                    {industry.industryName}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-500">No industries found</div>
            )}
          </div>
        )}
        
        {errors.jobIndustry && (
          <p className="text-red-500 text-sm mt-2">{errors.jobIndustry}</p>
        )}
        
        {formData.jobIndustry && !showIndustryDropdown && (
          <div className="mt-2">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm">
              {formData.jobIndustry}
              <button
                type="button"
                onClick={() => {
                  handleInputChange({ 
                    target: { name: 'jobIndustry', value: '' } 
                  });
                  setIndustrySearch('');
                }}
                className="text-blue-500 hover:text-blue-700"
              >
                <FiX className="text-sm" />
              </button>
            </span>
          </div>
        )}
      </div>

      {/* Job Role - Multiple Selection */}
      <div className="relative" ref={roleRef}>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Job Roles * (Max 5)
        </label>
        
        {/* Show selected roles as tags */}
        {renderRoleTags()}
        
        {/* Search and add from dropdown */}
        <div className="relative mb-4">
          <input
            type="text"
            value={roleSearch}
            onChange={(e) => {
              setRoleSearch(e.target.value);
              setShowRoleDropdown(true);
            }}
            onFocus={() => setShowRoleDropdown(true)}
            placeholder={formData.jobIndustry ? "Search roles in this industry..." : "Select industry first"}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all pr-10 ${
              !formData.jobIndustry ? 'bg-gray-100 cursor-not-allowed' : errors.jobRole ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}
            disabled={!formData.jobIndustry}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <FiSearch />
          </div>
          <button
            type="button"
            onClick={() => formData.jobIndustry && setShowRoleDropdown(!showRoleDropdown)}
            className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={!formData.jobIndustry}
          >
            {showRoleDropdown ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
        
        {/* Role Dropdown */}
        {showRoleDropdown && formData.jobIndustry && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredRoles.length > 0 ? (
              <div className="py-1">
                {filteredRoles.map((role, index) => {
                  const jobRoles = formData.jobRole || [];
                  const isAlreadyAdded = jobRoles.includes(role.value);
                  
                  return (
                    <div
                      key={index}
                      onClick={() => handleAddRole(role)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors hover:text-blue-700 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{role.label}</div>
                        <div className="text-xs text-gray-500">{role.industry}</div>
                      </div>
                      {isAlreadyAdded && (
                        <span className="text-xs text-green-600 font-medium">Added</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="px-4 py-3 text-gray-500">No roles found</div>
            )}
          </div>
        )}
        
        {/* Manual Role Input */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Or enter custom role manually"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                !formData.jobIndustry ? 'bg-gray-100 cursor-not-allowed' : errors.jobRole ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={!formData.jobIndustry || (formData.jobRole || []).length >= 5}
            />
          </div>
          <button
            type="button"
            onClick={handleAddCustomRole}
            disabled={!formData.jobIndustry || (formData.jobRole || []).length >= 5 || !roleInput.trim()}
            className={`flex items-center gap-2 px-4 py-3 border rounded-xl transition-colors whitespace-nowrap ${
              !formData.jobIndustry || (formData.jobRole || []).length >= 5 || !roleInput.trim()
                ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-700 border-blue-600 hover:bg-blue-50'
            }`}
          >
            <FiPlus />
            Add
          </button>
        </div>
        
        {errors.jobRole && <p className="text-red-500 text-sm mt-2">{errors.jobRole}</p>}
        
        {!formData.jobIndustry && (
          <p className="text-xs text-gray-500 mt-2">Please select an industry first</p>
        )}
        
        {(formData.jobRole || []).length >= 5 && (
          <p className="text-xs text-red-500 mt-2">Maximum 5 roles reached. Remove one to add more.</p>
        )}
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

      {/* Contract Duration - Show only when employment type is contract */}
      {formData.employmentType === 'contract' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              <div className="flex items-center gap-2">
                <FiClock className="text-blue-600" />
                Contract Duration *
              </div>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="contractDuration"
                value={formData.contractDuration}
                onChange={handleInputChange}
                min="1"
                required={formData.employmentType === 'contract'}
                className={`w-2/3 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.contractDuration ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., 6"
              />
              <select
                name="contractDurationUnit"
                value={formData.contractDurationUnit}
                onChange={handleInputChange}
                required={formData.employmentType === 'contract'}
                className={`w-1/3 px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.contractDurationUnit ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>
            {errors.contractDuration && (
              <p className="text-red-500 text-sm mt-2">{errors.contractDuration}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              How long is this contract position?
            </p>
          </div>
        </div>
      )}

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

      {/* Location Details */}
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

          {/* Area/Village */}
          {shouldShowArea && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Area/Village/Locality
                </label>
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleAreaInputTypeToggle('select')}
                    className={`px-2 py-1 rounded ${areaInputType === 'select' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    From List
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAreaInputTypeToggle('manual')}
                    className={`px-2 py-1 rounded ${areaInputType === 'manual' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    Manual Entry
                  </button>
                </div>
              </div>

              {areaInputType === 'select' ? (
                <div className="relative">
                  <select
                    name="area"
                    value={formData.area || ''}
                    onChange={handleInputChange}
                    disabled={loading.areas}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none ${
                      'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {loading.areas ? 'Loading areas...' : areas.length > 0 ? 'Select Area' : 'No areas found'}
                    </option>
                    {areas.length > 0 ? (
                      areas.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No areas available for this city
                      </option>
                    )}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                    {loading.areas ? (
                      <FiLoader className="animate-spin" />
                    ) : (
                      <FiChevronDown />
                    )}
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  name="area"
                  value={formData.area || ''}
                  onChange={handleInputChange}
                  placeholder="Enter Area/Village/Locality"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              )}
              
              {areas.length === 0 && areaInputType === 'select' && !loading.areas && (
                <p className="text-xs text-gray-500 mt-1">
                  No areas found in our database. Try "Manual Entry" or proceed without area.
                </p>
              )}
            </div>
          )}

          {/* Pincode */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pincode/ZIP Code *
              </label>
              {showPincodeDropdown && (
                <div className="flex gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePincodeInputTypeToggle("select")}
                    disabled={areaInputType === "manual"}
                    className={`px-2 py-1 rounded ${
                      pincodeInputType === "select"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    } ${areaInputType === "manual" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    From List
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePincodeInputTypeToggle("manual")}
                    className={`px-2 py-1 rounded ${
                      pincodeInputType === "manual"
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Manual Entry
                  </button>
                </div>
              )}
            </div>

            {showPincodeDropdown && pincodeInputType === 'select' ? (
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
                    {loading.pincodes ? 'Loading pincodes...' : pincodes.length > 0 ? 'Select Pincode' : 'No pincodes found'}
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
                placeholder="Enter ZIP/Pincode"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                  errors.pincode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            )}
            {errors.pincode && <p className="text-red-500 text-sm mt-2">{errors.pincode}</p>}
            
            {!isIndia && (
              <p className="text-xs text-gray-500 mt-1">
                Enter the postal code for your location.
              </p>
            )}
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
  );
};

export default BasicInfoTab;
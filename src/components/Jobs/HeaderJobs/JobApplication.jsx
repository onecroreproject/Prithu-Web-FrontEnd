import React, { useState, useEffect } from "react";
import jobData from "../../../JsonFile/jobSelection.json"; // Import the JSON file
import { createOrUpdateJobPost } from "../../../Service/jobservices";

const JobPostingForm = ({ job, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    // Basic Job Info
    jobTitle: '',
    jobRole: '',
    jobCategory: '',
    jobSubCategory: '',
    employmentType: '',
    workMode: '',
    shiftType: '',
    openingsCount: 1,
    urgencyLevel: '',

    // Location
    city: '',
    state: '',
    country: '',
    pincode: '',
    fullAddress: '',
    remoteEligibility: false,
    latitude: '',
    longitude: '',

    // Job Description
    jobDescription: '',
    responsibilities: [''],
    dailyTasks: [''],
    keyDuties: [''],

    // Skills
    requiredSkills: [''],
    preferredSkills: [''],
    technicalSkills: [''],
    softSkills: [''],
    toolsAndTechnologies: [''],

    // Qualification
    educationLevel: '',
    degreeRequired: '',
    certificationRequired: [''],
    minimumExperience: 0,
    maximumExperience: 0,
    freshersAllowed: false,

    // Salary
    salaryType: 'monthly',
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'INR',
    salaryVisibility: 'public',
    benefits: [''],
    perks: [''],
    incentives: '',
    bonuses: '',

    // Hiring Information
    hiringManagerName: '',
    hiringManagerEmail: '',
    hiringManagerPhone: '',
    interviewMode: '',
    interviewLocation: '',
    interviewRounds: [''],
    hiringProcess: [''],
    interviewInstructions: '',

    // Timing & Duration
    startDate: '',
    endDate: '',
    contractDuration: '',
    jobTimings: '',
    workingHours: '',
    workingDays: '',
    holidaysType: '',

    // Documents Required
    resumeRequired: true,
    coverLetterRequired: false,
    documentsRequired: [''],

    // SEO & Keywords
    tags: [''],
    skillKeywords: [''],
    keywordSearch: [''],

    // Status
    status: 'draft',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobImage, setJobImage] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Get all categories from JSON
  const allCategories = jobData.mainCategories.flatMap(category => category.items);
  const jobRoles = jobData.jobRoles;

  // Initialize form with job data if editing
  useEffect(() => {
    if (job) {
      setFormData(prev => ({
        ...prev,
        ...job,
        // Convert arrays to ensure they're properly formatted
        responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
        dailyTasks: job.dailyTasks?.length ? job.dailyTasks : [''],
        keyDuties: job.keyDuties?.length ? job.keyDuties : [''],
        requiredSkills: job.requiredSkills?.length ? job.requiredSkills : [''],
        preferredSkills: job.preferredSkills?.length ? job.preferredSkills : [''],
        technicalSkills: job.technicalSkills?.length ? job.technicalSkills : [''],
        softSkills: job.softSkills?.length ? job.softSkills : [''],
        toolsAndTechnologies: job.toolsAndTechnologies?.length ? job.toolsAndTechnologies : [''],
        certificationRequired: job.certificationRequired?.length ? job.certificationRequired : [''],
        benefits: job.benefits?.length ? job.benefits : [''],
        perks: job.perks?.length ? job.perks : [''],
        interviewRounds: job.interviewRounds?.length ? job.interviewRounds : [''],
        hiringProcess: job.hiringProcess?.length ? job.hiringProcess : [''],
        documentsRequired: job.documentsRequired?.length ? job.documentsRequired : [''],
        tags: job.tags?.length ? job.tags : [''],
        skillKeywords: job.skillKeywords?.length ? job.skillKeywords : [''],
        keywordSearch: job.keywordSearch?.length ? job.keywordSearch : [''],
        // Convert dates to input format
        startDate: job.startDate ? new Date(job.startDate).toISOString().split('T')[0] : '',
        endDate: job.endDate ? new Date(job.endDate).toISOString().split('T')[0] : '',
      }));
    }
  }, [job]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayField = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, jobImage: 'File size must be less than 5MB' }));
        return;
      }
      setJobImage(file);
      if (errors.jobImage) {
        setErrors(prev => ({ ...prev, jobImage: '' }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.jobTitle?.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.jobCategory?.trim()) newErrors.jobCategory = 'Job category is required';
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
    if (!formData.workMode) newErrors.workMode = 'Work mode is required';
    if (!formData.jobDescription?.trim()) newErrors.jobDescription = 'Job description is required';
    if (formData.openingsCount < 1) newErrors.openingsCount = 'At least 1 opening is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = new FormData();
      
      // Append all form data
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          formData[key].forEach((item, index) => {
            if (item.trim()) {
              submissionData.append(`${key}[${index}]`, item);
            }
          });
        } else if (formData[key] !== null && formData[key] !== undefined) {
          submissionData.append(key, formData[key]);
        }
      });

      // Append job image if exists
      if (jobImage) {
        submissionData.append('jobImage', jobImage);
      }

      // If editing, include jobId
      if (job?._id) {
        submissionData.append('jobId', job._id);
      }

      const result = await createOrUpdateJobPost(submissionData);

      if (result.success) {
        console.log('Job saved successfully:', result);
        alert(`Job ${job ? 'updated' : 'created'} successfully!`);
        onSave(result.job || result.jobId);
        onClose();
      } else {
        throw new Error(result.message || 'Save failed');
      }
    } catch (error) {
      console.error('Error saving job:', error);
      alert(`Failed to ${job ? 'update' : 'create'} job. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Constants for dropdowns
  const employmentTypes = ["full-time", "part-time", "contract", "internship", "freelance"];
  const workModes = ["onsite", "remote", "hybrid"];
  const shiftTypes = ["day", "night", "rotational", "flexible"];
  const urgencyLevels = ["immediate", "15 days", "30 days"];
  const salaryTypes = ["monthly", "yearly", "hourly"];
  const salaryVisibilities = ["public", "private", "restricted"];
  const interviewModes = ["online", "offline"];
  const statusOptions = ["draft", "active", "inactive", "expired", "closed"];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📋' },
    { id: 'details', label: 'Job Details', icon: '📝' },
    { id: 'skills', label: 'Skills & Quals', icon: '🎯' },
    { id: 'salary', label: 'Salary & Benefits', icon: '💰' },
    { id: 'hiring', label: 'Hiring Process', icon: '👥' },
    { id: 'additional', label: 'Additional', icon: '⚙️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            {/* Basic Job Information */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Job Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.jobTitle ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Senior Frontend Developer"
                  />
                  {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Category *
                  </label>
                  <select
                    name="jobCategory"
                    value={formData.jobCategory}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.jobCategory ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {allCategories.map((category, index) => (
                      <option key={index} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.jobCategory && <p className="text-red-500 text-xs mt-1">{errors.jobCategory}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Role
                  </label>
                  <select
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Role</option>
                    {jobRoles.map((roleCategory, index) => (
                      <optgroup key={index} label={roleCategory.category}>
                        {roleCategory.jobrole.map((role, roleIndex) => (
                          <option key={roleIndex} value={role.join(' ')}>
                            {role.join(' ')}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employment Type *
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.employmentType ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Type</option>
                    {employmentTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace('-', ' ').toUpperCase()}
                      </option>
                    ))}
                  </select>
                  {errors.employmentType && <p className="text-red-500 text-xs mt-1">{errors.employmentType}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode *
                  </label>
                  <select
                    name="workMode"
                    value={formData.workMode}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.workMode ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Mode</option>
                    {workModes.map(mode => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.workMode && <p className="text-red-500 text-xs mt-1">{errors.workMode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Type
                  </label>
                  <select
                    name="shiftType"
                    value={formData.shiftType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Shift</option>
                    {shiftTypes.map(shift => (
                      <option key={shift} value={shift}>
                        {shift.charAt(0).toUpperCase() + shift.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Openings Count *
                  </label>
                  <input
                    type="number"
                    name="openingsCount"
                    value={formData.openingsCount}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.openingsCount ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.openingsCount && <p className="text-red-500 text-xs mt-1">{errors.openingsCount}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    name="urgencyLevel"
                    value={formData.urgencyLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Urgency</option>
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                  <textarea
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="remoteEligibility"
                    checked={formData.remoteEligibility}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Remote Eligible
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-6">
            {/* Job Description */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Description *</h3>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                required
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.jobDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Describe the job role, expectations, and what makes this position exciting..."
              />
              {errors.jobDescription && <p className="text-red-500 text-xs mt-1">{errors.jobDescription}</p>}
            </div>

            {/* Responsibilities */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Responsibilities</h3>
              {formData.responsibilities.map((responsibility, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={responsibility}
                    onChange={(e) => handleArrayInputChange(index, 'responsibilities', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a responsibility"
                  />
                  {formData.responsibilities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'responsibilities')}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('responsibilities')}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
              >
                + Add Responsibility
              </button>
            </div>

            {/* Daily Tasks */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Tasks</h3>
              {formData.dailyTasks.map((task, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => handleArrayInputChange(index, 'dailyTasks', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a daily task"
                  />
                  {formData.dailyTasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'dailyTasks')}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('dailyTasks')}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
              >
                + Add Daily Task
              </button>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className="space-y-6">
            {/* Required Skills */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
              {formData.requiredSkills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleArrayInputChange(index, 'requiredSkills', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a required skill"
                  />
                  {formData.requiredSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'requiredSkills')}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('requiredSkills')}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
              >
                + Add Skill
              </button>
            </div>

            {/* Technical Skills */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Skills</h3>
              {formData.technicalSkills.map((skill, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleArrayInputChange(index, 'technicalSkills', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a technical skill"
                  />
                  {formData.technicalSkills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'technicalSkills')}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('technicalSkills')}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
              >
                + Add Technical Skill
              </button>
            </div>

            {/* Qualifications */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Qualifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
                  <input
                    type="text"
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Bachelor's Degree"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Degree Required</label>
                  <input
                    type="text"
                    name="degreeRequired"
                    value={formData.degreeRequired}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Experience (years)</label>
                  <input
                    type="number"
                    name="minimumExperience"
                    value={formData.minimumExperience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Experience (years)</label>
                  <input
                    type="number"
                    name="maximumExperience"
                    value={formData.maximumExperience}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="freshersAllowed"
                  checked={formData.freshersAllowed}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Freshers Allowed
                </label>
              </div>
              <h4 className="font-medium text-gray-700 mb-2">Certifications Required</h4>
              {formData.certificationRequired.map((cert, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => handleArrayInputChange(index, 'certificationRequired', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a certification"
                  />
                  {formData.certificationRequired.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'certificationRequired')}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('certificationRequired')}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
              >
                + Add Certification
              </button>
            </div>
          </div>
        );

      case 'salary':
        return (
          <div className="space-y-6">
            {/* Salary Information */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type</label>
                  <select
                    name="salaryType"
                    value={formData.salaryType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {salaryTypes.map(type => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Visibility</label>
                  <select
                    name="salaryVisibility"
                    value={formData.salaryVisibility}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {salaryVisibilities.map(visibility => (
                      <option key={visibility} value={visibility}>
                        {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Salary</label>
                  <input
                    type="number"
                    name="salaryMin"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Salary</label>
                  <input
                    type="number"
                    name="salaryMax"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits & Perks</h3>
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Benefits</h4>
                {formData.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={benefit}
                      onChange={(e) => handleArrayInputChange(index, 'benefits', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter a benefit"
                    />
                    {formData.benefits.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'benefits')}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('benefits')}
                  className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
                >
                  + Add Benefit
                </button>
              </div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Perks</h4>
                {formData.perks.map((perk, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={perk}
                      onChange={(e) => handleArrayInputChange(index, 'perks', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter a perk"
                    />
                    {formData.perks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayField(index, 'perks')}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('perks')}
                  className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
                >
                  + Add Perk
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Incentives</label>
                  <input
                    type="text"
                    name="incentives"
                    value={formData.incentives}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bonuses</label>
                  <input
                    type="text"
                    name="bonuses"
                    value={formData.bonuses}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'hiring':
        return (
          <div className="space-y-6">
            {/* Hiring Information */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Manager Name</label>
                  <input
                    type="text"
                    name="hiringManagerName"
                    value={formData.hiringManagerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Manager Email</label>
                  <input
                    type="email"
                    name="hiringManagerEmail"
                    value={formData.hiringManagerEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Manager Phone</label>
                  <input
                    type="text"
                    name="hiringManagerPhone"
                    value={formData.hiringManagerPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Mode</label>
                  <select
                    name="interviewMode"
                    value={formData.interviewMode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Mode</option>
                    {interviewModes.map(mode => (
                      <option key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Location</label>
                  <input
                    type="text"
                    name="interviewLocation"
                    value={formData.interviewLocation}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interview Instructions</label>
                  <textarea
                    name="interviewInstructions"
                    value={formData.interviewInstructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Interview Rounds */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Rounds</h3>
              {formData.interviewRounds.map((round, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={round}
                    onChange={(e) => handleArrayInputChange(index, 'interviewRounds', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter an interview round"
                  />
                  {formData.interviewRounds.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'interviewRounds')}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('interviewRounds')}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
              >
                + Add Interview Round
              </button>
            </div>
          </div>
        );

      case 'additional':
        return (
          <div className="space-y-6">
            {/* Timing & Duration */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing & Duration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contract Duration</label>
                  <input
                    type="text"
                    name="contractDuration"
                    value={formData.contractDuration}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 6 months"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 9 AM - 6 PM"
                  />
                </div>
              </div>
            </div>

            {/* Documents Required */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents Required</h3>
              <div className="flex items-center space-x-6 mb-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="resumeRequired"
                    checked={formData.resumeRequired}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Resume Required
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="coverLetterRequired"
                    checked={formData.coverLetterRequired}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Cover Letter Required
                  </label>
                </div>
              </div>
              <h4 className="font-medium text-gray-700 mb-2">Additional Documents</h4>
              {formData.documentsRequired.map((doc, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={doc}
                    onChange={(e) => handleArrayInputChange(index, 'documentsRequired', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter a required document"
                  />
                  {formData.documentsRequired.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'documentsRequired')}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayField('documentsRequired')}
                className="mt-2 px-4 py-2 text-blue-600 hover:text-blue-800 border border-blue-600 rounded-lg"
              >
                + Add Document
              </button>
            </div>

            {/* Job Image Upload */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Image</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="job-image-upload"
                />
                <label htmlFor="job-image-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-600 text-sm mb-1">Click to upload job image</p>
                  <p className="text-gray-400 text-xs">JPG, PNG (Max 5MB)</p>
                </label>
              </div>
              {jobImage && <p className="text-green-600 text-sm mt-2">✓ {jobImage.name}</p>}
            </div>

            {/* Status */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl mx-2 sm:mx-4 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                {job ? 'Edit Job Post' : 'Create New Job Post'}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Fill in the job details below - All fields marked with * are required
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 sm:p-2 rounded-full hover:bg-gray-100 flex-shrink-0 disabled:opacity-50"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {renderTabContent()}
          </div>

          {/* Form Actions */}
          <div className="border-t border-gray-200 p-4 sm:p-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 space-x-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-semibold w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-semibold w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {job ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  job ? 'Update Job' : 'Create Job'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobPostingForm;
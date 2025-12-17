import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import jobData from "../../../../../JsonFile/jobSelection.json";
import { createOrUpdateJobPost, getDraftJobById } from "../../../../../Service/jobservices";
import  {locationService}  from "../locationService"; // Import location service
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiSearch,
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiCheckCircle,
  FiPlus,
  FiImage,
  FiBriefcase,
  FiFileText,
  FiUsers,
  FiDollarSign,
  FiTool,
  FiPackage,
  FiHeart,
  FiAward,
  FiClock,
  FiFolder,
  FiTag
} from "react-icons/fi";
import {
  MdBusiness,
  MdSettings,
  MdDescription,
  MdSchool,
  MdPerson,
  MdLocationOn,
  MdAccessTime
} from "react-icons/md";

// Import new components
import BasicInfoTab from "./components/tabs/BasicInfoTab";
import JobDetailsTab from "./components/tabs/JobDetailsTab";
import SalaryBenefitsTab from "./components/tabs/SalaryBenefitsTab";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Location data states
  const [locationData, setLocationData] = useState({
    countries: [],
    states: [],
    cities: [],
    areas: [],
    pincodes: []
  });

  const [locationLoading, setLocationLoading] = useState({
    countries: false,
    states: false,
    cities: false,
    areas: false,
    pincodes: false
  });

  // Form data state
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

    // Location (updated with area field)
    city: '',
    state: '',
    country: '',
    area: '',
    pincode: '',
    fullAddress: '',
    remoteEligibility: false,
    latitude: '',
    longitude: '',

    // Job Description
    jobDescription: '',
    responsibilities: [],
    dailyTasks: [],
    keyDuties: [],

    // Skills
    requiredSkills: [],
    preferredSkills: [],
    technicalSkills: [],
    softSkills: [],
    toolsAndTechnologies: [],

    // Qualification
    educationLevel: '',
    degreeRequired: '',
    certificationRequired: [],
    minimumExperience: 0,
    maximumExperience: 0,
    freshersAllowed: false,

    // Salary
    salaryType: 'monthly',
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'INR',
    salaryVisibility: 'public',
    benefits: [],
    perks: [],
    incentives: '',
    bonuses: '',

    // Hiring Information
    hiringManagerName: '',
    hiringManagerEmail: '',
    hiringManagerPhone: '',
    interviewMode: '',
    interviewLocation: '',
    interviewRounds: [],
    hiringProcess: [],
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
    documentsRequired: [],

    // SEO & Keywords
    tags: [],
    skillKeywords: [],
    keywordSearch: [],
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobImage, setJobImage] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);
  const [savedDraft, setSavedDraft] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Search states for dropdowns
  const [categorySearch, setCategorySearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Refs for dropdowns
  const categoryRef = useRef(null);
  const roleRef = useRef(null);

  // Get all categories from JSON
  const allCategories = jobData.mainCategories.flatMap(category => category.items);
  const jobRoles = jobData.jobRoles;

  // Filter categories and roles based on search
  const filteredCategories = allCategories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredRoles = jobRoles.flatMap(roleCategory =>
    roleCategory.jobrole
      .filter(role => role.join(' ').toLowerCase().includes(roleSearch.toLowerCase()))
      .map(role => ({
        category: roleCategory.category,
        value: role.join(' '),
        label: role.join(' ')
      }))
  );

  // Load countries on component mount
  useEffect(() => {
    loadCountries();
  }, []);

  // Initialize form with job data if editing
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchJobData(id);
    } else if (location.state?.jobData) {
      setIsEditMode(true);
      setFormData(location.state.jobData);
      if (location.state.jobData.jobImage) {
        setExistingImage(location.state.jobData.jobImage);
      }
    }
  }, [id, location.state]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Location service functions
  const loadCountries = async () => {
    setLocationLoading(prev => ({ ...prev, countries: true }));
    try {
      const countries = await locationService.getCountries();
      setLocationData(prev => ({ ...prev, countries }));
    } catch (error) {
      console.error('Failed to load countries:', error);
    } finally {
      setLocationLoading(prev => ({ ...prev, countries: false }));
    }
  };

  const fetchStates = async (country) => {
    if (!country) return;
    
    setLocationLoading(prev => ({ ...prev, states: true }));
    try {
      const states = await locationService.getStates(country);
      setLocationData(prev => ({ 
        ...prev, 
        states,
        cities: [],
        areas: [],
        pincodes: []
      }));
    } catch (error) {
      console.error('Failed to load states:', error);
    } finally {
      setLocationLoading(prev => ({ ...prev, states: false }));
    }
  };

  const fetchCities = async (country, state) => {
    if (!country || !state) return;
    
    setLocationLoading(prev => ({ ...prev, cities: true }));
    try {
      const cities = await locationService.getCities(country, state);
      setLocationData(prev => ({ 
        ...prev, 
        cities,
        areas: [],
        pincodes: []
      }));
    } catch (error) {
      console.error('Failed to load cities:', error);
    } finally {
      setLocationLoading(prev => ({ ...prev, cities: false }));
    }
  };

 const fetchAreas = async (country, state, city) => {
  if (!country || !state || !city) return;

  setLocationLoading(prev => ({ ...prev, areas: true }));
  try {
    const areas = await locationService.getAreas({
      country,
      state,
      city
    });

    setLocationData(prev => ({
      ...prev,
      areas,
      pincodes: []
    }));
  } catch (error) {
    console.error("Failed to load areas:", error);
  } finally {
    setLocationLoading(prev => ({ ...prev, areas: false }));
  }
};


  const fetchPincodes = async (area) => {
    if (!area || formData.country !== 'India') return;
    
    setLocationLoading(prev => ({ ...prev, pincodes: true }));
    try {
      const pincodes = await locationService.getPincodes({
  country: formData.country,
  area
});
    } catch (error) {
      console.error('Failed to load pincodes:', error);
    } finally {
      setLocationLoading(prev => ({ ...prev, pincodes: false }));
    }
  };

  // Fetch job data for editing
  const fetchJobData = async (jobId) => {
    setIsLoading(true);
    try {
      const response = await getDraftJobById(jobId);
      console.log("API Response:", response.data);

      if (response.data.success && response.data.draft) {
        const jobData = response.data.draft;

        // Helper function to parse array fields
        const parseArrayField = (field) => {
          if (!field) return [];
          if (Array.isArray(field)) {
            const filtered = field.filter(item => item && item.toString().trim() !== '');
            return filtered.length > 0 ? filtered : [];
          }
          if (typeof field === 'string') {
            try {
              const parsed = JSON.parse(field);
              if (Array.isArray(parsed)) {
                const filtered = parsed.filter(item => item && item.toString().trim() !== '');
                return filtered.length > 0 ? filtered : [];
              }
            } catch {
              const items = field.split(',').map(item => item.trim()).filter(item => item);
              return items.length > 0 ? items : [];
            }
          }
          return [];
        };

        // Set existing image if available
        if (jobData.jobImage) {
          setExistingImage(jobData.jobImage);
        }

        const updatedFormData = {
          // Basic Job Info
          jobTitle: jobData.jobTitle || '',
          jobRole: jobData.jobRole || '',
          jobCategory: jobData.jobCategory || '',
          jobSubCategory: jobData.jobSubCategory || '',
          employmentType: jobData.employmentType || '',
          workMode: jobData.workMode || '',
          shiftType: jobData.shiftType || '',
          openingsCount: jobData.openingsCount || 1,
          urgencyLevel: jobData.urgencyLevel || '',

          // Location
          city: jobData.city || '',
          state: jobData.state || '',
          country: jobData.country || '',
          area: jobData.area || '', // Add area field
          pincode: jobData.pincode || '',
          fullAddress: jobData.fullAddress || '',
          remoteEligibility: jobData.remoteEligibility || false,
          latitude: jobData.googleLocation?.coordinates?.[1] || '',
          longitude: jobData.googleLocation?.coordinates?.[0] || '',

          // Job Description
          jobDescription: jobData.jobDescription || '',
          responsibilities: parseArrayField(jobData.responsibilities),
          dailyTasks: parseArrayField(jobData.dailyTasks),
          keyDuties: parseArrayField(jobData.keyDuties),

          // Skills
          requiredSkills: parseArrayField(jobData.requiredSkills),
          preferredSkills: parseArrayField(jobData.preferredSkills),
          technicalSkills: parseArrayField(jobData.technicalSkills),
          softSkills: parseArrayField(jobData.softSkills),
          toolsAndTechnologies: parseArrayField(jobData.toolsAndTechnologies),

          // Qualification
          educationLevel: jobData.educationLevel || '',
          degreeRequired: jobData.degreeRequired || '',
          certificationRequired: parseArrayField(jobData.certificationRequired),
          minimumExperience: jobData.minimumExperience || 0,
          maximumExperience: jobData.maximumExperience || 0,
          freshersAllowed: jobData.freshersAllowed || false,

          // Salary
          salaryType: jobData.salaryType || 'monthly',
          salaryMin: jobData.salaryMin || 0,
          salaryMax: jobData.salaryMax || 0,
          salaryCurrency: jobData.salaryCurrency || 'INR',
          salaryVisibility: jobData.salaryVisibility || 'public',
          benefits: parseArrayField(jobData.benefits),
          perks: parseArrayField(jobData.perks),
          incentives: jobData.incentives || '',
          bonuses: jobData.bonuses || '',

          // Hiring Information
          hiringManagerName: jobData.hiringManagerName || '',
          hiringManagerEmail: jobData.hiringManagerEmail || '',
          hiringManagerPhone: jobData.hiringManagerPhone || '',
          interviewMode: jobData.interviewMode || '',
          interviewLocation: jobData.interviewLocation || '',
          interviewRounds: parseArrayField(jobData.interviewRounds),
          hiringProcess: parseArrayField(jobData.hiringProcess),
          interviewInstructions: jobData.interviewInstructions || '',

          // Timing & Duration
          startDate: jobData.startDate ? new Date(jobData.startDate).toISOString().split('T')[0] : '',
          endDate: jobData.endDate ? new Date(jobData.endDate).toISOString().split('T')[0] : '',
          contractDuration: jobData.contractDuration || '',
          jobTimings: jobData.jobTimings || '',
          workingHours: jobData.workingHours || '',
          workingDays: jobData.workingDays || '',
          holidaysType: jobData.holidaysType || '',

          // Documents Required
          resumeRequired: jobData.resumeRequired ?? true,
          coverLetterRequired: jobData.coverLetterRequired || false,
          documentsRequired: parseArrayField(jobData.documentsRequired),

          // SEO & Keywords
          tags: parseArrayField(jobData.tags),
          skillKeywords: parseArrayField(jobData.skillKeywords),
          keywordSearch: parseArrayField(jobData.keywordSearch),
        };

        setFormData(updatedFormData);
        
        // Load dependent location data if country/state/city exists
        if (updatedFormData.country) {
          fetchStates(updatedFormData.country);
          if (updatedFormData.state) {
            // Use setTimeout to ensure states are loaded before fetching cities
            setTimeout(() => {
              fetchCities(updatedFormData.country, updatedFormData.state);
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching job data:', error);
      alert('Failed to load job data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with location cascading logic
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newFormData = { ...formData };
    newFormData[name] = type === 'checkbox' ? checked : value;
    
    // Handle location cascading logic
    if (name === 'country') {
      // Reset dependent fields when country changes
      newFormData.state = '';
      newFormData.city = '';
      newFormData.area = '';
      newFormData.pincode = '';
      
      // Fetch states for the new country
      if (value) {
        fetchStates(value);
      } else {
        setLocationData(prev => ({ 
          ...prev, 
          states: [],
          cities: [],
          areas: [],
          pincodes: []
        }));
      }
    } else if (name === 'state') {
      // Reset dependent fields when state changes
      newFormData.city = '';
      newFormData.area = '';
      newFormData.pincode = '';
      
      // Fetch cities for the new state
      if (value && formData.country) {
        fetchCities(formData.country, value);
      } else {
        setLocationData(prev => ({ 
          ...prev, 
          cities: [],
          areas: [],
          pincodes: []
        }));
      }
    } else if (name === 'city') {
      // Reset dependent fields when city changes
      newFormData.area = '';
      newFormData.pincode = '';
      
      // For India, fetch areas for the new city
      if (value && formData.country && formData.state) {
  fetchAreas(formData.country, formData.state, value);
} else {
        setLocationData(prev => ({ 
          ...prev, 
          areas: [],
          pincodes: []
        }));
      }
    } else if (name === 'area') {
      // Reset pincode when area changes
      newFormData.pincode = '';
      
      // For India, fetch pincodes for the new area
      if (value && formData.country === 'India') {
        fetchPincodes(value);
      }
    }
    
    setFormData(newFormData);
    
    // Clear error if exists
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
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, jobImage: 'File must be an image' }));
        return;
      }
      setJobImage(file);
      setExistingImage(null);
      if (errors.jobImage) {
        setErrors(prev => ({ ...prev, jobImage: '' }));
      }
    }
  };

  const removeImage = () => {
    setJobImage(null);
    setExistingImage(null);
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

      if (isEditMode && id) {
        submissionData.append('id', id);
      }

      const appendFormField = (key, value) => {
        if (value === null || value === undefined || value === '') {
          return false;
        }
        
        if (Array.isArray(value)) {
          const filteredArray = value.filter(item => item && item.toString().trim() !== '');
          if (filteredArray.length > 0) {
            filteredArray.forEach((item, index) => {
              submissionData.append(`${key}[${index}]`, item);
            });
            return true;
          }
          return false;
        }
        
        if (typeof value === 'boolean') {
          submissionData.append(key, value.toString());
          return true;
        }
        
        if (typeof value === 'number') {
          submissionData.append(key, value.toString());
          return true;
        }
        
        if (typeof value === 'string' && value.trim() !== '') {
          submissionData.append(key, value.trim());
          return true;
        }
        
        return false;
      };

      Object.entries(formData).forEach(([key, value]) => {
        appendFormField(key, value);
      });

      submissionData.append('status', 'submit');

      if (jobImage) {
        submissionData.append('jobImage', jobImage);
      }

      if (existingImage === null && isEditMode) {
        submissionData.append('removeExistingImage', 'true');
      }

      console.log("Form data being submitted:");
      for (let [key, value] of submissionData.entries()) {
        console.log(key, value);
      }

      const apiRes = await createOrUpdateJobPost(submissionData);
      const result = apiRes?.data ?? apiRes;

      if (result && result.success) {
        alert(isEditMode ? 'Job submitted successfully!' : 'Job created successfully!');
        navigate('/company/home');
      } else {
        throw new Error(result?.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} job. ${error?.message ? error.message : ''}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      const draftData = new FormData();

      if (isEditMode && id) {
        draftData.append('id', id);
      }

      const appendFormField = (key, value) => {
        if (value === null || value === undefined || value === '') {
          return false;
        }
        
        if (Array.isArray(value)) {
          const filteredArray = value.filter(item => item && item.toString().trim() !== '');
          if (filteredArray.length > 0) {
            filteredArray.forEach((item, index) => {
              draftData.append(`${key}[${index}]`, item);
            });
            return true;
          }
          return false;
        }
        
        if (typeof value === 'boolean') {
          draftData.append(key, value.toString());
          return true;
        }
        
        if (typeof value === 'number') {
          draftData.append(key, value.toString());
          return true;
        }
        
        if (typeof value === 'string' && value.trim() !== '') {
          draftData.append(key, value.trim());
          return true;
        }
        
        return false;
      };

      Object.entries(formData).forEach(([key, value]) => {
        appendFormField(key, value);
      });

      draftData.append('status', 'draft');

      if (jobImage) {
        draftData.append('jobImage', jobImage);
      }

      console.log("Draft data being sent:");
      for (let [key, value] of draftData.entries()) {
        console.log(key, value);
      }

      const response = await createOrUpdateJobPost(draftData);

      console.log("Draft Saved:", response);

      setSavedDraft(true);
      setTimeout(() => setSavedDraft(false), 3000);

    } catch (err) {
      console.error("Save draft failed:", err);
      alert('Failed to save draft. Please try again.');
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
  const educationLevels = ["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "No Formal Education Required"];
  const salaryCurrencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD"];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: <FiBriefcase /> },
    { id: 'details', label: 'Job Details', icon: <FiFileText /> },
    { id: 'skills', label: 'Skills & Quals', icon: <FiUsers /> },
    { id: 'salary', label: 'Salary & Benefits', icon: <FiDollarSign /> },
    { id: 'hiring', label: 'HR Info', icon: <MdBusiness /> },
    { id: 'additional', label: 'Additional', icon: <MdSettings /> },
  ];

  const getTabCompletion = (tabId) => {
    switch(tabId) {
      case 'basic':
        return formData.jobTitle && formData.jobCategory && formData.employmentType;
      case 'details':
        return formData.jobDescription && formData.responsibilities.some(r => r.trim());
      case 'skills':
        return formData.requiredSkills.some(s => s.trim()) || formData.minimumExperience > 0;
      case 'salary':
        return formData.salaryMin > 0 || formData.salaryMax > 0 || formData.benefits.some(b => b.trim());
      case 'hiring':
        return formData.hiringManagerName || formData.hiringManagerEmail;
      case 'additional':
        return formData.startDate || formData.endDate || formData.workingHours;
      default:
        return false;
    }
  };

  // Enhanced Job Image Upload component
  const JobImageUpload = () => (
    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        <div className="flex items-center gap-2">
          <FiImage className="text-blue-600" />
          Job Image
        </div>
      </h3>
      
      {existingImage && !jobImage && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Current Image:</p>
          <div className="relative">
            <img 
              src={existingImage} 
              alt="Current job" 
              className="w-64 h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>
      )}
      
      {(!existingImage || jobImage) && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="job-image-upload"
          />
          <label htmlFor="job-image-upload" className="cursor-pointer block">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <FiImage className="w-full h-full" />
            </div>
            <p className="text-gray-600 text-lg mb-1">Click to upload job image</p>
            <p className="text-gray-400 text-sm">JPG, PNG (Max 5MB)</p>
          </label>
        </div>
      )}
      
      {jobImage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={URL.createObjectURL(jobImage)} 
                alt="Preview" 
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <FiCheckCircle />
                  {jobImage.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(jobImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
      
      {errors.jobImage && (
        <p className="text-red-500 text-sm mt-2">{errors.jobImage}</p>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            showCategoryDropdown={showCategoryDropdown}
            setShowCategoryDropdown={setShowCategoryDropdown}
            filteredCategories={filteredCategories}
            roleSearch={roleSearch}
            setRoleSearch={setRoleSearch}
            showRoleDropdown={showRoleDropdown}
            setShowRoleDropdown={setShowRoleDropdown}
            filteredRoles={filteredRoles}
            employmentTypes={employmentTypes}
            workModes={workModes}
            shiftTypes={shiftTypes}
            urgencyLevels={urgencyLevels}
            countries={locationData.countries}
            states={locationData.states}
            cities={locationData.cities}
            areas={locationData.areas}
            pincodes={locationData.pincodes}
            loading={locationLoading}
            categoryRef={categoryRef}
            roleRef={roleRef}
          />
        );

      case 'details':
        return (
          <JobDetailsTab
            formData={formData}
            errors={errors}
            handleInputChange={handleInputChange}
            handleArrayInputChange={handleArrayInputChange}
            addArrayField={addArrayField}
            removeArrayField={removeArrayField}
          />
        );

      case 'skills':
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

      case 'salary':
        return (
          <SalaryBenefitsTab
            formData={formData}
            handleInputChange={handleInputChange}
            handleArrayInputChange={handleArrayInputChange}
            addArrayField={addArrayField}
            removeArrayField={removeArrayField}
          />
        );

      case 'hiring':
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

      case 'additional':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Details</h2>
              <p className="text-gray-600">Define timing, documents, and other additional information.</p>
            </div>

            {/* Timing & Duration */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                <div className="flex items-center gap-2">
                  <MdAccessTime className="text-blue-600" />
                  Timing & Duration
                </div>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Contract Duration</label>
                  <input
                    type="text"
                    name="contractDuration"
                    value={formData.contractDuration}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., 6 months"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Working Hours</label>
                  <input
                    type="text"
                    name="workingHours"
                    value={formData.workingHours}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., 9 AM - 6 PM"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Job Timings</label>
                  <input
                    type="text"
                    name="jobTimings"
                    value={formData.jobTimings}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., Flexible"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Working Days</label>
                  <input
                    type="text"
                    name="workingDays"
                    value={formData.workingDays}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g., Monday to Friday"
                  />
                </div>
              </div>
            </div>

            {/* Documents Required */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                <div className="flex items-center gap-2">
                  <FiFolder className="text-blue-600" />
                  Documents Required
                </div>
              </h3>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="resumeRequired"
                    checked={formData.resumeRequired}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    id="resumeRequired"
                  />
                  <label htmlFor="resumeRequired" className="ml-3 text-gray-700 font-medium">
                    Resume Required
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="coverLetterRequired"
                    checked={formData.coverLetterRequired}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    id="coverLetterRequired"
                  />
                  <label htmlFor="coverLetterRequired" className="ml-3 text-gray-700 font-medium">
                    Cover Letter Required
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">
                    Additional Documents
                  </label>
                  <button
                    type="button"
                    onClick={() => addArrayField('documentsRequired')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FiPlus />
                    Add Document
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.documentsRequired.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={doc}
                          onChange={(e) => handleArrayInputChange(index, 'documentsRequired', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter a required document"
                        />
                      </div>
                      {formData.documentsRequired.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'documentsRequired')}
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

            {/* SEO & Keywords */}
            <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                <div className="flex items-center gap-2">
                  <FiTag className="text-blue-600" />
                  SEO & Keywords
                </div>
              </h3>
              
              {/* Tags */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">Tags</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('tags')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FiPlus />
                    Add Tag
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => handleArrayInputChange(index, 'tags', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter a tag"
                        />
                      </div>
                      {formData.tags.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'tags')}
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

              {/* Skill Keywords */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">Skill Keywords</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('skillKeywords')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FiPlus />
                    Add Keyword
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.skillKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => handleArrayInputChange(index, 'skillKeywords', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter a skill keyword"
                        />
                      </div>
                      {formData.skillKeywords.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'skillKeywords')}
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

              {/* Search Keywords */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">Search Keywords</label>
                  <button
                    type="button"
                    onClick={() => addArrayField('keywordSearch')}
                    className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <FiPlus />
                    Add Keyword
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.keywordSearch.map((keyword, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={keyword}
                          onChange={(e) => handleArrayInputChange(index, 'keywordSearch', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                          placeholder="Enter a search keyword"
                        />
                      </div>
                      {formData.keywordSearch.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayField(index, 'keywordSearch')}
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

            {/* Job Image Upload */}
            <JobImageUpload />
          </div>
        );

      default:
        return null;
    }
  };

  const renderPreview = () => {
    if (!showPreview) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">Job Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {(jobImage || existingImage) && (
                <div>
                  <img 
                    src={jobImage ? URL.createObjectURL(jobImage) : existingImage} 
                    alt="Job preview" 
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                </div>
              )}
              
              <div>
                <h4 className="text-2xl font-bold text-gray-900">{formData.jobTitle}</h4>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {formData.employmentType}
                  </span>
                  <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {formData.workMode}
                  </span>
                  <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {formData.jobCategory}
                  </span>
                  {formData.remoteEligibility && (
                    <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Remote Eligible
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Location</h5>
                  <p className="text-gray-700">{formData.city}, {formData.state}, {formData.country}</p>
                  {formData.fullAddress && (
                    <p className="text-gray-600 text-sm mt-1">{formData.fullAddress}</p>
                  )}
                </div>
                
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Openings</h5>
                  <p className="text-gray-700">{formData.openingsCount} position(s) available</p>
                </div>
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Job Description</h5>
                <p className="text-gray-700 whitespace-pre-line">{formData.jobDescription}</p>
              </div>

              {formData.responsibilities.filter(r => r.trim()).length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Key Responsibilities</h5>
                  <ul className="list-disc pl-5 space-y-2">
                    {formData.responsibilities.filter(r => r.trim()).map((resp, index) => (
                      <li key={index} className="text-gray-700">{resp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.requiredSkills.filter(s => s.trim()).length > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Required Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.filter(s => s.trim()).map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {formData.salaryMin > 0 && (
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Salary</h5>
                  <p className="text-gray-700">
                    {formData.salaryCurrency} {formData.salaryMin} - {formData.salaryMax} per {formData.salaryType}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/company/home')}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiArrowLeft />
                <span className="hidden sm:inline">Back to Jobs</span>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {isEditMode ? 'Edit Job Posting' : 'Create New Job'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {isEditMode ? 'Update your job posting' : 'Step-by-step job creation wizard'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiEye />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FiSave />
                <span className="hidden sm:inline">Save Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Progress Steps Sidebar */}
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

          {/* Form Content */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="p-6 sm:p-8">
                  {renderTabContent()}
                </div>

                {/* Form Actions */}
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {savedDraft && (
                        <div className="flex items-center gap-2 text-green-600">
                          <FiCheckCircle />
                          Draft saved successfully
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setActiveTab(prev => {
                          const currentIndex = tabs.findIndex(t => t.id === prev);
                          return tabs[currentIndex - 1]?.id || 'basic';
                        })}
                        disabled={activeTab === 'basic'}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setActiveTab(prev => {
                          const currentIndex = tabs.findIndex(t => t.id === prev);
                          return tabs[currentIndex + 1]?.id || 'additional';
                        })}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        {activeTab === 'additional' ? 'Review' : 'Next Step'}
                      </button>
                      
                      {activeTab === 'additional' && (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              {isEditMode ? 'Updating...' : 'Publishing...'}
                            </span>
                          ) : (
                            isEditMode ? 'Submit for Review' : 'Submit for Review'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {renderPreview()}
    </div>
  );
};

export default JobPostingForm;
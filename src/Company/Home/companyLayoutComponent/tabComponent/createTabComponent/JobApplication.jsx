import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import newJobData from "../../../../../JsonFile/jobSelection.json";
import { createOrUpdateJobPost, getDraftJobById } from "../../../../../Service/jobservices";
import { locationService } from "../locationService";
import { companyLocationService } from "../../../../../Service/companyService"; // NEW: Import company location service
import {
  FiArrowLeft,
  FiSave,
  FiEye,
  FiCheckCircle,
  FiMapPin,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiCheck,
} from "react-icons/fi";

// Import modular components
import FormTabs from "./components/tabs/mainTabs";
import ProgressSidebar from "./components/ProgressSidebar";
import JobPreviewModal from "./components/JobPreviewModal";

const JobPostingForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Form data state - Updated to match backend schema
  const [formData, setFormData] = useState({
    // Basic Job Info
    jobTitle: '',
    degreeRequired: [],
    jobRole: [], // Changed to array for multiple roles
    jobIndustry: '', // Added this field to match backend
    employmentType: '',
    contractDuration: '',
    contractDurationUnit: 'months',
    workMode: '',
    shiftType: '',
    openingsCount: 1,
    urgencyLevel: '',

    // Posting Duration
    startDate: '',
    endDate: '',

    // Location
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

    // Skills
    requiredSkills: [],

    // Qualifications - Updated to match backend schema
    qualifications: [
      {
        educationLevel: '',
        course: '',
        specialization: ''
      }
    ],
    certificationRequired: [],
    
    // Experience
    minimumExperience: 0,
    maximumExperience: 0,
    freshersAllowed: false,

    // Salary
    salaryType: 'monthly',
    salaryMin: 0,
    salaryMax: 0,
    salaryCurrency: 'INR',
    benefits: [],
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
  const [isFormComplete, setIsFormComplete] = useState(false);
  const [jobApproved, setJobApproved] = useState(false); // Track if job is already approved
  const [companyLocationStatus, setCompanyLocationStatus] = useState({
    isLocationUpdated: false,
    coordinates: null,
    isLoading: true
  }); // NEW: Track company location status

  // Search states for dropdowns
  const [categorySearch, setCategorySearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showIndustryDropdown, setShowIndustryDropdown] = useState(false);

  // Refs for dropdowns
  const categoryRef = useRef(null);
  const roleRef = useRef(null);
  const industryRef = useRef(null);

  // Location states
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

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

  // Education levels for dropdown
  const educationLevels = ["High School", "Diploma", "Bachelor's Degree", "Master's Degree", "PhD", "No Formal Education Required"];

  // Set default dates on component mount
  useEffect(() => {
    if (!formData.startDate) {
      const today = new Date();
      const oneMonthLater = new Date(today);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      const formatDate = (date) => {
        return date.toISOString().split('T')[0];
      };

      setFormData(prev => ({
        ...prev,
        startDate: formatDate(today),
        endDate: formatDate(oneMonthLater)
      }));
    }
  }, []);

  // Check company location status on component mount
  useEffect(() => {
    checkCompanyLocationStatus();
  }, []);

  // NEW: Function to check company location status
  const checkCompanyLocationStatus = async () => {
    try {
      setCompanyLocationStatus(prev => ({ ...prev, isLoading: true }));
      
      const response = await companyLocationService.checkLocationStatus();
      
      if (response.success) {
        setCompanyLocationStatus({
          isLocationUpdated: response.isLocationUpdated || false,
          coordinates: response.coordinates || null,
          isLoading: false
        });
        
        // If company has coordinates, pre-fill them in form
        if (response.coordinates) {
          setFormData(prev => ({
            ...prev,
            latitude: response.coordinates.latitude.toString(),
            longitude: response.coordinates.longitude.toString()
          }));
        }
      } else {
        setCompanyLocationStatus({
          isLocationUpdated: false,
          coordinates: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error checking company location:', error);
      setCompanyLocationStatus({
        isLocationUpdated: false,
        coordinates: null,
        isLoading: false
      });
    }
  };

  // NEW: Function to update company location
  const updateCompanyLocation = async (latitude, longitude) => {
    try {
      setIsGettingLocation(true);
      setLocationError('');
      
      const response = await companyLocationService.updateLocation(latitude, longitude);
      
      if (response.success) {
        // Update company location status
        setCompanyLocationStatus({
          isLocationUpdated: true,
          coordinates: { latitude, longitude },
          isLoading: false
        });
        
        // Update form data with coordinates
        setFormData(prev => ({
          ...prev,
          latitude: latitude.toString(),
          longitude: longitude.toString()
        }));
        
        return true;
      } else {
        throw new Error(response.message || 'Failed to update company location');
      }
    } catch (error) {
      console.error('Error updating company location:', error);
      setLocationError(error.message || 'Failed to update location. Please try again.');
      return false;
    } finally {
      setIsGettingLocation(false);
    }
  };

  // NEW: Function to get current location and update company
  const getAndUpdateCompanyLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      setIsGettingLocation(true);
      setLocationError('');

      const options = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const success = await updateCompanyLocation(latitude, longitude);
            
            if (success) {
              resolve({ latitude, longitude });
            } else {
              reject(new Error('Failed to save location to server'));
            }
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          setIsGettingLocation(false);
          let errorMessage = '';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location permissions in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable. Please ensure location services are enabled on your device.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'Unable to get location. Please try again.';
              break;
          }
          
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        options
      );
    });
  };

  // Check if form is complete whenever formData changes (but not in edit mode)
  useEffect(() => {
    // Don't auto-complete form in edit mode - let user control when to preview
    if (isEditMode) return;

    const checkFormCompletion = () => {
      const basicComplete = formData.jobTitle &&
                           formData.jobIndustry &&
                           formData.jobRole &&
                           formData.jobRole.length > 0 &&
                           formData.employmentType &&
                           formData.workMode &&
                           formData.startDate &&
                           formData.endDate;

      const salaryComplete = formData.jobDescription && formData.jobDescription.trim().length > 0;

      const additionalComplete = (formData.requiredSkills && formData.requiredSkills.length > 0) ||
                                (formData.qualifications && formData.qualifications.some(q => q.educationLevel.trim() !== '')) ||
                                formData.minimumExperience > 0;

      return basicComplete && salaryComplete && additionalComplete;
    };

    setIsFormComplete(checkFormCompletion());
  }, [formData, isEditMode]);

  // =================== JOB DATA PROCESSING ===================
  const allIndustries = newJobData.industries || [];
  
  const allRoles = allIndustries.flatMap(industry => 
    industry.roles.map(role => ({
      industry: industry.industryName,
      value: role,
      label: role
    }))
  );

  const filteredIndustries = allIndustries.filter(industry =>
    industry.industryName.toLowerCase().includes(industrySearch.toLowerCase())
  );

  const filteredRoles = allRoles.filter(role =>
    role.label.toLowerCase().includes(roleSearch.toLowerCase())
  );

  const getRolesForIndustry = (industryName) => {
    const industry = allIndustries.find(ind => ind.industryName === industryName);
    return industry ? industry.roles.map(role => ({
      industry: industry.industryName,
      value: role,
      label: role
    })) : [];
  };

  const employmentTypes = ["full-time", "part-time", "contract", "internship", "freelance"];
  const workModes = ["onsite", "remote", "hybrid"];
  const shiftTypes = ["day", "night", "rotational", "flexible"];
  const urgencyLevels = ["immediate", "15 days", "30 days"];
  const salaryTypes = ["monthly", "yearly", "hourly"];
  const salaryCurrencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD"];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'salary', label: 'Job Details & Salary', icon: '💰' },
    { id: 'additional', label: 'Skills & Qualifications', icon: '🎯' },
  ];

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchJobData(id);
    } else if (location.state?.jobData) {
      setIsEditMode(true);
      const jobData = location.state.jobData;
      
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      // Parse jobRole from backend - ensure it's an array
      const parseJobRole = (jobRole) => {
        if (!jobRole) return [];
        if (Array.isArray(jobRole)) return jobRole;
        if (typeof jobRole === 'string') {
          try {
            const parsed = JSON.parse(jobRole);
            if (Array.isArray(parsed)) return parsed;
          } catch {
            // If it's a comma-separated string
            return jobRole.split(',').map(item => item.trim()).filter(item => item);
          }
        }
        return [];
      };
      
      // Parse qualifications from backend
      const parseQualifications = (qualifications) => {
        if (!qualifications) return [{ educationLevel: '', course: '', specialization: '' }];
        if (Array.isArray(qualifications) && qualifications.length > 0) {
          return qualifications.map(q => ({
            educationLevel: q.educationLevel || '',
            course: q.course || '',
            specialization: q.specialization || ''
          }));
        }
        return [{ educationLevel: '', course: '', specialization: '' }];
      };
      
      setFormData({
        ...formData,
        jobTitle: jobData.jobTitle || '',
        jobRole: parseJobRole(jobData.jobRole),
        jobIndustry: jobData.jobIndustry || jobData.companyIndustry || '',
        qualifications: parseQualifications(jobData.qualifications),
        startDate: jobData.startDate ? formatDateForInput(jobData.startDate) : formData.startDate,
        endDate: jobData.endDate ? formatDateForInput(jobData.endDate) : formData.endDate,
        // Add other fields as needed
      });
      
      // Check if job is already approved - Use isApproved from API
      if (jobData.isApproved) {
        setJobApproved(true);
      }
      
      if (location.state.jobData.jobImage) {
        setExistingImage(location.state.jobData.jobImage);
      }
    }
  }, [id, location.state]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoleDropdown(false);
      }
      if (industryRef.current && !industryRef.current.contains(event.target)) {
        setShowIndustryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // NEW: Check if location is needed before action
  const checkAndHandleLocation = async (action) => {
    // If company already has location, proceed directly
    if (companyLocationStatus.isLocationUpdated && companyLocationStatus.coordinates) {
      action();
      return;
    }
    
    // If location check is still loading, wait
    if (companyLocationStatus.isLoading) {
      const waitForLocationCheck = () => {
        return new Promise((resolve) => {
          const checkInterval = setInterval(() => {
            if (!companyLocationStatus.isLoading) {
              clearInterval(checkInterval);
              resolve();
            }
          }, 100);
        });
      };
      
      await waitForLocationCheck();
      
      // Re-check after loading completes
      if (companyLocationStatus.isLocationUpdated) {
        action();
        return;
      }
    }
    
    // Ask user for location permission
    const userConfirmed = window.confirm(
      'To post jobs, we need your company location. Would you like to share your current location?\n\n' +
      'This helps candidates find jobs near them and is required for job posting.'
    );
    
    if (userConfirmed) {
      try {
        await getAndUpdateCompanyLocation();
        action();
      } catch (error) {
        // If location fails, ask if user wants to proceed anyway
        const proceedWithoutLocation = window.confirm(
          'Unable to get your location. You can still proceed without location, ' +
          'but this may affect job visibility. Continue without location?'
        );
        
        if (proceedWithoutLocation) {
          action();
        }
      }
    } else {
      // User declined location - ask if they want to proceed anyway
      const proceedWithoutLocation = window.confirm(
        'Location is required for optimal job visibility. Continue without location?'
      );
      
      if (proceedWithoutLocation) {
        action();
      }
    }
  };

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
      setLocationData(prev => ({ ...prev, pincodes }));
    } catch (error) {
      console.error('Failed to load pincodes:', error);
    } finally {
      setLocationLoading(prev => ({ ...prev, pincodes: false }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const newFormData = { ...formData };
    newFormData[name] = type === 'checkbox' ? checked : value;
    
    // Handle industry selection - clear roles if industry changes
    if (name === 'jobIndustry') {
      newFormData.jobRole = [];
      setRoleSearch('');
    }
    
    // Handle location cascading logic
    if (name === 'country') {
      newFormData.state = '';
      newFormData.city = '';
      newFormData.area = '';
      newFormData.pincode = '';
      
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
      newFormData.city = '';
      newFormData.area = '';
      newFormData.pincode = '';
      
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
      newFormData.area = '';
      newFormData.pincode = '';
      
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
      newFormData.pincode = '';
      
      if (value && formData.country === 'India') {
        fetchPincodes(value);
      }
    }
    
    setFormData(newFormData);
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayInputChange = (index, field, value) => {
    setFormData(prev => {
      const currentArray = Array.isArray(prev[field]) ? prev[field] : [];
      const newArray = [...currentArray];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  // Handle qualifications array changes
  const handleQualificationChange = (index, field, value) => {
    setFormData(prev => {
      const newQualifications = [...prev.qualifications];
      newQualifications[index] = {
        ...newQualifications[index],
        [field]: value
      };
      return { ...prev, qualifications: newQualifications };
    });
  };

  const addQualification = () => {
    setFormData(prev => ({
      ...prev,
      qualifications: [
        ...prev.qualifications,
        { educationLevel: '', course: '', specialization: '' }
      ]
    }));
  };

  const removeQualification = (index) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const addArrayField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(Array.isArray(prev[field]) ? prev[field] : []), '']
    }));
  };

  const removeArrayField = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: Array.isArray(prev[field]) ? prev[field].filter((_, i) => i !== index) : []
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

    if (!formData.jobTitle?.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.jobIndustry?.trim()) newErrors.jobIndustry = 'Job industry is required';
    if (!Array.isArray(formData.jobRole) || formData.jobRole.length === 0) {
      newErrors.jobRole = 'At least one job role is required';
    }
    if (!formData.employmentType) newErrors.employmentType = 'Employment type is required';
    if (!formData.workMode) newErrors.workMode = 'Work mode is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (formData.openingsCount < 1) newErrors.openingsCount = 'At least 1 opening is required';

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }

      if (endDate < startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    // Validate at least one qualification has education level
    const hasQualification = formData.qualifications.some(q => q.educationLevel.trim() !== '');
    if (!hasQualification) {
      newErrors.qualifications = 'At least one education level is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const fetchJobData = async (jobId) => {
  setIsLoading(true);
  try {
    const response = await getDraftJobById(jobId);
    console.log("API Response:", response.data);

    if (response.data.success && response.data.draft) {
      const jobData = response.data.draft;

      // Check if job is already approved - Use isApproved from API
      if (jobData.isApproved) {
        setJobApproved(true);
        console.log("Job is approved:", jobData.isApproved);
      }

      // Helper function to parse array fields
      const parseArrayField = (field) => {
        if (!field) return [];
        if (Array.isArray(field)) {
          const filtered = field.filter(item => item !== null && item !== undefined && item.toString().trim() !== '');
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

      // Helper function to format dates for input
      const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        try {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        } catch {
          return '';
        }
      };

      // Parse qualifications from API response
      const parseQualifications = (qualifications, degreeRequired) => {
        const quals = [];
        
        // First, add qualifications from the qualifications array
        if (qualifications && Array.isArray(qualifications) && qualifications.length > 0) {
          qualifications.forEach(q => {
            if (q && q.educationLevel) {
              quals.push({
                educationLevel: q.educationLevel || '',
                course: q.course || '',
                specialization: q.specialization || ''
              });
            }
          });
        }
        
        // Then, add from degreeRequired array if no qualifications were found
        if (quals.length === 0 && degreeRequired && Array.isArray(degreeRequired) && degreeRequired.length > 0) {
          degreeRequired.forEach(degree => {
            if (degree && degree.trim() !== '') {
              quals.push({
                educationLevel: degree,
                course: '',
                specialization: ''
              });
            }
          });
        }
        
        // If still no qualifications, return default structure
        if (quals.length === 0) {
          return [{ educationLevel: '', course: '', specialization: '' }];
        }
        
        return quals;
      };

      // Set existing image if available
      if (jobData.jobImage) {
        setExistingImage(jobData.jobImage);
      }

      const updatedFormData = {
        // Basic Job Info
        jobTitle: jobData.jobTitle || '',
        jobRole: parseArrayField(jobData.jobRole),
        jobIndustry: jobData.jobIndustry || jobData.companyIndustry || '',
        employmentType: jobData.employmentType || '',
        contractDuration: jobData.contractDuration || '',
        contractDurationUnit: jobData.contractDurationUnit || 'months',
        workMode: jobData.workMode || '',
        shiftType: jobData.shiftType || '',
        openingsCount: jobData.openingsCount || 1,
        urgencyLevel: jobData.urgencyLevel || '',
        
        // Posting Duration
        startDate: formatDateForInput(jobData.startDate) || formData.startDate,
        endDate: formatDateForInput(jobData.endDate) || formData.endDate,

        // Location
        city: jobData.city || '',
        state: jobData.state || '',
        country: jobData.country || '',
        area: jobData.area || '',
        pincode: jobData.pincode || '',
        fullAddress: jobData.fullAddress || '',
        remoteEligibility: jobData.remoteEligibility || false,
        latitude: jobData.latitude || (jobData.googleLocation?.coordinates?.[1]?.toString() || ''),
        longitude: jobData.longitude || (jobData.googleLocation?.coordinates?.[0]?.toString() || ''),

        // Job Description
        jobDescription: jobData.jobDescription || '',

        // Skills
        requiredSkills: parseArrayField(jobData.requiredSkills),

        // Qualifications - Handle both qualifications and degreeRequired
        qualifications: parseQualifications(jobData.qualifications, jobData.degreeRequired),
        certificationRequired: parseArrayField(jobData.certificationRequired),

        // Experience
        minimumExperience: jobData.minimumExperience || 0,
        maximumExperience: jobData.maximumExperience || 0,
        freshersAllowed: jobData.freshersAllowed || false,

        // Salary
        salaryType: jobData.salaryType || 'monthly',
        salaryMin: jobData.salaryMin || 0,
        salaryMax: jobData.salaryMax || 0,
        salaryCurrency: jobData.salaryCurrency || 'INR',
        benefits: parseArrayField(jobData.benefits),
      };

      console.log("Updated Form Data:", updatedFormData);
      console.log("Job approved status:", jobData.isApproved);
      setFormData(updatedFormData);
      
      // Load dependent location data if country/state/city exists
      if (updatedFormData.country) {
        fetchStates(updatedFormData.country);
        if (updatedFormData.state) {
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

const prepareSubmissionData = (status, includeJobId = true) => {
  const submissionData = new FormData();

  // Only include job ID when updating an existing job (edit mode)
  // AND when includeJobId is true (for updates, but not for creating new drafts)
  if (isEditMode && id && includeJobId) {
    submissionData.append('id', id);
  }

  const appendFormField = (formData, key, value) => {
    if (value === null || value === undefined || value === '') {
      return false;
    }

    if (Array.isArray(value)) {
      const filteredArray = value.filter(item => item !== null && item !== undefined);

      // Handle qualifications array specially
      if (key === 'qualifications') {
        filteredArray.forEach((qual, index) => {
          if (qual.educationLevel || qual.course || qual.specialization) {
            if (qual.educationLevel && qual.educationLevel.trim() !== '') {
              formData.append(`qualifications[${index}][educationLevel]`, qual.educationLevel.trim());
            }
            if (qual.course && qual.course.trim() !== '') {
              formData.append(`qualifications[${index}][course]`, qual.course.trim());
            }
            if (qual.specialization && qual.specialization.trim() !== '') {
              formData.append(`qualifications[${index}][specialization]`, qual.specialization.trim());
            }
          }
        });
        return filteredArray.length > 0;
      }

      // Handle other arrays
      const nonEmptyItems = filteredArray.filter(item => {
        if (typeof item === 'string') return item.trim() !== '';
        if (typeof item === 'number') return true;
        if (typeof item === 'boolean') return true;
        if (typeof item === 'object') return Object.keys(item).length > 0;
        return false;
      });

      if (nonEmptyItems.length > 0) {
        nonEmptyItems.forEach((item, index) => {
          if (typeof item === 'object') {
            Object.entries(item).forEach(([subKey, subValue]) => {
              if (subValue !== null && subValue !== undefined && subValue.toString().trim() !== '') {
                formData.append(`${key}[${index}][${subKey}]`, subValue);
              }
            });
          } else {
            formData.append(`${key}[${index}]`, item);
          }
        });
        return true;
      }
      return false;
    }

    if (typeof value === 'boolean') {
      formData.append(key, value.toString());
      return true;
    }

    if (typeof value === 'number') {
      formData.append(key, value.toString());
      return true;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      formData.append(key, value.trim());
      return true;
    }

    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue !== null && subValue !== undefined && subValue.toString().trim() !== '') {
          appendFormField(formData, `${key}[${subKey}]`, subValue);
        }
      });
      return true;
    }

    return false;
  };

  // Append all form fields
  Object.entries(formData).forEach(([key, value]) => {
    appendFormField(submissionData, key, value);
  });

  submissionData.append('status', status);

  // Handle job image
  if (jobImage) {
    submissionData.append('jobImage', jobImage);
  }

  // Handle existing image removal
  if (existingImage === null && isEditMode) {
    submissionData.append('removeExistingImage', 'true');
  }

  // Log submission data for debugging
  console.log("Submission Data - Status:", status, "Include Job ID:", includeJobId && isEditMode && id);
  console.log("Submission Data entries:", Array.from(submissionData.entries()));

  return submissionData;
};

const handleSaveDraft = async () => {
  checkAndHandleLocation(async () => {
    try {
      setIsSubmitting(true);
      
      // For saving draft:
      // - If editing existing job: include job ID
      // - If creating new job: DO NOT include job ID
      const includeJobId = isEditMode && id;
      const draftData = prepareSubmissionData('draft', includeJobId);

      const response = await createOrUpdateJobPost(draftData);
      console.log("Draft Saved Response:", response);

      // Check if response exists and has the expected structure
      if (!response) {
        throw new Error('No response received from server');
      }

      // Handle different possible response structures
      const success = response.data?.success || response.success;
      const jobId = response.data?.jobId || response.jobId;
      const message = response.data?.message || response.message;

      if (success) {
        // If this was a new draft creation, update the URL with the new job ID
        if (!isEditMode && jobId) {
        // Update the browser URL without reloading
          window.history.replaceState({}, '', `/jobs/edit/${jobId}`);
          // Set edit mode for future saves
          setIsEditMode(true);
        }
        
        setSavedDraft(true);
        setTimeout(() => setSavedDraft(false), 3000);
        
        // Show success message
        console.log('Draft saved successfully:', message || 'Draft saved');
      } else {
        throw new Error(message || 'Failed to save draft');
      }

    } catch (err) {
      console.error("Save draft failed:", err);
      
      // More detailed error message
      let errorMessage = 'Failed to save draft. ';
      if (err.message) {
        errorMessage += err.message;
      } else if (err.response?.data?.message) {
        errorMessage += err.response.data.message;
      } else if (err.response?.statusText) {
        errorMessage += `HTTP ${err.response.status}: ${err.response.statusText}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  });
};

const handleSubmit = async (additionalData = null) => {
  // additionalData can be FormData from preview capture or null for regular submit
  
  if (!validateForm()) {
    return;
  }

  checkAndHandleLocation(async () => {
    try {
      setIsSubmitting(true);

      const status = jobApproved ? 'update' : 'submit';
      console.log("Submitting with status:", status, "Job approved:", jobApproved);

      let submissionData;

      if (additionalData) {
        // If we have FormData from preview capture, use it as base
        submissionData = additionalData;
      } else {
        // Create new FormData for regular submission
        submissionData = new FormData();
      }

      // Append job ID if in edit mode
      if (isEditMode && id) {
        submissionData.append('id', id);
      }

      // Helper function to append form fields to FormData
      const appendFormField = (formData, key, value) => {
        if (value === null || value === undefined || value === '') {
          return false;
        }

        if (Array.isArray(value)) {
          const filteredArray = value.filter(item => item !== null && item !== undefined);

          // Handle qualifications array specially
          if (key === 'qualifications') {
            filteredArray.forEach((qual, index) => {
              if (qual.educationLevel || qual.course || qual.specialization) {
                if (qual.educationLevel && qual.educationLevel.trim() !== '') {
                  formData.append(`qualifications[${index}][educationLevel]`, qual.educationLevel.trim());
                }
                if (qual.course && qual.course.trim() !== '') {
                  formData.append(`qualifications[${index}][course]`, qual.course.trim());
                }
                if (qual.specialization && qual.specialization.trim() !== '') {
                  formData.append(`qualifications[${index}][specialization]`, qual.specialization.trim());
                }
              }
            });
            return filteredArray.length > 0;
          }

          // Handle other arrays
          const nonEmptyItems = filteredArray.filter(item => {
            if (typeof item === 'string') return item.trim() !== '';
            if (typeof item === 'number') return true;
            if (typeof item === 'boolean') return true;
            if (typeof item === 'object') return Object.keys(item).length > 0;
            return false;
          });

          if (nonEmptyItems.length > 0) {
            nonEmptyItems.forEach((item, index) => {
              if (typeof item === 'object') {
                Object.entries(item).forEach(([subKey, subValue]) => {
                  if (subValue !== null && subValue !== undefined && subValue.toString().trim() !== '') {
                    formData.append(`${key}[${index}][${subKey}]`, subValue);
                  }
                });
              } else {
                formData.append(`${key}[${index}]`, item);
              }
            });
            return true;
          }
          return false;
        }

        if (typeof value === 'boolean') {
          formData.append(key, value.toString());
          return true;
        }

        if (typeof value === 'number') {
          formData.append(key, value.toString());
          return true;
        }

        if (typeof value === 'string' && value.trim() !== '') {
          formData.append(key, value.trim());
          return true;
        }

        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            if (subValue !== null && subValue !== undefined && subValue.toString().trim() !== '') {
              appendFormField(formData, `${key}[${subKey}]`, subValue);
            }
          });
          return true;
        }

        return false;
      };

      // Always append all form fields, regardless of whether additionalData exists
      Object.entries(formData).forEach(([key, value]) => {
        appendFormField(submissionData, key, value);
      });

      // Append status
      submissionData.append('status', status);

      // Handle job image
      if (jobImage) {
        submissionData.append('jobImage', jobImage);
      }

      // Handle existing image removal
      if (existingImage === null && isEditMode) {
        submissionData.append('removeExistingImage', 'true');
      }

      console.log("Final submission data entries:");
      for (let [key, value] of submissionData.entries()) {
        console.log(key, value instanceof Blob ? `Blob: ${value.type}, ${value.size} bytes` : value);
      }

      // Continue with the rest of your existing submit logic...
      let apiRes;
      if (isEditMode && id) {
        // Editing existing job - can submit directly
        apiRes = await createOrUpdateJobPost(submissionData);
      } else {
        // Creating new job - need to follow backend rules
        apiRes = await createOrUpdateJobPost(submissionData);
      }
console.log(apiRes)
      // Check if submission was successful
      if (apiRes && apiRes.success) {
        // Navigate to viewJobs component after successful submission
        navigate('/company/home', { state: { navigateToViewJobs: true } });
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      let errorMessage = `Failed to ${jobApproved ? 'update' : 'submit'} job. `;
      if (error.message) {
        errorMessage += error.message;
      }
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  });
};

  const getTabCompletion = (tabId) => {
    switch(tabId) {
      case 'basic':
        return formData.jobTitle &&
               formData.jobIndustry &&
               formData.jobRole &&
               formData.jobRole.length > 0 &&
               formData.employmentType &&
               formData.workMode &&
               formData.startDate &&
               formData.endDate;
      case 'salary':
        return formData.jobDescription && formData.jobDescription.trim().length > 0;
      case 'additional':
        return (formData.requiredSkills && formData.requiredSkills.length > 0) ||
               (formData.qualifications && formData.qualifications.some(q => q.educationLevel.trim() !== '')) ||
               formData.minimumExperience > 0;
      default:
        return false;
    }
  };

  // Update FormTabs props to include new qualifications handling
  const formTabsProps = {
    setErrors,
    activeTab,
    formData,
    handleInputChange,
    handleArrayInputChange,
    addArrayField,
    removeArrayField,
    handleQualificationChange,
    addQualification,
    removeQualification,
    errors,
    industrySearch,
    setIndustrySearch,
    showIndustryDropdown,
    setShowIndustryDropdown,
    filteredIndustries,
    roleSearch,
    setRoleSearch,
    showRoleDropdown,
    setShowRoleDropdown,
    filteredRoles: formData.jobIndustry 
      ? getRolesForIndustry(formData.jobIndustry).filter(role =>
          role.label.toLowerCase().includes(roleSearch.toLowerCase())
        )
      : filteredRoles,
    employmentTypes,
    workModes,
    shiftTypes,
    urgencyLevels,
    locationData,
    locationLoading,
    industryRef,
    roleRef,
    educationLevels,
    salaryTypes,
    salaryCurrencies,
    handleFileChange,
    removeImage,
    jobImage,
    existingImage,
    companyLocationStatus // NEW: Pass company location status to form tabs
  };

  const handleEditAgain = () => {
    setIsFormComplete(false);
    setActiveTab('basic');
  };

  // Function to clean and render HTML content
  const renderHTML = (htmlString) => {
    if (!htmlString) return null;
    
    // Clean up the HTML for display
    const cleanHTML = htmlString
      .replace(/<div><br><\/div>/g, '<br>')
      .replace(/<div>(.*?)<\/div>/g, '<p>$1</p>')
      .replace(/<p><br><\/p>/g, '<br>')
      .replace(/<br>\s*<br>/g, '<br><br>'); // Handle multiple line breaks
    
    return { __html: cleanHTML };
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
      {/* Navigation Header - UPDATED: Hide Save Draft in header for approved jobs */}
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
                  {isEditMode 
                    ? jobApproved 
                      ? 'Update Approved Job' 
                      : 'Edit Job Posting' 
                    : 'Create New Job'}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  {isEditMode 
                    ? jobApproved 
                      ? 'Update your active job posting (requires re-approval)' 
                      : 'Update your job posting' 
                    : 'Step-by-step job creation wizard'}
                </p>
                {/* Show approved job badge */}
                {jobApproved && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 mt-1 bg-green-100 text-green-700 rounded-md text-xs">
                    <FiCheckCircle className="text-xs" />
                    <span>Active & Approved</span>
                  </div>
                )}
                {/* Show location status */}
                <div className={`inline-flex items-center gap-1 px-2 py-1 mt-1 ${companyLocationStatus.isLocationUpdated ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'} rounded-md text-xs`}>
                  <FiMapPin className="text-xs" />
                  <span>
                    {companyLocationStatus.isLocationUpdated 
                      ? 'Location set' 
                      : companyLocationStatus.isLoading
                        ? 'Checking location...'
                        : 'Location needed'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {savedDraft && (
                  <div className="flex items-center gap-2 text-green-600">
                    <FiCheckCircle />
                    Draft saved successfully
                  </div>
                )}
              </div>
              
              {/* Only show Save Draft button in header when form is not complete AND job is NOT approved */}
              {!isFormComplete && !jobApproved && (
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <FiSave />
                  <span className="hidden sm:inline">Save Draft</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Progress Steps Sidebar */}
          {!isFormComplete && (
            <ProgressSidebar
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              getTabCompletion={getTabCompletion}
              isEditMode={isEditMode}
            />
          )}

          {/* Form Content */}
          <div className={`${!isFormComplete ? 'flex-1' : 'w-full'}`}>
            {/* Show form when not complete, show preview when complete */}
            {!isFormComplete ? (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <form onSubmit={handleSubmit}>
                  <div className="p-6 sm:p-8 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
                    <FormTabs {...formTabsProps} />
                  </div>

                  {/* Form Actions - Updated: Show appropriate button text based on jobApproved status */}
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
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
                        
                        {activeTab !== "additional" && 
                          <button
                            type="button"
                            onClick={() => setActiveTab(prev => {
                              const currentIndex = tabs.findIndex(t => t.id === prev);
                              return tabs[currentIndex + 1]?.id || 'additional';
                            })}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                          >
                            Next
                          </button>
                        }
                        
                        {activeTab === 'additional' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (validateForm()) {
                                setIsFormComplete(true);
                              }
                            }}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                          >
                            Preview Job
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              <JobPreviewModal
                showPreview={isFormComplete}
                setShowPreview={setIsFormComplete}
                formData={formData}
                jobImage={jobImage}
                existingImage={existingImage}
                onSaveDraft={handleSaveDraft}
                onEditAgain={handleEditAgain}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditMode={isEditMode}
                jobApproved={jobApproved}
              />
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
        
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #888 #f1f1f1;
        }
        
        .prose {
          line-height: 1.75;
        }
        
        .prose p {
          margin-bottom: 1rem;
        }
        
        .prose ul, .prose ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        
        .prose li {
          margin-bottom: 0.5rem;
        }
        
        .prose strong {
          font-weight: 600;
        }
        
        .prose em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default JobPostingForm;
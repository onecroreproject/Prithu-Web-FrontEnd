// src/pages/Settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  Save, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Building, 
  Globe, 
  Users, 
  Calendar,
  Clock,
  FileText,
  ExternalLink,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Settings as SettingsIcon,
  Bell,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  Upload,
  Trash2
} from 'lucide-react';
import companyApi from '../../../../api/companyApi';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    showEmail: true,
    showPhone: true,
    showWhatsApp: true,
    profileVisibility: 'public',
    jobNotifications: true,
    applicationNotifications: true,
    marketingEmails: false,
    newsletter: true
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch company profile on mount
  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/job/company/profile');
      if (response.data.success) {
        setCompanyProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    // Basic Info
    name: '',
    position: '',
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    
    // Brand Identity
    tagline: '',
    description: '',
    mission: '',
    vision: '',
    about: '',
    
    // Location
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    latitude: '',
    longitude: '',
    
    // Company Details
    yearEstablished: '',
    employeeCount: '',
    workingHours: '',
    workingDays: '',
    businessCategory: '',
    
    // Documents
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    
    // Social Links
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    website: '',
    
    // HR Info
    hiringEmail: '',
    hrName: '',
    hrPhone: '',
    
    // Arrays
    servicesOffered: [],
    clients: [],
    awards: [],
    hiringProcess: []
  });

  // Populate form when profile data loads
  useEffect(() => {
    if (companyProfile) {
      const formData = { ...profileForm };
      
      // Map profile data to form
      Object.keys(profileForm).forEach(key => {
        if (companyProfile[key] !== undefined) {
          formData[key] = companyProfile[key];
        }
      });
      
      // Handle social links
      if (companyProfile.socialLinks) {
        formData.facebook = companyProfile.socialLinks.facebook || '';
        formData.instagram = companyProfile.socialLinks.instagram || '';
        formData.linkedin = companyProfile.socialLinks.linkedin || '';
        formData.twitter = companyProfile.socialLinks.twitter || '';
        formData.youtube = companyProfile.socialLinks.youtube || '';
        formData.website = companyProfile.socialLinks.website || '';
      }
      
      // Handle arrays (convert to comma-separated strings)
      formData.servicesOffered = companyProfile.servicesOffered?.join(', ') || '';
      formData.clients = companyProfile.clients?.join(', ') || '';
      formData.awards = companyProfile.awards?.join(', ') || '';
      formData.hiringProcess = companyProfile.hiringProcess?.join(', ') || '';
      
      // Handle coordinates
      if (companyProfile.googleLocation?.coordinates) {
        formData.longitude = companyProfile.googleLocation.coordinates[0];
        formData.latitude = companyProfile.googleLocation.coordinates[1];
      }
      
      setProfileForm(formData);
    }
  }, [companyProfile]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayFieldChange = (field, value) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // File upload handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await api.put('/job/company/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setCompanyProfile(prev => ({
          ...prev,
          logo: response.data.profile.logo
        }));
        toast.success('Logo updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to upload logo');
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size should be less than 10MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('coverImage', file);

      const response = await api.put('/job/company/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setCompanyProfile(prev => ({
          ...prev,
          coverImage: response.data.profile.coverImage
        }));
        toast.success('Cover image updated successfully!');
      }
    } catch (error) {
      toast.error('Failed to upload cover image');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert comma-separated strings to arrays
      const submitData = { ...profileForm };
      
      // Convert arrays
      submitData.servicesOffered = profileForm.servicesOffered
        .split(',')
        .map(item => item.trim())
        .filter(item => item);
      
      submitData.clients = profileForm.clients
        .split(',')
        .map(item => item.trim())
        .filter(item => item);
      
      submitData.awards = profileForm.awards
        .split(',')
        .map(item => item.trim())
        .filter(item => item);
      
      submitData.hiringProcess = profileForm.hiringProcess
        .split(',')
        .map(item => item.trim())
        .filter(item => item);
      
      // Prepare social links object
      submitData.socialLinks = {
        facebook: profileForm.facebook,
        instagram: profileForm.instagram,
        linkedin: profileForm.linkedin,
        twitter: profileForm.twitter,
        youtube: profileForm.youtube,
        website: profileForm.website
      };
      
      // Remove social fields from main object
      delete submitData.facebook;
      delete submitData.instagram;
      delete submitData.linkedin;
      delete submitData.twitter;
      delete submitData.youtube;
      delete submitData.website;

      const response = await api.put('/job/company/profile', submitData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully!');
        fetchCompanyProfile(); // Refresh data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/job/company/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      if (response.data.success) {
        toast.success('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySubmit = async () => {
    setLoading(true);
    try {
      const response = await api.put('/job/company/privacy-settings', privacySettings);
      
      if (response.data.success) {
        toast.success('Privacy settings updated!');
      }
    } catch (error) {
      toast.error('Failed to update privacy settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !companyProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-8 h-8 text-green-600" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your company profile and preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Tabs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-3"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="font-semibold text-gray-800 text-lg">Settings Menu</h2>
              </div>
              
              <div className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                    activeTab === 'profile'
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile Settings</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('privacy')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all duration-200 ${
                    activeTab === 'privacy'
                      ? 'bg-green-50 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span>Privacy & Security</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-9"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-6 h-6" />
                      Company Profile
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Update your company information and branding</p>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="p-6">
                    {/* Cover Image & Logo */}
                    <div className="mb-8">
                      <div className="relative h-48 md:h-64 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl overflow-hidden mb-6">
                        {companyProfile?.coverImage ? (
                          <img 
                            src={companyProfile.coverImage} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building className="w-16 h-16 text-gray-300" />
                          </div>
                        )}
                        
                        <label className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          Change Cover
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleCoverUpload}
                          />
                        </label>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 -mt-16 ml-6">
                        <div className="relative">
                          <div className="w-32 h-32 rounded-xl border-4 border-white bg-gradient-to-br from-green-100 to-emerald-200 shadow-lg overflow-hidden">
                            {companyProfile?.logo ? (
                              <img 
                                src={companyProfile.logo} 
                                alt="Logo" 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <label className="absolute -bottom-2 -right-2 bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-all duration-200 cursor-pointer shadow-lg">
                            <Camera className="w-4 h-4" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={handleLogoUpload}
                            />
                          </label>
                        </div>
                        
                        <div className="mt-4 sm:mt-0">
                          <h3 className="text-xl font-bold text-gray-900">{companyProfile?.companyName || 'Company Name'}</h3>
                          <p className="text-gray-600 mt-1">{companyProfile?.tagline || 'Add your company tagline'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Form Sections */}
                    <div className="space-y-8">
                      {/* Basic Information */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <User className="w-5 h-5 text-green-600" />
                          Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={profileForm.name}
                              onChange={handleProfileChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Position *</label>
                            <input
                              type="text"
                              name="position"
                              value={profileForm.position}
                              onChange={handleProfileChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                            <input
                              type="text"
                              name="companyName"
                              value={profileForm.companyName}
                              onChange={handleProfileChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Email *</label>
                            <input
                              type="email"
                              name="companyEmail"
                              value={profileForm.companyEmail}
                              onChange={handleProfileChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Contact Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Phone className="w-5 h-5 text-green-600" />
                          Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                            <input
                              type="tel"
                              name="companyPhone"
                              value={profileForm.companyPhone}
                              onChange={handleProfileChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                            <input
                              type="text"
                              name="address"
                              value={profileForm.address}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                            <input
                              type="text"
                              name="city"
                              value={profileForm.city}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                            <input
                              type="text"
                              name="state"
                              value={profileForm.state}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Company Description */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-green-600" />
                          Company Description
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                            <input
                              type="text"
                              name="tagline"
                              value={profileForm.tagline}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="A short tagline for your company"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea
                              name="description"
                              value={profileForm.description}
                              onChange={handleProfileChange}
                              rows="3"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="Brief description of your company"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">About Us</label>
                            <textarea
                              name="about"
                              value={profileForm.about}
                              onChange={handleProfileChange}
                              rows="4"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="Detailed information about your company"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Business Details */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Building className="w-5 h-5 text-green-600" />
                          Business Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year Established</label>
                            <input
                              type="number"
                              name="yearEstablished"
                              value={profileForm.yearEstablished}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                            <input
                              type="number"
                              name="employeeCount"
                              value={profileForm.employeeCount}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Business Category</label>
                            <input
                              type="text"
                              name="businessCategory"
                              value={profileForm.businessCategory}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered (comma separated)</label>
                            <input
                              type="text"
                              value={profileForm.servicesOffered}
                              onChange={(e) => handleArrayFieldChange('servicesOffered', e.target.value)}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="Web Development, Mobile Apps, Consulting"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Social Links */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-green-600" />
                          Social Links
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input
                              type="url"
                              name="website"
                              value={profileForm.website}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="https://yourcompany.com"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                            <input
                              type="url"
                              name="linkedin"
                              value={profileForm.linkedin}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="https://linkedin.com/company/yourcompany"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                            <input
                              type="url"
                              name="facebook"
                              value={profileForm.facebook}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="https://facebook.com/yourcompany"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                            <input
                              type="url"
                              name="instagram"
                              value={profileForm.instagram}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                              placeholder="https://instagram.com/yourcompany"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="w-6 h-6" />
                      Privacy & Security
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">Manage your privacy settings and security preferences</p>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* Privacy Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5 text-green-600" />
                        Privacy Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Show Email on Profile</p>
                            <p className="text-sm text-gray-600">Your email will be visible to job seekers</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('showEmail', !privacySettings.showEmail)}
                            className={`w-12 h-6 rounded-full transition-all duration-200 ${privacySettings.showEmail ? 'bg-green-600' : 'bg-gray-300'}`}
                          >
                            <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${privacySettings.showEmail ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Show Phone Number</p>
                            <p className="text-sm text-gray-600">Your phone number will be visible to job seekers</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('showPhone', !privacySettings.showPhone)}
                            className={`w-12 h-6 rounded-full transition-all duration-200 ${privacySettings.showPhone ? 'bg-green-600' : 'bg-gray-300'}`}
                          >
                            <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${privacySettings.showPhone ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Profile Visibility</p>
                            <p className="text-sm text-gray-600">Who can see your company profile</p>
                          </div>
                          <select
                            value={privacySettings.profileVisibility}
                            onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                            <option value="connections">Connections Only</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-green-600" />
                        Notifications
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Job Applications</p>
                            <p className="text-sm text-gray-600">Receive notifications for new job applications</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('applicationNotifications', !privacySettings.applicationNotifications)}
                            className={`w-12 h-6 rounded-full transition-all duration-200 ${privacySettings.applicationNotifications ? 'bg-green-600' : 'bg-gray-300'}`}
                          >
                            <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${privacySettings.applicationNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-800">Marketing Emails</p>
                            <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                          </div>
                          <button
                            onClick={() => handlePrivacyChange('marketingEmails', !privacySettings.marketingEmails)}
                            className={`w-12 h-6 rounded-full transition-all duration-200 ${privacySettings.marketingEmails ? 'bg-green-600' : 'bg-gray-300'}`}
                          >
                            <div className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-200 ${privacySettings.marketingEmails ? 'translate-x-6' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-green-600" />
                        Change Password
                      </h3>
                      <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                          <div className="relative">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                          <div className="relative">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                          >
                            {loading ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Save Privacy Settings */}
                    <div className="pt-6 border-t border-gray-200">
                      <button
                        onClick={handlePrivacySubmit}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save Privacy Settings
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
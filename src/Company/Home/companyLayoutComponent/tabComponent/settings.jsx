import React, { useState, useEffect, useContext } from 'react';
import {
  User, Building, Shield, Settings as SettingsIcon, ChevronRight,
  MapPin, Phone, Mail, Globe, Calendar, Users, Clock, Briefcase,
  Award, FileText, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../../../api/companyApi';
import { AuthContext } from '../../../../context/AuthContext';
import PersonalInfo from './createTabComponent/settingsComponent/personalInfo';
import CompanyInfo from './createTabComponent/settingsComponent/company';
import Privacy from './createTabComponent/settingsComponent/privacy';

const SettingsPage = () => {
  const { token, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('company'); // Default to company tab
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyCoverImage, setCompanyCoverImage] = useState(null);
  const [profileAvatar, setProfileAvatar] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [profileCompleted, setProfileCompleted] = useState(false);

  // Personal Info State - from CompanyLogin
  const [personalInfo, setPersonalInfo] = useState({
    // From CompanyLogin
    name: '',
    email: '',
    phone: '',
    whatsAppNumber: '',
    position: '',
    companyEmail: '',
    companyName: '',
    profileAvatar: '',
  });

  // Company Info State - from CompanyProfile schema
  const [companyInfo, setCompanyInfo] = useState({
    // Brand Identity
    logo: '',
    coverImage: '',
    description: '',
    
    // Contact Details
    companyPhone: '',
    companyEmail: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    
    // Geo Location
    googleLocation: {
      type: 'Point',
      coordinates: [0, 0] // [longitude, latitude]
    },
    
    // Additional Company Info
    yearEstablished: '',
    employeeCount: '',
    workingHours: '',
    workingDays: '',
    
    // Documents
    registrationCertificate: '',
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    
    // Social Media Links
    socialLinks: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
      youtube: '',
      website: '',
    },
    
    // Hiring Information
    hiringEmail: '',
    hrName: '',
    hrPhone: '',
    hiringProcess: [],
    
    // Gallery Images
    galleryImages: [],
    
    // Business Details
    businessCategory: '',
    
    // Business Info Arrays
    servicesOffered: [],
    clients: [],
    awards: [],
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({});
  const [privacyLoading, setPrivacyLoading] = useState(true);

  // Mock privacy data based on schema fields
  const mockPrivacySettings = {
    // Brand Identity
    logo: 'public',
    coverImage: 'public',
    description: 'public',
    
    // Contact Details
    companyPhone: 'restricted',
    companyEmail: 'restricted',
    address: 'private',
    city: 'public',
    state: 'public',
    country: 'public',
    pincode: 'private',
    
    // Additional Info
    yearEstablished: 'public',
    employeeCount: 'public',
    workingHours: 'public',
    workingDays: 'public',
    
    // Documents
    registrationCertificate: 'private',
    gstNumber: 'private',
    panNumber: 'private',
    cinNumber: 'private',
    
    // Social Media
    'socialLinks.facebook': 'public',
    'socialLinks.instagram': 'public',
    'socialLinks.linkedin': 'public',
    'socialLinks.twitter': 'public',
    'socialLinks.youtube': 'public',
    'socialLinks.website': 'public',
    
    // Hiring Info
    hiringEmail: 'restricted',
    hrName: 'private',
    hrPhone: 'restricted',
    hiringProcess: 'public',
    
    // Business Info
    businessCategory: 'public',
    servicesOffered: 'public',
    clients: 'public',
    awards: 'public',
    
    // Gallery Images
    galleryImages: 'public',
  };

  // Fetch company profile data - matches your controller response
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/job/get/company/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        const companyData = response.data.company;
        const profileData = response.data.profile;
        setProfileCompleted(response.data.profileCompleted || false);
        
        // Update personal info with CompanyLogin data
        setPersonalInfo({
          name: companyData?.name || '',
          email: companyData?.email || '',
          phone: companyData?.phone || '',
          whatsAppNumber: companyData?.whatsAppNumber || '',
          position: companyData?.position || '',
          companyEmail: companyData?.companyEmail || '',
          companyName: companyData?.companyName || '',
          profileAvatar: companyData?.profileAvatar || '',
        });

        // Update company info with CompanyProfile data if exists
        if (profileData) {
          setCompanyInfo({
            // Brand Identity
            logo: profileData.logo || '',
            coverImage: profileData.coverImage || '',
            description: profileData.description || '',
            
            // Contact Details
            companyPhone: profileData.companyPhone || companyData?.phone || '',
            companyEmail: profileData.companyEmail || companyData?.companyEmail || '',
            address: profileData.address || '',
            city: profileData.city || '',
            state: profileData.state || '',
            country: profileData.country || '',
            pincode: profileData.pincode || '',
            
            // Geo Location
            googleLocation: profileData.googleLocation || {
              type: 'Point',
              coordinates: [0, 0]
            },
            
            // Additional Company Info
            yearEstablished: profileData.yearEstablished || '',
            employeeCount: profileData.employeeCount || '',
            workingHours: profileData.workingHours || '',
            workingDays: profileData.workingDays || '',
            
            // Documents
            registrationCertificate: profileData.registrationCertificate || '',
            gstNumber: profileData.gstNumber || '',
            panNumber: profileData.panNumber || '',
            cinNumber: profileData.cinNumber || '',
            
            // Social Media Links
            socialLinks: {
              facebook: profileData.socialLinks?.facebook || '',
              instagram: profileData.socialLinks?.instagram || '',
              linkedin: profileData.socialLinks?.linkedin || '',
              twitter: profileData.socialLinks?.twitter || '',
              youtube: profileData.socialLinks?.youtube || '',
              website: profileData.socialLinks?.website || '',
            },
            
            // Hiring Information
            hiringEmail: profileData.hiringEmail || '',
            hrName: profileData.hrName || '',
            hrPhone: profileData.hrPhone || '',
            hiringProcess: profileData.hiringProcess || [],
            
            // Gallery Images
            galleryImages: profileData.galleryImages || [],
            
            // Business Details
            businessCategory: profileData.businessCategory || '',
            
            // Business Info Arrays
            servicesOffered: profileData.servicesOffered || [],
            clients: profileData.clients || [],
            awards: profileData.awards || [],
          });
          
          // Set gallery images preview
          setGalleryImages(profileData.galleryImages || []);
        } else {
          // If no profile exists, use CompanyLogin data for basic fields
          setCompanyInfo(prev => ({
            ...prev,
            companyPhone: companyData?.phone || '',
            companyEmail: companyData?.companyEmail || '',
            companyName: companyData?.companyName || '',
          }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch company data:', error);
      toast.error('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile avatar upload
  const handleAvatarUpload = (file) => {
    setProfileAvatar(file);
  };

  // Handle gallery image upload
  const handleGalleryUpload = (files) => {
    const newFiles = Array.from(files).slice(0, 5 - galleryFiles.length); // Max 5 images
    setGalleryFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    const previewUrls = newFiles.map(file => URL.createObjectURL(file));
    setGalleryImages(prev => [...prev, ...previewUrls]);
  };

  // Remove gallery image
  const removeGalleryImage = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Update company profile
  const updateCompanyProfile = async (formData) => {
    try {
      setUpdating(true);
      
      // Append files if they exist
      if (companyLogo) {
        formData.append('logo', companyLogo);
      }
      if (companyCoverImage) {
        formData.append('coverImage', companyCoverImage);
      }
      if (profileAvatar) {
        formData.append('profileAvatar', profileAvatar);
      }
      
      // Append gallery images
      galleryFiles.forEach((file, index) => {
        formData.append(`galleryImages`, file);
      });
      
      // Append CompanyProfile fields
      Object.keys(companyInfo).forEach(key => {
        if (key === 'socialLinks') {
          formData.append('socialLinks', JSON.stringify(companyInfo.socialLinks));
        } else if (key === 'googleLocation') {
          formData.append('googleLocation', JSON.stringify(companyInfo.googleLocation));
        } else if (Array.isArray(companyInfo[key])) {
          formData.append(key, JSON.stringify(companyInfo[key]));
        } else {
          formData.append(key, companyInfo[key]);
        }
      });
      
      // Append PersonalInfo fields that need to update CompanyLogin
      const personalUpdateFields = ['name', 'phone', 'whatsAppNumber', 'position', 'companyEmail', 'companyName'];
      personalUpdateFields.forEach(field => {
        if (personalInfo[field]) {
          formData.append(field, personalInfo[field]);
        }
      });

      const response = await api.put('/job/update/company/profile', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Profile updated successfully');
        fetchCompanyData(); // Refresh data
        setIsEditing(false);
        setCompanyLogo(null);
        setCompanyCoverImage(null);
        setProfileAvatar(null);
        setGalleryFiles([]);
      } else {
        toast.error(response.data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (file) => {
    setCompanyLogo(file);
    // Create preview URL for immediate display
    const logoUrl = URL.createObjectURL(file);
    setCompanyInfo(prev => ({ ...prev, logo: logoUrl }));
  };

  // Handle cover image upload
  const handleCoverImageUpload = (file) => {
    setCompanyCoverImage(file);
    // Create preview URL for immediate display
    const coverUrl = URL.createObjectURL(file);
    setCompanyInfo(prev => ({ ...prev, coverImage: coverUrl }));
  };

  // Initialize data
  useEffect(() => {
    // Set privacy settings
    setPrivacySettings(mockPrivacySettings);
    setPrivacyLoading(false);
    
    // Fetch company data
    fetchCompanyData();
  }, []);

  const updatePrivacySetting = async (field, value) => {
    try {
      setPrivacySettings((prev) => ({ ...prev, [field]: value }));
      toast.success(`Privacy setting updated`);
      
      // API call to save privacy settings
      await api.post(
        "/api/company/privacy",
        { field, value },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Failed to update privacy setting:", err);
      toast.error("Failed to update privacy setting");
    }
  };

  // Tab navigation - Company first as it's the main profile
  const tabItems = [
    { id: 'company', label: 'Company Profile', icon: Building, desc: 'Company details & branding' },
    { id: 'personal', label: 'Personal Info', icon: User, desc: 'Your contact information' },
    { id: 'privacy', label: 'Privacy', icon: Shield, desc: 'Visibility settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Company Settings</h1>
              <p className="text-gray-600 mt-1 md:mt-2">Manage your company profile and preferences</p>
            </div>
            <div className="flex items-center gap-3">
              {profileCompleted ? (
                <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Profile Complete
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  Profile Incomplete
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span>{loading ? 'Loading...' : 'Account Active'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Tab Navigation */}
        <div className="md:hidden mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
            <div className="grid grid-cols-3 gap-2">
              {tabItems.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-xs text-center">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 md:gap-8">
          {/* Desktop Tab Navigation */}
          <div className="hidden md:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex">
                {tabItems.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center gap-2 px-6 py-5 border-r last:border-r-0 border-gray-200 transition-all duration-200 hover:bg-gray-50 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 font-semibold border-b-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium text-lg">{tab.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 text-center">{tab.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Profile Completion Alert */}
          {!profileCompleted && activeTab === 'company' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 md:p-6 shadow-sm"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Complete Your Company Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill out your company details to enhance visibility and attract more opportunities.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium px-5 py-2.5 rounded-lg transition-all shadow-sm hover:shadow"
                >
                  Complete Profile
                </button>
              </div>
            </motion.div>
          )}

          {/* Main Content Area */}
          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'personal' && (
                <PersonalInfo
                  personalInfo={personalInfo}
                  setPersonalInfo={setPersonalInfo}
                  token={token}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  loading={loading}
                  setLoading={setLoading}
                  onUpdate={updateCompanyProfile}
                  updating={updating}
                  onAvatarUpload={handleAvatarUpload}
                  profileAvatar={profileAvatar}
                />
              )}

              {activeTab === 'company' && (
                <CompanyInfo
                  companyInfo={companyInfo}
                  setCompanyInfo={setCompanyInfo}
                  token={token}
                  isEditing={isEditing}
                  setIsEditing={setIsEditing}
                  loading={loading}
                  setLoading={setLoading}
                  onUpdate={updateCompanyProfile}
                  updating={updating}
                  onLogoUpload={handleLogoUpload}
                  onCoverImageUpload={handleCoverImageUpload}
                  companyLogo={companyLogo}
                  companyCoverImage={companyCoverImage}
                  galleryImages={galleryImages}
                  onGalleryUpload={handleGalleryUpload}
                  removeGalleryImage={removeGalleryImage}
                  galleryFiles={galleryFiles}
                />
              )}

              {activeTab === 'privacy' && (
                <Privacy
                  privacySettings={privacySettings}
                  updatePrivacySetting={updatePrivacySetting}
                  privacyLoading={privacyLoading}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
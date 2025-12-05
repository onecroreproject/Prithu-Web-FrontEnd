import React, { useState, useEffect, useContext } from 'react';
import {
  User, Building, Shield, Settings as SettingsIcon, ChevronRight
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
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [companyCoverImage, setCompanyCoverImage] = useState(null);
  const [profileAvatar, setProfileAvatar] = useState(null);

  // Personal Info State - initialized with backend structure (CompanyLogin data)
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

    // Additional fields that might be in CompanyProfile
    employeeId: '',
    department: '',
    reportingTo: '',
    employmentType: '',
    employmentStatus: '',
    dateOfBirth: '',
    workPhone: '',
    extension: '',
    residentialAddress: '',
    permanentAddress: '',
  });

  // Company Info State - initialized with backend structure (CompanyProfile data)
  const [companyInfo, setCompanyInfo] = useState({
    // Brand Identity
    logo: '',
    coverImage: '',
    tagline: '',
    description: '',
    mission: '',
    vision: '',
    about: '',
    
    // Contact Details (from CompanyProfile)
    companyPhone: '',
    companyEmail: '',
    address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
    
    // Additional Info
    yearEstablished: '',
    employeeCount: '',
    workingHours: '',
    workingDays: '',
    
    // Business Details
    businessCategory: '',
    
    // Social Links
    socialLinks: {
      website: '',
      linkedin: '',
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
    
    // Hiring Info
    hiringEmail: '',
    hrName: '',
    hrPhone: '',
    hiringProcess: [],

    // Business Info Arrays
    servicesOffered: [],
    clients: [],
    awards: [],

    // Documents
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    registrationCertificate: '',

    // Location
    googleLocation: {
      type: 'Point',
      coordinates: [0, 0]
    }
  });

  // Privacy Settings State
  const [privacySettings, setPrivacySettings] = useState({});
  const [privacyLoading, setPrivacyLoading] = useState(true);

  // Mock privacy data
  const mockPrivacySettings = {
    // Brand Identity
    logo: 'public',
    coverImage: 'public',
    tagline: 'public',
    description: 'public',
    mission: 'public',
    vision: 'public',
    about: 'public',
    
    // Contact
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
    
    // Business Info
    businessCategory: 'public',
    servicesOffered: 'public',
    clients: 'public',
    awards: 'public',
    
    // Social Media
    'socialLinks.facebook': 'public',
    'socialLinks.instagram': 'public',
    'socialLinks.linkedin': 'public',
    'socialLinks.website': 'public',
    'socialLinks.twitter': 'public',
    'socialLinks.youtube': 'public',
    
    // Hiring Info
    hiringEmail: 'restricted',
    hrName: 'private',
    hrPhone: 'restricted',
    hiringProcess: 'public',
    
    // Documents
    gstNumber: 'private',
    panNumber: 'private',
    cinNumber: 'private',
    registrationCertificate: 'private'
  };

  // Fetch company profile data
  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/job/get/company/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        const companyData = response.data.company;
        const profileData = response.data.profile;
        
        // Update personal info with CompanyLogin data
        setPersonalInfo(prev => ({
          ...prev,
          name: companyData?.name || '',
          email: companyData?.email || '',
          phone: companyData?.phone || '',
          whatsAppNumber: companyData?.whatsAppNumber || '',
          position: companyData?.position || '',
          companyEmail: companyData?.companyEmail || '',
          companyName: companyData?.companyName || '',
          profileAvatar: companyData?.profileAvatar || '',
        }));

        // Update company info with CompanyProfile data if exists
        if (profileData) {
          setCompanyInfo(prev => ({
            ...prev,
            // Brand Identity
            logo: profileData.logo || '',
            coverImage: profileData.coverImage || '',
            tagline: profileData.tagline || '',
            description: profileData.description || '',
            mission: profileData.mission || '',
            vision: profileData.vision || '',
            about: profileData.about || '',
            
            // Contact Details
            companyPhone: profileData.companyPhone || companyData?.phone || '',
            companyEmail: profileData.companyEmail || companyData?.companyEmail || '',
            address: profileData.address || '',
            city: profileData.city || '',
            state: profileData.state || '',
            country: profileData.country || '',
            pincode: profileData.pincode || '',
            
            // Additional Info
            yearEstablished: profileData.yearEstablished || '',
            employeeCount: profileData.employeeCount || '',
            workingHours: profileData.workingHours || '',
            workingDays: profileData.workingDays || '',
            
            // Business Details
            businessCategory: profileData.businessCategory || '',
            
            // Social Links
            socialLinks: {
              website: profileData.socialLinks?.website || '',
              linkedin: profileData.socialLinks?.linkedin || '',
              facebook: profileData.socialLinks?.facebook || '',
              instagram: profileData.socialLinks?.instagram || '',
              twitter: profileData.socialLinks?.twitter || '',
              youtube: profileData.socialLinks?.youtube || '',
            },
            
            // Hiring Info
            hiringEmail: profileData.hiringEmail || '',
            hrName: profileData.hrName || '',
            hrPhone: profileData.hrPhone || '',
            hiringProcess: profileData.hiringProcess || [],
            
            // Business Info Arrays
            servicesOffered: profileData.servicesOffered || [],
            clients: profileData.clients || [],
            awards: profileData.awards || [],
            
            // Documents
            gstNumber: profileData.gstNumber || '',
            panNumber: profileData.panNumber || '',
            cinNumber: profileData.cinNumber || '',
            registrationCertificate: profileData.registrationCertificate || '',
            
            // Location
            googleLocation: profileData.googleLocation || { type: 'Point', coordinates: [0, 0] }
          }));
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

  // Tab navigation
  const tabItems = [
      { id: 'company', label: 'Company Info', icon: Building },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'privacy', label: 'Privacy', icon: Shield },
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-1 md:mt-2">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
              <span>{loading ? 'Loading...' : 'Account Active'}</span>
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
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
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
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 border-r last:border-r-0 border-gray-200 transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="w-4 h-4 ml-auto text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
                  personalInfo={personalInfo}
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
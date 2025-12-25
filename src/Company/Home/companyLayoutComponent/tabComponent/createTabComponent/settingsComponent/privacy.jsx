import React, { useState, useEffect } from 'react';
import api from '../../../../../../api/companyApi';
import {
  Shield, Globe, Lock, Camera, FileText,
  Phone, Mail, MapPin, Map, Hash,
  Calendar, Users as UsersIcon, Clock,
  Briefcase, Link, Globe as WebsiteIcon,
  MessageCircle, Instagram, Twitter, Youtube, Users
} from 'lucide-react';
import { motion } from 'framer-motion';

const Privacy = () => {
  const [privacySettings, setPrivacySettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Create axios instance with base config
 

  // Add request interceptor to include auth token
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for error handling
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        // Server responded with error status
        console.error('API Error:', error.response.status, error.response.data);
      } else if (error.request) {
        // Request made but no response
        console.error('Network Error:', error.request);
      } else {
        // Something else happened
        console.error('Error:', error.message);
      }
      return Promise.reject(error);
    }
  );

  // Privacy fields configuration aligned with backend schema
  const privacyFields = [
    // Brand Identity
    { key: 'logo', label: 'Logo', icon: Camera, options: ['public', 'private'] },
    { key: 'coverImage', label: 'Cover Image', icon: Camera, options: ['public', 'private'] },
    { key: 'description', label: 'Description', icon: FileText, options: ['public', 'private'] },
    
    // Contact Details
    { key: 'companyPhone', label: 'Company Phone', icon: Phone, options: ['public', 'private'] },
    { key: 'companyWhatsAppNumber', label: 'WhatsApp Number', icon: MessageCircle, options: ['public', 'private'] },
    { key: 'companyEmail', label: 'Company Email', icon: Mail, options: ['public', 'private'] },
    { key: 'address', label: 'Address', icon: MapPin, options: ['public', 'private'] },
    { key: 'city', label: 'City', icon: MapPin, options: ['public', 'private'] },
    { key: 'state', label: 'State', icon: Map, options: ['public', 'private'] },
    { key: 'country', label: 'Country', icon: Globe, options: ['public', 'private'] },
    { key: 'pincode', label: 'Pincode', icon: Hash, options: ['public', 'private'] },
    { key: 'googleLocation', label: 'Google Location', icon: MapPin, options: ['public', 'private'] },
    
    // Additional Company Info
    { key: 'yearEstablished', label: 'Year Established', icon: Calendar, options: ['public', 'private'] },
    { key: 'employeeCount', label: 'Employee Count', icon: UsersIcon, options: ['public', 'private'] },
    { key: 'workingHours', label: 'Working Hours', icon: Clock, options: ['public', 'private'] },
    { key: 'workingDays', label: 'Working Days', icon: Calendar, options: ['public', 'private'] },
    
    // Documents
    { key: 'registrationCertificate', label: 'Registration Certificate', icon: FileText, options: ['public', 'private'] },
    { key: 'gstNumber', label: 'GST Number', icon: FileText, options: ['public', 'private'] },
    { key: 'panNumber', label: 'PAN Number', icon: FileText, options: ['public', 'private'] },
    { key: 'cinNumber', label: 'CIN Number', icon: FileText, options: ['public', 'private'] },
    
    // Social Links
    { key: 'socialLinks.website', label: 'Website', icon: WebsiteIcon, options: ['public', 'private'] },
    { key: 'socialLinks.linkedin', label: 'LinkedIn', icon: Link, options: ['public', 'private'] },
    { key: 'socialLinks.facebook', label: 'Facebook', icon: Link, options: ['public', 'private'] },
    { key: 'socialLinks.instagram', label: 'Instagram', icon: Instagram, options: ['public', 'private'] },
    { key: 'socialLinks.twitter', label: 'Twitter', icon: Twitter, options: ['public', 'private'] },
    { key: 'socialLinks.youtube', label: 'YouTube', icon: Youtube, options: ['public', 'private'] },
    
    // Hiring Info
    { key: 'hiringEmail', label: 'Hiring Email', icon: Mail, options: ['public', 'private'] },
    { key: 'hrName', label: 'HR Name', icon: Users, options: ['public', 'private'] },
    { key: 'hrPhone', label: 'HR Phone', icon: Phone, options: ['public', 'private'] },
    { key: 'hiringProcess', label: 'Hiring Process', icon: Briefcase, options: ['public', 'private'] },
  ];

  const privacyOptions = {
    public: { label: 'Public', icon: Globe, description: 'Visible to everyone' },
    private: { label: 'Private', icon: Lock, description: 'Visible only to you' },
  };

  // Fetch privacy settings on component mount
  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/job/get/company/privacy/status');
      const data = response.data;
      
      if (data.success && data.exists && data.visibility) {
        // Transform the data to match our field structure
        const settings = { ...data.visibility };
        
        // Handle socialLinks nested object
        if (data.visibility.socialLinks) {
          Object.keys(data.visibility.socialLinks).forEach(key => {
            settings[`socialLinks.${key}`] = data.visibility.socialLinks[key];
          });
        }
        
        setPrivacySettings(settings);
      } else {
        // Initialize with default values from schema
        const defaultSettings = {};
        privacyFields.forEach(field => {
          // Use the first option as default for each field
          defaultSettings[field.key] = field.options[0];
        });
        setPrivacySettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load privacy settings. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySetting = async (key, value) => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Create update payload according to backend structure
      const updateData = {};
      
      if (key.startsWith('socialLinks.')) {
        const socialKey = key.split('.')[1];
        
        // Get current socialLinks from state or initialize empty object
        const currentSocialLinks = {};
        Object.keys(privacySettings).forEach(k => {
          if (k.startsWith('socialLinks.')) {
            const sk = k.split('.')[1];
            currentSocialLinks[sk] = privacySettings[k];
          }
        });
        
        // Create updated socialLinks object
        updateData.socialLinks = {
          ...currentSocialLinks,
          [socialKey]: value
        };
      } else {
        updateData[key] = value;
      }

      const response = await api.post('/job/company/privacy/update', updateData);
      const data = response.data;
      
      if (data.success) {
        // Update local state
        setPrivacySettings(prev => ({
          ...prev,
          [key]: value
        }));
        setSuccess(true);
        
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update privacy setting. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getOptionLabel = (value) => {
    return privacyOptions[value]?.label || value;
  };

  const getOptionIcon = (value) => {
    return privacyOptions[value]?.icon || Globe;
  };

  const handleBulkUpdate = async (value) => {
    if (!window.confirm(`Are you sure you want to make ALL settings ${value.toUpperCase()}? This will override all existing settings.`)) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Create bulk update payload
      const updateData = {};
      
      // Update all fields except socialLinks (which needs special handling)
      privacyFields.forEach(field => {
        if (!field.key.startsWith('socialLinks.')) {
          updateData[field.key] = value;
        }
      });
      
      // Handle socialLinks separately
      const socialLinksUpdate = {};
      privacyFields.forEach(field => {
        if (field.key.startsWith('socialLinks.')) {
          const socialKey = field.key.split('.')[1];
          socialLinksUpdate[socialKey] = value;
        }
      });
      
      if (Object.keys(socialLinksUpdate).length > 0) {
        updateData.socialLinks = socialLinksUpdate;
      }

      const response = await api.post('/job/company/privacy/update', updateData);
      const data = response.data;
      
      if (data.success) {
        // Update all settings in local state
        const updatedSettings = { ...privacySettings };
        Object.keys(updatedSettings).forEach(key => {
          updatedSettings[key] = value;
        });
        setPrivacySettings(updatedSettings);
        setSuccess(true);
        
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'Bulk update failed');
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update settings. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const retryFetch = () => {
    fetchPrivacySettings();
  };

  const resetToDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all privacy settings to default values? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Reset all fields to their default values
      const defaultSettings = {};
      privacyFields.forEach(field => {
        defaultSettings[field.key] = field.options[0];
      });

      // Prepare update data
      const updateData = {};
      const socialLinksUpdate = {};

      privacyFields.forEach(field => {
        if (field.key.startsWith('socialLinks.')) {
          const socialKey = field.key.split('.')[1];
          socialLinksUpdate[socialKey] = field.options[0];
        } else {
          updateData[field.key] = field.options[0];
        }
      });

      if (Object.keys(socialLinksUpdate).length > 0) {
        updateData.socialLinks = socialLinksUpdate;
      }

      const response = await api.post('/job/company/privacy/update', updateData);
      const data = response.data;
      
      if (data.success) {
        setPrivacySettings(defaultSettings);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error(data.message || 'Reset failed');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to reset settings. Please try again.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      key="privacy"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Privacy Settings</h2>
              <p className="text-gray-600 text-sm mt-1">Control who can see your company information</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2">
            {success && (
              <div className="px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg border border-green-200 animate-pulse">
                Settings saved successfully!
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleBulkUpdate('public')}
                disabled={saving || loading}
                className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Globe className="w-4 h-4" />
                Make All Public
              </button>
              <button
                onClick={() => handleBulkUpdate('private')}
                disabled={saving || loading}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Make All Private
              </button>
              <button
                onClick={resetToDefaults}
                disabled={saving || loading}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium">Error</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
              <button
                onClick={retryFetch}
                className="ml-4 px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col justify-center items-center py-10 md:py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading privacy settings...</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {privacyFields.map(({ key, label, icon: Icon, options }) => {
              const currentValue = privacySettings[key] || options[0];
              
              return (
                <div key={key} className="border border-gray-200 rounded-lg md:rounded-xl p-4 hover:border-gray-300 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm md:text-base truncate">{label}</h4>
                        <p className="text-gray-500 text-xs md:text-sm mt-1 truncate">
                          Control who can see your {label.toLowerCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {options.map((optionValue) => {
                        const OptionIcon = getOptionIcon(optionValue);
                        const isActive = currentValue === optionValue;
                        
                        return (
                          <label
                            key={optionValue}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                              isActive
                                ? optionValue === 'public'
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-red-500 bg-red-50 text-red-700"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600"
                            } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <input
                              type="radio"
                              name={key}
                              value={optionValue}
                              checked={isActive}
                              onChange={() => !saving && updatePrivacySetting(key, optionValue)}
                              disabled={saving}
                              className="hidden"
                            />
                            <OptionIcon className={`w-4 h-4 ${
                              isActive 
                                ? optionValue === 'public' ? "text-green-600" : "text-red-600"
                                : "text-gray-400"
                            }`} />
                            <span className={`text-sm font-medium ${
                              isActive 
                                ? optionValue === 'public' ? "text-green-700" : "text-red-700"
                                : "text-gray-700"
                            }`}>
                              {getOptionLabel(optionValue)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Privacy Tips */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-blue-50 rounded-lg md:rounded-xl border border-blue-100 p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Privacy Levels Explained</h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-2 space-y-1">
                    <span className="block">• <strong className="text-green-600">Public:</strong> Visible to everyone on the platform</span>
                    <span className="block">• <strong className="text-red-600">Private:</strong> Visible only to you and authorized admins</span>
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg md:rounded-xl border border-green-100 p-4">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Recommended Settings</h3>
                  <p className="text-gray-600 text-xs md:text-sm mt-2 space-y-1">
                    <span className="block">• Keep contact info private for security</span>
                    <span className="block">• Share company info publicly for branding</span>
                    <span className="block">• Keep sensitive documents private</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {saving && (
            <div className="mt-4 flex items-center justify-center">
              <div className="flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">Saving changes...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Privacy;
import React, { useState, useRef, useEffect } from 'react';
import {
  Mail, Phone, Calendar, MapPin, Camera,
  Building, Save, Edit, Clock, Link, Globe as WebsiteIcon,
  User, Briefcase, Target, FileText, Upload, X, Map
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const CompanyInfo = ({ 
  companyInfo, 
  personalInfo,
  setCompanyInfo, 
  token, 
  isEditing, 
  setIsEditing, 
  loading, 
  setLoading,
  onUpdate,
  updating,
  onLogoUpload,
  onCoverImageUpload,
  companyLogo,
  companyCoverImage
}) => {
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [awards, setAwards] = useState([]);
  const [serviceInput, setServiceInput] = useState('');
  const [clientInput, setClientInput] = useState('');
  const [awardInput, setAwardInput] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formCompanyEmail, setFormCompanyEmail] = useState('');

  // Initialize data from props
  useEffect(() => {
    // Company name and email come from personalInfo
    if (personalInfo?.companyName) {
      setFormCompanyName(personalInfo.companyName);
    } else if (companyInfo?.companyName) {
      setFormCompanyName(companyInfo.companyName);
    }
    
    if (personalInfo?.companyEmail) {
      setFormCompanyEmail(personalInfo.companyEmail);
    } else if (companyInfo?.companyEmail) {
      setFormCompanyEmail(companyInfo.companyEmail);
    }
    
    // Initialize arrays from companyInfo
    if (companyInfo?.servicesOffered && companyInfo.servicesOffered.length > 0) {
      setServices(companyInfo.servicesOffered);
    }
    if (companyInfo?.clients && companyInfo.clients.length > 0) {
      setClients(companyInfo.clients);
    }
    if (companyInfo?.awards && companyInfo.awards.length > 0) {
      setAwards(companyInfo.awards);
    }
    
    // Initialize location coordinates if available
    if (companyInfo?.googleLocation?.coordinates) {
      const [lng, lat] = companyInfo.googleLocation.coordinates;
      setLatitude(lat);
      setLongitude(lng);
    }
  }, [companyInfo, personalInfo]);

  const handleCompanyInfoChange = (field, value) => {
    setCompanyInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setCompanyInfo((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks || {},
        [platform]: value
      }
    }));
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      onLogoUpload(file);
      toast.success('Logo selected');
    }
  };

  const handleCoverFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
        return;
      }
      onCoverImageUpload(file);
      toast.success('Cover image selected');
    }
  };

  // Services management
  const addService = () => {
    if (serviceInput.trim() && !services.includes(serviceInput.trim())) {
      setServices([...services, serviceInput.trim()]);
      setServiceInput('');
    }
  };

  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Clients management
  const addClient = () => {
    if (clientInput.trim() && !clients.includes(clientInput.trim())) {
      setClients([...clients, clientInput.trim()]);
      setClientInput('');
    }
  };

  const removeClient = (index) => {
    setClients(clients.filter((_, i) => i !== index));
  };

  // Awards management
  const addAward = () => {
    if (awardInput.trim() && !awards.includes(awardInput.trim())) {
      setAwards([...awards, awardInput.trim()]);
      setAwardInput('');
    }
  };

  const removeAward = (index) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success('Location obtained successfully');
        },
        (error) => {
          toast.error('Unable to get your location');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSaveCompanyInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append company name and email (prefer personalInfo, fallback to companyInfo)
      formData.append('companyName', formCompanyName || personalInfo?.companyName || companyInfo?.companyName || '');
      formData.append('companyEmail', formCompanyEmail || personalInfo?.companyEmail || companyInfo?.companyEmail || '');
      
      // Append other company info fields
      formData.append('companyPhone', companyInfo?.companyPhone || companyInfo?.phone || '');
      formData.append('tagline', companyInfo?.tagline || '');
      formData.append('description', companyInfo?.description || '');
      formData.append('mission', companyInfo?.mission || '');
      formData.append('vision', companyInfo?.vision || '');
      formData.append('about', companyInfo?.about || '');
      
      // Append contact details
      formData.append('address', companyInfo?.address || '');
      formData.append('city', companyInfo?.city || '');
      formData.append('state', companyInfo?.state || '');
      formData.append('country', companyInfo?.country || '');
      formData.append('pincode', companyInfo?.pincode || '');
      
      // Append additional info
      formData.append('yearEstablished', companyInfo?.yearEstablished || '');
      formData.append('employeeCount', companyInfo?.employeeCount || '');
      formData.append('workingHours', companyInfo?.workingHours || '');
      formData.append('workingDays', companyInfo?.workingDays || '');
      
      // Append business details
      formData.append('businessCategory', companyInfo?.businessCategory || '');
      
      // Append arrays
      services.forEach(service => formData.append('servicesOffered', service));
      clients.forEach(client => formData.append('clients', client));
      awards.forEach(award => formData.append('awards', award));
      
      // Append hiring info
      formData.append('hiringEmail', companyInfo?.hiringEmail || '');
      formData.append('hrName', companyInfo?.hrName || '');
      formData.append('hrPhone', companyInfo?.hrPhone || '');
      
      // Append social links
      formData.append('socialLinks[website]', companyInfo?.socialLinks?.website || '');
      formData.append('socialLinks[linkedin]', companyInfo?.socialLinks?.linkedin || '');
      formData.append('socialLinks[facebook]', companyInfo?.socialLinks?.facebook || '');
      formData.append('socialLinks[instagram]', companyInfo?.socialLinks?.instagram || '');
      formData.append('socialLinks[twitter]', companyInfo?.socialLinks?.twitter || '');
      formData.append('socialLinks[youtube]', companyInfo?.socialLinks?.youtube || '');
      
      // Append business registration details
      formData.append('panNumber', companyInfo?.panNumber || '');
      formData.append('gstNumber', companyInfo?.gstNumber || '');
      formData.append('cinNumber', companyInfo?.cinNumber || '');
      
      // Append location if provided (Note: MongoDB stores as [longitude, latitude])
      if (latitude && longitude) {
        formData.append('longitude', longitude);
        formData.append('latitude', latitude);
      }
      
      // Call the update function from parent
      await onUpdate(formData);
      
      toast.success('Company information updated successfully');
      setIsEditing(false);
      
    } catch (error) {
      console.error('Failed to update company information:', error);
      toast.error('Failed to update company information');
    } finally {
      setLoading(false);
    }
  };

  const logoPreview = companyInfo?.logo || 'https://avatar.iran.liara.run/public/boy';
  const coverPreview = companyInfo?.coverImage || 'https://images.unsplash.com/photo-1497366754035-f200968a6e72';

  return (
    <motion.div
      key="company"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Company Information</h2>
            <p className="text-gray-600 text-sm mt-1">Update your company details</p>
          </div>
         
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading || updating}
              className="px-4 md:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg md:rounded-xl font-medium transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4" />
              {loading ? 'Loading...' : 'Edit Information'}
            </button>
          ) : (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setIsEditing(false)}
                disabled={updating}
                className="px-4 md:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg md:rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="company-form"
                disabled={updating}
                className="px-4 md:px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg md:rounded-xl font-medium transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Company Images */}
        <div className="mb-6 md:mb-8 space-y-6">
          {/* Logo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl border-4 border-white bg-gradient-to-br from-blue-100 to-indigo-200 shadow-lg overflow-hidden">
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://avatar.iran.liara.run/public/boy';
                  }}
                />
              </div>
             
              {isEditing && (
                <button
                  type="button"
                  onClick={() => logoInputRef.current.click()}
                  disabled={updating}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
             
              <input
                type="file"
                accept="image/*"
                ref={logoInputRef}
                onChange={handleLogoFileUpload}
                className="hidden"
                disabled={updating}
              />
            </div>
           
            <div>
              <h3 className="font-semibold text-gray-900 text-base md:text-lg">Company Logo</h3>
              <p className="text-gray-600 text-sm mt-1">Recommended: 400x400px, max 5MB</p>
              {companyLogo && (
                <p className="text-green-600 text-xs mt-1">New logo selected - will be saved with changes</p>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative w-full max-w-md">
              <div className="w-full h-32 md:h-40 rounded-xl border-4 border-white bg-gradient-to-r from-blue-100 to-indigo-200 shadow-lg overflow-hidden">
                <img
                  src={coverPreview}
                  alt="Cover Image"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1497366754035-f200968a6e72';
                  }}
                />
              </div>
             
              {isEditing && (
                <button
                  type="button"
                  onClick={() => coverInputRef.current.click()}
                  disabled={updating}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  <Camera className="w-3 h-3" />
                </button>
              )}
             
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                onChange={handleCoverFileUpload}
                className="hidden"
                disabled={updating}
              />
            </div>
           
            <div>
              <h3 className="font-semibold text-gray-900 text-base md:text-lg">Cover Image</h3>
              <p className="text-gray-600 text-sm mt-1">Recommended: 1500x500px, max 10MB</p>
              {companyCoverImage && (
                <p className="text-green-600 text-xs mt-1">New cover image selected - will be saved with changes</p>
              )}
            </div>
          </div>
        </div>

        <form id="company-form" onSubmit={handleSaveCompanyInfo}>
          <div className="space-y-6 md:space-y-8">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCompanyName || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => setFormCompanyName(e.target.value)}
                    required
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                  <p className="text-xs text-gray-500 mt-1">Linked to your profile</p>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={formCompanyEmail || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => setFormCompanyEmail(e.target.value)}
                      required
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Linked to your profile</p>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={companyInfo?.tagline || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('tagline', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Category</label>
                  <input
                    type="text"
                    value={companyInfo?.businessCategory || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('businessCategory', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year Established</label>
                  <input
                    type="number"
                    value={companyInfo?.yearEstablished || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('yearEstablished', e.target.value)}
                    min="1900"
                    max={new Date().getFullYear()}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Count</label>
                  <input
                    type="number"
                    value={companyInfo?.employeeCount || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('employeeCount', e.target.value)}
                    min="1"
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Business Registration Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Registration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={companyInfo?.panNumber || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('panNumber', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GST Number</label>
                  <input
                    type="text"
                    value={companyInfo?.gstNumber || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('gstNumber', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CIN Number</label>
                  <input
                    type="text"
                    value={companyInfo?.cinNumber || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('cinNumber', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={companyInfo?.companyPhone || companyInfo?.phone || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('companyPhone', e.target.value)}
                      required
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={companyInfo?.city || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('city', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={companyInfo?.state || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('state', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={companyInfo?.country || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('country', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={companyInfo?.pincode || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('pincode', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <textarea
                      rows={3}
                      value={companyInfo?.address || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                {/* Location Coordinates */}
                {isEditing && (
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Map className="w-4 h-4 text-blue-600" />
                      <label className="block text-sm font-medium text-gray-700">Location Coordinates (Optional)</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          disabled={updating}
                          placeholder="e.g., 40.7128"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          disabled={updating}
                          placeholder="e.g., -74.0060"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={updating}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        >
                          Use Current Location
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      These coordinates will be used for map integration. Note: MongoDB stores as [longitude, latitude]
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Working Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Hours</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={companyInfo?.workingHours || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('workingHours', e.target.value)}
                      placeholder="e.g., 9:00 AM - 6:00 PM"
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={companyInfo?.workingDays || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('workingDays', e.target.value)}
                      placeholder="e.g., Monday to Friday"
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <div className="relative">
                    <WebsiteIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={companyInfo?.socialLinks?.website || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                      placeholder="https://example.com"
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={companyInfo?.socialLinks?.linkedin || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={companyInfo?.socialLinks?.facebook || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                      placeholder="https://facebook.com/..."
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={companyInfo?.socialLinks?.instagram || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                      placeholder="https://instagram.com/..."
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={companyInfo?.socialLinks?.twitter || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                      placeholder="https://twitter.com/..."
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={companyInfo?.socialLinks?.youtube || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
                      placeholder="https://youtube.com/..."
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hiring Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hiring Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={companyInfo?.hiringEmail || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('hiringEmail', e.target.value)}
                      placeholder="careers@company.com"
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={companyInfo?.hrName || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('hrName', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">HR Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={companyInfo?.hrPhone || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('hrPhone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Description</h3>
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={companyInfo?.description || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('description', e.target.value)}
                    placeholder="Brief description of your company..."
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mission</label>
                  <textarea
                    rows={2}
                    value={companyInfo?.mission || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('mission', e.target.value)}
                    placeholder="Company mission statement..."
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vision</label>
                  <textarea
                    rows={2}
                    value={companyInfo?.vision || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('vision', e.target.value)}
                    placeholder="Company vision statement..."
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
                  <textarea
                    rows={4}
                    value={companyInfo?.about || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('about', e.target.value)}
                    placeholder="Detailed information about your company..."
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Services Offered */}
            {isEditing && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={serviceInput}
                      onChange={(e) => setServiceInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addService())}
                      disabled={updating}
                      placeholder="Add a service..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addService}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full">
                        <span className="text-sm">{service}</span>
                        <button
                          type="button"
                          onClick={() => removeService(index)}
                          disabled={updating}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Clients */}
            {isEditing && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notable Clients</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={clientInput}
                      onChange={(e) => setClientInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addClient())}
                      disabled={updating}
                      placeholder="Add a client..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addClient}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {clients.map((client, index) => (
                      <div key={index} className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1.5 rounded-full">
                        <span className="text-sm">{client}</span>
                        <button
                          type="button"
                          onClick={() => removeClient(index)}
                          disabled={updating}
                          className="text-green-500 hover:text-green-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Awards */}
            {isEditing && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Awards & Recognition</h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={awardInput}
                      onChange={(e) => setAwardInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAward())}
                      disabled={updating}
                      placeholder="Add an award..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={addAward}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {awards.map((award, index) => (
                      <div key={index} className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full">
                        <span className="text-sm">{award}</span>
                        <button
                          type="button"
                          onClick={() => removeAward(index)}
                          disabled={updating}
                          className="text-yellow-500 hover:text-yellow-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CompanyInfo;
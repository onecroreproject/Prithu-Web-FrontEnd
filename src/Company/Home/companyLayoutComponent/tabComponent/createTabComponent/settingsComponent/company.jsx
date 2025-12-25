import React, { useState, useRef, useEffect } from 'react';
import {
  Mail, Phone, Calendar, MapPin, Camera,
  Building, Save, Edit, Clock, Link, Globe as WebsiteIcon,
  User, Briefcase, Target, FileText, Upload, X, Map, Image as ImageIcon,
  Plus, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const CompanyInfo = ({ 
  companyInfo, 
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
  companyCoverImage,
  galleryImages,
  onGalleryUpload,
  removeGalleryImage,
  galleryFiles
}) => {
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  
  // State for arrays
  const [servicesOffered, setServicesOffered] = useState(['']);
  const [clients, setClients] = useState(['']);
  const [awards, setAwards] = useState(['']);
  const [hiringProcess, setHiringProcess] = useState(['']);
  
  // State for location
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Initialize data from props
  useEffect(() => {
    // Initialize arrays from companyInfo
    if (companyInfo?.servicesOffered && Array.isArray(companyInfo.servicesOffered)) {
      setServicesOffered(companyInfo.servicesOffered.length > 0 ? companyInfo.servicesOffered : ['']);
    }
    
    if (companyInfo?.clients && Array.isArray(companyInfo.clients)) {
      setClients(companyInfo.clients.length > 0 ? companyInfo.clients : ['']);
    }
    
    if (companyInfo?.awards && Array.isArray(companyInfo.awards)) {
      setAwards(companyInfo.awards.length > 0 ? companyInfo.awards : ['']);
    }
    
    if (companyInfo?.hiringProcess && Array.isArray(companyInfo.hiringProcess)) {
      setHiringProcess(companyInfo.hiringProcess.length > 0 ? companyInfo.hiringProcess : ['']);
    }
    
    // Initialize location coordinates if available
    if (companyInfo?.googleLocation?.coordinates) {
      const [lng, lat] = companyInfo.googleLocation.coordinates;
      setLatitude(lat);
      setLongitude(lng);
    }
  }, [companyInfo]);

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

  const handleGalleryFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Check total images won't exceed 5
      const totalImages = galleryImages.length + files.length;
      if (totalImages > 5) {
        toast.error(`Maximum 5 gallery images allowed. You can add ${5 - galleryImages.length} more.`);
        return;
      }
      
      // Check file sizes
      const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
      if (oversizedFiles.length > 0) {
        toast.error('Some files exceed 10MB limit');
        return;
      }
      
      onGalleryUpload(files);
      toast.success(`${files.length} image(s) added to gallery`);
    }
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
    
    // Append company info fields - use proper string values
    const stringFields = {
      'description': companyInfo?.description || '',
      'companyPhone': companyInfo?.companyPhone || '',
      'companyEmail': companyInfo?.companyEmail || '',
      'address': companyInfo?.address || '',
      'city': companyInfo?.city || '',
      'state': companyInfo?.state || '',
      'country': companyInfo?.country || '',
      'pincode': companyInfo?.pincode || '',
      'yearEstablished': companyInfo?.yearEstablished || '',
      'employeeCount': companyInfo?.employeeCount || '',
      'workingHours': companyInfo?.workingHours || '',
      'workingDays': companyInfo?.workingDays || '',
      'registrationCertificate': companyInfo?.registrationCertificate || '',
      'gstNumber': companyInfo?.gstNumber || '',
      'panNumber': companyInfo?.panNumber || '',
      'cinNumber': companyInfo?.cinNumber || '',
      'businessCategory': companyInfo?.businessCategory || '',
      'hiringEmail': companyInfo?.hiringEmail || '',
      'hrName': companyInfo?.hrName || '',
      'hrPhone': companyInfo?.hrPhone || '',
      'companyName': companyInfo?.companyName || ''
    };

    // Append string fields
    Object.entries(stringFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Append JSON fields
    formData.append('socialLinks', JSON.stringify(companyInfo.socialLinks || {}));
    
    // Append array fields
    const arraysToAppend = [
      { key: 'hiringProcess', value: hiringProcess.filter(item => item.trim()) },
      { key: 'servicesOffered', value: servicesOffered.filter(item => item.trim()) },
      { key: 'clients', value: clients.filter(item => item.trim()) },
      { key: 'awards', value: awards.filter(item => item.trim()) }
    ];
    
    arraysToAppend.forEach(({ key, value }) => {
      formData.append(key, JSON.stringify(value));
    });
    
    // Append location if provided
    if (latitude && longitude) {
      const locationData = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      };
      formData.append('googleLocation', JSON.stringify(locationData));
    }
    
    // Call the update function from parent (which handles file uploads)
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
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Company Profile</h2>
            <p className="text-gray-600 text-sm mt-1">Manage your company details and branding</p>
          </div>
         
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              disabled={loading || updating}
              className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg md:rounded-xl font-medium transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
            >
              <Edit className="w-4 h-4" />
              {loading ? 'Loading...' : 'Edit Profile'}
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
                className="px-4 md:px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg md:rounded-xl font-medium transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
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
        <form id="company-form" onSubmit={handleSaveCompanyInfo}>
          <div className="space-y-6 md:space-y-8">
            {/* Company Images Section */}
            <div>
              

                {/* Company Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                About Company
              </h3>
              
              <div>
             
                <textarea
                  rows={4}
                  value={companyInfo?.description || ''}
                  disabled={!isEditing || updating}
                  onChange={(e) => handleCompanyInfoChange('description', e.target.value)}
                  placeholder="Brief description of your company, services, values, and mission..."
                  className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                    !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-2">
                About your company, what you do, and what makes you unique.
                </p>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-blue-600" />
                Company Images
              </h3>
              
              {/* Logo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-xl border-4 border-white bg-gradient-to-br from-blue-100 to-indigo-200 shadow-lg overflow-hidden">
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
                        className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" />
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
                 
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Recommended: 400x400px, max 5MB</p>
                    {companyLogo && (
                      <p className="text-green-600 text-xs mt-1">New logo selected - will be saved with changes</p>
                    )}
                  </div>
                </div>
              </div>

            
            </div>

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Company Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Category
                  </label>
                  <input
                    type="text"
                    value={companyInfo?.businessCategory || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('businessCategory', e.target.value)}
                    placeholder="e.g., Information Technology"
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
                    placeholder="e.g., 2010"
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
                    placeholder="e.g., 50"
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
                
                
                
           
              </div>
            </div>

            {/* Business Registration Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Business Registration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Certificate</label>
                  <input
                    type="text"
                    value={companyInfo?.registrationCertificate || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('registrationCertificate', e.target.value)}
                    placeholder="Registration number"
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                  <input
                    type="text"
                    value={companyInfo?.panNumber || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handleCompanyInfoChange('panNumber', e.target.value)}
                    placeholder="e.g., ABCDE1234F"
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
                    placeholder="e.g., 27ABCDE1234F1Z5"
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
                    placeholder="e.g., U74999MH2014PTC123456"
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                Contact Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={companyInfo?.companyPhone || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('companyPhone', e.target.value)}
                      placeholder="+91 1234567890"
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={companyInfo?.companyEmail || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handleCompanyInfoChange('companyEmail', e.target.value)}
                      placeholder="contact@company.com"
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
                    placeholder="e.g., Mumbai"
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
                    placeholder="e.g., Maharashtra"
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
                    placeholder="e.g., India"
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
                    placeholder="e.g., 400001"
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
                      placeholder="Complete company address"
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
                          placeholder="e.g., 19.0760"
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
                          placeholder="e.g., 72.8777"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={updating}
                          className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium"
                        >
                          Use Current Location
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      These coordinates will be used for map integration. MongoDB stores coordinates as [longitude, latitude].
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Working Hours */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Working Schedule
              </h3>
              
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Link className="w-5 h-5 text-blue-600" />
                Social Media Links
              </h3>
              
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Hiring Information
              </h3>
              
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
                      placeholder="e.g., Sarah Johnson"
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
                      placeholder="+91 9876543210"
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>


                
                
               
              </div>

                {/* Cover Image */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Cover Image</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="relative w-full max-w-md">
                    <div className="w-full h-40 rounded-xl border-4 border-white bg-gradient-to-r from-blue-100 to-indigo-200 shadow-lg overflow-hidden">
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
                        className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-600 to-purple-600 text-white p-2 rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
                      >
                        <Camera className="w-4 h-4" />
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
                 
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm">Recommended: 1500x500px, max 10MB</p>
                    {companyCoverImage && (
                      <p className="text-green-600 text-xs mt-1">New cover image selected - will be saved with changes</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gallery Images */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">Gallery Images (Max 5)</label>
                  {galleryImages.length > 0 && (
                    <span className="text-xs text-gray-500">{galleryImages.length}/5 images</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-3">
                  {galleryImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square w-full rounded-lg border-2 border-gray-200 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        <img
                          src={imageUrl}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=Image+Error';
                          }}
                        />
                      </div>
                     
                      {isEditing && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            disabled={updating}
                            className="bg-white text-red-600 p-2 rounded-full shadow hover:bg-red-50 transition-colors"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Add More Button */}
                  {isEditing && galleryImages.length < 5 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current.click()}
                        disabled={updating}
                        className="aspect-square w-full rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center text-gray-400 hover:text-blue-500 transition-all duration-200"
                      >
                        <Plus className="w-8 h-8 mb-1" />
                        <span className="text-xs">Add Image</span>
                        <span className="text-xs text-gray-500">({5 - galleryImages.length} remaining)</span>
                      </button>
                      <input
                        type="file"
                        accept="image/*"
                        ref={galleryInputRef}
                        onChange={handleGalleryFileUpload}
                        multiple
                        className="hidden"
                        disabled={updating}
                      />
                    </div>
                  )}
                </div>
                
                <p className="text-gray-600 text-xs">
                  Upload up to 5 images showcasing your company. Recommended: 1200x800px, max 10MB each
                </p>
              </div>
            </div>

          
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CompanyInfo;
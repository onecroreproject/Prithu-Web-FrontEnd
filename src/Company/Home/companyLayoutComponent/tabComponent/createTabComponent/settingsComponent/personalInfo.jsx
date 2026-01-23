import React, { useState, useRef, useEffect } from 'react';
import {
  Mail, Phone, Calendar, MapPin, Camera,
  User, Save, Edit, Smartphone, IdCard, Workflow, Upload
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

const PersonalInfo = ({ 
  personalInfo, 
  setPersonalInfo, 
  token, 
  isEditing, 
  setIsEditing, 
  loading, 
  setLoading,
  onUpdate,
  updating
}) => {
  const handlePersonalInfoChange = (field, value) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  console.log('Personal Info:', personalInfo);

  const handleSavePersonalInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Create FormData for multipart upload
      const formData = new FormData();
      
      // Append personal info fields based on backend structure from your output
      // Required fields
      formData.append('name', personalInfo.name || '');
      formData.append('email', personalInfo.email || '');
      formData.append('phone', personalInfo.phone || '');
      formData.append('whatsAppNumber', personalInfo.whatsAppNumber || '');
      formData.append('position', personalInfo.position || '');
      
      // Additional fields from backend
      formData.append('companyEmail', personalInfo.companyEmail || '');
      formData.append('companyName', personalInfo.companyName || '');
      formData.append('dateOfBirth', personalInfo.dateOfBirth || '');
      formData.append('department', personalInfo.department || '');
      formData.append('employeeId', personalInfo.employeeId || '');
      formData.append('extension', personalInfo.extension || '');
      formData.append('permanentAddress', personalInfo.permanentAddress || '');
      formData.append('reportingTo', personalInfo.reportingTo || '');
      formData.append('residentialAddress', personalInfo.residentialAddress || '');
      formData.append('workPhone', personalInfo.workPhone || '');

      // Call the update function from parent
      await onUpdate(formData);
      
    } catch (error) {
      console.error('Failed to update information:', error);
      toast.error('Failed to update information');
    } finally {
      setLoading(false);
    }
  };

  // Format date for input field
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  return (
    <motion.div
      key="personal"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-gray-600 text-sm mt-1">Update your profile and contact details</p>
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
                onClick={() => {
                  setIsEditing(false);
                }}
                disabled={updating}
                className="px-4 md:px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg md:rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 w-full sm:w-auto disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="personal-form"
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
        <form id="personal-form" onSubmit={handleSavePersonalInfo}>
          <div className="space-y-6 md:space-y-8">
            {/* Basic Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalInfo.name || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                    required
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personalInfo.position || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handlePersonalInfoChange('position', e.target.value)}
                    required
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                  <input
                    type="text"
                    value={personalInfo.employeeId || ''}
                    disabled={!isEditing || updating}
                    onChange={(e) => handlePersonalInfoChange('employeeId', e.target.value)}
                    className={`w-full px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                      !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={formatDateForInput(personalInfo.dateOfBirth)}
                      disabled={!isEditing || updating}
                      onChange={(e) => handlePersonalInfoChange('dateOfBirth', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={personalInfo.email || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                      required
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
                      value={personalInfo.companyEmail || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handlePersonalInfoChange('companyEmail', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={personalInfo.phone || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                      required
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={personalInfo.workPhone || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handlePersonalInfoChange('workPhone', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      value={personalInfo.whatsAppNumber || ''}
                      disabled={!isEditing || updating}
                      onChange={(e) => handlePersonalInfoChange('whatsAppNumber', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        !isEditing ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default PersonalInfo;
import React from 'react';
import {
  Shield, Globe, Users, Lock, Camera, FileText,
  Target, Phone, Mail, MapPin, Map, Hash,
  Calendar, Users as UsersIcon, Clock, Building,
  Briefcase, Award, Link, Globe as WebsiteIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
 
const Privacy = ({ privacySettings, updatePrivacySetting, privacyLoading }) => {
  // Privacy fields configuration aligned with schema
  const privacyFields = [
    // Brand Identity
    { key: 'logo', label: 'Logo', icon: Camera },
    { key: 'coverImage', label: 'Cover Image', icon: Camera },
    { key: 'tagline', label: 'Tagline', icon: FileText },
    { key: 'description', label: 'Description', icon: FileText },
    { key: 'mission', label: 'Mission', icon: Target },
    { key: 'vision', label: 'Vision', icon: Globe },
    { key: 'about', label: 'About', icon: FileText },
   
    // Contact Details
    { key: 'companyPhone', label: 'Company Phone', icon: Phone },
    { key: 'companyEmail', label: 'Company Email', icon: Mail },
    { key: 'address', label: 'Address', icon: MapPin },
    { key: 'city', label: 'City', icon: MapPin },
    { key: 'state', label: 'State', icon: Map },
    { key: 'country', label: 'Country', icon: Globe },
    { key: 'pincode', label: 'Pincode', icon: Hash },
   
    // Additional Info
    { key: 'yearEstablished', label: 'Year Established', icon: Calendar },
    { key: 'employeeCount', label: 'Employee Count', icon: UsersIcon },
    { key: 'workingHours', label: 'Working Hours', icon: Clock },
    { key: 'workingDays', label: 'Working Days', icon: Calendar },
   
    // Business Info
    { key: 'businessCategory', label: 'Business Category', icon: Building },
    { key: 'servicesOffered', label: 'Services Offered', icon: Briefcase },
    { key: 'clients', label: 'Clients', icon: Users },
    { key: 'awards', label: 'Awards', icon: Award },
   
    // Social Links
    { key: 'socialLinks.website', label: 'Website', icon: WebsiteIcon },
    { key: 'socialLinks.linkedin', label: 'LinkedIn', icon: Link },
    { key: 'socialLinks.facebook', label: 'Facebook', icon: Link },
   
    // Hiring Info
    { key: 'hiringEmail', label: 'Hiring Email', icon: Mail },
    { key: 'hrName', label: 'HR Name', icon: Users },
    { key: 'hrPhone', label: 'HR Phone', icon: Phone },
    { key: 'hiringProcess', label: 'Hiring Process', icon: Briefcase },
   
    // Documents
    { key: 'gstNumber', label: 'GST Number', icon: FileText },
    { key: 'panNumber', label: 'PAN Number', icon: FileText },
    { key: 'cinNumber', label: 'CIN Number', icon: FileText },
  ];
 
  const privacyOptions = [
    { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
    { value: 'restricted', label: 'Restricted', icon: Users, description: 'Visible to verified users' },
    { value: 'private', label: 'Private', icon: Lock, description: 'Visible only to you' },
  ];
 
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Privacy Settings</h2>
            <p className="text-gray-600 text-sm mt-1">Control who can see your company information</p>
          </div>
        </div>
      </div>
 
      <div className="p-4 md:p-6">
        {privacyLoading ? (
          <div className="flex justify-center items-center py-10 md:py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {privacyFields.map(({ key, label, icon: Icon }) => (
              <div key={key} className="border border-gray-200 rounded-lg md:rounded-xl p-4 hover:border-gray-300 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Icon className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm md:text-base">{label}</h4>
                      <p className="text-gray-500 text-xs md:text-sm mt-1">
                        Control who can see your {label.toLowerCase()}
                      </p>
                    </div>
                  </div>
 
                  <div className="flex flex-wrap gap-2">
                    {privacyOptions.map((option) => {
                      const OptionIcon = option.icon;
                      const isActive = privacySettings[key] === option.value;
                     
                      return (
                        <label
                          key={option.value}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-200 ${
                            isActive
                              ? "border-blue-500 bg-blue-50 text-blue-700"
                              : "border-gray-300 hover:border-blue-300 hover:bg-blue-50 text-gray-600"
                          }`}
                        >
                          <input
                            type="radio"
                            name={key}
                            value={option.value}
                            checked={isActive}
                            onChange={() => updatePrivacySetting(key, option.value)}
                            className="hidden"
                          />
                          <OptionIcon className={`w-4 h-4 ${
                            isActive ? "text-blue-600" : "text-gray-400"
                          }`} />
                          <span className={`text-sm font-medium ${
                            isActive ? "text-blue-700" : "text-gray-700"
                          }`}>
                            {option.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* Privacy Tips */}
        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg md:rounded-xl border border-blue-100 p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm md:text-base">Privacy Levels</h3>
                <p className="text-gray-600 text-xs md:text-sm mt-2 space-y-1">
                  <span className="block">• <strong>Public:</strong> Visible to everyone on the platform</span>
                  <span className="block">• <strong>Restricted:</strong> Visible to verified users and potential clients</span>
                  <span className="block">• <strong>Private:</strong> Visible only to you</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
 
export default Privacy;
 
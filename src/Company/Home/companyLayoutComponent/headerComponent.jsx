import React, { useState, useRef } from 'react';
import { 
  FiMapPin, 
  FiGlobe, 
  FiPhone, 
  FiMail, 
  FiEdit2, 
  FiCamera, 
  FiCheck,
  FiX,
  FiUsers,
  FiCalendar
} from 'react-icons/fi';
import { MdLocationOn, MdBusiness, MdLanguage } from 'react-icons/md';

const CompanyHeader = () => {
  // State for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "Prithu Technologies",
    tagline: "Innovating the Future of Digital Solutions",
    address: "123 Tech Park, Silicon Valley, San Francisco, CA 94107",
    website: "www.prithutech.com",
    phone: "+1 (555) 123-4567",
    email: "contact@prithutech.com",
    founded: "2018",
    employees: "150+",
    industry: "Software & Technology"
  });

  const [coverPhoto, setCoverPhoto] = useState("https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80");
  const [logo, setLogo] = useState("https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80");
  
  const coverPhotoRef = useRef(null);
  const logoRef = useRef(null);

  // Handle cover photo upload
  const handleCoverPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save changes
  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically make an API call to save the data
    console.log('Saving company data:', companyData);
  };

  return (
    <div className="relative w-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Cover Photo Section */}
      <div className="relative h-48 sm:h-56 md:h-64 lg:h-72 w-full group">
        <img 
          src={coverPhoto} 
          alt="Company Cover" 
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Edit Cover Photo Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <input
            type="file"
            accept="image/*"
            onChange={handleCoverPhotoUpload}
            ref={coverPhotoRef}
            className="hidden"
          />
          <button
            onClick={() => coverPhotoRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors shadow-sm"
          >
            <FiCamera className="text-lg" />
            <span className="hidden sm:inline">Change Cover</span>
          </button>
        </div>
      </div>

      {/* Company Info Section */}
      <div className="relative px-4 sm:px-6 md:px-8 pb-6">
        {/* Logo Section */}
        <div className="absolute -top-16 sm:-top-20 md:-top-24 left-4 sm:left-6 md:left-8">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
              <img 
                src={logo} 
                alt="Company Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Edit Logo Button */}
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                ref={logoRef}
                className="hidden"
              />
              <button
                onClick={() => logoRef.current?.click()}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white shadow-lg transition-colors"
                title="Change Logo"
              >
                <FiCamera className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        {/* Edit/Save Controls */}
        <div className="absolute top-4 right-4 sm:right-6 md:right-8 flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <FiCheck className="text-base" />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <FiX className="text-base" />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <FiEdit2 className="text-base" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>
          )}
        </div>

        {/* Company Details */}
        <div className="pt-16 sm:pt-20 md:pt-24">
          {/* Company Name & Tagline */}
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4 max-w-2xl">
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-2"
                  placeholder="Company Name"
                />
                <input
                  type="text"
                  value={companyData.tagline}
                  onChange={(e) => handleInputChange('tagline', e.target.value)}
                  className="w-full text-lg text-gray-600 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none py-2"
                  placeholder="Company Tagline"
                />
              </div>
            ) : (
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                  {companyData.name}
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  {companyData.tagline}
                </p>
              </div>
            )}
          </div>

          {/* Contact & Location Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Left Column - Contact Info */}
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <MdLocationOn className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <textarea
                      value={companyData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none resize-none"
                      rows="2"
                      placeholder="Company Address"
                    />
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                      <p className="text-gray-700">{companyData.address}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FiGlobe className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Website"
                    />
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Website</h3>
                      <a 
                        href={`https://${companyData.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {companyData.website}
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FiPhone className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Phone Number"
                    />
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Phone</h3>
                      <a 
                        href={`tel:${companyData.phone}`}
                        className="text-gray-700 hover:text-blue-600"
                      >
                        {companyData.phone}
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <FiMail className="text-blue-600 text-xl" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="email"
                      value={companyData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Email Address"
                    />
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                      <a 
                        href={`mailto:${companyData.email}`}
                        className="text-gray-700 hover:text-blue-600"
                      >
                        {companyData.email}
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Company Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <FiCalendar className="text-emerald-600 text-xl" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyData.founded}
                      onChange={(e) => handleInputChange('founded', e.target.value)}
                      className="w-full text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Founded Year"
                    />
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Founded</h3>
                      <p className="text-gray-700">{companyData.founded}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FiUsers className="text-purple-600 text-xl" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyData.employees}
                      onChange={(e) => handleInputChange('employees', e.target.value)}
                      className="w-full text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Number of Employees"
                    />
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Employees</h3>
                      <p className="text-gray-700">{companyData.employees}</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <MdBusiness className="text-amber-600 text-xl" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full text-gray-700 bg-transparent border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      placeholder="Industry"
                    />
                  ) : (
                    <>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Industry</h3>
                      <p className="text-gray-700">{companyData.industry}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Social Links (Optional) */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <MdLanguage className="text-gray-600 text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Social Links</h3>
                  <div className="flex gap-3">
                    <a href="#" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
                      LinkedIn
                    </a>
                    <a href="#" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
                      Twitter
                    </a>
                    <a href="#" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600">
                      Facebook
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                Follow Company
              </button>
              <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                Share Profile
              </button>
              <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                View Jobs
              </button>
              <button className="px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors">
                Contact HR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="border-t border-gray-100 bg-gray-50 px-4 sm:px-6 md:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">1.2K</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">45</div>
            <div className="text-sm text-gray-500">Open Positions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">98%</div>
            <div className="text-sm text-gray-500">Satisfaction</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">4.8</div>
            <div className="text-sm text-gray-500">Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;
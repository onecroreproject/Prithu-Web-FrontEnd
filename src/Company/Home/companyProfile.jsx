import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiMapPin,
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiExternalLink,
  FiChevronRight,
  FiMail,
  FiGlobe,
  FiPhone,
  FiMessageSquare
} from 'react-icons/fi';
import {
  MdBusiness,
  MdWork,
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdLanguage,
  MdPeople,
  MdVerifiedUser
} from 'react-icons/md';
import axios from '../../api/axios';
import Header from '../../components/Header';
import JobCards from '../../components/Jobs/HeaderJobs/JobCards'; // Import the JobCards component

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  // Tabs - Only Overview and Jobs
  const tabs = ['Overview', 'Jobs'];

  useEffect(() => {
    if (companyId) {
      fetchCompanyProfile();
    }
  }, [companyId]);

  // Helper function to check if value is empty or default
  const isEmptyValue = (value) => {
    if (!value) return true;
    if (typeof value === 'string' && value.trim() === '') return true;
    if (Array.isArray(value) && value.length === 0) return true;
    if (typeof value === 'object' && Object.keys(value).length === 0) return true;
    return false;
  };

  const fetchCompanyProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`/job/get/single/company/profile/${companyId}`);
      console.log('API Response:', response.data);

      if (response.data.success) {
        const data = response.data;
        const jobsCount = data.jobs?.length || 0;
        
        setCompanyData({
          // CompanyLogin data
          companyName: data.company?.companyName || 'Not Available',
          email: data.company?.email || '',
          name: data.company?.name || '',
          position: data.company?.position || '',
          phone: data.company?.phone || '',
          whatsAppNumber: data.company?.whatsAppNumber || '',
          isVerified: data.company?.isVerified || false,
          profileAvatar: data.company?.profileAvatar || null,
          status: data.company?.status || 'active',

          // CompanyProfile data (if exists)
          tagline: data.profile?.tagline || 'Not Available',
          description: data.profile?.description || 'Not Available',
          mission: data.profile?.mission || '',
          vision: data.profile?.vision || '',
          about: data.profile?.about || '',
          
          yearEstablished: data.profile?.yearEstablished || null,
          employeeCount: data.profile?.employeeCount || null,
          
          // Format headquarters
          headquarters: data.profile?.city || data.profile?.state || data.profile?.country 
            ? [data.profile.city, data.profile.state, data.profile.country]
                .filter(item => item && item.trim() !== '')
                .join(', ') || 'Not Available'
            : 'Not Available',
            
          industry: data.profile?.businessCategory || 'Not Available',
          
          website: data.profile?.socialLinks?.website || '',
          companyPhone: data.profile?.companyPhone || data.company?.phone || '',
          companyEmail: data.profile?.companyEmail || data.company?.companyEmail || '',
          
          address: data.profile?.address || 'Not Available',
          city: data.profile?.city || '',
          state: data.profile?.state || '',
          country: data.profile?.country || '',
          pincode: data.profile?.pincode || '',
          
          logo: data.profile?.logo || null,
          coverImage: data.profile?.coverImage || null,
          
          socialLinks: data.profile?.socialLinks || {},
          
          servicesOffered: data.profile?.servicesOffered || [],
          clients: data.profile?.clients || [],
          awards: data.profile?.awards || [],
          hiringProcess: data.profile?.hiringProcess || [],
          
          registrationCertificate: data.profile?.registrationCertificate || '',
          gstNumber: data.profile?.gstNumber || '',
          panNumber: data.profile?.panNumber || '',
          cinNumber: data.profile?.cinNumber || '',
          
          // Format display values
          companySize: data.profile?.employeeCount 
            ? `${data.profile.employeeCount} employees`
            : 'Not Available',
            
          founded: data.profile?.yearEstablished?.toString() || 'Not Available',
          
          employees: data.profile?.employeeCount?.toString() || 'Not Available',
          
          // Use actual data or show empty state
          specialities: data.profile?.servicesOffered?.filter(item => item && item.trim() !== '') || [],
          
          recentHighlights: data.profile?.awards?.filter(item => item && item.trim() !== '') || [],
          
          stats: {
            jobOpenings: jobsCount,
          },
          
          profileCompleted: data.profileCompleted || false,
          
          // Include jobs data for Jobs tab
          jobs: data.jobs || []
        });
      } else {
        setError(response.data.message || 'Failed to fetch company profile');
      }
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setError(err.response?.data?.error || 'Failed to load company profile');
    } finally {
      setLoading(false);
    }
  };

  const handleViewJobs = () => {
    if (companyData) {
      navigate(`/jobs?companyId=${companyId}`);
    }
  };

  // Prepare jobs data for JobCards component
  const prepareJobsData = () => {
    if (!companyData.jobs || companyData.jobs.length === 0) {
      return [];
    }

    return companyData.jobs.map(job => ({
      ...job,
      // Ensure companyName is available
      companyName: companyData.companyName,
      // Add companyId for navigation
      companyId: companyId
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdBusiness className="text-red-600 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-gray-600 mb-6 max-w-md">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MdBusiness className="text-gray-400 text-2xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Company Not Found</h3>
          <p className="text-gray-600 mb-6">The company profile could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div>
        <Header/>
        <div className="min-h-screen bg-gray-50 mt-8">
          {/* Main Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/60 overflow-hidden">
              {/* Top section with cover image */}
              <div className="relative">
                {/* Cover Image */}
                <div className="relative h-32 md:h-40 rounded-t-2xl overflow-hidden">
                  {companyData.coverImage ? (
                    <img
                      src={companyData.coverImage}
                      alt="Company Cover"
                      className="w-full h-full object-cover object-center"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                          <div class="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10"></div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600">
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/10"></div>
                    </div>
                  )}
                </div>

                {/* Company Header */}
                <div className="px-6 md:px-8 pb-4 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 -mt-12">
                    <div className="flex items-start gap-6">
                      {/* Company Logo */}
                      <div className="relative">
                        {companyData.logo ? (
                          <div className="w-28 h-28 rounded-2xl bg-white flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                            <img
                              src={companyData.logo}
                              alt={companyData.companyName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.parentElement.innerHTML = `
                                  <div class="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border-4 border-white shadow-lg">
                                    <MdBusiness class="text-white text-5xl" />
                                  </div>
                                `;
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center border-4 border-white shadow-lg">
                            <MdBusiness className="text-white text-5xl" />
                          </div>
                        )}
                        {companyData.isVerified && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full">
                            <MdVerifiedUser className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Company Info */}
                      <div className="flex-1 mt-12 md:mt-14">
                        <div className="flex items-start justify-between">
                          <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                              {companyData.companyName}
                            </h1>
                            {companyData.tagline !== 'Not Available' && (
                              <>
                                <p className="text-gray-100 text-sm mb-4 md:hidden bg-blue-700/60 rounded-lg px-3 py-2 inline-block">
                                  {companyData.tagline}
                                </p>
                                <p className="text-gray-600 text-sm mb-4 hidden md:block">
                                  {companyData.tagline}
                                </p>
                              </>
                            )}
                          </div>
                          {!companyData.profileCompleted && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                              Profile Incomplete
                            </span>
                          )}
                        </div>

                        {/* Company Stats */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <FiMapPin className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Location</div>
                              <div className="font-medium text-gray-900">
                                {companyData.headquarters}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FiUsers className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Employees</div>
                              <div className="font-medium text-gray-900">
                                {companyData.employees}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FiBriefcase className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Industry</div>
                              <div className="font-medium text-gray-900">
                                {companyData.industry}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="text-xs text-gray-500">Founded</div>
                              <div className="font-medium text-gray-900">
                                {companyData.founded}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-b border-gray-200">
                <div className="px-8">
                  <div className="flex overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap border-b-2 ${
                          activeTab === tab
                            ? 'text-blue-600 border-blue-600'
                            : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-300'
                        }`}
                      >
                        {tab}
                        {tab === 'Jobs' && companyData.stats.jobOpenings > 0 && (
                          <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {companyData.stats.jobOpenings}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'Overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - About Us */}
                    <div className="lg:col-span-2">
                      {/* About Us Section */}
                      <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">About Us</h2>
                        <div className="prose max-w-none">
                          {companyData.description !== 'Not Available' ? (
                            <p className="text-gray-600 mb-6 leading-relaxed">
                              {companyData.description}
                            </p>
                          ) : (
                            <p className="text-gray-400 italic mb-6">No description available</p>
                          )}
                          
                          {companyData.mission && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Mission</h3>
                              <p className="text-gray-600">{companyData.mission}</p>
                            </div>
                          )}
                          
                          {companyData.vision && (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-3">Our Vision</h3>
                              <p className="text-gray-600">{companyData.vision}</p>
                            </div>
                          )}

                          {/* Services & Specialties */}
                          {companyData.specialities.length > 0 ? (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Services & Specialties
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {companyData.specialities.map((specialty, index) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-gray-700">{specialty}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="mb-6">
                              <h3 className="text-lg font-semibold text-gray-900 mb-4">Services & Specialties</h3>
                              <p className="text-gray-400 italic">No services or specialties listed</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Recent Highlights */}
                      {companyData.recentHighlights.length > 0 ? (
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Highlights</h2>
                          <div className="space-y-4">
                            {companyData.recentHighlights.map((highlight, index) => (
                              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                                <p className="text-gray-600">{highlight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Right Column - Company Details */}
                    <div>
                      <div className="sticky top-8">
                        {/* Company Details */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">Company Details</h2>
                          <div className="space-y-4">
                            {[
                              { icon: <MdWork className="text-gray-600" />, label: "Industry", value: companyData.industry },
                              { icon: <FiUsers className="text-gray-600" />, label: "Company Size", value: companyData.companySize },
                              { icon: <FiCalendar className="text-gray-600" />, label: "Founded", value: companyData.founded },
                              { icon: <MdLocationOn className="text-gray-600" />, label: "Headquarters", value: companyData.headquarters }
                            ].map((item, index) => (
                              <div key={index} className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  {item.icon}
                                </div>
                                <div>
                                  <div className="text-sm text-gray-500">{item.label}</div>
                                  <div className={`font-medium ${item.value === 'Not Available' ? 'text-gray-400 italic' : 'text-gray-900'}`}>
                                    {item.value}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
                          <div className="space-y-4">
                            {companyData.website && companyData.website.trim() !== '' && companyData.website !== 'https://example.com' ? (
                              <a
                                href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-blue-600 hover:text-blue-700"
                              >
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                  <FiGlobe className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{companyData.website}</div>
                                  <div className="text-sm text-gray-500">Website</div>
                                </div>
                                <FiExternalLink className="w-4 h-4 ml-auto" />
                              </a>
                            ) : (
                              <div className="flex items-center gap-3 text-gray-400">
                                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                                  <FiGlobe className="text-gray-400" />
                                </div>
                                <div>
                                  <div className="font-medium italic">Not Available</div>
                                  <div className="text-sm text-gray-400">Website</div>
                                </div>
                              </div>
                            )}
                            
                            {companyData.companyEmail && companyData.companyEmail.trim() !== '' ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                  <FiMail className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{companyData.companyEmail}</div>
                                  <div className="text-sm text-gray-500">Email</div>
                                </div>
                              </div>
                            ) : null}
                            
                            {companyData.companyPhone && companyData.companyPhone.trim() !== '' ? (
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                  <FiPhone className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{companyData.companyPhone}</div>
                                  <div className="text-sm text-gray-500">Phone</div>
                                </div>
                              </div>
                            ) : null}
                            
                            {companyData.address && companyData.address !== 'Not Available' && companyData.address.trim() !== '' ? (
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <FiMapPin className="text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{companyData.address}</div>
                                  <div className="text-sm text-gray-500">Address</div>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        </div>

                        {/* Social Media Links */}
                        {companyData.socialLinks && Object.keys(companyData.socialLinks).some(key => 
                          companyData.socialLinks[key] && companyData.socialLinks[key].trim() !== ''
                        ) ? (
                          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Connect With Us</h2>
                            <div className="grid grid-cols-2 gap-3">
                              {companyData.socialLinks.linkedin && companyData.socialLinks.linkedin.trim() !== '' && (
                                <a
                                  href={companyData.socialLinks.linkedin.startsWith('http') ? companyData.socialLinks.linkedin : `https://${companyData.socialLinks.linkedin}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <span className="font-semibold">in</span>
                                  </div>
                                  <span className="text-sm font-medium">LinkedIn</span>
                                </a>
                              )}
                              {companyData.socialLinks.twitter && companyData.socialLinks.twitter.trim() !== '' && (
                                <a
                                  href={companyData.socialLinks.twitter.startsWith('http') ? companyData.socialLinks.twitter : `https://${companyData.socialLinks.twitter}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <span className="font-semibold">𝕏</span>
                                  </div>
                                  <span className="text-sm font-medium">Twitter</span>
                                </a>
                              )}
                              {companyData.socialLinks.facebook && companyData.socialLinks.facebook.trim() !== '' && (
                                <a
                                  href={companyData.socialLinks.facebook.startsWith('http') ? companyData.socialLinks.facebook : `https://${companyData.socialLinks.facebook}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <span className="font-semibold">f</span>
                                  </div>
                                  <span className="text-sm font-medium">Facebook</span>
                                </a>
                              )}
                              {companyData.socialLinks.instagram && companyData.socialLinks.instagram.trim() !== '' && (
                                <a
                                  href={companyData.socialLinks.instagram.startsWith('http') ? companyData.socialLinks.instagram : `https://${companyData.socialLinks.instagram}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors"
                                >
                                  <div className="w-6 h-6 flex items-center justify-center">
                                    <span className="font-semibold">ig</span>
                                  </div>
                                  <span className="text-sm font-medium">Instagram</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {/* Quick Actions */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                          <div className="space-y-3">
                            <button
                              onClick={handleViewJobs}
                              className="w-full text-left p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                <MdWork className="text-blue-600" />
                                <div>
                                  <div className="font-medium">View Open Jobs</div>
                                  <div className="text-sm">{companyData.stats.jobOpenings} positions available</div>
                                </div>
                              </div>
                              <FiChevronRight className="w-4 h-4" />
                            </button>
                            {companyData.whatsAppNumber && companyData.whatsAppNumber.trim() !== '' && (
                              <a
                                href={`https://wa.me/${companyData.whatsAppNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-left p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-between"
                              >
                                <div className="flex items-center gap-3">
                                  <FiMessageSquare className="text-green-600" />
                                  <div>
                                    <div className="font-medium">Message on WhatsApp</div>
                                    <div className="text-sm">Quick communication</div>
                                  </div>
                                </div>
                                <FiExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Jobs' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        Job Openings ({companyData.jobs.length})
                      </h2>
                      <button
                        onClick={handleViewJobs}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                      >
                        View All Jobs
                      </button>
                    </div>
                    
                    {companyData.jobs.length === 0 ? (
                      <div className="text-center py-12">
                        <MdWork className="text-5xl text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Job Openings</h3>
                        <p className="text-gray-600 mb-6">There are currently no open positions at {companyData.companyName}</p>
                      </div>
                    ) : (
                      <>
                        {/* Use JobCards component */}
                        <JobCards jobs={prepareJobsData()} />
                        
                        {/* View All Button for large job lists */}
                        {companyData.jobs.length > 6 && (
                          <div className="text-center pt-6">
                            <p className="text-gray-600 mb-4">
                              Showing all {companyData.jobs.length} jobs
                            </p>
                            <button
                              onClick={handleViewJobs}
                              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                              View Jobs in Full Page
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompanyProfile;
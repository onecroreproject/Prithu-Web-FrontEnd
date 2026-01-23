import React, { useState, useEffect, useRef } from 'react';
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
  FiMessageSquare,
  FiBookOpen,
  FiClock,
  FiDollarSign,
  FiGrid,
  FiList,
  FiArrowLeft,
  FiImage,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon,
  FiX,
  FiFileText,
  FiEye,
  FiEyeOff,
  FiLock,
  FiLinkedin,
  FiFacebook,
  FiInstagram,
  FiTwitter,
  FiYoutube,
  FiActivity,
  FiCheckCircle,
  FiFile
} from 'react-icons/fi';
import {
  MdBusiness,
  MdWork,
  MdLocationOn,
  MdEmail,
  MdPhone,
  MdVerifiedUser,
  MdSchool,
  MdPhotoLibrary,
  MdCollections,
  MdArrowBack,
  MdArrowForward,
  MdPerson,
  MdDashboard,
  MdTrendingUp
} from 'react-icons/md';
import { FaLinkedinIn, FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import axios from '../../api/axios';
import Header from '../../components/Header';
import JobCards from '../../components/Jobs/HeaderJobs/JobCards';

// Import new components
import FeaturedEmployers from '../../components/Jobs/HeaderJobs/futureEmployees';
import DiversityConsciousEmployers from '../../components/Jobs/HeaderJobs/diversityConsusionEmployee';
import JobCourses from '../../components/Jobs/HeaderJobs/jobcourse';
import JobBlogs from '../../components/Jobs/HeaderJobs/jobBlogs';

const CompanyProfile = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');

  const [viewMode, setViewMode] = useState('card');
  const [coursesData, setCoursesData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const galleryRef = useRef(null);

  const tabs = ['Overview', 'Jobs', 'Courses', 'Gallery'];

  useEffect(() => {
    if (companyId) {
      fetchCompanyProfile();
    }
  }, [companyId]);

  // Function to safely parse social links from the array structure
  const parseSocialLinks = (socialLinksData) => {
    if (!socialLinksData) return {};
    
    // If it's an array, try to parse the first valid entry
    if (Array.isArray(socialLinksData)) {
      for (const item of socialLinksData) {
        if (typeof item === 'string') {
          try {
            const parsed = JSON.parse(item);
            if (parsed && typeof parsed === 'object') {
              return parsed;
            }
          } catch (e) {
            // Continue to next item
            continue;
          }
        } else if (typeof item === 'object') {
          return item;
        }
      }
    } 
    // If it's already an object
    else if (typeof socialLinksData === 'object') {
      return socialLinksData;
    }
    
    return {};
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
        
        const company = data.company || {};
        const profile = data.profile || {};
        
        // Parse social links properly
        const socialLinks = parseSocialLinks(profile.socialLinks);
        
        // Helper function to check if field should be shown
        const shouldShowField = (value) => {
          if (!value || value === 'Not Available' || value === '' || value === 'https://example.com') {
            return false;
          }
          return true;
        };
        
        // Helper function to get value with default
        const getValue = (value, defaultValue = 'N/A') => {
          if (!shouldShowField(value)) {
            return defaultValue;
          }
          if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? defaultValue : trimmed;
          }
          return value;
        };
        
        // Build headquarters
        const headquartersParts = [
          shouldShowField(profile.city) ? getValue(profile.city, null) : null,
          shouldShowField(profile.state) ? getValue(profile.state, null) : null,
          shouldShowField(profile.country) ? getValue(profile.country, null) : null
        ].filter(item => item !== null && item !== 'N/A');
        
        const headquarters = headquartersParts.length > 0 ? headquartersParts.join(', ') : 'N/A';
        
        // Get contact info
        const companyEmail = shouldShowField(profile.hiringEmail) 
          ? getValue(profile.hiringEmail)
          : shouldShowField(company.email)
            ? getValue(company.email)
            : 'N/A';
        
        const companyPhone = shouldShowField(profile.hrPhone)
          ? getValue(profile.hrPhone)
          : shouldShowField(company.phone)
            ? getValue(company.phone)
            : 'N/A';
        
        // Process gallery images
        const galleryImages = Array.isArray(profile.galleryImages) 
          ? profile.galleryImages.filter(url => 
              url && typeof url === 'string' && url.trim() !== ''
            )
          : [];
        
        // Process documents
        const documents = [];
        if (shouldShowField(profile.registrationCertificate)) {
          documents.push({
            name: 'Registration Certificate',
            url: profile.registrationCertificate,
            type: 'pdf'
          });
        }
        if (shouldShowField(profile.gstNumber) && profile.gstNumber.trim() !== '') {
          documents.push({
            name: 'GST Certificate',
            number: profile.gstNumber,
            type: 'text'
          });
        }
        if (shouldShowField(profile.panNumber) && profile.panNumber.trim() !== '') {
          documents.push({
            name: 'PAN Card',
            number: profile.panNumber,
            type: 'text'
          });
        }
        
        // Set company data
        const companyData = {
          companyName: getValue(company.companyName, 'Company Name N/A'),
          email: getValue(company.email, ''),
          name: getValue(company.name, ''),
          position: getValue(company.position, ''),
          phone: getValue(company.phone, ''),
          whatsAppNumber: getValue(company.whatsAppNumber, ''),
          isVerified: company.isVerified || false,
          profileAvatar: getValue(company.profileAvatar, null),
          status: getValue(company.status, 'active'),

          tagline: getValue(profile.tagline),
          description: getValue(profile.description),
          mission: getValue(profile.mission, ''),
          vision: getValue(profile.vision, ''),
          about: getValue(profile.about, ''),
          
          yearEstablished: profile.yearEstablished || null,
          employeeCount: profile.employeeCount || null,
          
          headquarters: headquarters,
          address: shouldShowField(profile.address) ? getValue(profile.address) : 'N/A',
          city: getValue(profile.city, ''),
          state: getValue(profile.state, ''),
          country: getValue(profile.country, ''),
          pincode: shouldShowField(profile.pincode) ? getValue(profile.pincode, '') : '',
          
          industry: getValue(profile.businessCategory),
          
          website: getValue(socialLinks.website, ''),
          companyEmail: companyEmail,
          companyPhone: companyPhone,
          
          // HR Contact Info
          hrName: getValue(profile.hrName, ''),
          hrPhone: getValue(profile.hrPhone, ''),
          hiringEmail: getValue(profile.hiringEmail, ''),
          
          logo: getValue(profile.logo, null),
          coverImage: getValue(profile.coverImage, null),
          galleryImages: galleryImages,
          
          socialLinks: socialLinks,
          
          // Job Statistics
          jobCounts: data.jobCounts || { active: 0, expired: 0, totalPosted: 0 },
          shortlistedApplicationsCount: data.shortlistedApplicationsCount || 0,
          
          // Removed: servicesOffered, clients, awards, hiringProcess, cinNumber
          
          registrationCertificate: getValue(profile.registrationCertificate, ''),
          gstNumber: getValue(profile.gstNumber, ''),
          panNumber: getValue(profile.panNumber, ''),
          cinNumber: getValue(profile.cinNumber, ''),
          documents: documents,
          
          companySize: shouldShowField(profile.employeeCount) 
            ? `${profile.employeeCount} employees` 
            : 'N/A',
          founded: shouldShowField(profile.yearEstablished) 
            ? profile.yearEstablished.toString() 
            : 'N/A',
          employees: shouldShowField(profile.employeeCount) 
            ? profile.employeeCount.toString() 
            : 'N/A',
          
          // Removed specialities and recentHighlights
          
          stats: {
            jobOpenings: jobsCount,
          },
          
          profileCompleted: data.profileCompleted || false,
          jobs: data.jobs || []
        };

        setCompanyData(companyData);
        
        // Check if company has courses
        if (profile.courses && Array.isArray(profile.courses) && profile.courses.length > 0) {
          setCoursesData(profile.courses.map(course => ({
            ...course,
            discountedPrice: course.discountedPrice || course.price,
            rating: course.rating || 0,
            reviews: course.reviews || 0,
            students: course.enrolledCount || 0,
            isFeatured: course.isFeatured || false,
            isCertified: course.isCertified || false,
            enrollmentOpen: course.status === 'active',
            logo: course.logo || companyData.logo
          })));
        } else {
          setCoursesData([]);
        }
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

  const handleViewCourses = () => {
    if (coursesData.length > 0) {
      navigate(`/courses?company=${companyId}`);
    }
  };



  const handleBack = () => {
    navigate(-1);
  };

  const openGalleryModal = (imageUrl, index) => {
    setSelectedImage(imageUrl);
    setCurrentGalleryIndex(index);
    setShowGalleryModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const nextGalleryImage = () => {
    if (companyData?.galleryImages?.length) {
      const nextIndex = (currentGalleryIndex + 1) % companyData.galleryImages.length;
      setCurrentGalleryIndex(nextIndex);
      setSelectedImage(companyData.galleryImages[nextIndex]);
    }
  };

  const prevGalleryImage = () => {
    if (companyData?.galleryImages?.length) {
      const prevIndex = (currentGalleryIndex - 1 + companyData.galleryImages.length) % companyData.galleryImages.length;
      setCurrentGalleryIndex(prevIndex);
      setSelectedImage(companyData.galleryImages[prevIndex]);
    }
  };

  const prepareJobsData = () => {
    if (!companyData?.jobs || companyData.jobs.length === 0) {
      return [];
    }

    return companyData.jobs.map(job => ({
      ...job,
      companyName: companyData.companyName,
      companyId: companyId
    }));
  };

  const handleViewModeToggle = (mode) => {
    setViewMode(mode);
  };

  // Scroll gallery horizontally
  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = 300;
      galleryRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Social Links Section Component
  const SocialLinksSection = () => {
    if (!companyData?.socialLinks || typeof companyData.socialLinks !== 'object') {
      return null;
    }

    const socialPlatforms = [
      { key: 'linkedin', icon: FiLinkedin, label: 'LinkedIn', color: 'bg-blue-600' },
      { key: 'facebook', icon: FiFacebook, label: 'Facebook', color: 'bg-blue-700' },
      { key: 'instagram', icon: FiInstagram, label: 'Instagram', color: 'bg-pink-600' },
      { key: 'twitter', icon: FiTwitter, label: 'Twitter', color: 'bg-blue-400' },
      { key: 'youtube', icon: FiYoutube, label: 'YouTube', color: 'bg-red-600' },
    ];

    const hasSocialLinks = socialPlatforms.some(platform => 
      companyData.socialLinks[platform.key] && 
      companyData.socialLinks[platform.key] !== '' && 
      companyData.socialLinks[platform.key] !== 'N/A'
    );

    if (!hasSocialLinks) {
      return null;
    }

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Follow Us</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {socialPlatforms.map((platform) => {
            const link = companyData.socialLinks[platform.key];
            if (!link || link === '' || link === 'N/A') return null;
            
            const Icon = platform.icon;
            return (
              <a
                key={platform.key}
                href={link.startsWith('http') ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${platform.color} text-white rounded-xl p-4 flex flex-col items-center justify-center hover:opacity-90 transition-opacity`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm font-medium">{platform.label}</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  // Job Statistics Section
  const JobStatisticsSection = () => (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <MdDashboard className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Job Statistics</h2>
          <p className="text-blue-100 text-sm">Performance insights</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{companyData.jobCounts.active}</div>
              <div className="text-sm text-blue-100">Active Jobs</div>
            </div>
            <FiActivity className="w-8 h-8 text-green-300" />
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{companyData.jobCounts.totalPosted}</div>
              <div className="text-sm text-blue-100">Total Posted</div>
            </div>
            <MdTrendingUp className="w-8 h-8 text-blue-300" />
          </div>
        </div>

        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{companyData.shortlistedApplicationsCount}</div>
              <div className="text-sm text-blue-100">Shortlisted</div>
            </div>
            <FiCheckCircle className="w-8 h-8 text-yellow-300" />
          </div>
        </div>
      </div>
    </div>
  );

  // Contact Info Section - Enhanced
  const ContactInfoSection = () => {
    const hasVisibleContactInfo = () => {
      return (
        (companyData.website && companyData.website !== 'N/A' && companyData.website !== '') ||
        (companyData.companyEmail && companyData.companyEmail !== 'N/A' && companyData.companyEmail !== '') ||
        (companyData.companyPhone && companyData.companyPhone !== 'N/A' && companyData.companyPhone !== '') ||
        (companyData.hrName && companyData.hrName !== 'N/A' && companyData.hrName !== '') ||
        (companyData.hiringEmail && companyData.hiringEmail !== 'N/A' && companyData.hiringEmail !== '')
      );
    };

    if (!hasVisibleContactInfo()) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Hiring Team
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companyData.website && companyData.website !== 'N/A' && companyData.website !== '' && (
            <a
              href={companyData.website.startsWith('http') ? companyData.website : `https://${companyData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FiGlobe className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">Official Website</div>
                  <div className="text-sm text-blue-600 truncate">{companyData.website}</div>
                </div>
                <FiExternalLink className="text-blue-500" />
              </div>
            </a>
          )}
          
          {companyData.hiringEmail && companyData.hiringEmail !== 'N/A' && companyData.hiringEmail !== '' && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">Hiring Email</div>
                  <div className="text-sm text-gray-600 truncate">{companyData.hiringEmail}</div>
                </div>
              </div>
            </div>
          )}
          
          {companyData.companyEmail && companyData.companyEmail !== 'N/A' && companyData.companyEmail !== '' && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <MdEmail className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">General Email</div>
                  <div className="text-sm text-gray-600 truncate">{companyData.companyEmail}</div>
                </div>
              </div>
            </div>
          )}
          
          {companyData.hrName && companyData.hrName !== 'N/A' && companyData.hrName !== '' && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <MdPerson className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900">HR Contact</div>
                  <div className="text-sm text-gray-600 truncate">{companyData.hrName}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Gallery Tab Component - Enhanced
  const GalleryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <MdPhotoLibrary className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Company Gallery</h2>
              <p className="text-gray-600 text-sm">Visual showcase ({companyData.galleryImages.length} images)</p>
            </div>
          </div>
          {companyData.galleryImages.length > 4 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollGallery('left')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => scrollGallery('right')}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <FiChevronRightIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
        </div>

        {companyData.galleryImages.length === 0 ? (
          <div className="text-center py-8">
            <MdCollections className="text-4xl text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Gallery Images</h3>
            <p className="text-gray-600">No gallery images available</p>
          </div>
        ) : (
          <>
            <div 
              ref={galleryRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {companyData.galleryImages.map((imageUrl, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-72 h-56 rounded-xl overflow-hidden cursor-pointer group relative"
                  onClick={() => openGalleryModal(imageUrl, index)}
                >
                  <img
                    src={imageUrl}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                          <FiImage class="w-12 h-12 text-gray-400" />
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white text-sm font-medium">View Image {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {companyData.documents && companyData.documents.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Company Documents</h2>
              <p className="text-gray-600 text-sm">Legal and registration documents</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {companyData.documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl hover:shadow-md transition-shadow border border-gray-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  {doc.type === 'pdf' ? (
                    <FiFileText className="text-red-500 w-6 h-6" />
                  ) : (
                    <FiFile className="text-blue-500 w-6 h-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{doc.name}</div>
                  {doc.url ? (
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 truncate block flex items-center gap-1"
                    >
                      View Document <FiExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <div className="text-sm text-gray-600 font-mono">{doc.number}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Company Details Section - Enhanced
  const CompanyDetailsSection = () => {
    const details = [];
    
    if (companyData.industry && companyData.industry !== 'N/A') {
      details.push({ 
        label: 'Industry', 
        value: companyData.industry,
        icon: FiBriefcase,
        color: 'text-blue-600',
        bg: 'bg-blue-50'
      });
    }
    
    if (companyData.companySize && companyData.companySize !== 'N/A') {
      details.push({ 
        label: 'Company Size', 
        value: companyData.companySize,
        icon: FiUsers,
        color: 'text-green-600',
        bg: 'bg-green-50'
      });
    }
    
    if (companyData.founded && companyData.founded !== 'N/A') {
      details.push({ 
        label: 'Founded', 
        value: companyData.founded,
        icon: FiCalendar,
        color: 'text-purple-600',
        bg: 'bg-purple-50'
      });
    }
    
    if (companyData.headquarters && companyData.headquarters !== 'N/A') {
      details.push({ 
        label: 'Headquarters', 
        value: companyData.headquarters,
        icon: FiMapPin,
        color: 'text-red-600',
        bg: 'bg-red-50'
      });
    }

    if (details.length === 0) {
      return null;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {details.map((detail, index) => {
          const Icon = detail.icon;
          return (
            <div key={index} className={`${detail.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${detail.color.replace('text', 'bg')}/10`}>
                  <Icon className={`w-5 h-5 ${detail.color}`} />
                </div>
                <div className="text-sm font-medium text-gray-500">{detail.label}</div>
              </div>
              <div className="text-lg font-semibold text-gray-900">{detail.value}</div>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MdBusiness className="text-red-600 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Profile</h3>
          <p className="text-gray-600 mb-8">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MdBusiness className="text-gray-400 text-3xl" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Company Not Found</h3>
          <p className="text-gray-600 mb-8">The company profile could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          {/* Cover Photo - Enhanced */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl mb-6">
            <div className="relative h-48 md:h-64">
              {companyData.coverImage && companyData.coverImage.trim() !== "" ? (
                <img
                  src={companyData.coverImage}
                  alt="Company Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600"></div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={handleBack}
                      className="flex items-center gap-2 text-white hover:text-blue-100 transition-colors backdrop-blur-sm bg-white/10 px-4 py-2 rounded-xl"
                    >
                      <FiArrowLeft className="w-5 h-5" />
                      <span className="font-medium">Back</span>
                    </button>


                  </div>

                  <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6">
                    {/* Company Logo */}
                    <div className="relative">
                      <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
                        {companyData.logo && companyData.logo.trim() !== "" ? (
                          <img
                            src={companyData.logo}
                            alt={companyData.companyName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600">
                            <MdBusiness className="w-10 h-10 text-white" />
                          </div>
                        )}
                      </div>
                      
                      {companyData.isVerified && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>

                    <div className="flex-1 text-white">
                      <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                        {companyData.companyName}
                      </h1>
                      
                      {companyData.tagline !== 'N/A' && companyData.tagline !== '' && (
                        <p className="text-xl text-blue-100 mb-6">
                          {companyData.tagline}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-3">
                        {companyData.headquarters && companyData.headquarters !== 'N/A' && (
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <FiMapPin className="w-4 h-4" />
                            <span className="font-medium">{companyData.headquarters}</span>
                          </div>
                        )}
                        
                        {companyData.employees && companyData.employees !== 'N/A' && (
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <FiUsers className="w-4 h-4" />
                            <span className="font-medium">{companyData.employees} employees</span>
                          </div>
                        )}
                        
                        {companyData.industry && companyData.industry !== 'N/A' && (
                          <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                            <FiBriefcase className="w-4 h-4" />
                            <span className="font-medium">{companyData.industry}</span>
                          </div>
                        )}
                        
                        {companyData.stats.jobOpenings > 0 && (
                          <div className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 rounded-xl shadow-md">
                            <MdWork className="w-4 h-4" />
                            <span className="font-semibold">{companyData.stats.jobOpenings} Open Positions</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Statistics */}
              <JobStatisticsSection />

              {/* Navigation Tabs */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex overflow-x-auto pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-5 py-3 font-medium text-sm transition-all whitespace-nowrap relative ${
                        activeTab === tab
                          ? 'text-blue-600'
                          : 'text-gray-600 hover:text-blue-600'
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                      )}
                      {tab === 'Jobs' && companyData.stats.jobOpenings > 0 && (
                        <span className="ml-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">
                          {companyData.stats.jobOpenings}
                        </span>
                      )}
                      {tab === 'Gallery' && companyData.galleryImages.length > 0 && (
                        <span className="ml-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                          {companyData.galleryImages.length}
                        </span>
                      )}
                      {tab === 'Courses' && coursesData.length > 0 && (
                        <span className="ml-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                          {coursesData.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-6">
                  {activeTab === 'Overview' && (
                    <div className="space-y-8">
                      {/* About Company */}
                      {companyData.description && companyData.description !== 'N/A' && companyData.description !== '' && (
                        <div className="space-y-4">
                          <h2 className="text-2xl font-bold text-gray-900">About Company</h2>
                          <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{companyData.description}</p>
                          </div>
                        </div>
                      )}

                      {/* Company Details */}
                      <CompanyDetailsSection />

                      {/* Contact Information */}
                      <ContactInfoSection />

                      {/* Social Links */}
                      <SocialLinksSection />

                      {/* Quick Actions */}
                      <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {companyData.stats.jobOpenings > 0 && (
                            <button
                              onClick={handleViewJobs}
                              className="text-left p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:shadow-lg transition-all border border-blue-100 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                  <MdWork className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">View Open Jobs</div>
                                  <div className="text-sm text-blue-600">{companyData.stats.jobOpenings} available positions</div>
                                </div>
                              </div>
                              <FiChevronRight className="text-blue-500 group-hover:translate-x-2 transition-transform" />
                            </button>
                          )}
                          
                          {coursesData.length > 0 && (
                            <button
                              onClick={handleViewCourses}
                              className="text-left p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:shadow-lg transition-all border border-green-100 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                  <MdSchool className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-900">Browse Courses</div>
                                  <div className="text-sm text-green-600">{coursesData.length} training programs</div>
                                </div>
                              </div>
                              <FiChevronRight className="text-green-500 group-hover:translate-x-2 transition-transform" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'Jobs' && (
                    <div className="space-y-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Job Openings ({companyData.jobs.length})
                          </h2>
                          <p className="text-gray-600">Current opportunities at {companyData.companyName}</p>
                        </div>
                        {companyData.jobs.length > 0 && (
                          <button
                            onClick={handleViewJobs}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-semibold shadow-md"
                          >
                            View All Jobs
                          </button>
                        )}
                      </div>
                      
                      {companyData.jobs.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdWork className="text-3xl text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Job Openings</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">There are currently no open positions at {companyData.companyName}.</p>
                        </div>
                      ) : (
                        <>
                          <JobCards jobs={prepareJobsData()} />
                          {companyData.jobs.length > 6 && (
                            <div className="text-center pt-8">
                              <button
                                onClick={handleViewJobs}
                                className="px-8 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:shadow-lg transition-all font-semibold border border-gray-200"
                              >
                                View All {companyData.jobs.length} Jobs
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'Courses' && (
                    <div className="space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            Training Programs ({coursesData.length})
                          </h2>
                          <p className="text-gray-600">Educational opportunities by {companyData.companyName}</p>
                        </div>
                        
                        {coursesData.length > 0 && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-xl border border-gray-200">
                              <button
                                onClick={() => handleViewModeToggle('card')}
                                className={`p-3 rounded-lg ${
                                  viewMode === 'card'
                                    ? 'bg-white text-blue-600 shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <FiGrid className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleViewModeToggle('list')}
                                className={`p-3 rounded-lg ${
                                  viewMode === 'list'
                                    ? 'bg-white text-blue-600 shadow-md'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <FiList className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {coursesData.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MdSchool className="text-3xl text-gray-400" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Courses Available</h3>
                          <p className="text-gray-600 max-w-md mx-auto">{companyData.companyName} hasn't published any training programs yet.</p>
                        </div>
                      ) : (
                        <>
                          {viewMode === 'card' ? <CardView coursesData={coursesData} /> : <ListView coursesData={coursesData} />}
                          {coursesData.length > 6 && (
                            <div className="text-center pt-8">
                              <button
                                onClick={handleViewCourses}
                                className="px-8 py-3 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 rounded-xl hover:shadow-lg transition-all font-semibold border border-gray-200"
                              >
                                View All {coursesData.length} Courses
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeTab === 'Gallery' && <GalleryTab />}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <FeaturedEmployers />
              <DiversityConsciousEmployers />
              <JobCourses />
              <JobBlogs />
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
          <div className="relative w-full max-w-6xl max-h-[90vh]">
            <button
              onClick={closeGalleryModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-3xl z-10 bg-black/50 w-10 h-10 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
            <div className="relative">
              <button
                onClick={prevGalleryImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <MdArrowBack className="w-6 h-6" />
              </button>
              
              <div className="w-full h-[70vh] rounded-2xl overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Gallery View"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-gray-800 to-gray-900">
                        <FiImage class="w-20 h-20 text-gray-400 mb-4" />
                        <span class="text-gray-400 text-lg">Image not available</span>
                      </div>
                    `;
                  }}
                />
              </div>
              
              <button
                onClick={nextGalleryImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
              >
                <MdArrowForward className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-4 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className="text-white font-semibold">
                  Image {currentGalleryIndex + 1} of {companyData?.galleryImages?.length || 0}
                </div>
                <div className="flex items-center gap-2">
                  {companyData?.galleryImages?.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentGalleryIndex ? 'bg-white' : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Card View for Courses
const CardView = ({ coursesData }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {coursesData.map((course) => (
      <div key={course.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600">
          {course.isFeatured && (
            <span className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Featured
            </span>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-full">
                {course.category || 'Course'}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-3 line-clamp-1">
                {course.title}
              </h3>
            </div>
            {course.logo && (
              <img
                src={course.logo}
                alt={course.company || 'Company'}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-md"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-md">
                      <MdSchool class="w-6 h-6 text-gray-400" />
                    </div>
                  `;
                }}
              />
            )}
          </div>

          <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
            {course.description || 'No description available'}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <FiClock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="text-sm font-semibold text-gray-900">{course.duration || 'N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Students</div>
                <div className="text-sm font-semibold text-gray-900">{course.students.toLocaleString()}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              {course.discountedPrice && course.discountedPrice !== course.price ? (
                <>
                  <span className="text-xl font-bold text-gray-900">{course.discountedPrice}</span>
                  <span className="text-gray-500 line-through ml-2 text-sm">{course.price}</span>
                </>
              ) : (
                <span className="text-xl font-bold text-gray-900">{course.price || 'Free'}</span>
              )}
            </div>
            <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold">
              {course.enrollmentOpen ? 'Enroll Now' : 'Coming Soon'}
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// List View for Courses
const ListView = ({ coursesData }) => (
  <div className="space-y-4">
    {coursesData.map((course) => (
      <div key={course.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="lg:w-1/4">
            <div className="relative h-48 lg:h-32 rounded-xl overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 shadow-md">
              {course.logo ? (
                <img
                  src={course.logo}
                  alt={course.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <MdSchool class="w-12 h-12 text-white" />
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MdSchool className="w-12 h-12 text-white" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-3/4">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold text-blue-600 bg-gradient-to-r from-blue-50 to-blue-100 px-3 py-1.5 rounded-full">
                  {course.category || 'Course'}
                </span>
                <span className="text-xs font-bold text-gray-600 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-full">
                  {course.level || 'All Levels'}
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {course.title}
              </h3>
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {course.description || 'No description available'}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="flex items-center gap-3">
                <FiClock className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-500">Duration</div>
                  <div className="font-semibold text-gray-900">{course.duration || 'N/A'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiUsers className="w-4 h-4 text-green-600" />
                <div>
                  <div className="text-xs text-gray-500">Students</div>
                  <div className="font-semibold text-gray-900">{course.students.toLocaleString()}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiStar className="w-4 h-4 text-yellow-500" />
                <div>
                  <div className="text-xs text-gray-500">Rating</div>
                  <div className="font-semibold text-gray-900">{course.rating} ⭐</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FiDollarSign className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-500">Price</div>
                  <div className="font-semibold text-gray-900">
                    {course.discountedPrice && course.discountedPrice !== course.price ? (
                      <>
                        <span className="text-green-600">{course.discountedPrice}</span>
                        <span className="text-gray-400 line-through text-xs ml-1">{course.price}</span>
                      </>
                    ) : (
                      <span>{course.price || 'Free'}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {(course.instructor?.charAt(0) || 'I')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{course.instructor || 'Instructor'}</div>
                  <div className="text-xs text-gray-500">Course Instructor</div>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all text-sm font-bold">
                {course.enrollmentOpen ? 'Enroll Now' : 'Notify Me'}
              </button>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default CompanyProfile;
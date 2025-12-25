import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, Briefcase, Clock, DollarSign, Users, BookOpen, Star,
  Share2, ArrowLeft, ArrowRight, Building, Calendar, Target,
  Heart, Send, FileText, Award, Zap, CheckCircle, Users as UsersIcon,
  FileCode, Layers, Database, Cpu, GitBranch, Cloud, ChevronRight,
  Info, AlertCircle
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import SharePopup from "../../FeedPageComponent/sharePopUp";
import SimilarJobsSection from "./similarJobs";

export default function JobPage({ 
  job, 
  onNext, 
  onPrevious, 
  onClose, 
  currentIndex, 
  totalJobs,
  showNavigation 
}) {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(job?.isSaved || false);
  const [isLiked, setIsLiked] = useState(job?.isLiked || false);
  const [isApplying, setIsApplying] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [locations, setLocations] = useState([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [locationError, setLocationError] = useState(null);

  // Fetch job locations on component mount
  useEffect(() => {
    fetchJobLocations();
  }, []);

 

  const fetchJobLocations = async () => {
    try {
      setIsLoadingLocations(true);
      setLocationError(null);
      
      const response = await api.get("/api/get/job/locations");
      
      console.log("location", response.data);
      
      if (response.data.success) {
        const uniqueCities = extractUniqueCities(response.data.locations);
        setLocations(uniqueCities);
      } else {
        setLocationError("Failed to fetch locations");
        setLocations(getDefaultLocations());
      }
    } catch (error) {
      console.error("Error fetching job locations:", error);
      setLocationError("Error loading locations");
      setLocations(getDefaultLocations());
    } finally {
      setIsLoadingLocations(false);
    }
  };

  const extractUniqueCities = (locationsData) => {
    if (!locationsData || !Array.isArray(locationsData)) {
      return getDefaultLocations();
    }

    const uniqueStates = new Set();
    const uniqueCities = new Set();
    
    locationsData.forEach(location => {
      if (location?.location?.state && typeof location.location.state === 'string') {
        const state = location.location.state.trim();
        if (state.length > 0) {
          uniqueStates.add(state);
        }
      }
      
      if (location?.location?.city && typeof location.location.city === 'string') {
        const city = location.location.city.trim();
        if (city.length > 0) {
          uniqueCities.add(city);
        }
      }
    });

    let locations = [];
    
    if (uniqueStates.size > 0) {
      locations = Array.from(uniqueStates)
        .map(state => {
          return state
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        })
        .sort((a, b) => a.localeCompare(b));
    } else if (uniqueCities.size > 0) {
      locations = Array.from(uniqueCities)
        .map(city => {
          return city
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        })
        .sort((a, b) => a.localeCompare(b));
    }
    
    const finalLocations = locations.slice(0, 10);
    return finalLocations;
  };

  const getDefaultLocations = () => {
    return [
      "Bangalore",
      "Mumbai", 
      "Delhi NCR",
      "Noida",
      "Gurgaon/Gurugram",
      "Hyderabad",
      "Chennai",
      "Coimbatore",
      "Pune",
      "Kolkata"
    ];
  };

  const handleLocationClick = (location) => {
    navigate(`/jobs?state=${encodeURIComponent(location)}`);
  };

  const renderLocationsSection = () => (
    <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
      <h3 className="font-bold text-gray-900 text-lg mb-4">Jobs by location</h3>
      
      {isLoadingLocations ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : locationError ? (
        <div className="text-center py-4">
          <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600 text-sm mb-3">{locationError}</p>
          <button
            onClick={fetchJobLocations}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      ) : locations.length === 0 ? (
        <div className="text-center py-4">
          <MapPin className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600 text-sm">No locations available</p>
        </div>
      ) : (
        <div className="space-y-2">
          {locations.map((location, index) => (
            <button
              key={index}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              onClick={() => handleLocationClick(location)}
              disabled={isLoadingLocations}
            >
              <span className="text-gray-700 truncate">{location}</span>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </button>
          ))}
        </div>
      )}
      
      {locations.length > 0 && !isLoadingLocations && !locationError && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Showing {locations.length} active job {locations.length === 1 ? 'location' : 'locations'}
          </p>
        </div>
      )}
    </div>
  );

  if (!job) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Briefcase className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Job Not Found</h2>
        <p className="text-gray-600 mb-6 max-w-sm">The job you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={onClose}
          className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          Browse Jobs
        </button>
      </div>
    </div>
  );

  // Calculate time left until expiration
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!job.endDate) return;
      
      const endDate = new Date(job.endDate);
      const now = new Date();
      const difference = endDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft("Expired");
        return;
      }
      
      setIsExpired(false);
      
      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Format based on time remaining
      if (days > 365) {
        const years = Math.floor(days / 365);
        setTimeLeft(`Expires in ${years} year${years > 1 ? 's' : ''}`);
      } else if (days > 30) {
        const months = Math.floor(days / 30);
        setTimeLeft(`Expires in ${months} month${months > 1 ? 's' : ''}`);
      } else if (days > 0) {
        setTimeLeft(`Expires in ${days} day${days > 1 ? 's' : ''}${hours > 0 ? ` ${hours}hr` : ''}`);
      } else if (hours > 0) {
        setTimeLeft(`Expires in ${hours}hr ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`Expires in ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`Expires in ${seconds}s`);
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [job.endDate]);

  const formatSalary = (min, max, type = 'monthly', currency = 'INR') => {
    if (!min && !max) return "Salary not disclosed";
    
    const format = (amount) => {
      if (!amount) return '0';
      return new Intl.NumberFormat('en-IN').format(amount);
    };
    
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency;
    const salaryText = `${symbol}${format(min)} - ${symbol}${format(max)}`;
    const typeText = type?.charAt(0).toUpperCase() + type?.slice(1) || 'Monthly';
    
    return `${salaryText} per ${typeText}`;
  };

  const getExperienceText = () => {
    const min = job.minimumExperience || 0;
    const max = job.maximumExperience || 0;
    
    if (job.freshersAllowed) return "Fresher";
    if (min === 0 && max === 0) return "Not specified";
    if (min === max) return `${min} year${min > 1 ? 's' : ''}`;
    return `${min} - ${max} years`;
  };

  const handleBack = () => {
    navigate("/jobs");
  };

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);

    } catch (error) {
      console.error("Failed to save job:", error);
      toast.error("Failed to save job");
    }
  };

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);

    } catch (error) {
      console.error("Failed to like job:", error);
      toast.error("Failed to like job");
    }
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleApply = () => {
    if (isExpired || job.status === "expired") {
      toast.error("This job posting has expired");
      return;
    }
    navigate(`/job/apply/${job._id}`);
  };

  const isNewJob = () => {
    if (!job.createdAt) return false;
    const postedDate = new Date(job.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const formatArrayForDisplay = (array) => {
    if (!array || !Array.isArray(array) || array.length === 0) return [];
    return array.filter(item => item && item.toString().trim() !== '');
  };

  const getSkillIcon = (skill) => {
    const skillLower = skill.toLowerCase();
    
    if (skillLower.includes('react') || skillLower.includes('javascript') || skillLower.includes('html') || skillLower.includes('css')) {
      return <FileCode className="w-4 h-4 text-blue-500" />;
    } else if (skillLower.includes('node') || skillLower.includes('express') || skillLower.includes('api')) {
      return <Cpu className="w-4 h-4 text-blue-500" />;
    } else if (skillLower.includes('mongo') || skillLower.includes('database') || skillLower.includes('sql')) {
      return <Database className="w-4 h-4 text-blue-500" />;
    } else if (skillLower.includes('git') || skillLower.includes('github')) {
      return <GitBranch className="w-4 h-4 text-blue-500" />;
    } else if (skillLower.includes('cloud') || skillLower.includes('devops')) {
      return <Cloud className="w-4 h-4 text-blue-500" />;
    } else {
      return <Layers className="w-4 h-4 text-gray-500" />;
    }
  };

  const hasSkills = formatArrayForDisplay(job.requiredSkills).length > 0;
  const hasResponsibilities = formatArrayForDisplay(job.responsibilities).length > 0;
  const hasTechnicalSkills = formatArrayForDisplay(job.technicalSkills).length > 0;
  const hasTools = formatArrayForDisplay(job.toolsAndTechnologies).length > 0;
  const hasSoftSkills = formatArrayForDisplay(job.softSkills).length > 0;
  const hasDailyTasks = formatArrayForDisplay(job.dailyTasks).length > 0;
  const hasCertifications = formatArrayForDisplay(job.certificationRequired).length > 0;

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getUrgencyBadge = () => {
    if (!job.urgencyLevel) return null;
    
    const urgency = job.urgencyLevel.toLowerCase();
    if (urgency.includes('immediate')) {
      return { text: "Immediate Hiring", color: "bg-red-100 text-red-700 border-red-200" };
    } else if (urgency.includes('15')) {
      return { text: "Hiring in 15 days", color: "bg-orange-100 text-orange-700 border-orange-200" };
    } else if (urgency.includes('30')) {
      return { text: "Hiring in 30 days", color: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    return { text: job.urgencyLevel, color: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  const handleClickCompany = () => {
    navigate(`/company/${job.companyId}`);
  };

  const urgencyBadge = getUrgencyBadge();

  // Generate job share caption
  const getJobShareCaption = () => {
    return `Check out this job opportunity: ${job.jobTitle} at ${job.companyName} - ${getExperienceText()} experience - ${formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.salaryCurrency)}`;
  };

  // Function to parse and clean job description HTML
  const parseJobDescription = (htmlContent) => {
    if (!htmlContent) return null;
    
    try {
      // Clean the HTML content
      let cleaned = htmlContent
        // Remove style attributes
        .replace(/style="[^"]*"/g, '')
        // Remove all div opening tags (but keep their content)
        .replace(/<div[^>]*>/g, '')
        // Replace closing divs with line breaks
        .replace(/<\/div>/g, '\n')
        // Replace br tags with line breaks
        .replace(/<br\s*\/?>/gi, '\n')
        // Replace &amp; with &
        .replace(/&amp;/g, '&')
        // Remove multiple consecutive newlines
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // Trim whitespace
        .trim();
      
      return cleaned;
    } catch (error) {
      console.error("Error parsing job description:", error);
      return htmlContent;
    }
  };

  // Function to render job description as simple paragraphs
  const renderJobDescription = (description) => {
    const cleanedText = parseJobDescription(description);
    
    if (!cleanedText) {
      return (
        <p className="text-gray-500 italic text-center py-6 lg:py-8">
          No job description provided.
        </p>
      );
    }
    
    // Split into paragraphs and filter out empty ones
    const paragraphs = cleanedText.split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    return (
      <div className="space-y-4">
        {paragraphs.map((paragraph, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
            <span className="text-gray-700 leading-relaxed">{paragraph}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen mx-auto bg-gray-50 container">
      {/* Share Popup */}
      <SharePopup
        isOpen={showSharePopup}
        onClose={() => setShowSharePopup(false)}
        postId={job._id}
        postCaption={getJobShareCaption()}
        userName=""
        onShareComplete={() => {
          console.log("Share completed");
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Cover Image Header */}
        <div className={`relative border-b border-gray-200 shadow-lg overflow-hidden ${isExpired || job.status === "expired" ? 'bg-gray-900' : ''}`}>
          {/* Cover Image */}
          <div className="absolute inset-0">
            {job.coverImage ? (
              <img 
                src={job.companyCoverImage || job.companyProfile.coverImage}
                alt={`${job.companyName || 'Company'} cover`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-300"></div>
            )}
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
            {isExpired || job.status === "expired" ? (
              <div className="absolute inset-0 bg-gray-900/80"></div>
            ) : null}
          </div>
          
          {/* Light reflection effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          
          <div className="relative p-6 lg:p-8 z-10">
            {/* Expiration Warning Banner */}
            {(isExpired || job.status === "expired") && (
              <div className="mb-4 bg-gradient-to-r from-red-600/90 to-red-700/90 border border-red-500/30 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-white" />
                  <div className="flex-1">
                    <div className="font-semibold text-white">This job posting has expired</div>
                    <div className="text-red-100 text-sm">Applications are no longer being accepted for this position</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between items-center mb-6 lg:mb-8">
              {/* Back Button - Left Side */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors group backdrop-blur-sm bg-black/20 px-3 py-2 rounded-lg border border-white/20 hover:border-white/30 hover:bg-black/30"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-medium hidden sm:inline">Back to Jobs</span>
                <span className="font-medium sm:hidden">Back</span>
              </button>

              {/* Action Buttons - Right Side */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleShare}
                  className="p-2 text-white hover:text-gray-200 transition-colors rounded-lg hover:bg-black/30 backdrop-blur-sm bg-black/20 border border-white/20 hover:border-white/30"
                  title="Share job"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleLike}
                  className={`p-2 transition-colors rounded-lg backdrop-blur-sm border ${
                    isLiked 
                      ? 'text-red-400 bg-red-500/20 border-red-400/30' 
                      : 'text-white hover:text-red-400 hover:bg-black/30 bg-black/20 border-white/20 hover:border-red-400/30'
                  }`}
                  title={isLiked ? "Unlike job" : "Like job"}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={handleSave}
                  className={`p-2 transition-colors rounded-lg backdrop-blur-sm border ${
                    isSaved 
                      ? 'text-yellow-400 bg-yellow-500/20 border-yellow-400/30' 
                      : 'text-white hover:text-yellow-400 hover:bg-black/30 bg-black/20 border-white/20 hover:border-yellow-400/30'
                  }`}
                  title={isSaved ? "Remove from saved" : "Save job"}
                >
                  <Star className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Company & Job Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Company Logo */}
              <div className="relative">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-white border-2 border-white shadow-2xl flex items-center justify-center">
                  {job.companyLogo ? (
                    <img 
                      src={job.companyLogo}
                      alt={job.companyName}
                      className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 lg:w-10 lg:h-10 text-gray-700" />
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 leading-tight break-words drop-shadow-xl">
                      {job.jobTitle || "Untitled Position"}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-base lg:text-lg text-gray-200 mb-4">
                      <button 
                        onClick={handleClickCompany}
                        className="font-semibold truncate cursor-pointer text-white hover:text-gray-200 transition-colors drop-shadow"
                      >
                        {job.companyName || "Company"}
                      </button>
                      <span className="hidden sm:inline w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-gray-300 capitalize truncate drop-shadow">{job.jobRole || job.jobCategory || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {(job.city || job.state) && (
                    <div className="flex items-center gap-2 text-gray-800 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg text-sm border border-white/30 shadow-lg">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="font-medium truncate max-w-[150px] lg:max-w-none">
                        {[job.city, job.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {job.employmentType && (
                    <div className="flex items-center gap-2 text-gray-800 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg text-sm border border-white/30 shadow-lg">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      <span className="font-medium capitalize truncate">
                        {job.employmentType.replace('-', ' ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-800 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg text-sm border border-white/30 shadow-lg">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-medium truncate">{getExperienceText()} experience</span>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-2 text-green-800 font-semibold bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg text-sm border border-white/30 shadow-lg">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="truncate max-w-[180px] lg:max-w-none">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.salaryCurrency)}</span>
                    </div>
                  )}
                  {job.openingsCount > 0 && (
                    <div className="flex items-center gap-2 text-gray-800 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg text-sm border border-white/30 shadow-lg">
                      <UsersIcon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium">{job.openingsCount} Vacancy{job.openingsCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
               
          {/* Status Badges */}
          <div className="absolute right-2 bottom-2 flex flex-col gap-1">
            {isNewJob() && (
              <span className="bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-xl backdrop-blur-sm">
                NEW
              </span>
            )}
            {job.isFeatured && (
              <span className="bg-gradient-to-r from-amber-600 to-orange-700 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-xl backdrop-blur-sm">
                FEATURED
              </span>
            )}
            {urgencyBadge && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-xl backdrop-blur-sm ${urgencyBadge.color} whitespace-nowrap`}>
                {urgencyBadge.text}
              </span>
            )}
            {/* Expiration Badge */}
            {timeLeft && (
              <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-xl backdrop-blur-sm ${
                isExpired || job.status === "expired" 
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 text-white' 
                  : 'bg-gradient-to-r from-amber-600 to-orange-700 text-white'
              } whitespace-nowrap`}>
                {timeLeft}
              </span>
            )}
          </div>
        </div>

        {/* Main Content - Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 p-4 lg:p-6">
          {/* LEFT COLUMN - Main Content (2/3 width on large screens) */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-4 lg:space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 truncate">Job Description</h2>
                  <p className="text-gray-600 text-xs lg:text-sm truncate">Detailed overview of the role and responsibilities</p>
                </div>
              </div>
              
              <div className="text-gray-700 leading-relaxed text-sm lg:text-base">
                {renderJobDescription(job.jobDescription)}
              </div>
            </div>

            {/* Key Responsibilities */}
            {hasResponsibilities && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 truncate">Key Responsibilities</h2>
                    <p className="text-gray-600 text-xs lg:text-sm truncate">Primary duties and responsibilities</p>
                  </div>
                </div>
                <ul className="space-y-2 lg:space-y-3">
                  {formatArrayForDisplay(job.responsibilities).map((resp, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700 flex-1 text-sm lg:text-base">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Daily Tasks */}
            {hasDailyTasks && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 truncate">Daily Tasks & Activities</h2>
                    <p className="text-gray-600 text-xs lg:text-sm truncate">Day-to-day activities and responsibilities</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-3">
                  {formatArrayForDisplay(job.dailyTasks).map((task, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700 flex-1 text-sm lg:text-base">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Skills */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 truncate">Required Skills & Technologies</h2>
                  <p className="text-gray-600 text-xs lg:text-sm truncate">Technologies and expertise needed for this role</p>
                </div>
              </div>
              
              {/* Required Skills */}
              {hasSkills && (
                <div className="mb-4 lg:mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-sm lg:text-base">Core Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formatArrayForDisplay(job.requiredSkills).map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200 text-sm transition-all hover:bg-blue-100"
                      >
                        {getSkillIcon(skill)}
                        <span className="truncate max-w-[120px] lg:max-w-none">{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Skills */}
              {hasTechnicalSkills && (
                <div className="mb-4 lg:mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-sm lg:text-base">Technical Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formatArrayForDisplay(job.technicalSkills).map((skill, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200 text-sm transition-all hover:bg-blue-100"
                      >
                        {getSkillIcon(skill)}
                        <span className="truncate max-w-[120px] lg:max-w-none">{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools & Technologies */}
              {hasTools && (
                <div className="mb-4 lg:mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-sm lg:text-base">Tools & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {formatArrayForDisplay(job.toolsAndTechnologies).map((tool, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200 text-sm transition-all hover:bg-blue-100"
                      >
                        {getSkillIcon(tool)}
                        <span className="truncate max-w-[120px] lg:max-w-none">{tool}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {hasSoftSkills && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 lg:mb-3 text-sm lg:text-base">Soft Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {formatArrayForDisplay(job.softSkills).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 lg:px-4 lg:py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200 text-sm transition-all hover:bg-blue-100"
                      >
                        <span className="truncate max-w-[120px] lg:max-w-none">{skill}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

       

           
          </div>

          {/* RIGHT COLUMN - Sidebar (1/3 width on large screens) */}
          <div className="space-y-4 lg:space-y-8">
            {/* Combined Job Insights & Hiring Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              {/* Posted by section */}
              <div className="mb-6">
                <div className="text-sm text-gray-600 mb-2">Post Status</div>
                <div className="flex items-start gap-3">
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 mb-1 truncate">
                      {job.hiringManagerName || job.postedBy?.companyName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hiring Information */}
              <div className="space-y-4 mb-6">
                {job.hiringManagerName && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Hiring Manager</div>
                    <div className="font-medium text-gray-900 truncate">{job.hiringManagerName}</div>
                  </div>
                )}
                
                {job.hiringManagerEmail && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Contact Email</div>
                    <a href={`mailto:${job.hiringManagerEmail}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block">
                      {job.hiringManagerEmail}
                    </a>
                  </div>
                )}
                
                {job.hiringManagerPhone && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Contact Phone</div>
                    <a href={`tel:${job.hiringManagerPhone}`} className="font-medium text-gray-900 hover:text-blue-600 transition-colors truncate block">
                      {job.hiringManagerPhone}
                    </a>
                  </div>
                )}
                
                {job.interviewMode && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Interview Mode</div>
                    <div className="font-medium text-gray-900 capitalize truncate">{job.interviewMode}</div>
                  </div>
                )}
              </div>

              {/* Stats section */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{job.viewCount || 0}</div>
                  <div className="text-xs text-gray-600">JOB VIEWS</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 mb-1">{job.applyCount || 0}</div>
                  <div className="text-xs text-gray-600">APPLICATIONS</div>
                </div>
              </div>

              
            </div>

            {/* Ready to Apply Card - Updated design */}
<div className="bg-white rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-sm">
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
      <Send className="w-4 h-4 text-blue-600" />
    </div>
    <div className="min-w-0">
      <h2 className="text-lg font-bold text-gray-900 truncate">Ready to Apply</h2>
      <p className="text-gray-600 text-xs truncate">Application details</p>
    </div>
  </div>
  
  <div className="flex flex-col lg:flex-row gap-3 mb-4">
    {/* Apply Now Section */}
    <div className="lg:w-1/3">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">Apply Now</h3>
        <p className="text-gray-500 text-xs">Next career step</p>
      </div>
      
      <button 
        onClick={handleApply}
        disabled={isApplying || isExpired || job.status === "expired"}
        className={`w-full py-2 px-2.5 rounded-md font-medium text-xs lg:text-sm transition-colors flex items-center justify-center gap-1.5 ${
          isExpired || job.status === "expired"
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        } ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isApplying ? (
          <>
            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Processing</span>
          </>
        ) : isExpired || job.status === "expired" ? (
          <>
            <AlertCircle className="w-3 h-3" />
            <span>Expired</span>
          </>
        ) : (
          <>
            <Send className="w-3 h-3" />
            <span>Apply</span>
          </>
        )}
      </button>
    </div>

    {/* Requirements Section */}
    {/* <div className="lg:w-1/3">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">Requirements</h3>
        <p className="text-gray-500 text-xs">Documents needed</p>
      </div>
      
      <div className="space-y-1">
        {job.resumeRequired && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-blue-200 bg-blue-50">
            <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-600 font-medium">Resume</span>
          </div>
        )}
        
        {job.coverLetterRequired && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-blue-200 bg-blue-50">
            <FileText className="w-3 h-3 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-600 font-medium">Cover Letter</span>
          </div>
        )}
        
        {!job.resumeRequired && !job.coverLetterRequired && (
          <div className="px-2 py-1 rounded-md border border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500">No docs</span>
          </div>
        )}
      </div>
    </div> */}

    {/* Save Job Section */}
    <div className="lg:w-1/3">
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900 mb-0.5 text-xs lg:text-sm">Save for Later</h3>
        <p className="text-gray-500 text-xs">Bookmark job</p>
      </div>
      
      <button 
        onClick={handleSave}
        className={`w-full py-2 px-2.5 rounded-md font-medium text-xs lg:text-sm transition-colors border flex items-center justify-center gap-1.5 ${
          isSaved
            ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Star className={`w-3 h-3 ${isSaved ? 'fill-current' : ''}`} />
        <span>{isSaved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  </div>

  {/* Expiration Information */}
  {job.endDate && (
    <div className="pt-4 border-t border-gray-200">
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-start gap-2 p-2 bg-gray-50 rounded-md">
          <Calendar className="w-3 h-3 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-gray-500 text-[10px] font-medium truncate">START DATE</div>
            <div className="text-gray-900 font-semibold text-xs truncate">{formatDate(job.startDate)}</div>
          </div>
        </div>
        <div className={`flex items-start gap-2 p-2 rounded-md ${isExpired ? 'bg-red-50' : 'bg-gray-50'}`}>
          <Clock className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isExpired ? 'text-red-500' : 'text-gray-600'}`} />
          <div className="min-w-0">
            <div className={`text-[10px] font-medium truncate ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
              END DATE
            </div>
            <div className={`font-semibold text-xs truncate ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
              {formatDate(job.endDate)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Report suspicious link */}
  <div className="mt-4 pt-4 border-t border-gray-200">
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
      <Info className="w-3 h-3 text-gray-400 flex-shrink-0" />
      <div className="min-w-0">
        <div className="text-gray-600 text-xs">
          Suspicious?{" "}
          <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
            Report
          </button>
        </div>
      </div>
    </div>
  </div>
</div>
            {/* Job Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-bold text-gray-900 truncate">Job Details</h2>
                  <p className="text-gray-600 text-sm truncate">Complete information about the position</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">Employment Type</div>
                    <div className="text-gray-900 font-semibold capitalize whitespace-normal break-words">
                      {job.employmentType?.replace('-', ' ') || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">Work Mode</div>
                    <div className="text-gray-900 font-semibold capitalize whitespace-normal break-words">
                      {job.workMode || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">Shift Type</div>
                    <div className="text-gray-900 font-semibold whitespace-normal break-words">
                      {job.shiftType || 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm font-medium mb-1">Openings</div>
                    <div className="text-gray-900 font-semibold">
                      {job.openingsCount || 'Not specified'}
                    </div>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-1">Category</div>
                  <div className="text-gray-900 font-semibold whitespace-normal break-words">
                    {job.jobCategory || 'Not specified'}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-1">Job Role</div>
                  <div className="text-gray-900 font-semibold capitalize whitespace-normal break-words">
                    {job.jobRole || 'Not specified'}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-1">Experience</div>
                  <div className="text-gray-900 font-semibold whitespace-normal break-words">
                    {getExperienceText()}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-1">Education Level</div>
                  <div className="text-gray-900 font-semibold whitespace-normal break-words">
                    {job.educationLevel || 'Not specified'}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-1">Degree Required</div>
                  <div className="text-gray-900 font-semibold whitespace-normal break-words ">
                    {job.degreeRequired || 'Not specified'}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-gray-100">
                  <div className="text-gray-600 text-sm font-medium mb-1">Remote Eligible</div>
                  <div className={`font-semibold ${job.remoteEligibility ? 'text-green-600' : 'text-gray-600'}`}>
                    {job.remoteEligibility ? 'Yes' : 'No'}
                  </div>
                </div>
                
                {job.endDate && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-gray-600 text-sm font-medium mb-1">Expiration</div>
                    <div className={`font-semibold ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {isExpired ? 'Expired' : timeLeft}
                    </div>
                  </div>
                )}
                
                {job.status && (
                  <div className="pt-3 border-t border-gray-100">
                    <div className="text-gray-600 text-sm font-medium mb-1">Status</div>
                    <div className={`font-semibold capitalize ${
                      job.status === 'active' ? 'text-green-600' : 
                      job.status === 'expired' ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {job.status}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <h3 className="font-bold text-gray-900 text-lg mb-4">About Company</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{job.companyName || "Company"}</span>
                </div>
                {(job.city || job.state) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 truncate">
                      {[job.city, job.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {job.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700">
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Jobs by Location - DYNAMIC */}
            {renderLocationsSection()}

            {/* Certifications */}
            {hasCertifications && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
                <h3 className="font-bold text-gray-900 text-lg mb-4">Required Certifications</h3>
                <div className="space-y-2">
                  {formatArrayForDisplay(job.certificationRequired).map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                      <Award className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
     {/* SIMILAR JOBS SECTION - FOOTER POSITION */}
        <div className="p-4 lg:p-6">
          <SimilarJobsSection jobId={job._id} />
        </div>
        

        {/* Pagination */}
        {showNavigation && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto p-4 lg:p-6 flex justify-between items-center">
              <button
                disabled={currentIndex === 0}
                onClick={onPrevious}
                className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              <div className="flex items-center gap-2 text-gray-600 text-sm lg:text-base">
                <span className="font-semibold text-gray-900">{currentIndex + 1}</span>
                <span>of</span>
                <span className="font-semibold text-gray-900">{totalJobs}</span>
              </div>

              <button
                disabled={currentIndex === totalJobs - 1}
                onClick={onNext}
                className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm lg:text-base"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
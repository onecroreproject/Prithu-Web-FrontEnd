import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Users, 
  BookOpen,
  Star,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowLeft,
  ArrowRight,
  Building,
  Calendar,
  Target,
  Eye,
  Heart,
  Send,
  FileText,
  Award,
  Zap,
  Shield,
  CheckCircle,
  TrendingUp,
  UserCheck,
  Globe,
  Mail,
  Phone,
  Users as UsersIcon,
  FileCode,
  Layers,
  Database,
  Cpu,
  GitBranch,
  Cloud
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";

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

  const getApplicationRequirements = () => {
    const requirements = [];
    
    if (job.resumeRequired) {
      requirements.push({
        icon: FileText,
        text: "Resume Required",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200"
      });
    }
    
    if (job.coverLetterRequired) {
      requirements.push({
        icon: FileText,
        text: "Cover Letter Required",
        color: "text-purple-600",
        bgColor: "bg-purple-50",
        borderColor: "border-purple-200"
      });
    }

    if (job.documentsRequired?.length > 0) {
      job.documentsRequired.forEach(doc => {
        if (doc && doc.trim()) {
          requirements.push({
            icon: Award,
            text: doc,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200"
          });
        }
      });
    }

    return requirements;
  };

  const handleBack = () => {
    navigate("/jobs");
  };

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);
      toast.success(isSaved ? "Job removed from saved" : "Job saved successfully");
    } catch (error) {
      console.error("Failed to save job:", error);
      toast.error("Failed to save job");
    }
  };

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      toast.success(isLiked ? "Job unliked" : "Job liked");
    } catch (error) {
      console.error("Failed to like job:", error);
      toast.error("Failed to like job");
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/job/get/jobs/by/id/${job._id}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to share job:", error);
      toast.error("Failed to share job");
    }
  };

  const handleApply = () => {
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
      return <Cpu className="w-4 h-4 text-green-500" />;
    } else if (skillLower.includes('mongo') || skillLower.includes('database') || skillLower.includes('sql')) {
      return <Database className="w-4 h-4 text-purple-500" />;
    } else if (skillLower.includes('git') || skillLower.includes('github')) {
      return <GitBranch className="w-4 h-4 text-orange-500" />;
    } else if (skillLower.includes('cloud') || skillLower.includes('devops')) {
      return <Cloud className="w-4 h-4 text-sky-500" />;
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
  const requirements = getApplicationRequirements();

  return (
    <div className="min-h-screen mx-auto bg-gray-50 container">
      <div className="max-w-7xl mx-auto ">
        {/* Header - Left aligned */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-6 lg:p-8">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-6 lg:mb-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-medium hidden sm:inline">Back to Jobs</span>
                <span className="font-medium sm:hidden">Back</span>
              </button>

              <div className="flex items-center gap-1">
                <button 
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
                  title="Share job"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleLike}
                  className={`p-2 transition-colors rounded-lg ${
                    isLiked 
                      ? 'text-red-500 bg-red-50' 
                      : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
                  }`}
                  title={isLiked ? "Unlike job" : "Like job"}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button 
                  onClick={handleSave}
                  className={`p-2 transition-colors rounded-lg ${
                    isSaved 
                      ? 'text-green-500 bg-green-50' 
                      : 'text-gray-500 hover:text-green-500 hover:bg-green-50'
                  }`}
                  title={isSaved ? "Remove from saved" : "Save job"}
                >
                  {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Company & Job Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Company Logo */}
              <div className="relative">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl bg-gradient-to-br from-blue-50 to-gray-50 border border-gray-200 flex items-center justify-center shadow-sm">
                  {job.companyLogo ? (
                    <img 
                      src={job.companyLogo} 
                      alt={job.companyName}
                      className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                  )}
                </div>
                
                {/* Status Badges */}
                <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                  {isNewJob() && (
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                      NEW
                    </span>
                  )}
                  {job.isFeatured && (
                    <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                      FEATURED
                    </span>
                  )}
                  {urgencyBadge && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${urgencyBadge.color} whitespace-nowrap`}>
                      {urgencyBadge.text}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 mb-3 leading-tight break-words">
                      {job.jobTitle || "Untitled Position"}
                    </h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-base lg:text-lg text-gray-700 mb-4">
                      <button 
                      onClick={handleClickCompany}
                      className="font-semibold  truncate cursor-pointer text-blue-400">{job.companyName || "Company"}</button>
                      <span className="hidden sm:inline w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-gray-600 capitalize truncate">{job.jobRole || job.jobCategory || "Not specified"}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-2 lg:gap-3">
                  {(job.city || job.state) && (
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="font-medium truncate max-w-[150px] lg:max-w-none">
                        {[job.city, job.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {job.employmentType && (
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="font-medium capitalize truncate">
                        {job.employmentType.replace('-', ' ')}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium truncate">{getExperienceText()} experience</span>
                  </div>
                  {(job.salaryMin || job.salaryMax) && (
                    <div className="flex items-center gap-2 text-green-600 font-semibold bg-green-50 px-3 py-1.5 rounded-lg text-sm">
                      <DollarSign className="w-4 h-4" />
                      <span className="truncate max-w-[180px] lg:max-w-none">{formatSalary(job.salaryMin, job.salaryMax, job.salaryType, job.salaryCurrency)}</span>
                    </div>
                  )}
                  {job.openingsCount > 0 && (
                    <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg text-sm">
                      <UsersIcon className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{job.openingsCount} opening{job.openingsCount > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
              <div className="prose prose-gray max-w-none">
                {job.jobDescription ? (
                  <div className="text-gray-700 leading-relaxed text-sm lg:text-base whitespace-pre-line">
                    {job.jobDescription}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-center py-6 lg:py-8 text-sm lg:text-base">No job description provided.</p>
                )}
              </div>
            </div>

            {/* Key Responsibilities */}
            {hasResponsibilities && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-3 mb-4 lg:mb-6">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Target className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg lg:text-xl font-bold text-gray-900 truncate">Key Responsibilities</h2>
                    <p className="text-gray-600 text-xs lg:text-sm truncate">Primary duties and responsibilities</p>
                  </div>
                </div>
                <ul className="space-y-2 lg:space-y-3">
                  {formatArrayForDisplay(job.responsibilities).map((resp, index) => (
                    <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-3 h-3 text-green-600" />
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
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-purple-600" />
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
                        className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-purple-50 text-purple-700 rounded-lg font-medium border border-purple-200 text-sm transition-all hover:bg-purple-100"
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
                        className="inline-flex items-center gap-2 px-3 py-1.5 lg:px-4 lg:py-2 bg-gray-100 text-gray-700 rounded-lg font-medium border border-gray-300 text-sm transition-all hover:bg-gray-200"
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
                        className="px-3 py-1.5 lg:px-4 lg:py-2 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200 text-sm transition-all hover:bg-green-100"
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
          <div className="space-y-4 lg:space-y-6">
            {/* Job Details Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 lg:w-5 lg:h-5 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg lg:text-xl font-bold text-gray-900 truncate">Job Details</h2>
                  <p className="text-gray-600 text-xs lg:text-sm truncate">Complete information about the position</p>
                </div>
              </div>
              
              <div className="space-y-3 lg:space-y-4">
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Employment Type</span>
                  <span className="text-gray-900 font-semibold capitalize text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {job.employmentType?.replace('-', ' ') || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Work Mode</span>
                  <span className="text-gray-900 font-semibold capitalize text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {job.workMode || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Shift Type</span>
                  <span className="text-gray-900 font-semibold capitalize text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {job.shiftType || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Openings</span>
                  <span className="text-gray-900 font-semibold text-sm lg:text-base">
                    {job.openingsCount || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Category</span>
                  <span className="text-gray-900 font-semibold text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {job.jobCategory || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Job Role</span>
                  <span className="text-gray-900 font-semibold capitalize text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {job.jobRole || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Experience</span>
                  <span className="text-gray-900 font-semibold text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {getExperienceText()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Education Level</span>
                  <span className="text-gray-900 font-semibold text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {job.educationLevel || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Degree Required</span>
                  <span className="text-gray-900 font-semibold text-sm lg:text-base truncate max-w-[100px] lg:max-w-none">
                    {job.degreeRequired || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 lg:py-3 border-b border-gray-100">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">Remote Eligible</span>
                  <span className={`font-semibold text-sm lg:text-base ${
                    job.remoteEligibility ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {job.remoteEligibility ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Apply Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <div className="text-center mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-2 lg:mb-3">
                  <Send className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h3 className="text-base lg:text-lg font-bold text-gray-900 mb-1 lg:mb-2">Ready to Apply?</h3>
                <p className="text-gray-600 text-xs lg:text-sm">Take the next step in your career journey</p>
              </div>
              
              {/* Application Requirements */}
              {requirements.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-xs lg:text-sm">Application Requirements</h4>
                  <div className="space-y-2">
                    {requirements.map((req, index) => (
                      <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded border ${req.borderColor} ${req.bgColor}`}>
                        <req.icon className={`w-3 h-3 lg:w-4 lg:h-4 ${req.color}`} />
                        <span className={`text-xs lg:text-sm ${req.color} truncate`}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2 lg:space-y-3">
                <button 
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full bg-gray-900 text-white py-2.5 lg:py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm lg:text-base"
                >
                  {isApplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Apply Now
                    </>
                  )}
                </button>
                
                <button 
                  onClick={handleSave}
                  className={`w-full py-2.5 lg:py-3 px-4 rounded-lg font-medium transition-colors border flex items-center justify-center gap-2 text-sm lg:text-base ${
                    isSaved
                      ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {isSaved ? 'Saved' : 'Save for Later'}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-4 lg:mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-base lg:text-lg font-bold text-gray-900 flex items-center justify-center gap-1 mb-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                      {job.viewCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-base lg:text-lg font-bold text-gray-900 flex items-center justify-center gap-1 mb-1">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      {job.applyCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Applications</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">About Company</h3>
              <div className="space-y-2 lg:space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 text-sm lg:text-base truncate">{job.companyName || "Company"}</span>
                </div>
                {(job.city || job.state) && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm lg:text-base truncate">
                      {[job.city, job.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {job.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm lg:text-base">
                      Posted {formatDate(job.createdAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Hiring Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">Hiring Information</h3>
              <div className="space-y-3 lg:space-y-4">
                {job.hiringManagerName && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Hiring Manager</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base truncate">{job.hiringManagerName}</p>
                    </div>
                  </div>
                )}
                
                {job.hiringManagerEmail && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3 h-3 lg:w-4 lg:h-4 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Contact Email</p>
                      <a href={`mailto:${job.hiringManagerEmail}`} className="font-medium text-gray-900 text-sm lg:text-base hover:text-blue-600 transition-colors truncate block">
                        {job.hiringManagerEmail}
                      </a>
                    </div>
                  </div>
                )}
                
                {job.hiringManagerPhone && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Phone className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Contact Phone</p>
                      <a href={`tel:${job.hiringManagerPhone}`} className="font-medium text-gray-900 text-sm lg:text-base hover:text-blue-600 transition-colors truncate block">
                        {job.hiringManagerPhone}
                      </a>
                    </div>
                  </div>
                )}
                
                {job.interviewMode && (
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-3 h-3 lg:w-4 lg:h-4 text-amber-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs lg:text-sm text-gray-600">Interview Mode</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base capitalize truncate">{job.interviewMode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Certifications */}
            {hasCertifications && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 transition-shadow hover:shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 lg:mb-4 text-base lg:text-lg">Required Certifications</h3>
                <div className="space-y-2">
                  {formatArrayForDisplay(job.certificationRequired).map((cert, index) => (
                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                      <Award className="w-4 h-4 flex-shrink-0" />
                      <span className="text-xs lg:text-sm font-medium truncate">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
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
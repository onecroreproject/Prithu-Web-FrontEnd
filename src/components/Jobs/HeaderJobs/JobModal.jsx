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
  UserCheck
} from "lucide-react";

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

  const formatSalary = (min, max, type = 'monthly') => {
    if (!min && !max) return "Salary not disclosed";
    
    const format = (amount) => new Intl.NumberFormat('en-IN').format(amount);
    const salaryText = `₹${format(min)} - ₹${format(max)}`;
    const typeText = type.charAt(0).toUpperCase() + type.slice(1);
    
    return `${salaryText} per ${typeText}`;
  };

  const getExperienceText = () => {
    const min = job.minimumExperience || 0;
    const max = job.maximumExperience || 0;
    
    if (min === 0 && max === 0) return "Fresher";
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

    if (job.portfolioRequired) {
      requirements.push({
        icon: Award,
        text: "Portfolio Required",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200"
      });
    }

    return requirements;
  };

  const handleBack=()=>{
    navigate("/jobs")
  }

  const requirements = getApplicationRequirements();

  const handleSave = async () => {
    try {
      // Call your save API here
      // await api.post(`/job/engagement/${job._id}/save`);
      setIsSaved(!isSaved);
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleLike = async () => {
    try {
      // Call your like API here
      // await api.post(`/job/engagement/${job._id}/like`);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Failed to like job:", error);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/job/${job._id}`;
      await navigator.clipboard.writeText(shareUrl);
      // Call your share API here
      // await api.post(`/job/engagement/${job._id}/share`);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to share job:", error);
    }
  };

  const handleApply = () => {
    setIsApplying(true);
    // Simulate application process
    setTimeout(() => {
      setIsApplying(false);
      // Navigate to apply page or open application form
      console.log("Apply for job:", job._id);
    }, 2000);
  };

  const isNewJob = () => {
    if (!job.createdAt) return false;
    const postedDate = new Date(job.createdAt);
    const today = new Date();
    const diffTime = Math.abs(today - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="p-8">
            {/* Navigation */}
            <div className="flex justify-between items-center mb-8">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
                <span className="font-medium">Back to Jobs</span>
              </button>

              <div className="flex items-center gap-1">
                <button 
                  onClick={handleShare}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100"
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
                >
                  {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Company & Job Header */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              {/* Company Logo */}
              <div className="relative">
                <div className="w-20 h-20 rounded-xl bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  {job.companyLogo ? (
                    <img 
                      src={job.companyLogo} 
                      alt={job.companyName}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <Building className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                {/* Status Badges */}
                <div className="absolute -top-2 -right-2 flex flex-col gap-1">
                  {isNewJob() && (
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      NEW
                    </span>
                  )}
                  {job.isFeatured && (
                    <span className="bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                      FEATURED
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3 leading-tight">
                      {job.jobTitle}
                    </h1>
                    <div className="flex items-center gap-3 text-lg text-gray-700 mb-4">
                      <span className="font-semibold text-gray-900">{job.companyName}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-gray-600 capitalize">{job.jobRole}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{job.city}, {job.state}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-4 h-4 text-gray-500" />
                    <span className="font-medium capitalize">{job.employmentType?.replace('-', ' ') || 'Full-time'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{getExperienceText()} experience</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax, job.salaryType)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
          {/* Left Column - Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Job Description */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
                  <p className="text-gray-600 text-sm">Detailed overview of the role and responsibilities</p>
                </div>
              </div>
              <div className="prose prose-gray max-w-none">
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: job.jobDescription || 
                    '<p class="text-gray-500 italic text-center py-8">No job description provided.</p>' 
                  }}
                />
              </div>
            </div>

            {/* Required Skills */}
            {job.requiredSkills?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Required Skills</h2>
                    <p className="text-gray-600 text-sm">Technologies and expertise needed for this role</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {job.requiredSkills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium border border-blue-200 transition-colors hover:bg-blue-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Job Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Job Details</h2>
                  <p className="text-gray-600 text-sm">Complete information about the position</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Employment Type</span>
                    <span className="text-gray-900 font-semibold capitalize">
                      {job.employmentType?.replace('-', ' ') || 'Full-time'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Work Mode</span>
                    <span className="text-gray-900 font-semibold capitalize">
                      {job.workMode || 'On-site'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Shift Type</span>
                    <span className="text-gray-900 font-semibold capitalize">
                      {job.shiftType || 'Day'}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Category</span>
                    <span className="text-gray-900 font-semibold">{job.jobCategory}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Sub Category</span>
                    <span className="text-gray-900 font-semibold">{job.jobSubCategory || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Status</span>
                    <span className={`font-semibold ${
                      job.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {job.status || 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Apply?</h3>
                <p className="text-gray-600 text-sm">Take the next step in your career journey</p>
              </div>
              
              {/* Application Requirements */}
              {requirements.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">Application Requirements</h4>
                  <div className="space-y-2">
                    {requirements.map((req, index) => (
                      <div key={index} className={`flex items-center gap-2 px-3 py-2 rounded border ${req.borderColor} ${req.bgColor}`}>
                        <req.icon className={`w-4 h-4 ${req.color}`} />
                        <span className={`text-sm ${req.color}`}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <button 
                  onClick={handleApply}
                  disabled={isApplying}
                  className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors border flex items-center justify-center gap-2 ${
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
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1 mb-1">
                      <Eye className="w-4 h-4 text-gray-500" />
                      {job.viewCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1 mb-1">
                      <UserCheck className="w-4 h-4 text-gray-500" />
                      {job.applyCount || 0}
                    </div>
                    <div className="text-xs text-gray-500">Applications</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">About Company</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{job.companyName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{job.city}, {job.state}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Job Engagement</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Likes</span>
                  <span className="font-semibold text-gray-900">{job.likeCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Saves</span>
                  <span className="font-semibold text-gray-900">{job.saveCount || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Shares</span>
                  <span className="font-semibold text-gray-900">{job.shareCount || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination - Only show if multiple jobs */}
        {showNavigation && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto p-6 flex justify-between items-center">
              <button
                disabled={currentIndex === 0}
                onClick={onPrevious}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold text-gray-900">{currentIndex + 1}</span>
                <span>of</span>
                <span className="font-semibold text-gray-900">{totalJobs}</span>
              </div>

              <button
                disabled={currentIndex === totalJobs - 1}
                onClick={onNext}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
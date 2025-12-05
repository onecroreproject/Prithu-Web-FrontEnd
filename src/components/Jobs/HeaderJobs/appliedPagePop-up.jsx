import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Upload, FileText, Link, Mail, Phone, User, 
  Briefcase, GraduationCap, Award, CheckCircle, AlertCircle,
  Paperclip, Globe, Github, Linkedin, Building, MapPin,
  DollarSign, Clock, Users as UsersIcon, Calendar, ExternalLink,
  Send, X, Copy, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../../api/axios';
import { AuthContext } from '../../../context/AuthContext';

const JobApplicationPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user: authUser, token } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: '',
    portfolioLink: '',
    githubLink: '',
    linkedinProfile: '',
  });

  // Get portfolio URL from user profile
  const host = window.location.origin;
  const portfolioUrl = `${host}/portfolio/${authUser?.userName}`;

  useEffect(() => {
    fetchJobDetails();
    fetchUserData();
    fetchCurriculumData();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/job/get/jobs/by/id/${jobId}`);
      if (response.data.success) {
        setJob(response.data.job);
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    if (authUser) {
      // Map user data from auth context
      setUser({
        _id: authUser.userId || authUser._id,
        fullName: authUser.name || authUser.fullName,
        name: authUser.name,
        email: authUser.userEmail || authUser.email,
        phone: authUser.phoneNumber || authUser.phone || '',
        linkedinProfile: authUser.socialLinks?.linkedin || '',
        githubLink: authUser.socialLinks?.github || '',
        portfolioLink: authUser.socialLinks?.portfolio || portfolioUrl,
        userName: authUser.userName,
        profileAvatar: authUser.profileAvatar,
        bio: authUser.bio,
        city: authUser.city,
        country: authUser.country
      });

      // Auto-fill form with user's social links
      setFormData(prev => ({
        ...prev,
        portfolioLink: authUser.socialLinks?.portfolio || portfolioUrl,
        githubLink: authUser.socialLinks?.github || '',
        linkedinProfile: authUser.socialLinks?.linkedin || ''
      }));
    }
  };

  const fetchCurriculumData = async () => {
    try {
      if (token && authUser?.userId) {
        const response = await api.get('/api/user/curicullam/status', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Curriculum data:', response.data);
        if (response.data.success) {
          setCurriculum(response.data.curriculum);
        }
      }
    } catch (error) {
      console.error('Failed to fetch curriculum:', error);
    }
  };

  // Copy portfolio URL to clipboard
  const handleCopyPortfolioUrl = async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast.success('Portfolio URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('❌ Copy failed:', err);
      toast.error('Failed to copy URL');
    }
  };

  // Check curriculum completeness - UPDATED without resume
  const isCurriculumComplete = () => {
    if (!curriculum) return false;
    
    const hasEducation = curriculum.education && curriculum.education.length > 0;
    const hasExperience = curriculum.experience && curriculum.experience.length > 0;
    const hasSkills = curriculum.skills && curriculum.skills.length > 0;
    
    // Check if at least one major section is filled
    return hasEducation || hasExperience || hasSkills;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check curriculum completeness with better feedback
    if (!isCurriculumComplete()) {
      const missing = [];
      if (!curriculum?.education?.length) missing.push('education');
      if (!curriculum?.skills?.length) missing.push('skills');
      
      const message = missing.length > 0 
        ? `Please add ${missing.join(', ')} to your curriculum before applying.`
        : 'Please complete your curriculum before applying.';
      
      toast.error(message);
      navigate('/user/curriculum');
      return;
    }

    setSubmitting(true);
    
    try {
      // Prepare application data as JSON (not FormData)
      const applicationData = {
        jobId: jobId,
        coverLetter: formData.coverLetter || '',
        portfolioLink: formData.portfolioLink || '',
        githubLink: formData.githubLink || '',
        linkedinProfile: formData.linkedinProfile || ''
      };

      const response = await api.post('/api/apply/job', applicationData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data.success) {
        toast.success('Application submitted successfully!');
        navigate('/jobs');
      }
    } catch (error) {
      console.error('Application error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = () => {
    if (!job?.salaryMin && !job?.salaryMax) return "Salary not disclosed";
    
    const format = (amount) => {
      if (!amount) return '0';
      return new Intl.NumberFormat('en-IN').format(amount);
    };
    
    const symbol = '₹';
    const salaryText = `${symbol}${format(job.salaryMin)} - ${symbol}${format(job.salaryMax)}`;
    const typeText = job.salaryType?.charAt(0).toUpperCase() + job.salaryType?.slice(1) || 'Monthly';
    
    return `${salaryText} per ${typeText}`;
  };

  const getExperienceText = () => {
    const min = job?.minimumExperience || 0;
    const max = job?.maximumExperience || 0;
    
    if (job?.freshersAllowed) return "Fresher";
    if (min === 0 && max === 0) return "Not specified";
    if (min === max) return `${min} year${min > 1 ? 's' : ''}`;
    return `${min} - ${max} years`;
  };

  const CurriculumChecklist = () => {
    const checks = [
      {
        label: 'Education',
        completed: curriculum?.education && curriculum.education.length > 0,
        icon: GraduationCap
      },
      {
        label: 'Work Experience',
        completed: curriculum?.experience && curriculum.experience.length > 0,
        icon: Briefcase
      },
      {
        label: 'Skills',
        completed: curriculum?.skills && curriculum.skills.length > 0,
        icon: Award
      }
    ];

    const completedCount = checks.filter(c => c.completed).length;

    return (
      <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Curriculum Completeness ({completedCount}/3)
          </h4>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            completedCount >= 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {completedCount >= 1 ? 'Ready to Apply' : 'Needs Improvement'}
          </span>
        </div>
        
        <div className="space-y-3 mb-4">
          {checks.map((check, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                check.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {check.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <check.icon className="w-4 h-4" />
                )}
              </div>
              <span className={`text-sm ${check.completed ? 'text-gray-700' : 'text-gray-500'}`}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
        
        {completedCount < 1 && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-700 mb-2">
                  Add at least education or skills to your curriculum before applying.
                </p>
                <button 
                  onClick={() => navigate('/user/curriculum')}
                  className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                >
                  Update Curriculum
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const JobInfoCard = () => (
    <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-gray-900 text-xl mb-1">{job.jobTitle}</h3>
          <p className="text-gray-600 flex items-center gap-2">
            <Building className="w-4 h-4" />
            {job.companyName || job.postedBy?.companyName}
          </p>
        </div>
        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
          {job.employmentType?.replace('-', ' ') || 'Full-time'}
        </span>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{job.city}, {job.state}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{job.workMode || 'Onsite'}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{getExperienceText()}</span>
        </div>
        <div className="flex items-center gap-2 text-green-600">
          <DollarSign className="w-4 h-4" />
          <span className="text-sm font-medium">{formatSalary()}</span>
        </div>
      </div>
      
      {job.companyProfile?.description && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">About Company</h4>
          <p className="text-gray-600 text-sm">{job.companyProfile.description}</p>
        </div>
      )}
    </div>
  );

  const ApplicantInfoCard = () => (
    <div className="mb-6 p-6 bg-white rounded-xl border border-gray-200">
      <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
        <User className="w-5 h-5 text-gray-600" />
        Applicant Information
      </h4>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            {user?.profileAvatar ? (
              <img 
                src={user.profileAvatar} 
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.fullName || user?.name}</p>
            <p className="text-xs text-gray-500">@{user?.userName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">Email</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
            <p className="text-xs text-gray-500">Phone</p>
          </div>
        </div>
        
        {user?.bio && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h5 className="font-medium text-gray-900 mb-2">Bio</h5>
            <p className="text-sm text-gray-600">{user.bio}</p>
          </div>
        )}
      </div>
    </div>
  );

  const PortfolioUrlSection = () => (
    <div className="mb-6 p-6 bg-blue-50 rounded-xl border border-blue-200">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <Globe className="w-5 h-5 text-blue-600" />
        Your Portfolio URL
      </h4>
      <p className="text-gray-600 mb-4 text-sm">
        Share your professional portfolio with employers. This URL is generated from your profile.
      </p>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 p-3 bg-white rounded-lg border border-gray-300">
          <code className="text-blue-600 font-medium break-all">{portfolioUrl}</code>
        </div>
        <button
          type="button"
          onClick={handleCopyPortfolioUrl}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
      
      <div className="mt-4 flex gap-2">
        <a
          href={portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          View Portfolio
        </a>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Job Not Found</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Browse Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
              <span className="font-medium">Back</span>
            </button>
            
            <div className="text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Apply for Job</h1>
              <p className="text-gray-600 mt-1">Submit your application for {job.jobTitle}</p>
            </div>
            
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <CurriculumChecklist />
          <JobInfoCard />
          <ApplicantInfoCard />
          <PortfolioUrlSection />
          
          <form onSubmit={handleSubmit}>
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              {/* Cover Letter */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg">Cover Letter (Optional)</h4>
                <p className="text-gray-600 mb-4 text-sm">
                  A good cover letter can increase your chances by 40%. Explain why you're a good fit for this position.
                </p>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                  rows={6}
                  placeholder="Write a cover letter explaining why you're a good fit for this position..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              
              {/* Portfolio Links */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-600" />
                  Additional Links (Optional)
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Portfolio Website
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.portfolioLink}
                        onChange={(e) => handleInputChange('portfolioLink', e.target.value)}
                        placeholder="https://yourportfolio.com"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GitHub Profile
                    </label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.githubLink}
                        onChange={(e) => handleInputChange('githubLink', e.target.value)}
                        placeholder="https://github.com/username"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="url"
                        value={formData.linkedinProfile}
                        onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Terms */}
            <div className="mb-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Terms & Conditions</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    By submitting this application, you agree that:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      Your information will be shared with the employer for recruitment purposes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      You may be contacted via email or phone for interview purposes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      Your application can be tracked in your dashboard
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      You are submitting accurate and truthful information
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={submitting}
                className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !isCurriculumComplete()}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 flex items-center justify-center gap-3"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default JobApplicationPage;
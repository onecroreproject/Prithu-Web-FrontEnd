import React, { useState, useEffect } from 'react';
import {
  Clock,
  Users,
  Eye,
  Award,
  ChevronRight,
  ExternalLink,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle2,
  Send,
  Search,
  Loader2,
  Building,
  User,
  Menu,
  X,
  Bookmark,
  BookmarkCheck,
  FolderOpen,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import {updateJobEngagement} from "../../Service/jobservices";
import Header from '../../components/Header';

const AppliedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedJobsLoading, setSavedJobsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('applied'); // 'applied' or 'saved'
  const navigate = useNavigate();

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Fetch applied jobs from API
  const fetchAppliedJobs = async (search = '') => {
    try {
      setLoading(true);
      setError(null);
      
   
      const response = await axios.get('/api/job-applications/applied-jobs', {
        params: {
          search: search
        }
      });
console.log(response.data)
      if (response.data.success) {
        const formattedJobs = response.data.jobs.map(job => ({
          ...job,
          id: job.applicationId,
          title: job.job.title,
          company: job.company.name,
          appliedDate: formatDate(job.appliedAt),
          applicationSentDate: formatDate(job.appliedAt),
          status: job.status,
          totalApplications: job.job.totalApplications || 0,
          recruiterViews: job.status !== 'applied',
          matchCriteria: generateMatchCriteria(job),
          location: formatLocation(job.location),
          jobType: job.job.employmentType,
          salary: formatSalary(job.job.salary),
          postedDate: formatDate(job.job.postedAt),
          startDate: formatDate(job.job.jobStartDate),
          expiredDate: formatDate(job.job.jobEndDate),
          active: false,
          jobDetails: job.job,
          companyDetails: job.company,
          hrDetails: job.hr,
          applicationDetails: {
            status: job.status,
            appliedAt: job.appliedAt
          }
        }));

        setJobs(formattedJobs);
        if (formattedJobs.length > 0 && activeTab === 'applied') {
          const firstJob = { ...formattedJobs[0], active: true };
          setSelectedJob(firstJob);
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load applied jobs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch saved jobs from API
  const fetchSavedJobs = async () => {
    try {
      setSavedJobsLoading(true);
    
      const response = await axios.get('/api/get/user/saved/jobs', {
      
        params: {
          search: searchQuery
        }
      });
      


      if (response.data.success) {
        const formattedSavedJobs = response.data.jobs?.map(savedJob => {
          const job = savedJob.job || {};
          return {
            id: savedJob._id || job.jobId,
            savedId: savedJob._id, // Keep the saved job ID for unsaving
            title: job.title || 'No Title',
            company: savedJob.company?.name || 'Unknown Company',
            savedAt: formatDate(savedJob.savedAt),
            isSaved: true,
            active: false,
            jobDetails: job,
            savedJobDetails: savedJob,
            
            // Job details
            jobType: job.employmentType,
            workMode: job.workMode,
            shiftType: job.shiftType,
            urgencyLevel: job.urgencyLevel,
            jobDescription: job.jobDescription,
            requiredSkills: job.requiredSkills,
            qualifications: job.qualifications,
            
            // Salary from job.salary object
            salary: job.salary ? formatSalary(job.salary) : 'Salary not disclosed',
            
            // Experience from job.experience object
            experience: job.experience,
            
            // Job image
            jobImage: job.jobImage,
            
            // Posted date
            postedDate: formatDate(job?.postedAt),

            // Start date
            startDate: formatDate(job?.jobStartDate),

            // Expired date
            expiredDate: formatDate(job?.jobEndDate),

            // Total applications
            totalApplications: job.totalApplications || 0,
            
            // Location from savedJob.location object
            location: formatLocation(savedJob.location),
            
            // Company details
            companyDetails: savedJob.company,
            
            // HR details
            hrDetails: savedJob.hr
          };
        }) || [];

  
        setSavedJobs(formattedSavedJobs);
        
        // If we're on saved tab and there are saved jobs, select the first one
        if (formattedSavedJobs.length > 0 && activeTab === 'saved') {
          const firstSavedJob = { ...formattedSavedJobs[0], active: true };
          setSelectedJob(firstSavedJob);
        }
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
      // Don't show error for saved jobs to prevent breaking the UI
    } finally {
      setSavedJobsLoading(false);
    }
  };

  const handleViewJobs = (job) => {

    const jobId = job.jobDetails?.jobId || job.id;
    if (jobId) {
      navigate(`/job/${jobId}`);
    } else {
      console.error('No job ID found for navigation');
    }
  };

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const isFuture = diffInMs < 0;
    const absDiffInMs = Math.abs(diffInMs);
    const diffInHours = Math.floor(absDiffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    const diffInMonths = Math.floor(diffInDays / 30);

    const suffix = isFuture ? 'from now' : 'ago';

    if (diffInMonths > 0) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ${suffix}`;
    } else if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ${suffix}`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ${suffix}`;
    } else {
      return isFuture ? 'Starting soon' : 'Just now';
    }
  };

  const formatLocation = (location) => {
    if (!location) return 'Location not specified';
    
    if (typeof location === 'string') return location;
    
    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.area) parts.push(location.area);
    if (location.state) parts.push(location.state);
    if (location.country) parts.push(location.country);
    
    if (location.remoteEligibility) {
      if (location.remoteEligibility === 'remote' || location.remoteEligibility === true) {
        parts.push('(Remote)');
      } else if (location.remoteEligibility === 'hybrid') {
        parts.push('(Hybrid)');
      }
    }
    
    return parts.join(', ') || 'Location not specified';
  };

  const formatSalary = (salary) => {
    if (!salary || typeof salary === 'string') return salary || 'Salary not disclosed';
    
    if (!salary.currency) return 'Salary not disclosed';
    
    const min = salary.min ? parseFloat(salary.min).toLocaleString() : '';
    const max = salary.max ? parseFloat(salary.max).toLocaleString() : '';
    const type = salary.type || 'yearly';
    
    if (min && max) {
      return `${salary.currency}${min} - ${salary.currency}${max} ${type === 'monthly' ? '/month' : '/year'}`;
    } else if (min) {
      return `${salary.currency}${min} ${type === 'monthly' ? '/month' : '/year'}`;
    } else {
      return 'Salary not disclosed';
    }
  };

  const generateMatchCriteria = (job) => {
    const criteria = [];
    
    // Check if applied early (within 3 days of posting)
    const postedDate = new Date(job.job.postedAt);
    const appliedDate = new Date(job.appliedAt);
    const daysDifference = Math.floor((appliedDate - postedDate) / (1000 * 60 * 60 * 24));
    
    if (daysDifference <= 3) {
      criteria.push('Early Applicant');
    }
    
    // Check for required skills match (simplified)
    if (job.job.requiredSkills && job.job.requiredSkills.length > 0) {
      criteria.push('Skills Match');
    }
    
    // Check experience match
    if (job.job.experience) {
      criteria.push('Experience Level Match');
    }
    
    // Check location match
    if (job.location.remoteEligibility === 'remote') {
      criteria.push('Remote Work Eligible');
    }
    
    // Default criteria
    if (criteria.length === 0) {
      criteria.push('Profile Submitted');
    }
    
    return criteria;
  };

  const handleViewSimilarJobs = (job) => {
    navigate(`/jobs?role=${encodeURIComponent(job.title)}`);
  };

  // Unsave job function
  const handleUnsaveJob = async (job) => {
    try {
      const token = localStorage.getItem("token");
     

      // Optimistic UI update - immediately remove from saved jobs
      setSavedJobs(prev => prev.filter(j => j.savedId !== job.savedId));

      // If the unsaved job was selected, select another one or clear selection
      if (selectedJob && selectedJob.savedId === job.savedId) {
        const remainingJobs = savedJobs.filter(j => j.savedId !== job.savedId);
        if (remainingJobs.length > 0) {
          const newSelectedJob = { ...remainingJobs[0], active: true };
          setSelectedJob(newSelectedJob);
        } else {
          setSelectedJob(null);
        }
      }

      // Update engagement
      await updateJobEngagement(job.jobDetails?.jobId || job.id, "saved", token);

      // Show success message
      alert('Job unsaved successfully');
    } catch (err) {
      console.error('Error unsaving job:', err);
      // Rollback - refetch saved jobs to restore the job
      fetchSavedJobs();
      alert('Failed to unsave job. Please try again.');
    }
  };

  // Apply to saved job
  const handleApplyToJob = (job) => {
    const jobId = job.jobDetails?.jobId || job.id;
    if (jobId) {
      navigate(`/job/${jobId}/apply`);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchAppliedJobs();
    fetchSavedJobs();
  }, []);

  // Fetch saved jobs when tab changes to saved OR when search query changes for saved jobs
  useEffect(() => {
    if (activeTab === 'saved') {
      fetchSavedJobs();
    }
  }, [activeTab, searchQuery]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (activeTab === 'applied') {
      fetchAppliedJobs(searchQuery);
    } else {
      // For saved jobs, search is already handled in fetchSavedJobs via searchQuery param
      fetchSavedJobs();
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    // Update active state
    if (activeTab === 'applied') {
      setJobs(prev => prev.map(j => ({
        ...j,
        active: j.id === job.id
      })));
    } else {
      setSavedJobs(prev => prev.map(j => ({
        ...j,
        active: j.id === job.id
      })));
    }
    // Close sidebar on mobile when job is selected
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
    if (tab === 'applied' && jobs.length > 0) {
      const firstJob = { ...jobs[0], active: true };
      setSelectedJob(firstJob);
    } else if (tab === 'saved' && savedJobs.length > 0) {
      const firstSavedJob = { ...savedJobs[0], active: true };
      setSelectedJob(firstSavedJob);
    } else {
      setSelectedJob(null);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'shortlisted': return 'text-green-600 bg-green-50';
      case 'reviewed': return 'text-blue-600 bg-blue-50';
      case 'awaiting': return 'text-yellow-600 bg-yellow-50';
      case 'accepted': return 'text-emerald-600 bg-emerald-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'shortlisted': return 'Shortlisted';
      case 'reviewed': return 'Under Review';
      case 'awaiting': return 'Awaiting Recruiter';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return 'Applied';
    }
  };

  const getCurrentJobs = () => activeTab === 'applied' ? jobs : savedJobs;
  const getTotalCount = () => activeTab === 'applied' ? jobs.length : savedJobs.length;

  // Loading state
  if (loading && activeTab === 'applied') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your applied jobs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && getCurrentJobs().length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md p-6 bg-white rounded-lg border border-red-200">
          <div className="text-red-600 mb-3">Error loading jobs</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => activeTab === 'applied' ? fetchAppliedJobs() : fetchSavedJobs()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No jobs state
  if (getCurrentJobs().length === 0 && !loading && !savedJobsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with Tabs */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'applied' ? 'Applied Jobs' : 'Saved Jobs'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'applied' ? 'Track your application progress' : 'Your saved job opportunities'}
                </p>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 border-b border-gray-200 w-full sm:w-auto">
                <button
                  onClick={() => handleTabChange('applied')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'applied'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Applied ({jobs.length})
                </button>
                <button
                  onClick={() => handleTabChange('saved')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'saved'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Saved ({savedJobs.length})
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
            <div className="text-center p-8 max-w-md">
              {activeTab === 'applied' ? (
                <>
                  <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="text-gray-400 mb-4 text-lg">No applied jobs found</div>
                  <p className="text-gray-600 mb-6">You haven't applied to any jobs yet.</p>
                  <button 
                    onClick={() => navigate('/jobs')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                  >
                    Browse Jobs
                  </button>
                </>
              ) : (
                <>
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <div className="text-gray-400 mb-4 text-lg">No saved jobs found</div>
                  <p className="text-gray-600 mb-6">Save jobs you're interested in to view them here.</p>
                  <button 
                    onClick={() => navigate('/jobs')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                  >
                    Browse Jobs
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-50">
      <div className='mb-15'>
      <Header />
      </div>
      <div className="max-w-7xl  mx-auto">
        {/* Header with Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {activeTab === 'applied' ? 'Applied Jobs' : 'Saved Jobs'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'applied' ? 'Track your application progress' : 'Your saved job opportunities'}
                </p>
              </div>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6 text-gray-600" />
                ) : (
                  <Menu className="w-6 h-6 text-gray-600" />
                )}
              </button>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Tabs */}
              <div className="flex space-x-1 border-b border-gray-200 w-full sm:w-auto">
                <button
                  onClick={() => handleTabChange('applied')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'applied'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Applied ({jobs.length})
                </button>
                <button
                  onClick={() => handleTabChange('saved')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                    activeTab === 'saved'
                      ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Saved ({savedJobs.length})
                </button>
              </div>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="w-full sm:w-80">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${activeTab === 'applied' ? 'applied' : 'saved'} jobs...`}
                    className="w-full pl-10 pr-24 sm:pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1.5 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 sm:hidden"
                  >
                    Go
                  </button>
                  <button
                    type="submit"
                    className="hidden sm:block absolute right-2 top-1.5 px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex relative">
          {/* Mobile Sidebar Overlay */}
          {isSidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Left Sidebar - Jobs List */}
          <div className={`
            ${isMobile ? 'fixed inset-y-0 left-0 z-30 w-80 transform transition-transform duration-300 ease-in-out lg:relative lg:inset-auto lg:z-auto lg:w-1/3 lg:translate-x-0' : 'w-1/3'}
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            border-r border-gray-200 bg-white min-h-[calc(100vh-80px)] lg:min-h-[calc(100vh-80px)] overflow-y-auto
          `}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 lg:block">
                <h2 className="text-sm font-semibold text-gray-900">
                  {activeTab === 'applied' ? 'All Applications' : 'All Saved Jobs'} ({getTotalCount()})
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
             
              <div className="space-y-3">
                {getCurrentJobs().map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    className={`w-full text-left p-3 sm:p-4 rounded-lg border transition-colors ${
                      job.active
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          {activeTab === 'saved' && (
                            <BookmarkCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          )}
                          <h3 className={`font-medium truncate ${job.active ? 'text-blue-700' : 'text-gray-900'}`}>
                            {job.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate">{job.company}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{job.location}</span>
                          </span>
                          <span className="hidden sm:inline">•</span>
                          {activeTab === 'applied' ? (
                            <span>Applied: {job.appliedDate}</span>
                          ) : (
                            <span>Saved: {job.savedAt}</span>
                          )}
                        </div>
                      </div>
                      {activeTab === 'applied' && (
                        <div className="self-start sm:self-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(job.status)}`}>
                            {getStatusText(job.status)}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                
                {(savedJobsLoading && activeTab === 'saved') && (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Job Details */}
          {selectedJob && (
            <div className={`
              ${isMobile ? 'w-full' : 'w-2/3'}
              min-h-[calc(100vh-80px)] bg-white overflow-y-auto
            `}>
              <div className="p-4 sm:p-6 lg:p-8">
                {/* Mobile Back Button */}
                {isMobile && !isSidebarOpen && (
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="mb-4 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Menu className="w-4 h-4" />
                    {activeTab === 'applied' ? 'Show Applications' : 'Show Saved Jobs'} ({getTotalCount()})
                  </button>
                )}

                {/* Job Header with Company Info */}
                <div className="mb-6 sm:mb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        {selectedJob.companyDetails?.logo && (
                          <img
                            src={selectedJob.companyDetails.logo}
                            alt={selectedJob.company}
                            className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          />
                        )}
                        {!selectedJob.companyDetails?.logo && activeTab === 'saved' && (
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border border-gray-200 flex items-center justify-center flex-shrink-0">
                            <Building className="w-8 h-8 text-blue-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            {activeTab === 'saved' && (
                              <BookmarkCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            )}
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 break-words">
                              {selectedJob.title}
                            </h2>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Building className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <p className="text-base sm:text-lg text-gray-700 truncate">{selectedJob.company}</p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {selectedJob.urgencyLevel && (
                              <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                selectedJob.urgencyLevel === 'immediate' 
                                  ? 'bg-red-100 text-red-700'
                                  : selectedJob.urgencyLevel === 'urgent'
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {selectedJob.urgencyLevel}
                              </span>
                            )}
                            {selectedJob.workMode && (
                              <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                                {selectedJob.workMode}
                              </span>
                            )}
                            {selectedJob.shiftType && (
                              <span className="inline-block px-2 py-0.5 text-xs bg-purple-100 text-purple-600 rounded-full">
                                {selectedJob.shiftType}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{selectedJob.location}</span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {selectedJob.jobType}
                            {selectedJob.workMode && ` • ${selectedJob.workMode}`}
                          </span>
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{selectedJob.salary}</span>
                        </span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleViewSimilarJobs(selectedJob)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 self-start sm:self-center"
                    >
                      View similar jobs
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-px bg-gray-200 my-4 sm:my-6"></div>
                </div>

             

                {/* Application Status - Only for applied jobs */}
                {activeTab === 'applied' && (
                  <>
                    <div className="h-px bg-gray-200 my-4 sm:my-6"></div>
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Application status</h3>
                     
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                          <div className="text-sm text-gray-600 font-medium mb-2">Total Applications</div>
                          <div className="flex items-center justify-center gap-2">
                            <Send className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="text-base font-semibold text-gray-900">{selectedJob.totalApplications}</div>
                          </div>
                        </div>
                        
                        <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                          <div className="text-sm text-gray-600 font-medium mb-2">Applied</div>
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="text-base font-semibold text-gray-900">{selectedJob.appliedDate}</div>
                          </div>
                        </div>
                       
                        <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                          <div className="text-sm text-gray-600 font-medium mb-2">Application Sent</div>
                          <div className="flex items-center justify-center gap-2">
                            <Send className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="text-base font-semibold text-gray-900">{selectedJob.applicationSentDate}</div>
                          </div>
                        </div>
                       
                        <div className={`text-center p-3 sm:p-4 border rounded-lg ${
                          selectedJob.status === 'awaiting'
                            ? 'border-yellow-200 bg-yellow-50'
                            : selectedJob.status === 'shortlisted'
                            ? 'border-green-200 bg-green-50'
                            : selectedJob.status === 'reviewed'
                            ? 'border-blue-200 bg-blue-50'
                            : selectedJob.status === 'accepted'
                            ? 'border-emerald-200 bg-emerald-50'
                            : selectedJob.status === 'rejected'
                            ? 'border-red-200 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="text-sm text-gray-600 font-medium mb-2">Current Status</div>
                          <div className="flex items-center justify-center gap-2">
                            <Clock className={`w-4 h-4 flex-shrink-0 ${
                              selectedJob.status === 'awaiting' ? 'text-yellow-600' :
                              selectedJob.status === 'shortlisted' ? 'text-green-600' :
                              selectedJob.status === 'reviewed' ? 'text-blue-600' :
                              selectedJob.status === 'accepted' ? 'text-emerald-600' :
                              selectedJob.status === 'rejected' ? 'text-red-600' : 'text-gray-600'
                            }`} />
                            <div className={`text-base font-semibold ${
                              selectedJob.status === 'awaiting' ? 'text-yellow-700' :
                              selectedJob.status === 'shortlisted' ? 'text-green-700' :
                              selectedJob.status === 'reviewed' ? 'text-blue-700' :
                              selectedJob.status === 'accepted' ? 'text-emerald-700' :
                              selectedJob.status === 'rejected' ? 'text-red-700' : 'text-gray-700'
                            }`}>
                              {getStatusText(selectedJob.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* What may work for you - Only for applied jobs */}
                    <div className="h-px bg-gray-200 my-4 sm:my-6"></div>
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        What may work for you?
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Following criteria suggests how well you match with the job.
                      </p>
                     
                      <div className="space-y-3">
                        {selectedJob.matchCriteria?.map((criteria, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700 break-words">{criteria}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Saved Info - Only for saved jobs */}
                {activeTab === 'saved' && (
                  <>
                    <div className="h-px bg-gray-200 my-4 sm:my-6"></div>
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">Saved Information</h3>
                     
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                          <div className="text-sm text-gray-600 font-medium mb-2">Job Posted</div>
                          <div className="flex items-center justify-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="text-base font-semibold text-gray-900">{selectedJob.postedDate}</div>
                          </div>
                        </div>

                        <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg bg-blue-50 border-blue-100">
                          <div className="text-sm text-gray-600 font-medium mb-2">Saved Date</div>
                          <div className="flex items-center justify-center gap-2">
                            <BookmarkCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                            <div className="text-base font-semibold text-blue-700">{selectedJob.savedAt}</div>
                          </div>
                        </div>

                        <div className="text-center p-3 sm:p-4 border border-gray-200 rounded-lg">
                          <div className="text-sm text-gray-600 font-medium mb-2">Total Applications</div>
                          <div className="flex items-center justify-center gap-2">
                            <Send className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <div className="text-base font-semibold text-gray-900">{selectedJob.totalApplications}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

           

                {/* HR Information - Only for saved jobs */}
                {activeTab === 'saved' && selectedJob.hrDetails && selectedJob.hrDetails.name && (
                  <>
                    <div className="h-px bg-gray-200 my-4 sm:my-6"></div>
                    <div className="mb-6 sm:mb-8">
                      <h3 className="text-base font-semibold text-gray-900 mb-4">HR Contact</h3>
                     
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {selectedJob.hrDetails.profileAvatar && (
                          <img
                            src={selectedJob.hrDetails.profileAvatar}
                            alt={selectedJob.hrDetails.name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{selectedJob.hrDetails.name}</h4>
                          {selectedJob.hrDetails.position && (
                            <p className="text-sm text-gray-600">{selectedJob.hrDetails.position}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 gap-4">
                  <div className="text-sm text-gray-500 flex items-center gap-2">
                    <Calendar className="w-4 h-4 flex-shrink-0" />
                    {activeTab === 'applied' ? 'Posted' : 'Job Posted'}: {selectedJob.postedDate} • Expires: {selectedJob.expiredDate}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {activeTab === 'saved' && (
                      <>
                        <button
                          onClick={() => handleUnsaveJob(selectedJob)}
                          className="px-4 sm:px-5 py-2.5 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                        >
                          <Bookmark className="w-4 h-4" />
                          Unsave Job
                        </button>
                  
                      </>
                    )}
                    <button
                      onClick={() => handleViewJobs(selectedJob)}
                      className="px-4 sm:px-5 py-2.5 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Job Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppliedJobs;
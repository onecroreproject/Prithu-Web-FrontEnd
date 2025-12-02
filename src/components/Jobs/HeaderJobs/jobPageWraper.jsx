import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import JobPage from "./JobModal";
import api from "../../../api/axios";

export default function JobPageWrapper() {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [job, setJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Transform API job data to match JobPage component expectations
  const transformJobData = (apiJob) => {
    if (!apiJob) return null;
    
    return {
      // Basic job info
      _id: apiJob.jobId || apiJob._id,
      jobTitle: apiJob.jobTitle,
      jobRole: apiJob.jobRole,
      jobCategory: apiJob.jobCategory,
      jobSubCategory: apiJob.jobSubCategory,
      employmentType: apiJob.employmentType,
      workMode: apiJob.workMode,
      shiftType: apiJob.shiftType,
      
      // Location
      country: apiJob.country,
      state: apiJob.state,
      city: apiJob.city,
      
      // Salary
      salaryMin: apiJob.salaryMin,
      salaryMax: apiJob.salaryMax,
      salaryType: apiJob.salaryType,
      salaryCurrency: 'INR', // Default to INR as per your format
      
      // Experience
      minimumExperience: apiJob.minimumExperience,
      maximumExperience: apiJob.maximumExperience,
      
      // Description & Requirements
      jobDescription: apiJob.jobDescription,
      requiredSkills: apiJob.requiredSkills || [],
      
      // Company info from postedBy and companyProfile
      companyName: apiJob.postedBy?.companyName || "Unknown Company",
      companyLogo: apiJob.companyProfile?.logo,
      companyIndustry: apiJob.companyProfile?.industry,
      
      // Engagement counts
      likeCount: apiJob.likeCount || 0,
      shareCount: apiJob.shareCount || 0,
      saveCount: apiJob.saveCount || 0,
      applyCount: apiJob.applyCount || 0,
      viewCount: apiJob.viewCount || 0,
      
      // User engagement flags
      isLiked: apiJob.isLiked || false,
      isSaved: apiJob.isSaved || false,
      isApplied: apiJob.isApplied || false,
      isViewed: apiJob.isViewed || false,
      
      // Additional job details (you might need to add these to your controller)
      openingsCount: apiJob.openingsCount || 1,
      freshersAllowed: apiJob.freshersAllowed !== undefined ? apiJob.freshersAllowed : true,
      remoteEligibility: apiJob.remoteEligibility !== undefined ? apiJob.remoteEligibility : false,
      salaryVisibility: apiJob.salaryVisibility || 'shown',
      resumeRequired: apiJob.resumeRequired !== undefined ? apiJob.resumeRequired : true,
      coverLetterRequired: apiJob.coverLetterRequired !== undefined ? apiJob.coverLetterRequired : false,
      
      // Dates
      createdAt: apiJob.createdAt,
      endDate: apiJob.endDate,
      
      // Status
      status: apiJob.status,
      isApproved: apiJob.isApproved,
      isPaid: apiJob.paymentAmount > 0,
      isFeatured: apiJob.isFeatured || false,
      
      // Engagement score
      engagementScore: apiJob.engagementScore || 0
    };
  };

  // Fetch job details when ID comes from params (direct URL access)
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await api.get(`/job/get/jobs/by/id/${id}`);
       
        if (response.data.success && response.data.job) {
          const transformedJob = transformJobData(response.data.job);
          setJob(transformedJob);
          setJobs([transformedJob]);
          setCurrentIndex(0);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError(err.response?.data?.message || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    // If no state (direct URL access or page refresh), fetch from API
    if (!state || !state.jobs) {
      fetchJobDetails();
    } else {
      // Use state data if available - transform each job
      const { jobs: stateJobs, index } = state;
      const transformedJobs = stateJobs.map(job => transformJobData(job));
      setJobs(transformedJobs);
      setCurrentIndex(index);
      setJob(transformedJobs[index]);
      setLoading(false);
    }
  }, [id, state]);

  // NEXT JOB
  const handleNext = () => {
    if (currentIndex < jobs.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextJob = jobs[nextIndex];

      // If we have multiple jobs, navigate with state
      if (jobs.length > 1) {
        navigate(`/job/${nextJob._id}`, {
          state: {
            jobs: jobs.map(job => ({
              // Include minimal data needed for transformation
              jobId: job._id,
              jobTitle: job.jobTitle,
              companyName: job.companyName,
              // Add other fields that your JobCard uses
              ...job
            })),
            index: nextIndex,
          },
          replace: true,
        });
      } else {
        // Single job - just update local state
        setCurrentIndex(nextIndex);
        setJob(nextJob);
      }
    }
  };

  // PREVIOUS JOB
  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevJob = jobs[prevIndex];

      // If we have multiple jobs, navigate with state
      if (jobs.length > 1) {
        navigate(`/job/${prevJob._id}`, {
          state: {
            jobs: jobs.map(job => ({
              jobId: job._id,
              jobTitle: job.jobTitle,
              companyName: job.companyName,
              ...job
            })),
            index: prevIndex,
          },
          replace: true,
        });
      } else {
        // Single job - just update local state
        setCurrentIndex(prevIndex);
        setJob(prevJob);
      }
    }
  };

  // CLOSE and go back to previous page
  const handleClose = () => {
    navigate(-1);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The job you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <JobPage
      job={job}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onClose={handleClose}
      currentIndex={currentIndex}
      totalJobs={jobs.length}
      showNavigation={jobs.length > 1}
    />
  );
}
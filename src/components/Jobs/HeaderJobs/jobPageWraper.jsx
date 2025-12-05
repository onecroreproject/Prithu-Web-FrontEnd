import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import JobPage from "./JobModal";
import api from "../../../api/axios";

export default function JobPageWrapper() {
  const { state } = useLocation();
  console.log("Received state:", state);
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ----------------------------------------------------------
   * UNIFIED TRANSFORM FUNCTION FOR BOTH STATE FORMATS
   * ---------------------------------------------------------- */
  const transformJobData = (apiJob) => {
    if (!apiJob) return null;

    // Helper function to get array safely
    const safeArray = (arr) => {
      if (!arr) return [];
      if (Array.isArray(arr)) return arr.filter(item => item && item.trim() !== '');
      return [];
    };

    // Helper function to get nested value
    const getNestedValue = (obj, ...paths) => {
      for (const path of paths) {
        const value = obj?.[path];
        if (value !== undefined && value !== null) return value;
      }
      return '';
    };

    return {
      /* ----------------------------------------------------------
       * BASIC INFO
       * ---------------------------------------------------------- */
      _id: apiJob.jobId || apiJob._id,
      jobTitle: apiJob.jobTitle,
      jobRole: apiJob.jobRole,
      jobCategory: apiJob.jobCategory,
      jobSubCategory: apiJob.jobSubCategory,
      employmentType: apiJob.employmentType,
      workMode: apiJob.workMode,
      shiftType: apiJob.shiftType,
      openingsCount: apiJob.openingsCount,
      urgencyLevel: apiJob.urgencyLevel,

      /* ----------------------------------------------------------
       * LOCATION
       * ---------------------------------------------------------- */
      country: apiJob.country,
      state: apiJob.state,
      city: apiJob.city,
      pincode: apiJob.pincode,
      fullAddress: apiJob.fullAddress,
      remoteEligibility: apiJob.remoteEligibility,

      /* ----------------------------------------------------------
       * SALARY
       * ---------------------------------------------------------- */
      salaryMin: apiJob.salaryMin,
      salaryMax: apiJob.salaryMax,
      salaryType: apiJob.salaryType,
      salaryCurrency: apiJob.salaryCurrency || 'INR',
      salaryVisibility: apiJob.salaryVisibility || 'public',

      /* ----------------------------------------------------------
       * EXPERIENCE & QUALIFICATION
       * ---------------------------------------------------------- */
      minimumExperience: apiJob.minimumExperience || 0,
      maximumExperience: apiJob.maximumExperience || 0,
      freshersAllowed: apiJob.freshersAllowed || false,
      educationLevel: apiJob.educationLevel,
      degreeRequired: apiJob.degreeRequired,
      certificationRequired: safeArray(apiJob.certificationRequired),

      /* ----------------------------------------------------------
       * DESCRIPTION
       * ---------------------------------------------------------- */
      jobDescription: apiJob.jobDescription,
      responsibilities: safeArray(apiJob.responsibilities),
      dailyTasks: safeArray(apiJob.dailyTasks),
      keyDuties: safeArray(apiJob.keyDuties),

      /* ----------------------------------------------------------
       * SKILLS
       * ---------------------------------------------------------- */
      requiredSkills: safeArray(apiJob.requiredSkills),
      preferredSkills: safeArray(apiJob.preferredSkills),
      technicalSkills: safeArray(apiJob.technicalSkills),
      softSkills: safeArray(apiJob.softSkills),
      toolsAndTechnologies: safeArray(apiJob.toolsAndTechnologies),

      /* ----------------------------------------------------------
       * HIRING INFORMATION
       * ---------------------------------------------------------- */
      hiringManagerName: apiJob.hiringManagerName,
      hiringManagerEmail: apiJob.hiringManagerEmail,
      hiringManagerPhone: apiJob.hiringManagerPhone,
      interviewMode: apiJob.interviewMode,
      interviewLocation: apiJob.interviewLocation,
      interviewRounds: safeArray(apiJob.interviewRounds),
      hiringProcess: safeArray(apiJob.hiringProcess),
      interviewInstructions: apiJob.interviewInstructions,

      /* ----------------------------------------------------------
       * TIMINGS
       * ---------------------------------------------------------- */
      startDate: apiJob.startDate,
      endDate: apiJob.endDate,
      jobTimings: apiJob.jobTimings,
      workingDays: apiJob.workingDays,
      workingHours: apiJob.workingHours,
      holidaysType: apiJob.holidaysType,

      /* ----------------------------------------------------------
       * DOCUMENTS
       * ---------------------------------------------------------- */
      resumeRequired: apiJob.resumeRequired ?? true,
      coverLetterRequired: apiJob.coverLetterRequired || false,
      documentsRequired: safeArray(apiJob.documentsRequired),

      /* ----------------------------------------------------------
       * ENGAGEMENT COUNTS
       * ---------------------------------------------------------- */
      likeCount: apiJob.likeCount || apiJob.stats?.engagementScore || 0,
      shareCount: apiJob.shareCount || 0,
      saveCount: apiJob.saveCount || 0,
      applyCount: apiJob.applyCount || apiJob.stats?.applications || 0,
      viewCount: apiJob.viewCount || apiJob.stats?.views || 0,
      engagementScore: apiJob.engagementScore || apiJob.stats?.engagementScore || 0,

      /* ----------------------------------------------------------
       * USER FLAGS
       * ---------------------------------------------------------- */
      isLiked: apiJob.isLiked || false,
      isSaved: apiJob.isSaved || false,
      isApplied: apiJob.isApplied || false,
      isViewed: apiJob.isViewed || false,
      isShared: apiJob.isShared || false,

      /* ----------------------------------------------------------
       * PAYMENT / PROMOTION
       * ---------------------------------------------------------- */
      paymentAmount: apiJob.paymentAmount,
      boostLevel: apiJob.boostLevel,
      isFeatured: apiJob.isFeatured,
      isPromoted: apiJob.isPromoted,

      /* ----------------------------------------------------------
       * COMPANY INFO - HANDLE BOTH FORMATS
       * ---------------------------------------------------------- */
      companyName: apiJob.companyName || apiJob.postedBy?.companyName || '',
      companyLogo: apiJob.companyLogo,
      companyIndustry: apiJob.companyIndustry,
      companyWebsite: apiJob.companyWebsite,

      /* ----------------------------------------------------------
       * ADDITIONAL FIELDS (FROM FORMAT 1)
       * ---------------------------------------------------------- */
      benefits: safeArray(apiJob.benefits),
      perks: safeArray(apiJob.perks),
      bonuses: apiJob.bonuses,
      incentives: apiJob.incentives,
      tags: safeArray(apiJob.tags),
      skillKeywords: safeArray(apiJob.skillKeywords),
      keywordSearch: safeArray(apiJob.keywordSearch),
      contractDuration: apiJob.contractDuration,
      googleLocation: apiJob.googleLocation,
      priorityScore: apiJob.priorityScore,

      /* ----------------------------------------------------------
       * STATUS
       * ---------------------------------------------------------- */
      status: apiJob.status || 'active',
      isApproved: apiJob.isApproved,

      /* ----------------------------------------------------------
       * TIMESTAMPS
       * ---------------------------------------------------------- */
      createdAt: apiJob.createdAt,
      updatedAt: apiJob.updatedAt,
    };
  };

  /* ----------------------------------------------------------
   * FETCH JOB BY ID FROM API
   * ---------------------------------------------------------- */
  useEffect(() => {
    console.log("Job ID from params:", id);

    const fetchJobDetails = async () => {
      if (!id) {
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching job from API:", id);
        const response = await api.get(`/job/get/jobs/by/id/${id}`);

        console.log("API Response:", response.data);

        if (response.data.success && response.data.job) {
          const transformedJob = transformJobData(response.data.job);
          console.log("Transformed job:", transformedJob);
          setJob(transformedJob);
          setJobs([transformedJob]);
          setCurrentIndex(0);
        } else {
          setError(response.data.message || "Job not found in response");
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError(err.response?.data?.message || err.message || "Unable to load job details.");
      } finally {
        setLoading(false);
      }
    };

    // Check if we have state with job data
    if (state && state.job) {
      console.log("Using job data from state");
      
      // Transform the job from state
      const transformedJob = transformJobData(state.job);
      console.log("Transformed job from state:", transformedJob);
      
      setJob(transformedJob);
      
      // Check if we have jobs array in state (for navigation)
      if (state.jobs && Array.isArray(state.jobs)) {
        const transformedJobs = state.jobs.map(transformJobData);
        setJobs(transformedJobs);
        setCurrentIndex(state.index || 0);
      } else {
        // If no jobs array, create one with just this job
        setJobs([transformedJob]);
        setCurrentIndex(0);
      }
      
      setLoading(false);
      
      // Optionally: Still fetch from API to get complete data
      // Uncomment if you want to always get fresh data from API
      // fetchJobDetails();
    } else {
      // No state provided, fetch from API
      console.log("No state provided, fetching from API");
      fetchJobDetails();
    }
  }, [id, state]);

  /* ----------------------------------------------------------
   * NAVIGATION (NEXT / PREVIOUS)
   * ---------------------------------------------------------- */
  const handleNext = () => {
    if (currentIndex < jobs.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextJob = jobs[nextIndex];

      navigate(`/job/get/jobs/by/id/${nextJob._id}`, {
        state: {
          job: nextJob,
          jobs,
          index: nextIndex
        },
        replace: true,
      });
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevJob = jobs[prevIndex];

      navigate(`/job/get/jobs/by/id/${prevJob._id}`, {
        state: {
          job: prevJob,
          jobs,
          index: prevIndex
        },
        replace: true,
      });
    }
  };

  /* ----------------------------------------------------------
   * CLOSE MODAL
   * ---------------------------------------------------------- */
  const handleClose = () => navigate("/jobs");

  /* ----------------------------------------------------------
   * RENDER STATES
   * ---------------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "The job you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate("/jobs")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  console.log("Passing to JobPage:", {
    job,
    currentIndex,
    totalJobs: jobs.length,
    showNavigation: jobs.length > 1
  });

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
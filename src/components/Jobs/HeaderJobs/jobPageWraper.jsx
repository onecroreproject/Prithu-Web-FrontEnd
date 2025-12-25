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

  /* ----------------------------------------------------------
   * TRANSFORM FUNCTION FOR SCHEMA FORMAT
   * ---------------------------------------------------------- */
  const transformJobData = (apiJob) => {
    console.log(apiJob)
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

    // Extract qualifications
    const extractQualifications = () => {
  console.log(apiJob)
      if (!apiJob.qualifications || !Array.isArray(apiJob.qualifications)) {
        return [];
      }
      return apiJob.qualifications
        .map(q => q.fullQualification || '')
        .filter(q => q.trim() !== '');
    };

    return {
  /* ----------------------------------------------------------
   * BASIC INFO
   * ---------------------------------------------------------- */
  _id: apiJob.jobId || apiJob._id, // ✅ backend sends jobId
  companyId: apiJob.companyId,
  jobTitle: apiJob.jobTitle,
  jobRole: apiJob.jobRole ? safeArray(apiJob.jobRole).join(", ") : "",
  jobCategory: apiJob.jobIndustry,
  jobSubCategory: apiJob.area,
  employmentType: apiJob.employmentType,
  workMode: apiJob.workMode,
  shiftType: apiJob.shiftType,
  openingsCount: apiJob.openingsCount || 1,
  urgencyLevel: apiJob.urgencyLevel,
  companyName:apiJob.companyName,
  companyLogo:apiJob.companyLogo || apiJob.companyProfile.logo,
  //companyCoverImage:apiJob.CoverImage ||apiJob.companyProfile.coverImage,

  /* ----------------------------------------------------------
   * CONTRACT INFO
   * ---------------------------------------------------------- */
  contractDuration: apiJob.contractDuration,
  contractDurationUnit: apiJob.contractDurationUnit,

  /* ----------------------------------------------------------
   * LOCATION
   * ---------------------------------------------------------- */
  country: apiJob.country,
  state: apiJob.state,
  city: apiJob.city,
  area: apiJob.area,
  pincode: apiJob.pincode,
  fullAddress: apiJob.fullAddress,
  remoteEligibility: apiJob.remoteEligibility || false,
  latitude: apiJob.latitude,
  longitude: apiJob.longitude,
  googleLocation: apiJob.googleLocation,

  /* ----------------------------------------------------------
   * SALARY
   * ---------------------------------------------------------- */
  salaryMin: apiJob.salaryMin,
  salaryMax: apiJob.salaryMax,
  salaryType: apiJob.salaryType,
  salaryCurrency: apiJob.salaryCurrency || "INR",
  benefits: safeArray(apiJob.benefits),

  /* ----------------------------------------------------------
   * EXPERIENCE & QUALIFICATION
   * ---------------------------------------------------------- */
  minimumExperience: apiJob.minimumExperience || 0,
  maximumExperience: apiJob.maximumExperience || 0,
  freshersAllowed: apiJob.freshersAllowed || false,
  degreeRequired: extractQualifications(),
  certificationRequired: safeArray(apiJob.certificationRequired),
  qualifications: apiJob.qualifications || [],

  /* ----------------------------------------------------------
   * DESCRIPTION & SKILLS
   * ---------------------------------------------------------- */
  jobDescription: apiJob.jobDescription,
  requiredSkills: safeArray(apiJob.requiredSkills),

  /* ----------------------------------------------------------
   * ✅ HIRING INFORMATION (FROM CompanyLogin)
   * ---------------------------------------------------------- */
  hiringManagerName: apiJob.hiringInfo?.name || "",
  hiringManagerPosition: apiJob.hiringInfo?.position || "",
  hiringManagerEmail: apiJob.hiringInfo?.email || "",
  hiringManagerPhone: apiJob.hiringInfo?.phone || "",
  hiringManagerWhatsApp: apiJob.hiringInfo?.whatsAppNumber || "",

  /* ----------------------------------------------------------
   * TIMINGS
   * ---------------------------------------------------------- */
  startDate: apiJob.startDate,
  endDate: apiJob.endDate,

  /* ----------------------------------------------------------
   * ENGAGEMENT COUNTS (DIRECT FROM API)
   * ---------------------------------------------------------- */
  likeCount: apiJob.likeCount || 0,
  saveCount: apiJob.saveCount || 0,
  applyCount: apiJob.applyCount || 0,
  shareCount: apiJob.shareCount || 0,
  viewCount: apiJob.viewCount || 0,

  /* ----------------------------------------------------------
   * USER FLAGS (DIRECT FROM API)
   * ---------------------------------------------------------- */
  isLiked: apiJob.isLiked || false,
  isSaved: apiJob.isSaved || false,
  isApplied: apiJob.isApplied || false,
  isViewed: apiJob.isViewed || false,
  isShared: apiJob.isShared || false,

  /* ----------------------------------------------------------
   * COMPANY INFO
   * ---------------------------------------------------------- */
  companyProfile: apiJob.companyProfile || null,

  /* ----------------------------------------------------------
   * MEDIA
   * ---------------------------------------------------------- */
  jobImage: apiJob.jobImage || "",

  /* ----------------------------------------------------------
   * STATUS
   * ---------------------------------------------------------- */
  status: apiJob.status,
  createdAt: apiJob.createdAt,
  updatedAt: apiJob.updatedAt,
};

  };

  /* ----------------------------------------------------------
   * FETCH JOB BY ID FROM API
   * ---------------------------------------------------------- */
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!id) {
        setError("No job ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(`/job/get/jobs/by/id/${id}`);
        
        if (response.data.success && response.data.job) {
          const transformedJob = transformJobData(response.data.job);
          console.log("Transformed job from API:", transformedJob);
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
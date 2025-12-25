// components/SimilarJobsSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight,
  AlertCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Building
} from "lucide-react";
import api from "../../../api/companyApi";
import JobCards from "./JobCards"; // Import the JobCards component

export default function SimilarJobsSection({ jobId }) {
  const navigate = useNavigate();
  const [similarJobs, setSimilarJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paused, setPaused] = useState(false);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const scrollSpeed = 0.8; // Slightly faster for better visual effect

  const domainJobs = [
    { category: "Product Companies Jobs", link: "/jobs?type=product" },
    { category: "E-Commerce Companies Jobs", link: "/jobs?type=ecommerce" },
    { category: "Fintech/EdTech Companies Jobs", link: "/jobs?type=fintech" }
  ];

  // Fetch similar jobs based on jobId
  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (!jobId) {
        setIsLoading(false);
        setError("No job ID provided");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await api.get(`/job/get/similar/jobs/${jobId}`, {
          params: { limit: 10 }
        });

        console.log("slide",response.data)

        if (response.data.success) {
          setSimilarJobs(response.data.jobs || []);
        } else {
          setError(response.data.message || "Failed to fetch similar jobs");
          setSimilarJobs([]);
        }
      } catch (error) {
        console.error("Error fetching similar jobs:", error);
        setError("Failed to load similar jobs. Please try again.");
        setSimilarJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSimilarJobs();
  }, [jobId]);

  // Animation effect for continuous horizontal scroll
  useEffect(() => {
    if (similarJobs.length === 0 || !containerRef.current) return;

    const track = containerRef.current.querySelector('.animation-track');
    if (!track) return;

    // Reset animation when jobs change
    scrollPositionRef.current = 0;
    
    const animate = () => {
      if (!paused && track) {
        scrollPositionRef.current += scrollSpeed;
        
        // When we've scrolled past one set of cards, reset to beginning
        const trackWidth = track.scrollWidth / 2;
        if (scrollPositionRef.current >= trackWidth) {
          scrollPositionRef.current = 0;
        }
        
        track.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [similarJobs, paused]);






   const handleClickCompany = (company)  => {
    if (company) {
      navigate(`/company/${company.companyId}`);
    }
  };

  // Handle manual navigation
  const scrollLeft = () => {
    if (containerRef.current) {
      scrollPositionRef.current -= 300;
      const track = containerRef.current.querySelector('.animation-track');
      if (track) {
        track.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      scrollPositionRef.current += 300;
      const track = containerRef.current.querySelector('.animation-track');
      if (track) {
        track.style.transform = `translateX(-${scrollPositionRef.current}px)`;
      }
    }
  };

  const renderLoadingSkeleton = () => (
    <div className="flex gap-6 overflow-hidden">
      {[...Array(4)].map((_, index) => (
        <div key={index} className="w-96 h-72 border border-gray-300 rounded-lg p-6 bg-white animate-pulse flex-shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300"></div>
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-24"></div>
            <div className="h-8 bg-gray-200 rounded w-8"></div>
          </div>
          <div className="space-y-2 mt-4">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Create carousel items using JobCards component structure
  const CarouselJobCard = ({ job, index }) => (
    <div 
      className="border border-gray-300 rounded-lg p-6 hover:shadow-xl transition-all duration-300 bg-white hover:border-cyan-300 cursor-pointer flex-shrink-0 w-96"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
     
    >
      {/* Logo + Title */}
      <div className="flex items-start gap-4">
        <div className="cursor-pointer flex-shrink-0">
          {job.companyProfile? (
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-cyan-500 to-blue-600">
              <img 
                src={job.companyProfile.logo}
                alt={job.companyName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  const parent = e.target.parentElement;
                  const fallback = document.createElement('div');
                  fallback.className = 'w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-lg';
                  fallback.textContent = job.companyName 
                    ? job.companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    : 'JD';
                  parent.appendChild(fallback);
                }}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {job.company.companyName 
                ? job.company.companyName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                : 'JD'}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
            {job.jobTitle || "Untitled Position"}
          </h2>
          <p className="text-cyan-600 font-medium text-sm mt-1 hover:text-cyan-700 transition-colors"
          onClick={()=>handleClickCompany(job.company)}>
            {job.company.companyName || "Unknown Company"}
          </p>

          <div className="flex items-center gap-2 text-gray-700 font-medium mt-2">
            <span className="text-sm">
              {job.salaryMin || job.salaryMax 
                ? `₹${(job.salaryMin || 0).toLocaleString()} - ₹${(job.salaryMax || 0).toLocaleString()} ${job.salaryType === 'monthly' ? '/month' : '/year'}`
                : "Salary not specified"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <span className="text-sm">
              {job.workMode === 'remote' ? 'Remote' : 
               job.workMode === 'hybrid' ? 'Hybrid' : 
               [job.city, job.state].filter(Boolean).join(', ') || 'Location not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/job/${job._id}`);
          }}
        >
          APPLY
        </button>

        <button
          className={`text-white px-4 py-2 rounded-md text-sm font-medium ${
            job.employmentType === 'full-time' ? 'bg-blue-600' :
            job.employmentType === 'part-time' ? 'bg-orange-500' :
            job.employmentType === 'contract' ? 'bg-purple-600' :
            job.employmentType === 'internship' ? 'bg-green-600' :
            'bg-gray-600'
          }`}
        >
          {job.employmentType ? job.employmentType.toUpperCase() : 'JOB'}
        </button>
      </div>

      {/* Key Details */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center text-sm text-gray-600">
          <span>
            {job.freshersAllowed ? "Freshers welcome" :
             job.minimumExperience || job.maximumExperience 
               ? `${job.minimumExperience || 0} - ${job.maximumExperience || 0} years`
               : "Experience not specified"}
          </span>
        </div>
        
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-medium mr-2">Skills:</span>
            <div className="flex flex-wrap gap-1">
              {job.requiredSkills.slice(0, 3).map((skill, i) => (
                <span key={i} className="text-cyan-600 text-xs">
                  {skill},
                </span>
              ))}
              {job.requiredSkills.length > 3 && (
                <span className="text-cyan-600 text-xs">
                  +{job.requiredSkills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
        <div className="flex items-center text-xs text-gray-500">
          {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Date not available"}
        </div>
        
        <div className="text-xs text-gray-500">
          {(job.openingsCount || 0)} opening{(job.openingsCount || 0) > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );





  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Similar Jobs</h2>
        <p className="text-gray-600 mb-6">Loading similar jobs...</p>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (error || similarJobs.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Similar Jobs</h2>
        <p className="text-gray-600 mb-6">Jobs matching your profile and preferences</p>
        <div className="text-center py-8">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">
            {error || "No similar jobs found at the moment."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-transparent rounded-xl  p-6  ">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Similar Jobs That You Might Be Interested In</h2>
          <p className="text-gray-600 mt-2">Jobs matching your profile and preferences</p>
        </div>
        
       
      </div>

      {/* Animated Carousel Container */}
      <div 
        ref={containerRef}
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Gradient overlays for smooth edges */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
        
        {/* Animation Track */}
        <div className="animation-track flex gap-6 py-2">
          {/* First set of cards */}
          {similarJobs.map((job, index) => (
            <CarouselJobCard key={`first-${job._id || index}`} job={job} index={index} />
          ))}
          {/* Duplicate for seamless looping */}
          {similarJobs.map((job, index) => (
            <CarouselJobCard key={`second-${job._id || index}`} job={job} index={index} />
          ))}
        </div>
      </div>

      


     
    </div>
  );
}
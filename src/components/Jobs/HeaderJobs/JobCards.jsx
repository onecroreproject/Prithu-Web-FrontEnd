import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobModal from "./JobModal";

// Enhanced jobs data with complete information and domains
const jobs = [
  {
    id: 1,
    company: "Oneiros Hospitality",
    location: "Surat, India",
    title: "Social Media Manager",
    domain: "social-media", // Added domain
    desc: "We are looking for Fulltime Social Media Manager Candidate for our Sports Club at Surat",
    time: "22 minutes ago",
    avatar: "O",
    type: "Full-time",
    experience: "2+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: true,
    description: "We are looking for a talented Social Media Manager to join our team at Oneiros Hospitality. The ideal candidate will be responsible for developing and implementing our social media strategy to increase our online presence and improve our marketing and sales efforts.",
    requirements: [
      "2+ years of professional experience in social media management",
      "Experience with social media platforms including Instagram, Facebook, Twitter, and LinkedIn",
      "Strong writing and communication skills",
      "Ability to create engaging content and grow online communities",
      "Experience with social media analytics and reporting",
      "Knowledge of current social media trends and best practices"
    ],
    benefits: "You'll be part of a dynamic team in the hospitality industry with opportunities for growth and creativity. We offer competitive compensation, flexible work arrangements, and the chance to work with exciting brands in the sports and hospitality space."
  },
  {
    id: 2,
    company: "UX/UI Designer",
    location: "India",
    title: "UX/UI Designer",
    domain: "ui-ux-design", // Added domain
    desc: "We are looking for UX / UI Designer",
    time: "43 minutes ago",
    avatar: "U",
    type: "Full-time",
    experience: "3+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: false,
    description: "Join our innovative team to create amazing user experiences for digital products. You'll work on exciting projects from concept to completion.",
    requirements: [
      "3+ years of professional experience in UX/UI design",
      "Strong portfolio showcasing design process and thinking",
      "Proficiency in Figma, Sketch, and Adobe Creative Suite",
      "Experience with user research and testing methodologies",
      "Understanding of front-end development principles",
      "Excellent visual design skills with sensitivity to user-system interaction"
    ],
    benefits: "Work with cutting-edge technologies and a talented team in a creative environment. We offer remote work options, competitive salary, and opportunities for professional development."
  },
  {
    id: 3,
    company: "Kanakavalli",
    location: "Chennai, India",
    title: "Graphic Designer- Print & Packaging",
    domain: "graphic-design", // Added domain
    desc: "Design dielines for packaging projects. High tech skill, packaging layout",
    time: "7 hours ago",
    avatar: "K",
    type: "Full-time",
    experience: "2+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: true,
    description: "Kanakavalli is seeking a skilled Graphic Designer specializing in print and packaging design. You'll work on creating stunning packaging designs for our luxury products.",
    requirements: [
      "2+ years of experience in print and packaging design",
      "Proficiency in Adobe Creative Suite (Illustrator, Photoshop, InDesign)",
      "Experience with dieline creation and packaging structural design",
      "Strong understanding of print production processes",
      "Attention to detail and typography skills",
      "Portfolio demonstrating packaging design work"
    ],
    benefits: "Join a prestigious brand in the luxury goods industry. We offer competitive compensation, beautiful workspace, and opportunities to work on high-profile projects."
  },
  {
    id: 4,
    company: "Rootquotient",
    location: "Chennai, India",
    title: "Brand Visual Designer",
    domain: "graphic-design", // Added domain
    desc: "We are looking for an onsite Brand Designer (India) with strong visual and creative skills",
    time: "a day ago",
    avatar: (
      <svg width="32" height="32" viewBox="0 0 32 32">
        <path fill="#338EFF" d="M23.19 19.19L14.12 25.15C12.82 26.04 11.17 25.2 11.17 23.59V12.87c0-1.6 1.64-2.45 2.94-1.56l9.07 5.97c1.44.95 1.45 3.01 0 3.96z"/>
      </svg>
    ),
    type: "Full-time",
    experience: "3+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: true,
    description: "Rootquotient is looking for a Brand Visual Designer to create compelling visual identities and brand systems for our clients across various industries.",
    requirements: [
      "3+ years of experience in brand design and visual identity",
      "Strong portfolio showcasing brand systems and visual design",
      "Expertise in Adobe Creative Suite and Figma",
      "Understanding of brand strategy and positioning",
      "Excellent communication and presentation skills",
      "Ability to work on multiple projects simultaneously"
    ],
    benefits: "Be part of an innovative digital transformation company. We offer a collaborative environment, learning opportunities, and exposure to diverse client projects."
  },
  {
    id: 5,
    company: "DAD Concepts",
    location: "Kozhikode, India",
    title: "Graphic Designer",
    domain: "graphic-design", // Added domain
    desc: "This is a full-time, on-site role for a Creative Designer located in Kozhikode.",
    time: "a day ago",
    avatar: "D",
    type: "Full-time",
    experience: "1+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: true,
    description: "DAD Concepts is looking for a creative Graphic Designer to join our team. You'll work on various design projects including branding, marketing materials, and digital content.",
    requirements: [
      "1+ years of professional graphic design experience",
      "Proficiency in Adobe Creative Suite",
      "Strong understanding of design principles and typography",
      "Ability to work on multiple projects with tight deadlines",
      "Creative thinking and problem-solving skills",
      "Good communication and teamwork abilities"
    ],
    benefits: "Join a growing creative agency with diverse projects. We offer mentorship, creative freedom, and opportunities for skill development."
  },
  {
    id: 6,
    company: "Orange and Teal",
    location: "Kochi, India",
    title: "Graphic Designer",
    domain: "graphic-design", // Added domain
    desc: "We are looking for a talented graphic designer to join our creative team.",
    time: "2 days ago",
    avatar: (
      <svg width="32" height="32"><circle fill="#181F20" cx="16" cy="16" r="16" /><ellipse fill="#00EEF1" cx="16" cy="26" rx="11" ry="2"/></svg>
    ),
    type: "Full-time",
    experience: "2+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: true,
    description: "Orange and Teal is seeking a Graphic Designer to create visually stunning designs for our clients in various industries including fashion, lifestyle, and technology.",
    requirements: [
      "2+ years of professional graphic design experience",
      "Strong portfolio demonstrating design skills",
      "Proficiency in Adobe Creative Suite",
      "Understanding of current design trends",
      "Ability to take direction and work independently",
      "Time management and organizational skills"
    ],
    benefits: "Work with a passionate creative team on exciting projects. We offer competitive salary, creative autonomy, and a supportive work environment."
  },
  {
    id: 7,
    company: "Orange and Teal",
    location: "Bangalore, India",
    title: "Graphic Designer",
    domain: "graphic-design", // Added domain
    desc: "We are looking for a talented graphic designer to join our creative team.",
    time: "2 days ago",
    avatar: (
      <svg width="32" height="32"><circle fill="#181F20" cx="16" cy="16" r="16" /><ellipse fill="#00EEF1" cx="16" cy="26" rx="11" ry="2"/></svg>
    ),
    type: "Full-time",
    experience: "2+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: true,
    description: "Join our Bangalore studio as a Graphic Designer and work on diverse projects for international and domestic clients across various sectors.",
    requirements: [
      "2+ years of professional graphic design experience",
      "Strong portfolio showcasing diverse design work",
      "Expertise in Adobe Creative Suite",
      "Excellent communication and client presentation skills",
      "Ability to work in a fast-paced environment",
      "Knowledge of print and digital design requirements"
    ],
    benefits: "Be part of our expanding Bangalore studio with international client exposure. We offer growth opportunities, competitive benefits, and a creative workspace."
  },
  {
    id: 8,
    company: "LWKY STUDIOS",
    location: "New Delhi, India",
    title: "PRODUCT DESIGNER",
    domain: "product-design", // Added domain
    desc: "Need a lifestyle Product Designer",
    time: "2 days ago",
    avatar: (
      <svg width="32" height="32"><text x="4" y="20" fontWeight="bold" fontSize="22" fill="#db136f">lw</text></svg>
    ),
    type: "Full-time",
    experience: "4+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: true,
    description: "LWKY STUDIOS is looking for a Product Designer with experience in lifestyle products to join our design team and work on innovative product concepts.",
    requirements: [
      "4+ years of product design experience",
      "Portfolio showcasing lifestyle product designs",
      "Proficiency in 3D modeling software (Rhino, SolidWorks, etc.)",
      "Understanding of manufacturing processes and materials",
      "Strong sketching and visualization skills",
      "Experience with user-centered design approach"
    ],
    benefits: "Join a prestigious design studio working on award-winning products. We offer creative challenges, professional growth, and competitive compensation."
  },
  {
    id: 9,
    company: "Clickory Stories Com...",
    location: "Nagpur, India",
    title: "Video Editor (Motion Graphics)",
    domain: "video-editing", // Added domain
    desc: "Motion Graphics & Video Editor",
    time: "3 days ago",
    avatar: (
      <svg width="32" height="32"><rect width="32" height="32" rx="16" fill="#181716"/><text x="7" y="20" fontWeight="bold" fontSize="20" fill="#fff">CS</text></svg>
    ),
    type: "Full-time",
    experience: "2+ years",
    postedDate: "November 13th, 2025",
    onsiteRequired: false,
    description: "Clickory Stories is seeking a Video Editor with motion graphics expertise to create engaging video content for our digital platforms and client projects.",
    requirements: [
      "2+ years of video editing and motion graphics experience",
      "Proficiency in Adobe Premiere Pro, After Effects, and other editing software",
      "Strong portfolio demonstrating video editing and motion graphics skills",
      "Understanding of storytelling and narrative structure",
      "Knowledge of current video trends and social media platforms",
      "Ability to work with tight deadlines"
    ],
    benefits: "Work in a creative environment with flexible hours. We offer remote work options, diverse projects, and opportunities for skill enhancement."
  }
];

export default function JobCards({ filterDomain = null }) {
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const navigate = useNavigate();

   // Filter jobs by domain if provided
  const filteredJobs = filterDomain 
    ? jobs.filter(job => job.domain === filterDomain)
    : jobs;

  const handleJobClick = (job, index) => {
    // Navigate to the domain-specific route
    navigate(`/jobs/${job.domain}`);
    
    // Also open the modal (if you still want the modal functionality)
    setSelectedJob(job);
    setCurrentJobIndex(index);
  };

  const handleClose = () => {
    setSelectedJob(null);
    // Optional: Navigate back to main jobs page when modal closes
    // navigate('/jobs');
  };

  const handleNext = () => {
    if (currentJobIndex < jobs.length - 1) {
      const nextJob = jobs[currentJobIndex + 1];
      setCurrentJobIndex(prev => prev + 1);
      setSelectedJob(nextJob);
      // Update URL when navigating to next job
      navigate(`/jobs/${nextJob.domain}`);
    }
  };

  const handlePrevious = () => {
    if (currentJobIndex > 0) {
      const prevJob = jobs[currentJobIndex - 1];
      setCurrentJobIndex(prev => prev - 1);
      setSelectedJob(prevJob);
      // Update URL when navigating to previous job
      navigate(`/jobs/${prevJob.domain}`);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
         {filteredJobs.map((job, idx) => (
          <div
            key={job.id}
            onClick={() => handleJobClick(job, idx)}
            className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-gray-300 hover:transform hover:-translate-y-1"
          >
            <div className="flex items-center mb-2 sm:mb-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-base sm:text-lg flex justify-center items-center font-bold mr-2 sm:mr-3 overflow-hidden shadow-sm flex-shrink-0">
                {typeof job.avatar === 'string' ? job.avatar : job.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{job.company}</div>
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">{job.location}</span>
                </div>
              </div>
            </div>
            
            <div className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-gray-900 leading-tight line-clamp-2">{job.title}</div>
            <div className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 leading-relaxed">{job.desc}</div>
            
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400 flex items-center">
                <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="truncate">{job.time}</span>
              </div>
              <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                {job.type}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Job Modal */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={handleClose}
          onNext={handleNext}
          onPrevious={handlePrevious}
          currentIndex={currentJobIndex}
           totalJobs={filteredJobs.length}
        />
      )}
    </>
  );
}
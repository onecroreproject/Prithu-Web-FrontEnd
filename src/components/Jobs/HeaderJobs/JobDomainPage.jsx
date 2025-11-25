// components/Jobs/HeaderJobs/JobDomainPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import JobCards from './JobCards';

const JobDomainPage = () => {
  const { domain } = useParams();
  const navigate = useNavigate();

  // Convert domain to readable title
  const getDomainTitle = (domain) => {
    const titles = {
      'social-media': 'Social Media',
      'ui-ux-design': 'UI/UX Design', 
      'graphic-design': 'Graphic Design',
      'product-design': 'Product Design',
      'video-editing': 'Video Editing'
    };
    return titles[domain] || domain.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <button 
          onClick={() => navigate('/jobs')}
          className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to All Jobs
        </button>
        
        {/* Domain Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getDomainTitle(domain)} Jobs
          </h1>
          <p className="text-gray-600">
            Discover the latest {getDomainTitle(domain).toLowerCase()} job opportunities
          </p>
        </div>
        
        {/* Filtered Job Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Available Positions
          </h2>
          <JobCards filterDomain={domain} />
        </div>
      </div>
    </div>
  );
};

export default JobDomainPage;
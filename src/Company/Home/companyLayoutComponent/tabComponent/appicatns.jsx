import React, { useState, useEffect, useContext } from 'react';
import {
  FiCalendar,
  FiMail,
  FiPhone,
  FiDownload,
  FiEye,
  FiUser,
  FiBriefcase,
  FiChevronDown,
  FiCheck,
  FiXCircle,
  FiLoader,
  FiCheckCircle,
  FiStar,
  FiFileText
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import ApplicantModal from './createTabComponent/applicatModel';
import api from '../../../../api/companyApi';
import { toast } from 'react-hot-toast';

const Applicants = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPosition, setSelectedPosition] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionDropdown, setActionDropdown] = useState(null);
 
  const statusConfig = {
    applied: { color: 'bg-blue-50 text-blue-700', label: 'Applied', icon: FiFileText },
    reviewed: { color: 'bg-blue-100 text-blue-800', label: 'Reviewed', icon: FiEye },
    shortlisted: { color: 'bg-emerald-50 text-emerald-700', label: 'Shortlisted', icon: FiStar },
    rejected: { color: 'bg-red-50 text-red-700', label: 'Rejected', icon: FiXCircle },
    accepted: { color: 'bg-green-50 text-green-700', label: 'Accepted', icon: FiCheckCircle }
  };

  // Fetch applicants from API
  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const response = await api.get('/job/get/company/applicatns');
      
      if (response.data.success && response.data.applicants) {
        // Transform API data to match component structure
        const transformedApplicants = response.data.applicants.map((item, index) => {
          const application = item.application || {};
          const profile = item.profileSettings || {};
          const curriculum = item.curriculum || {};
          const job = application.jobId || {};
          const user = profile || {};

          // Get applicant info from application
          const applicantInfo = application.applicantInfo || {};
          
          // Get skills from curriculum
          const skills = curriculum.skills?.slice(0, 5).map(skill => skill.name) || [];
          
          // Get education from curriculum
          const education = curriculum.education?.[0] 
            ? `${curriculum.education[0].level} in ${curriculum.education[0].fieldOfStudy || 'Not specified'}`
            : 'Not specified';

          // Calculate match score based on curriculum completeness
          let matchScore = 0;
          if (curriculum.skills?.length) matchScore += 40;
          if (curriculum.education?.length) matchScore += 30;
          if (curriculum.experience?.length) matchScore += 30;
          matchScore = Math.min(100, matchScore);

          // Get user name
          const userName = profile.name || 
                          (profile.firstName && profile.name ? `${profile.name} ${profile.lastName}` : '') || 
                          applicantInfo.name || 
                          'Unknown Applicant';

          // Get email
          const userEmail = applicantInfo.email || user.email || 'No email provided';

          return {
            id: application._id || `app-${index}`,
            name: userName,
            email: userEmail,
            phone: user.phoneNumber || user.phone || applicantInfo.phone || 'Not provided',
            position: job.jobTitle || 'Position not specified',
            appliedDate: new Date(application.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            }),
            status: application.status || 'applied',
            resume: application.resume || '',
            match: `${matchScore}%`,
            location: `${profile.city || ''}${profile.city && profile.country ? ', ' : ''}${profile.country || ''}` || 'Location not specified',
            experience: curriculum.experience?.length 
              ? `${curriculum.experience.length} year${curriculum.experience.length > 1 ? 's' : ''} experience`
              : curriculum.experience || 'Experience not specified',
            skills: skills.length > 0 ? skills : ['Skills not specified'],
            education: education,
            portfolio: application.portfolioLink || profile.socialLinks?.portfolio || '',
            linkedin: application.linkedinProfile || profile.socialLinks?.linkedin || '',
            github: application.githubLink || profile.socialLinks?.github || '',
            notes: application.coverLetter || curriculum.professionalSummary || 'No notes available',
            availability: 'Immediate',
            salary: job.salaryMin && job.salaryMax 
              ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
              : 'Salary not disclosed',
            rawData: item,
            applicationData: application,
            profileData: profile,
            curriculumData: curriculum,
            jobData: job
          };
        });

        setApplicants(transformedApplicants);
      } else {
        console.log('No applicants found or invalid response:', response.data);
        setApplicants([]);
      }
    } catch (error) {
      console.error('Failed to fetch applicants:', error);
      toast.error('Failed to load applicants');
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  // Close action dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionDropdown && !event.target.closest('.action-dropdown-container')) {
        setActionDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actionDropdown]);

  // Get all unique positions from applicants
  const allPositions = ['all', ...new Set(applicants.map(applicant => applicant.position))];

  const viewApplicantDetails = (applicant) => {
    setSelectedApplicant(applicant);
    setShowModal(true);
    // Mark as reviewed when viewing details
    if (applicant.status === 'applied') {
      updateApplicantStatus(applicant.id, 'reviewed', false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => setSelectedApplicant(null), 300);
  };

  const downloadResume = (resumeUrl, applicantId) => {
    if (resumeUrl) {
      window.open(resumeUrl, '_blank');
      // Mark as reviewed when downloading resume
      const applicant = applicants.find(app => app.id === applicantId);
      if (applicant && applicant.status === 'applied') {
        updateApplicantStatus(applicantId, 'reviewed', false);
      }
    } else {
      toast.error('No resume available');
    }
  };

  const updateApplicantStatus = async (applicantId, newStatus, showToast = true) => {
    try {
      // Use the correct endpoint for updating status
      const response = await api.put('/job/update/application/status', 
        { 
          applicationId: applicantId,
          status: newStatus 
        }
      );

      if (response.data.success) {
        // Update local state
        setApplicants(prev => prev.map(applicant =>
          applicant.id === applicantId
            ? { ...applicant, status: newStatus }
            : applicant
        ));
        
        // Update selected applicant if it's the same one
        if (selectedApplicant && selectedApplicant.id === applicantId) {
          setSelectedApplicant(prev => ({ ...prev, status: newStatus }));
        }
        
        if (showToast) {
          toast.success(`Status updated to ${statusConfig[newStatus]?.label || newStatus}!`);
        }
        
        // Close action dropdown
        setActionDropdown(null);
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update applicant status');
    }
  };

  const acceptApplicant = (applicantId) => {
    if (window.confirm('Are you sure you want to accept this applicant?')) {
      updateApplicantStatus(applicantId, 'accepted');
    }
  };

  const rejectApplicant = (applicantId) => {
    if (window.confirm('Are you sure you want to reject this applicant?')) {
      updateApplicantStatus(applicantId, 'rejected');
    }
  };

  const shortlistApplicant = (applicantId) => {
    updateApplicantStatus(applicantId, 'shortlisted');
  };

  const markAsReviewed = (applicantId) => {
    updateApplicantStatus(applicantId, 'reviewed');
  };

  const filteredApplicants = applicants.filter(applicant => {
    const matchesStatus = filterStatus === 'all' || applicant.status === filterStatus;
    const matchesPosition = selectedPosition === 'all' || applicant.position === selectedPosition;
    
    return matchesStatus && matchesPosition;
  });

  // Get status icon
  const getStatusIcon = (status) => {
    const StatusIcon = statusConfig[status]?.icon || FiFileText;
    return <StatusIcon className="w-3 h-3 mr-1" />;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
          <p className="text-gray-600 mt-2">Manage and review job applications</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <FiLoader className="mx-auto text-blue-600 text-4xl mb-3 animate-spin" />
            <p className="text-gray-600">Loading applicants...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Applicants</h2>
        <p className="text-gray-600 mt-2">Manage and review job applications</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
            Total: {applicants.length}
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            Active: {applicants.filter(a => ['applied', 'reviewed', 'shortlisted'].includes(a.status)).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Position Dropdown Filter */}
          <div className="flex-1 relative">
            <div className="relative">
              <button
                onClick={() => setShowPositionDropdown(!showPositionDropdown)}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white"
              >
                <div className="flex items-center gap-3">
                  <FiBriefcase className="text-gray-400" />
                  <span className="text-gray-700">
                    {selectedPosition === 'all' ? 'All Positions' : selectedPosition}
                  </span>
                </div>
                <FiChevronDown className={`text-gray-400 transition-transform ${showPositionDropdown ? 'transform rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              <AnimatePresence>
                {showPositionDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  >
                    {allPositions.map((position) => (
                      <button
                        key={position}
                        onClick={() => {
                          setSelectedPosition(position);
                          setShowPositionDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
                          selectedPosition === position ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        } ${position === 'all' ? 'border-b border-gray-100' : ''}`}
                      >
                        {position === 'all' ? 'All Positions' : position}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
        
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2 m-2">
            {['all', 'applied', 'reviewed', 'shortlisted', 'rejected', 'accepted'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-xl border transition-all capitalize flex items-center gap-2 ${
                  filterStatus === status
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {status !== 'all' && getStatusIcon(status)}
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Applicant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Position</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 hidden lg:table-cell">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Match</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredApplicants.map(applicant => (
                <tr key={applicant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FiUser className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{applicant.name}</div>
                        <div className="text-sm text-gray-500">
                          Applied: {applicant.appliedDate}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{applicant.position}</div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <FiMail className="w-4 h-4 mr-2" />
                        <span className="truncate max-w-[200px]">{applicant.email}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FiPhone className="w-4 h-4 mr-2" />
                        {applicant.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[applicant.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {getStatusIcon(applicant.status)}
                      {statusConfig[applicant.status]?.label || applicant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: applicant.match }}
                        />
                      </div>
                      <span className="font-medium text-gray-900 min-w-[40px]">{applicant.match}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 action-dropdown-container">
                      {/* View Details Button - Auto marks as reviewed when clicked */}
                      <button
                        onClick={() => viewApplicantDetails(applicant)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details (Auto marks as reviewed)"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>

                      {/* Applied Status - Manual Mark as Reviewed button */}
                      {applicant.status === 'applied' && (
                        <button
                          onClick={() => markAsReviewed(applicant.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Mark as Reviewed"
                        >
                          <FiCheck className="w-4 h-4" />
                        </button>
                      )}

                      {/* Reviewed Status - Action Dropdown with Shortlist and Reject */}
                      {applicant.status === 'reviewed' && (
                        <div className="relative">
                          <button
                            onClick={() => setActionDropdown(actionDropdown === applicant.id ? null : applicant.id)}
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-1"
                            title="Actions"
                          >
                            <FiChevronDown className="w-4 h-4" />
                          </button>
                          
                          {actionDropdown === applicant.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
                            >
                              <div className="py-1">
                                <button
                                  onClick={() => shortlistApplicant(applicant.id)}
                                  className="w-full text-left px-4 py-2 text-emerald-600 hover:bg-emerald-50 flex items-center gap-2"
                                >
                                  <FiStar className="w-4 h-4" />
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => rejectApplicant(applicant.id)}
                                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <FiXCircle className="w-4 h-4" />
                                  Reject
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Shortlisted Status - Accept and Reject buttons */}
                      {applicant.status === 'shortlisted' && (
                        <>
                          <button
                            onClick={() => acceptApplicant(applicant.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Accept Applicant"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => rejectApplicant(applicant.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject Applicant"
                          >
                            <FiXCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Accepted Status */}
                      {applicant.status === 'accepted' && (
                        <span className="text-xs text-green-600 font-medium px-2">Accepted</span>
                      )}

                      {/* Rejected Status */}
                      {applicant.status === 'rejected' && (
                        <span className="text-xs text-red-600 font-medium px-2">Rejected</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results */}
        {filteredApplicants.length === 0 && (
          <div className="text-center py-12">
            <FiUser className="mx-auto text-gray-400 text-4xl mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {applicants.length === 0 ? 'No applicants yet' : 'No applicants found'}
            </h3>
            <p className="text-gray-500">
              {applicants.length === 0 
                ? 'Applicants will appear here when they apply to your jobs'
                : 'Try adjusting your position or filter criteria'
              }
            </p>
          </div>
        )}
      </div>

      {/* Applicant Modal */}
      {selectedApplicant && (
        <ApplicantModal
          showModal={showModal}
          selectedApplicant={selectedApplicant}
          statusConfig={statusConfig}
          onClose={closeModal}
          onAccept={acceptApplicant}
          onReject={rejectApplicant}
          onShortlist={shortlistApplicant}
          onMarkAsReviewed={markAsReviewed}
          rawData={selectedApplicant.rawData}
        />
      )}
    </div>
  );
};

export default Applicants;
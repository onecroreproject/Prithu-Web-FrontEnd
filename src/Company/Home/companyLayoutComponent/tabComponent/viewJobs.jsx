import React, { useState, useEffect } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2,
  FiEye,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiDollarSign,
  FiBriefcase,
  FiCheckCircle,
  FiHeart,
  FiShare2,
  FiBookmark
} from 'react-icons/fi';
import { 
  MdWork, 
  MdCheckCircle, 
  MdPendingActions, 
  MdHourglassEmpty, 
  MdCancel 
} from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import axios from '../../../../api/companyApi';
import Swal from 'sweetalert2';

const ViewJobs = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch jobs data
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get('/job/get/jobs/by/company/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setJobs(response.data.jobs || []);
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit Job
  const handleEditJob = (job) => {
    // Navigate to edit page with job ID
    navigate(`/jobs/edit/${job._id}`);
  };

  // Handle View Job Details
  const handleViewJob = (job) => {
    // Navigate to view job details page
    navigate(`/company/jobs/view/${job._id}`, { state: { job } });
  };

  // Handle Delete Job
  const handleDeleteJob = async (jobId, jobTitle) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Delete Job Posting?',
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-2">Are you sure you want to delete:</p>
          <p class="font-semibold text-lg text-gray-900 mb-3">"${jobTitle}"</p>
          <p class="text-red-600 text-sm">⚠️ This action cannot be undone. All associated data will be permanently deleted.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete Job',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showCloseButton: true,
      customClass: {
        confirmButton: 'px-4 py-2 rounded-lg',
        cancelButton: 'px-4 py-2 rounded-lg'
      }
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(jobId);
        const token = localStorage.getItem('token');
        
        // Make delete request
        const response = await axios.delete(`/job/delete/jobs/${jobId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          // Remove job from local state
          setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));

          // Show success message
          Swal.fire({
            title: 'Deleted!',
            text: 'Job has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
          });
        } else {
          throw new Error(response.data.message || 'Failed to delete job');
        }
      } catch (err) {
        console.error('Error deleting job:', err);
        Swal.fire({
          title: 'Error!',
          text: err.response?.data?.error || err.message || 'Failed to delete job',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Calculate status counts from actual jobs
  const calculateStatusCounts = () => {
    const counts = {
      all: jobs.length,
      submit: jobs.filter(job => job.status === 'submit').length,
      active: jobs.filter(job => job.status === 'active').length,
      draft: jobs.filter(job => job.status === 'draft').length,
      expired: jobs.filter(job => job.status === 'expired').length,
      closed: jobs.filter(job => job.status === 'closed').length,
      inactive: jobs.filter(job => job.status === 'inactive').length,
    };
    return counts;
  };

  const statusCounts = calculateStatusCounts();

  // Filter jobs based on search and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobRole?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.jobCategory?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    active: { 
      color: 'bg-emerald-100 text-emerald-700 border border-emerald-200', 
      icon: MdCheckCircle,
      label: 'Active'
    },
    draft: { 
      color: 'bg-amber-100 text-amber-700 border border-amber-200', 
      icon: MdPendingActions,
      label: 'Draft'
    },
    submit: { 
      color: 'bg-blue-100 text-blue-700 border border-blue-200', 
      icon: MdPendingActions,
      label: 'Submitted'
    },
    expired: { 
      color: 'bg-red-100 text-red-700 border border-red-200', 
      icon: MdCancel,
      label: 'Expired'
    },
    closed: { 
      color: 'bg-gray-100 text-gray-700 border border-gray-200', 
      icon: MdCheckCircle,
      label: 'Closed'
    },
    inactive: { 
      color: 'bg-gray-100 text-gray-500 border border-gray-200', 
      icon: MdHourglassEmpty,
      label: 'Inactive'
    }
  };

  const getStatusIcon = (status) => {
    const Icon = statusConfig[status]?.icon || MdCheckCircle;
    return <Icon className="text-lg" />;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format salary
  const formatSalary = (job) => {
    if (!job.salaryMin && !job.salaryMax) return 'Not specified';
    
    const currency = job.salaryCurrency || 'INR';
    const type = job.salaryType === 'yearly' ? '/yr' : job.salaryType === 'monthly' ? '/mo' : '/hr';
    
    if (job.salaryMin && job.salaryMax) {
      return `${currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}${type}`;
    } else if (job.salaryMin) {
      return `${currency} ${job.salaryMin.toLocaleString()}${type} (Min)`;
    } else if (job.salaryMax) {
      return `${currency} ${job.salaryMax.toLocaleString()}${type} (Max)`;
    }
  };

  // Get location string
  const getLocation = (job) => {
    if (job.workMode === 'remote') return 'Remote';
    if (job.city && job.state) return `${job.city}, ${job.state}`;
    if (job.city) return job.city;
    if (job.state) return job.state;
    if (job.country) return job.country;
    return 'Location not specified';
  };

  // Get engagement counts from your API response structure
  const getViewCount = (job) => {
    // Check multiple possible locations for view count
    return job.viewCount || job.stats?.views || 0;
  };

  const getApplyCount = (job) => {
    // Check multiple possible locations for apply count
    return job.applyCount || job.stats?.applications || job.stats?.applied || 0;
  };

  const getLikeCount = (job) => {
    return job.likeCount || job.stats?.likes || 0;
  };

  const getSaveCount = (job) => {
    return job.saveCount || job.stats?.saved || 0;
  };

  const getShareCount = (job) => {
    return job.shareCount || job.stats?.shares || 0;
  };

  // Calculate total stats from all jobs
  const totalStats = {
    views: jobs.reduce((sum, job) => sum + getViewCount(job), 0),
    applications: jobs.reduce((sum, job) => sum + getApplyCount(job), 0),
    likes: jobs.reduce((sum, job) => sum + getLikeCount(job), 0),
    saves: jobs.reduce((sum, job) => sum + getSaveCount(job), 0),
    shares: jobs.reduce((sum, job) => sum + getShareCount(job), 0),
    activeJobs: jobs.filter(job => job.status === 'active').length,
    paidPromotions: jobs.filter(job => job.isPaid).length,
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-red-500 mb-4">
          <MdCancel className="text-4xl mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading jobs</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchJobs}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm">
              <MdWork className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Job Postings</h2>
              <p className="text-gray-600 mt-1">Manage and track all your job listings</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{jobs.length}</div>
            <div className="text-sm text-gray-500">Total Jobs</div>
          </div>
        </div>
        {/* Search Input */}
          <div className=" relative mt-3">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs by title, role, or category..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 mt-3 md:mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <FiEye className="text-lg" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">
                {totalStats.views.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Views</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <FiUsers className="text-lg" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">
                {totalStats.applications.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Applications</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }}></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <FiCheckCircle className="text-lg" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">
                {totalStats.activeJobs}
              </div>
              <div className="text-sm text-gray-500">Active Jobs</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(totalStats.activeJobs / jobs.length) * 100 || 0}%` }}></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <FiBriefcase className="text-lg" />
            </div>
            <div className="flex-1">
              <div className="text-2xl font-bold text-gray-900">
                {totalStats.paidPromotions}
              </div>
              <div className="text-sm text-gray-500">Paid Promotions</div>
            </div>
          </div>
          <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(totalStats.paidPromotions / jobs.length) * 100 || 0}%` }}></div>
          </div>
        </div>
      </div>



      </div>


      

     
        
        

          {/* Status Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 capitalize whitespace-nowrap min-w-max ${
                  filterStatus === status
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="text-sm flex-shrink-0" />
                {status === 'all' ? 'All Jobs' : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  filterStatus === status 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
  

     

      {/* Jobs Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Job Details
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category & Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredJobs.map((job) => (
              <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                {/* Job Details */}
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{job.jobTitle}</div>
                    <div className="text-sm text-gray-500 space-y-1">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-gray-400 flex-shrink-0" />
                        <span>{getLocation(job)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="text-gray-400 flex-shrink-0" />
                        <span>{formatSalary(job)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-gray-400 flex-shrink-0" />
                        <span>Posted: {formatDate(job.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category & Role */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    {job.jobCategory && (
                      <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm border border-blue-200">
                        <FiBriefcase className="text-xs" />
                        {job.jobCategory}
                      </div>
                    )}
                    {job.jobRole && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Role:</span> {job.jobRole}
                      </div>
                    )}
                    {job.employmentType && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Type:</span> {job.employmentType}
                      </div>
                    )}
                  </div>
                </td>

                {/* Engagement Stats */}
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FiEye className="text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getViewCount(job)}</div>
                          <div className="text-xs text-gray-500">Views</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-gray-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{getApplyCount(job)}</div>
                          <div className="text-xs text-gray-500">Applied</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {getSaveCount(job) > 0 && (
                        <div className="flex items-center gap-1">
                          <FiBookmark className="text-xs" />
                          {getSaveCount(job)}
                        </div>
                      )}
                      {getShareCount(job) > 0 && (
                        <div className="flex items-center gap-1">
                          <FiShare2 className="text-xs" />
                          {getShareCount(job)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    statusConfig[job.status]?.color || 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {getStatusIcon(job.status)}
                    {statusConfig[job.status]?.label || job.status}
                  </div>
                  {job.isPaid && (
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs border border-purple-200">
                      <FiCheckCircle className="text-xs" />
                      Promoted
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleViewJob(job)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 hover:border-blue-300"
                      title="View Details"
                    >
                      <FiEye />
                    </button>
                    <button 
                      onClick={() => handleEditJob(job)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-200 hover:border-emerald-300"
                      title="Edit"
                      disabled={job.status === 'closed' || job.status === 'expired'}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job._id, job.jobTitle)}
                      disabled={deletingId === job._id}
                      className={`p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 hover:border-red-300 ${
                        deletingId === job._id ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Delete"
                    >
                      {deletingId === job._id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <FiTrash2 />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* No Results */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-3">
            <MdWork className="text-4xl mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Pagination */}
      {filteredJobs.length > 0 && (
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-500">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              1
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              3
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewJobs;
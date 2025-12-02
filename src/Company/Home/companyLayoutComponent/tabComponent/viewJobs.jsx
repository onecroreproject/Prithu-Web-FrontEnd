import React, { useState } from 'react';
import { 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2,
  FiEye,
  FiUsers,
  FiCalendar,
  FiMapPin,
  FiDollarSign
} from 'react-icons/fi';
import { MdWork, MdCheckCircle, MdPendingActions } from 'react-icons/md';

const ViewJobs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const jobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      type: 'Full Time',
      location: 'Remote',
      salary: '$120,000 - $150,000',
      applicants: 45,
      status: 'active',
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      views: 120
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      department: 'Design',
      type: 'Full Time',
      location: 'San Francisco, CA',
      salary: '$90,000 - $110,000',
      applicants: 28,
      status: 'active',
      postedDate: '2024-01-10',
      deadline: '2024-02-10',
      views: 95
    },
    {
      id: 3,
      title: 'Marketing Manager',
      department: 'Marketing',
      type: 'Contract',
      location: 'New York, NY',
      salary: '$80,000 - $100,000',
      applicants: 32,
      status: 'draft',
      postedDate: '2024-01-05',
      deadline: '2024-02-05',
      views: 75
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      type: 'Full Time',
      location: 'Remote',
      salary: '$130,000 - $160,000',
      applicants: 22,
      status: 'closed',
      postedDate: '2023-12-20',
      deadline: '2024-01-20',
      views: 150
    },
    {
      id: 5,
      title: 'Sales Executive',
      department: 'Sales',
      type: 'Part Time',
      location: 'Chicago, IL',
      salary: '$60,000 + Commission',
      applicants: 18,
      status: 'active',
      postedDate: '2024-01-12',
      deadline: '2024-02-12',
      views: 65
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    active: { color: 'bg-emerald-100 text-emerald-700', icon: MdCheckCircle },
    draft: { color: 'bg-amber-100 text-amber-700', icon: MdPendingActions },
    closed: { color: 'bg-gray-100 text-gray-700', icon: MdCheckCircle }
  };

  const getStatusIcon = (status) => {
    const Icon = statusConfig[status]?.icon || MdCheckCircle;
    return <Icon className="text-lg" />;
  };

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
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search jobs by title or department..."
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['all', 'active', 'draft', 'closed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 capitalize ${
                  filterStatus === status
                    ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <FiFilter className="text-sm" />
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 md:mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">12</div>
          <div className="text-sm text-gray-500">Active Jobs</div>
          <div className="h-1.5 w-full bg-emerald-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-3/4"></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">145</div>
          <div className="text-sm text-gray-500">Total Applicants</div>
          <div className="h-1.5 w-full bg-blue-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full w-2/3"></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">28%</div>
          <div className="text-sm text-gray-500">Conversion Rate</div>
          <div className="h-1.5 w-full bg-purple-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full w-1/4"></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="text-2xl font-bold text-gray-900">3.2K</div>
          <div className="text-sm text-gray-500">Total Views</div>
          <div className="h-1.5 w-full bg-amber-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full w-4/5"></div>
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                Details
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
              <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <MdWork className="text-gray-400" />
                      {job.department}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMapPin className="text-gray-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiDollarSign className="text-gray-400" />
                      {job.salary}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiUsers className="text-gray-400" />
                      {job.applicants} applicants
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig[job.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                    {getStatusIcon(job.status)}
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                      <FiEye />
                    </button>
                    <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <FiTrash2 />
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

      {/* Mobile Cards View (Alternative for small screens) */}
      <div className="md:hidden space-y-4 mt-6">
        {filteredJobs.map((job) => (
          <div key={job.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.department}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[job.status]?.color || 'bg-gray-100 text-gray-700'}`}>
                {job.status}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-sm text-gray-600">
                <FiMapPin className="inline mr-1 text-gray-400" />
                {job.location}
              </div>
              <div className="text-sm text-gray-600">
                <FiDollarSign className="inline mr-1 text-gray-400" />
                {job.salary}
              </div>
              <div className="text-sm text-gray-600">
                <FiUsers className="inline mr-1 text-gray-400" />
                {job.applicants} applicants
              </div>
              <div className="text-sm text-gray-600">
                <FiCalendar className="inline mr-1 text-gray-400" />
                {job.deadline}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 py-2 text-blue-600 border border-blue-200 rounded-lg text-sm font-medium">
                View
              </button>
              <button className="flex-1 py-2 text-emerald-600 border border-emerald-200 rounded-lg text-sm font-medium">
                Edit
              </button>
              <button className="flex-1 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-sm text-gray-500">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            1
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            2
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            3
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewJobs;
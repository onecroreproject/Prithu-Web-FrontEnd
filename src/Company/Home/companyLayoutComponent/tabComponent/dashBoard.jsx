import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiBriefcase,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowUp,
  FiArrowDown,
  FiFilter,
  FiRefreshCw,
  FiFileText,
  FiPieChart
} from 'react-icons/fi';
import {
  MdWork,
  MdPeople,
  MdBusiness,
  MdAssessment,
  MdBarChart,
  MdPieChart,
  MdDateRange
} from 'react-icons/md';
import { motion } from 'framer-motion';
import axios from '../../../../api/companyApi';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area
} from 'recharts';

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [topJobsLoading, setTopJobsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statsError, setStatsError] = useState(null);
  const [topJobsError, setTopJobsError] = useState(null);

  // Stats data state
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    draftJobs: 0,
    expiredJobs: 0,
    totalApplicants: 0,
    shortlistedApplicants: 0
  });

  // Chart data state
  const [chartData, setChartData] = useState({
    applicationTrends: [],
    jobStatusData: [],
    monthlyApplications: []
  });

  // Top performing jobs state
  const [topJobs, setTopJobs] = useState([]);

  // Map action types to icons, colors, and display text
  const actionConfig = {
    // Job Actions
    'JOB_CREATED': {
      icon: MdWork,
      color: 'text-green-600 bg-green-50',
      displayText: 'New Job Created',
      status: 'completed'
    },
    'JOB_UPDATED': {
      icon: FiRefreshCw,
      color: 'text-blue-600 bg-blue-50',
      displayText: 'Job Updated',
      status: 'completed'
    },
    'JOB_DRAFT_SAVED': {
      icon: FiClock,
      color: 'text-amber-600 bg-amber-50',
      displayText: 'Job Draft Saved',
      status: 'pending'
    },
    'JOB_DELETED': {
      icon: FiAlertCircle,
      color: 'text-red-600 bg-red-50',
      displayText: 'Job Deleted',
      status: 'completed'
    },

    // Profile Actions
    'PROFILE_UPDATED': {
      icon: MdBusiness,
      color: 'text-purple-600 bg-purple-50',
      displayText: 'Profile Updated',
      status: 'completed'
    },
    'VISIBILITY_UPDATED': {
      icon: FiEye,
      color: 'text-indigo-600 bg-indigo-50',
      displayText: 'Visibility Updated',
      status: 'completed'
    },

    // Payment Actions
    'PAYMENT_INITIATED': {
      icon: FiDollarSign,
      color: 'text-amber-600 bg-amber-50',
      displayText: 'Payment Initiated',
      status: 'pending'
    },
    'PAYMENT_SUCCESS': {
      icon: FiCheckCircle,
      color: 'text-green-600 bg-green-50',
      displayText: 'Payment Successful',
      status: 'completed'
    },
    'PAYMENT_FAILED': {
      icon: FiAlertCircle,
      color: 'text-red-600 bg-red-50',
      displayText: 'Payment Failed',
      status: 'completed'
    },

    // Auth Actions
    'LOGIN': {
      icon: FiUsers,
      color: 'text-blue-600 bg-blue-50',
      displayText: 'Login Activity',
      status: 'completed'
    },
    'LOGOUT': {
      icon: FiUsers,
      color: 'text-gray-600 bg-gray-50',
      displayText: 'Logout Activity',
      status: 'completed'
    },

    // Application Status Update
    'application_status_update': {
      icon: FiCheckCircle,
      color: 'text-emerald-600 bg-emerald-50',
      displayText: 'Application Status Updated',
      status: 'completed'
    },

    // Default for OTHER
    'OTHER': {
      icon: MdBusiness,
      color: 'text-gray-600 bg-gray-50',
      displayText: 'Company Activity',
      status: 'completed'
    }
  };

  // Fetch company stats
  const fetchCompanyStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);

      const response = await axios.get('/job/get/company/stats');
      
      if (response.data.success) {
        const stats = response.data.stats;
        setDashboardStats({
          totalJobs: stats.totalPostedJobs || 0,
          activeJobs: stats.activeJobs || 0,
          draftJobs: stats.draftJobs || 0,
          expiredJobs: stats.expiredJobs || 0,
          totalApplicants: stats.totalApplicants || 0,
          shortlistedApplicants: stats.shortlistedApplicants || 0
        });

        // Generate chart data from stats and applicantsList
        generateChartData(stats, response.data.applicantsList);
      } else {
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError(error.response?.data?.message || error.message);
      
      // Generate fallback chart data
      generateFallbackChartData();
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch top performing jobs
  const fetchTopPerformingJobs = async () => {
    try {
      setTopJobsLoading(true);
      setTopJobsError(null);

      const response = await axios.get('/job/get/top/performing/job', {
        params: { limit: 5 }
      });

      if (response.data.success) {
        const jobs = response.data.topJobs.map((job, index) => {
          // Calculate conversion rate
          const conversion = job.totalViews > 0 
            ? ((job.applicantCount / job.totalViews) * 100).toFixed(1)
            : 0;

          // Determine trend (random for now, could be based on actual data)
          const trend = index % 3 === 0 ? 'down' : 'up';

          // Determine status based on job data (using mock for now)
          const statuses = ['active', 'draft', 'closed'];
          const status = statuses[index % statuses.length];

          return {
            id: job._id,
            title: job.jobTitle || 'Untitled Job',
            applicants: job.applicantCount || 0,
            views: job.totalViews || 0,
            conversion: parseFloat(conversion) || 0,
            status,
            trend,
            jobCategory: job.jobCategory || 'Uncategorized',
            createdAt: job.createdAt,
            stats: job.stats || {}
          };
        });

        setTopJobs(jobs);
      } else {
        throw new Error(response.data.message || 'Failed to fetch top jobs');
      }
    } catch (error) {
      console.error('Error fetching top jobs:', error);
      setTopJobsError(error.response?.data?.message || error.message);
      
      // Fallback to mock data
      setTopJobs(getFallbackTopJobs());
    } finally {
      setTopJobsLoading(false);
    }
  };

  // Fallback top jobs if API fails
  const getFallbackTopJobs = () => [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      applicants: 45,
      views: 320,
      conversion: 14.1,
      status: 'active',
      trend: 'up'
    },
    {
      id: 2,
      title: 'UX/UI Designer',
      applicants: 28,
      views: 195,
      conversion: 14.4,
      status: 'active',
      trend: 'up'
    },
    {
      id: 3,
      title: 'Data Scientist',
      applicants: 35,
      views: 280,
      conversion: 12.5,
      status: 'active',
      trend: 'down'
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      applicants: 22,
      views: 150,
      conversion: 14.7,
      status: 'closed',
      trend: 'up'
    },
    {
      id: 5,
      title: 'Marketing Manager',
      applicants: 32,
      views: 175,
      conversion: 18.3,
      status: 'draft',
      trend: 'up'
    }
  ];

  // Generate chart data from stats
  const generateChartData = (stats, applicantsList = []) => {
    // Get last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    // Initialize monthly data
    const monthlyData = months.map(month => ({
      name: month,
      applications: 0,
      shortlisted: 0
    }));

    // Process applicants list to count by month
    if (applicantsList && applicantsList.length > 0) {
      applicantsList.forEach(applicant => {
        const date = new Date(applicant.createdAt);
        const monthIndex = date.getMonth();
        
        if (monthIndex >= 0 && monthIndex < 6) {
          monthlyData[monthIndex].applications += 1;
          
          // Check if shortlisted (status is 'accepted' or 'shortlisted')
          if (applicant.status === 'accepted' || applicant.status === 'shortlisted') {
            monthlyData[monthIndex].shortlisted += 1;
          }
        }
      });
    }

    // Calculate monthly applications with trend
    const monthlyApplications = monthlyData.map((item, index) => {
      if (index === 0) {
        return { month: item.name, applications: item.applications, trend: "up" };
      }

      const prev = monthlyData[index - 1].applications;
      const trend = item.applications >= prev ? "up" : "down";

      return { month: item.name, applications: item.applications, trend };
    });

    // Job status distribution
    const jobStatusData = [
      { name: "Active", value: stats.activeJobs || 0, color: "#10B981" },
      { name: "Draft", value: stats.draftJobs || 0, color: "#F59E0B" },
      { name: "Expired", value: stats.expiredJobs || 0, color: "#6B7280" }
    ];

    // Update chart state
    setChartData({
      jobStatusData,
      applicationTrends: monthlyData,
      monthlyApplications
    });
  };

  // Generate fallback chart data
  const generateFallbackChartData = () => {
    const jobStatusData = [
      { name: 'Active', value: 28, color: '#10B981' },
      { name: 'Draft', value: 12, color: '#F59E0B' },
      { name: 'Expired', value: 5, color: '#6B7280' }
    ];

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const applicationTrends = [
      { name: 'Jan', applications: 65, shortlisted: 28 },
      { name: 'Feb', applications: 59, shortlisted: 48 },
      { name: 'Mar', applications: 80, shortlisted: 40 },
      { name: 'Apr', applications: 81, shortlisted: 19 },
      { name: 'May', applications: 56, shortlisted: 86 },
      { name: 'Jun', applications: 55, shortlisted: 27 }
    ];

    const monthlyApplications = [
      { month: 'Jan', applications: 65, trend: 'up' },
      { month: 'Feb', applications: 59, trend: 'down' },
      { month: 'Mar', applications: 80, trend: 'up' },
      { month: 'Apr', applications: 81, trend: 'up' },
      { month: 'May', applications: 56, trend: 'down' },
      { month: 'Jun', applications: 55, trend: 'down' }
    ];

    setChartData({
      jobStatusData,
      applicationTrends,
      monthlyApplications
    });
  };

  // Fetch recent activities
  const fetchRecentActivities = async () => {
    try {
      setActivityLoading(true);
      setError(null);

      const response = await axios.get('/job/company/activity/status', {
        params: { limit: 10 }
      });

      if (response.data.success) {
        const formattedActivities = response.data.activities.map(activity => {
          const config = actionConfig[activity.action] || actionConfig.OTHER;
          
          // Generate description from changes if available
          let description = activity.description;
          if (!description && activity.changes) {
            if (activity.changes.status) {
              description = `Status changed from "${activity.changes.status.old}" to "${activity.changes.status.new}"`;
            } else if (activity.changes.title) {
              description = `Title updated: "${activity.changes.title.old}" → "${activity.changes.title.new}"`;
            } else if (activity.action === 'JOB_CREATED') {
              description = 'New job posting created successfully';
            } else if (activity.action === 'PROFILE_UPDATED') {
              description = 'Company profile was updated';
            }
          }

          // Format time ago
          const timeAgo = formatTimeAgo(new Date(activity.createdAt));

          return {
            id: activity._id,
            action: activity.action,
            description: description || 'Activity performed',
            time: timeAgo,
            createdAt: activity.createdAt,
            icon: config.icon,
            color: config.color,
            title: config.displayText,
            status: config.status,
            meta: activity.meta,
            jobId: activity.jobId,
            changes: activity.changes
          };
        });

        setRecentActivities(formattedActivities);
      } else {
        throw new Error(response.data.message || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError(error.response?.data?.message || error.message);
      
      // Fallback to mock data if API fails
      setRecentActivities(getFallbackActivities());
    } finally {
      setActivityLoading(false);
      setLoading(false);
    }
  };

  // Fallback activities if API fails
  const getFallbackActivities = () => [
    {
      id: 1,
      action: 'JOB_CREATED',
      title: 'New Job Created',
      description: 'Senior Frontend Developer position published',
      time: '10 minutes ago',
      status: 'completed',
      icon: MdWork,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 2,
      action: 'application_status_update',
      title: 'Application Status Updated',
      description: 'Candidate shortlisted for UX Designer position',
      time: '2 hours ago',
      status: 'completed',
      icon: FiCheckCircle,
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      id: 3,
      action: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      description: 'Job promotion payment completed',
      time: '5 hours ago',
      status: 'completed',
      icon: FiDollarSign,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 4,
      action: 'PROFILE_UPDATED',
      title: 'Profile Updated',
      description: 'Company information updated',
      time: '1 day ago',
      status: 'completed',
      icon: MdBusiness,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 5,
      action: 'LOGIN',
      title: 'Login Activity',
      description: 'Successful login from new device',
      time: '2 days ago',
      status: 'completed',
      icon: FiUsers,
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  // Format time ago
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Load data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchCompanyStats(),
        fetchTopPerformingJobs(),
        fetchRecentActivities()
      ]);
    };
    loadAllData();
  }, []);

  const getTrendIcon = (trend) => {
    if (trend === 'up') {
      return <FiArrowUp className="text-emerald-500" />;
    }
    return <FiArrowDown className="text-red-500" />;
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  // Calculate percentage
  const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return ((value / total) * 100).toFixed(1);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-sm">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format date for job listings
  const formatJobDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  // Stats cards data
  const statsCards = [
    {
      id: 'totalJobs',
      title: 'Total Jobs',
      value: dashboardStats.totalJobs,
      icon: MdWork,
      color: 'bg-blue-50 text-blue-600',
      trendColor: 'text-emerald-600',
      description: 'All posted jobs'
    },
    {
      id: 'activeJobs',
      title: 'Active Jobs',
      value: dashboardStats.activeJobs,
      icon: FiBriefcase,
      color: 'bg-emerald-50 text-emerald-600',
      trendColor: 'text-emerald-600',
      description: 'Currently live jobs'
    },
    {
      id: 'totalApplicants',
      title: 'Total Applicants',
      value: formatNumber(dashboardStats.totalApplicants),
      icon: MdPeople,
      color: 'bg-indigo-50 text-indigo-600',
      trendColor: 'text-emerald-600',
      description: 'All applications received'
    },
    {
      id: 'shortlisted',
      title: 'Shortlisted',
      value: formatNumber(dashboardStats.shortlistedApplicants),
      icon: FiCheckCircle,
      color: 'bg-purple-50 text-purple-600',
      trendColor: 'text-emerald-600',
      description: 'Candidates shortlisted'
    },
    {
      id: 'draftJobs',
      title: 'Draft Jobs',
      value: dashboardStats.draftJobs,
      icon: FiFileText,
      color: 'bg-amber-50 text-amber-600',
      trendColor: 'text-emerald-600',
      description: 'Jobs in draft mode'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <MdAssessment className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your jobs</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              
              <button
                onClick={() => {
                  fetchCompanyStats();
                  fetchTopPerformingJobs();
                  fetchRecentActivities();
                }}
                disabled={statsLoading || topJobsLoading || activityLoading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw className={`text-sm ${statsLoading || topJobsLoading || activityLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-red-500" />
              <div className="flex-1">
                <p className="text-sm text-red-700">{error}</p>
                <p className="text-xs text-red-600 mt-1">Showing fallback data</p>
              </div>
            </div>
          </div>
        )}

        {statsError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-yellow-500" />
              <div className="flex-1">
                <p className="text-sm text-yellow-700">Stats: {statsError}</p>
                <p className="text-xs text-yellow-600 mt-1">Showing fallback data</p>
              </div>
            </div>
          </div>
        )}

        {topJobsError && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-3">
              <FiAlertCircle className="text-purple-500" />
              <div className="flex-1">
                <p className="text-sm text-purple-700">Top Jobs: {topJobsError}</p>
                <p className="text-xs text-purple-600 mt-1">Showing fallback data</p>
              </div>
            </div>
          </div>
        )}

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6 md:mb-8">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="text-lg" />
                  </div>
                  <span className={`text-xs font-medium ${card.trendColor}`}>
                    {card.trend}
                  </span>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                  <div className="text-sm text-gray-500">{card.title}</div>
                  <div className="text-xs text-gray-400 mt-1">{card.description}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Three Section Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Job Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Job Status Distribution</h2>
              <MdPieChart className="text-2xl text-blue-600" />
            </div>
            
            {statsLoading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData.jobStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.jobStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {chartData.jobStatusData.map((item) => (
                    <div key={item.name} className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      </div>
                      <div className="text-xs text-gray-500">{item.name}</div>
                      <div className="text-xs text-gray-400">
                        {calculatePercentage(item.value, dashboardStats.totalJobs)}%
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>


          

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-100">
                <FiTrendingUp className="text-xl text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Performance Snapshot</h2>
                <p className="text-sm text-gray-600">Key metrics at a glance</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <FiUsers className="text-blue-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Avg. per Job</div>
                    <div className="text-xs text-gray-500">Applications per job</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {dashboardStats.totalJobs > 0 
                    ? Math.round(dashboardStats.totalApplicants / dashboardStats.totalJobs)
                    : 0}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <FiCheckCircle className="text-emerald-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Shortlist Rate</div>
                    <div className="text-xs text-gray-500">Conversion efficiency</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {calculatePercentage(dashboardStats.shortlistedApplicants, dashboardStats.totalApplicants)}%
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <FiEye className="text-purple-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Top Job Views</div>
                    <div className="text-xs text-gray-500">Highest viewed job</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {topJobs.length > 0 ? Math.max(...topJobs.map(job => job.views)) : 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
                    {activityLoading && (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All
                  </button>
                </div>
                {error && (
                  <p className="text-xs text-red-500 mt-2">
                    Using fallback data: {error}
                  </p>
                )}
              </div>
              <div className="p-1 max-h-[500px] overflow-y-auto">
                {activityLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="p-4 border-b border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/6 animate-pulse"></div>
                          </div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded w-1/5 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2.5 rounded-lg ${activity.color}`}>
                            <Icon className="text-lg" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{activity.title}</h3>
                              <span className="text-xs text-gray-500">{activity.time}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            {activity.changes?.status && (
                              <div className="mt-2 text-xs">
                                <span className="text-gray-500">Status: </span>
                                <span className="font-medium text-gray-700">
                                  {activity.changes.status.old} → {activity.changes.status.new}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-2">No recent activities found</div>
                    <p className="text-sm text-gray-500">Your activities will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Top Performing Jobs */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-gray-900">Top Performing Jobs</h2>
                    {topJobsLoading && (
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    )}
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View All
                  </button>
                </div>
                {topJobsError && (
                  <p className="text-xs text-purple-500 mt-2">
                    Using fallback data: {topJobsError}
                  </p>
                )}
              </div>
              <div className="p-1">
                {topJobsLoading ? (
                  // Loading skeleton
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="p-4 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="flex items-center gap-4">
                            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-8 mb-2 animate-pulse"></div>
                          <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : topJobs.length > 0 ? (
                  topJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm line-clamp-1">{job.title}</h3>
                          <div className="flex items-center gap-4 mt-2">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FiUsers className="w-3 h-3" />
                              <span>{formatNumber(job.applicants)} applicants</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <FiEye className="w-3 h-3" />
                              <span>{formatNumber(job.views)} views</span>
                            </div>
                          </div>
                          {job.jobCategory && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                                {job.jobCategory}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-2">No jobs found</div>
                    <p className="text-sm text-gray-500">Your top performing jobs will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
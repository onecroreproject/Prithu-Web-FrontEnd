import React, { useState, useEffect } from 'react';
import FeaturedEmployers from './futureEmployees';
import DiversityConsciousEmployers from './diversityConsusionEmployee';
import JobCourses from './jobcourse';
import JobBlogs from './jobBlogs';
import { Bell, TrendingUp, Loader2 } from 'lucide-react';
import axios from '../../../api/axios';

const JobRightSide = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  const fetchPlatformStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get("/api/company/platform/status");
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        setError("Failed to load stats");
      }
    } catch (err) {
      console.error("Error fetching platform stats:", err);
      setError("Unable to load job market data");
      // Set fallback data if API fails
      setStats({
        activeJobs: 1200,
        hiringRate: 85,
        companies: 240,
        satisfaction: 98
      });
    } finally {
      setLoading(false);
    }
  };

  // Format large numbers with "k+" suffix
  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k+`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-8 w-full">
      <FeaturedEmployers />
      <DiversityConsciousEmployers />
      <JobCourses />
      <JobBlogs />
      
      {/* Job Alerts Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-3">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Get Job Alerts</h3>
            <p className="text-xs text-gray-600 mb-2">
              Never miss matching job opportunities
            </p>
            <div className="flex flex-col gap-1">
              <input
                type="email"
                placeholder="Your email"
                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="w-full py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors">
                Create Alert
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Job Market
          </h3>
          <span className="text-xs text-gray-500">Today</span>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <span className="ml-2 text-sm text-gray-600">Loading stats...</span>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-sm text-red-600">{error}</p>
            <button 
              onClick={fetchPlatformStats}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800"
            >
              Retry
            </button>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded">
              <p className="text-lg font-bold text-blue-600">
                {formatNumber(stats.activeJobs)}
              </p>
              <p className="text-xs text-gray-600">Active Jobs</p>
            </div>
            <div className="bg-green-50 p-2 rounded">
              <p className="text-lg font-bold text-green-600">
                {stats.hiringRate}%
              </p>
              <p className="text-xs text-gray-600">Hiring Rate</p>
            </div>
            <div className="bg-purple-50 p-2 rounded">
              <p className="text-lg font-bold text-purple-600">
                {formatNumber(stats.companies)}
              </p>
              <p className="text-xs text-gray-600">Companies</p>
            </div>
            <div className="bg-amber-50 p-2 rounded">
              <p className="text-lg font-bold text-amber-600">
                {stats.satisfaction}%
              </p>
              <p className="text-xs text-gray-600">Satisfaction</p>
            </div>
          </div>
        ) : null}
        
        {/* Last updated time */}
        {stats && !loading && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Updated just now
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRightSide;
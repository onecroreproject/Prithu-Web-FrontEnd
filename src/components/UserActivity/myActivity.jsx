import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowRightIcon,
  BookmarkIcon,
  UserIcon,
  PlusIcon,
  CalendarIcon,
  UserCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

import {
  HeartIcon as HeartSolid,
  ChatBubbleLeftIcon as ChatSolid,
  ArrowRightIcon as ShareSolid,
  BookmarkIcon as BookmarkSolid,
  UserIcon as UserSolid,
  PlusIcon as PlusSolid,
  CalendarIcon as CalendarSolid,
  UserCircleIcon as UserCircleSolid,
  EyeIcon as EyeSolid,
  ArrowDownTrayIcon as ArrowDownTraySolid,
  XMarkIcon as XMarkSolid
} from '@heroicons/react/24/solid';

const MyActivity = () => {
  const { token } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Activity type configuration
  const activityTypes = {
    LIKE_POST: { 
      label: 'Liked a post', 
      icon: HeartIcon, 
      activeIcon: HeartSolid,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    UNLIKE_POST: { 
      label: 'Unliked a post', 
      icon: HeartIcon, 
      activeIcon: HeartSolid,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    COMMENT: { 
      label: 'Commented on a post', 
      icon: ChatBubbleLeftIcon, 
      activeIcon: ChatSolid,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    SHARE_POST: { 
      label: 'Shared a post', 
      icon: ArrowRightIcon, 
      activeIcon: ShareSolid,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    FOLLOW_USER: { 
      label: 'Started following', 
      icon: UserIcon, 
      activeIcon: UserSolid,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    UNFOLLOW_USER: { 
      label: 'Unfollowed', 
      icon: UserIcon, 
      activeIcon: UserSolid,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    CREATE_POST: { 
      label: 'Created a post', 
      icon: PlusIcon, 
      activeIcon: PlusSolid,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200'
    },
    SCHEDULE_POST: { 
      label: 'Scheduled a post', 
      icon: CalendarIcon, 
      activeIcon: CalendarSolid,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    UPDATE_PROFILE: { 
      label: 'Updated profile', 
      icon: UserCircleIcon, 
      activeIcon: UserCircleSolid,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200'
    },
    VIEW_PORTFOLIO: { 
      label: 'Viewed portfolio', 
      icon: EyeIcon, 
      activeIcon: EyeSolid,
      color: 'text-teal-500',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200'
    },
    LOGIN: { 
      label: 'Logged in', 
      icon: UserCircleIcon, 
      activeIcon: UserCircleSolid,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200'
    },
    LOGOUT: { 
      label: 'Logged out', 
      icon: UserCircleIcon, 
      activeIcon: UserCircleSolid,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    DOWNLOAD_POST: { 
      label: 'Downloaded post', 
      icon: ArrowDownTrayIcon, 
      activeIcon: ArrowDownTraySolid,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200'
    },
    REMOVE_FOLLOWER: { 
      label: 'Removed follower', 
      icon: XMarkIcon, 
      activeIcon: XMarkSolid,
      color: 'text-rose-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200'
    }
  };

  // Fetch activities
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/get/user/activity', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setActivities(response.data.activities || []);
        } else {
          setError('Failed to fetch activities');
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError(err.response?.data?.error || 'Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchActivities();
    }
  }, [token]);

  // Calculate activity counts
  const getActivityCounts = () => {
    const counts = {};
    Object.keys(activityTypes).forEach(key => {
      counts[key] = activities.filter(activity => activity.actionType === key).length;
    });
    return counts;
  };

  // Get top activities (most frequent)
  const getTopActivities = () => {
    const counts = getActivityCounts();
    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 4)
      .map(([key, count]) => ({
        key,
        count,
        ...activityTypes[key]
      }));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  // Get target display text
  const getTargetDisplay = (activity) => {
    if (!activity.targetId) return null;

    const target = activity.targetId;
    
    if (activity.targetModel === 'Feed' && target.title) {
      return `"${target.title}"`;
    } else if (activity.targetModel === 'User' && target.userName) {
      return `@${target.userName}`;
    } else if (activity.targetModel === 'JobPost' && target.companyName) {
      return `${target.companyName}`;
    } else if (activity.targetModel === 'JobPost' && target.title) {
      return `"${target.title}"`;
    }
    
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="w-12 h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
        
        {/* Activity List Skeleton */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XMarkIcon className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load activities</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activityCounts = getActivityCounts();
  const topActivities = getTopActivities();
  const totalActivities = activities.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Activity</h1>
        <p className="text-gray-600">
          Track your recent actions and interactions across the platform
        </p>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Activities Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{totalActivities}</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Total Activities</h3>
          <p className="text-gray-500 text-sm">All your actions</p>
        </div>

        {/* Top Activity Cards */}
        {topActivities.map((activity, index) => {
          const Icon = activity.activeIcon;
          return (
            <div 
              key={activity.key}
              className={`bg-white rounded-xl border ${activity.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${activity.bgColor} rounded-full flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${activity.color}`} />
                </div>
                <span className="text-2xl font-bold text-gray-900">{activity.count}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{activity.label}</h3>
              <p className="text-gray-500 text-sm">Recent actions</p>
            </div>
          );
        })}

        {/* Fill remaining cards if less than 4 top activities */}
        {topActivities.length < 4 && 
          Array.from({ length: 4 - topActivities.length }).map((_, index) => (
            <div 
              key={`empty-${index}`}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <PlusIcon className="w-6 h-6 text-gray-400" />
                </div>
                <span className="text-2xl font-bold text-gray-300">0</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-300 mb-1">No Activity</h3>
              <p className="text-gray-400 text-sm">Start interacting</p>
            </div>
          ))
        }
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* List Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Activity Timeline</h2>
              <p className="text-gray-600 text-sm mt-1">
                {totalActivities > 0 
                  ? `Showing your latest ${totalActivities} activities` 
                  : 'No activities to display'
                }
              </p>
            </div>
            {totalActivities > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{totalActivities}</div>
                <div className="text-sm text-gray-500">total actions</div>
              </div>
            )}
          </div>
        </div>

        {/* Activity List Content */}
        <div className="p-6">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCircleIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities yet</h3>
              <p className="text-gray-500 mb-6">Your activities will appear here once you start using the platform.</p>
              <button
                onClick={() => window.location.href = '/feed'}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Feed
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const config = activityTypes[activity.actionType] || activityTypes.LIKE_POST;
                const Icon = config.activeIcon;
                const targetDisplay = getTargetDisplay(activity);

                return (
                  <div
                    key={activity._id}
                    className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
                  >
                    {/* Activity Icon */}
                    <div className={`p-3 rounded-full ${config.bgColor} border ${config.borderColor} group-hover:scale-105 transition-transform duration-200`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    
                    {/* Activity Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium">
                            {config.label}
                            {targetDisplay && (
                              <span className="text-blue-600 ml-1 font-semibold">{targetDisplay}</span>
                            )}
                          </p>
                          
                          {/* Metadata */}
                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {activity.metadata.device && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                  <EyeIcon className="w-3 h-3 mr-1" />
                                  {activity.metadata.device}
                                </span>
                              )}
                              {activity.metadata.ip && (
                                <span className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                  🌐 {activity.metadata.ip}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {formatDate(activity.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {activities.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <p className="text-center text-gray-500 text-sm">
              Showing latest {activities.length} activities • 
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-blue-600 hover:text-blue-700 ml-1 transition-colors"
              >
                Back to top
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyActivity;
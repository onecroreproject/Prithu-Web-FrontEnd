import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

// Icons - Only import what we need
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    ArrowRightIcon,
    BookmarkIcon,
    BellIcon,
    UserIcon,
} from '@heroicons/react/24/outline';

const Response = () => {
    const { token } = useAuth();
    const [activeSection, setActiveSection] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lightweight sections configuration
    const sections = [
        { id: 'all', label: 'All', icon: BellIcon },
        { id: 'likes', label: 'Likes', icon: HeartIcon },
        { id: 'comments', label: 'Comments', icon: ChatBubbleLeftIcon },
        { id: 'shares', label: 'Shares', icon: ArrowRightIcon },
        { id: 'saves', label: 'Saves', icon: BookmarkIcon }
    ];

    // Notification type configuration
    const notificationConfig = {
        like: { icon: HeartIcon, color: 'red' },
        comment: { icon: ChatBubbleLeftIcon, color: 'blue' },
        share: { icon: ArrowRightIcon, color: 'green' },
        save: { icon: BookmarkIcon, color: 'yellow' },
        follow: { icon: UserIcon, color: 'purple' },
        default: { icon: BellIcon, color: 'gray' }
    };

    // Calculate counts once
    const getCounts = () => {
        const counts = { all: notifications.length };
        const unreadCount = notifications.filter(n => !n.isRead).length;

        // Calculate section counts
        sections.forEach(section => {
            if (section.id !== 'all') {
                const type = section.id.slice(0, -1); // Remove 's' from likes, comments, etc.
                counts[section.id] = notifications.filter(notification =>
                    notification.type?.toLowerCase().includes(type)
                ).length;
            }
        });

        return { counts, unreadCount };
    };

    const { counts, unreadCount } = getCounts();

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const response = await api.get('/api/get/user/all/notification', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setNotifications(response.data.notifications || []);
                } else {
                    setError('Failed to fetch');
                }
            } catch (err) {
                setError(err.response?.data?.error || 'Failed to load');
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchNotifications();
    }, [token]);

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        if (activeSection === 'all') return true;

        const type = activeSection.slice(0, -1); // Remove 's'
        return notification.type?.toLowerCase().includes(type);
    });

    // Mark as read
    const markAsRead = (notificationId) => {
        setNotifications(prev =>
            prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
        );
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    // Format date - lightweight version
    const formatDate = (dateString) => {
        const diff = Date.now() - new Date(dateString).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);

        if (mins < 1) return 'Now';
        if (mins < 60) return `${mins}m`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;

        return new Date(dateString).toLocaleDateString();
    };

    // Get notification config
    const getNotificationConfig = (type) => {
        const typeLower = type?.toLowerCase() || '';
        for (const [key, config] of Object.entries(notificationConfig)) {
            if (typeLower.includes(key)) return config;
        }
        return notificationConfig.default;
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="flex min-h-[500px] bg-white rounded-lg ">
                {/* Sidebar Skeleton */}
                <div className="w-64 bg-gray-50 border-r p-6">
                    <div className="h-6 bg-gray-200 rounded w-20 mb-6"></div>
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-12 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                    ))}
                </div>

                {/* Content Skeleton */}
                <div className="flex-1 p-6">
                    <div className="h-7 bg-gray-200 rounded w-48 mb-4"></div>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex gap-4 p-4 border rounded-lg mb-3 animate-pulse">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load</h3>
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

    return (
        <div className="flex min-h-[500px] bg-white rounded-lg ">
            {/* Sidebar */}
            <div className="w-64 bg-gray-50  p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Responses</h3>
                </div>

                <div className="space-y-1">
                    {sections.map(section => {
                        const Icon = section.icon;
                        const count = counts[section.id] || 0;

                        return (
                            <motion.button
                                key={section.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${activeSection === section.id
                                        ? 'bg-blue-500 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-white hover:text-gray-900'
                                    }`}
                                onClick={() => setActiveSection(section.id)}
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{section.label}</span>
                                </div>
                                {count > 0 && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeSection === section.id
                                            ? 'bg-white text-blue-600'
                                            : 'bg-gray-200 text-gray-700'
                                        }`}>
                                        {count}
                                    </span>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">
                        {activeSection === 'all' ? 'All Responses' : sections.find(s => s.id === activeSection)?.label}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {filteredNotifications.length} {filteredNotifications.length === 1 ? 'item' : 'items'}
                    </p>
                </div>

                {filteredNotifications.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-12"
                    >
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BellIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No responses</h3>
                        <p className="text-gray-500">You're all caught up!</p>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        className="space-y-3"
                    >
                        <AnimatePresence>
                            {filteredNotifications.map((notification) => {
                                const config = getNotificationConfig(notification.type);
                                const Icon = config.icon;
                                const color = config.color;

                                return (
                                    <motion.div
                                        key={notification._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -2 }}
                                        className={`flex gap-3 p-4 rounded-lg border cursor-pointer transition-all ${notification.isRead
                                                ? 'bg-white border-gray-200'
                                                : 'bg-blue-50 border-blue-200'
                                            }`}
                                        onClick={() => !notification.isRead && markAsRead(notification._id)}
                                    >
                                        {/* Icon */}
                                        <div className={`p-2 rounded-full bg-${color}-50 border border-${color}-200`}>
                                            <Icon className={`w-4 h-4 text-${color}-500`} />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-1">
                                                <div className="flex-1">
                                                    <p className="text-gray-900 font-medium text-sm">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-gray-600 text-sm mt-1">
                                                        {notification.message}
                                                    </p>

                                                    {/* Sender */}
                                                    {notification.sender && (
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {notification.sender.profileAvatar ? (
                                                                <img
                                                                    src={notification.sender.profileAvatar}
                                                                    alt=""
                                                                    className="w-5 h-5 rounded-full"
                                                                />
                                                            ) : (
                                                                <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                                                                    <UserIcon className="w-3 h-3 text-white" />
                                                                </div>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                {notification.sender.displayName || notification.sender.userName}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Time & Status */}
                                                <div className="flex flex-col items-end gap-1 ml-2">
                                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                                        {formatDate(notification.createdAt)}
                                                    </span>
                                                    {!notification.isRead && (
                                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Feed info */}
                                            {notification.feedInfo && (
                                                <div className="mt-2 px-2 py-1 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">
                                                    {notification.feedInfo.title || 'Post'}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Response;
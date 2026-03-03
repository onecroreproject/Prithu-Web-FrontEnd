import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Calendar, User, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { useUpdates } from '../context/UpdateContext';
import SEO from '../components/SEO';
import DOMPurify from 'dompurify';

const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
    }).format(new Date(dateString));
};

const cleanContent = (content) => {
    if (!content) return '';
    const cleaned = content.replace(/&nbsp;/g, ' ');
    return DOMPurify.sanitize(cleaned, {
        ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'br', 'span'],
        KEEP_CONTENT: true
    });
};

const WhatsNewPage = () => {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const { markAsRead, fetchUnreadCount } = useUpdates();

    const fetchUpdates = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/api/user/updates/all');
            if (response.data.success) {
                setUpdates(response.data.updates);
            }
        } catch (error) {
            console.error("Failed to fetch updates:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUpdates();
    }, [fetchUpdates]);

    const handleMarkAsRead = async (update) => {
        if (!update.isRead) {
            await markAsRead(update._id);
            setUpdates(prev => prev.map(u =>
                u._id === update._id ? { ...u, isRead: true } : u
            ));
            fetchUnreadCount();
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <SEO
                    title="What's New – Prithu"
                    description="Stay updated with the latest features and changes on Prithu."
                />
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/20">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">What's New</h1>
                        </div>
                        <p className="text-gray-500 text-sm">Stay updated with the latest features and changes.</p>
                    </header>

                    {/* Content */}
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                            <p className="text-gray-500 animate-pulse">Fetching latest updates...</p>
                        </div>
                    ) : updates.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No updates yet</h3>
                            <p className="text-gray-500">We'll notify you when something new arrives!</p>
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6"
                        >
                            {updates.map((update) => (
                                <motion.div
                                    key={update._id}
                                    variants={itemVariants}
                                    onViewportEnter={() => handleMarkAsRead(update)}
                                    className={`
                      group bg-white rounded-2xl border transition-all duration-300
                      ${update.isRead
                                            ? 'border-gray-200 opacity-80'
                                            : 'border-blue-500/50 shadow-lg shadow-blue-500/5'
                                        }
                      hover:shadow-xl
                    `}
                                >
                                    <div className="p-6">
                                        <div className="flex flex-col sm:flex-row gap-6">
                                            {update.media && (
                                                <div className="w-full sm:w-40 h-40 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                                                    <img
                                                        src={update.media}
                                                        alt={update.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                </div>
                                            )}

                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-500 transition-colors">
                                                        {update.title}
                                                    </h2>
                                                    {!update.isRead && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0">
                                                            New
                                                        </span>
                                                    )}
                                                </div>

                                                <div
                                                    className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-6 prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-strong:text-gray-900"
                                                    dangerouslySetInnerHTML={{ __html: cleanContent(update.description) }}
                                                />

                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(update.createdAt)}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="w-4 h-4" />
                                                        {update.targetRole === 'all' ? 'Everyone' : update.targetRole}
                                                    </div>
                                                    {update.isRead && (
                                                        <div className="flex items-center gap-1.5 text-emerald-500">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Read
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>
            <style>{`
            .prose ul, .prose ol {
                margin-bottom: 1rem;
                padding-left: 1.5rem !important;
                list-style-position: outside !important;
            }
            .prose ul {
                list-style-type: disc !important;
            }
            .prose ol {
                list-style-type: decimal !important;
            }
            .prose li {
                text-align: left;
                margin-bottom: 0.25rem;
            }
        `}</style>
        </>
    );
};

export default WhatsNewPage;

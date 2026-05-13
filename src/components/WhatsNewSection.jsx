import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import CategoryHeader from './CategoryHeader';
import { Zap, Calendar, ArrowRight, User } from 'lucide-react';
import DOMPurify from 'dompurify';

const WhatsNewSection = () => {
    const [latestUpdate, setLatestUpdate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLatest = async () => {
            setIsLoading(true);
            try {
                const response = await api.get('/api/user/updates/public');
                if (response.data.success && response.data.updates.length > 0) {
                    setLatestUpdate(response.data.updates[0]);
                }
            } catch (error) {
                console.error('Error fetching latest update:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLatest();
    }, []);

    const cleanContent = (content) => {
        if (!content) return '';
        // Remove HTML tags for a clean preview
        return content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ');
    };

    if (isLoading && !latestUpdate) return null;
    if (!latestUpdate) return null;

    return (
        <section className="relative w-full py-8 bg-transparent overflow-hidden my-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col gap-6">
                    <CategoryHeader categoryName="What's New" />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        onClick={() => navigate('/whats-new')}
                        className="group relative bg-white/95 backdrop-blur-xl rounded-[2.5rem] border border-blue-100/50 shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 cursor-pointer overflow-hidden p-1"
                    >
                        {/* Premium Gradient Border effect */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative bg-white rounded-[2.4rem] p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center">

                            {/* Visual Indicator / Image */}
                            <div className="relative shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-blue-50 overflow-hidden flex items-center justify-center group-hover:bg-blue-100 transition-all duration-500">
                                {latestUpdate.media ? (
                                    <img 
                                        src={latestUpdate.media} 
                                        alt={latestUpdate.title}
                                        className="w-full h-full object-contain transition-transform duration-500"
                                    />
                                ) : (
                                    <Zap className="w-12 h-12 md:w-16 md:h-16 text-blue-500 group-hover:scale-110 transition-transform duration-500" />
                                )}
                            </div>

                            {/* Text Content */}
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full text-xs font-bold text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(latestUpdate.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    </span>
                                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5" />
                                        {latestUpdate.targetRole === 'all' ? 'System Update' : `For ${latestUpdate.targetRole}s`}
                                    </span>
                                    {latestUpdate.version && (
                                        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full text-xs font-bold text-amber-600 uppercase tracking-wider">
                                            {latestUpdate.version}
                                        </span>
                                    )}
                                </div>

                                <h2 className="text-2xl md:text-4xl font-black text-gray-900 mb-4 group-hover:text-blue-600 transition-colors leading-tight">
                                    {latestUpdate.title}
                                </h2>

                                <div
                                    className="text-base text-gray-600 leading-relaxed max-w-2xl
                                    [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1 [&_p]:mb-2"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(latestUpdate.description) }}
                                />
                            </div>

                            {/* Action Button */}
                            <div className="shrink-0">
                                <div className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-500 transform group-hover:rotate-45">
                                    <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default WhatsNewSection;

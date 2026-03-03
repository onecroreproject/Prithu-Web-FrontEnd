import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogBySlug } from '../Service/blogService';
import { Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import SEO from '../components/SEO';
import { Clock, BookOpen, ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { getMediaUrl } from '../Utils/urlHelper';

const HeroBackground3D = lazy(() => import('../components/HomeComponents/HeroBackground3D'));

const BlogDetail = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            setIsLoading(true);
            const data = await getBlogBySlug(slug);
            if (!data) {
                toast.error("Blog not found");
                navigate('/blogs');
                return;
            }
            setBlog(data);
            setIsLoading(false);
        };
        fetchBlog();
    }, [slug, navigate]);


    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#fef5d5] p-4 lg:p-12">
                <div className="max-w-4xl mx-auto bg-white/80 rounded-3xl p-8 shadow-xl text-center">
                    <Skeleton variant="rectangular" height={400} className="rounded-2xl mb-8" />
                    <Skeleton variant="text" width="60%" height={40} className="mb-4 mx-auto" />
                    <Skeleton variant="text" width="40%" height={24} className="mb-8 mx-auto" />
                    <div className="space-y-4">
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="80%" className="mx-auto" />
                    </div>
                </div>
            </div>
        );
    }

    // Process content for clean rendering
    const cleanContent = (content) => {
        if (!content) return "";

        // 1. Aggressively clean up &nbsp; and normalize spaces
        // We replace &nbsp; with a standard space, then collapse multiple spaces
        let cleaned = content
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // 2. Sanitize with DOMPurify
        // This also handles the structural fixes like nested headings in lists
        return DOMPurify.sanitize(cleaned, {
            ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'br'],
            KEEP_CONTENT: true
        });
    };

    return (
        <div className="min-h-screen bg-[#fef5d5] text-gray-800 overflow-x-hidden relative pb-20">
            <SEO
                title={`${blog.title} - Prithu Stories`}
                description={blog.content ? blog.content.substring(0, 155).replace(/<[^>]*>/g, '') : ""}
                image={getMediaUrl(blog.image)}
            />

            {/* Three.js Background */}
            <Suspense fallback={<div className="fixed inset-0 bg-[#fef5d5] z-0" />}>
                <HeroBackground3D />
            </Suspense>

            <div className="relative z-10 max-w-4xl mx-auto px-4 pt-10">
                {/* Improved Header actions - Centered */}
                <div className="flex items-center justify-center mb-8">
                    <button
                        onClick={() => navigate('/blogs')}
                        className="flex items-center gap-2 text-amber-700 font-bold hover:text-amber-600 transition-all hover:scale-105 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-amber-100 shadow-sm text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Stories
                    </button>
                </div>

                {/* Blog Content Card */}
                <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-xl rounded-[40px] shadow-2xl border border-amber-100 overflow-hidden"
                >
                    {/* Featured Image - Enhanced */}
                    <div className="h-[350px] md:h-[500px] overflow-hidden relative">
                        <img
                            src={getMediaUrl(blog.image)}
                            alt={blog.title}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-8 left-8 right-8 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-amber-500 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                    Story
                                </span>
                                <div className="h-px w-12 bg-white/30"></div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">
                                    Prithu Exclusive
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black mb-4 leading-[1.1] drop-shadow-xl text-balance">
                                {blog.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-100">
                                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                    <Calendar className="w-4 h-4 text-amber-400" />
                                    {new Date(blog.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                                    <Clock className="w-4 h-4 text-amber-400" />
                                    {Math.ceil(blog.content.length / 500)} Min Read
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Blog Body - Premium Typography */}
                    <div className="p-8 md:p-14 lg:p-20">
                        <div
                            className="prose prose-amber prose-lg md:prose-xl max-w-none text-gray-700 leading-[1.8] font-normal prose-p:mb-8 prose-headings:font-black prose-headings:text-gray-900 prose-li:my-4 prose-strong:text-gray-900 prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-50/50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-ul:list-disc prose-ol:list-decimal"
                            dangerouslySetInnerHTML={{ __html: cleanContent(blog.content) }}
                        />

                        {/* Centered Footer Section */}
                        <div className="mt-20 pt-16 border-t border-amber-50 flex flex-col items-center">
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-xl border-4 border-white mb-6">
                                ✨
                            </div>
                            <div className="text-center space-y-2 mb-10">
                                <h3 className="text-2xl font-black text-gray-900">Hope you enjoyed this story!</h3>
                                <p className="text-gray-500 font-medium">Published by the Prithu Editorial Team</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <button
                                    onClick={() => navigate('/blogs')}
                                    className="px-10 py-4 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-700 transition-all shadow-lg shadow-amber-900/10 text-sm tracking-widest uppercase flex items-center justify-center gap-3"
                                >
                                    <BookOpen className="w-4 h-4" />
                                    Read More Stories
                                </button>
                                <button
                                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                    className="px-10 py-4 bg-white text-amber-700 font-black rounded-2xl border-2 border-amber-100 hover:bg-amber-50 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-3"
                                >
                                    Back to Top
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.article>
            </div>

            {/* Inline styles for even more refined typography control */}
            <style>{`
                .prose p {
                    text-align: justify;
                    hyphens: auto;
                    margin-bottom: 1.5rem;
                }
                /* Ensure lists are not justified as it breaks alignment */
                .prose li {
                    text-align: left;
                    padding-left: 0.5rem;
                    margin-bottom: 0.75rem;
                }
                .prose ul, .prose ol {
                    margin-bottom: 2rem;
                    padding-left: 1.5rem !important;
                    list-style-position: outside !important;
                }
                /* Explicitly set list style types to override any resets */
                .prose ul {
                    list-style-type: disc !important;
                }
                .prose ol {
                    list-style-type: decimal !important;
                }
                /* Visual fixes for list bullets */
                .prose ul > li::marker, .prose ol > li::marker {
                    color: #d97706; /* amber-600 */
                    font-weight: bold;
                }
                @media (max-width: 640px) {
                    .prose p {
                        text-align: left;
                    }
                    .prose {
                        font-size: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default BlogDetail;

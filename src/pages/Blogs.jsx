import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBlogs } from '../Service/blogService';
import { Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import SEO from '../components/SEO';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';

const HeroBackground3D = lazy(() => import('../components/HomeComponents/HeroBackground3D'));

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoading(true);
            const data = await getAllBlogs();
            setBlogs(data);
            setIsLoading(false);
        };
        fetchBlogs();
    }, []);

    const truncateContent = (content, limit = 150) => {
        if (content.length <= limit) return content;
        return content.substring(0, limit) + "...";
    };

    return (
        <div className="min-h-screen bg-[#fef5d5] text-gray-800 overflow-x-hidden relative">
            <SEO
                title="Our Stories - Prithu Official Blog"
                description="Read latest updates, tips and stories from Prithu. Explore deep insights on how to create the best status and motivational videos."
                keywords="Prithu blog, motivational stories, video creation tips, status app updates"
            />

            {/* Three.js Background */}
            <Suspense fallback={<div className="fixed inset-0 bg-[#fef5d5] z-0" />}>
                <HeroBackground3D />
            </Suspense>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
                {/* Header Section / Reading Card */}
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto bg-white/80 backdrop-blur-xl rounded-[32px] p-8 md:p-12 border border-white/50 shadow-2xl text-center relative overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-200/20 to-orange-200/20 blur-3xl rounded-full -mr-24 -mt-24"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-200/20 to-purple-200/20 blur-3xl rounded-full -ml-24 -mb-24"></div>

                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 rounded-full font-bold text-xs mb-6 shadow-sm"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                PRITHU STORIES
                            </motion.div>

                            <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight">
                                <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-pink-600 bg-clip-text text-transparent">
                                    Insights for Your Journey
                                </span>
                            </h1>

                            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed font-medium">
                                Explore video creation, motivational insights, and everything you need to stand out.
                            </p>
                        </div>
                    </motion.div>
                </header>

                {/* Blog Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white/80 rounded-2xl p-4 shadow-xl">
                                <Skeleton variant="rectangular" height={180} className="rounded-xl mb-4" />
                                <Skeleton variant="text" width="80%" height={24} />
                                <Skeleton variant="text" width="100%" height={16} />
                                <Skeleton variant="text" width="100%" height={16} />
                                <Skeleton variant="rectangular" width={100} height={32} className="rounded-full mt-4" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map((blog, index) => (
                            <motion.article
                                key={blog._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white/90 backdrop-blur-md rounded-[28px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-amber-50/50 hover:border-amber-200 flex flex-col hover:-translate-y-2 cursor-pointer"
                                onClick={() => navigate(`/home/blogs/${blog.slug}`)}
                            >
                                {/* Blog Image Above */}
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={blog.image}
                                        alt={blog.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-amber-600/80 mb-3">
                                        <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                                            <Clock className="w-3 h-3" />
                                            {new Date(blog.createdAt).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                                            <BookOpen className="w-3 h-3" />
                                            {Math.ceil(blog.content.length / 500)} min
                                        </span>
                                    </div>

                                    <h2 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
                                        {blog.title}
                                    </h2>

                                    <p className="text-sm text-gray-500 mb-5 flex-1 line-clamp-2 leading-relaxed">
                                        {truncateContent(blog.content.replace(/<[^>]*>?/gm, ''))}
                                    </p>

                                    <div className="flex items-center text-amber-600 text-sm font-bold group/btn">
                                        <span>Read Story</span>
                                        <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}

                {!isLoading && blogs.length === 0 && (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-dashed border-amber-300">
                        <BookOpen className="w-16 h-16 text-amber-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800">No stories found yet</h2>
                        <p className="text-gray-600">Check back soon for inspiring content!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Blogs;

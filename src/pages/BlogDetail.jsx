import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlogBySlug } from '../Service/blogService';
import { Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import SEO from '../components/SEO';
import { Clock, BookOpen, ArrowLeft, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

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
                navigate('/home/blogs');
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
                <div className="max-w-4xl mx-auto bg-white/80 rounded-3xl p-8 shadow-xl">
                    <Skeleton variant="rectangular" height={400} className="rounded-2xl mb-8" />
                    <Skeleton variant="text" width="60%" height={40} className="mb-4" />
                    <Skeleton variant="text" width="40%" height={24} className="mb-8" />
                    <div className="space-y-4">
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="100%" />
                        <Skeleton variant="text" width="80%" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fef5d5] text-gray-800 overflow-x-hidden relative pb-20">
            <SEO
                title={`${blog.title} - Prithu Stories`}
                description={blog.content.substring(0, 155)}
                image={blog.image}
            />

            {/* Three.js Background */}
            <Suspense fallback={<div className="fixed inset-0 bg-[#fef5d5] z-0" />}>
                <HeroBackground3D />
            </Suspense>

            <div className="relative z-10 max-w-3xl mx-auto px-4 pt-10">
                {/* Navigation & Actions */}
                <div className="flex items-center justify-start mb-6">
                    <button
                        onClick={() => navigate('/home/blogs')}
                        className="flex items-center gap-2 text-amber-700 font-bold hover:text-amber-600 transition-colors bg-white/50 backdrop-blur-sm px-4 py-1.5 rounded-full border border-amber-100 text-sm"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        Stories
                    </button>
                </div>

                {/* Blog Content Card */}
                <motion.article
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/95 backdrop-blur-xl rounded-[32px] shadow-2xl border border-amber-100 overflow-hidden"
                >
                    {/* Featured Image */}
                    <div className="h-[300px] md:h-[400px] overflow-hidden relative">
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 right-6 text-white">
                            <h1 className="text-2xl md:text-4xl font-black mb-3 leading-tight drop-shadow-md">
                                {blog.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-4 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(blog.createdAt).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-lg">
                                    <Clock className="w-3.5 h-3.5" />
                                    {Math.ceil(blog.content.length / 500)} min
                                </span>
                                <span className="px-2.5 py-1 bg-amber-500 rounded-lg shadow-lg">
                                    Story
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Blog Body */}
                    <div className="p-6 md:p-10 lg:p-12">
                        <div className="prose prose-amber md:prose-lg max-w-none text-gray-700 leading-relaxed font-medium">
                            {blog.content.split('\n\n').map((para, i) => (
                                <p key={i} className="mb-5 last:mb-0">
                                    {para}
                                </p>
                            ))}
                        </div>

                        {/* Footer / Author section */}
                        <div className="mt-12 pt-10 border-t border-amber-50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg border-2 border-white">
                                        ✨
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Editor</p>
                                        <p className="text-base font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Prithu Team</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/home/blogs')}
                                    className="w-full sm:w-auto px-6 py-3 bg-amber-50 text-amber-700 font-bold rounded-xl border border-amber-100 hover:bg-amber-100 transition-all text-sm"
                                >
                                    More Stories
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.article>
            </div>
        </div>
    );
};

export default BlogDetail;

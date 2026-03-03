import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getAllBlogs } from '../Service/blogService';
import CategoryHeader from './CategoryHeader';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';

const BlogSliderSection = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInitialPool = async () => {
            setIsLoading(true);
            try {
                const data = await getAllBlogs();
                setBlogs(data || []);
            } catch (error) {
                console.error('Error fetching blogs:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (blogs.length === 0) {
            fetchInitialPool();
        }
    }, [blogs.length]);

    if (isLoading && blogs.length === 0) return null;
    if (blogs.length === 0) return null;

    return (
        <section className="relative w-full py-4 bg-transparent overflow-hidden my-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col gap-4">
                    <CategoryHeader categoryName="Our  Stories" />

                    {/* Infinite Ticker Container */}
                    <div className="relative w-full overflow-hidden py-6 rounded-[2rem] bg-white/5 backdrop-blur-[2px]">
                        {/* Side Fades */}
                        <div className="absolute inset-y-0 left-0 w-24 md:w-32 bg-gradient-to-r from-[#fef5d5] via-[#fef5d5] to-transparent z-10 pointer-events-none rounded-l-[2rem]" />
                        <div className="absolute inset-y-0 right-0 w-24 md:w-32 bg-gradient-to-l from-[#fef5d5] via-[#fef5d5] to-transparent z-10 pointer-events-none rounded-r-[2rem]" />

                        <BlogTicker blogs={blogs} />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Internal Ticker Component for the seamless loop
const BlogTicker = ({ blogs }) => {
    if (!blogs || blogs.length === 0) return null;

    // Duplicate array for infinite effect
    const displayBlogs = React.useMemo(() => {
        if (blogs.length < 5) return [...blogs, ...blogs, ...blogs, ...blogs];
        return [...blogs, ...blogs];
    }, [blogs]);

    return (
        <div className="flex w-full overflow-hidden">
            <style>
                {`
                    @keyframes blog-scroll {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .blog-ticker-track {
                        display: flex;
                        gap: 1.5rem;
                        animation: blog-scroll 120s linear infinite;
                    }
                    .blog-ticker-track:hover {
                        animation-play-state: paused;
                    }
                    @media (max-width: 768px) {
                        .blog-ticker-track {
                            gap: 1rem;
                            animation: blog-scroll 80s linear infinite;
                        }
                    }
                `}
            </style>
            <div className="blog-ticker-track shrink-0 items-stretch">
                {displayBlogs.map((blog, idx) => (
                    <div
                        key={`${blog._id || 'blog'}-${idx}`}
                        className="w-[280px] md:w-[320px] shrink-0"
                    >
                        <BlogCard blog={blog} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const BlogCard = ({ blog }) => {
    const navigate = useNavigate();

    const truncateContent = (content, limit = 100) => {
        if (!content) return "";
        if (content.length <= limit) return content;
        return content.substring(0, limit) + "...";
    };

    return (
        <article
            onClick={() => navigate(`/blogs/${blog.slug}`)}
            className="group h-full bg-white/90 backdrop-blur-md rounded-[24px] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-amber-50/50 hover:border-amber-200 flex flex-col cursor-pointer hover:-translate-y-1"
        >
            {/* Blog Image */}
            <div className="relative h-40 overflow-hidden shrink-0">
                <img
                    src={blog.image || '/default-poster.png'}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>

            {/* Content Section */}
            <div className="p-5 flex-1 flex flex-col bg-white">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-amber-600/80 mb-2 shrink-0">
                    <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                    {blog.content && (
                        <span className="flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-full">
                            <BookOpen className="w-2.5 h-2.5" />
                            {Math.max(1, Math.ceil(blog.content.length / 500))} min
                        </span>
                    )}
                </div>

                <h2 className="text-lg font-bold mb-2 text-gray-800 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug shrink-0">
                    {blog.title}
                </h2>

                <p className="text-xs text-gray-500 mb-4 flex-1 line-clamp-2 leading-relaxed">
                    {truncateContent(blog.content ? blog.content.replace(/<[^>]*>?/gm, '') : '')}
                </p>

                <div className="flex items-center text-amber-600 text-[11px] font-bold group/btn shrink-0 mt-auto">
                    <span>Read Story</span>
                    <ChevronRight className="w-3 h-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
                </div>
            </div>
        </article>
    );
};

export default BlogSliderSection;

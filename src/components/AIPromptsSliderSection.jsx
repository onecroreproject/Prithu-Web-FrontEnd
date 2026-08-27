import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { INITIAL_PROMPTS } from '../constance/promptsData';
import CategoryHeader from './CategoryHeader';
import { getMediaUrl } from '../utils/urlHelper';

const AIPromptsSliderSection = () => {
    const [prompts, setPrompts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchPrompts = async () => {
            setIsLoading(true);
            try {
                const { data } = await api.get("/api/prompts");
                if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
                    const mapped = data.data.map(p => ({
                        ...p,
                        id: p._id || p.id
                    }));
                    setPrompts(mapped);
                } else {
                    setPrompts(INITIAL_PROMPTS);
                }
            } catch (error) {
                console.error('Error fetching prompts for slider:', error);
                setPrompts(INITIAL_PROMPTS);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPrompts();
    }, []);

    if (isLoading && prompts.length === 0) return null;

    return (
        <section className="relative w-full py-4 bg-transparent overflow-hidden mt-6">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col gap-4">
                    <CategoryHeader categoryName="Creative AI Prompts" />

                    {/* Infinite Ticker Container with Rounded Corners */}
                    <div className="relative w-full overflow-hidden py-6 rounded-[2rem] bg-white/5 backdrop-blur-[2px]">
                        {/* Side Fades */}
                        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#fef5d5] via-[#fef5d5] to-transparent z-10 pointer-events-none rounded-l-[2rem]" />
                        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#fef5d5] via-[#fef5d5] to-transparent z-10 pointer-events-none rounded-r-[2rem]" />

                        <PromptTicker prompts={prompts} />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Internal Ticker Component for the seamless loop
const PromptTicker = ({ prompts }) => {
    if (!prompts || prompts.length === 0) return null;

    // Duplicating array for infinite looping ticker
    const displayPrompts = React.useMemo(() => [...prompts, ...prompts], [prompts]);

    return (
        <div className="flex w-full overflow-hidden">
            <motion.div
                className="flex gap-2 md:gap-3 shrink-0"
                animate={{
                    x: ["0%", "-50%"]
                }}
                transition={{
                    duration: 100, // Slightly faster than video ticker for visual contrast
                    ease: "linear",
                    repeat: Infinity
                }}
            >
                {displayPrompts.map((prompt, idx) => (
                    <div
                        key={`${prompt.id}-${idx}`}
                        className="w-[150px] md:w-[200px] shrink-0"
                    >
                        <PromptCard prompt={prompt} />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// Prompt Card Component
const PromptCard = ({ prompt }) => {
    const handleCardClick = () => {
        window.location.href = `/free-ai-prompt?id=${prompt.id}`;
    };

    return (
        <div
            onClick={handleCardClick}
            className="relative aspect-[9/16] overflow-hidden rounded-xl bg-gray-900 border border-amber-500/10 shadow-sm group cursor-pointer hover:border-indigo-500/30 transition-all duration-300"
        >
            {/* Prompt Image */}
            <img
                src={getMediaUrl(prompt.imageUrl)}
                alt={prompt.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop";
                }}
            />

            {/* Top Left Category Badge */}
            <span className="absolute top-2.5 left-2.5 bg-black/60 text-white text-[8px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-xs">
                {prompt.category}
            </span>

            {/* Top Right Aspect Ratio Badge */}
            <span className="absolute top-2.5 right-2.5 bg-indigo-600/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full z-10 backdrop-blur-xs">
                {prompt.aspectRatio}
            </span>

            {/* Bottom Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end text-left">
                <p className="text-white text-[10px] font-extrabold line-clamp-2 leading-snug mb-1">
                    {prompt.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 pt-1.5 border-t border-white/10">
                    <span className="text-[7px] text-indigo-300 font-bold uppercase tracking-wider">
                        View Prompt →
                    </span>
                </div>
            </div>
        </div>
    );
};

export default AIPromptsSliderSection;

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '../hooks/useMiscellaneous';
import { getPublicFeeds } from '../Service/feedService';
import CategoryHeader from './CategoryHeader';

const FeedSliderSection = () => {
    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
    const [allVideos, setAllVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch a combined pool of videos from the first few categories
    useEffect(() => {
        const fetchInitialPool = async () => {
            if (categories.length === 0) return;
            setIsLoading(true);
            try {
                // Fetch from top 4 categories to get a good mix
                const categorySamples = categories.slice(0, 4);
                const promises = categorySamples.map(cat => getPublicFeeds(1, cat.categoryId, 'video'));
                const results = await Promise.all(promises);

                // Loosen filter to be more resilient to different data formats
                const combined = results.flat()
                    .filter(v => {
                        const isVideo = v && (
                            v.type?.toLowerCase() === 'video' ||
                            v.postType?.toLowerCase() === 'video' ||
                            v.mediaUrl?.match(/\.(mp4|webm|ogg|mov)$/i)
                        );
                        return isVideo && (v.mediaUrl || v.url || v.contentUrl);
                    });

                console.log(`[FeedSlider] Fetched ${results.flat().length} items, ${combined.length} are valid videos.`);

                // Shuffle the pool
                setAllVideos(combined.sort(() => 0.5 - Math.random()));
            } catch (error) {
                console.error('Error fetching video pool:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (categories.length > 0 && allVideos.length === 0) {
            fetchInitialPool();
        }
    }, [categories, allVideos.length]);

    if (isCategoriesLoading || (isLoading && allVideos.length === 0)) return null;

    return (
        <section className="relative w-full py-4 bg-transparent overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col gap-4">
                    <CategoryHeader categoryName="Trending Feeds" />

                    {/* Infinite Ticker Container with Rounded Corners (Borders Removed) */}
                    <div className="relative w-full overflow-hidden py-6 rounded-[2rem] bg-white/5 backdrop-blur-[2px]">
                        {/* Side Fades - Stronger effect with wider coverage and more solid start */}
                        <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#fef5d5] via-[#fef5d5] to-transparent z-10 pointer-events-none rounded-l-[2rem]" />
                        <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#fef5d5] via-[#fef5d5] to-transparent z-10 pointer-events-none rounded-r-[2rem]" />

                        <VideoTicker videos={allVideos} />
                    </div>
                </div>
            </div>
        </section>
    );
};

// Internal Ticker Component for the seamless loop
const VideoTicker = ({ videos }) => {
    if (!videos || videos.length === 0) return null;

    // Duplicate the content multiple times to ensure the ticker is long enough for the loop
    const displayVideos = [...videos, ...videos, ...videos];

    return (
        <div className="flex w-full overflow-hidden">
            <motion.div
                className="flex gap-2 md:gap-3 shrink-0"
                animate={{
                    x: ["0%", "-33.333%"]
                }}
                transition={{
                    duration: 150, // Slightly faster than 200 for better energy, still slow
                    ease: "linear",
                    repeat: Infinity
                }}
            >
                {displayVideos.map((video, idx) => (
                    <div
                        key={`${video._id || video.feedId}-${idx}`}
                        className="w-[150px] md:w-[200px] shrink-0"
                    >
                        <VideoCard video={video} idx={idx} />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

// Robust Video Card
const VideoCard = ({ video, idx }) => {
    const videoRef = React.useRef(null);
    const mediaUrl = video.mediaUrl || video.url || video.contentUrl;
    const posterUrl = video.thumbnailUrl || video.thumb;

    useEffect(() => {
        // Log once to see what's going on
        if (idx === 0) {
            console.log("[VideoCard Debug] mediaUrl:", mediaUrl, "posterUrl:", posterUrl);
        }
    }, [mediaUrl, posterUrl, idx]);

    // Handle auto-playing when the card is hovered, and ensure it's muted
    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(e => console.log("Auto-play blocked", e));
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <div
            className="relative aspect-[9/16] overflow-hidden rounded-xl bg-gray-200 border border-amber-100/20 shadow-sm group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <video
                ref={videoRef}
                src={mediaUrl}
                className="w-full h-full object-cover"
                muted
                playsInline
                loop
                autoPlay
                preload="auto"
                poster={posterUrl}
            />
            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3 flex flex-col justify-end">
                <p className="text-white text-[9px] font-bold line-clamp-1">{video.caption || video.description || video.dec || "Trending Feed"}</p>
                <div className="flex items-center gap-1 mt-1">
                    <span className="w-3 h-3 rounded-full bg-amber-500 flex items-center justify-center text-[6px] font-bold text-black">
                        {(video.postedBy?.name || video.creatorData?.name || video.creatorName || "U")[0]}
                    </span>
                    <p className="text-gray-300 text-[8px]">@{video.postedBy?.name || video.creatorData?.name || video.creatorName || "Creator"}</p>
                </div>
            </div>
        </div>
    );
};

export default FeedSliderSection;

import React from 'react';
import { motion } from 'framer-motion';

const VideoGrid = ({ videos, isLoading }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="aspect-[9/16] bg-neutral-200 /10 animate-pulse rounded-lg border border-white/5"></div>
                ))}
            </div>
        );
    }

    if (!videos || videos.length === 0) {
        return (
            <div className="w-full py-10 text-center text-gray-500">
                <p>No content available for this category yet.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
            {videos.map((video, index) => (
                <motion.div
                    key={video._id || video.feedId}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    className="relative group aspect-[9/16] overflow-hidden rounded-lg bg-transparent shadow-md hover:shadow-lg transition-all duration-300 border border-amber-100/30"
                >
                    <video
                        src={video.mediaUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />

                    {/* OTT Style Bottom Overlay */}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-3 left-4 right-4">
                            <motion.p
                                initial={{ y: 5, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-white text-sm font-bold line-clamp-1"
                            >
                                {video.caption || video.dec || "Amazing Content"}
                            </motion.p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[7px] font-bold text-black uppercase">
                                    {(video.creatorData?.name || "U")[0]}
                                </span>
                                <p className="text-[10px] text-gray-300 capitalize">{video.creatorData?.name || "Unknown User"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Hover Glow */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 hidden md:block" />
                </motion.div>
            ))}
        </div>
    );
};

export default VideoGrid;

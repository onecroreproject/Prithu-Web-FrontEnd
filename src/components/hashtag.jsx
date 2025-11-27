// components/TrendingHashtags.jsx
import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Hash, RefreshCw, Database, Server, ChevronRight } from "lucide-react";
import { useTrendingHashtags } from "../hooks/useTreanding";
import { useNavigate } from "react-router-dom";

export default function TrendingHashtags() {
    const {
        data: trendingData,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useTrendingHashtags();
    const navigate = useNavigate();
    if (isLoading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-lg mx-auto"  // Responsive width
            >
                <div className="p-4 sm:p-6">
                    <div className="flex items-center justify-center gap-3 py-6 sm:py-8">
                        <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                        <p className="text-gray-600 text-sm sm:text-base">Loading trending hashtags...</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (isError) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-lg mx-auto"
            >
                <div className="p-4 sm:p-6">
                    <div className="text-center text-red-600 py-4">
                        <p className="text-sm sm:text-base mb-3">Error loading trending hashtags: {error.message}</p>
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const { source, data: hashtags } = trendingData;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm w-full max-w-2xl "
        >
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100 rounded-t-xl p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    {/* LEFT SIDE */}
                    <div className="flex items-start gap-3 flex-1">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>

                        {/* Title + Description */}
                        <div className="flex flex-col flex-1 min-w-0">
                            <h2 className="text-md sm:text-lg font-bold text-gray-900 break-words">
                                Trending Hashtags
                            </h2>

                            <p className="text-gray-600 text-xs sm:text-sm mt-0.5 break-words leading-normal">
                                Discover what's happening right now
                            </p>
                        </div>
                    </div>



                </div>
            </div>


            <div className="p-4 sm:p-6">
                {/* Hashtags Grid */}
                <div className="space-y-1">
                    {hashtags.map((hashtag, index) => (
                       <motion.div
  key={hashtag._id || hashtag.tag}
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ delay: index * 0.05 }}
  className="flex flex-col sm:flex-row items-center justify-between hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group rounded-md px-2 py-2"
>
  <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">

    <div className="min-w-0 flex-1">
      <h3 
        onClick={() => {
    const clean = hashtag.tag.replace(/^#+/, "");
    navigate(`/hashtag/${clean}`);
  }}
      className="font-semibold text-gray-900 text-sm sm:text-lg hover:cursor-pointer hover:text-blue-400 hover:underline truncate">
        #{hashtag.tag}
      </h3>
      <p className="text-gray-600 text-xs sm:text-sm truncate">
        {hashtag.count} posts • {hashtag.feeds?.length || 0} recent feeds
      </p>
    </div>
  </div>

 





</motion.div>

                    ))}
                </div>

                {/* Empty State */}
                {hashtags.length === 0 && (
                    <div className="text-center py-8 sm:py-12">
                        <TrendingUp className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                            No trending hashtags
                        </h3>
                        <p className="text-gray-600 text-sm sm:text-base">
                            There are no trending hashtags at the moment.
                        </p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle, Loader2, X } from 'lucide-react';
import { useDownloads } from '../../context/DownloadContext';

const DownloadProgressBar = () => {
    const { activeDownloads, removeActiveDownload } = useDownloads();
    const activeList = Object.values(activeDownloads);

    if (activeList.length === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-4 pointer-events-none">
            <AnimatePresence>
                {activeList.map((job) => (
                    <motion.div
                        key={job.jobId}
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="bg-white border border-gray-100 rounded-2xl p-4 shadow-2xl mb-3 pointer-events-auto flex items-center gap-4 group relative overflow-hidden"
                    >
                        {/* Progress Background */}
                        <div
                            className="absolute bottom-0 left-0 h-1 bg-blue-500/10 transition-all duration-300"
                            style={{ width: '100%' }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 h-1 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                            initial={{ width: 0 }}
                            animate={{ width: `${job.progress}%` }}
                        />

                        {/* Thumbnail/Icon */}
                        <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 relative overflow-hidden border border-gray-100">
                            {job.thumbnail ? (
                                <img src={job.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                    <Download className="w-6 h-6 text-blue-500" />
                                </div>
                            )}
                            {job.progress < 100 ? (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 bg-emerald-500/80 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <h4 className="text-sm font-bold text-gray-900 truncate pr-6">
                                    {job.caption ? `Downloading: ${job.caption}` : 'Preparing Download...'}
                                </h4>
                                <button
                                    onClick={() => removeActiveDownload(job.jobId)}
                                    className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                                    {job.status === 'queued' ? 'In Queue' : job.progress === 100 ? 'Starting Download' : 'Processing'}
                                </span>
                                <span className="text-[10px] text-gray-400 tabular-nums">
                                    {job.progress}%
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default DownloadProgressBar;

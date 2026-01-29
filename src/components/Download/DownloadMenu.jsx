import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, AlertCircle, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useDownloads } from '../../context/DownloadContext';

const DownloadMenu = () => {
    const {
        activeDownloads,
        completedDownloads,
        isMenuOpen,
        toggleMenu,
        removeActiveDownload,
        clearCompleted
    } = useDownloads();

    const activeList = Object.values(activeDownloads);

    return (
        <AnimatePresence>
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleMenu}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                    />

                    {/* Sliding Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg text-white">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Downloads</h2>
                                    <p className="text-sm text-gray-500">
                                        {activeList.length} active, {completedDownloads.length} completed
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={toggleMenu}
                                className="p-2 hover:bg-white/50 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6">
                            {/* Active Downloads Section */}
                            {activeList.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-2">
                                        In Progress
                                    </h3>
                                    {activeList.map((job) => (
                                        <div
                                            key={job.jobId}
                                            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {job.thumbnail ? (
                                                        <img src={job.thumbnail} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-medium text-gray-900 truncate pr-4">
                                                            {job.caption || `Feed #${job.jobId.slice(-4)}`}
                                                        </h4>
                                                        {job.status === 'failed' && (
                                                            <button
                                                                onClick={() => removeActiveDownload(job.jobId)}
                                                                className="text-gray-400 hover:text-red-500"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {job.status === 'failed' ? (
                                                        <div className="flex items-center gap-1.5 text-red-500 text-sm">
                                                            <AlertCircle className="w-4 h-4" />
                                                            <span>Upload Failed</span>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>{job.status === 'queued' ? 'In Queue...' : 'Processing...'}</span>
                                                                <span>{job.progress}%</span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${job.progress}%` }}
                                                                    className="h-full bg-blue-600 rounded-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Completed Section */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                                        Recently Completed
                                    </h3>
                                    {completedDownloads.length > 0 && (
                                        <button
                                            onClick={clearCompleted}
                                            className="text-xs text-red-500 hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {completedDownloads.length === 0 && activeList.length === 0 ? (
                                    <div className="text-center py-10">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Download className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <p className="text-gray-500 italic">No recent downloads</p>
                                    </div>
                                ) : (
                                    completedDownloads.map((item, idx) => (
                                        <div
                                            key={`${item.jobId}-${idx}`}
                                            className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center gap-4 group"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0 relative">
                                                {item.thumbnail ? (
                                                    <img src={item.thumbnail} alt="" className="w-full h-full object-cover opacity-80" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                                                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-700 truncate">
                                                    {item.caption || 'Completed Feed'}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                            <a
                                                href={item.downloadUrl}
                                                download
                                                className="p-2 bg-white text-blue-600 rounded-lg shadow-sm border border-gray-100 hover:bg-blue-600 hover:text-white transition-all"
                                                title="Re-download"
                                            >
                                                <ExternalLink className="w-5 h-5" />
                                            </a>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest">
                                Completed downloads are stored for 1 hour on server
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default DownloadMenu;

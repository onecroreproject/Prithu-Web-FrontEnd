import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DownloadContext = createContext();

export const useDownloads = () => {
    const context = useContext(DownloadContext);
    if (!context) {
        throw new Error('useDownloads must be used within a DownloadProvider');
    }
    return context;
};

export const DownloadProvider = ({ children }) => {
    const [activeDownloads, setActiveDownloads] = useState({});
    const [completedDownloads, setCompletedDownloads] = useState(() => {
        const saved = localStorage.getItem('prithu_completed_downloads');
        return saved ? JSON.parse(saved) : [];
    });
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('prithu_completed_downloads', JSON.stringify(completedDownloads));
    }, [completedDownloads]);

    const addDownload = useCallback((jobId, metadata) => {
        setActiveDownloads(prev => ({
            ...prev,
            [jobId]: {
                jobId,
                progress: 0,
                status: 'queued',
                startTime: Date.now(),
                ...metadata
            }
        }));
    }, []);

    const updateProgress = useCallback((jobId, progress, status = 'processing') => {
        setActiveDownloads(prev => {
            if (!prev[jobId]) return prev;
            return {
                ...prev,
                [jobId]: {
                    ...prev[jobId],
                    progress,
                    status
                }
            };
        });
    }, []);

    const markComplete = useCallback((jobId, downloadUrl) => {
        setActiveDownloads(prev => {
            const job = prev[jobId];
            if (!job) return prev;

            const completedItem = {
                ...job,
                progress: 100,
                status: 'completed',
                downloadUrl,
                completedAt: Date.now()
            };

            setCompletedDownloads(current => [completedItem, ...current].slice(0, 20));

            const { [jobId]: _, ...remaining } = prev;
            return remaining;
        });
    }, []);

    const markFailed = useCallback((jobId, error) => {
        setActiveDownloads(prev => {
            if (!prev[jobId]) return prev;

            // We can either keep it in active with a failed status or move to a failed list
            // For now, let's keep it in active so the user can see it failed
            return {
                ...prev,
                [jobId]: {
                    ...prev[jobId],
                    status: 'failed',
                    error
                }
            };
        });
    }, []);

    const removeActiveDownload = useCallback((jobId) => {
        setActiveDownloads(prev => {
            const { [jobId]: _, ...remaining } = prev;
            return remaining;
        });
    }, []);

    const clearCompleted = useCallback(() => {
        setCompletedDownloads([]);
    }, []);

    const toggleMenu = useCallback(() => setIsMenuOpen(prev => !prev), []);

    // Socket Event Listeners (Global Custom Events)
    useEffect(() => {
        const handleProgress = (e) => {
            const { jobId, progress, status } = e.detail;
            updateProgress(jobId, progress, status);
        };

        const handleComplete = (e) => {
            const { jobId, downloadUrl } = e.detail;
            markComplete(jobId, downloadUrl);
        };

        const handleFailed = (e) => {
            const { jobId, error } = e.detail;
            markFailed(jobId, error);
        };

        document.addEventListener('socket:downloadProgress', handleProgress);
        document.addEventListener('socket:downloadComplete', handleComplete);
        document.addEventListener('socket:downloadFailed', handleFailed);

        return () => {
            document.removeEventListener('socket:downloadProgress', handleProgress);
            document.removeEventListener('socket:downloadComplete', handleComplete);
            document.removeEventListener('socket:downloadFailed', handleFailed);
        };
    }, [updateProgress, markComplete, markFailed]);

    const value = {
        activeDownloads,
        completedDownloads,
        isMenuOpen,
        setIsMenuOpen,
        toggleMenu,
        addDownload,
        removeActiveDownload,
        clearCompleted
    };

    return (
        <DownloadContext.Provider value={value}>
            {children}
        </DownloadContext.Provider>
    );
};

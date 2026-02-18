import React, { useEffect, useState } from 'react';

const AutoSlideController = ({ onNext, duration = 8000, isActive }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isActive) {
            setProgress(0);
            return;
        }

        const interval = 100; // Update progress every 100ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    onNext();
                    return 0;
                }
                return prev + step;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [onNext, duration, isActive]);

    return (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10 z-50">
            <div
                className="h-full bg-amber-500 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
};

export default AutoSlideController;

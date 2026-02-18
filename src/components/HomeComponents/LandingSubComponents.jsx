import React, { useState, useEffect, useRef } from 'react';

// Enhanced AnimatedCounter Component with Visibility Check
export const AnimatedCounter = ({ end, duration = 2000, label, icon }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // Stop observing once visible
                }
            },
            { threshold: 0.1 } // Trigger when 10% of the component is visible
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        // Cleanup function
        return () => {
            if (containerRef.current) {
                observer.unobserve(containerRef.current);
            }
            observer.disconnect();
        };
    }, []); // Run once on mount

    useEffect(() => {
        if (!isVisible) {
            // Reset count if not visible yet, or if it becomes invisible (though observer disconnects)
            setCount(0);
            return;
        }

        let startTime;
        let animationFrame;

        const animateCount = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function: easeOutExpo
            const easing = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

            setCount(Math.floor(easing * end));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(animateCount);
            }
        };

        animationFrame = requestAnimationFrame(animateCount);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration, isVisible]); // Rerun animation when end, duration, or visibility changes

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
        return num.toLocaleString() + '+';
    };

    return (
        <div ref={containerRef} className="flex flex-col items-center p-4">
            <div className="text-4xl mb-2">{icon}</div>
            <div className="text-3xl md:text-4xl font-black text-amber-600 mb-1 tabular-nums">
                {formatNumber(count)}
            </div>
            <div className="text-gray-500 font-medium text-center">{label}</div>
        </div>
    );
};

// Animated Icon Component for 2D animations
export const AnimatedIcon = ({ icon, className = "" }) => (
    <span className={`inline-block animate-bounce ${className}`}>
        {icon}
    </span>
);

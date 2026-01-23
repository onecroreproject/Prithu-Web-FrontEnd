import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REACTION_EMOJIS = [
    { emoji: '❤️', label: 'Love', color: '#e74c3c' },
    { emoji: '👍', label: 'Like', color: '#3498db' },
    { emoji: '😂', label: 'Haha', color: '#f39c12' },
    { emoji: '😮', label: 'Wow', color: '#9b59b6' },
    { emoji: '😢', label: 'Sad', color: '#95a5a6' },
    { emoji: '😡', label: 'Angry', color: '#e67e22' },
];

const EmojiReactions = ({ onReactionSelect, currentReaction, isLiked }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [longPressTimer, setLongPressTimer] = useState(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        return () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
            }
        };
    }, [longPressTimer]);

    const handleMouseDown = () => {
        const timer = setTimeout(() => {
            setShowReactions(true);
        }, 500); // 500ms long press
        setLongPressTimer(timer);
    };

    const handleMouseUp = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }

        // If reactions aren't showing, it was a quick click - toggle like
        if (!showReactions) {
            onReactionSelect(isLiked ? null : '❤️');
        }
    };

    const handleMouseLeave = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const handleTouchStart = () => {
        const timer = setTimeout(() => {
            setShowReactions(true);
        }, 500);
        setLongPressTimer(timer);
    };

    const handleTouchEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }

        if (!showReactions) {
            onReactionSelect(isLiked ? null : '❤️');
        }
    };

    const handleReactionClick = (emoji) => {
        onReactionSelect(currentReaction === emoji ? null : emoji);
        setShowReactions(false);
    };

    const handleClickOutside = (e) => {
        if (buttonRef.current && !buttonRef.current.contains(e.target)) {
            setShowReactions(false);
        }
    };

    useEffect(() => {
        if (showReactions) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showReactions]);

    return (
        <div className="relative" ref={buttonRef}>
            {/* Like Button */}
            <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`flex items-center justify-center flex-1 py-2 transition duration-200 ${currentReaction || isLiked ? "text-[#1877F2]" : "text-gray-600 hover:bg-gray-100"
                    }`}
            >
                {currentReaction ? (
                    <span className="text-2xl mr-0 sm:mr-2">{currentReaction}</span>
                ) : isLiked ? (
                    <svg className="w-6 h-6 mr-0 sm:mr-2 fill-current" viewBox="0 0 24 24">
                        <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6 mr-0 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                )}
                <span className="hidden sm:inline text-sm font-bold">
                    {currentReaction ? REACTION_EMOJIS.find(r => r.emoji === currentReaction)?.label : 'Like'}
                </span>
            </button>

            {/* Reactions Popup */}
            <AnimatePresence>
                {showReactions && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.2, type: "spring", stiffness: 300 }}
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white border border-gray-200 rounded-full shadow-lg px-2 py-2 flex gap-1 z-50"
                    >
                        {REACTION_EMOJIS.map((reaction, index) => (
                            <motion.button
                                key={reaction.emoji}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => handleReactionClick(reaction.emoji)}
                                className={`relative group hover:scale-125 transition-transform duration-200 ${currentReaction === reaction.emoji ? 'scale-125' : ''
                                    }`}
                                title={reaction.label}
                            >
                                <span className="text-3xl block">{reaction.emoji}</span>

                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {reaction.label}
                                </div>

                                {/* Selection indicator */}
                                {currentReaction === reaction.emoji && (
                                    <motion.div
                                        layoutId="reaction-indicator"
                                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full"
                                        style={{ backgroundColor: reaction.color }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EmojiReactions;

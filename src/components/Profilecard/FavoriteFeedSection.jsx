import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axios";
import PostcardWrapper from "../FeedPageComponent/postCardWraper";
import { Loader, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

const timeAgoFrom = (iso) => {
    if (!iso) return "Recently posted";
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / (1000 * 60));
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days === 1) return "Yesterday";
    return `${days}d ago`;
};

const FavoriteFeedSection = ({ onBack }) => {
    const { token, user: rawUser } = useContext(AuthContext);
    const user = rawUser ? { ...rawUser, _id: rawUser._id || rawUser.userId, userId: rawUser.userId || rawUser._id } : null;
    const [feeds, setFeeds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideoId, setActiveVideoId] = useState(null);

    const normalizeSingleFeed = useCallback((raw) => {
        if (!raw) return null;

        const creator = raw.creatorData || raw.creatorInfo || raw.creator || raw.postedBy || {};
        const feedId = raw._id || raw.feedId;

        const isTemplate = raw.uploadMode === "template" || raw.uploadType === "template";
        const designMetadata = raw.designMetadata || {};
        const overlayElements = designMetadata.overlayElements || [];
        const footerSrc = designMetadata.footerConfig || {};
        const editMetadata = designMetadata.editMetadata || raw.editMetadata || {};

        const postAspectRatio =
            editMetadata?.crop?.ratio ||
            designMetadata?.canvasSettings?.aspectRatio ||
            raw.aspectRatio ||
            "9:16";

        return {
            ...raw,
            feedId,
            type: raw.type || raw.postType || "image",
            contentUrl: raw.contentUrl || raw.mediaUrl || (raw.files?.[0]?.url) || "",
            caption: raw.caption || raw.dec || "",
            timeAgo: timeAgoFrom(raw.likedAt || raw.createdAt),
            postedBy: {
                id: creator._id || creator.id || raw.createdByAccount || null,
                name: creator.userName || creator.name || creator.displayName || "Unknown",
                avatar: creator.profileAvatar || creator.avatar || defaultAvatar,
                modifyAvatar: creator.modifyAvatar || null,
                role: creator.role || raw.roleRef || "User",
            },
            overlayElements,
            editMetadata,
            hasFooter: Boolean(footerSrc.enabled || footerSrc.visible || raw.hasFooter),
            uploadMode: isTemplate ? "template" : "normal",
            aspectRatio: postAspectRatio,
            stats: {
                likes: raw.stats?.likes || raw.likesCount || 0,
                shares: raw.stats?.shares || raw.shareCount || 0,
                downloads: raw.stats?.downloads || raw.downloadCount || 0,
                comments: raw.stats?.comments || raw.commentsCount || 0,
            },
            userInteractions: {
                isLiked: true, // It's from liked feeds
                isSaved: raw.userInteractions?.isSaved || raw.isSaved || false,
                isFollowing: raw.userInteractions?.isFollowing || raw.isFollowing || false,
            },
        };
    }, []);

    useEffect(() => {
        const fetchLikedFeeds = async () => {
            try {
                const res = await api.get("/api/user/feed/liked");
                // The backend returns success: true and feeds array
                if (res.data && res.data.feeds) {
                    const normalized = res.data.feeds.slice(0, 10).map(normalizeSingleFeed).filter(Boolean);
                    setFeeds(normalized);
                } else if (Array.isArray(res.data)) {
                    // Fallback in case it returns raw array
                    const normalized = res.data.slice(0, 10).map(normalizeSingleFeed).filter(Boolean);
                    setFeeds(normalized);
                }
            } catch (err) {
                console.error("Error fetching liked feeds:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLikedFeeds();
    }, [normalizeSingleFeed]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading your favorites...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent pb-20">
            {/* Header with Back Button */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                <h2 className="text-lg font-bold text-gray-800">Favorite Feeds</h2>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-all font-semibold text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Activity
                </button>
            </div>

            <div className="max-w-[470px] mx-auto mt-6">
                <AnimatePresence>
                    {feeds.length > 0 ? (
                        feeds.map((feed, index) => (
                            <motion.div
                                key={feed.feedId || index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <PostcardWrapper
                                    postData={feed}
                                    authUser={user}
                                    token={token}
                                    activeVideoId={activeVideoId}
                                    setActiveVideoId={setActiveVideoId}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 px-6"
                        >
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 grayscale">
                                ❤️
                            </div>
                            <p className="text-xl font-bold text-gray-800 mb-2">No Favorites Yet</p>
                            <p className="text-gray-500">Go like some amazing feeds to see them here!</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {feeds.length > 0 && (
                    <div className="text-center py-10">
                        <p className="text-sm text-gray-400 font-medium">✨ That's all for now ✨</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FavoriteFeedSection;

// src/components/ActivitySection.jsx
import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import UserUploads from "./ActivitySectionComponents/userPost";
import { Heart, Calendar, Play, Image, Loader, Eye, EyeOff, Ban, Tag } from "lucide-react";

export default function ActivitySection({ id }) {
  const [activeSubTab, setActiveSubTab] = useState("personal");

  const subTabs = id
    ? [
        { id: "personal", label: "Post" },   // only visible tab
      ]
    : [
        { id: "personal", label: "Post" },
        { id: "favourites", label: "Favourites" },
        { id: "hidden", label: "Hidden" },
        { id: "notInterested", label: "Not Interested" },
      ];
  const renderContent = () => {
    switch (activeSubTab) {
      case "personal":
        return <UserUploads id={id} />;
      case "favourites":
        return <FavouritesTab id={id} />;
      case "hidden":
        return <HiddenTab id={id} />;
      case "notInterested":
        return <NotInterestedTab id={id} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Sub-Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-200 scrollbar-hide">
        <div className="flex min-w-full px-2 sm:px-4">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-3 text-xs sm:text-sm font-medium capitalize transition-all duration-200 whitespace-nowrap
                ${activeSubTab === tab.id
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-600 hover:text-blue-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="p-4 sm:p-6">{renderContent()}</div>
    </div>
  );
}

/* -------------------------------------------------- */
/* 🌟 2. Favourites Tab (Loads saved feeds)           */
/* -------------------------------------------------- */

function FavouritesTab({id}) {
  const [savedFeeds, setSavedFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // ❌ Other user → Do not show favorites
  if (id) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
            <Heart className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Private Favourites
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Favourites are personal and only visible to the account owner. 
            This user's saved content is kept private.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Fetch saved feeds only for own account
  useEffect(() => {
    const fetchSavedFeeds = async () => {
      try {
        const res = await api.get("/api/user/get/saved/feeds");
        setSavedFeeds(res.data.savedFeeds || []);
      } catch (err) {
        console.error("Error fetching saved feeds:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedFeeds();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="w-12 h-12 bg-blue-50 rounded-full absolute -inset-2 animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-500 text-sm mt-4 font-medium">Loading your favourites...</p>
        </div>
      </div>
    );
  }

  if (savedFeeds.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl flex items-center justify-center shadow-sm">
            <div className="relative">
              <Heart className="w-10 h-10 text-yellow-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No favourites yet
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            When you find posts you love, tap the heart icon to save them here for easy access later.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Look for the heart icon on posts
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Tap to save to your favourites
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Favourites</h2>
            <p className="text-gray-600 text-sm mt-1">
              {savedFeeds.length} saved item{savedFeeds.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-gray-800">{savedFeeds.length}</div>
                <div className="text-gray-500 text-xs">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="font-bold text-gray-800">
                  {savedFeeds.filter(feed => feed.type === 'image').length}
                </div>
                <div className="text-gray-500 text-xs">Photos</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="font-bold text-gray-800">
                  {savedFeeds.filter(feed => feed.type === 'video').length}
                </div>
                <div className="text-gray-500 text-xs">Videos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {savedFeeds.map((feed) => (
          <div
            key={feed._id}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
          >
            {/* Media Container */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
              {feed.type === "image" ? (
                <img
                  src={feed.contentUrl}
                  alt="Saved content"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={feed.contentUrl}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-gray-800 ml-1" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Media Type Badge */}
              <div className="absolute top-3 left-3">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  feed.type === 'image' 
                    ? 'bg-blue-500/90 text-white' 
                    : 'bg-purple-500/90 text-white'
                }`}>
                  {feed.type === 'image' ? (
                    <Image className="w-3 h-3" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {feed.type}
                </div>
              </div>

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-end">
                <div className="w-full p-4 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-sm">
                        <Heart className="w-4 h-4 fill-current" />
                        <span>{feed.likeCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(feed.savedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Saved {formatDate(feed.savedAt)}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                  <span>{feed.likeCount || 0}</span>
                </div>
              </div>
              
              {feed.caption && (
                <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                  {feed.caption}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* 🌟 3. Hidden Tab (User hidden content)             */
/* -------------------------------------------------- */

function HiddenTab({ id }) {
  const [hiddenPosts, setHiddenPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ❌ Other user → Do not show hidden content
  if (id) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center">
            <EyeOff className="w-8 h-8 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Private Hidden Content
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Hidden content is personal and only visible to the account owner. 
            This user's hidden content is kept private.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Fetch hidden posts only for own account
  useEffect(() => {
    const fetchHiddenPosts = async () => {
      try {
        const res = await api.get("/api/get/hidden-posts");
        setHiddenPosts(res.data.hidden || []);
      } catch (err) {
        console.error("Error fetching hidden posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHiddenPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="w-12 h-12 bg-blue-50 rounded-full absolute -inset-2 animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-500 text-sm mt-4 font-medium">Loading hidden content...</p>
        </div>
      </div>
    );
  }

  if (hiddenPosts.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl flex items-center justify-center shadow-sm">
            <div className="relative">
              <EyeOff className="w-10 h-10 text-gray-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No hidden content
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            When you hide posts, they will appear here. You can unhide them anytime to see them in your feed again.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Use the hide option on posts you want to temporarily remove
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Hidden content stays private and only you can see it
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleUnhide = async (postId) => {
    try {
      await api.post("/api/remove/hidden-post", { postId });
      setHiddenPosts(hiddenPosts.filter(post => post.postId !== postId));
    } catch (err) {
      console.error("Error unhiding post:", err);
    }
  };

  // Helper function to get media type and URL
  const getMediaInfo = (feed) => {
    if (!feed) return { type: 'unknown', url: '' };
    
    // Check for contentUrl or media field in feed
    if (feed.contentUrl) {
      const url = feed.contentUrl.toLowerCase();
      return {
        type: url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') ? 'video' : 'image',
        url: feed.contentUrl
      };
    }
    
    return { type: 'unknown', url: '' };
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hidden Content</h2>
            <p className="text-gray-600 text-sm mt-1">
              {hiddenPosts.length} hidden item{hiddenPosts.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-gray-800">{hiddenPosts.length}</div>
                <div className="text-gray-500 text-xs">Total</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="font-bold text-gray-800">
                  {hiddenPosts.filter(post => {
                    const media = getMediaInfo(post.feed);
                    return media.type === 'image';
                  }).length}
                </div>
                <div className="text-gray-500 text-xs">Photos</div>
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="text-center">
                <div className="font-bold text-gray-800">
                  {hiddenPosts.filter(post => {
                    const media = getMediaInfo(post.feed);
                    return media.type === 'video';
                  }).length}
                </div>
                <div className="text-gray-500 text-xs">Videos</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {hiddenPosts.map((hidden) => {
          const media = getMediaInfo(hidden.feed);
          const feed = hidden.feed || {};
          
          return (
            <div
              key={hidden.hiddenId}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
            >
              {/* Media Container */}
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {media.type === "image" ? (
                  <img
                    src={media.url}
                    alt="Hidden content"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : media.type === "video" ? (
                  <div className="relative w-full h-full">
                    <video
                      src={media.url}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Play className="w-5 h-5 text-gray-800 ml-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Image className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                {/* Hidden Badge */}
                <div className="absolute top-3 left-3">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-500/90 text-white">
                    <EyeOff className="w-3 h-3" />
                    Hidden
                  </div>
                </div>

                {/* Overlay with Unhide Button */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <button
                    onClick={() => handleUnhide(hidden.postId)}
                    className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg"
                  >
                    <Eye className="w-4 h-4" />
                    Unhide
                  </button>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Hidden {formatDate(hidden.hiddenAt)}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Heart className="w-3 h-3" />
                    <span>{feed.statsId?.likes || 0}</span>
                  </div>
                </div>
                
                {feed.caption && (
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                    {feed.caption}
                  </p>
                )}
                
                {feed.category && (
                  <div className="mt-2 flex items-center gap-1">
                    <Tag className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">{feed.category.name}</span>
                  </div>
                )}
                
                {hidden.reason && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">Reason: </span>
                    <span className="text-xs text-gray-700">{hidden.reason}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------- */
/* 🌟 4. Not Interested Tab (User dismissed content)  */
/* -------------------------------------------------- */

function NotInterestedTab({ id }) {
  const [nonInterestedCategories, setNonInterestedCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ❌ Other user → Do not show not interested content
  if (id) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center">
            <Ban className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Private Preferences
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Not interested preferences are personal and only visible to the account owner. 
            This user's content preferences are kept private.
          </p>
        </div>
      </div>
    );
  }

  // ✅ Fetch not interested categories only for own account
  useEffect(() => {
    const fetchNonInterestedCategories = async () => {
      try {
        const res = await api.get("/api/get/non-interested-categories");
        setNonInterestedCategories(res.data.nonInterestedCategories || []);
      } catch (err) {
        console.error("Error fetching non-interested categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNonInterestedCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="w-12 h-12 bg-blue-50 rounded-full absolute -inset-2 animate-ping opacity-20"></div>
          </div>
          <p className="text-gray-500 text-sm mt-4 font-medium">Loading not interested categories...</p>
        </div>
      </div>
    );
  }

  if (nonInterestedCategories.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl flex items-center justify-center shadow-sm">
            <div className="relative">
              <Ban className="w-10 h-10 text-red-400" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full border-2 border-white"></div>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            No not interested categories
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            When you mark categories as "Not Interested", they will appear here. This helps us improve your feed recommendations.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <p className="text-xs text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Use "Not Interested" to see less of certain content types
            </p>
            <p className="text-xs text-gray-600 flex items-center gap-2 mt-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              This helps personalize your feed experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleRemoveCategory = async (categoryId) => {
    try {
      await api.post("/api/remove/non-interested-category", { categoryId });
      setNonInterestedCategories(nonInterestedCategories.filter(cat => cat._id !== categoryId));
    } catch (err) {
      console.error("Error removing category from not interested:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Not Interested Categories</h2>
            <p className="text-gray-600 text-sm mt-1">
              {nonInterestedCategories.length} categor{nonInterestedCategories.length !== 1 ? 'ies' : 'y'} marked not interested
            </p>
          </div>
          <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
            <div className="text-center">
              <div className="font-bold text-gray-800">{nonInterestedCategories.length}</div>
              <div className="text-gray-500 text-xs">Total Categories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {nonInterestedCategories.map((category) => (
          <div
            key={category._id}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200"
          >
            {/* Category Icon Container */}
            <div className="relative aspect-square bg-gradient-to-br from-red-50 to-orange-50 overflow-hidden flex items-center justify-center">
              <div className="text-center p-6">
                {category.icon ? (
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                ) : (
                  <div className="w-16 h-16 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                    <Tag className="w-8 h-8 text-red-400" />
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {category.name}
                </h3>
                
                {category.slug && (
                  <p className="text-sm text-gray-500 mb-4">
                    {category.slug}
                  </p>
                )}
              </div>
              
              {/* Not Interested Badge */}
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-500/90 text-white">
                  <Ban className="w-3 h-3" />
                  Not Interested
                </div>
              </div>

              {/* Overlay with Remove Button */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => handleRemoveCategory(category._id)}
                  className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 shadow-lg"
                >
                  <Eye className="w-4 h-4" />
                  Show Again
                </button>
              </div>
            </div>

            {/* Category Info */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Category
                </span>
                <button
                  onClick={() => handleRemoveCategory(category._id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
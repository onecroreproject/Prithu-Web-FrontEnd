import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Search, Copy, Check, Share2, Filter, RefreshCw, X, Eye, Info, HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";
import SEO from "../components/SEO";
import api from "../api/axios";
import { INITIAL_PROMPTS, CATEGORIES_LIST } from "../constance/promptsData";
import { Link } from "react-router-dom";
import PrithuLogo from "../assets/prithu_logo.webp";

export default function AIPromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [aspectRatioFilter, setAspectRatioFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);
  const [activePromptDetail, setActivePromptDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch prompts from actual MongoDB database backend API
  const loadPromptsFromApi = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await api.get("/api/prompts");
      if (data && data.success && Array.isArray(data.data)) {
        const mapped = data.data.map(p => ({
          ...p,
          id: p._id || p.id
        }));
        setPrompts(mapped);
      } else {
        setPrompts(INITIAL_PROMPTS);
      }
    } catch (err) {
      console.error("Error fetching prompts from server:", err);
      // Fallback to local INITIAL_PROMPTS if backend is offline
      setPrompts(INITIAL_PROMPTS);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadPromptsFromApi(true);
    
    // Periodically sync with DB in case of CRUD changes in the Admin Panel
    const interval = setInterval(() => {
      loadPromptsFromApi(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle Copy Prompt
  const handleCopy = (id, promptText) => {
    navigator.clipboard.writeText(promptText);
    setCopiedId(id);
    toast.success("Prompt copied to clipboard! 📋", {
      icon: "✨",
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
      },
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Share Prompt
  const handleShare = (prompt) => {
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: `Check out this amazing AI prompt: "${prompt.prompt}"`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/home/prompts?id=${prompt.id}`);
      toast.success("Share link copied! 🔗");
    }
  };

  // Filter prompts
  const filteredPrompts = prompts.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch = 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesAspect = aspectRatioFilter === "All" || p.aspectRatio === aspectRatioFilter;
    
    return matchesCategory && matchesSearch && matchesAspect;
  });

  // Calculate counts per category
  const getCategoryCount = (cat) => {
    if (cat === "All") return prompts.length;
    return prompts.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length;
  };

  return (
    <div className="min-h-screen pb-16 pt-4 px-3 sm:px-6">
      <SEO 
        title="CreativeAI Photo Prompts - Prithu"
        description="Discover premium AI image prompts for Halloween, Couples, Anniversaries, Festivals, and more. Copy, edit, and create gorgeous art."
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 mb-6 bg-white/30 dark:bg-gray-800/10 px-3.5 py-1.5 rounded-xl border border-gray-200/40 dark:border-gray-700/40 backdrop-blur-xs w-fit">
        <Link to="/home" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          Home
        </Link>
        <span className="text-gray-300 dark:text-gray-700 font-normal">&gt;</span>
        <span className="text-gray-800 dark:text-gray-200 font-bold">Prompts</span>
      </nav>

      {/* Title Header */}
      <header className="mb-8 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <img src={PrithuLogo} alt="Prithu Logo" className="w-8 h-8 object-contain rounded-lg shadow-sm" />
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Prithu <span className="bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">Creative</span>
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xl">
            Select a category, browse beautiful image cards, hover to instantly copy prompt strings, and generate premium AI art.
          </p>
        </div>

        {/* Top Controls: Aspect Ratio Filter & Reset */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-200/60 dark:border-gray-700/50">
            <span className="text-xs text-gray-400 px-2 font-medium">Aspect:</span>
            {["All", "1:1", "9:16", "16:9"].map((aspect) => (
              <button
                key={aspect}
                onClick={() => setAspectRatioFilter(aspect)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  aspectRatioFilter === aspect
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50"
                }`}
              >
                {aspect}
              </button>
            ))}
          </div>
          
          {(selectedCategory !== "All" || searchQuery !== "" || aspectRatioFilter !== "All") && (
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSearchQuery("");
                setAspectRatioFilter("All");
              }}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600 shadow-sm border border-gray-200/60 dark:border-gray-700/50 transition-colors"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Layout Area */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Left Category Sidebar */}
        <aside className="w-full lg:w-[260px] shrink-0 lg:sticky lg:top-6 z-30 bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-200/60 dark:border-gray-700/50">
          <div className="flex items-center gap-2 mb-4 px-1.5 pb-3 border-b border-gray-100 dark:border-gray-700">
            <Filter className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Categories</h2>
          </div>
          
          {/* Categories Buttons Vertical Stack */}
          <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none">
            {["All", ...CATEGORIES_LIST].map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all shrink-0 lg:shrink text-left ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-indigo-100/50 dark:from-indigo-900/30 dark:to-indigo-950/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 shadow-xs"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}>
                    {getCategoryCount(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right Prompts Section */}
        <section className="flex-1 w-full">
          {/* Search bar inside content */}
          <div className="relative mb-6 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts, tags, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200/80 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-red-500 text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Cards Grid */}
          {filteredPrompts.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No prompts found</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">
                We couldn't find any prompts matching your search parameters. Try resetting filters.
              </p>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredPrompts.map((prompt) => (
                  <motion.div
                    layout
                    key={prompt.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    transition={{ duration: 0.3 }}
                    className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col relative h-[360px]"
                  >
                    {/* Aspect ratio badge */}
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-xs">
                      {prompt.aspectRatio}
                    </span>

                    {/* Image Card Container */}
                    <div className="relative flex-1 w-full h-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <img
                        src={prompt.imageUrl}
                        alt={prompt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />

                      {/* HOVER SLIDEOVER DETAILS */}
                      <div className="absolute inset-0 bg-black/75 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col p-5 justify-between text-white z-20">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] bg-indigo-600 text-white px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                              {prompt.category}
                            </span>
                            <span className="text-gray-400 text-[10px] font-medium font-mono">
                              Ratio: {prompt.aspectRatio}
                            </span>
                          </div>
                          
                          <h3 className="text-sm font-extrabold line-clamp-1 mb-2 tracking-tight text-indigo-300">
                            {prompt.title}
                          </h3>
                          
                          <p className="text-xs text-gray-200 leading-relaxed line-clamp-6 font-medium font-mono select-none">
                            {prompt.prompt}
                          </p>
                        </div>

                        {/* Interactive Hover Actions */}
                        <div className="flex gap-2 items-center mt-4">
                          <button
                            onClick={() => handleCopy(prompt.id, prompt.prompt)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-md shadow-indigo-600/20"
                          >
                            {copiedId === prompt.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy Prompt
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => handleShare(prompt)}
                            className="p-2.5 rounded-xl hover:bg-gray-700/40 text-gray-300 hover:text-white transition-all bg-gray-800"
                            title="Share Prompt"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setActivePromptDetail(prompt)}
                            className="p-2.5 rounded-xl hover:bg-indigo-950/40 text-indigo-400 hover:text-indigo-300 transition-all bg-gray-800"
                            title="View Full Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer (Visible when not hovered) */}
                    <div className="p-3.5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between shrink-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 line-clamp-1 mb-0.5">
                          {prompt.title}
                        </h4>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">
                          {prompt.category}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => setActivePromptDetail(prompt)}
                        className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all ml-2"
                        title="Quick View"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>

      {/* DETAILS VIEW MODAL */}
      <AnimatePresence>
        {activePromptDetail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setActivePromptDetail(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col md:flex-row relative max-h-[90vh] md:max-h-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePromptDetail(null)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Left Image */}
              <div className="w-full md:w-[45%] h-[280px] md:h-[500px] relative bg-gray-900">
                <img
                  src={activePromptDetail.imageUrl}
                  alt={activePromptDetail.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-4 left-4 bg-black/60 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                  Ratio: {activePromptDetail.aspectRatio}
                </span>
              </div>

              {/* Modal Right Content */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[calc(90vh-280px)] md:max-h-none">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] bg-indigo-600 text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {activePromptDetail.category}
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-none">
                    {activePromptDetail.title}
                  </h2>

                  {/* Prompt Text Block */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prompt Code
                      </span>
                      <button
                        onClick={() => handleCopy(activePromptDetail.id, activePromptDetail.prompt)}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold flex items-center gap-1"
                      >
                        {copiedId === activePromptDetail.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 select-text leading-relaxed break-words whitespace-pre-wrap">
                      {activePromptDetail.prompt}
                    </div>
                  </div>

                  {/* Tag List */}
                  {activePromptDetail.tags && (
                    <div className="mb-6">
                      <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {activePromptDetail.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-lg font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Creator Info Box */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-950/20 flex gap-3 items-start text-xs text-indigo-700 dark:text-indigo-400">
                    <Info className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold">Usage Tip:</span> Copy this prompt into image generators like <span className="font-bold">Bing Image Creator</span>, <span className="font-bold">Midjourney</span>, or <span className="font-bold">DALL-E 3</span>. You can modify names, outfit colors, and background scenery to personalize the generated art!
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => handleCopy(activePromptDetail.id, activePromptDetail.prompt)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-md shadow-indigo-600/10 transition-all"
                  >
                    {copiedId === activePromptDetail.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied successfully
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Prompt
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleShare(activePromptDetail)}
                    className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

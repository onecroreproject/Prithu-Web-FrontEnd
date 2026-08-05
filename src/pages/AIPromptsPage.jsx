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
import { useAuth } from "../context/AuthContext";
import TryInPrithuModal from "../components/Wallet/TryInPrithuModal";
import { useDownloads } from "../context/DownloadContext";

export default function AIPromptsPage() {
  const { token } = useAuth();
  const [prompts, setPrompts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [aspectRatioFilter, setAspectRatioFilter] = useState("All");
  const [copiedId, setCopiedId] = useState(null);
  const [activePromptDetail, setActivePromptDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [unlockedPrompts, setUnlockedPrompts] = useState(new Set());
  const [showTryModal, setShowTryModal] = useState(false);
  const [generatedImages, setGeneratedImages] = useState([]);
  const { setIsDownloadPopUpOpen } = useDownloads();
  
  // Fetch Wallet & Unlocks
  const loadPromptsFromApi = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    let loadedPrompts = [];
    try {
      const { data } = await api.get("/api/prompts");
      if (data && data.success && Array.isArray(data.data)) {
        loadedPrompts = data.data.map(p => ({
          ...p,
          id: p._id || p.id
        }));
      } else {
        loadedPrompts = INITIAL_PROMPTS.map((p, idx) => ({ ...p, id: p.id || `fallback-${idx}` }));
      }
    } catch (err) {
      console.error("Error fetching prompts from server:", err);
      // Fallback to local INITIAL_PROMPTS if backend is offline
      loadedPrompts = INITIAL_PROMPTS.map((p, idx) => ({ ...p, id: p.id || `fallback-${idx}` }));
    } finally {
      setPrompts(loadedPrompts);
      if (showLoading) setLoading(false);
      
      // Auto-select prompt if id query param exists on initial load
      if (showLoading) {
        const queryParams = new URLSearchParams(window.location.search);
        const promptId = queryParams.get("id");
        if (promptId) {
          const found = loadedPrompts.find(p => p.id === promptId);
          if (found) {
            setActivePromptDetail(found);
          }
        }
      }
    }
  };

  useEffect(() => {
    loadPromptsFromApi(true);
    if (token) {
      fetchWalletAndUnlocks();
    }
    
    // Periodically sync with DB in case of CRUD changes in the Admin Panel
    const interval = setInterval(() => {
      loadPromptsFromApi(false);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [token]);

  const fetchWalletAndUnlocks = async () => {
    try {
      const [walletRes, unlocksRes] = await Promise.all([
        api.get("/api/wallet/balance", { headers: { Authorization: `Bearer ${token}` } }),
        api.get("/api/wallet/unlocks", { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (walletRes.data.success) setWalletBalance(walletRes.data.wallet.balance);
      if (unlocksRes.data.success) {
        const unlockIds = new Set(unlocksRes.data.unlocks.map(u => u.promptId?._id || u.promptId));
        setUnlockedPrompts(unlockIds);
      }
    } catch (err) {
      console.error("Error fetching wallet data", err);
    }
  };

  const handleUnlock = async (promptId, cost) => {
    if (!token) return toast.error("Please login first");
    if (walletBalance < cost) return toast.error("Insufficient credits. Please buy more from your wallet.");
    
    try {
      const res = await api.post("/api/wallet/unlock", { promptId }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) {
        setWalletBalance(res.data.wallet.balance);
        setUnlockedPrompts(prev => new Set(prev).add(promptId));
        toast.success("Prompt unlocked successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to unlock prompt");
    }
  };

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
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${prompt.id}`;
    if (navigator.share) {
      navigator.share({
        title: prompt.title,
        text: `Check out this amazing AI prompt: "${prompt.prompt}"`,
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
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
        <Link to={token ? "/home" : "/"} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
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
          {!token && (
            <Link
              to="/login?redirect=/home/prompts"
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 mr-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </Link>
          )}
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
        <aside className="w-full lg:w-[260px] shrink-0 sticky top-4 lg:top-6 self-start z-30 bg-white dark:bg-gray-800/90 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-gray-200/60 dark:border-gray-700/50">
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
                    className={`group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-200/60 dark:border-gray-700/60 hover:border-indigo-500/30 dark:hover:border-indigo-500/30 transition-all duration-300 flex flex-col relative ${
                      aspectRatioFilter === "All" ? "h-[360px]" : "h-full"
                    }`}
                  >
                    {/* Aspect ratio badge */}
                    <span className="absolute top-3 left-3 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded-full z-10 backdrop-blur-xs">
                      {prompt.aspectRatio}
                    </span>

                    {/* Image Card Container */}
                    <div className={`relative w-full overflow-hidden bg-gray-100 dark:bg-gray-900 ${
                      aspectRatioFilter === "All" 
                        ? "flex-1 h-full" 
                        : prompt.aspectRatio === "9:16" ? "aspect-[9/16]" 
                        : prompt.aspectRatio === "16:9" ? "aspect-video" 
                        : "aspect-square"
                    }`}>
                      <img
                        src={prompt.imageUrl}
                        alt={prompt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    </div>

                    {/* Card Footer */}
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
                        onClick={(e) => { e.stopPropagation(); setIsDownloadPopUpOpen(true); }}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all active:scale-95 shadow-sm shadow-indigo-600/10 ml-2 whitespace-nowrap"
                      >
                        Show Prompt
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
              className="bg-white dark:bg-gray-900 rounded-3xl overflow-hidden max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-gray-800 relative max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setActivePromptDetail(null)}
                className="absolute top-5 right-5 z-50 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] bg-indigo-600 text-white px-3 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {activePromptDetail.category}
                    </span>
                    <span className="text-gray-400 text-[10px] font-medium font-mono">
                      Ratio: {activePromptDetail.aspectRatio}
                    </span>
                  </div>

                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-tight pr-10">
                    {activePromptDetail.title}
                  </h2>

                  {/* Prompt Text Block */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Prompt Code
                      </span>
                      {unlockedPrompts.has(activePromptDetail.id) && (
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
                      )}
                    </div>
                    
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 text-sm font-mono text-gray-700 dark:text-gray-200 border border-gray-200/50 dark:border-gray-700/50 select-text leading-relaxed break-words whitespace-pre-wrap">
                      {unlockedPrompts.has(activePromptDetail.id) ? (
                        activePromptDetail.prompt
                      ) : (
                        <span className="blur-sm select-none">
                          This is a premium prompt. Please unlock this prompt using your credits to reveal the exact generation text, parameters, and negative prompts used to create this masterpiece.
                        </span>
                      )}
                    </div>
                    
                    {!unlockedPrompts.has(activePromptDetail.id) && (
                      <div className="mt-4 flex flex-col items-center p-4 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                        <p className="text-sm text-indigo-800 dark:text-indigo-300 mb-3 text-center">Choose to unlock the text or generate directly in Prithu.</p>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setIsDownloadPopUpOpen(true); }}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Show Prompt ({(activePromptDetail.unlockCredits || 3)} CR)
                          </button>
                          <button
                            onClick={() => setShowTryModal(true)}
                            className="flex-1 sm:flex-none px-6 py-2.5 bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl shadow-md border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Try In Prithu
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">Your Balance: <span className={walletBalance >= (activePromptDetail.unlockCredits || 3) ? 'text-green-500' : 'text-red-500'}>{walletBalance} CR</span></p>
                      </div>
                    )}
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
                {unlockedPrompts.has(activePromptDetail.id) && (
                  <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => setShowTryModal(true)}
                      className="w-full py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Try In Prithu
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopy(activePromptDetail.id, activePromptDetail.prompt)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-all"
                      >
                        {copiedId === activePromptDetail.id ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => handleShare(activePromptDetail)}
                        className="px-6 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors flex items-center justify-center"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Show generated images inline if they exist */}
                    {generatedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2 p-4 bg-gray-800 rounded-xl">
                        {generatedImages.map((img, i) => (
                          <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-gray-600">
                            <img src={img} className="w-full h-full object-cover" alt="Gen" />
                            <a href={img} download target="_blank" className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 text-white text-xs font-bold transition-all">DL</a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Try In Prithu Modal */}
      <TryInPrithuModal 
        isOpen={showTryModal} 
        onClose={() => setShowTryModal(false)} 
        promptDetail={activePromptDetail}
        walletBalance={walletBalance}
        onSuccess={(newBalance, images) => {
          setWalletBalance(newBalance);
          setGeneratedImages(images);
        }}
      />
    </div>
  );
}

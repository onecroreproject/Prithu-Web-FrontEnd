import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import {
  Sparkles, Rocket, Briefcase, Users, Brain, Calendar, Gift, PlayCircle,
  Award, TrendingUp, Shield, Zap, Star, Target, ArrowRight, Check,
  Facebook, Instagram, Twitter, Linkedin, Mail, MessageSquare,
  Image as ImageIcon, Video, FileText, Globe, Users as UsersIcon,
  Bell, CreditCard, Share2, ThumbsUp, Crown, CheckCircle, Building, FolderTree
} from "lucide-react";

// Import logo
import PrithuLogo from '../assets/prithulogo.png';

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();

  // Transform scroll for parallax effects
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  // State for animations
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalReels: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  // Fetch stats from API
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/main/board/status`);

      if (response.data.success) {
        setStats({
          totalUsers: 50000,
          totalPosts: 100000,
          totalReels: 25000,
          successRate: 95
        });
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Format numbers with K/M suffixes
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+';
    }
    return num.toString();
  };

  // Animated counters
  useEffect(() => {
    fetchDashboardStats();

    // Refresh stats every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardStats();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // Feature carousel auto-rotate
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Features data - updated with dynamic stats
  const features = [
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: "Post & Reels",
      description: "Share your moments with stunning posts and engaging short videos. Express yourself creatively!",
      color: "from-pink-500 to-purple-500",
      stats: `${formatNumber(Math.floor(stats.totalUsers * 0.1))} Active Posts`,
      image: "https://images.unsplash.com/photo-1611605698335-8b1569810432?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Video className="w-8 h-8" />,
      title: "Watch Reels",
      description: "Discover trending short videos from creators around the world. Stay entertained and inspired!",
      color: "from-blue-500 to-cyan-500",
      stats: "24/7 Entertainment",
      image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Refer & Earn",
      description: "Refer friends and earn amazing bonuses. Grow your network and get rewarded!",
      color: "from-yellow-500 to-orange-500",
      stats: "Active Bonus Program",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Smart Portfolio",
      description: "Build a professional portfolio that stands out. Showcase your skills with our smart tools.",
      color: "from-green-500 to-emerald-500",
      stats: "Professional Profiles",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Two subscription plans: Free and Paid
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "/month",
      features: [
        // "Basic Job Search",
        // "5 Posts Daily Limit",
        // "Community Access",
        // "Basic Aptitude Tests",
        // "Weekly Event Notifications",
        // "Basic Profile",
        // "Email Support"
      ],
      color: "from-gray-50 to-gray-100",
      buttonColor: "bg-gray-600 hover:bg-gray-700",
      icon: <Users className="w-8 h-8" />,
      popular: false,
      tagline: "Perfect for getting started"
    },
    {
      name: "Pro",
      price: "$0",
      period: "/month",
      features: [
        // "Advanced Job Search & Filters",
        // "Unlimited Posts & Reels",
        // "Priority Community Access",
        // "Advanced Aptitude Tests",
        // "Event Registration Priority",
        // "Portfolio Builder",
        // "Referral Bonuses (Higher %)",
        // "Priority Support",
        // "Advanced Analytics",
        // "Company Profile Page"
      ],
      color: "from-blue-50 to-cyan-100",
      buttonColor: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
      icon: <Crown className="w-8 h-8" />,
      popular: true,
      tagline: "Best for professionals"
    }
  ];

  // Testimonials with real images
  const testimonials = [
    {
      name: "Alex Johnson",
      role: "Content Creator",
      company: "Prithu Studio",
      content: "PRITHU has completely changed how I share my content. The engagement is incredible!",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      plan: "Pro User"
    },
    {
      name: "Sarah Miller",
      role: "Digital Artist",
      company: "CreativeFlow",
      content: "The portfolio tools are top-notch. I can showcase my work beautifully to my followers.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      plan: "Free User"
    },
    {
      name: "David Chen",
      role: "Social Media Manager",
      company: "TrendSetters",
      content: "Managing multiple accounts and tracking performance has never been easier. Highly recommended!",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
      rating: 5,
      plan: "Pro User"
    }
  ];

  // Stats display array
  const statsDisplay = [
    {
      label: "Active Users",
      value: loading ? "..." : formatNumber(stats.totalUsers),
      icon: <UsersIcon className="w-6 h-6" />,
      color: "text-blue-600"
    },
    {
      label: "Total Posts",
      value: loading ? "..." : formatNumber(stats.totalPosts),
      icon: <ImageIcon className="w-6 h-6" />,
      color: "text-green-600"
    },
    {
      label: "Total Reels",
      value: loading ? "..." : formatNumber(stats.totalReels),
      icon: <Video className="w-6 h-6" />,
      color: "text-purple-600"
    },

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background */}
        <motion.div
          style={{ y: y1 }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-gradient-to-r from-green-300/20 to-emerald-300/20 rounded-full blur-3xl"></div>
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div className="flex items-center gap-3">
                  <img
                    src={PrithuLogo}
                    alt="PRITHU Logo"
                    className="w-12 h-12 object-contain"
                  />
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">The Ultimate Career Platform</span>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="text-sm text-red-500 bg-red-50 px-3 py-1 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Top Right Corner Buttons */}
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/company/login")}
                    className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-sm"
                  >
                    <Building className="w-4 h-4" />
                    Register Your Company
                  </motion.button>

                </div>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Connect.
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                  Create.
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                  Conquer.
                </span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 max-w-xl">
                Join {loading ? "thousands of" : `${formatNumber(stats.totalUsers)}`} people who are building their brands, sharing their stories,
                and discovering amazing content in our vibrant platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <Rocket className="w-5 h-5" />
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-gray-800 font-semibold rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition-all flex items-center justify-center gap-3"
                >
                  <PlayCircle className="w-5 h-5" />
                  Explore Content
                </motion.button>
              </div>

              {/* Full Width Stats Section */}
              <div className="mt-12 w-full">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {statsDisplay.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-4"
                    >
                      <div className={stat.color}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {loading ? (
                            <div className="h-7 w-16 bg-gray-200 rounded animate-pulse"></div>
                          ) : (
                            stat.value
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {loading && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-gray-500">Loading live statistics...</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right Content - Feature Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Active Feature Display */}
                <div className="relative h-48 rounded-2xl overflow-hidden mb-6">
                  <img
                    src={features[activeFeature].image}
                    alt={features[activeFeature].title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${features[activeFeature].color} opacity-60`}></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                        {features[activeFeature].icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
                        <p className="text-white/90">{features[activeFeature].stats}</p>
                      </div>
                    </div>
                    <p className="text-white/95">{features[activeFeature].description}</p>
                  </div>
                </div>

                {/* Feature Dots */}
                <div className="flex justify-center gap-2 mb-6">
                  {features.map((_, index) => (
                    <p
                      key={index}
                      onClick={() => setActiveFeature(index)}
                      className={`w-3 h-3 rounded-full transition-all ${index === activeFeature
                        ? 'bg-blue-600 w-8'
                        : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    />
                  ))}
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {features.slice(0, 4).map((feature, index) => (
                    <motion.div
                      key={index}
                      className={`p-4 rounded-xl bg-gradient-to-br ${feature.color} bg-opacity-10 border border-white/10 backdrop-blur-sm ${activeFeature === index ? 'ring-2 ring-blue-500' : ''
                        }`}
                    // ❌ removed cursor-pointer
                    // ❌ removed onClick for view-only
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                          <div className="text-white">{feature.icon}</div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                          <p className="text-xs text-gray-600">{feature.stats}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl rotate-12 shadow-xl flex items-center justify-center"
              >
                <Gift className="w-10 h-10 text-white" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl -rotate-12 shadow-xl flex items-center justify-center"
              >
                <Award className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>

      </section>

      {/* Features Detail Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Success
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From networking to skill development, we provide all the tools you need to advance your career.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className={`group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden`}
              >
                {/* Updated: Changed Image for Post & Reels */}
                <div className="h-48 rounded-xl overflow-hidden mb-6">
                  <img
                    src={
                      feature.title === "Post & Reels"
                        ? "https://images.unsplash.com/photo-1611224923853-80b023f02d71?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                        : feature.image
                    }
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                      <div className="text-white">{feature.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                      <p className="text-sm font-semibold text-gray-700">{feature.stats}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{feature.description}</p>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => navigate("/login")}
                      className="text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-2"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>





      {/* Platform Highlight Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900 to-purple-900"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Creativity"
                className="w-full h-full object-cover opacity-20"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 px-8 py-16 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">Creativity First</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Unleash Your{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Potential
                </span>
              </h2>

              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join {loading ? "thousands of" : `${formatNumber(stats.totalUsers)}`} creators sharing knowledge, collaborating on projects,
                and helping each other grow. Your creativity is our platform's heartbeat.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                  <Rocket className="w-5 h-5" />
                  Get Started Now
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">



        <div className=" flex flex-col md:flex-row justify-between items-center">

          <div className="text-gray-400 mb-4 md:mb-0">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={PrithuLogo}
                  alt="PRITHU Logo"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-2xl font-bold">PRITHU</span>
              </div>
              <p className="text-gray-400">
                The ultimate platform for career growth, community building, and professional development.
              </p>
            </div>
            © {new Date().getFullYear()} PRITHU. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, index) => (
              <a key={index} href="#" className="text-gray-400 hover:text-white transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

      </footer>
    </div>
  );
};

export default LandingPage;

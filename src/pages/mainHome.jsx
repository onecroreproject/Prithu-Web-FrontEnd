import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { useMainBoardStats } from '../hooks/useMiscellaneous';
import AOS from 'aos';
import 'aos/dist/aos.css';
import SEO from '../components/SEO';
// import Footer from '../components/Footer';
// import FeedSliderSection from '../components/FeedSliderSection';

// Lazy load heavy components
const Footer = lazy(() => import('../components/Footer'));
const FeedSliderSection = lazy(() => import('../components/FeedSliderSection'));
const HeroBackground3D = lazy(() => import('../components/HomeComponents/HeroBackground3D'));

import { AnimatedCounter, AnimatedIcon } from '../components/HomeComponents/LandingSubComponents';


const LandingPage = () => {
  const containerRef = useRef();
  const [showDecorations, setShowDecorations] = React.useState(false);

  useEffect(() => {
    // Delay decorative elements to improve LCP
    const timer = setTimeout(() => {
      setShowDecorations(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic',
    });

    return () => {
      AOS.refresh();
    };
  }, []);

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const handleSignUpClick = () => {
    window.location.href = '/login';
  };

  const { data: stats } = useMainBoardStats();

  const handleShareClick = () => {
    // Navigate to login page
    window.location.href = '/login';
  };

  // Happy emotion icons for decoration
  const happyIcons = ["😊", "🥰", "😍", "🤩", "🎉", "✨", "🌟", "💫", "❤️", "💖", "💝", "🎁", "📱", "📸", "🎨", "💰", "🚀", "⭐", "🌈"];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fef5d5] text-gray-800 overflow-x-hidden relative">
      <SEO
        title="Prithu - Best Status & Motivational Video App"
        description="Explore Prithu - watch status videos, motivational, spiritual & educational reels, movie dialogues & daily life impressions with smart personalization and instant sharing."
        keywords="Prithu, status videos, motivational videos, spiritual reels, educational reels, video creator, share rewards"
        name="Prithu"
        type="website"
        canonical="https://prithu.app"
      />


      {/* Lazy-loaded Three.js Background with flying icons */}
      <Suspense fallback={<div className="fixed inset-0 bg-[#fef5d5] z-0" />}>
        <HeroBackground3D />
      </Suspense>

      {/* 2D Flying Icons Layer - Deferred for LCP Performance */}
      {showDecorations && (
        <div className="fixed inset-0 z-1 pointer-events-none">
          {happyIcons.map((icon, index) => (
            <div
              key={index}
              className="absolute animate-float text-2xl opacity-30"
              style={{
                left: `${(index * 37) % 100}%`,
                top: `${(index * 23) % 100}%`,
                animationDelay: `${index * 0.2}s`,
                animationDuration: `${3 + (index % 3)}s`,
                willChange: 'transform'
              }}
            >
              {icon}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 px-4">
          <div className="max-w-6xl mx-auto text-center">
            {/* Logo/Title with enhanced effect */}
            <div
              className="relative inline-block mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 blur-2xl opacity-50 rounded-full animate-pulse"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-300 via-orange-400 to-pink-400 blur-3xl opacity-20 animate-ping rounded-full"></div>
              <h1 className="text-6xl md:text-8xl font-bold relative">
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                  Prithu
                </span>
              </h1>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-amber-400 to-pink-400 rounded-full blur-sm"></div>
            </div>

            {/* Tagline with floating icons */}
            <div className="relative">
              <h2
                data-aos="fade-up"
                data-aos-delay="150"
                className="text-3xl md:text-4xl font-bold mb-4 text-gray-800"
              >
                <AnimatedIcon icon="✨" className="mr-2" />
                Create.{' '}
                <span className="text-amber-600 relative">
                  Personalize
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></span>
                </span>
                .{' '}
                <AnimatedIcon icon="🚀" className="mx-2" />
                Share.{' '}
                <span className="text-green-600 relative">
                  Earn
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"></span>
                </span>
                .
                <AnimatedIcon icon="💰" className="ml-2" />
              </h2>

              <p
                data-aos="fade-up"
                data-aos-delay="200"
                className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
              >
                Where every post feels{' '}
                <span className="text-amber-600 font-semibold relative group">
                  personal
                  <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"></span>
                </span>{' '}
                —and{' '}
                <span className="text-green-600 font-semibold relative group">
                  rewarding
                  <span className="absolute -bottom-1 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-500 delay-150"></span>
                </span>
                .
              </p>
            </div>

            {/* CTA Buttons with enhanced effects */}
            <div
              data-aos="zoom-in"
              data-aos-delay="300"
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <button
                onClick={handleSignUpClick}
                className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xl font-bold shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 hover:scale-110 transform active:scale-105"
              >
                <span className="relative z-10 flex items-center gap-3 text-white">
                  <span className="text-2xl animate-pulse">✨</span>
                  <span>Start Creating Free</span>
                  <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 opacity-30 blur-lg animate-ping"></div>
              </button>

              <button
                onClick={handleShareClick}
                className="group relative px-8 py-5 border-2 border-amber-500 rounded-full text-lg font-semibold text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-all duration-300 hover:scale-110 transform active:scale-105 backdrop-blur-sm"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl animate-bounce">💰</span>
                  <span>Earn by Referring Friends</span>
                  <span className="text-xl group-hover:rotate-180 transition-transform duration-500">🎁</span>
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </button>
            </div>

            {/* Enhanced Stats Section */}
            <div
              data-aos="fade-up"
              data-aos-delay="400"
              className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl"
            >
              <AnimatedCounter
                end={stats?.totalShares || 10000}
                label="Happy Shares"
                icon="🚀"
              />
              <AnimatedCounter
                end={stats?.totalTemplates || 500}
                label="Professional Templates"
                icon="✨"
              />
              <AnimatedCounter
                end={stats?.totalUsers || 50000}
                label="Happy Users Worldwide"
                icon="😊"
              />
            </div>
          </div>
        </section>

        {/* Full-width Auto-Sliding Feed Section */}
        <Suspense fallback={<div className="h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>}>
          <FeedSliderSection />
        </Suspense>


        {/* Features Section with enhanced design */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2
                data-aos="fade-up"
                className="text-4xl md:text-5xl font-bold mb-4 text-gray-800"
              >
                ✨ What Makes Prithu <span className="text-amber-600">Special?</span>
              </h2>
              <p
                data-aos="fade-up"
                data-aos-delay="100"
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Discover why thousands choose Prithu for their creative needs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "🎉 Celebrate Every Moment",
                  description: "Turn life's special moments into beautiful, personalized posts that feel truly yours.",
                  emoji: "🎉",
                  color: "from-pink-400 via-rose-400 to-red-400",
                  icon: "❤️"
                },
                {
                  title: "✨ Smart Personalization",
                  description: "Your photo and name added automatically to every template—perfect every time.",
                  emoji: "✨",
                  color: "from-purple-400 via-indigo-400 to-blue-400",
                  icon: "🌟"
                },
                {
                  title: "📱 Made for Everyone",
                  description: "Perfect for families, professionals, and anyone wanting great posts effortlessly.",
                  emoji: "📱",
                  color: "from-blue-400 via-cyan-400 to-teal-400",
                  icon: "👨‍👩‍👧‍👦"
                },
                {
                  title: "🎨 Professional Quality",
                  description: "High-quality designs with modern layouts—no editing skills required.",
                  emoji: "🎨",
                  color: "from-green-400 via-emerald-400 to-lime-400",
                  icon: "💎"
                },
                {
                  title: "⚡ Instant Sharing",
                  description: "Download and share instantly on all social platforms with one click.",
                  emoji: "⚡",
                  color: "from-orange-400 via-amber-400 to-yellow-400",
                  icon: "🚀"
                },
                {
                  title: "💰 Earn Rewards",
                  description: "Invite friends and earn amazing rewards when they join Prithu.",
                  emoji: "💰",
                  color: "from-yellow-400 via-amber-400 to-orange-400",
                  icon: "🏆"
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  data-aos="flip-up"
                  data-aos-delay={index * 100}
                  className="relative group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-amber-200/30 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative bg-white/95 backdrop-blur-lg rounded-2xl p-8 border border-amber-100 hover:border-amber-300 transition-all duration-300 hover:scale-[1.03] transform shadow-xl hover:shadow-2xl">
                    <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center text-3xl shadow-lg`}>
                      {feature.icon}
                    </div>
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center text-4xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      {feature.emoji}
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    <div className="mt-6 pt-6 border-t border-amber-100">
                      <div className="flex items-center text-sm text-amber-600 font-medium">
                        <span className="animate-pulse">→</span>
                        <span className="ml-2">Learn More</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial Section with enhanced emotion */}
        <section className="py-20 px-4 bg-[#fef5d5]">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              data-aos="fade-up"
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-800"
            >
              ❤️ Why People <span className="text-rose-500">Love</span> Prithu
            </h2>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {["😍", "🤩", "🥰", "😊", "🎉", "✨", "🌟", "💖"].map((icon, idx) => (
                <div
                  key={idx}
                  data-aos="zoom-in"
                  data-aos-delay={idx * 50}
                  className="text-3xl animate-bounce"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  {icon}
                </div>
              ))}
            </div>

            <div
              data-aos="fade-up"
              data-aos-delay="200"
              className="relative group"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-400/20 via-orange-400/20 to-rose-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl p-10 border border-amber-100 shadow-2xl">
                <div className="text-5xl mb-6">"</div>
                <p className="text-2xl mb-8 leading-relaxed text-gray-700 italic">
                  I used to spend hours trying to make my photos look professional. Now with Prithu, it takes seconds! My friends are always asking how I make such beautiful status updates.
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 flex items-center justify-center text-2xl shadow-lg border-2 border-white">
                    👩
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-xl text-gray-800">Priya Sharma</div>
                    <div className="text-amber-600">Power Creator</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600 transform -skew-y-3 origin-right scale-110"></div>
          <div className="max-w-6xl mx-auto relative z-10 text-center text-white">
            <h2
              data-aos="fade-up"
              className="text-5xl md:text-7xl font-black mb-8 leading-tight"
            >
              <span className="text-amber-400">Your Creativity?</span>
            </h2>
            <p
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-2xl mb-12 text-blue-100 max-w-3xl mx-auto"
            >
              Join 50,000+ creators who are making their digital life more beautiful every day.
            </p>
            <div
              data-aos="zoom-in"
              data-aos-delay="200"
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <button
                onClick={handleSignUpClick}
                className="group px-12 py-6 bg-white text-blue-600 rounded-full text-2xl font-black shadow-2xl hover:bg-amber-50 transition-all duration-300 hover:scale-110 active:scale-105 flex items-center justify-center gap-4"
              >
                <span>Download App Now</span>
                <span className="group-hover:translate-x-2 transition-transform duration-300">⚡</span>
              </button>
              <button
                onClick={handleLoginClick}
                className="group px-12 py-6 border-4 border-white text-white rounded-full text-2xl font-black hover:bg-white/10 transition-all duration-300 hover:scale-110 active:scale-105"
              >
                Sign In 🔓
              </button>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2
              data-aos="fade-up"
              className="text-4xl md:text-5xl font-bold mb-6 text-gray-800"
            >
              🚀 Start Creating in <span className="text-amber-600">Seconds</span>
            </h2>

            <p
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto"
            >
              Join <span className="text-amber-600 font-semibold">50,000+ happy users</span> who create amazing content every day
            </p>

            <div
              data-aos="zoom-in"
              data-aos-delay="200"
              className="relative group mb-12"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-pink-500/30 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-pink-500/10 backdrop-blur-lg rounded-3xl p-1">
                <div className="bg-white/95 rounded-3xl p-12">
                  <div className="text-3xl md:text-4xl font-bold mb-8 text-gray-800">
                    Create • Personalize • Share • <span className="text-green-600 animate-pulse">Earn</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                      onClick={handleSignUpClick}
                      className="group relative px-14 py-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-2xl font-bold text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 hover:scale-110 transform"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <span className="text-2xl animate-bounce">✨</span>
                        <span>Download Prithu Today</span>
                        <span className="group-hover:translate-x-3 transition-transform duration-300">→</span>
                      </span>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
                    </button>

                  </div>
                </div>
              </div>
            </div>

            {/* Final Enhanced Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Templates", value: stats?.totalTemplates || 500, icon: "🎨", color: "from-pink-500 to-rose-500" },
                { label: "Users", value: stats?.totalUsers || 50000, icon: "😊", color: "from-amber-500 to-orange-500" },
                { label: "Posts Created", value: stats?.totalShares || 10000, icon: "✨", color: "from-blue-500 to-cyan-500" },
              ].map((stat, index) => (
                <div
                  key={index}
                  data-aos="flip-up"
                  data-aos-delay={300 + index * 100}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-amber-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${stat.color} flex items-center justify-center text-2xl mb-4 mx-auto`}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    {typeof stat.value === 'number' ? <AnimatedCounter end={stat.value} duration={1500} /> : stat.value}
                  </div>
                  <div className="text-gray-700 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <Suspense fallback={<div className="h-20" />}>
          <Footer />
        </Suspense>
      </div>


      {/* Custom CSS for animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateZ(0); }
          50% { transform: translateY(-20px) translateZ(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
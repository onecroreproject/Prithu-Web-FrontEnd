import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Clock, 
  Trophy, 
  BarChart3, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle,
  Users,
  TrendingUp,
  Brain,
  RefreshCw,
  Shield,
  ChevronRight,
  Loader,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Header from '../Header';

const AptitudeTest = () => {
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState('idle'); // idle, starting, active, completed
  const [testUrl, setTestUrl] = useState('');
  const [testScores, setTestScores] = useState([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    totalTests: 0,
    bestScore: 0,
    completionRate: 0
  });
  const [iframeError, setIframeError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Poll for test completion
  useEffect(() => {
    let interval;
    
    const pollForResults = async () => {
      try {
        const res = await api.get("/api/aptitude/latest/results");
        
        if (res.data.success && res.data.latest) {
          const isNewResult = !testScores.some(score => 
            score._id === res.data.latest._id || 
            (score.score === res.data.latest.score && 
             Math.abs(new Date(score.createdAt) - new Date(res.data.latest.createdAt)) < 1000)
          );
          
          if (isNewResult) {
            console.log("New test result received:", res.data.latest);
            
            setTestScores(prev => [res.data.latest, ...prev]);
            calculateStats([res.data.latest, ...testScores]);
            setTestStatus("completed");
            setTestUrl("");
            
            clearInterval(interval);
            
            toast.success(
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Test completed! Your score: {res.data.latest.score}/100</span>
              </div>,
              { duration: 5000 }
            );
          }
        }
      } catch (err) {
        console.error("Error polling for results:", err);
      }
    };

    if (testStatus === "active") {
      console.log("Starting polling for test results...");
      interval = setInterval(pollForResults, 3000);
      pollForResults();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [testStatus, testScores]);

  // Fetch user's aptitude scores
  const fetchAptitudeScores = async () => {
    try {
      const response = await api.get('/api/aptitude/latest/results');
      if (response.data.success) {
        setTestScores(response.data.results || []);
        calculateStats(response.data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch aptitude scores:', error);
      toast.error('Failed to load test history');
    }
  };

  const calculateStats = (scores) => {
    if (scores.length === 0) {
      setStats({
        averageScore: 0,
        totalTests: 0,
        bestScore: 0,
        completionRate: 0
      });
      return;
    }
    
    const completedScores = scores.filter(test => test.status === 'completed' || test.status === 'Completed');
    const totalScore = completedScores.reduce((sum, test) => sum + (test.score || 0), 0);
    const bestScore = completedScores.length > 0 ? Math.max(...completedScores.map(test => test.score || 0)) : 0;
    const completionRate = (completedScores.length / scores.length) * 100;
    
    setStats({
      averageScore: completedScores.length > 0 ? (totalScore / completedScores.length).toFixed(1) : 0,
      totalTests: scores.length,
      bestScore,
      completionRate: completionRate.toFixed(1)
    });
  };

  useEffect(() => {
    fetchAptitudeScores();
  }, []);

  const startAptitudeTest = async () => {
    setLoading(true);
    setTestStatus("starting");
    setIframeError(false);
    
    try {
      console.log("Starting aptitude test...");
      const response = await api.post("/api/aptitude/start-test");
      
      if (response.data.success) {
        console.log("Test started, URL:", response.data.testUrl);
        setTestUrl(response.data.testUrl);
        
        // Small delay to show "starting" state before iframe loads
        setTimeout(() => {
          setTestStatus("active");
        }, 1000);
        
        toast.success(
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-white" />
            <span>Test started! Loading test platform...</span>
          </div>,
          { duration: 3000 }
        );
      } else {
        throw new Error(response.data.message || "Failed to start test");
      }
    } catch (error) {
      console.error("Failed to start aptitude test:", error);
      toast.error(error.response?.data?.message || "Failed to start aptitude test");
      setTestStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    console.log("Iframe loaded successfully");
    setIframeError(false);
  };

  const handleIframeError = () => {
    console.error("Iframe failed to load");
    setIframeError(true);
    toast.error("Failed to load test. Please try again.");
    setTestStatus("idle");
    setTestUrl("");
  };

  const retakeTest = () => {
    setTestStatus('idle');
    setTestUrl('');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recent';
      
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 60) {
        return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      } else if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else if (diffDays < 7) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      }
    } catch (error) {
      return 'Recent';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-100';
    if (score >= 60) return 'bg-blue-50 border-blue-100';
    if (score >= 40) return 'bg-amber-50 border-amber-100';
    return 'bg-red-50 border-red-100';
  };

  const getPerformanceLevel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  };

  // If test is active and iframe is connected, show fullscreen iframe
  if (testStatus === "active" && testUrl) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        {/* Fullscreen Header */}
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Aptitude Test in Progress</h1>
                <p className="text-sm text-gray-500">Test is running - please don't close this window</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">Live</span>
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5 text-gray-600" />
                ) : (
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                )}
              </button>
              
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to exit the test? Your progress may be lost.")) {
                    setTestStatus("idle");
                    setTestUrl("");
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Exit test"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Iframe Container */}
        <div className="pt-16 h-screen">
          {iframeError ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Failed to Load Test</h2>
              <p className="text-gray-600 text-center max-w-md mb-8">
                There was an error loading the aptitude test. This could be due to network issues or the test platform being temporarily unavailable.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    setIframeError(false);
                    setTestStatus("idle");
                    setTestUrl("");
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={testUrl}
              className="w-full h-full"
              title="Aptitude Test"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
              style={{ border: 'none' }}
            />
          )}
        </div>

        {/* Status Bar at Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Connected to test platform</span>
              </div>
              <div className="hidden md:block">•</div>
              <div className="hidden md:block">Your responses are being saved automatically</div>
            </div>
            <div className="text-sm text-gray-500">
              <Clock className="w-4 h-4 inline mr-1" />
              Time remaining: --
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal dashboard view when test is not active
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 mt-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Aptitude Assessment</h1>
              <p className="text-gray-600 mt-2">Evaluate cognitive abilities and problem-solving skills</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white border border-gray-200 rounded-xl flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">Secure Platform</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Average Score",
                value: stats.averageScore,
                suffix: "/100",
                icon: BarChart3,
                iconColor: "text-blue-500",
                bgColor: "bg-blue-50",
                trend: "Your performance trend"
              },
              {
                label: "Best Score",
                value: stats.bestScore,
                suffix: "/100",
                icon: Trophy,
                iconColor: "text-emerald-500",
                bgColor: "bg-emerald-50",
                trend: "Your highest achievement"
              },
              {
                label: "Tests Completed",
                value: stats.totalTests,
                suffix: "",
                icon: Users,
                iconColor: "text-violet-500",
                bgColor: "bg-violet-50",
                trend: "Total attempts made"
              },
              {
                label: "Completion Rate",
                value: stats.completionRate,
                suffix: "%",
                icon: Clock,
                iconColor: "text-amber-500",
                bgColor: "bg-amber-50",
                trend: "Tests completed successfully"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-bold text-gray-900">
                      {stat.value}<span className="text-lg text-gray-500">{stat.suffix}</span>
                    </h3>
                  </div>
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-600 font-medium">{stat.trend}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Test Interface */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Test Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Cognitive Aptitude Test</h2>
                      <p className="text-gray-600">Assess your logical reasoning and problem-solving skills</p>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                    testStatus === 'completed' ? 'bg-emerald-50 text-emerald-700' :
                    testStatus === 'active' ? 'bg-blue-50 text-blue-700' :
                    testStatus === 'starting' ? 'bg-amber-50 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {testStatus === 'completed' && 'Completed'}
                    {testStatus === 'active' && 'In Progress'}
                    {testStatus === 'starting' && 'Starting...'}
                    {testStatus === 'idle' && 'Ready'}
                  </div>
                </div>
              </div>

              {/* Test Content */}
              <div className="p-6">
                <AnimatePresence mode="wait">
                  {testStatus === 'idle' && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-white rounded-lg shadow-sm">
                            <AlertCircle className="w-6 h-6 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-2">Test Instructions</h3>
                            <ul className="space-y-2 text-gray-600">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>Test duration: 30 minutes</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>Multiple choice questions covering various cognitive areas</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>Your score will be automatically saved upon completion</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span>You can retake the test to improve your score</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="text-center space-y-6">
                        <div className="inline-flex flex-col items-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Ready to Begin?</h3>
                          <p className="text-gray-600 mt-2">Click below to start your aptitude assessment</p>
                        </div>

                        <button
                          onClick={startAptitudeTest}
                          disabled={loading}
                          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loading ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Starting Test...
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              Start Aptitude Test
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {testStatus === 'starting' && (
                    <motion.div
                      key="starting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 mx-auto mb-6">
                        <Loader className="w-full h-full text-blue-500 animate-spin" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Preparing Your Test</h3>
                      <p className="text-gray-600">Setting up your assessment environment...</p>
                    </motion.div>
                  )}

                  {testStatus === 'completed' && (
                    <motion.div
                      key="completed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-8"
                    >
                      {/* Latest Score */}
                      {testScores.length > 0 && (
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                          <div className="flex items-center justify-between mb-6">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">Latest Test Result</h3>
                              <p className="text-gray-600">Your most recent aptitude assessment</p>
                            </div>
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <Trophy className="w-6 h-6 text-emerald-500" />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className={`text-4xl font-bold ${getScoreColor(testScores[0].score)} mb-1`}>
                                {testScores[0].score}
                              </div>
                              <p className="text-sm text-gray-500">Score</p>
                            </div>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-gray-900 mb-1">
                                {testScores[0].timeTaken || '--'}
                              </div>
                              <p className="text-sm text-gray-500">Minutes</p>
                            </div>
                            <div className="text-center">
                              <div className="text-4xl font-bold text-gray-900 mb-1">
                                {getPerformanceLevel(testScores[0].score)}
                              </div>
                              <p className="text-sm text-gray-500">Performance</p>
                            </div>
                          </div>

                          <div className="mt-6 pt-6 border-t border-emerald-100">
                            <div className="flex items-center justify-center gap-2 text-emerald-600">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Successfully completed and saved</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <button
                          onClick={retakeTest}
                          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 mx-auto"
                        >
                          <RefreshCw className="w-5 h-5" />
                          Retake Aptitude Test
                        </button>
                        <p className="text-gray-500 text-sm mt-3">
                          Improve your score by taking the test again
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Information (Only shown when test is not active) */}
          {testStatus !== 'active' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* How It Works */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">How It Works</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {[
                      { number: 1, title: "Start Test", description: "Click 'Start Aptitude Test' to initiate the assessment" },
                      { number: 2, title: "Take Test", description: "Complete the cognitive aptitude test on our secure platform" },
                      { number: 3, title: "Receive Score", description: "Your score is automatically sent to our callback URL" },
                      { number: 4, title: "View Results", description: "Results are stored and displayed in your dashboard" }
                    ].map((step) => (
                      <div key={step.number} className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{step.number}</span>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">{step.title}</h4>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Test Categories */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">Test Categories</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { name: "Logical Reasoning", count: "25 questions", bg: "bg-blue-50" },
                      { name: "Numerical Ability", count: "20 questions", bg: "bg-emerald-50" },
                      { name: "Verbal Skills", count: "15 questions", bg: "bg-violet-50" },
                      { name: "Problem Solving", count: "20 questions", bg: "bg-amber-50" }
                    ].map((category) => (
                      <div key={category.name} className={`flex items-center justify-between p-3 ${category.bg} rounded-lg`}>
                        <span className="font-medium text-gray-900">{category.name}</span>
                        <span className="text-sm text-gray-500">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Pro Tips</h3>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Take the test in a quiet environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt=2 flex-shrink-0"></div>
                    <span className="text-sm">Manage your time - don't spend too long on one question</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Review your answers before submitting</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
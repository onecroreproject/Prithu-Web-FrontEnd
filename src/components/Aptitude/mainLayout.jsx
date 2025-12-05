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
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

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

  // Fetch user's aptitude scores
  const fetchAptitudeScores = async () => {
    try {
      const response = await api.get('/api/aptitude/results');
      if (response.data.success) {
        setTestScores(response.data.results);
        calculateStats(response.data.results);
      }
    } catch (error) {
      console.error('Failed to fetch aptitude scores:', error);
      toast.error('Failed to load test history');
    }
  };

  const calculateStats = (scores) => {
    if (scores.length === 0) return;
    
    const totalScore = scores.reduce((sum, test) => sum + test.score, 0);
    const bestScore = Math.max(...scores.map(test => test.score));
    const completionRate = (scores.filter(test => test.status === 'completed').length / scores.length) * 100;
    
    setStats({
      averageScore: (totalScore / scores.length).toFixed(1),
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
    setTestStatus('starting');
    
    try {
      const response = await api.post('/api/aptitude/start-test');
      
      if (response.data.success) {
        setTestUrl(response.data.testUrl);
        setTestStatus('active');
        toast.success('Aptitude test started! You will be redirected shortly.');
        
        // Simulate test completion (in real app, this would be handled by callback)
        simulateTestCompletion();
      } else {
        throw new Error(response.data.message || 'Failed to start test');
      }
    } catch (error) {
      console.error('Failed to start test:', error);
      toast.error(error.response?.data?.message || 'Failed to start aptitude test');
      setTestStatus('idle');
    } finally {
      setLoading(false);
    }
  };

  const simulateTestCompletion = () => {
    // In production, this would be handled by the external server callback
    setTimeout(() => {
      // Simulate receiving results from external server
      const mockScore = Math.floor(Math.random() * 60) + 40; // Random score 40-100
      const mockTimeTaken = Math.floor(Math.random() * 20) + 10; // 10-30 minutes
      
      // Simulate callback to your server
      handleTestCompletion(mockScore, mockTimeTaken);
    }, 5000); // Simulate 5 second test
  };

  const handleTestCompletion = async (score, timeTaken) => {
    try {
      // This would be called by the external server's callback
      // For demo, we'll simulate it
      const newScore = {
        _id: Date.now().toString(),
        userId: 'current-user',
        score,
        timeTaken,
        testName: 'Cognitive Aptitude Test',
        status: 'completed',
        receivedAt: new Date().toISOString()
      };
      
      setTestScores(prev => [newScore, ...prev]);
      setTestStatus('completed');
      
      toast.success(
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Test completed! Your score: {score}/100</span>
        </div>,
        { duration: 5000 }
      );
      
      // Refresh stats
      calculateStats([newScore, ...testScores]);
    } catch (error) {
      console.error('Failed to process test completion:', error);
    }
  };

  const retakeTest = () => {
    setTestStatus('idle');
    setTestUrl('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
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
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Average Score</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.averageScore || '0'}<span className="text-lg text-gray-500">/100</span></h3>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                  <span className="text-emerald-600 font-medium">Your performance trend</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Best Score</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.bestScore || '0'}<span className="text-lg text-gray-500">/100</span></h3>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <Trophy className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  Your highest achievement
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tests Completed</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.totalTests || '0'}</h3>
                </div>
                <div className="p-3 bg-violet-50 rounded-xl">
                  <Users className="w-6 h-6 text-violet-500" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  Total attempts made
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stats.completionRate || '0'}%</h3>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-500" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  Tests completed successfully
                </div>
              </div>
            </motion.div>
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
                              <RefreshCw className="w-5 h-5 animate-spin" />
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

                  {testStatus === 'active' && (
                    <motion.div
                      key="active"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-center space-y-4">
                        <div className="inline-flex flex-col items-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center mb-4">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                              <Brain className="w-10 h-10 text-white" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Test in Progress</h3>
                          <p className="text-gray-600">You are being redirected to the test platform...</p>
                        </div>

                        {/* Test iframe or redirect message */}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                          <div className="flex items-center justify-center gap-3 text-gray-600">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span>Connecting to secure test platform...</span>
                          </div>
                          
                          {/* In production, you would use an iframe or redirect */}
                          {/* <iframe src={testUrl} className="w-full h-96 border-0 rounded-lg" /> */}
                          
                          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                            <p className="text-sm text-blue-700 text-center">
                              If you are not redirected automatically, please ensure pop-ups are enabled for this site.
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <button
                            onClick={retakeTest}
                            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Cancel Test
                          </button>
                        </div>
                      </div>
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

                        {testScores.length > 0 && (
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
                                {testScores[0].testName?.split(' ')[0] || 'Test'}
                              </div>
                              <p className="text-sm text-gray-500">Type</p>
                            </div>
                          </div>
                        )}

                        <div className="mt-6 pt-6 border-t border-emerald-100">
                          <div className="flex items-center justify-center gap-2 text-emerald-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">Successfully completed and saved</span>
                          </div>
                        </div>
                      </div>

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

            {/* Test History */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mt-6 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Test History</h3>
                <p className="text-gray-600 text-sm">Your previous aptitude test attempts</p>
              </div>
              
              <div className="p-6">
                {testScores.length > 0 ? (
                  <div className="space-y-4">
                    {testScores.map((test, index) => (
                      <motion.div
                        key={test._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border ${getScoreBgColor(test.score)} transition-all hover:shadow-sm`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg ${getScoreColor(test.score)} ${getScoreBgColor(test.score)}`}>
                              <BarChart3 className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{test.testName || 'Cognitive Aptitude Test'}</h4>
                              <p className="text-sm text-gray-500">
                                {formatDate(test.receivedAt || test.createdAt)} • {test.timeTaken || '--'} minutes
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${getScoreColor(test.score)}`}>
                                {test.score}<span className="text-lg">/100</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {test.score >= 80 ? 'Excellent' : 
                                 test.score >= 60 ? 'Good' : 
                                 test.score >= 40 ? 'Average' : 'Needs Improvement'}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Test History</h4>
                    <p className="text-gray-600">Take your first aptitude test to see your results here</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Information */}
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
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Start Test</h4>
                      <p className="text-sm text-gray-600">Click "Start Aptitude Test" to initiate the assessment</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Take Test</h4>
                      <p className="text-sm text-gray-600">Complete the cognitive aptitude test on our secure platform</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Receive Score</h4>
                      <p className="text-sm text-gray-600">Your score is automatically sent to our callback URL</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">4</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">View Results</h4>
                      <p className="text-sm text-gray-600">Results are stored and displayed in your dashboard</p>
                    </div>
                  </div>
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
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-900">Logical Reasoning</span>
                    <span className="text-sm text-gray-500">25 questions</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                    <span className="font-medium text-gray-900">Numerical Ability</span>
                    <span className="text-sm text-gray-500">20 questions</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-violet-50 rounded-lg">
                    <span className="font-medium text-gray-900">Verbal Skills</span>
                    <span className="text-sm text-gray-500">15 questions</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="font-medium text-gray-900">Problem Solving</span>
                    <span className="text-sm text-gray-500">20 questions</span>
                  </div>
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
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Read each question carefully before answering</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Manage your time - don't spend too long on one question</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm">Review your answers before submitting</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
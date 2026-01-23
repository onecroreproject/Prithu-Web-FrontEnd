import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Play, 
  Clock, 
  Trophy, 
  BarChart3, 
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
  Minimize2,
  FolderOpen,
  Hash,
  Award,
  Calendar,
  UserPlus,
  Eye,
  User,
  XCircle,
  Smile,
  Heart,
  Star,
  Zap,
  CalendarDays,
  CheckSquare,
  AlertTriangle,
  Target,
  BookOpen,
  ChevronDown,
  ChevronUp,
  BarChart,
  PieChart,
  Activity,
  Coffee ,
  Server ,
  Database ,
  Palette ,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';
import Header from '../Header';

const AptitudeTest = () => {
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState('idle');
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
  const [groupedTests, setGroupedTests] = useState({});
  const [testSchedules, setTestSchedules] = useState([]);
  const [runningTest, setRunningTest] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedCount, setInterestedCount] = useState(0);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [showUserBalloons, setShowUserBalloons] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isPassed, setIsPassed] = useState(false);
  const [hasValidInterest, setHasValidInterest] = useState(true);
  const [expandedTestType, setExpandedTestType] = useState(null);
  
  const iframeRef = useRef(null);

  // Fetch all test schedules
  const fetchTestSchedules = async () => {
    try {
      const response = await api.get('/api/aptitude/schedule');

      console.log(response.data)
      
      if (response.data.success) {
        const allTests = [
          ...(response.data.runningInterestedTests || []),
          ...(response.data.upcomingInterestedTests || []),
          ...(response.data.completedInterestedTests || []),
          ...(response.data.upcomingNotInterestedTests || [])
        ];
        
        setTestSchedules(allTests);
        
        // Find running test user is interested in
        const running = response.data.runningInterestedTests?.[0];
        if (running) {
          setRunningTest(running);
          setSelectedSchedule(running);
          calculateTimeLeft(running.startTime);
          setInterestedCount(running.interestedCount || 0);
          setInterestedUsers(running.interestedUsers || []);
          setIsInterested(true);
          setHasValidInterest(true);
        } else {
          setRunningTest(null);
          
          // Select first available test
          const firstTest = response.data.upcomingInterestedTests?.[0] || 
                           response.data.upcomingNotInterestedTests?.[0] ||
                           response.data.completedInterestedTests?.[0];
          
          if (firstTest) {
            setSelectedSchedule(firstTest);
            calculateTimeLeft(firstTest.startTime);
            
            const isInterestedInThis = response.data.upcomingInterestedTests?.some(
              test => test._id === firstTest._id
            ) || response.data.completedInterestedTests?.some(
              test => test._id === firstTest._id
            );
            
            setIsInterested(isInterestedInThis);
            setHasValidInterest(isInterestedInThis);
            setInterestedCount(firstTest.interestedCount || 0);
            setInterestedUsers(firstTest.interestedUsers || []);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch test schedules:', error);
      toast.error('Failed to load test schedules');
    }
  };

  // Fetch interested data
  const fetchInterestedData = async (scheduleId) => {
    if (!scheduleId) return;
    
    try {
      const response = await api.get('/api/aptitude/schedule');
      if (response.data.success) {
        const allTests = [
          ...(response.data.runningInterestedTests || []),
          ...(response.data.upcomingInterestedTests || []),
          ...(response.data.completedInterestedTests || []),
          ...(response.data.upcomingNotInterestedTests || [])
        ];
        
        const schedule = allTests.find(test => test._id === scheduleId);
        if (schedule) {
          setInterestedCount(schedule.interestedCount || 0);
          setInterestedUsers(schedule.interestedUsers || []);
          
          const isUserInterested = response.data.runningInterestedTests?.some(
            test => test._id === scheduleId
          ) || response.data.upcomingInterestedTests?.some(
            test => test._id === scheduleId
          ) || response.data.completedInterestedTests?.some(
            test => test._id === scheduleId
          );
          
          setIsInterested(isUserInterested);
          setHasValidInterest(isUserInterested);
        }
      }
    } catch (error) {
      console.error('Failed to fetch interested data:', error);
    }
  };


const formatLocalDateTime = (utcDate) => {
  if (!utcDate) return "--";
  
  try {
    // Create date object from UTC string
    const date = new Date(utcDate);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return "--";
    
    // Format for Indian timezone (IST)
    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "--";
  }
};

const formatLocalTime = (utcDate) => {
  if (!utcDate) return "--";
  
  try {
    const date = new Date(utcDate);
    
    if (isNaN(date.getTime())) return "--";
    
    return date.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--";
  }
};

// For the countdown timer, you need to convert server UTC time to local time



  // Handle interested button click
  const handleInterestedClick = () => {
    if (!selectedSchedule) return;
    
    if (isInterested) {
      handleRemoveInterest();
    } else {
      setShowNameModal(true);
    }
  };

  // Submit interest with name
  const handleSubmitInterest = async () => {
    if (!firstName.trim()) {
      toast.error('First name is required');
      return;
    }

    if (!selectedSchedule) return;
    
    setSubmittingInterest(true);
    
    try {
      const response = await api.post('/api/aptitude/user/intrest', {
        testId: selectedSchedule.testId,
        scheduleId: selectedSchedule._id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        source: "web"
      });
      
      if (response.data.success) {
        setIsInterested(true);
        setHasValidInterest(true);
        setInterestedCount(prev => prev + 1);
        setShowNameModal(false);
        
        const newUser = {
          userId: 'current-user',
          name: firstName.trim(),
          lastName: lastName.trim(),
          avatar: null,
          interestedAt: new Date()
        };
        setInterestedUsers(prev => [newUser, ...prev]);
        
        toast.success(
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-white" />
            <span>You've expressed interest in this test!</span>
          </div>,
          { duration: 3000 }
        );
        
        fetchInterestedData(selectedSchedule._id);
        fetchTestSchedules();
      }
    } catch (error) {
      console.error('Failed to update interest:', error);
      toast.error(error.response?.data?.message || 'Failed to save interest');
    } finally {
      setSubmittingInterest(false);
      setFirstName('');
      setLastName('');
    }
  };

  // Remove interest
  const handleRemoveInterest = async () => {
    if (!selectedSchedule) return;
    
    try {
      const response = await api.delete(`/api/aptitude/remove-interested/${selectedSchedule._id}`);
      
      if (response.data.success) {
        setIsInterested(false);
        setHasValidInterest(false);
        setInterestedCount(prev => Math.max(0, prev - 1));
        setInterestedUsers(prev => prev.filter(user => user.userId !== 'current-user'));
        
        toast.success(
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-white" />
            <span>Interest removed</span>
          </div>,
          { duration: 3000 }
        );
        
        fetchInterestedData(selectedSchedule._id);
        fetchTestSchedules();
      }
    } catch (error) {
      console.error('Failed to remove interest:', error);
      toast.error('Failed to remove interest');
    }
  };

  // Close name modal
  const handleCloseModal = () => {
    setShowNameModal(false);
    setFirstName('');
    setLastName('');
  };

  // Show result modal
  const handleShowResultModal = (resultData) => {
    const passed = resultData.score >= (selectedSchedule?.passScore || 60);
    setIsPassed(passed);
    setTestResult({
      score: resultData.score,
      passScore: selectedSchedule?.passScore || 60,
      status: resultData.status || (passed ? 'pass' : 'fail'),
      message: resultData.message,
      certificateId: resultData.certificateId
    });
    setShowResultModal(true);
  };

  // Message listener for iframe communication
  useEffect(() => {
    const handleMessage = async (event) => {
      console.log("📨 Message received from iframe:", event.data);
      
      // Accept messages from test server
      if (event.origin === "https://aptitude.1croreprojects.com/" || 
          event.origin === "https://aptitude.1croreprojects.com" ||
          event.origin === "http://192.168.1.24:8000" ||
          event.origin === "http://192.168.1.24:8000/") {
        
        // Check if this is a callback result
        if (event.data.type === "TEST_CALLBACK" || 
            event.data.certificateId ||
            (event.data.score !== undefined && event.data.userId)) {
          
          const { score, certificateId, status, message } = event.data;
          
          // Show appropriate message
          if (status === "pass") {
            toast.success(
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Congratulations! You Passed! 🎉</span>
                </div>
                <div className="text-sm">
                  Score: {score}/100 | You'll receive your e-certificate via email.
                </div>
              </div>,
              { 
                duration: 8000,
                position: 'bottom-center'
              }
            );
          } else if (status === "fail") {
            toast.error(
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold">Better Luck Next Time!</span>
                </div>
                <div className="text-sm">
                  Score: {score}/100 | Keep practicing to improve your score.
                </div>
              </div>,
              { 
                duration: 6000,
                position: 'bottom-center'
              }
            );
          } else if (status === "exists") {
            toast.info(
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span>You've already completed this test.</span>
              </div>,
              { duration: 4000 }
            );
          }
          
          setHasValidInterest(false);
          setTestStatus("completed");
          setTestUrl("");
          
          setTimeout(() => {
            fetchAptitudeScores();
          }, 1500);
          
          setTimeout(() => {
            handleShowResultModal(event.data);
          }, 2000);
        }
      }
    };

    window.addEventListener("message", handleMessage);
    
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Get user initials for avatar
  const getUserInitials = (name, lastName) => {
    const firstInitial = name?.charAt(0) || 'U';
    const lastInitial = lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
  };

  // Get random color for avatar
  const getAvatarColor = (userId) => {
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 
      'bg-amber-500', 'bg-rose-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-pink-500', 'bg-cyan-500'
    ];
    const index = userId?.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  // Calculate time left until test starts
const calculateTimeLeft = (startTimeUTC) => {
  if (!startTimeUTC) {
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    return;
  }
  
  try {
    // Convert UTC time to local time
    const serverDate = new Date(startTimeUTC);
    
    // If server time is already in local format, use it directly
    // If it's UTC, we need to convert to local
    const startTime = serverDate;
    
    const now = new Date();
    const diff = startTime - now;
    
    if (diff <= 0) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    setTimeLeft({ days, hours, minutes, seconds });
  } catch (error) {
    console.error("Error calculating time left:", error);
    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  }
};

  // Get status badge
  const getStatusConfig = (status) => {
    switch (status) {
      case 'running':
        return {
          color: 'bg-emerald-100 text-emerald-800',
          icon: <Zap className="w-3 h-3" />,
          text: 'Live Now'
        };
      case 'upcoming':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: <Clock className="w-3 h-3" />,
          text: 'Upcoming'
        };
      case 'completed':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <CheckSquare className="w-3 h-3" />,
          text: 'Completed'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-3 h-3" />,
          text: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: <AlertCircle className="w-3 h-3" />,
          text: 'Unknown'
        };
    }
  };

  // Format test duration
  const formatDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes > 0 ? `${remainingMinutes}m` : ''}`;
    }
    return `${minutes}m`;
  };

  // Timer effect for countdown
  useEffect(() => {
    let timer;
    
    if (selectedSchedule && selectedSchedule.status === 'upcoming') {
      calculateTimeLeft(selectedSchedule.startTime);
      
      timer = setInterval(() => {
        calculateTimeLeft(selectedSchedule.startTime);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [selectedSchedule]);

  // Fetch schedules on mount
  useEffect(() => {
    fetchTestSchedules();
    fetchAptitudeScores();
  }, []);

  // Process and group test results
  const processTestResults = (results) => {
    if (!results || !Array.isArray(results)) return {};
    
    const grouped = {};
    
    results.forEach(test => {
      const testName = test.testName || 'Unnamed Test';
      
      if (!grouped[testName]) {
        grouped[testName] = {
          tests: [],
          highestScore: 0,
          averageScore: 0,
          totalAttempts: 0,
          bestAttempt: null,
          latestAttempt: null,
          passCount: 0,
          failCount: 0
        };
      }
      
      grouped[testName].tests.push(test);
      grouped[testName].totalAttempts++;
      
      if (test.score > grouped[testName].highestScore) {
        grouped[testName].highestScore = test.score;
        grouped[testName].bestAttempt = test;
      }
      
      if (test.result === 'pass') {
        grouped[testName].passCount++;
      } else if (test.result === 'fail') {
        grouped[testName].failCount++;
      }
      
      if (!grouped[testName].latestAttempt || 
          new Date(test.receivedAt) > new Date(grouped[testName].latestAttempt.receivedAt)) {
        grouped[testName].latestAttempt = test;
      }
    });
    
    Object.keys(grouped).forEach(testName => {
      const group = grouped[testName];
      const totalScore = group.tests.reduce((sum, test) => sum + test.score, 0);
      group.averageScore = (totalScore / group.totalAttempts).toFixed(1);
    });
    
    return grouped;
  };

  // Enhanced polling for test completion
  useEffect(() => {
    let pollInterval;
    let timeoutId;
    let attemptCount = 0;
    const maxAttempts = 100;

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      attemptCount = 0;
    };

    const checkForCompletion = async () => {
      try {
        attemptCount++;
        
        const res = await api.get("/api/aptitude/latest/results");
        
        if (res.data.success) {
          if (res.data.results && res.data.results.length > 0) {
            const latestResult = res.data.results[0];
            const existingIds = testScores.map(score => score._id);
            
            if (!existingIds.includes(latestResult._id)) {
              const newScores = [latestResult, ...testScores];
              setTestScores(newScores);
              
              const grouped = processTestResults(newScores);
              setGroupedTests(grouped);
              calculateStats(newScores);
              
              setHasValidInterest(false);
              setTestStatus("completed");
              setTestUrl("");
              
              stopPolling();
              
              if (latestResult.result === "pass") {
                toast.success(
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold">Congratulations! You Passed! 🎉</span>
                    </div>
                    <div className="text-sm">
                      Score: {latestResult.score}/100 | You'll receive your e-certificate via email.
                    </div>
                  </div>,
                  { 
                    duration: 8000,
                    position: 'bottom-center'
                  }
                );
              } else {
                toast.error(
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      <span className="font-semibold">Better Luck Next Time!</span>
                    </div>
                    <div className="text-sm">
                      Score: {latestResult.score}/100 | Keep practicing to improve your score.
                    </div>
                  </div>,
                  { 
                    duration: 6000,
                    position: 'bottom-center'
                  }
                );
              }
              
              setTimeout(() => {
                handleShowResultModal({
                  score: latestResult.score,
                  status: latestResult.result,
                  certificateId: latestResult.certificateId
                });
              }, 2000);
              
              return true;
            }
          }
        }
        
        if (attemptCount >= maxAttempts) {
          toast.info("Test session timed out. Check your test history for results.", { duration: 4000 });
          setTestStatus("idle");
          setTestUrl("");
          stopPolling();
        }
        
        return false;
      } catch (err) {
        console.error("Polling error:", err);
        return false;
      }
    };

    const startPolling = () => {
      attemptCount = 0;
      
      setTimeout(() => checkForCompletion(), 1000);
      pollInterval = setInterval(checkForCompletion, 3000);
      
      timeoutId = setTimeout(() => {
        toast.info("Test session timed out. If you completed the test, check your history.", { duration: 4000 });
        setTestStatus("idle");
        setTestUrl("");
        stopPolling();
      }, 3 * 60 * 1000);
    };

    if (testStatus === "active") {
      startPolling();
    }

    return stopPolling;
  }, [testStatus, testScores]);

  // Fetch user's aptitude scores
  const fetchAptitudeScores = async () => {
    try {
      const response = await api.get('/api/aptitude/latest/results');
      console.log(response.data)
      if (response.data.success) {
        const scores = response.data.results || [];
        setTestScores(scores);
        
        const grouped = processTestResults(scores);
        setGroupedTests(grouped);
        calculateStats(scores);
      }
    } catch (error) {
      console.error('Failed to fetch aptitude scores:', error);
      toast.error('Failed to load test history');
    }
  };

  // Calculate overall stats
  const calculateStats = (scores) => {
    if (!scores || scores.length === 0) {
      setStats({
        averageScore: 0,
        totalTests: 0,
        bestScore: 0,
        completionRate: 0
      });
      return;
    }
    
    const completedScores = scores.filter(test => test.score !== undefined);
    const totalScore = completedScores.reduce((sum, test) => sum + (test.score || 0), 0);
    const bestScore = completedScores.length > 0 ? Math.max(...completedScores.map(test => test.score || 0)) : 0;
    
    setStats({
      averageScore: completedScores.length > 0 ? (totalScore / completedScores.length).toFixed(1) : 0,
      totalTests: scores.length,
      bestScore,
      completionRate: completedScores.length > 0 ? 100 : 0
    });
  };

  // Start aptitude test
  const startAptitudeTest = async () => {
    if (!selectedSchedule) {
      toast.error('Please select a test first');
      return;
    }
    
    // Check if user already passed this test
    const existingResult = testScores.find(score => 
      score.certificateId && 
      selectedSchedule.testId === score.certificateId &&
      score.result === 'pass'
    );
    
    if (existingResult) {
      toast.error(
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <span>You have already passed this test. Cannot retake.</span>
        </div>,
        { duration: 4000 }
      );
      return;
    }
    
    // Check if user has valid interest (for running tests)
    if (selectedSchedule.status === 'running' && !hasValidInterest) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span>Your interest for this test has expired or been invalidated.</span>
        </div>,
        { duration: 4000 }
      );
      return;
    }
    
    setLoading(true);
    setTestStatus("starting");
    setIframeError(false);
    
    try {
      const response = await api.post("/api/aptitude/start-test", {
        scheduleId: selectedSchedule._id,
        testId: selectedSchedule.testId
      });
      
      if (response.data.success) {
        setTestUrl(response.data.testUrl);
        
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
      const errorMsg = error.response?.data?.message || "Failed to start aptitude test";
      toast.error(errorMsg);
      
      if (errorMsg.includes("not registered") || errorMsg.includes("invalid")) {
        setHasValidInterest(false);
      }
      
      setTestStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeError(false);
  };

  const handleIframeError = () => {
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

  const manualCheckResults = async () => {
    toast.loading("Checking for test results...");
    try {
      await fetchAptitudeScores();
      const res = await api.get("/api/aptitude/latest/results");
      if (res.data.success && res.data.results && res.data.results.length > 0) {
        const latest = res.data.results[0];
        const existingIds = testScores.map(score => score._id);
        
        if (!existingIds.includes(latest._id)) {
          toast.dismiss();
          
          if (latest.result === "pass") {
            toast.success(`Test passed! Score: ${latest.score}/100`);
            handleShowResultModal({
              score: latest.score,
              status: 'pass',
              certificateId: latest.certificateId
            });
          } else {
            toast.error(`Test failed. Score: ${latest.score}/100`);
            handleShowResultModal({
              score: latest.score,
              status: 'fail',
              certificateId: latest.certificateId
            });
          }
          
          setTestStatus("completed");
          setTestUrl("");
        } else {
          toast.dismiss();
          toast.info("No new results yet. Complete the test to see results.");
        }
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to check results");
    }
  };

  const handleTestFinished = () => {
    if (window.confirm("Have you completed the test? Click OK to check for results and close the test window.")) {
      setTestStatus("completed");
      setTestUrl("");
      setTimeout(() => {
        fetchAptitudeScores();
        toast.info("Checking for test completion...");
      }, 500);
    }
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

  // Get test type icon
  const getTestTypeIcon = (testName) => {
    const icons = {
      'Html': <FileText className="w-5 h-5" />,
      'Python': <Brain className="w-5 h-5" />,
      'JavaScript': <Zap className="w-5 h-5" />,
      'Java': <Coffee className="w-5 h-5" />,
      'React': <Activity className="w-5 h-5" />,
      'Node.js': <Server className="w-5 h-5" />,
      'SQL': <Database className="w-5 h-5" />,
      'CSS': <Palette className="w-5 h-5" />,
    };
    
    // Try to match the test name
    for (const [key, icon] of Object.entries(icons)) {
      if (testName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    // Default icons based on test name pattern
    if (testName.toLowerCase().includes('logical') || testName.toLowerCase().includes('reasoning')) {
      return <Brain className="w-5 h-5" />;
    } else if (testName.toLowerCase().includes('numerical') || testName.toLowerCase().includes('math')) {
      return <Calculator className="w-5 h-5" />;
    } else if (testName.toLowerCase().includes('verbal') || testName.toLowerCase().includes('english')) {
      return <MessageSquare className="w-5 h-5" />;
    } else if (testName.toLowerCase().includes('coding') || testName.toLowerCase().includes('programming')) {
      return <Code className="w-5 h-5" />;
    }
    
    return <BookOpen className="w-5 h-5" />;
  };

  // Get test type color
  const getTestTypeColor = (testName) => {
    const colors = {
      'Html': 'from-blue-400 to-blue-600',
      'Python': 'from-emerald-400 to-emerald-600',
      'JavaScript': 'from-amber-400 to-amber-600',
      'Java': 'from-rose-400 to-rose-600',
      'React': 'from-cyan-400 to-cyan-600',
      'Node.js': 'from-green-400 to-green-600',
      'SQL': 'from-violet-400 to-violet-600',
      'CSS': 'from-indigo-400 to-indigo-600',
    };
    
    for (const [key, color] of Object.entries(colors)) {
      if (testName.toLowerCase().includes(key.toLowerCase())) {
        return color;
      }
    }
    
    // Default colors
    const defaultColors = [
      'from-blue-400 to-blue-600',
      'from-emerald-400 to-emerald-600',
      'from-violet-400 to-violet-600',
      'from-amber-400 to-amber-600',
      'from-rose-400 to-rose-600',
      'from-cyan-400 to-cyan-600'
    ];
    
    const index = testName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % defaultColors.length;
    return defaultColors[index];
  };

  // Calculate additional stats
  const overallStats = useMemo(() => {
    if (!testScores.length) return null;
    
    const testNames = Object.keys(groupedTests);
    
    return {
      testNames,
      totalDifferentTests: testNames.length,
      mostAttemptedTest: testNames.reduce((most, current) => {
        return groupedTests[current].totalAttempts > groupedTests[most]?.totalAttempts ? current : most;
      }, testNames[0]),
      highestScoreAmongAll: Math.max(...Object.values(groupedTests).map(g => g.highestScore))
    };
  }, [groupedTests, testScores]);

  // Check if test can be started
  const canStartTest = selectedSchedule && 
    selectedSchedule.status === 'running' && 
    hasValidInterest && 
    !testScores.some(score => 
      score.certificateId && 
      selectedSchedule.testId === score.certificateId &&
      score.result === 'pass'
    );

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
              <button
                onClick={manualCheckResults}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Check Results
              </button>
              
              <button
                onClick={handleTestFinished}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                I've Finished
              </button>
              
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
              ref={iframeRef}
              src={testUrl}
              className="w-full h-full"
              title="Aptitude Test"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="fullscreen"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
              allowFullScreen
              style={{ border: 'none' }}
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Connected to test platform</span>
              </div>
              <div className="hidden md:block">•</div>
              <div className="hidden md:flex items-center gap-2">
                <span className="text-blue-600 font-medium">Auto-check active:</span>
                <span>Results will appear automatically when test completes</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              <Clock className="w-4 h-4 inline mr-1" />
              <span>Auto-close in: 3:00</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Overall Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Average Score",
                value: stats.averageScore,
                suffix: "/100",
                icon: BarChart3,
                iconColor: "text-blue-500",
                bgColor: "bg-blue-50",
                trend: "Across all tests"
              },
              {
                label: "Best Score",
                value: stats.bestScore,
                suffix: "/100",
                icon: Trophy,
                iconColor: "text-emerald-500",
                bgColor: "bg-emerald-50",
                trend: "Highest among all"
              },
              {
                label: "Total Tests",
                value: stats.totalTests,
                suffix: "",
                icon: Users,
                iconColor: "text-violet-500",
                bgColor: "bg-violet-50",
                trend: "Total attempts made"
              },
              {
                label: "Test Types",
                value: overallStats?.totalDifferentTests || 0,
                suffix: "",
                icon: FolderOpen,
                iconColor: "text-amber-500",
                bgColor: "bg-amber-50",
                trend: "Different test categories"
              }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300"
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

          {/* Test Type Statistics with Expandable Cards */}
          {Object.keys(groupedTests).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Test Performance by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedTests).map(([testName, data], index) => (
                  <motion.div
                    key={testName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                  >
                    {/* Card Header - Clickable */}
                    <button
                      onClick={() => setExpandedTestType(expandedTestType === testName ? null : testName)}
                      className="w-full p-5 text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 bg-gradient-to-br ${getTestTypeColor(testName)} rounded-lg text-white`}>
                            {getTestTypeIcon(testName)}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{testName}</h3>

                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(data.highestScore)}`}>
                          <span className={`font-bold ${getScoreColor(data.highestScore)}`}>
                            {data.highestScore}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Highest Score:</span>
                          <span className={`font-semibold ${getScoreColor(data.highestScore)}`}>
                            {data.highestScore}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Average Score:</span>
                          <span className="font-semibold text-gray-900">
                            {data.averageScore}/100
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Latest Score:</span>
                          <span className="font-semibold text-gray-900">
                            {data.latestAttempt?.score || 'N/A'}/100
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Award className="w-4 h-4 text-amber-500" />
                          <span>Best attempt: {formatDate(data.bestAttempt?.receivedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-gray-500">
                            {getPerformanceLevel(data.highestScore)}
                          </span>
                          {expandedTestType === testName ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expandable Content - Previous Test Results */}
                    <AnimatePresence>
                      {expandedTestType === testName && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100"
                        >
                          <div className="p-5">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-semibold text-gray-900">Previous Attempts</h4>
                              <div className="flex items-center gap-2">
                                <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                                  Pass: {data.passCount}
                                </span>
                                <span className="text-xs px-2 py-1 bg-rose-50 text-rose-700 rounded-full">
                                  Fail: {data.failCount}
                                </span>
                              </div>
                            </div>
                            
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                              {data.tests.map((test, idx) => (
                                <motion.div
                                  key={test._id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className={`p-3 rounded-lg border ${getScoreBgColor(test.score)}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-semibold ${getScoreColor(test.score)}`}>
                                          {test.score}/100
                                        </span>
                                        <div className={`text-xs px-2 py-0.5 rounded-full ${
                                          test.result === 'pass' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-rose-100 text-rose-800'
                                        }`}>
                                          {test.result === 'pass' ? 'PASSED' : 'FAILED'}
                                        </div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {formatDate(test.receivedAt)}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-gray-700">
                                        {Math.floor(test.timeTaken / 60) || '--'} min
                                      </div>
                                      {test.certificateId && (
                                        <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                          ID: {test.certificateId}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            
                            {data.tests.length === 0 && (
                              <div className="text-center py-4">
                                <p className="text-gray-500">No test attempts found</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* No Tests State */}
          {testScores.length === 0 && Object.keys(groupedTests).length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-200 p-8 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-50 rounded-full flex items-center justify-center">
                <Brain className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Test History Yet</h3>
              <p className="text-gray-600 mb-6">Take your first aptitude test to see your performance statistics here.</p>
            </motion.div>
          )}
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
                      {/* Test Schedule Selector */}
                      {testSchedules.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <CalendarDays className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">Test Schedule</h3>
                              <p className="text-gray-600">Select a test to participate</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                            {testSchedules.map((schedule) => {
                              const statusConfig = getStatusConfig(schedule.status);
                              const isSelected = selectedSchedule?._id === schedule._id;
                              
                              return (
                                <motion.button
                                  key={schedule._id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    setSelectedSchedule(schedule);
                                    if (schedule.status === 'upcoming') {
                                      calculateTimeLeft(schedule.startTime);
                                    }
                                    setInterestedCount(schedule.interestedCount || 0);
                                    setInterestedUsers(schedule.interestedUsers || []);
                                    
                                    const isInterestedInThis = schedule.status === 'running' || 
                                                              schedule.interestedUsers?.some(
                                                                user => user.userId === 'current-user' || 
                                                                        user.userId === schedule.userId
                                                              );
                                    setIsInterested(isInterestedInThis);
                                    setHasValidInterest(isInterestedInThis);
                                  }}
                                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                                    isSelected
                                      ? 'border-blue-500 bg-blue-50'
                                      : 'border-gray-200 bg-white hover:border-blue-200'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900 truncate">{schedule.testName}</h4>
                                      <p className="text-sm text-gray-500 truncate">{schedule.description || 'Aptitude test'}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                                      {statusConfig.icon}
                                      <span>{statusConfig.text}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2 mt-3">
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Duration:</span>
                                      <span className="font-medium text-gray-900">{formatDuration(schedule.testDuration)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Questions:</span>
                                      <span className="font-medium text-gray-900">{schedule.totalQuestions}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                      <span className="text-gray-600">Pass Score:</span>
                                      <span className="font-medium text-gray-900">{schedule.passScore}/100</span>
                                    </div>
                                  </div>
                                  
                                  {isSelected && (
                                    <motion.div
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="mt-3 pt-3 border-t border-gray-200"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                          <Calendar className="w-3 h-3 inline mr-1" />
                                          {formatLocalDateTime(schedule.startTime).split(',')[0]}

                                        </div>
                                       <div className="text-sm text-gray-600">
  <Clock className="w-3 h-3 inline mr-1" />
  {formatLocalTime(schedule.startTime)}
</div>
                                      </div>
                                    </motion.div>
                                  )}
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Selected Test Info */}
                      {selectedSchedule && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Calendar className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-bold text-gray-900">{selectedSchedule.testName}</h3>
                                  <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusConfig(selectedSchedule.status).color}`}>
                                    {getStatusConfig(selectedSchedule.status).icon}
                                    <span>{getStatusConfig(selectedSchedule.status).text}</span>
                                  </div>
                                </div>
                                <p className="text-gray-600">{selectedSchedule.description || 'Cognitive aptitude assessment'}</p>
                              </div>
                            </div>
                            
                            {interestedUsers.length > 0 && selectedSchedule.status !== 'completed' && selectedSchedule.status !== 'cancelled' && (
                              <div className="flex -space-x-2 mr-2">
                                {interestedUsers.slice(0, 3).map((user, index) => (
                                  <div
                                    key={user.userId || index}
                                    className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                                    title={`${user.name || 'User'}`}
                                  >
                                    {user.avatar ? (
                                      <img
                                        src={user.avatar}
                                        alt={`${user.name || 'User'}`}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className={`w-full h-full rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(user.userId)}`}>
                                        {getUserInitials(user.name, user.lastName)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {interestedCount > 3 && (
                                  <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-medium text-blue-700">
                                    +{interestedCount - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Test Details Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">Duration</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{formatDuration(selectedSchedule.testDuration)}</div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-emerald-500" />
                                <span className="text-sm font-medium text-gray-700">Questions</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{selectedSchedule.totalQuestions}</div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Target className="w-4 h-4 text-amber-500" />
                                <span className="text-sm font-medium text-gray-700">Pass Score</span>
                              </div>
                              <div className="text-lg font-bold text-gray-900">{selectedSchedule.passScore}/100</div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-violet-500" />
                                <span className="text-sm font-medium text-gray-700">Start Time</span>
                              </div>
                             <div className="text-sm font-bold text-gray-900">
  {formatLocalDateTime(selectedSchedule.startTime)}
</div>
                            </div>
                          </div>
                          
                          {/* Countdown Timer for Upcoming Tests */}
                          {selectedSchedule.status === 'upcoming' && (
                            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-blue-500" />
                                <span className="text-sm font-medium text-gray-700">Starts In:</span>
                              </div>
                              <div className="flex items-center justify-center gap-2">
                                {timeLeft.days > 0 && (
                                  <>
                                    <div className="text-center">
                                      <div className="text-2xl font-bold text-gray-900">{String(timeLeft.days).padStart(2, '0')}</div>
                                      <div className="text-xs text-gray-500">Days</div>
                                    </div>
                                    <div className="text-xl font-bold text-gray-400">:</div>
                                  </>
                                )}
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</div>
                                  <div className="text-xs text-gray-500">Hours</div>
                                </div>
                                <div className="text-xl font-bold text-gray-400">:</div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</div>
                                  <div className="text-xs text-gray-500">Minutes</div>
                                </div>
                                <div className="text-xl font-bold text-gray-400">:</div>
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</div>
                                  <div className="text-xs text-gray-500">Seconds</div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Action Buttons */}
                          <div className="flex items-center justify-between">
                            {/* Show "Mark as Interested" button only for upcoming tests AND user is NOT already interested */}
                            {selectedSchedule.status === 'upcoming' && !isInterested && (
                              <button
                                onClick={handleInterestedClick}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                              >
                                <UserPlus className="w-4 h-4" />
                                Mark as Interested
                              </button>
                            )}
                            
                            {/* Show "Interested ✓" button for upcoming tests when user IS already interested */}
                            {selectedSchedule.status === 'upcoming' && isInterested && (
                              <button
                                onClick={handleRemoveInterest}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                              >
                                <UserPlus className="w-4 h-4" />
                                Interested ✓
                              </button>
                            )}
                            
                            {/* Show "Start Test" button only for running tests AND user has valid interest */}
                            {selectedSchedule.status === 'running' && hasValidInterest && (
                              <button
                                onClick={startAptitudeTest}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-colors flex items-center gap-2"
                              >
                                {loading ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Starting...
                                  </>
                                ) : (
                                  <>
                                    <Zap className="w-4 h-4" />
                                    Start Test Now
                                  </>
                                )}
                              </button>
                            )}
                            
                            {/* Message for running tests when user has NO valid interest */}
                            {selectedSchedule.status === 'running' && !hasValidInterest && (
                              <div className="text-center w-full">
                                <div className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg font-medium">
                                  <AlertCircle className="w-4 h-4 inline mr-2" />
                                  {isInterested ? 'Your interest has expired' : 'You need to be interested to take this test'}
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {isInterested 
                                    ? 'You have already taken this test. Cannot retake.' 
                                    : 'Mark interest when it was upcoming'}
                                </p>
                              </div>
                            )}
                            
                            {selectedSchedule.status === 'completed' && (
                              <div className="text-center w-full">
                                <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium">
                                  <CheckCircle className="w-4 h-4 inline mr-2" />
                                  Test Completed
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {testScores.some(score => 
                                    score.certificateId === selectedSchedule.testId && 
                                    score.result === 'pass'
                                  ) 
                                    ? 'You passed this test!' 
                                    : 'This test has ended'
                                  }
                                </p>
                              </div>
                            )}
                            
                            {selectedSchedule.status === 'cancelled' && (
                              <div className="text-center w-full">
                                <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium">
                                  <XCircle className="w-4 h-4 inline mr-2" />
                                  Test Cancelled
                                </div>
                                <p className="text-sm text-gray-500 mt-1">This test has been cancelled</p>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}

                      <div className="text-center space-y-6">
                        <div className="inline-flex flex-col items-center">
                          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <Play className="w-12 h-12 text-white" />
                            </div>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900">Ready to Begin?</h3>
                          <p className="text-gray-600 mt-2">
                            {selectedSchedule && selectedSchedule.status === 'upcoming'
                              ? `Test "${selectedSchedule.testName}" will start soon`
                              : selectedSchedule && selectedSchedule.status === 'running' && hasValidInterest
                              ? `Test "${selectedSchedule.testName}" is live now!`
                              : selectedSchedule && selectedSchedule.status === 'running' && !hasValidInterest
                              ? `You cannot retake "${selectedSchedule.testName}"`
                              : 'Select a test from the schedule to participate'}
                          </p>
                        </div>

                        <button
                          onClick={startAptitudeTest}
                          disabled={loading || !canStartTest}
                          className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg flex items-center gap-3 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {loading ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Starting Test...
                            </>
                          ) : !selectedSchedule ? (
                            <>
                              <AlertTriangle className="w-5 h-5" />
                              Select a Test First
                            </>
                          ) : selectedSchedule.status === 'upcoming' ? (
                            <>
                              <Clock className="w-5 h-5" />
                              Test Starts In {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{timeLeft.hours}h {timeLeft.minutes}m
                            </>
                          ) : selectedSchedule.status === 'running' && !hasValidInterest ? (
                            <>
                              <AlertCircle className="w-5 h-5" />
                              Cannot Retake Test
                            </>
                          ) : selectedSchedule.status === 'running' && hasValidInterest ? (
                            <>
                              <Zap className="w-5 h-5" />
                              Start Test Now
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-5 h-5" />
                              Test Not Available
                            </>
                          )}
                        </button>
                        
                        <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
                          <p>💡 <strong>Note:</strong> After completing the test, the window will close automatically.</p>
                          <p>If it doesn't close, use the "I've Finished" button in the test window.</p>
                          {selectedSchedule && (
                            <p className="mt-1">You need to score at least {selectedSchedule.passScore} to pass this test.</p>
                          )}
                          {selectedSchedule?.status === 'running' && !hasValidInterest && (
                            <p className="mt-1 text-amber-600 font-medium">
                              ⚠️ You can only take this test once. Your interest is invalidated after completion.
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Information */}
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
                      { 
                        number: 1, 
                        title: "Browse Schedule", 
                        description: "Check upcoming and running tests from the schedule" 
                      },
                      { 
                        number: 2, 
                        title: "Mark Interest", 
                        description: "Show interest in upcoming tests to participate" 
                      },
                      { 
                        number: 3, 
                        title: "Join Live Test", 
                        description: "Participate in running tests (must be interested)" 
                      },
                      { 
                        number: 4, 
                        title: "Get Results", 
                        description: "Receive score and performance analysis instantly" 
                      }
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

              {/* Quick Stats */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Quick Stats</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Tests Taken</span>
                    <span className="font-bold">{stats.totalTests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Best Score</span>
                    <span className="font-bold">{stats.bestScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Score</span>
                    <span className="font-bold">{stats.averageScore}/100</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Different Test Types</span>
                    <span className="font-bold">{overallStats?.totalDifferentTests || 0}</span>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="w-6 h-6" />
                  <h3 className="text-lg font-bold">Pro Tips</h3>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Mark interest in upcoming tests to ensure participation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Aim for the pass score to qualify for certificates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Check the test duration and prepare accordingly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">Review your performance to improve in weak areas</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Name Input Modal */}
      <AnimatePresence>
        {showNameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <UserPlus className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Show Your Interest</h3>
                    <p className="text-sm text-gray-500">We'll use your name for the e-certificate</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter your first name"
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">This will appear on your e-certificate</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="Enter your last name (optional)"
                  />
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <Star className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-700">
                        By marking interest, you'll receive test reminders and a personalized e-certificate upon completion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitInterest}
                  disabled={!firstName.trim() || submittingInterest}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingInterest ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      Mark as Interested
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Result Modal */}
      <AnimatePresence>
        {showResultModal && testResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResultModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`rounded-2xl w-full max-w-md overflow-hidden shadow-2xl ${
                isPassed 
                  ? 'bg-gradient-to-br from-emerald-50 to-green-50' 
                  : 'bg-gradient-to-br from-rose-50 to-red-50'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className={`p-6 ${isPassed ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      {isPassed ? (
                        <Trophy className="w-6 h-6 text-white" />
                      ) : (
                        <AlertTriangle className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {isPassed ? 'Congratulations! 🎉' : 'Better Luck Next Time! 😊'}
                      </h3>
                      <p className="text-white/90 text-sm">
                        {selectedSchedule?.testName || 'Aptitude Test'} Completed
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Score Circle */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-8 flex items-center justify-center"
                      style={{
                        borderColor: isPassed 
                          ? 'rgba(34, 197, 94, 0.2)' 
                          : 'rgba(244, 63, 94, 0.2)',
                        background: isPassed
                          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)'
                          : 'linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(244, 63, 94, 0.05) 100%)'
                      }}
                    >
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          isPassed ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {testResult.score}
                        </div>
                        <div className="text-sm text-gray-500">out of 100</div>
                      </div>
                    </div>
                    
                    {/* Score Indicator */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isPassed 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isPassed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Result Details */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Your Score</div>
                      <div className={`text-xl font-bold ${
                        isPassed ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {testResult.score}/100
                      </div>
                    </div>
                    <div className="bg-white/50 rounded-lg p-4 text-center">
                      <div className="text-sm text-gray-500 mb-1">Passing Score</div>
                      <div className="text-xl font-bold text-gray-700">
                        {testResult.passScore}/100
                      </div>
                    </div>
                  </div>

                  {testResult.certificateId && (
                    <div className="bg-white/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="w-4 h-4 text-blue-500" />
                        <div className="text-sm font-medium text-gray-700">Certificate ID</div>
                      </div>
                      <div className="font-mono text-sm bg-gray-100 p-2 rounded">
                        {testResult.certificateId}
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      {isPassed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-gray-700">
                          {isPassed 
                            ? "Congratulations! You've passed the aptitude test. Your e-certificate will be sent to your registered email address."
                            : `You scored ${testResult.score} points. The passing score was ${testResult.passScore}.`
                          }
                        </p>
                        {!isPassed && (
                          <p className="text-sm text-gray-600 mt-2">
                            Note: You cannot retake this test. Your interest has been invalidated.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowResultModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                  {isPassed && (
                    <button
                      onClick={() => {
                        toast.success('Certificate details will be emailed to you!');
                        setShowResultModal(false);
                      }}
                      className="flex-1 px-4 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      View Certificate
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AptitudeTest;
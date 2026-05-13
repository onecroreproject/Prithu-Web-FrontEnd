import React, { useState, useEffect } from 'react';
import {
  Users,
  TrendingUp,
  Copy,
  Share2,
  Gift,
  DollarSign,
  UserPlus,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  QrCode,
  Sparkles,
  Trophy,
  Wallet,
  Bell,
  Download,
  Filter,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReferralSharePopUp from '../components/Referral/ReferralSharePopUp';
import ReferralQRCodePopUp from '../components/Referral/ReferralQRCodePopUp';
import WithdrawalModal from '../components/Referral/WithdrawalModal';
import {
  getUserReferralCode,
  getUserEarningsTotal,
  getReferredPeople,
  logReferralActivity,
  getRecentActivities,
  getWithdrawalDetails,
  getReferralCycles,
  getCycleDetails
} from '../API_Services/referralServices';
import { checkUserActiveSubscription } from '../API_Services/subscriptionServices';
import toast from 'react-hot-toast';
import ReferralSharePopup from '../components/ReferralSharePopup';
import SEO from "../components/SEO";
import { useDownloads } from '../context/DownloadContext';

const ReferralPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalWithdrawn: 0,
    balance: 0,
    referralCode: '',
    successfulReferrals: 0
  });
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [referrals, setReferrals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });

  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const { setIsDownloadPopUpOpen } = useDownloads();
  const [cycles, setCycles] = useState([]);
  const [activeCycle, setActiveCycle] = useState(null);
  const [expandedCycle, setExpandedCycle] = useState(null); // ID of expanded cycle
  const [cycleDetails, setCycleDetails] = useState({}); // { cycleId: [referrals] }
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeFilter, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codeRes, earningsRes, peopleRes, activityRes, withdrawalRes, subRes, cyclesRes] = await Promise.all([
        getUserReferralCode(),
        getUserEarningsTotal(),
        getReferredPeople(pagination.page),
        getRecentActivities(),
        getWithdrawalDetails(),
        checkUserActiveSubscription(),
        getReferralCycles()
      ]);

      setIsSubscribed(subRes.success && subRes.isActive);

      setStats({
        totalEarnings: earningsRes.totalEarnings || 0,
        totalWithdrawn: earningsRes.totalWithdrawn || 0,
        balance: earningsRes.balance || 0,
        referralCode: codeRes.referralCode || 'N/A',
        successfulReferrals: peopleRes.pagination?.total || 0
      });

      setReferrals(peopleRes.data || []);
      setPagination(prev => ({ ...prev, total: peopleRes.pagination?.total || 0 }));
      setRecentActivity(activityRes.data || []);
      setWithdrawals(withdrawalRes.data || []);

      if (cyclesRes.success) {
        setCycles(cyclesRes.data || []);
        const active = cyclesRes.data?.find(c => c.status === 'active' || c.status === 'completed');
        setActiveCycle(active || null);
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };
  const toggleCycle = async (cycleId) => {
    if (expandedCycle === cycleId) {
      setExpandedCycle(null);
      return;
    }

    setExpandedCycle(cycleId);
    if (!cycleDetails[cycleId]) {
      setLoadingDetails(true);
      try {
        const res = await getCycleDetails(cycleId);
        if (res.success) {
          setCycleDetails(prev => ({ ...prev, [cycleId]: res.data }));
        }
      } catch (error) {
        console.error("Error fetching cycle details:", error);
        toast.error("Failed to load referral details");
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const handleEditWithdrawal = (withdrawal) => {
    setEditingWithdrawal(withdrawal);
    setIsWithdrawModalOpen(true);
  };

  const closeWithdrawModal = () => {
    setIsWithdrawModalOpen(false);
    setEditingWithdrawal(null);
  };

  const handleSubscriptionRestrictedAction = async (action) => {
    try {
      const res = await checkUserActiveSubscription();
      const isActive = res.success && res.isActive;
      setIsSubscribed(isActive);
      if (isActive) {
        action();
      } else {
        navigate('/home/subscriptions?highlight=premium');
      }
    } catch (error) {
      console.error("Subscription check failed:", error);
      toast.error("Unable to verify subscription status");
    }
  };

  const copyToClipboard = async (medium = 'Copy Link') => {
    try {
      const referralLink = `${window.location.origin}/signup?ref=${stats.referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Referral link copied!");

      await logReferralActivity({
        referralCode: stats.referralCode,
        activityType: 'share',
        sharingMedium: medium
      });
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const shareReferral = async (medium) => {
    setIsSharePopupOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500';
      case 'failed': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  if (loading && stats.referralCode === '') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 animate-in fade-in duration-500">
      <SEO
        title="Prithu Referral - Invite & Earn Rewards"
        description="Share your referral code on Prithu to invite friends, earn rewards, unlock benefits & enjoy more status videos, motivational & trending reels together."
        keywords="Prithu referral, earn rewards, invite friends, referral code, trending reels, status videos rewards"
        canonical="https://prithu.app/home/referral"
      />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Refer & Earn
            </h1>
            <p className="text-gray-600 mt-2">Invite friends and earn ₹100 for each successful referral</p>
          </div>

          <div className="flex items-center gap-3 animate-in slide-in-from-right duration-500 delay-100">
            {activeCycle?.status === 'completed' && stats.balance > 0 && (
              <button
                onClick={() => setIsWithdrawModalOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-green-500 text-green-600 rounded-2xl hover:bg-green-50 transition-all duration-300 hover:-translate-y-1 active:scale-95 group font-bold animate-bounce"
              >
                <Wallet className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Withdraw ₹{stats.balance}
              </button>
            )}
            <button
              onClick={() => handleSubscriptionRestrictedAction(() => setIsSharePopupOpen(true))}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
            >
              <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold">Invite Friends</span>
            </button>
          </div>
        </div>



        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom  group hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <Sparkles className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">₹{stats.totalEarnings}</h3>
            <p className="text-gray-600 text-sm">Total Earnings</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-full transition-all duration-700"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom  delay-100 group hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.successfulReferrals}</h3>
            <p className="text-gray-600 text-sm">Total Referrals</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-full transition-all duration-700"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom duration-500 delay-200 group hover:shadow-xl transition-all  hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <Award className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">₹{stats.totalWithdrawn}</h3>
            <p className="text-gray-600 text-sm">Withdrawn</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 w-full transition-all duration-700"></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Referral Code Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 shadow-xl overflow-hidden relative animate-in fade-in duration-500">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24"></div>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Your Referral Code</h2>
                    <p className="text-blue-100">Share this code with friends to earn ₹100 each</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
                  <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <code className="text-xl font-mono font-bold text-white tracking-wider">
                        {isSubscribed ? stats.referralCode : "Subscribe to earn"}
                      </code>
                      <button
                        onClick={() => handleSubscriptionRestrictedAction(() => copyToClipboard('Copy Link'))}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        {isSubscribed && <Copy className="w-4 h-4" />}
                        {!isSubscribed ? 'Subscribe' : (copied ? 'Copied!' : 'Copy')}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubscriptionRestrictedAction(() => setIsSharePopupOpen(true))}
                      className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={() => handleSubscriptionRestrictedAction(() => setIsQRModalOpen(true))}
                      className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 hover:scale-105 active:scale-95 border border-white/30"
                    >
                      <QrCode className="w-4 h-4" />
                      QR Code
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <UserPlus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">Per Referral</p>
                        <p className="text-white font-bold text-lg">₹100</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">No Limit</p>
                        <p className="text-white font-bold text-lg">Unlimited</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Cycle History / Expired Earnings Section */}
            {isSubscribed && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mt-8 p-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Referral Cycle History</h3>
                    <p className="text-gray-600 text-sm mt-1">30-day windows to reach 25 referrals</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                </div>

                <div className="space-y-4">
                  {cycles.length > 0 ? cycles.map((cycle) => (
                    <div key={cycle._id} className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-blue-200">
                      <div className="p-4 bg-gray-50/50 flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cycle.status === 'active' ? 'bg-blue-100 text-blue-600' :
                              cycle.status === 'completed' ? 'bg-green-100 text-green-600' :
                                cycle.status === 'expired' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                              }`}>
                              {cycle.status}
                            </span>
                            <span className="text-sm text-gray-400 font-medium">
                              {new Date(cycle.startDate).toLocaleDateString()} - {new Date(cycle.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="text-gray-500 italic">Referrals: </span>
                              <span className="font-bold text-gray-800">{cycle.referralCount}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500 italic">Earned: </span>
                              <span className="font-bold text-green-600">₹{cycle.earnedAmount}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => toggleCycle(cycle._id)}
                          className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-200"
                        >
                          <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${expandedCycle === cycle._id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>

                      {expandedCycle === cycle._id && (
                        <div className="p-4 bg-white border-t border-gray-100 animate-in slide-in-from-top-2 duration-300">
                          {loadingDetails ? (
                            <div className="flex items-center justify-center py-8">
                              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : cycleDetails[cycle._id]?.length > 0 ? (
                            <div className="space-y-3">
                              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Cycle Referrals</h4>
                              <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                {cycleDetails[cycle._id].map((detail) => (
                                  <div key={detail._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 mb-2 last:mb-0">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs">
                                        {detail.userName.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-bold text-gray-800 text-xs">{detail.userName}</p>
                                        <p className="text-[10px] text-gray-500">{detail.mobileNumber}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] text-gray-400">{new Date(detail.referralDate).toLocaleDateString()}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-400 text-sm italic">
                              No referrals recorded in this cycle.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No referral cycles found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Referrals List */}
            {isSubscribed && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mt-8 animate-in fade-in duration-500 delay-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">Referral History</h3>
                      <p className="text-gray-600 text-sm mt-1">Track all your referrals and earnings</p>
                    </div>
                    <div className="flex gap-2">
                      {['all', 'completed', 'pending'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize ${activeFilter === filter ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Name</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                        <th className="text-left p-4 text-sm font-medium text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.length > 0 ? referrals.map((referral, index) => (
                        <tr
                          key={referral._id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors animate-in fade-in slide-in-from-bottom duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center overflow-hidden">
                                {referral.avatar ? (
                                  <img src={referral.avatar} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="font-bold text-blue-600">
                                    {referral.username?.charAt(0).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{referral.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-700">
                            {new Date(referral.referralDate).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('completed')}`}>
                              Completed
                            </span>
                          </td>
                          <td className="p-4 font-bold text-gray-800">₹100</td>
                          <td className="p-4 text-right">
                            <ChevronRight className="w-4 h-4 text-gray-400 inline" />
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan="5" className="p-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-2">
                              <Users className="w-12 h-12 text-gray-200" />
                              <p>No referrals yet. Start sharing your code!</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Withdrawal History Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mt-8 animate-in fade-in duration-500 delay-300">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800">Withdrawal History</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Invoice</th>
                      <th className="text-right p-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawals.length > 0 ? withdrawals.map((w, index) => (
                      <tr key={w._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                        <td className="p-4 font-bold text-gray-800">₹{w.withdrawalAmount}</td>
                        <td className="p-4 text-gray-700">{new Date(w.requestedAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(w.status)}`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {w.invoiceUrl ? (
                            <button 
                              onClick={() => setIsDownloadPopUpOpen(true)} 
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Download className="w-4 h-4" /> Download
                            </button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          {w.status === 'pending' && (
                            <button
                              onClick={() => handleEditWithdrawal(w)}
                              className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Modify
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="p-12 text-center text-gray-500">
                          No withdrawal history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-in fade-in slide-in-from-right duration-500 delay-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Activity</h3>
                <Bell className="w-5 h-5 text-gray-400" />
              </div>

              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div
                    key={activity._id}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all duration-300 border border-transparent hover:border-gray-100"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`p-2 rounded-lg ${activity.activityType === 'reward' ? 'bg-green-100' :
                      activity.activityType === 'signup' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      {activity.activityType === 'reward' ? (
                        <Gift className="w-4 h-4 text-green-600" />
                      ) : activity.activityType === 'signup' ? (
                        <UserPlus className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Share2 className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {activity.activityType === 'share' ? `Shared via ${activity.sharingMedium}` :
                          activity.activityType === 'signup' ? `${activity.referredUserName || 'Someone'} joined` :
                            activity.activityType === 'reward' ? `Reward from ${activity.referredUserName || 'Referral'}` : 'Activity'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-sm text-gray-500">{new Date(activity.activityDate).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    {activity.earnedAmount > 0 && (
                      <div className="font-bold text-green-600">+₹{activity.earnedAmount}</div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No recent activities.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-in fade-in duration-500 delay-300">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Earnings Breakdown</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span className="font-bold text-blue-900">Milestone Target</span>
                  </div>
                  <p className="text-sm text-blue-700">Invite <strong>25 friends within 30 days</strong> to achieve your referral milestone and unlock extra rewards!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInFromBottom { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInFromLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInFromRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        .animate-in { animation-fill-mode: both; }
        .fade-in { animation: fadeIn 0.5s ease-out; }
        .slide-in-from-bottom { animation: slideInFromBottom 0.6s ease-out; }
        .slide-in-from-left { animation: slideInFromLeft 0.6s ease-out; }
        .slide-in-from-right { animation: slideInFromRight 0.6s ease-out; }
      `}</style>
      <ReferralSharePopUp
        isOpen={isSharePopupOpen}
        onClose={() => setIsSharePopupOpen(false)}
        referralCode={stats.referralCode}
      />
      <ReferralQRCodePopUp
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        referralCode={stats.referralCode}
      />
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={closeWithdrawModal}
        balance={stats.balance}
        initialData={editingWithdrawal}
        onWithdrawalSuccess={fetchData}
      />
    </div>
  );
};

export default ReferralPage;

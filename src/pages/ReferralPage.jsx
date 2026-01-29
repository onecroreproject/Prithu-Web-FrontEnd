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
  Filter
} from 'lucide-react';
import ReferralSharePopUp from '../components/Referral/ReferralSharePopUp';
import ReferralQRCodePopUp from '../components/Referral/ReferralQRCodePopUp';
import {
  getUserReferralCode,
  getUserEarningsTotal,
  getReferredPeople,
  logReferralActivity,
  getRecentActivities,
  getWithdrawalDetails
} from '../API_Services/referralServices';
import toast from 'react-hot-toast';
import ReferralSharePopup from '../components/ReferralSharePopup';

const ReferralPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalWithdrawn: 0,
    balance: 0,
    referralCode: '',
    successfulReferrals: 0
  });

  const [referrals, setReferrals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10 });

  const [copied, setCopied] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeFilter, pagination.page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [codeRes, earningsRes, peopleRes, activityRes, withdrawalRes] = await Promise.all([
        getUserReferralCode(),
        getUserEarningsTotal(),
        getReferredPeople(pagination.page),
        getRecentActivities(),
        getWithdrawalDetails()
      ]);

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
    } catch (error) {
      console.error("Error fetching referral data:", error);
      toast.error("Failed to load referral data");
    } finally {
      setLoading(false);
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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Refer & Earn
            </h1>
            <p className="text-gray-600 mt-2">Invite friends and earn ₹25 for each successful referral</p>
          </div>

          <div className="flex items-center gap-3 animate-in slide-in-from-right duration-500 delay-100">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95">
              <Download className="w-4 h-4" />
              <span className="font-medium">Export</span>
            </button>
            <button
              onClick={() => setIsSharePopupOpen(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 active:scale-95 group"
            >
              <Gift className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              <span className="font-bold">Invite Friends</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom duration-500 group hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <Sparkles className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">₹{stats.totalEarnings}</h3>
            <p className="text-gray-600 text-sm">Total Earnings</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 w-3/4 transition-all duration-700"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom duration-500 delay-100 group hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">{stats.successfulReferrals}</h3>
            <p className="text-gray-600 text-sm">Total Referrals</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-2/3 transition-all duration-700"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom duration-500 delay-150 group hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-6 h-6 text-purple-500" />
              </div>
              <DollarSign className="w-5 h-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">₹{stats.balance}</h3>
            <p className="text-gray-600 text-sm">Current Balance</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-400 w-1/2 transition-all duration-700"></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 animate-in fade-in slide-in-from-bottom duration-500 delay-200 group hover:shadow-xl transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <Award className="w-5 h-5 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-1">₹{stats.totalWithdrawn}</h3>
            <p className="text-gray-600 text-sm">Withdrawn</p>
            <div className="mt-4 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-orange-400 w-5/6 transition-all duration-700"></div>
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
                    <p className="text-blue-100">Share this code with friends to earn ₹25 each</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center mb-8">
                  <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between">
                      <code className="text-2xl font-mono font-bold text-white tracking-wider">
                        {stats.referralCode}
                      </code>
                      <button
                        onClick={() => copyToClipboard('Copy Link')}
                        className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95"
                      >
                        <Copy className="w-4 h-4" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsSharePopupOpen(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 font-medium"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <button
                      onClick={() => setIsQRModalOpen(true)}
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
                        <p className="text-white font-bold text-lg">₹25</p>
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

            {/* Referrals List */}
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
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 animate-in fade-in slide-in-from-bottom duration-300"
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
                        <td className="p-4 font-bold text-gray-800">₹25</td>
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
                            <a href={w.invoiceUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              <Download className="w-4 h-4" /> Download
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
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
                    <span className="font-bold text-blue-900">Weekly Performance</span>
                  </div>
                  <p className="text-sm text-blue-700">You've reached {stats.successfulReferrals} referrals! Keep it up to unlock special bonuses.</p>
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
    </div>
  );
};

export default ReferralPage;

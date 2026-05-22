import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import {
  Check,
  Crown,
  Zap,
  Shield,
  Sparkles,
  TrendingUp,
  CreditCard,
  Calendar,
  ArrowRight,
  Star,
  Gift,
  Users,
  Clock,
  X,
  RefreshCw,
  AlertCircle,
  Timer,
  Clock3,
  CheckCircle,
  XCircle,
  Info,
  Rocket,
  Target,
  Award,
  Heart
} from 'lucide-react';
import {
  getAllSubscriptionPlans,
  getUserSubscriptionActive,
  subscribePlan,
  cancelSubscriptionApi,
  activateTrialPlanApi,
  checkTrialEligibilityApi,
  createInstifiPaymentApi,
  verifyInstifiPaymentApi
} from '../API_Services/subscriptionServices';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import SEO from "../components/SEO";
import InvoiceHistory from '../components/Subscription/InvoiceHistory';


const SubscriptionPage = () => {
  const { user, fetchUserProfile } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [subscriptions, setSubscriptions] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'verifying', 'success', 'failed', 'pending', null
  const [verificationDetails, setVerificationDetails] = useState(null);
  const verificationInProgressRef = React.useRef(false);

  // Parse query parameters
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const highlightParam = queryParams.get('highlight');
  const [error, setError] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [trialStatus, setTrialStatus] = useState({
    isEligible: false,
    hasUsedTrial: false,
    trialExpiresAt: null,
    trialActive: false,
    trialRemainingDays: 0
  });

  useEffect(() => {
    fetchSubscriptions();
    fetchUserSubscription();
    checkTrialEligibility();
  }, []);

  useEffect(() => {
    console.log('[SubscriptionPage] State Updated:', {
      subscriptions,
      userSubscription,
      trialStatus,
      loading
    });
  }, [subscriptions, userSubscription, trialStatus, loading]);

  useEffect(() => {
    const txn = searchParams.get('TxnId') || searchParams.get('txnId') || searchParams.get('txn') || searchParams.get('transactionId');
    if (txn && !verificationInProgressRef.current) {
      verificationInProgressRef.current = true;
      console.log('[SubscriptionPage] URL transaction ID detected:', txn);
      verifyPaymentTransaction(txn);
    }
  }, [searchParams]);

  const verifyPaymentTransaction = async (txn) => {
    try {
      console.log('[SubscriptionPage] Verifying Instifi payment transaction ID:', txn);
      setVerificationStatus('verifying');
      
      const response = await verifyInstifiPaymentApi({ transactionId: txn });
      console.log('[SubscriptionPage] Payment verification API response:', response);
      
      // Clean up URL parameters immediately so page refreshes won't repeat verification
      window.history.replaceState({}, document.title, window.location.pathname);

      if (response.success) {
        const status = response.status; // 'success', 'failed', 'pending', 'cancelled'
        setVerificationStatus(status);
        // Store both gateway data AND receipt info
        setVerificationDetails({
          ...(response.data || {}),
          receipt: response.receipt || null
        });

        if (status === 'success') {
          toast.success('🎉 Payment verified! Subscription activated.');
          fetchUserSubscription();
          checkTrialEligibility();
          if (fetchUserProfile) {
            fetchUserProfile();
          }
        } else if (status === 'cancelled') {
          toast.error('Payment was cancelled. You can try again anytime.');
        } else if (status === 'failed') {
          toast.error('❌ Payment failed. Please try again.');
        } else {
          toast.error('⏳ Payment is still pending.');
        }
      } else {
        setVerificationStatus('failed');
        toast.error(response.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('[SubscriptionPage] Verification error:', err);
      setVerificationStatus('failed');
      toast.error(err.message || 'Error verifying payment status');
      window.history.replaceState({}, document.title, window.location.pathname);
    } finally {
      verificationInProgressRef.current = false;
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      console.log('[SubscriptionPage] Fetching subscription plans...');
      const data = await getAllSubscriptionPlans();
      console.log('[SubscriptionPage] Subscription plans response:', data);
      if (data.success) {
        setSubscriptions(data.plans || []);
        if (data.plans?.length > 1) {
          setSelectedPlan(data.plans[1]);
        } else if (data.plans?.length > 0) {
          setSelectedPlan(data.plans[0]);
        }
      }
    } catch (err) {
      console.error('[SubscriptionPage] Failed to load subscription plans:', err);
      setError(err.message || 'Failed to load subscription plans.');
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      console.log('[SubscriptionPage] Fetching active user subscription...');
      const data = await getUserSubscriptionActive();
      console.log('[SubscriptionPage] User subscription response:', data);
      if (data.success) {
        setUserSubscription(data.plan);
        if (data.plan?.planId?.planType === 'trial') {
          const endDate = new Date(data.plan.endDate);
          const now = new Date();
          const isTrialStillActive = now < endDate;

          setTrialStatus(prev => ({
            ...prev,
            hasUsedTrial: true,
            trialActive: isTrialStillActive,
            trialExpiresAt: data.plan.endDate,
            trialRemainingDays: calculateRemainingDays(data.plan.endDate)
          }));
        }
      }
    } catch (err) {
      console.error('[SubscriptionPage] Error fetching user subscription:', err);
    }
  };

  const checkTrialEligibility = async () => {
    try {
      console.log('[SubscriptionPage] Checking trial eligibility...');
      const data = await checkTrialEligibilityApi();
      console.log('[SubscriptionPage] Trial eligibility response:', data);
      if (data.success) {
        // Enforce date check on frontend as well
        const isDateValid = data.trialExpiresAt ? new Date() < new Date(data.trialExpiresAt) : false;

        setTrialStatus(prev => ({
          ...prev,
          isEligible: data.isEligible,
          hasUsedTrial: data.hasUsedTrial,
          trialExpiresAt: data.trialExpiresAt,
          trialActive: data.trialActive || isDateValid, // Trust API but backup with date
          trialRemainingDays: data.trialRemainingDays || 0
        }));
      }
    } catch (err) {
      console.error('[SubscriptionPage] Error checking trial eligibility:', err);
    }
  };

  const calculateRemainingDays = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Razorpay script loader removed

  const handleSubscribe = async (plan) => {
    if (trialStatus.hasUsedTrial && trialStatus.trialActive) {
      toast.error('You already have an active trial subscription');
      return;
    }

    setPaymentProcessing(true);
    try {
      const payload = {
        amount: plan.price,
        planId: plan._id,
        orderId: `ORD_${Date.now()}`,
        customerName: user?.fullName || user?.username || "Customer",
        customerEmail: user?.email || "customer@example.com",
        customerPhone: user?.phone || "9999999999"
      };

      const response = await createInstifiPaymentApi(payload);

      if (response.success && response.paymentUrl) {
        // Redirect to Instifi payment page
        window.location.href = response.paymentUrl;
      } else {
        toast.error(response.message || 'Failed to initiate payment');
        setPaymentProcessing(false);
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error(err.message || 'Failed to initiate subscription');
      setPaymentProcessing(false);
    }
  };

  const handleActivateTrial = async () => {
    if (!trialStatus.isEligible) {
      toast.error('You are not eligible for trial');
      return;
    }

    if (trialStatus.hasUsedTrial) {
      toast.error('Trial can only be activated once per account');
      return;
    }

    try {
      setPaymentProcessing(true);
      const response = await activateTrialPlanApi();
      if (response.success) {
        toast.success('🎉 Trial activated! Enjoy 3 days of premium features!');
        await fetchUserSubscription();
        await checkTrialEligibility();
      }
    } catch (err) {
      const errorMsg = err.message || 'Failed to activate trial';
      toast.error(errorMsg);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userSubscription?._id) return;

    const isTrial = userSubscription?.planId?.planType === 'trial';
    const message = isTrial
      ? 'Are you sure you want to cancel your trial? This action is permanent.'
      : 'Are you sure you want to cancel your subscription?';

    if (!window.confirm(message)) return;

    try {
      setLoading(true);
      const response = await cancelSubscriptionApi(userSubscription._id);
      toast.success(response.message || 'Subscription cancelled');
      setUserSubscription(null);
      await fetchUserSubscription();
      await checkTrialEligibility();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getTimeRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;

    if (diffMs <= 0) return 'Expired';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ${diffHours}h left`;
    return `${diffHours}h left`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin-slow">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 font-medium">Loading premium plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 p-4 md:p-6">
      <SEO
        title="Prithu Subscriptions - Premium Video Access"
        description="Upgrade your Prithu experience with subscriptions for exclusive status videos, motivational, spiritual & premium reels. Enjoy ad-free and special content perks."
        keywords="Prithu subscriptions, premium reels, ad-free video status, exclusive content, motivational reels, spiritual status"
        canonical="https://prithu.app/home/subscriptions"
      />
      {/* Trial Status Banner - Only show when active */}
      {trialStatus.trialActive && (
        <div className="max-w-6xl mx-auto mb-6 animate-in slide-in-from-top duration-500">
          <div className="bg-gradient-to-r from-emerald-400 to-teal-400 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/30 rounded-lg backdrop-blur-sm">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Your Trial is Active</h3>
                  <p className="text-sm opacity-90">
                    {getTimeRemaining(trialStatus.trialExpiresAt)} • Upgrade anytime
                  </p>
                </div>
              </div>
              <div className="bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4" />
                  <span className="font-bold">{trialStatus.trialRemainingDays || 3} days left</span>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 bg-white/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-white transition-all duration-1000"
                style={{ width: `${((trialStatus.trialRemainingDays || 3) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Trial Expired Banner - Only show if used but not active and NO active paid plan */}
      {trialStatus.hasUsedTrial && !trialStatus.trialActive && !userSubscription && (
        <div className="max-w-6xl mx-auto mb-6 animate-in slide-in-from-top duration-500">
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/30 rounded-lg backdrop-blur-sm">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Your Trial Has Ended</h3>
                <p className="text-sm opacity-90">Upgrade now to continue enjoying premium features</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header - Hide if already subscribed to a paid plan */}
        {!(userSubscription && userSubscription.planId?.planType !== 'trial') && (
          <div className="text-center mb-10 animate-in fade-in duration-500">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <Crown className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-semibold text-blue-600">
                PREMIUM MEMBERSHIP
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-3">
              Choose Your Plan
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Unlock exclusive features and take your experience to the next level
            </p>
          </div>
        )}

        {/* Current Plan Section */}
        <div className={`bg-gradient-to-r ${userSubscription ? 'from-blue-500 to-indigo-600' : 'from-slate-600 to-slate-800'} rounded-2xl p-6 mb-10 text-white shadow-xl animate-in fade-in duration-500`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-300" />
                <span className="font-bold uppercase tracking-wider text-white/90 text-xs">
                  {userSubscription ? (userSubscription.planId?.planType === 'trial' ? 'Active Trial' : 'Active Subscription') : 'Your Current Plan'}
                </span>
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">
                {userSubscription ? userSubscription.planId?.name : 'Free Tier'}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {userSubscription 
                  ? `Subscribed on ${formatDate(userSubscription.startDate)} • Expires ${formatDate(userSubscription.endDate)}` 
                  : 'You are currently on the free tier. Access standard reels with ads.'}
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-bold uppercase tracking-wider text-xs">
                {userSubscription ? (userSubscription.planId?.planType === 'trial' ? 'Trial' : 'Active') : 'Free'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-4 h-4 text-white/80" />
                <span className="font-medium text-white/80 text-sm">Expiry Date</span>
              </div>
              <p className="text-xl font-bold text-white">
                {userSubscription ? formatDate(userSubscription.endDate) : 'Lifetime / Never'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Target className="w-4 h-4 text-white/80" />
                <span className="font-medium text-white/80 text-sm">Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">Active</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Info className="w-4 h-4 text-white/80" />
                <span className="font-medium text-white/80 text-sm">Plan Type</span>
              </div>
              <p className="text-xl font-bold text-white">
                {userSubscription ? (userSubscription.planId?.planType === 'trial' ? 'Free Trial' : 'Premium') : 'Standard Free'}
              </p>
            </div>
          </div>

          {userSubscription && (
            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <button
                onClick={handleCancelSubscription}
                className="px-5 py-2.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-md"
              >
                {userSubscription.planId?.planType === 'trial' ? 'End Trial' : 'Cancel Subscription'}
              </button>
            </div>
          )}
        </div>

        {/* Trial Offer Card - Only show if eligible */}
        {!trialStatus.hasUsedTrial && (
          <div className="mb-12 animate-in fade-in duration-500">
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 text-white">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-sm font-semibold bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm">
                        SPECIAL OFFER
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Start with 3-Day Free Trial</h2>
                    <p className="text-white/90 mb-4">
                      Experience premium features before you commit
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">All Features</span>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Timer className="w-4 h-4" />
                          <span className="font-medium">3 Days</span>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Gift className="w-4 h-4" />
                          <span className="font-medium">₹0</span>
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <XCircle className="w-4 h-4" />
                          <span className="font-medium">Once Only</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                    <div className="text-center mb-4">
                      <div className="text-4xl font-bold mb-1">₹0</div>
                      <div className="text-sm opacity-90">for 3 days</div>
                    </div>
                    <button
                      onClick={handleActivateTrial}
                      disabled={paymentProcessing || trialStatus.hasUsedTrial}
                      className="group flex items-center justify-center gap-2 w-full py-3 bg-white text-purple-500 font-bold rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paymentProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                          Start Free Trial
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Plans Grid - Hide if already subscribed to a paid plan */}
        {!(userSubscription && userSubscription.planId?.planType !== 'trial') && (
          <div id="plans-section" className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {subscriptions
              .filter(plan => plan.planType !== 'trial')
              .map((plan, index) => {
                const isPopular = plan.name?.toLowerCase().includes('pro');
                const isCurrentPlan = userSubscription?.planId?._id === plan._id;

                const durationLabel = plan.durationDays === 30 ? '/month' :
                  plan.durationDays === 90 ? '/3 months' :
                    plan.durationDays === 365 ? '/1 year' :
                      `/${plan.durationDays} Days`;

                const monthlyPrice = plan.durationDays === 90 ? Math.round(plan.price / 3) :
                  plan.durationDays === 365 ? Math.round(plan.price / 12) :
                    null;

                return (
                  <div
                    key={plan._id}
                    className={`relative rounded-2xl bg-white border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-in fade-in slide-in-from-bottom ${isPopular
                      ? 'border-blue-300 shadow-xl shadow-blue-500/10'
                      : 'border-gray-200 shadow-lg'
                      } ${highlightParam === 'premium' ? 'ring-4 ring-purple-400 ring-offset-2 animate-pulse shadow-2xl shadow-purple-500/20' : ''}`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {isPopular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-blue-400 to-purple-400 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                          <Star className="w-3 h-3" fill="white" />
                          POPULAR CHOICE
                        </div>
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          ACTIVE PLAN
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Plan Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-xl ${plan.planType === 'basic' ? 'bg-blue-100 text-blue-500' :
                          plan.planType === 'pro' ? 'bg-purple-100 text-purple-500' :
                            'bg-amber-100 text-amber-500'
                          }`}>
                          {plan.planType === 'basic' ? <Zap className="w-6 h-6" /> :
                            plan.planType === 'pro' ? <TrendingUp className="w-6 h-6" /> :
                              <Rocket className="w-6 h-6" />}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                          <p className="text-gray-600 text-sm">{plan.description || "Premium features included"}</p>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-gray-800">
                            ₹{plan.price || 0}
                          </span>
                          <span className="text-gray-500 font-medium">
                            {durationLabel}
                          </span>
                        </div>
                        {monthlyPrice && (
                          <p className="text-sm text-emerald-600 font-medium mt-1">
                            Equivalent to ₹{monthlyPrice}/month
                          </p>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-3 mb-8 min-h-[120px]">
                        {[
                          plan.limits?.downloadLimit ? `${plan.limits.downloadLimit} Downloads` : null,
                          plan.limits?.deviceLimit ? `${plan.limits.deviceLimit} Devices` : null,
                          plan.limits?.adFree ? "Ad-Free Experience" : null,
                          plan.durationDays ? `${plan.durationDays} Days Access` : null,
                          "24/7 Priority Support",
                          "Cancel Anytime"
                        ].filter(Boolean).map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-emerald-500" />
                            </div>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (trialStatus.trialActive) {
                            toast.error('Your trial is still active');
                            return;
                          }
                          setSelectedPlan(plan);
                          setShowPaymentModal(true);
                        }}
                        disabled={isCurrentPlan || paymentProcessing || trialStatus.trialActive}
                        className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${isCurrentPlan
                          ? 'bg-gray-100 text-gray-600 cursor-default'
                          : isPopular
                            ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:shadow-lg hover:shadow-blue-500/25'
                            : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:shadow-lg'
                          } ${!isCurrentPlan && 'hover:scale-105 active:scale-95'}`}
                      >
                        {isCurrentPlan ? (
                          <span className="flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Current Plan
                          </span>
                        ) : paymentProcessing ? (
                          <span className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Processing...
                          </span>
                        ) : trialStatus.trialActive ? (
                          <span className="flex items-center justify-center gap-2">
                            <Timer className="w-4 h-4" />
                            Trial Active
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            Choose Plan
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* Simple Trial Rules */}
        {trialStatus.trialActive && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 mb-10 border border-amber-200 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Timer className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">About Your Trial</h3>
                <p className="text-sm text-gray-600">Your 3-day trial includes all premium features</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Trial ends in {trialStatus.trialRemainingDays || 3} days</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm text-gray-700">Upgrade anytime during trial</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                <span className="text-sm text-gray-700">No payment required for trial</span>
              </div>
            </div>
          </div>
        )}

        {/* Invoice History Section */}
        <div className="mb-12 mt-10">
          <InvoiceHistory />
        </div>



        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Confirm Purchase</h3>
                    <p className="text-gray-600 mt-1">Complete your payment to get started</p>
                  </div>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Selected Plan</span>
                    <span className="font-bold text-gray-800">{selectedPlan.name}</span>
                  </div>
                  <div className="h-px bg-gray-200 my-3"></div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-800">Total</span>
                    <span className="text-2xl font-bold text-blue-500">
                      ₹{selectedPlan.price}
                    </span>
                  </div>
                </div>

                {trialStatus.hasUsedTrial && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        This will replace your current trial period
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span>Secure payment with Instifi</span>
                  </div>

                  <button
                    onClick={() => handleSubscribe(selectedPlan)}
                    disabled={paymentProcessing}
                    className="w-full py-3 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentProcessing ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Pay ₹{selectedPlan.price}
                      </span>
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-500">
                    By proceeding, you agree to our Terms of Service
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Verification Status Overlay */}
      {verificationStatus && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">

          {/* ⏳ VERIFYING */}
          {verificationStatus === 'verifying' && (
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center animate-in zoom-in duration-300">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-blue-500 border-r-purple-500 rounded-full animate-spin"></div>
                <div className="absolute inset-4 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-8 h-8 text-white animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-extrabold text-slate-800">Verifying Payment</h3>
              <p className="text-slate-500 mt-2 text-sm font-medium">Please wait while we confirm your transaction with Instifi...</p>
              <div className="mt-5 inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting to gateway...
              </div>
            </div>
          )}

          {/* ✅ SUCCESS - Receipt Modal */}
          {verificationStatus === 'success' && (
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              {/* Green header strip */}
              <div className="bg-gradient-to-r from-emerald-400 to-teal-500 p-6 text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/30">
                  <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">Payment Successful!</h3>
                <p className="text-white/90 text-sm mt-1">Your subscription has been activated 🎉</p>
              </div>

              <div className="p-6">
                {/* Receipt Box */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-5 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receipt</span>
                    {verificationDetails?.receipt?.invoiceNumber && (
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        #{verificationDetails.receipt.invoiceNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Amount Paid</span>
                    <span className="text-emerald-600 font-extrabold text-base">
                      ₹{verificationDetails?.receipt?.amount || verificationDetails?.amount || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">Payment Method</span>
                    <span className="text-slate-700 font-semibold">{verificationDetails?.receipt?.paymentMethod || 'Instifi'}</span>
                  </div>
                  {verificationDetails?.receipt?.transactionId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Transaction ID</span>
                      <span className="text-slate-600 font-mono text-xs truncate max-w-[140px]">
                        {verificationDetails.receipt.transactionId}
                      </span>
                    </div>
                  )}
                  {verificationDetails?.receipt?.paidAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400 font-medium">Date</span>
                      <span className="text-slate-700 font-medium">
                        {new Date(verificationDetails.receipt.paidAt).toLocaleDateString('en-IN', { year:'numeric', month:'short', day:'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-5 text-xs text-slate-400 bg-blue-50 rounded-xl px-3 py-2">
                  <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>An invoice PDF has been sent to your registered email address.</span>
                </div>

                <button
                  onClick={() => {
                    setVerificationStatus(null);
                    setVerificationDetails(null);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Enjoy Premium Access!
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 🚫 CANCELLED - Payment Cancelled by User */}
          {verificationStatus === 'cancelled' && (
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-6 text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/30">
                  <XCircle className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">Payment Cancelled</h3>
                <p className="text-white/90 text-sm mt-1">You cancelled the payment process</p>
              </div>

              <div className="p-6 text-center">
                <p className="text-slate-500 text-sm mb-6">
                  No charges were made. You can choose a plan and try again whenever you're ready.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setVerificationStatus(null);
                      setVerificationDetails(null);
                      // Scroll to plans section
                      setTimeout(() => {
                        document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setVerificationStatus(null);
                      setVerificationDetails(null);
                    }}
                    className="w-full py-2.5 text-slate-500 hover:text-slate-700 rounded-xl font-medium transition-all text-sm"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ❌ FAILED */}
          {verificationStatus === 'failed' && (
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="bg-gradient-to-r from-rose-400 to-red-500 p-6 text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/30">
                  <AlertCircle className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">Payment Failed</h3>
                <p className="text-white/90 text-sm mt-1">Something went wrong with your payment</p>
              </div>

              <div className="p-6 text-center">
                <p className="text-slate-500 text-sm mb-6">
                  Your payment could not be processed. Please check your payment details and try again. No charges have been deducted.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setVerificationStatus(null);
                      setVerificationDetails(null);
                    }}
                    className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ⏳ PENDING */}
          {verificationStatus === 'pending' && (
            <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 p-6 text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border-4 border-white/30">
                  <Clock className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">Payment Pending</h3>
                <p className="text-white/90 text-sm mt-1">Your payment is still being processed</p>
              </div>

              <div className="p-6 text-center">
                <p className="text-slate-500 text-sm mb-6">
                  Your payment is being processed by the bank. It may take a few minutes to confirm. Please do not retry the payment.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const txn = verificationDetails?.transactionId || verificationDetails?.orderId;
                      if (txn) {
                        verifyPaymentTransaction(txn);
                      }
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Check Status Again
                  </button>
                  <button
                    onClick={() => { setVerificationStatus(null); setVerificationDetails(null); }}
                    className="w-full py-2.5 text-slate-500 hover:text-slate-700 rounded-xl font-medium transition-all text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideInFromTop {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideInFromBottom {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes zoomIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-in {
          animation-fill-mode: both;
        }
        
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        
        .slide-in-from-top {
          animation: slideInFromTop 0.5s ease-out;
        }
        
        .slide-in-from-bottom {
          animation: slideInFromBottom 0.6s ease-out;
        }
        
        .zoom-in {
          animation: zoomIn 0.3s ease-out;
        }
        
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SubscriptionPage;
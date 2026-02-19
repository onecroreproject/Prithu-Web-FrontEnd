import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
  createOrderApi,
  verifyPaymentApi,
  recordPaymentFailureApi
} from '../API_Services/subscriptionServices';
import { toast } from 'react-hot-toast';
import SEO from "../components/SEO";
import InvoiceHistory from '../components/Subscription/InvoiceHistory';


const SubscriptionPage = () => {
  const location = useLocation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await getAllSubscriptionPlans();
      if (data.success) {
        setSubscriptions(data.plans || []);
        if (data.plans?.length > 1) {
          setSelectedPlan(data.plans[1]);
        } else if (data.plans?.length > 0) {
          setSelectedPlan(data.plans[0]);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load subscription plans.');
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const data = await getUserSubscriptionActive();
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
      console.error('Error fetching user subscription:', err);
    }
  };

  const checkTrialEligibility = async () => {
    try {
      const data = await checkTrialEligibilityApi();
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
      console.error('Error checking trial eligibility:', err);
    }
  };

  const calculateRemainingDays = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (planId) => {
    if (trialStatus.hasUsedTrial && trialStatus.trialActive) {
      toast.error('You already have an active trial subscription');
      return;
    }

    setPaymentProcessing(true);
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        toast.error('Razorpay SDK failed to load.');
        setPaymentProcessing(false);
        return;
      }

      const orderData = await createOrderApi(planId);

      if (!orderData.success) {
        throw new Error(orderData.message || 'Order creation failed');
      }
      console.log(orderData)
      // 🔍 DEBUG (keep once, remove later)
      console.log({
        key: orderData.key,
        order_id: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency
      });

      const options = {
        key: orderData.key,
        amount: orderData.amount,          // paise
        currency: orderData.currency,
        name: "Prithu AI",
        description: orderData.description,

        // ✅ CRITICAL FIX
        order_id: orderData.orderId,

        handler: async function (response) {
          try {
            toast.loading("Verifying payment...");
            const verification = await verifyPaymentApi({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            toast.dismiss();

            if (verification.success) {
              toast.success('Payment successful! Subscription active.');
              fetchUserSubscription();
              checkTrialEligibility();
              setShowPaymentModal(false);
            } else {
              toast.error(verification.message || 'Verification failed');
              // Record failure in backend
              await recordPaymentFailureApi({
                razorpay_order_id: response.razorpay_order_id,
                error_code: 'VERIFICATION_FAILED',
                error_description: verification.message
              });
            }
          } catch (err) {
            toast.dismiss();
            toast.error('Payment verification failed');
            // Record failure in backend
            if (response?.razorpay_order_id) {
              await recordPaymentFailureApi({
                razorpay_order_id: response.razorpay_order_id,
                error_code: 'VERIFICATION_EXCEPTION',
                error_description: err.message
              });
            }
          }
        },

        prefill: {
          name: "Prithu User",
          email: "user@example.com",
          contact: "9999999999"
        },

        theme: {
          color: "#8B5CF6"
        },

        modal: {
          ondismiss: async function () {
            setPaymentProcessing(false);
            toast.error('Payment cancelled');
            // Record failure in backend
            if (orderData?.orderId) {
              try {
                await recordPaymentFailureApi({
                  razorpay_order_id: orderData.orderId,
                  error_code: 'MODAL_DISMISSED',
                  error_description: 'User closed the payment modal'
                });
              } catch (e) {
                console.error("Failed to record cancellation:", e);
              }
            }
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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


        {/* Active Subscription Card */}
        {userSubscription && (
          <div className="bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl p-6 mb-10 animate-in fade-in duration-500">
            <div className="mb-6">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5" />
                  <span className="font-bold text-lg">
                    {userSubscription.planId?.planType === 'trial' ? 'Active Trial' : 'Active Subscription'}
                  </span>
                </div>
                <p className="text-white/90">
                  {userSubscription.planId?.name} • Expires {formatDate(userSubscription.endDate)}
                </p>
              </div>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-4 h-4 text-white" />
                  <span className="font-medium text-white">Expiry Date</span>
                </div>
                <p className="text-xl font-bold text-white">{formatDate(userSubscription.endDate)}</p>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-4 h-4 text-white" />
                  <span className="font-medium text-white">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  <span className="text-xl font-bold text-white">
                    {userSubscription.planId?.planType === 'trial' ? 'Trial' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="w-4 h-4 text-white" />
                  <span className="font-medium text-white">Plan Type</span>
                </div>
                <p className="text-xl font-bold text-white">
                  {userSubscription.planId?.planType === 'trial' ? 'Free Trial' : 'Premium'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCancelSubscription}
                className="px-5 py-2.5 bg-white/30 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/40 transition-all duration-300"
              >
                {userSubscription.planId?.planType === 'trial' ? 'End Trial' : 'Cancel'}
              </button>
            </div>

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
                    <span>Secure payment with Razorpay</span>
                  </div>

                  <button
                    onClick={() => handleSubscribe(selectedPlan._id)}
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
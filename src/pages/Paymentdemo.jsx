import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    Crown,
    Zap,
    Shield,
    Sparkles,
    CreditCard,
    Gift,
    X,
    Timer,
    CheckCircle,
    Rocket
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/* ─── SINGLE PLAN ─────────────────────────────────────────────────── */
const PLAN = {
    id: 'premium',
    name: 'Premium',
    icon: <Crown className="w-6 h-6 text-amber-400" />,
    price: 599,
    originalPrice: 1999,
    period: 'month',
    desc: 'Unlock full potential with Prithu AI',
    features: [
        'Unlimited Downloads',
        '5 Devices Support',
        'Priority 24/7 Support',
        'Exclusive AI Features',
        'Ad-Free Experience',
        'Early Access to Updates'
    ],
    color: 'purple',
    popular: true,
    trial: true
};

export default function Paymentdemo() {
    const [selectedPlan] = useState(PLAN);
    const [step, setStep] = useState('pricing'); // 'pricing', 'method', 'processing', 'success'
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [trialApplied, setTrialApplied] = useState(false);
    const { user } = useAuth();

    const handleSubscribe = () => {
        setStep('method');
    };

    const handleFreeTrial = async () => {
        setTrialApplied(true);
        setStep('processing');
        
        try {
            // Call backend for trial activation
            const response = await api.post('/web/api/subscription/activate-trial', {
                planId: selectedPlan.id
            });
            
            if (response.data.success) {
                setStep('success');
                toast.success('3-day free trial activated! Enjoy premium features.');
            } else {
                setStep('pricing');
                toast.error(response.data.message || "Failed to activate trial");
            }
        } catch (error) {
            console.error("Trial error:", error);
            setStep('pricing');
            toast.error("Error activating trial");
        }
    };

    const handlePayment = async (method) => {
        setPaymentMethod(method);
        setStep('processing');

        try {
            const payload = {
                amount: selectedPlan.price,
                orderId: "ORD_" + Date.now(),
                customerName: user?.fullName || user?.username || "Customer",
                customerEmail: user?.email || "customer@example.com",
                customerPhone: user?.phone || "9999999999"
            };

            const response = await api.post('/api/payment/create-payment', payload);

            if (response.data.success && response.data.paymentUrl) {
                // Redirect to Instifi payment page
                window.location.href = response.data.paymentUrl;
            } else {
                setStep('method');
                toast.error(response.data.message || "Failed to initialize payment");
            }
        } catch (error) {
            console.error("Payment error:", error);
            setStep('method');
            toast.error("Error connecting to payment gateway");
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(10,15,30)] text-[rgb(241,245,249)] p-6 md:p-12 overflow-hidden relative">
            {/* Animated Background Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[rgb(139,92,246)]/20 rounded-full blur-[130px] -mr-64 -mt-64 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[rgb(59,130,246)]/20 rounded-full blur-[130px] -ml-64 -mb-64 animate-pulse" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[rgb(245,158,11)]/5 rounded-full blur-[150px]" />

            {/* Grid Pattern Overlay */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            <div className="max-w-4xl mx-auto relative z-10">
                <AnimatePresence mode="wait">
                    {step === 'pricing' && (
                        <motion.div
                            key="pricing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-12"
                        >
                            <div className="text-center space-y-4">
                                <motion.div
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[rgb(59,130,246)]/10 to-[rgb(139,92,246)]/10 border border-[rgb(59,130,246)]/20 px-5 py-2.5 rounded-full mb-2"
                                >
                                    <Crown className="w-5 h-5 text-[rgb(245,158,11)]" />
                                    <span className="text-sm font-semibold text-[rgb(96,165,250)]">PREMIUM ACCESS</span>
                                    <span className="text-xs bg-[rgb(34,197,94)]/20 text-[rgb(74,222,128)] px-2 py-0.5 rounded-full ml-2">3 Days Free Trial</span>
                                </motion.div>
                                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[rgb(255,255,255)] via-[rgb(192,132,252)] to-[rgb(96,165,250)] bg-clip-text text-transparent">
                                    Prithu  Premium
                                </h1>
                                <p className="text-[rgb(148,163,184)] max-w-2xl mx-auto text-lg italic">
                                    "Unlock the full potential of your creativity with Prithu AI"
                                </p>
                            </div>

                            <div className="flex justify-center">
                                <PricingCard
                                    plan={PLAN}
                                    onSubscribe={handleSubscribe}
                                    onFreeTrial={handleFreeTrial}
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 'method' && (
                        <motion.div
                            key="method"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="max-w-md mx-auto"
                        >
                            <PaymentMethodSelector
                                plan={selectedPlan}
                                onPay={handlePayment}
                                onBack={() => setStep('pricing')}
                            />
                        </motion.div>
                    )}

                    {step === 'processing' && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center min-h-[50vh] space-y-6"
                        >
                            <div className="relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    className="w-24 h-24 border-4 border-[rgb(139,92,246)]/20 border-t-[rgb(139,92,246)] rounded-full"
                                />
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    {trialApplied ? <Timer className="w-8 h-8 text-[rgb(245,158,11)]" /> : <Shield className="w-8 h-8 text-[rgb(139,92,246)]" />}
                                </motion.div>
                            </div>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[rgb(255,255,255)] to-[rgb(192,132,252)] bg-clip-text text-transparent">
                                    {trialApplied ? 'Activating Free Trial' : 'Processing Payment'}
                                </h2>
                                <p className="text-[rgb(148,163,184)]">
                                    {trialApplied
                                        ? 'Setting up your 3-day free trial...'
                                        : 'Please do not refresh or close this window...'}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-lg mx-auto"
                        >
                            <div className="bg-[rgb(15,23,42)]/70 backdrop-blur-2xl border border-[rgb(34,197,94)]/30 rounded-3xl p-8 text-center space-y-6 shadow-2xl shadow-[rgb(34,197,94)]/10">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                    className="w-20 h-20 bg-[rgb(34,197,94)]/10 rounded-full flex items-center justify-center mx-auto"
                                >
                                    {trialApplied ? (
                                        <Timer className="w-12 h-12 text-[rgb(245,158,11)]" />
                                    ) : (
                                        <CheckCircle className="w-12 h-12 text-[rgb(34,197,94)]" />
                                    )}
                                </motion.div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-bold text-white">
                                        {trialApplied ? 'Free Trial Activated!' : 'Payment Successful!'}
                                    </h2>
                                    <p className="text-[rgb(148,163,184)]">
                                        {trialApplied
                                            ? `You have 3 days free access to ${selectedPlan.name} Plan`
                                            : `Welcome to Prithu ${selectedPlan.name} Membership`}
                                    </p>
                                </div>

                                <div className="bg-[rgb(30,41,59)]/50 p-4 rounded-2xl text-left space-y-3 border border-[rgb(51,65,85)]">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[rgb(148,163,184)]">Transaction ID</span>
                                        <span className="text-[rgb(241,245,249)] font-mono">#PRT-88294-X</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[rgb(148,163,184)]">Plan Activated</span>
                                        <span className="text-[rgb(241,245,249)]">{selectedPlan.name}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[rgb(148,163,184)]">Amount Paid</span>
                                        <span className={trialApplied ? "text-[rgb(245,158,11)] font-bold" : "text-[rgb(34,197,94)] font-bold"}>
                                            {trialApplied ? "₹0 (Trial)" : `₹${selectedPlan.price}`}
                                        </span>
                                    </div>
                                    {trialApplied && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[rgb(148,163,184)]">Trial Period</span>
                                            <span className="text-[rgb(96,165,250)]">3 Days Free</span>
                                        </div>
                                    )}
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => window.location.href = '/home'}
                                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${trialApplied
                                        ? 'bg-gradient-to-r from-[rgb(245,158,11)] to-[rgb(249,115,22)] hover:from-[rgb(245,158,11)]/90 hover:to-[rgb(249,115,22)]/90'
                                        : 'bg-gradient-to-r from-[rgb(34,197,94)] to-[rgb(16,185,129)] hover:from-[rgb(34,197,94)]/90 hover:to-[rgb(16,185,129)]/90'
                                        }`}
                                >
                                    {trialApplied ? 'Start Exploring Premium Content' : 'Explore Premium Content'}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ─── PRICING CARD (SINGLE) ───────────────────────────────────────── */
function PricingCard({ plan, onSubscribe, onFreeTrial }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative w-full max-w-md group p-8 rounded-3xl border transition-all duration-300 backdrop-blur-sm bg-[rgb(15,23,42)]/90 border-[rgb(139,92,246)]/50 shadow-2xl shadow-[rgb(139,92,246)]/20"
        >
            {/* Animated Border Glow */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[rgb(139,92,246)]/20 via-[rgb(59,130,246)]/20 to-[rgb(139,92,246)]/20 blur-xl -z-10" />

            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[rgb(139,92,246)] to-[rgb(59,130,246)] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg">
                Recommended
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${isHovered ? 'bg-gradient-to-br from-[rgb(139,92,246)] to-[rgb(124,58,237)] shadow-lg' : 'bg-[rgb(30,41,59)]/50'
                        }`}>
                        {React.cloneElement(plan.icon, {
                            className: `w-6 h-6 ${isHovered ? 'text-white' : 'text-[rgb(251,191,36)]'}`
                        })}
                    </div>
                    <div className="text-right">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold text-white">₹{plan.price}</span>
                            {plan.originalPrice && (
                                <span className="text-sm text-[rgb(148,163,184)] line-through">₹{plan.originalPrice}</span>
                            )}
                        </div>
                        <div className="text-xs text-[rgb(148,163,184)]">/{plan.period}</div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-sm text-[rgb(100,116,139)] mt-1">{plan.desc}</p>
                </div>

                <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3"
                        >
                            <div className="w-5 h-5 rounded-full bg-[rgb(34,197,94)]/10 flex items-center justify-center">
                                <Check className="w-3 h-3 text-[rgb(34,197,94)]" />
                            </div>
                            <span className="text-sm text-[rgb(203,213,225)]">{feature}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Free Trial Badge */}
                <div className="flex items-center justify-center gap-2 py-2 bg-[rgb(245,158,11)]/10 rounded-xl border border-[rgb(245,158,11)]/20">
                    <Timer className="w-4 h-4 text-[rgb(245,158,11)]" />
                    <span className="text-xs font-semibold text-[rgb(245,158,11)]">3 Days Free Trial Available</span>
                </div>

                <div className="space-y-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSubscribe}
                        className="w-full py-3.5 rounded-xl font-bold transition-all bg-gradient-to-r from-[rgb(139,92,246)] to-[rgb(59,130,246)] text-white shadow-lg shadow-[rgb(139,92,246)]/20 hover:from-[rgb(124,58,237)] hover:to-[rgb(37,99,235)]"
                    >
                        Subscribe Now
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onFreeTrial}
                        className="w-full py-3.5 rounded-xl font-semibold bg-transparent border border-[rgb(245,158,11)] text-[rgb(245,158,11)] hover:bg-[rgb(245,158,11)]/10 transition-all"
                    >
                        Start 3-Day Free Trial
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}

/* ─── PAYMENT METHOD SELECTOR ──────────────────────────────────────── */
function PaymentMethodSelector({ plan, onPay, onBack }) {
    const [method, setMethod] = useState('card');
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '' });
    const [upiId, setUpiId] = useState('');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[rgb(15,23,42)]/90 backdrop-blur-2xl border border-[rgb(51,65,85)] rounded-3xl p-8 space-y-8 shadow-2xl"
        >
            <div className="flex items-center justify-between">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBack}
                    className="p-2 hover:bg-[rgb(51,65,85)] rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-[rgb(148,163,184)]" />
                </motion.button>
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white">Checkout</h2>
                    <p className="text-xs text-[rgb(148,163,184)] uppercase tracking-widest">{plan.name} Plan</p>
                </div>
                <div className="w-8" />
            </div>

            <div className="flex justify-between items-center bg-gradient-to-r from-[rgb(139,92,246)]/10 to-[rgb(59,130,246)]/10 p-5 rounded-2xl border border-[rgb(139,92,246)]/20">
                <span className="text-[rgb(203,213,225)] font-medium">Total Amount</span>
                <div className="text-right">
                    <span className="text-2xl font-bold text-white">₹{plan.price}</span>
                    <div className="flex items-center gap-1 text-[10px] text-[rgb(34,197,94)]">
                        <Timer className="w-3 h-3" />
                        <span>3 days free trial available</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { id: 'card', name: 'Card', icon: <CreditCard className="w-5 h-5" />, gradient: 'from-[rgb(139,92,246)]/20 to-[rgb(59,130,246)]/20' },
                    { id: 'upi', name: 'UPI', icon: <Zap className="w-5 h-5" />, gradient: 'from-[rgb(34,197,94)]/20 to-[rgb(16,185,129)]/20' },
                    { id: 'wallet', name: 'Wallet', icon: <Gift className="w-5 h-5" />, gradient: 'from-[rgb(245,158,11)]/20 to-[rgb(249,115,22)]/20' }
                ].map((m) => (
                    <motion.button
                        key={m.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setMethod(m.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${method === m.id
                            ? `bg-gradient-to-br ${m.gradient} border-[rgb(139,92,246)] text-[rgb(192,132,252)] shadow-lg`
                            : 'bg-[rgb(30,41,59)]/50 border-[rgb(51,65,85)] text-[rgb(100,116,139)] hover:border-[rgb(100,116,139)]'
                            }`}
                    >
                        {m.icon}
                        <span className="text-xs font-semibold">{m.name}</span>
                    </motion.button>
                ))}
            </div>

            <div className="space-y-4">
                {method === 'card' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 overflow-hidden"
                    >
                        <div>
                            <label className="text-xs text-[rgb(148,163,184)] mb-1 block">Card Number</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                value={cardDetails.number}
                                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                className="w-full bg-[rgb(30,41,59)]/80 border border-[rgb(51,65,85)] p-4 rounded-xl outline-none focus:border-[rgb(139,92,246)] focus:ring-1 focus:ring-[rgb(139,92,246)] transition-all text-white placeholder:text-[rgb(71,85,105)]"
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="w-1/2">
                                <label className="text-xs text-[rgb(148,163,184)] mb-1 block">Expiry Date</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    value={cardDetails.expiry}
                                    onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                    className="w-full bg-[rgb(30,41,59)]/80 border border-[rgb(51,65,85)] p-4 rounded-xl outline-none focus:border-[rgb(139,92,246)] focus:ring-1 focus:ring-[rgb(139,92,246)] transition-all text-white placeholder:text-[rgb(71,85,105)]"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="text-xs text-[rgb(148,163,184)] mb-1 block">CVC</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    value={cardDetails.cvc}
                                    onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                                    className="w-full bg-[rgb(30,41,59)]/80 border border-[rgb(51,65,85)] p-4 rounded-xl outline-none focus:border-[rgb(139,92,246)] focus:ring-1 focus:ring-[rgb(139,92,246)] transition-all text-white placeholder:text-[rgb(71,85,105)]"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {method === 'upi' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4 overflow-hidden"
                    >
                        <label className="text-xs text-[rgb(148,163,184)] mb-1 block">UPI ID</label>
                        <input
                            type="text"
                            placeholder="username@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-[rgb(30,41,59)]/80 border border-[rgb(51,65,85)] p-4 rounded-xl outline-none focus:border-[rgb(139,92,246)] focus:ring-1 focus:ring-[rgb(139,92,246)] transition-all text-white placeholder:text-[rgb(71,85,105)]"
                        />
                    </motion.div>
                )}

                {method === 'wallet' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 overflow-hidden"
                    >
                        <div className="bg-[rgb(30,41,59)]/50 p-4 rounded-xl text-center border border-[rgb(51,65,85)]">
                            <p className="text-[rgb(148,163,184)] text-sm">Select a wallet provider</p>
                            <div className="flex justify-center gap-4 mt-3">
                                {['Paytm', 'Google Pay', 'PhonePe'].map(w => (
                                    <span key={w} className="text-xs bg-[rgb(51,65,85)] px-3 py-1 rounded-full text-[rgb(203,213,225)]">{w}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPay(method)}
                className="w-full py-4 bg-gradient-to-r from-[rgb(139,92,246)] to-[rgb(59,130,246)] hover:from-[rgb(124,58,237)] hover:to-[rgb(37,99,235)] rounded-xl font-bold text-white shadow-lg shadow-[rgb(139,92,246)]/30 transition-all"
            >
                Confirm & Pay ₹{plan.price}
            </motion.button>

            <div className="flex items-center justify-center gap-3 text-[10px] text-[rgb(100,116,139)] uppercase tracking-widest font-bold">
                <Shield className="w-3 h-3" />
                Secured by Instifi
                <div className="w-px h-3 bg-[rgb(51,65,85)]" />
                <Timer className="w-3 h-3 text-[rgb(245,158,11)]" />
                <span className="text-[rgb(245,158,11)]">3-Day Free Trial</span>
            </div>
        </motion.div>
    );
}
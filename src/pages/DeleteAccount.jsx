import React, { useState } from "react";
import { 
  AlertTriangle, 
  Trash2, 
  Clock, 
  ShieldAlert, 
  ArrowLeft, 
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";


const DeleteAccount = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionType, setActionType] = useState(null); // 'delete' or 'deactivate'

  const reasons = [
    "I'm not using it enough",
    "Privacy concerns",
    "I found a better alternative",
    "Technical issues",
    "Too many notifications",
    "Other"
  ];

  const handleAction = async () => {
    if (!reason || reason.length < 10) {
      setError("Please provide a detailed reason (min 10 characters)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (actionType === "delete") {
        await api.delete("/api/user/delete", { data: { reason } });
        toast.success("Account permanently deleted.");
        logout();
        navigate("/");
      } else if (actionType === "deactivate") {
        await api.patch("/api/user/deactivate", { reason });
        toast.success("Account deactivated successfully. You can recover it within 20 days.");
        logout();
        navigate("/");
      }
    } catch (err) {
      console.error("Action failed:", err);
      const status = err.response?.status;
      const msg = err.response?.data?.message || "An error occurred. Please try again.";
      setError(msg);
      toast.error(`${msg} (Status: ${status || "Network Error"})`);
    } finally {


      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 1.05,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4 py-12">
      <div className="max-w-xl w-full">
        {/* Back Button */}
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="mb-6 flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-neutral-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{step > 1 ? "Back" : "Go Back"}</span>
        </button>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden"
            >
              <div className="p-8 pb-0 text-center">
                <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Wait! Before you go...</h1>
                <p className="mt-3 text-neutral-500 text-lg">We're sad to see you leave. Are you sure you want to delete your account?</p>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">What happens next:</h2>
                  <div className="grid gap-4">
                    <div className="flex gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="text-red-500 mt-1"><XCircle className="w-5 h-5" /></div>
                      <div>
                        <p className="font-semibold text-neutral-900">Irreversible Deletion</p>
                        <p className="text-sm text-neutral-500">All your posts, media, and profile data will be permanently removed.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="text-orange-500 mt-1"><Clock className="w-5 h-5" /></div>
                      <div>
                        <p className="font-semibold text-neutral-900">Loss of Connections</p>
                        <p className="text-sm text-neutral-500">Your followers and circle connections will be severed immediately.</p>
                      </div>
                    </div>
                    <div className="flex gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                      <div className="text-blue-500 mt-1"><Download className="w-5 h-5" /></div>
                      <div>
                        <p className="font-semibold text-neutral-900">Data Cleanup</p>
                        <p className="text-sm text-neutral-500">You won't be able to recover any information once the process is complete.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-3">
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all shadow-lg shadow-neutral-200"
                  >
                    I understand, continue
                  </button>
                  <button 
                    onClick={() => navigate(-1)}
                    className="w-full py-4 text-neutral-600 font-semibold hover:bg-neutral-50 rounded-2xl transition-all"
                  >
                    Keep my account
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8"
            >
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold text-neutral-900">Choose your preference</h1>
                <p className="text-neutral-500 mt-2">You can either take a break or leave permanently.</p>
              </div>

              <div className="grid gap-6">
                {/* Deactivate Option */}
                <div 
                  onClick={() => { setActionType("deactivate"); setStep(3); }}
                  className="group relative p-6 border-2 border-neutral-100 rounded-3xl cursor-pointer hover:border-neutral-900 hover:shadow-xl transition-all"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-neutral-900 transition-colors">
                      <Clock className="w-7 h-7 text-neutral-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">Deactivate temporarily</h3>
                      <p className="text-neutral-500 mt-1">Hide your profile and posts. You can come back anytime within 20 days.</p>
                    </div>
                  </div>
                </div>

                {/* Delete Option */}
                <div 
                  onClick={() => { setActionType("delete"); setStep(3); }}
                  className="group relative p-6 border-2 border-neutral-100 rounded-3xl cursor-pointer hover:border-red-500 hover:shadow-xl transition-all"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-red-500 transition-colors">
                      <Trash2 className="w-7 h-7 text-red-500 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-neutral-900">Delete permanently</h3>
                      <p className="text-neutral-500 mt-1">Erase everything associated with your account. This is irreversible.</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-3xl shadow-xl border border-neutral-100 p-8"
            >
              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${actionType === 'delete' ? 'bg-red-50' : 'bg-neutral-50'}`}>
                  {actionType === 'delete' ? <Trash2 className="w-8 h-8 text-red-500" /> : <Clock className="w-8 h-8 text-neutral-600" />}
                </div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {actionType === 'delete' ? "Final Confirmation" : "Confirm Deactivation"}
                </h1>
                <p className="text-neutral-500 mt-1">Help us improve by sharing why you're leaving.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wider">Select Reason</label>
                  <div className="flex flex-wrap gap-2">
                    {reasons.map((r) => (
                      <button
                        key={r}
                        onClick={() => setReason(r)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          reason === r 
                            ? "bg-neutral-900 text-white shadow-md shadow-neutral-300" 
                            : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-neutral-900 mb-3 uppercase tracking-wider">Details (Optional)</label>
                  <textarea
                    value={reason === "Other" || !reasons.includes(reason) ? reason : ""}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us more... (min 10 characters)"
                    rows={4}
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 transition-all resize-none"
                  />
                  {error && (
                    <p className="mt-2 text-red-500 text-sm flex items-center gap-1">
                      <XCircle className="w-4 h-4" />
                      {error}
                    </p>
                  )}
                </div>

                <div className="pt-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-1">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={confirmed}
                        onChange={() => setConfirmed(!confirmed)}
                      />
                      <div className="w-6 h-6 border-2 border-neutral-200 rounded-lg group-hover:border-neutral-400 peer-checked:bg-neutral-900 peer-checked:border-neutral-900 transition-all"></div>
                      <CheckCircle2 className="w-4 h-4 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-neutral-600 select-none">
                      I understand that {actionType === 'delete' ? 'permanent deletion is irreversible and all my data will be lost' : 'my account will be hidden and scheduled for deletion in 20 days'}.
                    </span>
                  </label>
                </div>

                <button
                  disabled={!confirmed || loading || reason.length < 10}
                  onClick={handleAction}
                  className={`w-full py-5 rounded-2xl font-bold text-white transition-all shadow-xl ${
                    actionType === 'delete' 
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-200' 
                      : 'bg-neutral-900 hover:bg-neutral-800 shadow-neutral-300'
                  } disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed mt-4`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full inline-block"
                      />
                      Processing...
                    </span>
                  ) : (
                    actionType === 'delete' ? "Delete My Account Permanently" : "Deactivate My Account"
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-neutral-500 text-sm">Having trouble or need assistance?</p>
          <div className="mt-4 flex items-center justify-center gap-6">
            <button 
              onClick={() => navigate("/how-to-delete-account")}
              className="text-neutral-900 font-bold hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4" />
              Help Center
            </button>
            <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
            <button className="text-neutral-900 font-bold hover:underline flex items-center gap-1">
              <Info className="w-4 h-4" />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;

import React, { useState } from "react";
import { 
  Trash2, 
  ShieldCheck, 
  AlertCircle, 
  Send,
  ArrowLeft,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { toast } from "react-hot-toast";
import SEO from "../components/SEO";

const DeleteDataPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "I want to delete my account and data",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // We use the support query endpoint which we've already enabled for guest access
      await api.post("/api/support", {
        name: formData.name,
        email: formData.email,
        subject: "Account and Data Deletion Request",
        message: `DELETION REQUEST:\n\nName: ${formData.name}\nEmail: ${formData.email}\nReason: ${formData.reason}\n\nNote: This request was submitted via the public data deletion portal.`,
      });
      
      toast.success("Request submitted successfully. Our team will process it within 7 business days.");
      setFormData({ name: "", email: "", reason: "" });
    } catch (err) {
      console.error("Submission failed:", err);
      toast.error("Failed to submit request. Please try again or contact support@prithu.app");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] selection:bg-black selection:text-white">
      <SEO 
        title="Delete My Data - Prithu"
        description="Submit a request to permanently delete your Prithu account and associated personal data."
      />

      {/* Navigation */}
      <div className="max-w-4xl mx-auto px-6 py-8 flex items-center justify-between">
        <button 
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-neutral-500 hover:text-black transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
             <Trash2 className="w-4 h-4 text-white" />
           </div>
           <span className="font-bold text-black tracking-tight">Prithu Safety</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-24">
        {/* Header */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="text-4xl font-black text-black tracking-tight mb-4">
            Request Data Deletion
          </h1>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-lg">
            Complete this form to permanently remove your account and all associated personal data from the Prithu platform.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Information Notice */}
          <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex gap-4">
            <div className="shrink-0">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-900 mb-1">Permanent Action</h4>
              <p className="text-sm text-red-700 leading-relaxed">
                Deleting your account is irreversible. All your posts, media, messages, and profile information will be permanently purged from our servers within 30 days of request verification.
              </p>
            </div>
          </div>

          {/* Deletion Options Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
              <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                Full Account Deletion
              </h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Permanently removes your entire profile, all posts, media, and account history. This action cannot be undone.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
              <h4 className="font-bold text-black mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                Partial Data Removal
              </h4>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Request deletion of specific data while keeping your account active. You can select individual categories below.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white border border-neutral-100 p-8 rounded-[2.5rem] shadow-xl shadow-neutral-200/40">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4 ml-1">What would you like to delete?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    "Full Account & All Data",
                    "Posts & Status Updates",
                    "Profile Pictures",
                    "Reward & Transaction History",
                    "Activity Data & Search History"
                  ].map((option) => (
                    <label key={option} className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 cursor-pointer hover:bg-neutral-100 transition-colors">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black"
                        onChange={(e) => {
                          const val = e.target.checked ? `[X] ${option}` : `[ ] ${option}`;
                          // Simple way to track in the reason/message field
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, reason: prev.reason + "\n- " + option }));
                          }
                        }}
                      />
                      <span className="text-sm font-medium text-neutral-700">{option}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-4 text-xs text-neutral-400 italic">
                  Note: For partial deletions, your Prithu account remains active.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Additional Details</label>
                <textarea
                  required
                  rows={4}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-5 py-4 bg-neutral-50 border border-neutral-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all resize-none"
                  placeholder="Please provide any additional details for your request..."
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-500 leading-relaxed">
                  <strong>Processing Time:</strong> Request verification and data purging typically take <strong>7 to 30 business days</strong>. You will receive a confirmation email once complete.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-black text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-neutral-200 group disabled:opacity-50"
              >
                {loading ? (
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    <span>Submit Deletion Request</span>
                    <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2 text-neutral-400">
               <Info className="w-4 h-4" />
               <span className="text-xs font-medium">Verification required</span>
            </div>
            <div className="w-1 h-1 bg-neutral-300 rounded-full"></div>
            <div className="flex items-center gap-2 text-neutral-400">
               <ShieldCheck className="w-4 h-4" />
               <span className="text-xs font-medium">Processed in 7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteDataPage;

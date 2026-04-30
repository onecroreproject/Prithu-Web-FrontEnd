import React from "react";
import { 
  HelpCircle, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  AlertCircle,
  Smartphone,
  Globe,
  Archive,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HowToDeleteAccount = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-neutral-50 selection:bg-neutral-900 selection:text-white">
      {/* Header Section */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-16 h-16 bg-neutral-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-neutral-200"
          >
            <HelpCircle className="w-8 h-8 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight"
          >
            Managing Your Account
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-4 text-xl text-neutral-500 max-w-2xl mx-auto"
          >
            Learn how to temporarily take a break or permanently remove your data from Prithu.
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid gap-12"
        >
          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Deactivation Card */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors">
                <Clock className="w-6 h-6 text-orange-500 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Deactivation</h2>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                A temporary solution for when you want to take a break. Your profile and content will be hidden from other users.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Recoverable within 20 days
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Data is kept securely
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <ShieldCheck className="w-4 h-4 text-green-500" /> Hide but don't delete
                </li>
              </ul>
            </motion.div>

            {/* Deletion Card */}
            <motion.div variants={itemVariants} className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500 transition-colors">
                <Trash2 className="w-6 h-6 text-red-500 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">Permanent Deletion</h2>
              <p className="mt-3 text-neutral-500 leading-relaxed">
                A permanent removal of all your data. Once deleted, this action cannot be undone.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <AlertCircle className="w-4 h-4 text-red-500" /> Irreversible data loss
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <AlertCircle className="w-4 h-4 text-red-500" /> Posts & media removed
                </li>
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                   <AlertCircle className="w-4 h-4 text-red-500" /> Circle severed immediately
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Instructions Sections */}
          <motion.div variants={itemVariants} className="space-y-8">
            <h3 className="text-3xl font-bold text-neutral-900">How to close your account</h3>
            
            <div className="space-y-6">
              {/* Web Instructions */}
              <div className="bg-neutral-900 text-white p-8 rounded-[2rem] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Globe className="w-32 h-32" />
                </div>
                <h4 className="text-xl font-bold mb-6 flex items-center gap-3">
                  <Globe className="w-6 h-6" /> Web & Desktop
                </h4>
                <div className="space-y-6 relative">
                  {[
                    "Log in to your account at prithu.app",
                    "Navigate to Settings > Close Account",
                    "Select whether you want to Deactivate or Delete",
                    "Provide a reason for leaving",
                    "Confirm the final warning"
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-neutral-300">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile Instructions */}
              <div className="bg-white p-8 rounded-[2rem] border border-neutral-100 shadow-sm">
                <h4 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-neutral-400" /> Mobile Application
                </h4>
                <div className="space-y-6">
                  {[
                    "Open the Prithu App and tap your Profile",
                    "Open Settings from the top menu",
                    "Tap on 'Security' or 'Account Management'",
                    "Select 'Close Account' at the bottom",
                    "Follow the on-screen prompts"
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <span className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-400 shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-neutral-600">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ/Important Notes */}
          <motion.div variants={itemVariants} className="bg-neutral-100 p-8 rounded-[2.5rem]">
            <h4 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-500" /> Important to know
            </h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-bold text-neutral-900">What about my data?</p>
                <p className="text-sm text-neutral-500 mt-1">We recommend downloading your media and posts before initiating a permanent deletion.</p>
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">Can I change my mind?</p>
                <p className="text-sm text-neutral-500 mt-1">Only if you chose deactivation. You have 20 days to log back in and restore your account.</p>
              </div>
            </div>
          </motion.div>

          {/* Action CTA */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col md:flex-row items-center justify-between gap-6 p-10 bg-white border border-neutral-100 rounded-[2.5rem] shadow-xl shadow-neutral-200/50"
          >
            <div className="text-center md:text-left">
              <h4 className="text-2xl font-bold text-neutral-900">Ready to proceed?</h4>
              <p className="text-neutral-500 mt-1">Make sure you've backed up any important data first.</p>
            </div>
            <button 
              onClick={() => navigate("/settings/close-account")}
              className="px-8 py-4 bg-neutral-900 text-white rounded-2xl font-bold hover:bg-neutral-800 transition-all flex items-center gap-2 group whitespace-nowrap"
            >
              Go to Account Settings
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Support */}
      <div className="bg-white border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-neutral-500">Still have questions? <button onClick={() => navigate("/contact")} className="text-neutral-900 font-bold hover:underline">Contact our support circle</button></p>
        </div>
      </div>
    </div>
  );
};

export default HowToDeleteAccount;

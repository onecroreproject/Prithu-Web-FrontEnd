import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertTriangle, Flag } from 'lucide-react';

const ReportPage = ({ isOpen, onClose }) => {
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reportTypes = [
    { value: 'spam', label: 'Spam or misleading content', icon: '🚫' },
    { value: 'harassment', label: 'Harassment or bullying', icon: '😠' },
    { value: 'inappropriate', label: 'Inappropriate content', icon: '⚠️' },
    { value: 'copyright', label: 'Copyright violation', icon: '©️' },
    { value: 'privacy', label: 'Privacy violation', icon: '🔒' },
    { value: 'other', label: 'Other', icon: '📋' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the report to your backend
   
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setReportType('');
      setDescription('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Flag className="w-5 h-5 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Report Issue</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
                    <p className="text-gray-600">Thank you for helping keep our community safe. We'll review your report.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Report Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        What would you like to report?
                      </label>
                      <div className="space-y-2">
                        {reportTypes.map((type) => (
                          <label
                            key={type.value}
                            className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              reportType === type.value
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="reportType"
                              value={type.value}
                              checked={reportType === type.value}
                              onChange={(e) => setReportType(e.target.value)}
                              className="text-red-600 focus:ring-red-500"
                            />
                            <span className="text-lg">{type.icon}</span>
                            <span className="text-sm font-medium text-gray-900">{type.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Please provide details
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue in detail..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      />
                    </div>

                    {/* Warning */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-yellow-800">Important</h4>
                          <p className="text-sm text-yellow-700 mt-1">
                            False reports may result in account restrictions. Please only report genuine issues.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={!reportType || !description.trim()}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      <Flag className="w-4 h-4" />
                      Submit Report
                    </button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportPage;

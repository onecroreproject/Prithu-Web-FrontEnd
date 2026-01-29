import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Bug,
  Flag,
  Lightbulb,
  User,
  FileText,
  Briefcase,
  Award,
  CreditCard,
  Bell,
  Mail,
  Smartphone,
  Monitor,
  X,
  Trash2,
  ExternalLink
} from 'lucide-react';

const FeedbackPage = () => {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'history'
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    section: '',
    status: '',
    category: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    section: '',
    type: 'feedback',
    category: 'other',
    title: '',
    message: '',
    device: '',
    platform: 'web'
  });

  const sections = [
    { value: 'post', label: 'Post', icon: <FileText className="w-4 h-4" /> },
    { value: 'comment', label: 'Comment', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'job', label: 'Job', icon: <Briefcase className="w-4 h-4" /> },
    { value: 'aptitude_test', label: 'Aptitude Test', icon: <Award className="w-4 h-4" /> },
    { value: 'portfolio', label: 'Portfolio', icon: <User className="w-4 h-4" /> },
    { value: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { value: 'help', label: 'Help Center', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'referral', label: 'Referral', icon: <CreditCard className="w-4 h-4" /> },
    { value: 'notification', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { value: 'app', label: 'App/Website', icon: <Monitor className="w-4 h-4" /> },
    { value: 'other', label: 'Other', icon: <MessageSquare className="w-4 h-4" /> }
  ];

  const categories = {
    feedback: [
      { value: 'feature_request', label: 'Feature Request', icon: <Lightbulb className="w-4 h-4" /> },
      { value: 'ui_ux', label: 'UI/UX Issue', icon: <Monitor className="w-4 h-4" /> },
      { value: 'performance', label: 'Performance', icon: <Smartphone className="w-4 h-4" /> },
      { value: 'other', label: 'Other Feedback', icon: <MessageSquare className="w-4 h-4" /> }
    ],
    report: [
      { value: 'bug', label: 'Bug', icon: <Bug className="w-4 h-4" /> },
      { value: 'spam', label: 'Spam', icon: <X className="w-4 h-4" /> },
      { value: 'abuse', label: 'Abuse', icon: <AlertTriangle className="w-4 h-4" /> },
      { value: 'harassment', label: 'Harassment', icon: <User className="w-4 h-4" /> },
      { value: 'misinformation', label: 'Misinformation', icon: <FileText className="w-4 h-4" /> },
      { value: 'other', label: 'Other Report', icon: <Flag className="w-4 h-4" /> }
    ]
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_review: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    in_review: <Clock className="w-4 h-4" />,
    resolved: <CheckCircle className="w-4 h-4" />,
    rejected: <X className="w-4 h-4" />
  };

  useEffect(() => {
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [activeTab, filters, searchQuery]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.type) params.type = filters.type;
      if (filters.section) params.section = filters.section;
      if (filters.status) params.status = filters.status;
      if (searchQuery) params.search = searchQuery;

      const response = await axios.get('/api/feedback/my', { params });

      setHistoryData(response.data.data);
    } catch (error) {
      console.error('Error fetching feedback history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Auto-detect device/platform
      const deviceInfo = {
        device: navigator.userAgent,
        platform: /mobile/i.test(navigator.userAgent) ? 'mobile' : 'web'
      };

      const payload = {
        ...formData,
        ...deviceInfo
      };

      const response = await axios.post('/api/feedback', payload);
      
      // Reset form on success
      setFormData({
        section: '',
        type: 'feedback',
        category: 'other',
        title: '',
        message: '',
        device: '',
        platform: 'web'
      });

      // Show success message
      alert('Thank you! Your feedback has been submitted.');
      
      // Switch to history to show the new submission
      setActiveTab('history');
      fetchHistory();
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset category when type changes
    if (name === 'type') {
      setFormData(prev => ({
        ...prev,
        type: value,
        category: 'other'
      }));
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      section: '',
      status: '',
      category: ''
    });
    setSearchQuery('');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSectionIcon = (sectionValue) => {
    const section = sections.find(s => s.value === sectionValue);
    return section?.icon || <MessageSquare className="w-4 h-4" />;
  };

  const getCategoryLabel = (categoryValue) => {
    const allCategories = [...categories.feedback, ...categories.report];
    const category = allCategories.find(c => c.value === categoryValue);
    return category?.label || categoryValue;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Feedback & Reports</h1>
          <p className="text-gray-600 mt-2">Share your feedback or report issues to help us improve</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab('submit')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Submit Feedback
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              My Submissions
              {historyData.length > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  {historyData.length}
                </span>
              )}
            </span>
          </button>
        </div>

        {/* Submit Feedback Form */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Submit Feedback</h2>
              <p className="text-gray-600 text-sm">
                Your feedback helps us improve Prithu. Whether it's a bug report, feature request, or general feedback, we appreciate your input.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  What would you like to submit?
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'type', value: 'feedback' } })}
                    className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                      formData.type === 'feedback'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${
                        formData.type === 'feedback'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Feedback</h3>
                        <p className="text-gray-600 text-sm mt-1">Suggest improvements or share your experience</p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleInputChange({ target: { name: 'type', value: 'report' } })}
                    className={`p-4 border rounded-lg text-left transition-all duration-200 ${
                      formData.type === 'report'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${
                        formData.type === 'report'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Report Issue</h3>
                        <p className="text-gray-600 text-sm mt-1">Report bugs, spam, or inappropriate content</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Section Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Where does this apply?
                </label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">Select a section</option>
                  {sections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  Category
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(formData.type === 'feedback' ? categories.feedback : categories.report).map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => handleInputChange({ target: { name: 'category', value: category.value } })}
                      className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                        formData.category === category.value
                          ? formData.type === 'feedback'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-2 mx-auto w-fit ${
                        formData.category === category.value
                          ? formData.type === 'feedback'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.icon}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{category.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your feedback"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Please provide detailed feedback or describe the issue..."
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                />
                <p className="text-gray-500 text-xs mt-2">
                  Be as specific as possible. Include steps to reproduce if reporting a bug.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || !formData.message}
                  className={`px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                    submitting || !formData.message
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : formData.type === 'feedback'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {formData.type === 'feedback' ? (
                        <>
                          <MessageSquare className="w-4 h-4" />
                          Submit Feedback
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Report Issue
                        </>
                      )}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search submissions..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {Object.values(filters).some(f => f) && (
                    <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {Object.values(filters).filter(f => f).length}
                    </span>
                  )}
                </button>

                {/* Clear Filters */}
                {(Object.values(filters).some(f => f) || searchQuery) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                  {/* Type Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="">All Types</option>
                      <option value="feedback">Feedback</option>
                      <option value="report">Report</option>
                    </select>
                  </div>

                  {/* Section Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Section</label>
                    <select
                      value={filters.section}
                      onChange={(e) => setFilters(prev => ({ ...prev, section: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="">All Sections</option>
                      {sections.map(section => (
                        <option key={section.value} value={section.value}>
                          {section.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="in_review">In Review</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    >
                      <option value="">All Categories</option>
                      {[...categories.feedback, ...categories.report].map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && historyData.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || Object.values(filters).some(f => f)
                    ? 'No submissions match your filters'
                    : 'Your feedback and reports will appear here'}
                </p>
                {searchQuery || Object.values(filters).some(f => f) ? (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('submit')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Submit Your First Feedback
                  </button>
                )}
              </div>
            )}

            {/* Feedback List */}
            {!loading && historyData.length > 0 && (
              <div className="space-y-4">
                {historyData.map((item) => (
                  <div key={item._id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${
                            item.type === 'feedback' ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {item.type === 'feedback' ? (
                              <MessageSquare className="w-5 h-5" />
                            ) : (
                              <AlertTriangle className="w-5 h-5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900 text-sm">
                                {item.title || 'No Title'}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[item.status]}`}>
                                  {statusIcons[item.status]}
                                  {item.status.replace('_', ' ')}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.type === 'feedback' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {item.type}
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm mb-3">{item.message}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                {getSectionIcon(item.section)}
                                <span className="capitalize">{item.section.replace('_', ' ')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>Category:</span>
                                <span className="font-medium">{getCategoryLabel(item.category)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(item.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Admin Response */}
                        {item.adminNote && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="p-1.5 bg-gray-100 rounded">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <span className="text-sm font-medium text-gray-900">Admin Response</span>
                            </div>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">
                              {item.adminNote}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More */}
            {historyData.length > 0 && (
              <div className="text-center pt-4">
                <button
                  onClick={fetchHistory}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tips for Effective Feedback</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                <li>• Be specific and provide clear examples</li>
                <li>• Include steps to reproduce bugs</li>
                <li>• Screenshots help us understand issues better</li>
                <li>• Check existing submissions before reporting duplicates</li>
                <li>• We typically respond within 1-3 business days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;

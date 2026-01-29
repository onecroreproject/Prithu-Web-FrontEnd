import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from '../api/axios';
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  User,
  FileText,
  Briefcase,
  Award,
  CreditCard,
  Bell,
  Mail,
  MessageCircle,
  ExternalLink,
  BookOpen,
  Settings,
  Users,
  X
} from 'lucide-react';

const FAQPage = () => {
  const [sections, setSections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [totalFAQs, setTotalFAQs] = useState(0);

  const sectionIcons = useMemo(() => ({
    getting_started: <User className="w-4 h-4" />,
    user_posts: <FileText className="w-4 h-4" />,
    aptitude_tests: <Award className="w-4 h-4" />,
    job_search: <Briefcase className="w-4 h-4" />,
    portfolio: <BookOpen className="w-4 h-4" />,
    referral_earnings: <CreditCard className="w-4 h-4" />,
    notifications: <Bell className="w-4 h-4" />,
    account_issues: <Settings className="w-4 h-4" />,
    test_issues: <Award className="w-4 h-4" />,
    job_application_issues: <Briefcase className="w-4 h-4" />,
    referral_payment_issues: <CreditCard className="w-4 h-4" />,
    support_contact: <MessageCircle className="w-4 h-4" />
  }), []);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return sections;
    return sections.filter(section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.faqs.some(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [sections, searchQuery]);

  useEffect(() => {
    fetchFAQs();
  }, [searchQuery]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/help', {
        params: { search: searchQuery }
      });
      setSections(response.data.data);
      setTotalFAQs(response.data.totalFAQs);

      // Auto-expand first section if search results are filtered
      if (searchQuery && response.data.data.length > 0) {
        setExpandedSections(new Set([response.data.data[0]._id]));
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  }, []);

  const toggleFAQ = useCallback((faqId) => {
    setExpandedFAQs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(faqId)) {
        newSet.delete(faqId);
      } else {
        newSet.add(faqId);
      }
      return newSet;
    });
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Expand all sections
  const expandAll = () => {
    const allSectionIds = new Set(sections.map(section => section._id));
    setExpandedSections(allSectionIds);
  };

  // Collapse all sections
  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-50 animate-pulse"></div>
                <HelpCircle className="relative w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
                <p className="text-gray-600 text-sm mt-1">Find answers to your questions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Collapse All
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Search questions, topics, or issues..."
                className="block w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-sm text-gray-500">
                {totalFAQs} results found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-blue-200 rounded-full animate-spin"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 font-medium">Loading FAQs...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm sticky top-8 transition-all duration-300">
                <h3 className="font-semibold text-gray-900 mb-4 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  Browse Topics
                </h3>
                <nav className="space-y-1">
                  {sections.map((section) => (
                    <button
                      key={section._id}
                      onClick={() => toggleSection(section._id)}
                      className={`group flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${expandedSections.has(section._id)
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200'
                        }`}
                    >
                      <div className={`p-1.5 rounded transition-all duration-200 ${expandedSections.has(section._id)
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-500'
                        }`}>
                        {sectionIcons[section.sectionKey] || <HelpCircle className="w-3 h-3" />}
                      </div>
                      <span className="font-medium text-sm flex-1 truncate">{section.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full transition-all duration-200 ${expandedSections.has(section._id)
                          ? 'bg-blue-200 text-blue-800'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-blue-200 group-hover:text-blue-800'
                        }`}>
                        {section.faqs.length}
                      </span>
                    </button>
                  ))}
                </nav>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Help</h4>
                  <div className="space-y-2">
                    <a
                      href="mailto:support@prithu.com"
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm p-2 hover:bg-blue-50 rounded-lg transition-all duration-200"
                    >
                      <Mail className="w-4 h-4" />
                      Email Support
                    </a>
                    <a
                      href="#"
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-800 text-sm p-2 hover:bg-purple-50 rounded-lg transition-all duration-200"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Live Chat
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Content */}
            <div className="lg:col-span-3">
              {searchQuery && filteredSections.length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-900 font-medium text-sm">
                        Showing results for "<span className="font-bold">{searchQuery}</span>"
                      </p>
                      <p className="text-blue-700 text-xs mt-1">
                        Found {totalFAQs} articles across {sections.length} categories
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {filteredSections.length === 0 ? (
                <div className="text-center py-12 animate-fadeIn">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-blue-100 rounded-full blur opacity-50"></div>
                    <HelpCircle className="relative w-16 h-16 text-gray-400 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Try searching with different keywords
                  </p>
                  <button
                    onClick={clearSearch}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium text-sm transition-all duration-200 hover:shadow-md"
                  >
                    View All Topics
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSections.map((section, sectionIndex) => (
                    <div
                      key={section._id}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                      style={{ animationDelay: `${sectionIndex * 100}ms` }}
                    >
                      <button
                        onClick={() => toggleSection(section._id)}
                        className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-gray-50/50 transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-blue-100 rounded-lg opacity-0 group-hover:opacity-50 transition-opacity duration-200"></div>
                            <div className={`p-2 rounded-lg relative transition-all duration-200 ${expandedSections.has(section._id)
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                              }`}>
                              {sectionIcons[section.sectionKey] || <HelpCircle className="w-4 h-4" />}
                            </div>
                          </div>
                          <div>
                            <h2 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                              {section.title}
                            </h2>
                            {section.description && (
                              <p className="text-gray-600 text-xs mt-1">{section.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {section.faqs.length}
                          </span>
                          <div className={`p-1 rounded transition-all duration-200 ${expandedSections.has(section._id)
                              ? 'bg-blue-100 text-blue-600 rotate-180'
                              : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                            }`}>
                            {expandedSections.has(section._id) ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </div>
                        </div>
                      </button>

                      {expandedSections.has(section._id) && (
                        <div className="border-t border-gray-100">
                          <div className="p-5 space-y-3">
                            {section.faqs.map((faq, faqIndex) => (
                              <div
                                key={faq._id}
                                className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:border-blue-300"
                                style={{ animationDelay: `${faqIndex * 50}ms` }}
                              >
                                <button
                                  onClick={() => toggleFAQ(faq._id)}
                                  className="flex items-center justify-between w-full px-4 py-3.5 text-left hover:bg-gray-50/50 transition-all duration-200 group"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="mt-1.5">
                                      <div className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${expandedFAQs.has(faq._id)
                                          ? 'bg-blue-500'
                                          : 'bg-gray-300 group-hover:bg-blue-400'
                                        }`}></div>
                                    </div>
                                    <span className="font-medium text-gray-900 text-sm pr-6 group-hover:text-blue-700 transition-colors duration-200">
                                      {faq.question}
                                    </span>
                                  </div>
                                  <div className={`p-1 rounded transition-all duration-200 ${expandedFAQs.has(faq._id)
                                      ? 'bg-blue-100 text-blue-600'
                                      : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                                    }`}>
                                    {expandedFAQs.has(faq._id) ? (
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                </button>

                                {expandedFAQs.has(faq._id) && (
                                  <div className="px-4 pb-4 animate-slideDown">
                                    <div className="pl-5 border-l-2 border-blue-400 bg-blue-50/50 p-4 rounded-r-lg">
                                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                                        {faq.answer}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Support CTA */}
              <div className="mt-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 text-white animate-fadeIn">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
                    <p className="text-blue-100 text-sm">
                      Our support team is always ready to help you
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <a
                      href="mailto:support@prithu.com"
                      className="px-5 py-2.5 bg-white text-blue-700 hover:bg-gray-100 rounded-lg font-semibold text-sm transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Email Support
                    </a>
                    <a
                      href="#"
                      className="px-5 py-2.5 border border-white text-white hover:bg-white/10 rounded-lg font-semibold text-sm transition-all duration-200"
                    >
                      Live Chat
                    </a>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Documentation</h4>
                  </div>
                  <p className="text-gray-600 text-xs mb-4">
                    Complete guides and API references
                  </p>
                  <a href="#" className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1.5">
                    Explore Docs
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Community</h4>
                  </div>
                  <p className="text-gray-600 text-xs mb-4">
                    Join discussions with other users
                  </p>
                  <a href="#" className="text-green-600 hover:text-green-800 font-medium text-xs flex items-center gap-1.5">
                    Join Forum
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Video Guides</h4>
                  </div>
                  <p className="text-gray-600 text-xs mb-4">
                    Watch step-by-step tutorials
                  </p>
                  <a href="#" className="text-purple-600 hover:text-purple-800 font-medium text-xs flex items-center gap-1.5">
                    Watch Videos
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-lg">Prithu Help</span>
              </div>
              <p className="text-gray-400 text-xs">
                Empowering your career journey
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-300 hover:text-white text-xs transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-xs transition-colors duration-200">
                Terms
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-xs transition-colors duration-200">
                Contact
              </a>
              <a href="#" className="text-gray-300 hover:text-white text-xs transition-colors duration-200">
                About
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center">
            <p className="text-gray-400 text-xs">© {new Date().getFullYear()} Prithu. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            max-height: 0;
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            max-height: 500px;
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default FAQPage;

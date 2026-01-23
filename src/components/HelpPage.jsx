import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Book, MessageCircle, Mail, ExternalLink, Search, ChevronDown, ChevronUp } from 'lucide-react';

const HelpPage = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqData = [
    {
      id: 1,
      question: 'How do I create a profile on Prithu?',
      answer: 'To create a profile, click on your profile picture in the top right corner and select "Edit Profile". Fill in your personal information, work experience, education, and skills. Make sure to add a professional photo and a compelling bio to make your profile stand out.'
    },
    {
      id: 2,
      question: 'How do I post content on my feed?',
      answer: 'Click on the "Create Post" button in your feed. You can write text, add images, videos, or links. Choose who can see your post (public, connections only, or specific groups). Once you\'re satisfied, click "Post" to share it with your network.'
    },
    {
      id: 3,
      question: 'How do I apply for jobs on Prithu?',
      answer: 'Browse job listings in the Jobs section. Click on any job that interests you to view details. If you meet the requirements, click "Apply Now" and follow the application process. You can track your applications in your profile under "Applied Jobs".'
    },
    {
      id: 4,
      question: 'How do I connect with other professionals?',
      answer: 'Search for people using the search bar, then visit their profiles. Click the "Connect" button and send a personalized message explaining why you\'d like to connect. Once they accept, you\'ll be connected and can message each other.'
    },
    {
      id: 5,
      question: 'What are aptitude tests and how do I take them?',
      answer: 'Aptitude tests help assess your skills in various areas. Go to the Learning section and click on "Take Aptitude Test". Choose the test category that interests you, answer the questions within the time limit, and receive your results and recommendations.'
    },
    {
      id: 6,
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your email address and we\'ll send you a reset link. Follow the instructions in the email to create a new password. Make sure to choose a strong, unique password.'
    },
    {
      id: 7,
      question: 'How do I report inappropriate content?',
      answer: 'Click the three dots (...) on any post or comment, then select "Report". Choose the reason for reporting and provide additional details if needed. Our moderation team will review the content and take appropriate action.'
    },
    {
      id: 8,
      question: 'Can I customize my notification settings?',
      answer: 'Yes! Go to Settings > Notifications. You can choose what types of notifications you receive (email, push notifications, in-app), and customize preferences for different activities like new connections, post likes, job alerts, etc.'
    },
    {
      id: 9,
      question: 'How do I delete my account?',
      answer: 'Account deletion is permanent and cannot be undone. Go to Settings > Account > Delete Account. We\'ll ask you to confirm your decision and may require additional verification. All your data will be permanently removed after 30 days.'
    },
    {
      id: 10,
      question: 'How do I change my email address?',
      answer: 'Go to Settings > Account > Email. Enter your new email address and current password. We\'ll send a verification email to both your old and new addresses. Click the verification links to complete the change.'
    }
  ];

  const filteredFaq = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const helpSections = {
    'getting-started': {
      title: 'Getting Started',
      icon: Book,
      content: [
        {
          title: 'Welcome to Prithu',
          description: 'Prithu is your professional networking platform where you can connect, share, and grow your career.',
          items: [
            'Create your profile to showcase your skills and experience',
            'Connect with professionals in your field',
            'Share posts and engage with your network',
            'Explore job opportunities and learning resources'
          ]
        }
      ]
    },
    'features': {
      title: 'Features',
      icon: HelpCircle,
      content: [
        {
          title: 'Feed',
          description: 'Stay updated with posts from your network',
          items: [
            'Like and comment on posts',
            'Share content with your network',
            'Create and share your own posts'
          ]
        },
        {
          title: 'Jobs',
          description: 'Find and apply for job opportunities',
          items: [
            'Browse job listings',
            'Apply directly through the platform',
            'Track your application status'
          ]
        },
        {
          title: 'Learning',
          description: 'Access learning resources and courses',
          items: [
            'Take aptitude tests',
            'Access learning materials',
            'Track your progress'
          ]
        }
      ]
    },
    'faq': {
      title: 'FAQ',
      icon: HelpCircle,
      content: []
    },
    'support': {
      title: 'Support',
      icon: MessageCircle,
      content: [
        {
          title: 'Need Help?',
          description: 'Get support from our team',
          items: [
            'Check our FAQ section',
            'Contact support team',
            'Report issues or bugs'
          ]
        }
      ]
    }
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Help Center</h2>
                  <p className="text-gray-600">Find answers and get support</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[600px]">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 bg-gray-50/50 p-4">
                <nav className="space-y-2">
                  {Object.entries(helpSections).map(([key, section]) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTab(key)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          activeTab === key
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>

                {/* Contact Support */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Need More Help?</h4>
                  <div className="space-y-2">
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <Mail className="w-4 h-4" />
                      Contact Support
                    </button>
                    <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                      <MessageCircle className="w-4 h-4" />
                      Live Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-2xl">
                  {activeTab === 'faq' ? (
                    <div>
                      {/* Search Bar */}
                      <div className="mb-6">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      {/* FAQ List */}
                      <div className="space-y-4">
                        {filteredFaq.length > 0 ? (
                          filteredFaq.map((faq) => (
                            <motion.div
                              key={faq.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <button
                                onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                                className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
                              >
                                <span className="font-medium text-gray-900">{faq.question}</span>
                                {expandedFaq === faq.id ? (
                                  <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                              </button>
                              <AnimatePresence>
                                {expandedFaq === faq.id && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-gray-200"
                                  >
                                    <div className="px-6 py-4 bg-gray-50">
                                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No FAQs found matching your search.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    helpSections[activeTab].content.map((section, index) => (
                      <div key={index} className="mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">
                          {section.title}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {section.description}
                        </p>
                        <ul className="space-y-2">
                          {section.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3">
                              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Still need help? Visit our{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    comprehensive documentation
                  </a>
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Got it!
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HelpPage;

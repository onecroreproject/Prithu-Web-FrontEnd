import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, User, Bot, Loader2, Link } from 'lucide-react';
import axios from 'axios';
import ChatMessage from './ChatMessage';
import ContactForm from './ContactForm';
import ThreadCard from './ThreadCard';

// Using v4 uuid for guest session ids if not already defined globally
const generateSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const messagesEndRef = useRef(null);
  
  const sessionId = generateSessionId();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message
      setMessages([
        {
          id: 'welcome',
          sender: 'bot',
          text: 'Hi there! 👋 How can I help you today?',
          timestamp: new Date()
        }
      ]);
      fetchHistory();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showContactForm]);

  const fetchHistory = async () => {
    try {
      // Fetch user history from backend
      const res = await axios.get(`http://localhost:5000/api/chat/history?sessionId=${sessionId}`);
      if (res.data.success && res.data.history.length > 0) {
        const historyMessages = res.data.history.map(item => ({
          id: item._id,
          sender: 'user',
          text: item.question,
          timestamp: item.createdAt
        }));
        // We only show user questions from history for simplicity in this demo,
        // but normally we'd interleave bot responses too.
        // setMessages(prev => [...prev, ...historyMessages]); 
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuery(input);
    setInput('');
    setIsTyping(true);
    setShowContactForm(false);

    try {
      const res = await axios.post('http://localhost:5000/api/chat/search', {
        question: userMessage.text,
        sessionId
      });

      const { hasMatch, results, message } = res.data;

      const botResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: message,
        results: hasMatch ? results : null,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);

      if (!hasMatch) {
        setShowContactForm(true);
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Sorry, I am having trouble connecting to the server. Please try again later.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleContactSubmit = async (formData) => {
    try {
      await axios.post('http://localhost:5000/api/chat/lead', {
        ...formData,
        searchQuery: currentQuery,
        sessionId
      });
      
      setShowContactForm(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'bot',
        text: 'Thank you! Your request has been submitted. Our support team will get back to you shortly.',
        timestamp: new Date()
      }]);
    } catch (error) {
      alert("Failed to submit contact request.");
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/50 hover:scale-110 transition-all z-50 flex items-center justify-center"
          >
            <MessageCircle size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-4rem)] bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-semibold leading-tight">AI Support</h3>
                  <span className="text-xs text-blue-100 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {isTyping && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-2xl rounded-tl-sm flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}

              {showContactForm && (
                <ContactForm onSubmit={handleContactSubmit} onCancel={() => setShowContactForm(false)} />
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <Send size={20} className="ml-1" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;

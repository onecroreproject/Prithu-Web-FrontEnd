import React from 'react';
import { Bot, User } from 'lucide-react';
import ThreadCard from './ThreadCard';
import { motion } from 'framer-motion';

const ChatMessage = ({ message }) => {
  const isBot = message.sender === 'bot';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 max-w-[90%] ${isBot ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
        {isBot ? <Bot size={16} /> : <User size={16} />}
      </div>
      
      <div className="flex flex-col gap-2">
        <div className={`p-3 rounded-2xl ${isBot ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm shadow-md shadow-blue-500/20'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
        </div>

        {/* Render Results if available */}
        {message.results && message.results.length > 0 && (
          <div className="flex flex-col gap-2 mt-1 w-[260px]">
            <span className="text-xs text-gray-500 font-medium ml-1">Suggested resources:</span>
            {message.results.map((result, idx) => (
              <ThreadCard key={result.id || idx} thread={result} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;

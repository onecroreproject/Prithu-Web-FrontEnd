import React from 'react';
import { ExternalLink, BookOpen, MessageSquare, Newspaper } from 'lucide-react';

const ThreadCard = ({ thread }) => {
  
  const getIcon = () => {
    switch(thread.category) {
      case 'Blog': return <Newspaper size={14} className="text-blue-500" />;
      case 'FAQ': return <BookOpen size={14} className="text-green-500" />;
      default: return <MessageSquare size={14} className="text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 mb-1">
          {getIcon()}
          <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-500">{thread.category}</span>
        </div>
        <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
      </div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight mb-1">
        {thread.title}
      </h4>
      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
        {thread.description}
      </p>
    </div>
  );
};

export default ThreadCard;

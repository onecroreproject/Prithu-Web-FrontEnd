import React from 'react';
import { Clock, Eye, Zap, TrendingUp, Sparkles, Users, PenTool } from 'lucide-react';

const JobBlogs = () => {
  const blogs = [
    {
      id: 1,
      title: "AI Career Revolution: Future-Proof Your Skills in 2025",
      category: "Future Skills",
      categoryColor: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800",
      date: "Jan 2025",
      readTime: "15 min",
      views: "Pre-launch",
      badge: "Must Read"
    },
    {
      id: 2,
      title: "Remote Work Mastery: Thriving in Distributed Teams",
      category: "Work Culture",
      categoryColor: "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800",
      date: "Jan 2025",
      readTime: "12 min",
      views: "Pre-launch",
      badge: "Team Guide"
    },
    {
      id: 3,
      title: "Salary Negotiation Secrets for Tech Professionals",
      category: "Career Growth",
      categoryColor: "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800",
      date: "Jan 2025",
      readTime: "10 min",
      views: "Pre-launch",
      badge: "Career Boost"
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Compact Header */}
      <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Career Insights</h3>
              <p className="text-xs text-gray-600">Professional growth articles</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold rounded-full">
            <Zap className="w-3 h-3" />
            <span>SOON</span>
          </div>
        </div>
      </div>
      
      {/* Compact Blog List */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-4 text-sm">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-gray-900">Coming Soon Preview</span>
        </div>
        
        <div className="space-y-3">
          {blogs.map((blog) => (
            <div 
              key={blog.id} 
              className="group p-3 border border-gray-100 rounded-lg hover:border-orange-200 hover:bg-orange-50/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* Category & Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${blog.categoryColor}`}>
                      {blog.category}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {blog.badge}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                    {blog.title}
                  </h4>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{blog.readTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{blog.views}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-600">
                      <PenTool className="w-3 h-3" />
                      <span className="font-medium">Preview</span>
                    </div>
                  </div>
                </div>
                
                {/* Coming Soon Indicator */}
                <div className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs font-bold rounded">
                  {blog.date}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Compact Community Info */}
        <div className="mt-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">Join 5K+ Professionals</h4>
              <p className="text-xs text-gray-600">Early access to premium career content</p>
            </div>
          </div>
        </div>
        
        {/* Compact Benefits */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
            <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center mb-1">
              <TrendingUp className="w-3 h-3 text-blue-600" />
            </div>
            <h5 className="text-xs font-semibold text-gray-900">Growth</h5>
          </div>
          
          <div className="p-2 bg-gradient-to-br from-green-50 to-white rounded-lg border border-green-100">
            <div className="w-6 h-6 bg-green-100 rounded-md flex items-center justify-center mb-1">
              <Sparkles className="w-3 h-3 text-green-600" />
            </div>
            <h5 className="text-xs font-semibold text-gray-900">Insights</h5>
          </div>
          
          <div className="p-2 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
            <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center mb-1">
              <Users className="w-3 h-3 text-purple-600" />
            </div>
            <h5 className="text-xs font-semibold text-gray-900">Network</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobBlogs;
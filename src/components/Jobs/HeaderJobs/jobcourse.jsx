import React from 'react';
import { BookOpen, Clock, TrendingUp, Users, Zap, Target } from 'lucide-react';

const JobCourses = () => {
  const courses = [
    {
      id: 1,
      provider: 'Career Catalyst',
      title: 'Leadership Accelerator',
      type: 'Management',
      duration: '4 Months',
      level: 'Executive',
      tagline: 'Manager to Leader'
    },
    {
      id: 2,
      provider: 'SkillForge',
      title: 'Future-Proof Career',
      type: 'Tech Skills',
      duration: '6 Months',
      level: 'Advanced',
      tagline: 'AI Mastery'
    },
    {
      id: 3,
      provider: 'Career Catalyst',
      title: 'Talent Development',
      type: 'HR Excellence',
      duration: '3 Months',
      level: 'Professional',
      tagline: 'Build High-Performance Teams'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Career Courses</h3>
              <p className="text-xs text-gray-600">Upskill & advance</p>
            </div>
          </div>
          <div className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-full">
            SOON
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <p className="text-xs text-gray-700">
              Upskill for promotions & higher pay
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-blue-500" />
            <p className="text-xs text-gray-700">
              Develop talent & reduce turnover
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          {courses.map((course) => (
            <div 
              key={course.id} 
              className="border border-gray-200 rounded-lg p-2 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-900 line-clamp-1">
                      {course.title}
                    </span>
                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded">
                      {course.level}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 italic line-clamp-1">
                    {course.tagline}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="font-medium">{course.provider}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{course.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 font-medium rounded-full">
                  {course.type}
                </span>
                <span className="text-xs px-2 py-1 bg-gradient-to-r from-green-50 to-emerald-100 text-emerald-700 font-medium rounded-full">
                  Premium
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-gray-900 to-gray-800 text-white text-xs font-semibold rounded-lg">
            <Target className="w-3.5 h-3.5" />
            <span className="flex-1">Be First to Access Courses</span>
            <Users className="w-3.5 h-3.5" />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Join waitlist for early access
          </p>
        </div>
      </div>
    </div>
  );
};

export default JobCourses;
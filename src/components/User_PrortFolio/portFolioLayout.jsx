/* ✅ src/components/profileLayout.jsx */
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Award,
  BookOpen,
  Code,
  Star,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  TrendingUp,
  FileText,
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Globe,
  Eye,
  EyeOff,
  Lock,
  Globe as GlobeIcon,
  Users
} from "lucide-react";
import api from "../../api/axios";

import PortfolioSidebar from "./sideBar";
import HeroSection from "./heroSection";
import StatsBar from "./statusBar";
import ServicesSection from "./serviceSection";
import SkillSetSection from "./skillSetSection";
import PortfolioUnderConstruction from "../../UnderConstructionPages/portfolioUnderConstruction";

export default function PortfolioLayout() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Check token in localStorage
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { data } = await api.get(`/api/user/portfolio/${username}`);
        
        if (data.success) {
          setPortfolioData(data.data);
          setIsPublished(data.data?.profileSettings?.isPublished || false);
          
          // Check if user is authorized (has token OR portfolio is published)
          if (token || data.data?.profileSettings?.isPublished) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(false);
        }
      } catch (err) {
        console.error("❌ Failed to fetch portfolio:", err);
        setIsAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchPortfolio();
  }, [username, token]);

  // Process aptitude tests to show only highest score per test
  const processedAptitudeTests = useMemo(() => {
    if (!portfolioData?.aptitudeTests) return [];
    
    const testMap = new Map();
    portfolioData.aptitudeTests.forEach(test => {
      const existing = testMap.get(test.testName);
      if (!existing || test.score > existing.score) {
        testMap.set(test.testName, test);
      }
    });
    
    return Array.from(testMap.values());
  }, [portfolioData?.aptitudeTests]);

  // ✅ Loading State
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading portfolio...</p>
        </div>
      </div>
    );

  // ✅ Not Authorized State (No token and not published)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md w-full"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
              {isPublished ? (
                <Eye className="w-10 h-10 text-blue-500 dark:text-blue-400" />
              ) : (
                <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              )}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              {isPublished 
                ? "Portfolio Preview Restricted" 
                : "Portfolio Under Construction"}
            </h2>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {isPublished 
                ? token 
                  ? "Loading your portfolio..." 
                  : "This portfolio is currently private. Please log in to view it."
                : "This portfolio is not yet published. The owner is still working on it."}
            </p>

            {/* Creative Messages */}
            <div className="space-y-4 mb-8">
              {isPublished && !token ? (
                <>
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    "Great things are not done by impulse, but by a series of small things brought together."
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <GlobeIcon className="w-4 h-4 inline mr-2" />
                    This creator prefers to share their work privately.
                  </div>
                </>
              ) : !isPublished ? (
                <>
                  <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                    "Every masterpiece was once a work in progress. Something amazing is being crafted here."
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <Users className="w-4 h-4 inline mr-2" />
                    Check back soon to see the finished creation!
                  </div>
                </>
              ) : null}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isPublished && !token ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Sign In to View
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Create Your Own Portfolio
                  </button>
                </>
              ) : !isPublished ? (
                <>
                  <button
                    onClick={() => navigate('/')}
                    className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
                  >
                    Explore Other Portfolios
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Start Building Yours
                  </button>
                </>
              ) : null}
            </div>

            {/* Footer Note */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isPublished 
                  ? "Want to share your work privately? Create your portfolio on Prithu."
                  : "Build your professional portfolio with Prithu - Showcase your skills and achievements"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ✅ Not Found State (Authorized but no data)
  if (!portfolioData)
    return (
      <PortfolioUnderConstruction username={username} />
    );

  const { user, profileSettings, curriculum } = portfolioData;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Private Badge for unpublished but owner viewing */}
      {!isPublished && token && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Draft Preview - Not Published
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 🎨 Hero Section */}
      <HeroSection 
        user={user} 
        profileSettings={profileSettings}
        curriculum={curriculum}
        shareableLink={profileSettings?.shareableLink}
        isPublished={isPublished}
        isOwner={!!token}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sidebar */}
          <div className="lg:col-span-1">
            <PortfolioSidebar 
              user={user} 
              profileSettings={profileSettings} 
              curriculum={curriculum}
              shareableLink={profileSettings?.shareableLink}
              isPublished={isPublished}
            />
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Section */}
            <StatsBar 
              experience={curriculum?.experience || []}
              projects={curriculum?.projects || []}
              skills={curriculum?.skills || []}
              certifications={curriculum?.certifications || []}
              isPublished={isPublished}
            />

            {/* Profile Summary Section */}
            <ServicesSection 
              profileSettings={profileSettings}
              curriculum={curriculum}
              projects={curriculum?.projects || []}
              isPublished={isPublished}
            />

            {/* Aptitude Tests Section */}
            {processedAptitudeTests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Aptitude Tests
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Highest scores achieved
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {processedAptitudeTests.map((test, index) => (
                    <div
                      key={test._id}
                      className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {test.testName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Score: {test.score}%
                          </p>
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-1">
                          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {test.score}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            style={{ width: `${test.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Skills Section */}
            <SkillSetSection 
              skills={curriculum?.skills || []} 
              isPublished={isPublished}
            />

            {/* Skills Visualization Section */}
            {curriculum?.skills && curriculum.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                  Technical Expertise
                </h2>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  {curriculum.skills.map((skill, index) => (
                    <motion.div
                      key={skill._id || index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group"
                    >
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 w-32 text-center hover:shadow-lg transition-all duration-300">
                        <div className="w-12 h-12 mx-auto mb-2 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Code className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {skill.name}
                        </h3>
                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-1">
                          {skill.level || 'Intermediate'}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Projects Section */}
            {curriculum?.projects && curriculum.projects.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Code className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Featured Projects
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {curriculum.projects.map((project) => (
                    <div
                      key={project._id}
                      className="group bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                          {project.title}
                        </h3>
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>

                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.technologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <span>
                          {new Date(project.startDate).toLocaleDateString()}
                        </span>
                        {!project.isOngoing && (
                          <span>
                            → {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Education Section */}
            {curriculum?.education && curriculum.education.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Education
                  </h2>
                </div>

                <div className="space-y-6">
                  {curriculum.education.map((edu, index) => (
                    <div
                      key={edu._id || index}
                      className="flex gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {edu.schoolOrCollege}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {edu.fieldOfStudy} • {edu.level}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {edu.boardOrUniversity}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>{edu.startYear}</span>
                          <span>→</span>
                          <span>{edu.endYear || "Present"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Certifications Section */}
            {curriculum?.certifications && curriculum.certifications.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-6 h-6 text-amber-500" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Certifications
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {curriculum.certifications.map((cert, index) => (
                    <div
                      key={cert._id || index}
                      className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-800"
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {cert.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {cert.issuingOrganization}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Issued: {new Date(cert.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Languages & Interests */}
            {(curriculum?.languages?.length > 0 || curriculum?.interests?.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Languages */}
                {curriculum?.languages && curriculum.languages.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {curriculum.languages.map((lang, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {curriculum?.interests && curriculum.interests.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {curriculum.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-gray-900 text-white py-8 md:py-12 mt-12"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <p className="text-xl font-bold">
                © {new Date().getFullYear()} {profileSettings?.displayName || user?.userName}
              </p>
              <p className="text-gray-400 mt-2">
                {profileSettings?.shareableLink && (
                  <a
                    href={profileSettings.shareableLink}
                    className="hover:text-blue-400 transition"
                  >
                    {profileSettings.shareableLink}
                  </a>
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {user?.email && (
                <a
                  href={`mailto:${user.email}`}
                  className="flex items-center gap-2 text-gray-300 hover:text-white transition"
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Contact</span>
                </a>
              )}
              
              <div className="text-gray-400">
                Portfolio powered by Prithu
              </div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
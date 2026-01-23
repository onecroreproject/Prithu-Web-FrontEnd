import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './companyLayoutComponent/sideTabs';
import CreateJob from './companyLayoutComponent/tabComponent/createJob';
import ViewJobs from './companyLayoutComponent/tabComponent/viewJobs';
import { FiMenu, FiX, FiFileText, FiMapPin } from 'react-icons/fi';
import companyApi from '../../api/companyApi';
import { toast } from 'react-toastify';
import SettingsPage from './companyLayoutComponent/tabComponent/settings';
import HrDashboard from './companyLayoutComponent/tabComponent/dashBoard';
import Applicants from './companyLayoutComponent/tabComponent/appicatns';

const CompanyDashboard = () => {
  const [companyProfile, setCompanyProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentDrafts, setRecentDrafts] = useState([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  
  // Location states (simplified)
  const [locationUpdated, setLocationUpdated] = useState(false);
  const [shouldShowCreateJob, setShouldShowCreateJob] = useState(true); // Default to true since no location check

  // Fetch company profile
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await companyApi.get("/job/get/company/profile");
        console.log("Company Profile Response:", res.data);
        setCompanyProfile(res.data);
        
        // Check if location is already set in profile
        if (res.data.location && res.data.location.latitude && res.data.location.longitude) {
          setLocationUpdated(true);
        }
      } catch (error) {
        console.error("Error fetching company profile:", error);
        toast.error("Failed to load company profile");
      }
    };

    fetchCompanyProfile();
  }, []);

  // Fetch recent drafts
  const fetchRecentDrafts = async () => {
    try {
      setLoadingDrafts(true);
      const response = await companyApi.get('/job/get/recent/drafts', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('companyToken')}`
        }
      });
      
      if (response.data.success) {
        setRecentDrafts(response.data.drafts || []);
      } else {
        toast.error('Failed to fetch drafts');
      }
    } catch (error) {
      console.error('Error fetching drafts:', error);
      toast.error(error.response?.data?.message || 'Error loading drafts');
    } finally {
      setLoadingDrafts(false);
    }
  };

  // Load drafts when createJob tab is active
  useEffect(() => {
    if (activeTab === 'createJob' && shouldShowCreateJob) {
      fetchRecentDrafts();
    }
  }, [activeTab, shouldShowCreateJob]);


 

  // Handle draft selection
  const handleDraftSelect = (draft) => {
    setSelectedDraft(draft);
    setSidebarOpen(false);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'createJob':
        // Always show CreateJob since location check is removed
        return (
          <CreateJob
            selectedDraft={selectedDraft}
            onDraftSaved={fetchRecentDrafts}
            onClearDraft={() => setSelectedDraft(null)}
            recentDrafts={recentDrafts}
            loadingDrafts={loadingDrafts}
            onSwitchToSettings={() => setActiveTab('settings')}
          />
        );
      case 'applicants':
        return <Applicants />;
      case 'dashboard':
        return <HrDashboard />;
      case 'settings':
        return <SettingsPage 
          companyProfile={companyProfile} 
          onProfileUpdate={() => {
            // Refresh company profile when settings are updated
            companyApi.get("/job/get/company/profile")
              .then(res => setCompanyProfile(res.data))
              .catch(err => console.error("Error refreshing profile:", err));
          }} 
        />;
      case 'viewJobs':
        return <ViewJobs />;
      default:
        return <HrDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FiX className="text-gray-700" /> : <FiMenu className="text-gray-700" />}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Company Dashboard</h1>
          </div>
          
          {/* Show company name if available */}
          {companyProfile?.companyName && (
            <div className="text-sm text-gray-600 font-medium">
              {companyProfile.companyName}
            </div>
          )}
          
          {/* Mobile Drafts Button */}
          {activeTab === 'createJob' && recentDrafts.length > 0 && (
            <button
              onClick={() => setDraftModalOpen(true)}
              className="relative p-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              aria-label="View drafts"
            >
              <FiFileText className="text-blue-600" />
              {recentDrafts.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {recentDrafts.length}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="relative flex">
        {/* Sidebar */}
        <div className={`
          fixed lg:relative top-0 left-0 h-screen lg:h-auto z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          w-64 lg:w-72 xl:w-80
        `}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={handleTabChange}
            onMobileItemClick={() => setSidebarOpen(false)}
            recentDraftsCount={recentDrafts.length}
            companyInfo={companyProfile}
            locationUpdated={locationUpdated}
          />
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-6 xl:mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">
                    {activeTab === 'createJob' ? 'Create New Job' : 
                     activeTab === 'dashboard' ? 'Dashboard' :
                     activeTab === 'applicants' ? 'Applicants' :
                     activeTab === 'settings' ? 'Settings' : 
                     activeTab === 'viewJobs' ? 'Job Listings' : 'Company Dashboard'}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {activeTab === 'createJob' 
                      ? 'Create and publish new job opportunities' 
                      : activeTab === 'dashboard'
                      ? 'Overview of your hiring activities'
                      : activeTab === 'applicants'
                      ? 'Manage and review job applications'
                      : activeTab === 'settings'
                      ? 'Manage your company settings'
                      : 'View and manage all job postings'}
                  </p>
                </div>
                
                {/* Company name display */}
                {companyProfile?.companyName && (
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {companyProfile.companyName}
                    </div>
                    <div className="text-sm text-gray-600 flex items-center justify-end gap-1">
                      {companyProfile.companyEmail}
                      {locationUpdated && (
                        <FiMapPin className="text-green-500" title="Location set" />
                      )}
                    </div>
                  </div>
                )}
                
                {/* Drafts button for desktop */}
                {activeTab === 'createJob' && recentDrafts.length > 0 && (
                  <button
                    onClick={() => setDraftModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                  >
                    <FiFileText />
                    <span>View Drafts ({recentDrafts.length})</span>
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[calc(100vh-180px)]">
              {renderContent()}
            </div>

            {/* Mobile Floating Action Button */}
            <div className="lg:hidden fixed bottom-6 right-6 z-30">
              <button
                onClick={() => handleTabChange('createJob')}
                className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-105"
                aria-label="Create job"
              >
                <span className="text-sm font-semibold">+ New Job</span>
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Drafts Modal */}
      {draftModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setDraftModalOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="h-full overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <FiFileText className="text-blue-500" />
                    Recent Drafts
                  </h3>
                  <button
                    onClick={() => setDraftModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100"
                  >
                    <FiX className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                {loadingDrafts ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : recentDrafts.length > 0 ? (
                  <div className="space-y-3">
                    {recentDrafts.map((draft) => (
                      <div
                        key={draft._id}
                        className={`p-3 bg-gray-50 rounded-lg border cursor-pointer transition-colors hover:bg-blue-50 ${
                          selectedDraft?._id === draft._id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                        onClick={() => {
                          handleDraftSelect(draft);
                          setDraftModalOpen(false);
                        }}
                      >
                        <h4 className="font-medium text-gray-900 truncate mb-1">
                          {draft.jobTitle || 'Untitled Draft'}
                        </h4>
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {draft.jobDescription ? draft.jobDescription.substring(0, 60) + '...' : 'No description'}
                        </p>
                        <div className="text-xs text-gray-500">
                          Updated: {new Date(draft.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiFileText className="mx-auto text-gray-400 text-3xl mb-2" />
                    <p className="text-gray-500">No drafts found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyDashboard;
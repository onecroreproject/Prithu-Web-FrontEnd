import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiFileText, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';
import { MdWork, MdAddCircle } from 'react-icons/md';
import JobPostingForm from './createTabComponent/JobApplication';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreateJob = ({ selectedDraft, onDraftSaved, onClearDraft, recentDrafts, loadingDrafts }) => {
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const navigate = useNavigate();
  const [localDrafts, setLocalDrafts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initialize with API drafts or empty array
  useEffect(() => {
    if (recentDrafts) {
      const formattedDrafts = recentDrafts.map(draft => ({
        id: draft._id,
        title: draft.jobTitle || 'Untitled Draft',
        category: draft.jobCategory || 'General',
        type: draft.employmentType || 'Full Time',
        status: 'draft',
        applicants: 0,
        created: new Date(draft.updatedAt).toISOString().split('T')[0],
        draftData: draft // Keep original draft data
      }));
      setLocalDrafts(formattedDrafts);
    }
  }, [recentDrafts]);

  // If selectedDraft is passed, open the form with it
  useEffect(() => {
    if (selectedDraft && !showJobForm) {
      handleEditDraft(selectedDraft);
    }
  }, [selectedDraft]);

  const handleOpenNewForm = () => {
    navigate("/jobs/create");
  };

  const handleEditDraft = (draft) => {
    navigate(`/jobs/edit/${draft.id}`)
  };

  const handleCloseForm = () => {
    setShowJobForm(false);
    setJobToEdit(null);
    onClearDraft?.();
  };

  const handleSaveJob = async (savedJob) => {
    try {
      console.log('Job saved:', savedJob);
      
      // Update local drafts if job was saved as draft
      if (savedJob.status === 'draft') {
        onDraftSaved?.(); // Refresh drafts from API
      }
      
      setShowJobForm(false);
      setJobToEdit(null);
      onClearDraft?.();
    } catch (error) {
      console.error('Error saving job:', error);
      toast.error('Failed to save job');
    }
  };

  // Load draft from API for editing
  const loadDraftForEditing = async (draftId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/company/get/draft/${draftId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('companyToken')}`
        }
      });
      
      if (response.data.success) {
        handleEditDraft(response.data.draft);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
      toast.error('Failed to load draft');
    } finally {
      setLoading(false);
    }
  };

  // Quick Job Templates
  const jobTemplates = [
    {
      id: 'tech',
      title: 'Tech Startup',
      description: 'Fast-paced tech environment with agile methodology',
      roles: ['Software Engineer', 'Product Manager', 'DevOps'],
      color: 'bg-blue-100 text-blue-700',
      icon: '💻'
    },
    {
      id: 'corporate',
      title: 'Corporate',
      description: 'Structured corporate environment with clear growth paths',
      roles: ['Manager', 'Analyst', 'Executive'],
      color: 'bg-emerald-100 text-emerald-700',
      icon: '🏢'
    },
    {
      id: 'remote',
      title: 'Remote Team',
      description: 'Fully remote positions with flexible hours',
      roles: ['Remote Developer', 'Virtual Assistant', 'Online Marketer'],
      color: 'bg-purple-100 text-purple-700',
      icon: '🌐'
    },
    {
      id: 'contract',
      title: 'Contract Work',
      description: 'Project-based contract positions',
      roles: ['Contractor', 'Freelancer', 'Consultant'],
      color: 'bg-amber-100 text-amber-700',
      icon: '📋'
    }
  ];

  // Stats calculations
  const totalDrafts = localDrafts.length;
  const activeJobs = localDrafts.filter(j => j.status === 'active').length;
  const draftCount = localDrafts.filter(j => j.status === 'draft').length;

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Show JobPostingForm Modal */}
      {showJobForm && (
        <div className="fixed inset-0 z-50">
          <JobPostingForm 
            job={jobToEdit}
            onClose={handleCloseForm}
            onSave={handleSaveJob}
          />
        </div>
      )}

      {/* Header Section */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              <FiBriefcase className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                Create New Job Posting
              </h2>
              <p className="text-gray-600 mt-1">
                Design detailed job descriptions and attract top talent
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedDraft && (
              <button
                onClick={onClearDraft}
                className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium rounded-lg transition-colors"
              >
                Clear Draft Selection
              </button>
            )}
            <button
              onClick={handleOpenNewForm}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all"
            >
              <MdAddCircle className="text-lg" />
              <span>Create New Job</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Draft Banner */}
      {selectedDraft && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiFileText className="text-blue-600 text-xl" />
              <div>
                <h3 className="font-semibold text-blue-900">Editing Draft</h3>
                <p className="text-sm text-blue-700">
                  {selectedDraft.jobTitle || 'Untitled Draft'} • Last updated: {new Date(selectedDraft.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={onClearDraft}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Start Fresh Instead
            </button>
          </div>
        </div>
      )}

      {/* Quick Templates Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {jobTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group"
              onClick={handleOpenNewForm}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{template.icon}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${template.color}`}>
                  Template
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {template.roles.slice(0, 2).map((role, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    {role}
                  </span>
                ))}
                {template.roles.length > 2 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    +{template.roles.length - 2} more
                  </span>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="text-blue-600 text-sm font-medium group-hover:text-blue-700">
                  Use Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Drafts & Jobs */}
      <div className=" gap-6">
        {/* Left Column - Quick Tips */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Drafts */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Drafts</h3>
              <div className="flex items-center gap-2">
                {loadingDrafts ? (
                  <FiRefreshCw className="animate-spin text-gray-400" />
                ) : (
                  <span className="text-sm text-gray-500">
                    {draftCount} {draftCount === 1 ? 'draft' : 'drafts'}
                  </span>
                )}
              </div>
            </div>
            
            {loadingDrafts ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : draftCount > 0 ? (
              <div className="space-y-3">
                {localDrafts
                  .filter(job => job.status === 'draft')
                  .slice(0, 3)
                  .map(job => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group transition-colors"
                      onClick={() => handleEditDraft(job)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                          <FiFileText className="text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{job.title}</h4>
                          <p className="text-sm text-gray-500">{job.category} • {job.type}</p>
                        </div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                        Continue Editing →
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="text-gray-400 mb-3">
                  <FiFileText className="text-3xl mx-auto" />
                </div>
                <p className="text-gray-500">No drafts found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create a job and save it as draft to see it here
                </p>
              </div>
            )}
          </div>

          {/* Job Creation Tips */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Job Creation Tips</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="p-1 bg-white rounded">
                  <FiCheckCircle className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Be Specific</p>
                  <p className="text-xs text-blue-700">Clearly define responsibilities and expectations</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-white rounded">
                  <FiCheckCircle className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Highlight Benefits</p>
                  <p className="text-xs text-blue-700">Showcase what makes your company special</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-white rounded">
                  <FiCheckCircle className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Use Keywords</p>
                  <p className="text-xs text-blue-700">Include relevant skills and technologies</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="p-1 bg-white rounded">
                  <FiCheckCircle className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Set Clear Requirements</p>
                  <p className="text-xs text-blue-700">Define must-have vs nice-to-have qualifications</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

       
      </div>

      
    </div>
  );
};

export default CreateJob;
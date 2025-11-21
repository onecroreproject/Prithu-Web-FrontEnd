// ✅ src/components/Profile/editProject.jsx
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import dayjs from "dayjs";
import {
  useProfileMutations,
} from "../../../Service/userEducationService";
import {
  useUserCurriculamProfile,
} from "../../../hook/userProfile";
import {
  PlusCircle,
  Pencil,
  Save,
  X,
  Calendar,
  Trash2,
  Link2,
  Github,
  Info,
  FolderGit2,
  Code,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 
export default function EditProject() {
  const { token } = useAuth();
  const { data: profile, isLoading, refetch } = useUserCurriculamProfile(token);
  const { addProject, updateProject, deleteProject } = useProfileMutations(token);
 
  const [projects, setProjects] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const hasUnsavedChanges = useRef(false);
 
  // ✅ Load user projects
  useEffect(() => {
    if (profile?.data?.projects) {
      setProjects(profile.data.projects);
    }
  }, [profile]);
 
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
 
  // ➕ Add New Project (max 3 limit)
  const handleAddNew = () => {
    if (projects.length >= 3) {
      toast.error("You can only add up to 3 projects.");
      return;
    }
    if (isAdding) return;
 
    setIsAdding(true);
    setEditingIndex(projects.length);
    setProjects([
      ...projects,
      {
        title: "",
        description: "",
        technologies: "",
        githubLink: "",
        liveLink: "",
        startDate: "",
        endDate: "",
        _isNew: true,
      },
    ]);
  };
 
  // ✏️ Handle Input Change
  const handleChange = (index, field, value) => {
    const updated = [...projects];
    updated[index][field] = value;
    setProjects(updated);
    hasUnsavedChanges.current = true;
  };
 
  // 💾 Save New Project
  const handleSave = (index) => {
    const newProject = projects[index];
    if (!newProject.title || !newProject.description) {
      toast.error("Project title and description are required.");
      return;
    }
 
    addProject.mutate(
      { projectData: newProject },
      {
        onSuccess: () => {
          toast.success("✅ Project added successfully!");
          refetch();
          setEditingIndex(null);
          setIsAdding(false);
          hasUnsavedChanges.current = false;
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to add project.");
        },
      }
    );
  };
 
  // 🔁 Update Existing Project
  const handleUpdate = (index) => {
    const updatedEntry = projects[index];
    const userId = profile?.data?.userId?._id;
    if (!userId || !updatedEntry._id) {
      toast.error("Missing user ID or project ID.");
      return;
    }
 
    updateProject.mutate(
      { userId, projectId: updatedEntry._id, data: updatedEntry },
      {
        onSuccess: () => {
          toast.success("✅ Project updated successfully!");
          refetch();
          setEditingIndex(null);
          hasUnsavedChanges.current = false;
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to update project.");
        },
      }
    );
  };
 
  // 🗑 Delete Project
  const handleDelete = (proj) => {
    setShowDeletePopup(true);
    setDeleteTarget(proj);
  };
 
  const confirmDelete = () => {
    if (!deleteTarget?._id) {
      setProjects(projects.filter((p) => p !== deleteTarget));
      toast.success("Removed unsaved project.");
      setShowDeletePopup(false);
      setDeleteTarget(null);
      return;
    }
 
    const userId = profile?.data?.userId?._id;
    deleteProject.mutate(
      { userId, projectId: deleteTarget._id },
      {
        onSuccess: () => {
          toast.success("🗑️ Project deleted successfully!");
          refetch();
          setShowDeletePopup(false);
          setDeleteTarget(null);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to delete project.");
          setShowDeletePopup(false);
        },
      }
    );
  };
 
  // ❌ Cancel Editing
  const handleCancel = () => {
    if (projects[editingIndex]?._isNew) {
      const updated = [...projects];
      updated.pop();
      setProjects(updated);
    }
    setEditingIndex(null);
    setIsAdding(false);
    hasUnsavedChanges.current = false;
  };
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      {/* Header Section */}
      <div className="bg-blue-50 border-b border-blue-100 rounded-t-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderGit2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Projects</h2>
              <p className="text-gray-600 text-sm mt-1">
                Showcase your work and technical projects ({projects.length}/3 max)
              </p>
            </div>
          </div>
         
          <button
            onClick={handleAddNew}
            disabled={isAdding || projects.length >= 3}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              projects.length >= 3
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Add Project
          </button>
        </div>
      </div>
 
      <div className="p-6">
        {projects.length === 0 && !isAdding ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border border-gray-200">
              <FolderGit2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Added</h3>
            <p className="text-gray-600 text-sm mb-4">Showcase your work by adding your first project</p>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mx-auto"
            >
              <PlusCircle className="w-4 h-4" />
              Add Your First Project
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((proj, index) => (
              <motion.div
                key={proj._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
              >
                {editingIndex === index ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      proj._id ? handleUpdate(index) : handleSave(index);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <Input
                        label="Project Title"
                        value={proj.title}
                        onChange={(v) => handleChange(index, "title", v)}
                        icon={FolderGit2}
                      />
                      <Input
                        label="Technologies Used"
                        value={proj.technologies}
                        onChange={(v) => handleChange(index, "technologies", v)}
                        icon={Code}
                      />
                      <Input
                        label="GitHub Link"
                        value={proj.githubLink}
                        onChange={(v) => handleChange(index, "githubLink", v)}
                        icon={Github}
                      />
                      <Input
                        label="Live Demo Link"
                        value={proj.liveLink}
                        onChange={(v) => handleChange(index, "liveLink", v)}
                        icon={ExternalLink}
                      />
 
                      <DateField
                        label="Start Date"
                        value={proj.startDate}
                        onChange={(v) => handleChange(index, "startDate", v)}
                      />
                      <DateField
                        label="End Date"
                        value={proj.endDate}
                        onChange={(v) => handleChange(index, "endDate", v)}
                      />
                    </div>
 
                    <TextArea
                      label="Project Description"
                      value={proj.description}
                      onChange={(v) => handleChange(index, "description", v)}
                    />
 
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FolderGit2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {proj.title || "Untitled Project"}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {proj.startDate
                                ? dayjs(proj.startDate).format("MMM YYYY")
                                : "N/A"}
                              {" - "}
                              {proj.endDate
                                ? dayjs(proj.endDate).format("MMM YYYY")
                                : "Present"}
                            </span>
                          </div>
                        </div>
                      </div>
 
                      {proj.technologies && (
                        <div className="flex items-center gap-2">
                          <Code className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            <strong>Technologies:</strong> {proj.technologies}
                          </span>
                        </div>
                      )}
 
                      {proj.description && (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {proj.description}
                        </p>
                      )}
 
                      <div className="flex gap-4">
                        {proj.githubLink && (
                          <a
                            href={proj.githubLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <Github className="w-4 h-4" />
                            GitHub Repository
                          </a>
                        )}
                        {proj.liveLink && (
                          <a
                            href={proj.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    </div>
 
                    <div className="flex gap-2 sm:flex-col sm:gap-1">
                      <button
                        onClick={() => {
                          setEditingIndex(index);
                          hasUnsavedChanges.current = false;
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(proj)}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
 
      {/* ⚠️ Delete Popup */}
      <AnimatePresence>
        {showDeletePopup && (
          <Popup
            title="Delete Project"
            message="Are you sure you want to delete this project? This action cannot be undone."
            confirmLabel="Delete Project"
            cancelLabel="Cancel"
            onConfirm={confirmDelete}
            onCancel={() => setShowDeletePopup(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
 
/* ✅ Popup Component */
function Popup({ title, message, confirmLabel, cancelLabel, onConfirm, onCancel }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full"
      >
        <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-600 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
 
  
/* ✅ Reusable Inputs */
function Input({ label, value, onChange, icon: Icon }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
            Icon ? "pl-10" : ""
          } hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
        />
      </div>
    </div>
  );
}
 
function TextArea({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}
 
/* ✅ Normalized Date Field */
function DateField({ label, value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(
    value ? dayjs(value).toDate() : null
  );
 
  useEffect(() => {
    if (selectedDate) {
      const formatted = dayjs(selectedDate).format("YYYY-MM-DD");
      onChange(formatted);
    } else {
      onChange("");
    }
  }, [selectedDate]);
 
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date"
          className="w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}
 
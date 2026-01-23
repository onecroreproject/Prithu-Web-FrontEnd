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
    <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> Projects
        </h3>
        <button
          onClick={handleAddNew}
          disabled={isAdding || projects.length >= 3}
          className={`flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 w-full sm:w-auto text-xs sm:text-sm ${
            projects.length >= 3 ? "cursor-not-allowed" : ""
          }`}
        >
          <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          Add Project
        </button>
      </div>

      <div className="space-y-3">
        {projects.map((proj, index) => (
          <motion.div
            key={proj._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-gray-50 rounded-lg p-3 sm:p-4"
          >
            {editingIndex === index ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  proj._id ? handleUpdate(index) : handleSave(index);
                }}
                className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2"
              >
                <Input
                  label="Project Title"
                  value={proj.title}
                  onChange={(v) => handleChange(index, "title", v)}
                />
                <Input
                  label="Technologies Used"
                  value={proj.technologies}
                  onChange={(v) => handleChange(index, "technologies", v)}
                />
                <Input
                  label="GitHub Link"
                  value={proj.githubLink}
                  onChange={(v) => handleChange(index, "githubLink", v)}
                />
                <Input
                  label="Live Demo Link"
                  value={proj.liveLink}
                  onChange={(v) => handleChange(index, "liveLink", v)}
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

                <TextArea
                  label="Project Description"
                  value={proj.description}
                  onChange={(v) => handleChange(index, "description", v)}
                />

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 col-span-1 sm:col-span-2 mt-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 border border-gray-300 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{proj.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {proj.startDate
                      ? dayjs(proj.startDate).format("MMM YYYY")
                      : "N/A"}
                    {" - "}
                    {proj.endDate
                      ? dayjs(proj.endDate).format("MMM YYYY")
                      : "Present"}
                  </p>
                  {proj.technologies && (
                    <p className="text-xs text-gray-500">
                      <strong>Technologies:</strong> {proj.technologies}
                    </p>
                  )}
                  {proj.description && (
                    <p className="text-xs text-gray-500 mt-1">{proj.description}</p>
                  )}
                  <div className="flex gap-3 mt-2">
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <Github className="w-3 h-3" />
                        GitHub
                      </a>
                    )}
                    {proj.liveLink && (
                      <a
                        href={proj.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Live Demo
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setEditingIndex(index);
                      hasUnsavedChanges.current = false;
                    }}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(proj)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
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
    </div>
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
        className="bg-white p-4 sm:p-5 rounded-lg shadow-lg text-center max-w-sm w-full"
      >
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
          <button
            onClick={onConfirm}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto text-xs sm:text-sm"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto text-xs sm:text-sm"
          >
            {cancelLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ✅ Reusable Inputs */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="col-span-1 sm:col-span-2">
      <label className="block text-xs sm:text-sm text-gray-700 mb-1">{label}</label>
      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
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
      <label className="block text-xs sm:text-sm text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg p-2">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date"
          className="w-full outline-none text-xs sm:text-sm bg-transparent"
        />
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 ml-2 flex-shrink-0" />
      </div>
    </div>
  );
}
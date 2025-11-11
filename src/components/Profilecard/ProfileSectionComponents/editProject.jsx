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

  if (isLoading) return <p>Loading projects...</p>;

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
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Projects
          <span className="text-xs text-gray-500">
            ({projects.length}/3 max)
          </span>
        </h3>
        <button
          onClick={handleAddNew}
          disabled={isAdding || projects.length >= 3}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
            (projects.length ) >= 3
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {projects.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-md mb-3">
          <Info className="w-4 h-4 text-purple-500" />
          No projects added yet. Add your first project!
        </div>
      )}

      {/* Project List */}
      <div className="space-y-3">
        {projects.map((proj, index) => (
          <motion.div
            key={proj._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-gray-100 pt-3"
          >
            {editingIndex === index ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  proj._id ? handleUpdate(index) : handleSave(index);
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
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

                {/* ✅ Normalized Date Fields */}
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

                <div className="flex gap-3 col-span-2 mt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">{proj.title}</p>
                  {/* ✅ Formatted Date Display */}
                  <p className="text-xs text-gray-500">
                    {proj.startDate
                      ? dayjs(proj.startDate).format("YYYY-MM-DD")
                      : "N/A"}{" "}
                    →{" "}
                    {proj.endDate
                      ? dayjs(proj.endDate).format("YYYY-MM-DD")
                      : "N/A"}
                  </p>

                  {proj.technologies && (
                    <p className="text-xs text-gray-500 mt-1">
                      <b>Tech:</b> {proj.technologies}
                    </p>
                  )}
                  {proj.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {proj.description}
                    </p>
                  )}
                  <div className="flex gap-3 mt-2">
                    {proj.githubLink && (
                      <a
                        href={proj.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 hover:underline text-xs flex items-center gap-1"
                      >
                        <Github className="w-3 h-3" /> GitHub
                      </a>
                    )}
                    {proj.liveLink && (
                      <a
                        href={proj.liveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-600 hover:underline text-xs flex items-center gap-1"
                      >
                        <Link2 className="w-3 h-3" /> Live Demo
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingIndex(index);
                      hasUnsavedChanges.current = false;
                    }}
                    className="flex items-center gap-1 text-purple-600 hover:text-purple-800 text-sm"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
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
            message="Are you sure you want to delete this project?"
            confirmLabel="Delete"
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            {cancelLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ✅ Reusable Inputs */
function Input({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2"
      />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="col-span-2">
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2"
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
      // ✅ Save only "YYYY-MM-DD" (no timezone or ISO time)
      const formatted = dayjs(selectedDate).format("YYYY-MM-DD");
      onChange(formatted);
    } else {
      onChange("");
    }
  }, [selectedDate]);

  return (
    <div className="relative">
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg p-2">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date"
          className="w-full outline-none"
        />
        <Calendar className="w-4 h-4 text-gray-500 ml-2" />
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  useUserCurriculamProfile,
  useProfileMutations,
} from "../../../hook/userProfile";
import {
  PlusCircle,
  Pencil,
  Save,
  X,
  Trash2,
  Award,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
 
export default function EditSkill() {
  const { token } = useAuth();
  const { data: profile, isLoading, refetch } = useUserCurriculamProfile(token);
  const { addSkill, updateSkill, deleteSkill } = useProfileMutations(token);
 
  const [skills, setSkills] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const hasUnsavedChanges = useRef(false);
 
  // 🟢 Load skills
  useEffect(() => {
    if (profile?.data?.skills) {
      setSkills(profile.data.skills);
    }
  }, [profile]);
 
  if (isLoading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
 
  // ➕ Add new blank skill
  const handleAddNew = () => {
    if (isAdding) return;
    setIsAdding(true);
    setEditingIndex(skills.length);
    setSkills([...skills, { ...getEmptySkill(), _isNew: true }]);
  };
 
  // ✏️ Handle input change
  const handleChange = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
    hasUnsavedChanges.current = true;
  };
 
  // 💾 Save new skill
  const handleSave = (index) => {
    const newSkill = skills[index];
    if (!newSkill.name) {
      toast.error("Skill name is required.");
      return;
    }
 
    addSkill.mutate(
      { userId: profile?.data?.userId?._id, skillData: newSkill },
      {
        onSuccess: () => {
          toast.success("Skill added successfully!");
          refetch();
          setEditingIndex(null);
          setIsAdding(false);
          hasUnsavedChanges.current = false;
        },
        onError: () => toast.error("Failed to add skill."),
      }
    );
  };
 
  // 🔁 Update existing skill
  const handleUpdate = (index) => {
    const updatedEntry = skills[index];
    const userId = profile?.data?.userId?._id;
 
    updateSkill.mutate(
      {
        userId,
        skillId: updatedEntry._id,
        data: updatedEntry,
      },
      {
        onSuccess: () => {
          toast.success("Skill updated successfully!");
          refetch();
          setEditingIndex(null);
          hasUnsavedChanges.current = false;
        },
        onError: () => toast.error("Failed to update skill."),
      }
    );
  };
 
  // 🗑 Delete Skill (confirmation)
  const handleDelete = (skill) => {
    setShowDeletePopup(true);
    setDeleteTarget(skill);
  };
 
  const confirmDelete = () => {
    if (!deleteTarget?._id) {
      setSkills(skills.filter((s) => s !== deleteTarget));
      setShowDeletePopup(false);
      toast.success("Removed unsaved skill.");
      return;
    }
 
    const userId = profile?.data?.userId?._id;
    deleteSkill.mutate(
      { userId, skillId: deleteTarget._id },
      {
        onSuccess: () => {
          toast.success("Skill deleted successfully!");
          refetch();
          setShowDeletePopup(false);
          setDeleteTarget(null);
        },
        onError: () => {
          toast.error("Failed to delete skill.");
          setShowDeletePopup(false);
        },
      }
    );
  };
 
  // ❌ Cancel editing
  const handleCancel = () => {
    if (skills[editingIndex]?._isNew) {
      const updated = [...skills];
      updated.pop();
      setSkills(updated);
    }
    setEditingIndex(null);
    setIsAdding(false);
  };
 
  return (
    <div className="bg-white p-4 sm:p-5 rounded-lg border border-gray-200 shadow-sm mt-4 sm:mt-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-600" /> Skills
        </h3>
        <button
          onClick={handleAddNew}
          disabled={isAdding}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 w-full sm:w-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Add Skill
        </button>
      </div>
 
      <div className="space-y-4">
        {skills.map((skill, index) => (
          <motion.div
            key={skill._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-gray-100 pt-4"
          >
            {editingIndex === index ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  skill._id ? handleUpdate(index) : handleSave(index);
                }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              >
                <Input label="Skill Name" value={skill.name} onChange={(v) => handleChange(index, "name", v)} />
                <Input label="Category" value={skill.category} onChange={(v) => handleChange(index, "category", v)} />
                <Select
                  label="Level"
                  value={skill.level}
                  onChange={(v) => handleChange(index, "level", v)}
                  options={["Beginner", "Intermediate", "Advanced", "Expert"]}
                />
                <Input
                  label="Years of Experience"
                  type="number"
                  value={skill.yearsOfExperience}
                  onChange={(v) => handleChange(index, "yearsOfExperience", v)}
                />
                <Input
                  label="Last Used (Year)"
                  type="number"
                  value={skill.lastUsed}
                  onChange={(v) => handleChange(index, "lastUsed", v)}
                />
                <TextArea
                  label="Description"
                  value={skill.description}
                  onChange={(v) => handleChange(index, "description", v)}
                />
 
                <div className="flex flex-col sm:flex-row gap-3 col-span-1 sm:col-span-2 mt-2">
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4" /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm sm:text-base">{skill.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {skill.category} • {skill.level}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Calendar className="w-3 h-3" />
                    {skill.yearsOfExperience
                      ? `${skill.yearsOfExperience} yrs`
                      : "N/A"}{" "}
                    | Last Used: {skill.lastUsed || "N/A"}
                  </p>
                  {skill.description && (
                    <p className="text-xs text-gray-500 mt-2">{skill.description}</p>
                  )}
                </div>
 
                <div className="flex gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => setEditingIndex(index)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm p-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(skill)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
 
      <AnimatePresence>
        {showDeletePopup && (
          <Popup
            title="Delete Confirmation"
            message="Are you sure you want to delete this skill?"
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className="bg-white p-5 sm:p-6 rounded-lg shadow-lg text-center max-w-sm w-full"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onConfirm}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
          >
            {cancelLabel}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
 
/* ✅ Default skill structure */
function getEmptySkill() {
  return {
    category: "Frontend",
    name: "",
    level: "Intermediate",
    yearsOfExperience: "",
    lastUsed: "",
    description: "",
  };
}
 
/* ✅ Reusable Inputs */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
 
function TextArea({ label, value, onChange }) {
  return (
    <div className="col-span-1 sm:col-span-2">
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <textarea
        rows={3}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
 
function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
 
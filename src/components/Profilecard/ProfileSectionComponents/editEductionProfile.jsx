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
  Calendar,
  Trash2,
  GraduationCap,
  BookOpen,
  MapPin,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
 
export default function EditEducation() {
  const { token } = useAuth();
  const { data: profile, isLoading, refetch } = useUserCurriculamProfile(token);
  const { addEducation, updateEducation, deleteEducation } = useProfileMutations(token);
 
  const [educations, setEducations] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const hasUnsavedChanges = useRef(false);
 
  // 🟢 Load education safely
  useEffect(() => {
    if (profile?.data?.education) {
      setEducations(profile.data.education);
    }
  }, [profile]);
 
  // 🟡 Detect unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
 
  if (isLoading) return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
 
  // ➕ Add new blank form
  const handleAddNew = () => {
    if (isAdding) return;
    setIsAdding(true);
    setEditingIndex(educations.length);
    setEducations([
      ...educations,
      {
        level: "",
        schoolOrCollege: "",
        boardOrUniversity: "",
        fieldOfStudy: "",
        startYear: "",
        endYear: "",
        gradeOrPercentage: "",
        location: "",
        description: "",
        _isNew: true,
      },
    ]);
  };
 
  // ✏️ Handle input changes
  const handleChange = (index, field, value) => {
    const updated = [...educations];
    updated[index][field] = value;
    setEducations(updated);
    hasUnsavedChanges.current = true;
  };
 
  // 💾 Add new education
  const handleSave = (index) => {
    const newEntry = educations[index];
 
    if (!newEntry.schoolOrCollege || !newEntry.level) {
      toast.error("Level and School/College are required.");
      return;
    }
 
    addEducation.mutate(
      { educationData: newEntry },
      {
        onSuccess: (res) => {
          toast.success("Education added successfully!");
          refetch();
          setEditingIndex(null);
          setIsAdding(false);
          hasUnsavedChanges.current = false;
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to add education.");
        },
      }
    );
  };
 
  // 🔁 Update education entry
  const handleUpdate = (index) => {
    const updatedEntry = educations[index];
    const userId = profile?.data?.userId?._id;
 
    if (!userId || !updatedEntry._id) {
      toast.error("Missing user ID or education ID.");
      return;
    }
 
    updateEducation.mutate(
      {
        userId,
        educationId: updatedEntry._id,
        data: updatedEntry,
      },
      {
        onSuccess: (res) => {
          toast.success("Education updated successfully!");
          refetch();
          setEditingIndex(null);
          hasUnsavedChanges.current = false;
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to update education.");
        },
      }
    );
  };
 
  // 🗑 Delete Education (with confirmation)
  const handleDelete = (edu) => {
    setShowDeletePopup(true);
    setDeleteTarget(edu);
  };
 
  const confirmDelete = () => {
    if (!deleteTarget?._id) {
      setEducations(educations.filter((e) => e !== deleteTarget));
      toast.success("Removed unsaved entry.");
      setShowDeletePopup(false);
      setDeleteTarget(null);
      return;
    }
 
    const userId = profile?.data?.userId?._id;
    deleteEducation.mutate(
      { userId, educationId: deleteTarget._id },
      {
        onSuccess: () => {
          toast.success("Education deleted successfully!");
          refetch();
          setShowDeletePopup(false);
          setDeleteTarget(null);
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Failed to delete education.");
          setShowDeletePopup(false);
        },
      }
    );
  };
 
  // ❌ Cancel editing
  const handleCancel = () => {
    if (educations[editingIndex]?._isNew) {
      const updated = [...educations];
      updated.pop();
      setEducations(updated);
    }
    if (hasUnsavedChanges.current) {
      setShowLeavePopup(true);
    } else {
      setEditingIndex(null);
      setIsAdding(false);
    }
  };
 
  const confirmLeave = () => {
    setShowLeavePopup(false);
    setEditingIndex(null);
    setIsAdding(false);
    hasUnsavedChanges.current = false;
  };
 
  return (
    <div className="bg-white p-3 sm:p-4 rounded-lg w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Education</h3>
        <button
          onClick={handleAddNew}
          disabled={isAdding}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 w-full sm:w-auto text-xs sm:text-sm"
        >
          <PlusCircle className="w-3 h-3 sm:w-4 sm:h-4" />
          Add Education
        </button>
      </div>
 
      <div className="space-y-3">
        {educations.map((edu, index) => (
          <motion.div
            key={edu._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-gray-50 rounded-lg p-3 sm:p-4"
          >
            {editingIndex === index ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  edu._id ? handleUpdate(index) : handleSave(index);
                }}
                className="grid grid-cols-1 gap-2 sm:gap-3 sm:grid-cols-2"
              >
                <SelectField
                  label="Education Level"
                  value={edu.level}
                  onChange={(v) => handleChange(index, "level", v)}
                  icon={GraduationCap}
                />
                <Input
                  label="School/College"
                  value={edu.schoolOrCollege}
                  onChange={(v) => handleChange(index, "schoolOrCollege", v)}
                  icon={BookOpen}
                />
                <Input
                  label="Board/University"
                  value={edu.boardOrUniversity}
                  onChange={(v) => handleChange(index, "boardOrUniversity", v)}
                  icon={BookOpen}
                />
                <Input
                  label="Field of Study"
                  value={edu.fieldOfStudy}
                  onChange={(v) => handleChange(index, "fieldOfStudy", v)}
                  icon={BookOpen}
                />
 
                <YearPicker
                  label="Start Year"
                  value={edu.startYear}
                  onChange={(v) => handleChange(index, "startYear", v)}
                />
                <YearPicker
                  label="End Year"
                  value={edu.endYear}
                  onChange={(v) => handleChange(index, "endYear", v)}
                />
 
                <Input
                  label="Grade / Percentage"
                  value={edu.gradeOrPercentage}
                  onChange={(v) => handleChange(index, "gradeOrPercentage", v)}
                  icon={Award}
                />
                <Input
                  label="Location"
                  value={edu.location}
                  onChange={(v) => handleChange(index, "location", v)}
                  icon={MapPin}
                />
                <TextArea
                  label="Description"
                  value={edu.description}
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
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                      <GraduationCap className="w-3 h-3 text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{edu.schoolOrCollege}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {edu.level} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-500">
                    {edu.boardOrUniversity && (
                      <p className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {edu.boardOrUniversity}
                      </p>
                    )}
                    {(edu.startYear || edu.endYear) && (
                      <p className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {edu.startYear || "N/A"} - {edu.endYear || "N/A"}
                      </p>
                    )}
                    {edu.gradeOrPercentage && (
                      <p className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        Grade: {edu.gradeOrPercentage}
                      </p>
                    )}
                    {edu.location && (
                      <p className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {edu.location}
                      </p>
                    )}
                  </div>
                  {edu.description && (
                    <p className="text-xs text-gray-500 mt-1">{edu.description}</p>
                  )}
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
                    onClick={() => handleDelete(edu)}
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
 
      {/* ⚠️ Popups */}
      <AnimatePresence>
        {showLeavePopup && (
          <Popup
            title="Unsaved Changes"
            message="You have unsaved changes. Do you want to save before leaving?"
            confirmLabel="Leave Without Saving"
            cancelLabel="Stay Here"
            onConfirm={confirmLeave}
            onCancel={() => setShowLeavePopup(false)}
          />
        )}
 
        {showDeletePopup && (
          <Popup
            title="Delete Education"
            message="Are you sure you want to delete this education record? This action cannot be undone."
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
 
/* ✅ Year Picker */
function YearPicker({ label, value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value, 0) : null);
  useEffect(() => {
    if (selectedDate) onChange(selectedDate.getFullYear());
  }, [selectedDate]);
 
  return (
    <div className="relative">
      <label className="block text-xs sm:text-sm text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg p-2">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showYearPicker
          dateFormat="yyyy"
          placeholderText="Select Year"
          className="w-full outline-none text-xs sm:text-sm bg-transparent"
        />
        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 ml-2 flex-shrink-0" />
      </div>
    </div>
  );
}
 
/* ✅ Reusable Inputs */
function Input({ label, value, onChange, type = "text", icon: Icon }) {
  return (
    <div>
      <label className="block text-xs sm:text-sm text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Icon className="w-3 h-3 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
            Icon ? "pl-8" : ""
          }`}
        />
      </div>
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
 
function SelectField({ label, value, onChange, icon: Icon }) {
  const options = [
    "Secondary School",
    "Higher Secondary",
    "Undergraduate",
    "Postgraduate",
    "Diploma",
    "Certification",
    "PhD",
  ];
  return (
    <div>
      <label className="block text-xs sm:text-sm text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Icon className="w-3 h-3 text-gray-400" />
          </div>
        )}
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
            Icon ? "pl-8" : ""
          }`}
        >
          <option value="">Select Level</option>
          {options.map((opt) => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
 
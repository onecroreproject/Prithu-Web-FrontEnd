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
 
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
 
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
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Education</h2>
              <p className="text-gray-600 text-sm mt-1">
                Manage your educational background and qualifications
              </p>
            </div>
          </div>
         
          <button
            onClick={handleAddNew}
            disabled={isAdding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <PlusCircle className="w-4 h-4" />
            Add Education
          </button>
        </div>
      </div>
 
      <div className="p-6">
        <div className="space-y-6">
          {educations.length === 0 && !isAdding ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border border-gray-200">
                <GraduationCap className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Education Added</h3>
              <p className="text-gray-600 text-sm mb-4">Add your educational qualifications to get started</p>
              <button
                onClick={handleAddNew}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mx-auto"
              >
                <PlusCircle className="w-4 h-4" />
                Add Your First Education
              </button>
            </div>
          ) : (
            educations.map((edu, index) => (
              <motion.div
                key={edu._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
              >
                {editingIndex === index ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      edu._id ? handleUpdate(index) : handleSave(index);
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    </div>
 
                    <TextArea
                      label="Description"
                      value={edu.description}
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
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {edu.schoolOrCollege || "Untitled Education"}
                          </h3>
                          <p className="text-blue-600 font-medium">
                            {edu.level} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}
                          </p>
                        </div>
                      </div>
                     
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                        {edu.boardOrUniversity && (
                          <p className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            {edu.boardOrUniversity}
                          </p>
                        )}
                        {(edu.startYear || edu.endYear) && (
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {edu.startYear || "N/A"} - {edu.endYear || "N/A"}
                          </p>
                        )}
                        {edu.gradeOrPercentage && (
                          <p className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            Grade: {edu.gradeOrPercentage}
                          </p>
                        )}
                        {edu.location && (
                          <p className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {edu.location}
                          </p>
                        )}
                      </div>
                     
                      {edu.description && (
                        <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                      )}
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
                        onClick={() => handleDelete(edu)}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="sm:hidden">Delete</span>
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
 
      {/* ⚠️ Popups */}
      <AnimatePresence>
        {showLeavePopup && (
          <Popup
            title="Unsaved Changes"
            message="You have unsaved changes. Do you want to leave without saving?"
            confirmLabel="Leave Without Saving"
            cancelLabel="Continue Editing"
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
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
 
/* ✅ Year Picker */
function YearPicker({ label, value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value, 0) : null);
 
  useEffect(() => {
    if (selectedDate) onChange(selectedDate.getFullYear());
  }, [selectedDate]);
 
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showYearPicker
          dateFormat="yyyy"
          placeholderText="Select Year"
          className="w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
      </div>
    </div>
  );
}
 
/* ✅ Reusable Inputs */
function Input({ label, value, onChange, type = "text", icon: Icon }) {
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
          type={type}
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
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
            Icon ? "pl-10" : ""
          } hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`}
        >
          <option value="">Select Level</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
 
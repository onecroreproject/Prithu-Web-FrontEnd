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

  if (isLoading) return <p>Loading education...</p>;

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
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Education</h3>
        <button
          onClick={handleAddNew}
          disabled={isAdding}
          className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
        >
          <PlusCircle className="w-4 h-4" />
          Add More
        </button>
      </div>

      <div className="space-y-3">
        {educations.map((edu, index) => (
          <motion.div
            key={edu._id || index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="border-t border-gray-100 pt-3"
          >
            {editingIndex === index ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  edu._id ? handleUpdate(index) : handleSave(index);
                }}
                className="grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <SelectField
                  label="Level"
                  value={edu.level}
                  onChange={(v) => handleChange(index, "level", v)}
                />
                <Input
                  label="School/College"
                  value={edu.schoolOrCollege}
                  onChange={(v) => handleChange(index, "schoolOrCollege", v)}
                />
                <Input
                  label="Board/University"
                  value={edu.boardOrUniversity}
                  onChange={(v) => handleChange(index, "boardOrUniversity", v)}
                />
                <Input
                  label="Field of Study"
                  value={edu.fieldOfStudy}
                  onChange={(v) => handleChange(index, "fieldOfStudy", v)}
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
                />
                <Input
                  label="Location"
                  value={edu.location}
                  onChange={(v) => handleChange(index, "location", v)}
                />
                <TextArea
                  label="Description"
                  value={edu.description}
                  onChange={(v) => handleChange(index, "description", v)}
                />

                <div className="flex gap-3 col-span-2 mt-2">
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    <Save className="w-4 h-4" /> Save Changes
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
                  <p className="font-medium text-gray-800">{edu.schoolOrCollege}</p>
                  <p className="text-sm text-gray-600">
                    {edu.level} - {edu.fieldOfStudy}
                  </p>
                  <p className="text-xs text-gray-500">
                    {edu.startYear || "N/A"} - {edu.endYear || "N/A"} |{" "}
                    {edu.boardOrUniversity || "N/A"}
                  </p>
                  {edu.gradeOrPercentage && (
                    <p className="text-xs text-gray-500">
                      Grade: {edu.gradeOrPercentage}
                    </p>
                  )}
                  {edu.description && (
                    <p className="text-xs text-gray-500 mt-1">{edu.description}</p>
                  )}
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
                    onClick={() => handleDelete(edu)}
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
            title="Delete Confirmation"
            message="Are you sure you want to delete this education record?"
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

/* ✅ Year Picker */
function YearPicker({ label, value, onChange }) {
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value, 0) : null);
  useEffect(() => {
    if (selectedDate) onChange(selectedDate.getFullYear());
  }, [selectedDate]);

  return (
    <div className="relative">
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <div className="flex items-center border border-gray-300 rounded-lg p-2">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showYearPicker
          dateFormat="yyyy"
          placeholderText="Select Year"
          className="w-full outline-none"
        />
        <Calendar className="w-4 h-4 text-gray-500 ml-2" />
      </div>
    </div>
  );
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
        rows={2}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2"
      />
    </div>
  );
}

function SelectField({ label, value, onChange }) {
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
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-lg p-2"
      >
        <option value="">Select Level</option>
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

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
  Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function EditExperience() {
  const { token } = useAuth();
  const { data: profile, isLoading, refetch } = useUserCurriculamProfile(token);
  const { addExperience, updateExperience, deleteExperience } = useProfileMutations(token);

  const [experiences, setExperiences] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const hasUnsavedChanges = useRef(false);

  // 🟢 Load user experiences
  useEffect(() => {
    if (profile?.data?.experience) {
      setExperiences(profile.data.experience);
    }
  }, [profile]);

  if (isLoading) return <p className="text-gray-500">Loading experiences...</p>;

  // ➕ Add new experience
  const handleAddNew = () => {
    if (isAdding) return;
    setIsAdding(true);
    setEditingIndex(experiences.length);
    setExperiences([...experiences, { ...getEmptyExperience(), _isNew: true }]);
  };

  // ✏️ Handle field changes
  const handleChange = (index, field, value) => {
    const updated = [...experiences];
    updated[index][field] = value;
    setExperiences(updated);
    hasUnsavedChanges.current = true;
  };

  // 💾 Save new experience
  const handleSave = (index) => {
    const newExp = experiences[index];
    if (!newExp.jobTitle || !newExp.companyName || !newExp.startDate) {
      toast.error("Job Title, Company, and Start Date are required.");
      return;
    }

    addExperience.mutate(
      { experienceData: newExp },
      {
        onSuccess: () => {
          toast.success("Experience added successfully!");
          refetch();
          setEditingIndex(null);
          setIsAdding(false);
          hasUnsavedChanges.current = false;
        },
        onError: () => toast.error("Failed to add experience."),
      }
    );
  };

  // 🔁 Update existing experience
  const handleUpdate = (index) => {
    const updatedEntry = experiences[index];
    const userId = profile?.data?.userId?._id;

    updateExperience.mutate(
      {
        userId,
        experienceId: updatedEntry._id,
        data: updatedEntry,
      },
      {
        onSuccess: () => {
          toast.success("Experience updated successfully!");
          refetch();
          setEditingIndex(null);
          hasUnsavedChanges.current = false;
        },
        onError: () => toast.error("Failed to update experience."),
      }
    );
  };

  // 🗑 Delete Experience
  const handleDelete = (exp) => {
    setShowDeletePopup(true);
    setDeleteTarget(exp);
  };

  const confirmDelete = () => {
    if (!deleteTarget?._id) {
      setExperiences(experiences.filter((e) => e !== deleteTarget));
      setShowDeletePopup(false);
      toast.success("Removed unsaved experience.");
      return;
    }

    const userId = profile?.data?.userId?._id;
    deleteExperience.mutate(
      { userId, experienceId: deleteTarget._id },
      {
        onSuccess: () => {
          toast.success("Experience deleted successfully!");
          refetch();
          setShowDeletePopup(false);
          setDeleteTarget(null);
        },
        onError: () => {
          toast.error("Failed to delete experience.");
          setShowDeletePopup(false);
        },
      }
    );
  };

  const handleCancel = () => {
    if (experiences[editingIndex]?._isNew) {
      const updated = [...experiences];
      updated.pop();
      setExperiences(updated);
    }
    setEditingIndex(null);
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-purple-600" /> Work Experience
        </h3>
        <button
          onClick={handleAddNew}
          disabled={isAdding}
          className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
        >
          <PlusCircle className="w-4 h-4" />
          Add Experience
        </button>
      </div>

      {experiences.map((exp, index) => (
        <motion.div
          key={exp._id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border-t border-gray-100 pt-3"
        >
          {editingIndex === index ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                exp._id ? handleUpdate(index) : handleSave(index);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <Input label="Job Title" value={exp.jobTitle} onChange={(v) => handleChange(index, "jobTitle", v)} />
              <Input label="Company Name" value={exp.companyName} onChange={(v) => handleChange(index, "companyName", v)} />
              <Select label="Employment Type" value={exp.employmentType} onChange={(v) => handleChange(index, "employmentType", v)} options={["Full-time", "Part-time", "Internship", "Freelance", "Contract", "Self-employed"]} />
              <Input label="Industry" value={exp.industry} onChange={(v) => handleChange(index, "industry", v)} />
              <Input label="Location" value={exp.location} onChange={(v) => handleChange(index, "location", v)} />
              <Select label="Location Type" value={exp.locationType} onChange={(v) => handleChange(index, "locationType", v)} options={["On-site", "Remote", "Hybrid"]} />
              <Input label="Start Date" type="date" value={exp.startDate} onChange={(v) => handleChange(index, "startDate", v)} />
              <Input label="End Date" type="date" value={exp.endDate} onChange={(v) => handleChange(index, "endDate", v)} disabled={exp.currentlyWorking} />
              <Checkbox label="Currently Working Here" checked={exp.currentlyWorking} onChange={(v) => handleChange(index, "currentlyWorking", v)} />
              <TextArea label="Description" value={exp.description} onChange={(v) => handleChange(index, "description", v)} />

              <Input label="Responsibilities (comma separated)" value={exp.responsibilities.join(", ")} onChange={(v) => handleChange(index, "responsibilities", v.split(","))} />
              <Input label="Technologies Used (comma separated)" value={exp.technologiesUsed.join(", ")} onChange={(v) => handleChange(index, "technologiesUsed", v.split(","))} />
              <Input label="Achievements (comma separated)" value={exp.achievements.join(", ")} onChange={(v) => handleChange(index, "achievements", v.split(","))} />

              {/* Reference Contact */}
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Reference Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input label="Name" value={exp.referenceContact.name} onChange={(v) => handleChange(index, "referenceContact", { ...exp.referenceContact, name: v })} />
                  <Input label="Designation" value={exp.referenceContact.designation} onChange={(v) => handleChange(index, "referenceContact", { ...exp.referenceContact, designation: v })} />
                  <Input label="Email" type="email" value={exp.referenceContact.email} onChange={(v) => handleChange(index, "referenceContact", { ...exp.referenceContact, email: v })} />
                  <Input label="Phone" type="tel" value={exp.referenceContact.phone} onChange={(v) => handleChange(index, "referenceContact", { ...exp.referenceContact, phone: v })} />
                </div>
              </div>

              <div className="flex gap-3 col-span-2 mt-3">
                <button type="submit" className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
                  <Save className="w-4 h-4" /> Save
                </button>
                <button type="button" onClick={handleCancel} className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-100">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-800">{exp.jobTitle}</p>
                <p className="text-sm text-gray-600">{exp.companyName} • {exp.employmentType}</p>
                <p className="text-xs text-gray-500">{exp.industry ? `${exp.industry} • ` : ""}{exp.location} ({exp.locationType})</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(exp.startDate).toLocaleDateString()} - {exp.currentlyWorking ? "Present" : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : "N/A"}
                </p>
                {exp.description && <p className="text-xs text-gray-500 mt-1">{exp.description}</p>}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setEditingIndex(index)} className="text-purple-600 hover:text-purple-800 text-sm">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(exp)} className="text-red-500 hover:text-red-700 text-sm">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ))}

      <AnimatePresence>
        {showDeletePopup && (
          <Popup
            title="Delete Confirmation"
            message="Are you sure you want to delete this experience record?"
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} transition={{ duration: 0.2 }} className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onConfirm} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{confirmLabel}</button>
          <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">{cancelLabel}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ✅ Helper for default form */
function getEmptyExperience() {
  return {
    jobTitle: "",
    companyName: "",
    employmentType: "Full-time",
    industry: "",
    location: "",
    locationType: "On-site",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
    responsibilities: [],
    technologiesUsed: [],
    achievements: [],
    referenceContact: { name: "", designation: "", email: "", phone: "" },
  };
}

/* ✅ Reusable Inputs */
function Input({ label, value, onChange, type = "text", disabled }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`w-full border border-gray-300 rounded-lg p-2 ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`} />
    </div>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <div className="col-span-2">
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <textarea rows={3} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2" />
    </div>
  );
}

function Select({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2">
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <div className="col-span-2 flex items-center gap-2 mt-2">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-purple-600" />
      <label className="text-sm text-gray-700">{label}</label>
    </div>
  );
}

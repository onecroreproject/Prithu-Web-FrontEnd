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
  Link,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function EditCertification() {
  const { token } = useAuth();
  const { data: profile, isLoading, refetch } = useUserCurriculamProfile(token);
  const { addCertification, updateCertification, deleteCertification } =
    useProfileMutations(token);

  const [certifications, setCertifications] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const hasUnsavedChanges = useRef(false);

  // 🟢 Load certifications
  useEffect(() => {
    if (profile?.data?.certifications) {
      setCertifications(profile.data.certifications);
    }
  }, [profile]);

  if (isLoading) return <p className="text-gray-500">Loading certifications...</p>;

  // ➕ Add new certification
  const handleAddNew = () => {
    if (isAdding) return;
    setIsAdding(true);
    setEditingIndex(certifications.length);
    setCertifications([...certifications, { ...getEmptyCertification(), _isNew: true }]);
  };

  // ✏️ Handle field change
  const handleChange = (index, field, value) => {
    const updated = [...certifications];
    updated[index][field] = value;
    setCertifications(updated);
    hasUnsavedChanges.current = true;
  };

  // 💾 Save new certification
  const handleSave = (index) => {
    const newCert = certifications[index];
    if (!newCert.title || !newCert.issuingOrganization) {
      toast.error("Title and Issuing Organization are required.");
      return;
    }

    addCertification.mutate(
      { userId: profile?.data?.userId?._id, certificationData: newCert },
      {
        onSuccess: () => {
          toast.success("Certification added successfully!");
          refetch();
          setEditingIndex(null);
          setIsAdding(false);
          hasUnsavedChanges.current = false;
        },
        onError: () => toast.error("Failed to add certification."),
      }
    );
  };

  // 🔁 Update certification
  const handleUpdate = (index) => {
    const updatedCert = certifications[index];
    const userId = profile?.data?.userId?._id;

    updateCertification.mutate(
      { userId, certificationId: updatedCert._id, data: updatedCert },
      {
        onSuccess: () => {
          toast.success("Certification updated successfully!");
          refetch();
          setEditingIndex(null);
          hasUnsavedChanges.current = false;
        },
        onError: () => toast.error("Failed to update certification."),
      }
    );
  };

  // 🗑 Delete certification
  const handleDelete = (cert) => {
    setShowDeletePopup(true);
    setDeleteTarget(cert);
  };

  const confirmDelete = () => {
    if (!deleteTarget?._id) {
      setCertifications(certifications.filter((c) => c !== deleteTarget));
      setShowDeletePopup(false);
      toast.success("Removed unsaved certification.");
      return;
    }

    const userId = profile?.data?.userId?._id;
    deleteCertification.mutate(
      { userId, certificationId: deleteTarget._id },
      {
        onSuccess: () => {
          toast.success("Certification deleted successfully!");
          refetch();
          setShowDeletePopup(false);
          setDeleteTarget(null);
        },
        onError: () => {
          toast.error("Failed to delete certification.");
          setShowDeletePopup(false);
        },
      }
    );
  };

  // ❌ Cancel editing
  const handleCancel = () => {
    if (certifications[editingIndex]?._isNew) {
      const updated = [...certifications];
      updated.pop();
      setCertifications(updated);
    }
    setEditingIndex(null);
    setIsAdding(false);
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" /> Certifications
        </h3>
        <button
          onClick={handleAddNew}
          disabled={isAdding}
          className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400"
        >
          <PlusCircle className="w-4 h-4" />
          Add Certification
        </button>
      </div>

      {certifications.map((cert, index) => (
        <motion.div
          key={cert._id || index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="border-t border-gray-100 pt-3"
        >
          {editingIndex === index ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                cert._id ? handleUpdate(index) : handleSave(index);
              }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3"
            >
              <Input
                label="Title"
                value={cert.title}
                onChange={(v) => handleChange(index, "title", v)}
              />
              <Input
                label="Issuing Organization"
                value={cert.issuingOrganization}
                onChange={(v) => handleChange(index, "issuingOrganization", v)}
              />
              <Input
                label="Issue Date"
                type="date"
                value={cert.issueDate}
                onChange={(v) => handleChange(index, "issueDate", v)}
              />
              <Input
                label="Expiration Date"
                type="date"
                value={cert.expirationDate}
                onChange={(v) => handleChange(index, "expirationDate", v)}
              />
              <Input
                label="Credential ID"
                value={cert.credentialId}
                onChange={(v) => handleChange(index, "credentialId", v)}
              />
              <Input
                label="Credential URL"
                value={cert.credentialURL}
                onChange={(v) => handleChange(index, "credentialURL", v)}
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
                <p className="font-medium text-gray-800">{cert.title}</p>
                <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Issued:{" "}
                  {cert.issueDate
                    ? new Date(cert.issueDate).toLocaleDateString()
                    : "N/A"}
                  {cert.expirationDate && (
                    <>
                      {" "} | Expires:{" "}
                      {new Date(cert.expirationDate).toLocaleDateString()}
                    </>
                  )}
                </p>
                {cert.credentialId && (
                  <p className="text-xs text-gray-500">
                    Credential ID: {cert.credentialId}
                  </p>
                )}
                {cert.credentialURL && (
                  <a
                    href={cert.credentialURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 text-xs hover:underline mt-1"
                  >
                    <Link className="w-3 h-3" /> View Credential
                  </a>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setEditingIndex(index)}
                  className="text-purple-600 hover:text-purple-800 text-sm"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cert)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
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
            message="Are you sure you want to delete this certification?"
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

/* ✅ Default Empty Certification */
function getEmptyCertification() {
  return {
    title: "",
    issuingOrganization: "",
    issueDate: "",
    expirationDate: "",
    credentialId: "",
    credentialURL: "",
  };
}

/* ✅ Reusable Input */
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

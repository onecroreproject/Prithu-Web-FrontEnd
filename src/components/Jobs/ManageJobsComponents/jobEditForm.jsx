// src/components/jobs/manage/JobEditForm.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../../api/axios";
import jobData from "../../../JsonFile/jobSelection.json";

export default function JobEditForm({ editJob, setEditJob, onCancel, refreshJobs }) {
  const [saving, setSaving] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  // ✅ Load available roles if job already has a category
  useEffect(() => {
    if (editJob.category) {
      const categoryObj = jobData.find((c) => c.category === editJob.category);
      setAvailableRoles(categoryObj ? categoryObj.jobrole.map((r) => r.join(" ")) : []);
    }
  }, [editJob.category]);

  const handleSave = async (e, status) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(editJob).forEach(([k, v]) => data.append(k, v));
      data.set("status", status);

      await api.post("/job/user/job/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success(status === "publish" ? "Job published!" : "Draft saved!");
      onCancel();
      refreshJobs();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => handleSave(e, "draft")}
      className="bg-white p-6 rounded-xl shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Edit Job – {editJob.title}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Title */}
      <input
        type="text"
        value={editJob.title}
        onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
        placeholder="Job Title"
        className="w-full border px-4 py-2 rounded-lg"
        required
      />

      {/* Description */}
      <textarea
        rows="4"
        value={editJob.description}
        onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}
        placeholder="Description"
        className="w-full border px-4 py-2 rounded-lg"
        required
      />

      {/* Category & Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <select
          value={editJob.category}
          onChange={(e) => {
            const val = e.target.value;
            const cat = jobData.find((c) => c.category === val);
            setAvailableRoles(cat ? cat.jobrole.map((r) => r.join(" ")) : []);
            setEditJob({ ...editJob, category: val, jobRole: "" });
          }}
          className="border px-4 py-2 rounded-lg"
          required
        >
          <option value="">Select Category</option>
          {jobData.map((c, i) => (
            <option key={i} value={c.category}>
              {c.category}
            </option>
          ))}
        </select>

        <select
          value={editJob.jobRole}
          onChange={(e) => setEditJob({ ...editJob, jobRole: e.target.value })}
          className="border px-4 py-2 rounded-lg"
          required
          disabled={!availableRoles.length}
        >
          <option value="">Select Role</option>
          {availableRoles.map((r, i) => (
            <option key={i}>{r}</option>
          ))}
        </select>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Experience (in years) *
        </label>
        <input
          type="number"
          name="experience"
          value={editJob.experience || ""}
          onChange={(e) =>
            setEditJob({ ...editJob, experience: e.target.value })
          }
          placeholder="e.g. 2, 3.5"
          className="w-full border px-4 py-2 rounded-lg"
          required
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={(e) => handleSave(e, "draft")}
          disabled={saving}
          className="px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg flex items-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button
          onClick={(e) => handleSave(e, "publish")}
          disabled={saving}
          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Publish
        </button>
      </div>
    </form>
  );
}

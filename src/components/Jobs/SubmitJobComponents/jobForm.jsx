// src/components/jobs/submit/JobForm.jsx
import React, { useState } from "react";
import jobData from "../../../JsonFile/jobSelection.json";
import JobInputField from "./jobInputField";
import JobCompanyDetails from "./companyDetails";
import { motion, AnimatePresence } from "framer-motion";

// TipTap Editor
import RichTextEditor from "../../../utils/textEditor";

export default function JobForm({ formData, setFormData }) {
  const [availableRoles, setAvailableRoles] = useState([]);
  const [openEditor, setOpenEditor] = useState(false);

  // Handle Inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "category") {
      const categoryObj = jobData.find((cat) => cat.category === value);
      setAvailableRoles(
        categoryObj ? categoryObj.jobrole.map((r) => r.join(" ")) : []
      );
      setFormData((prev) => ({ ...prev, jobRole: "" }));
    }
  };

  return (
    <div className="space-y-6">

      {/* MAIN FORM */}
      <div className="space-y-4">

        <JobInputField
          label="Job Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* Location / Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JobInputField
            label="Location *"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-1">Job Type *</label>
            <select
              required
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select Job Type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
        </div>

        {/* Category / Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Category *</label>
            <select
              required
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select Category</option>
              {jobData.map((c, i) => (
                <option key={i} value={c.category}>{c.category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Job Role *</label>
            <select
              required
              name="jobRole"
              value={formData.jobRole}
              onChange={handleChange}
              disabled={!availableRoles.length}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select Role</option>
              {availableRoles.map((r, i) => (
                <option key={i} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience */}
        <JobInputField
          label="Experience (years) *"
          name="experience"
          type="number"
          required
          value={formData.experience}
          onChange={handleChange}
        />

        {/* 🔥 Salary Range (New Field - NOT mandatory) */}
        <JobInputField
          label="Salary Range"
          name="salaryRange"
          placeholder=" ₹15,000 – ₹25,000 / Based on experience"
          value={formData.salaryRange}
          onChange={handleChange}
        />

        {/* Tags */}
        <JobInputField
          label="Tags (comma separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="React, Node, MongoDB"
        />

        {/* Interview Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JobInputField
            label="Interview Start Date *"
            name="startDate"
            type="date"
            required
            value={formData.startDate}
            onChange={handleChange}
          />

          <JobInputField
            label="Interview End Date *"
            name="endDate"
            type="date"
            required
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        {/* DESCRIPTION PREVIEW */}
        <div>
          <label className="block text-sm mb-1">Description *</label>

          <div
            className="w-full px-4 py-3 min-h-[120px] border rounded-lg bg-gray-50 cursor-pointer"
            onClick={() => setOpenEditor(true)}
            dangerouslySetInnerHTML={{
              __html:
                formData.description ||
                "<span class='text-gray-400'>Click to write description...</span>",
            }}
          />
        </div>

      </div>

      {/* Company Details */}
      <JobCompanyDetails formData={formData} setFormData={setFormData} />

      {/* DESCRIPTION POPUP */}
   {/* DESCRIPTION POPUP */}
<AnimatePresence>
  {openEditor && (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* MODAL CARD */}
      <motion.div
        className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl p-0 overflow-hidden"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.22 }}
      >
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
          <h2 className="text-base font-medium">Edit Description</h2>

          <button
            onClick={() => setOpenEditor(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* EDITOR (no borders, full clean) */}
        <div className="p-4">
          <RichTextEditor
            value={formData.description}
            onChange={(html) =>
              setFormData((prev) => ({ ...prev, description: html }))
            }
          />
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 px-4 py-3 bg-gray-50">
          <button
            onClick={() => setOpenEditor(false)}
            className="px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => setOpenEditor(false)}
            className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>


    </div>
  );
}

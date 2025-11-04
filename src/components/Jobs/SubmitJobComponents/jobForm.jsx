// src/components/jobs/submit/JobForm.jsx
import React, { useState } from "react";
import jobData from "../../../JsonFile/jobSelection.json";
import JobInputField from "./jobInputField";
import JobCompanyDetails from "./companyDetails";

export default function JobForm({ formData, setFormData }) {
  const [availableRoles, setAvailableRoles] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "category") {
      const categoryObj = jobData.find((cat) => cat.category === value);
      setAvailableRoles(categoryObj ? categoryObj.jobrole.map((r) => r.join(" ")) : []);
      setFormData((prev) => ({ ...prev, jobRole: "" }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Job Details */}
      <div className="space-y-4">
        <JobInputField
          label="Job Title *"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JobInputField
            label="Location *"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Job Type</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>
        </div>

        {/* Category and Role */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Category</option>
              {jobData.map((cat, idx) => (
                <option key={idx} value={cat.category}>
                  {cat.category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Role *
            </label>
            <select
              name="jobRole"
              value={formData.jobRole}
              onChange={handleChange}
              required
              disabled={!availableRoles.length}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select Role</option>
              {availableRoles.map((role, idx) => (
                <option key={idx} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Experience Input */}
        <JobInputField
          label="Experience (in years) *"
          name="experience"
          type="number"
          value={formData.experience}
          onChange={handleChange}
          required
          placeholder="e.g. 2, 3.5, etc."
        />

        <JobInputField
          label="Tags (comma separated)"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="React, Node, MongoDB"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <JobInputField
            label="Start Date *"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
          <JobInputField
            label="End Date *"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Company Details */}
      <JobCompanyDetails formData={formData} setFormData={setFormData} />
    </div>
  );
}

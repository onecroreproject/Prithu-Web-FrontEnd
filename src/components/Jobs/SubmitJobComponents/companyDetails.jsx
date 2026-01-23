// src/components/jobs/submit/JobCompanyDetails.jsx
import React from "react";
import { Upload } from "lucide-react";

export default function JobCompanyDetails({ formData, setFormData }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Company Details</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Name *
        </label>
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
          required
          placeholder="Example Pvt Ltd"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Company Logo
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Choose file
            <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
          </label>
          <span className="text-sm text-gray-500">
            {formData.image ? formData.image.name : "No file chosen"}
          </span>
        </div>
      </div>
    </div>
  );
}

// src/components/jobs/SubmitJob.jsx
import React, { useState } from "react";
import { Plus, Eye, Save, Upload } from "lucide-react";

export default function SubmitJob() {
  const [formData, setFormData] = useState({
    title: "", location: "", type: "Full Time", category: "", description: "",
    email: "", salary: "", companyName: "", website: "", tagline: "", video: "", twitter: "", logo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setFormData(prev => ({ ...prev, logo: file }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Job submitted!");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Post a New Job</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        {/* Job Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange}
                placeholder="e.g., London" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job type</label>
              <select name="type" value={formData.type} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Temporary</option>
                <option>Internship</option>
                <option>FreeLance</option>

              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job category</label>
            <select name="category" value={formData.category} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg">
              <option>Choose a category...</option>
              <option>Engineering</option>
              <option>Marketing</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange}
              rows={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application email/URL</label>
              <input type="text" name="email" value={formData.email} onChange={handleChange}
                placeholder="kintube@gmail.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary (optional)</label>
              <input type="text" name="salary" value={formData.salary} onChange={handleChange}
                placeholder="e.g. $20,000" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Company Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Company details</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company name</label>
              <input type="text" name="companyName" value={formData.companyName} onChange={handleChange}
                placeholder="Thanu" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website (optional)</label>
              <input type="text" name="website" value={formData.website} onChange={handleChange}
                placeholder="http://www.vk.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tagline (optional)</label>
            <input type="text" name="tagline" value={formData.tagline} onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
  </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video (optional)</label>
              <input type="text" name="video" value={formData.video} onChange={handleChange}
                placeholder="YouTube or Vimeo URL" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter username (optional)</label>
              <input type="text" name="twitter" value={formData.twitter} onChange={handleChange}
                placeholder="@company" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company logo</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Choose file
                <input type="file" className="hidden" onChange={handleFile} accept="image/*" />
              </label>
              <span className="text-sm text-gray-500">
                {formData.logo ? formData.logo.name : "No file chosen"}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button type="button" className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Eye className="w-5 h-5" /> Preview
          </button>
          <button type="button" className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Save className="w-5 h-5" /> Save Draft
          </button>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 ml-auto">
            <Plus className="w-5 h-5" /> Publish Job
          </button>
        </div>
      </form>
    </div>
  );
}
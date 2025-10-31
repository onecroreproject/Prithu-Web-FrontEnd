
// src/components/jobs/ManageJobs.jsx
import React from "react";
import { Edit, Trash2, Eye, Clock } from "lucide-react";

const jobs = [
  { id: 1, title: "Senior React Developer", filled: "Yes", posted: "2025-04-01", expires: "2025-05-01" },
  { id: 2, title: "Product Designer", filled: "No", posted: "2025-03-25", expires: "2025-04-25" },
];

export default function ManageJobs() {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Job Listings</h2>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Filled</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Posted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing Expires</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {job.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.filled === "Yes" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {job.filled}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.posted}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.expires}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                    <button className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    <button className="text-gray-600 hover:text-gray-800"><Eye className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

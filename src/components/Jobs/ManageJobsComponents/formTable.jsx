// src/components/jobs/manage/JobTable.jsx
import React from "react";
import { Edit, Eye, Trash2 } from "lucide-react";

export default function JobTable({ jobs, loading, onEdit, onPreview, onDelete }) {
  if (loading)
    return <p className="text-center py-6 text-gray-500">Loading jobs...</p>;
  if (!jobs.length)
    return <p className="text-center py-6 text-gray-500">No jobs found.</p>;

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Expired On
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.map((job) => (
            <tr key={job._id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {job.title || "Untitled"}
              </td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === "active"
                      ? "bg-green-100 text-green-700"
                      : job.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : job.status === "expired"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {job.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                {job.endDate ? new Date(job.endDate).toLocaleDateString() : "—"}
              </td>
              <td className="px-6 py-4">
                <div className="flex gap-3">
                  <button onClick={() => onEdit(job)} className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPreview(job)}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(job._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

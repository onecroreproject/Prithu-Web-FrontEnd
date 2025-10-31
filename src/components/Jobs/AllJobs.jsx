// src/components/jobs/AllJobs.jsx
import React, { useState } from "react";
import { Search, Filter, MapPin, Briefcase, Building } from "lucide-react";

const jobs = [
  { id: 1, title: "Sales & Customer Success Manager", company: "Nozti Inc", location: "4234 Chardonnay Drive, FL, USA", type: "Full Time", logo: "https://via.placeholder.com/60/6B46C1/FFFFFF?text=N" },
  { id: 2, title: "Marketing Data Enrichment Specialist", company: "Clinivex Analytics", location: "3rd street, Perm, Russia", type: "Full Time", logo: "https://via.placeholder.com/60/3B82F6/FFFFFF?text=C" },
  { id: 3, title: "Software Quality Assurance Engineer", company: "iSoft Nations", location: "4901 Lakeland Park Drive, GA, USA", type: "Full Time", logo: "https://via.placeholder.com/60/F97316/FFFFFF?text=iS" },
];

export default function AllJobs() {
  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Keywords"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Location"
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition flex items-center gap-2">
          <Search className="w-5 h-5" />
        </button>
        <button className="border border-gray-300 px-4 py-2.5 rounded-lg hover:bg-gray-50 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex gap-4">
                <img src={job.logo} alt={job.company} className="w-14 h-14 rounded-lg object-cover" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                    <Building className="w-4 h-4" /> {job.company}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </p>
                </div>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                {job.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
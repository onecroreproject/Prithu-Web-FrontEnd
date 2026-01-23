// src/components/Advertisement.jsx
import React, { useState } from "react";
import { Megaphone, Plus, Edit, Trash2, Eye, DollarSign } from "lucide-react";

export default function Advertisement() {
  const [activeSubTab, setActiveSubTab] = useState("manage");

  // Dummy data – replace with real API later
  const activeAds = [
    { 
      id: 1, 
      title: "Summer Sale - 50% Off!", 
      status: "active",
      impressions: 1250, 
      clicks: 89, 
      budget: "$250",
      avatar: "https://i.pravatar.cc/40?img=15"
    },
    { 
      id: 2, 
      title: "New Product Launch", 
      status: "active",
      impressions: 890, 
      clicks: 45, 
      budget: "$150",
      avatar: "https://i.pravatar.cc/40?img=16"
    },
  ];

  const inactiveAds = [
    { 
      id: 3, 
      title: "Holiday Promotion", 
      status: "paused",
      impressions: 340, 
      clicks: 12, 
      budget: "$100",
      avatar: "https://i.pravatar.cc/40?img=17"
    },
  ];

  const subTabs = [
    { id: "manage", label: "Manage Ads", Icon: Edit },
    { id: "create", label: "Create Ad", Icon: Plus },
  ];

  const renderContent = () => {
    if (activeSubTab === "manage") return <ManageAdsTab activeAds={activeAds} inactiveAds={inactiveAds} />;
    if (activeSubTab === "create") return <CreateAdTab />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {subTabs.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium capitalize transition-all
                ${activeSubTab === tab.id
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600 hover:text-gray-900"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}

/* ────── Sub-Tab Components ────── */

function ManageAdsTab({ activeAds, inactiveAds }) {
  const handleEdit = (id) => {
    alert(`Edit ad ${id}`);
    // TODO: Open edit modal/API
  };

  const handleDelete = (id) => {
    if (confirm(`Delete ad ${id}?`)) {
      alert(`Deleted ad ${id}`);
      // TODO: API call to delete
    }
  };

  const handleToggle = (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    alert(`Toggled ad ${id} to ${newStatus}`);
    // TODO: API call to toggle status
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
            <Eye className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Total Impressions</h3>
          <p className="text-2xl font-bold text-green-600">2,480</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Total Spent</h3>
          <p className="text-2xl font-bold text-blue-600">$500</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
            <Megaphone className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-900 mb-1">Active Ads</h3>
          <p className="text-2xl font-bold text-purple-600">{activeAds.length}</p>
        </div>
      </div>

      {/* Active Ads */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Active Campaigns ({activeAds.length})
        </h3>
        {activeAds.length === 0 ? (
          <EmptyState icon={<Megaphone className="w-8 h-8 text-gray-400" />}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Ads</h3>
            <p className="text-sm text-gray-600">Create your first ad campaign to get started!</p>
          </EmptyState>
        ) : (
          activeAds.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              status="active"
              onEdit={() => handleEdit(ad.id)}
              onDelete={() => handleDelete(ad.id)}
              onToggle={() => handleToggle(ad.id, ad.status)}
            />
          ))
        )}
      </div>

      {/* Inactive Ads */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
          Inactive Campaigns ({inactiveAds.length})
        </h3>
        {inactiveAds.length === 0 ? (
          <EmptyState icon={<Megaphone className="w-8 h-8 text-gray-400" />}>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Inactive Ads</h3>
            <p className="text-sm text-gray-600">All your ads are currently active.</p>
          </EmptyState>
        ) : (
          inactiveAds.map((ad) => (
            <AdCard
              key={ad.id}
              ad={ad}
              status="inactive"
              onEdit={() => handleEdit(ad.id)}
              onDelete={() => handleDelete(ad.id)}
              onToggle={() => handleToggle(ad.id, ad.status)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CreateAdTab() {
  const [formData, setFormData] = useState({
    title: "",
    budget: "",
    targetAudience: "",
    content: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Ad created! (Demo)");
    // TODO: API call to create ad
    setFormData({ title: "", budget: "", targetAudience: "", content: "" });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800">Create New Ad Campaign</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Summer Sale - 50% Off!"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Budget</label>
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., 50"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">$ per day</p>
        </div>

        {/* Target Audience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
          <input
            type="text"
            name="targetAudience"
            value={formData.targetAudience}
            onChange={handleChange}
            placeholder="e.g., 25-35 year olds, tech enthusiasts"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Ad Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ad Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your ad copy here..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-medium transition"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Create Ad Campaign
        </button>
      </form>
    </div>
  );
}

/* ────── Shared Components ────── */

function AdCard({ ad, status, onEdit, onDelete, onToggle }) {
  const isActive = status === "active";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <img
              src={ad.avatar}
              alt={ad.title}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h4 className="font-medium text-gray-900">{ad.title}</h4>
              <p className="text-xs text-gray-500 capitalize">{status} · Started 3 days ago</p>
            </div>
          </div>
          
          {/* Metrics */}
          <div className="flex gap-6 text-xs text-gray-600 mb-3">
            <div>👁️ {ad.impressions.toLocaleString()}</div>
            <div>🖱️ {ad.clicks}</div>
            <div className="font-medium">{ad.budget} spent</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={onToggle}
            className={`px-2 py-1 text-xs font-medium rounded ${
              isActive
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          >
            {isActive ? "Pause" : "Resume"}
          </button>
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            <Trash2 className="w-3 h-3 inline mr-1" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ children, icon }) {
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>{children}</div>
    </div>
  );
}
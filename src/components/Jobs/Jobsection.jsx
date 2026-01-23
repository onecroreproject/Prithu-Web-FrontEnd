// src/components/JobPortal.jsx
import React, { useState } from "react";
import { Briefcase, Search, Filter, Grid3X3, Edit, Plus } from "lucide-react";

import AllJobs from "./AllJobs";
import Categories from "./Categories";
import ManageJobs from "./Managejobs";
import SubmitJob from "./SumbitJob";

export default function Jobsection() {
  const [activeTab, setActiveTab] = useState("submit");

  const tabs = [
    { id: "submit", label: "Submit", Icon: Plus },
     { id: "manage", label: "Manage", Icon: Edit },
     { id: "categories", label: "Categories", Icon: Grid3X3 },
    { id: "all", label: "All Jobs", Icon: Briefcase },
    
   
    
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "submit": return <SubmitJob />;
      case "manage": return <ManageJobs />;
      case "categories": return <Categories />;
      case "all": return <AllJobs />;
      default: return <SubmitJob />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all
                    ${activeTab === tab.id
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
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
}
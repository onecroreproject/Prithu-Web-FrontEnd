// src/pages/settings/CloseAccountSettings.jsx
import React, { useState } from "react";
import { AlertCircle, Download, Check, X } from "lucide-react";

const CloseAccountSettings = () => {
  const [confirmed, setConfirmed] = useState(false);

  const handleDelete = () => {
    if (confirmed) {
      alert("Account deletion requested. (Demo)");
      // TODO: Call API to delete account
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Before you go...</h2>
      </div>

      {/* Backup Link */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
        <p className="text-sm text-blue-800">
          Take a backup of your data{" "}
          <button className="font-medium text-blue-600 hover:text-blue-700 underline flex items-center gap-1 mx-auto justify-center">
            <Download className="w-4 h-4" />
            Here
          </button>
        </p>
      </div>

      {/* Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-800 font-medium">
          If you delete your account, you will lose all your data.
        </p>
      </div>

      {/* Confirmation Checkbox */}
      <label className="flex items-center gap-3 mb-8 cursor-pointer">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
        />
        <span className="text-sm font-medium text-gray-900">
          Yes, I'd like to delete my account
        </span>
      </label>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {/* Keep Account - GREEN */}
        <button className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition">
          <Check className="w-5 h-5" />
          Keep my account
        </button>

        {/* Delete Account - RED */}
        <button
          onClick={handleDelete}
          disabled={!confirmed}
          className={`flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-lg transition ${
            confirmed
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <X className="w-5 h-5" />
          Delete my account
        </button>
      </div>

      {/* Footer Note */}
      <p className="text-xs text-gray-500 text-center mt-8">
        This action is permanent and cannot be undone.
      </p>
    </div>
  );
};

export default CloseAccountSettings;
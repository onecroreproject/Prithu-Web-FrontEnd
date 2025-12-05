import React from "react";
import {
  MdMonetizationOn
} from "react-icons/md";
import {
  FiPlus,
  FiX
} from "react-icons/fi";

const SalaryBenefitsTab = ({
  formData,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField
}) => {
  const salaryTypes = ["monthly", "yearly", "hourly"];
  const salaryVisibilities = ["public", "private", "restricted"];
  const salaryCurrencies = ["INR", "USD", "EUR", "GBP", "AUD", "CAD"];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Salary & Benefits</h2>
        <p className="text-gray-600">Define the compensation package and benefits for this position.</p>
      </div>

      {/* Salary Information */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          <div className="flex items-center gap-2">
            <MdMonetizationOn className="text-blue-600" />
            Salary Information
          </div>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Salary Type</label>
            <select
              name="salaryType"
              value={formData.salaryType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {salaryTypes.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Salary Visibility</label>
            <select
              name="salaryVisibility"
              value={formData.salaryVisibility}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              {salaryVisibilities.map(visibility => (
                <option key={visibility} value={visibility} className="capitalize">
                  {visibility}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Minimum Salary</label>
            <div className="flex items-center">
              <select
                name="salaryCurrency"
                value={formData.salaryCurrency}
                onChange={handleInputChange}
                className="px-4 py-3 border-2 border-r-0 border-gray-300 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                {salaryCurrencies.map(currency => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Maximum Salary</label>
            <div className="flex items-center">
              <span className="px-4 py-3 border-2 border-r-0 border-gray-300 rounded-l-xl bg-gray-50 text-gray-700">
                {formData.salaryCurrency}
              </span>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g., 100000"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Incentives</label>
            <input
              type="text"
              name="incentives"
              value={formData.incentives}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Performance bonuses"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">Bonuses</label>
            <input
              type="text"
              name="bonuses"
              value={formData.bonuses}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="e.g., Annual bonus"
            />
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiPlus className="text-blue-600" />
              Benefits
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('benefits')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Benefit
          </button>
        </div>
        <div className="space-y-3">
          {formData.benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={benefit}
                  onChange={(e) => handleArrayInputChange(index, 'benefits', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a benefit"
                />
              </div>
              {formData.benefits.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'benefits')}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Perks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-semibold text-gray-900">
            <div className="flex items-center gap-2">
              <FiPlus className="text-blue-600" />
              Perks
            </div>
          </label>
          <button
            type="button"
            onClick={() => addArrayField('perks')}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <FiPlus />
            Add Perk
          </button>
        </div>
        <div className="space-y-3">
          {formData.perks.map((perk, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={perk}
                  onChange={(e) => handleArrayInputChange(index, 'perks', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="Enter a perk"
                />
              </div>
              {formData.perks.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayField(index, 'perks')}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  title="Remove"
                >
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalaryBenefitsTab;


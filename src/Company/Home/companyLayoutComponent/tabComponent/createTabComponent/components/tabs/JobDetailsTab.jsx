import React, { useRef, useEffect, useState } from "react";
import {
  MdDescription,
  MdMonetizationOn,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify
} from "react-icons/md";
import { FiPlus, FiX } from "react-icons/fi";
import JobImageUpload from "./imageUpload";

const JobDetailsAndSalaryTab = ({
  formData,
  errors,
  handleInputChange,
  handleArrayInputChange,
  addArrayField,
  removeArrayField,
  salaryTypes,
  salaryCurrencies,
  handleFileChange,
  removeImage,
  jobImage,
  existingImage
}) => {
  
  const editorRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && formData.jobDescription) {
      editorRef.current.innerHTML = formData.jobDescription;
    }
  }, [formData.jobDescription]);

  // Format text using document.execCommand
  const formatText = (command, value = null) => {
    const editor = editorRef.current;
    if (!editor) return;

    // Focus on editor
    editor.focus();
    
    // Save selection
    const selection = window.getSelection();
    
    try {
      // Execute the command
      if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command, false, null);
      }
      
      // Update form data after formatting
      updateFormData();
    } catch (error) {
      console.error("Formatting error:", error);
    }
  };

  // Update form data from editor content
  const updateFormData = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const htmlContent = editor.innerHTML;
    handleInputChange({ target: { name: 'jobDescription', value: htmlContent } });
  };

  // Handle editor input
  const handleEditorInput = () => {
    updateFormData();
  };

  // Handle editor paste (to remove unwanted formatting)
  const handleEditorPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    updateFormData();
  };

  // Common benefits suggestions
  const commonBenefits = [
    "Health Insurance",
    "Work From Home",
    "Flexible Hours",
    "Paid Time Off",
    "Retirement Plan",
    "Stock Options",
    "Bonus System",
    "Training & Development",
    "Gym Membership",
    "Free Lunch",
    "Company Car",
    "Child Care",
    "Education Assistance",
    "Wellness Program",
    "Team Events"
  ];

  // Create a safe benefits array
  const benefits = formData.benefits || [];

  // Handle adding a benefit from suggestions
  const handleAddBenefit = (benefit) => {
    if (benefit && !benefits.includes(benefit)) {
      const newBenefits = [...benefits, benefit];
      handleInputChange({ target: { name: 'benefits', value: newBenefits } });
    }
  };

  // Handle removing a benefit
  const handleRemoveBenefit = (index) => {
    const newBenefits = benefits.filter((_, i) => i !== index);
    handleInputChange({ target: { name: 'benefits', value: newBenefits } });
  };

  // Handle custom benefit input
  const handleCustomBenefit = () => {
    const customBenefit = prompt("Enter a custom benefit:");
    if (customBenefit && customBenefit.trim() && !benefits.includes(customBenefit.trim())) {
      const newBenefits = [...benefits, customBenefit.trim()];
      handleInputChange({ target: { name: 'benefits', value: newBenefits } });
    }
  };

  // Handle benefit selection from dropdown
  const handleBenefitSelect = (e) => {
    const benefit = e.target.value;
    if (benefit && benefit !== "") {
      handleAddBenefit(benefit);
    }
    e.target.value = "";
  };

  // Filter out already selected benefits from dropdown options
  const availableBenefits = commonBenefits.filter(
    benefit => !benefits.includes(benefit)
  );

  return (
    <div className="space-y-8">

      {/* Job Description with ContentEditable Editor */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          <div className="flex items-center gap-2">
            <MdDescription className="text-blue-600" />
            Job Description *
          </div>
        </label>
        
        {/* Enhanced Formatting Toolbar */}
        <div className="mb-3 p-3 bg-gray-50 border border-gray-300 rounded-xl">
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Text Formatting */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Bold"
              >
                <MdFormatBold className="text-gray-700" size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Italic"
              >
                <MdFormatItalic className="text-gray-700" size={18} />
              </button>
            </div>

          

            {/* Text Alignment */}
            <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
              <button
                type="button"
                onClick={() => formatText('justifyLeft')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Align Left"
              >
                <MdFormatAlignLeft className="text-gray-700" size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('justifyCenter')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Align Center"
              >
                <MdFormatAlignCenter className="text-gray-700" size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('justifyRight')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Align Right"
              >
                <MdFormatAlignRight className="text-gray-700" size={18} />
              </button>
              <button
                type="button"
                onClick={() => formatText('justifyFull')}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title="Justify"
              >
                <MdFormatAlignJustify className="text-gray-700" size={18} />
              </button>
            </div>

            

            {/* Clear Formatting */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                type="button"
                onClick={() => formatText('removeFormat')}
                className="px-3 py-1 text-sm hover:bg-gray-200 rounded transition-colors border border-gray-300"
                title="Clear Formatting"
              >
                Clear
              </button>
            </div>
          </div>
          
          {/* Simple Instructions */}
          <div className="mt-2 pt-2 border-t border-gray-300">
            <p className="text-xs text-gray-600">
              <span className="font-medium">How to use:</span> Select text and click formatting buttons. 
              <span className="ml-2">Formatting is applied instantly.</span>
            </p>
          </div>
        </div>

        {/* ContentEditable Editor */}
        <div
          ref={editorRef}
          contentEditable
          onInput={handleEditorInput}
          onPaste={handleEditorPaste}
          onFocus={() => setIsEditing(true)}
          onBlur={() => setIsEditing(false)}
          className={`min-h-[200px] w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-base resize-none overflow-y-auto ${
            errors.jobDescription ? 'border-red-300 bg-red-50' : 'border-gray-300'
          } ${isEditing ? 'bg-white' : 'bg-white'}`}
          style={{ 
            minHeight: '200px',
            maxHeight: '400px',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
          placeholder="Describe the job role, expectations, company culture, and what makes this position exciting..."
          data-placeholder="Describe the job role, expectations, company culture, and what makes this position exciting..."
        />
        
        {/* Hidden input to store the HTML */}
        <input
          type="hidden"
          name="jobDescription"
          value={formData.jobDescription || ""}
          readOnly
        />
        
        {errors.jobDescription && (
          <p className="text-red-500 text-sm mt-2">{errors.jobDescription}</p>
        )}
        
        <div className="text-sm text-gray-500 mt-2">
          <p>Tip: Be specific about responsibilities, growth opportunities, and team culture.</p>
          <p className="text-xs mt-1">Use the formatting toolbar above to style your text.</p>
        </div>
      </div>

      {/* Image Upload Section */}
      <JobImageUpload
        handleFileChange={handleFileChange}
        removeImage={removeImage}
        jobImage={jobImage}
        existingImage={existingImage}
        errors={errors}
      />

      {/* Divider between sections */}
      <div className="border-t border-gray-200 pt-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Salary & Benefits</h2>
          <p className="text-gray-600">Define the compensation package and benefits for this position.</p>
        </div>
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
      </div>

      {/* Benefits Section - Tag Style */}
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          <div className="flex items-center gap-2">
            <FiPlus className="text-blue-600" />
            Benefits & Perks
          </div>
        </h3>

        <p className="text-gray-600 mb-6">Select benefits that apply to this position:</p>

        {/* Benefit Selection Dropdown */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-900 mb-4">Add Benefit</label>
          <div className="flex gap-3">
            <select
              onChange={handleBenefitSelect}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            >
              <option value="">Select a benefit...</option>
              {availableBenefits.map((benefit) => (
                <option key={benefit} value={benefit}>
                  {benefit}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleCustomBenefit}
              className="flex items-center gap-2 px-6 py-3 text-blue-600 hover:text-blue-700 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
            >
              <FiPlus />
              Custom
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {availableBenefits.length === 0 
              ? "All common benefits have been selected. Use 'Custom' to add more." 
              : `Select from ${availableBenefits.length} available benefits`}
          </p>
        </div>

        {/* Selected Benefits as Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-4">Selected Benefits</label>
          {benefits.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full border border-blue-200"
                >
                  <span>{benefit}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(index)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-1 transition-colors"
                    title="Remove"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
              <FiPlus className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No benefits added yet</p>
              <p className="text-sm text-gray-400 mt-1">Use the dropdown above to add benefits</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailsAndSalaryTab;
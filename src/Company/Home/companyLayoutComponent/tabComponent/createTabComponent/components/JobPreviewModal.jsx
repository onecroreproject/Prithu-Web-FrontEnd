import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas-pro";
import { FiX, FiCheck, FiEdit2, FiSave, FiBriefcase, FiMapPin, FiDollarSign, FiUsers, FiCalendar, FiAward, FiCode } from "react-icons/fi";

const JobPreviewModal = ({
  showPreview,
  setShowPreview,
  formData,
  jobImage,
  existingImage,
  onSaveDraft,
  onEditAgain,
  onSubmit,
  isSubmitting,
  isEditMode,
  jobApproved = false
}) => {
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Reset scroll position when modal opens
  useEffect(() => {
    if (showPreview && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [showPreview]);




  if (!showPreview) return null;



  function stripOklchColors(root) {
  const original = new Map();
  root.querySelectorAll('*').forEach(el => {
    const cs = window.getComputedStyle(el);

    if (cs.color.includes('oklch(')) {
      original.set(el, { ...original.get(el), color: el.style.color });
      el.style.color = '#111827';
    }
    if (cs.backgroundColor.includes('oklch(')) {
      original.set(el, { ...original.get(el), backgroundColor: el.style.backgroundColor });
      el.style.backgroundColor = '#ffffff';
    }
    if (cs.borderColor.includes('oklch(')) {
      original.set(el, { ...original.get(el), borderColor: el.style.borderColor });
      el.style.borderColor = '#e5e7eb';
    }
  });
  return original;
}

function restoreColors(original) {
  original.forEach((styles, el) => {
    if (!el) return;
    if ('color' in styles) el.style.color = styles.color;
    if ('backgroundColor' in styles) el.style.backgroundColor = styles.backgroundColor;
    if ('borderColor' in styles) el.style.borderColor = styles.borderColor;
  });
}


  // Function to convert oklch colors to hex/rgb
  const convertOklchToHex = (colorValue) => {
    if (!colorValue) return '';
    
    // If it's already a hex or rgb, return as-is
    if (colorValue.startsWith('#') || colorValue.startsWith('rgb') || colorValue.startsWith('rgba')) {
      return colorValue;
    }
    
    // Handle oklch() colors by converting to common Tailwind colors
    if (colorValue.includes('oklch')) {
      // Extract approximate values
      if (colorValue.includes('0.85')) {
        // Light backgrounds (gray-50, blue-100, green-100, etc.)
        if (colorValue.includes('0.96')) return '#f9fafb'; // gray-50
        if (colorValue.includes('0.93')) return '#dbeafe'; // blue-100
        if (colorValue.includes('0.92')) return '#dcfce7'; // green-100
        if (colorValue.includes('0.94')) return '#f3e8ff'; // purple-100
        if (colorValue.includes('0.95')) return '#ffedd5'; // orange-100
        return '#ffffff'; // default white
      } else if (colorValue.includes('0.6')) {
        // Primary colors
        if (colorValue.includes('0.2')) return '#059669'; // green-600
        if (colorValue.includes('0.23')) return '#047857'; // green-700
        if (colorValue.includes('0.25')) return '#1d4ed8'; // blue-700
        if (colorValue.includes('0.3')) return '#7c3aed'; // purple-700
        if (colorValue.includes('0.12')) return '#c2410c'; // orange-700
        return '#374151'; // gray-700 as default
      }
    }
    
    // Default fallback
    return '#000000';
  };

  // Function to pre-process the DOM before capture
  const preProcessForCapture = (element) => {
    if (!element) return;
    
    // Create a deep clone of the element
    const clone = element.cloneNode(true);
    
    // Function to process all elements in the clone
    const processElement = (el) => {
      if (!el || !el.style) return;
      
      try {
        // Get computed styles
        const computedStyle = window.getComputedStyle(el);
        
        // Fix background colors
        const bgColor = computedStyle.backgroundColor;
        if (bgColor && (bgColor.includes('oklch') || bgColor.includes('oklab'))) {
          el.style.backgroundColor = convertOklchToHex(bgColor);
        }
        
        // Fix background images (gradients)
        const backgroundImage = computedStyle.backgroundImage;
        if (backgroundImage && (backgroundImage.includes('oklch') || backgroundImage.includes('oklab'))) {
          // Replace gradient with hex colors
          if (backgroundImage.includes('linear-gradient')) {
            // For green gradients
            if (el.classList.contains('from-green-600') || el.classList.contains('to-emerald-600')) {
              el.style.background = 'linear-gradient(to right, #059669, #047857)';
            }
            // For other gradients, use simple background
            else {
              el.style.background = '#059669'; // Default green
            }
          }
        }
        
        // Fix text colors
        const textColor = computedStyle.color;
        if (textColor && (textColor.includes('oklch') || textColor.includes('oklab'))) {
          el.style.color = convertOklchToHex(textColor);
        }
        
        // Fix border colors
        const borderColor = computedStyle.borderColor;
        if (borderColor && (borderColor.includes('oklch') || borderColor.includes('oklab'))) {
          el.style.borderColor = convertOklchToHex(borderColor);
        }
        
        // Process all children
        for (let child of el.children) {
          processElement(child);
        }
      } catch (err) {
        console.warn('Error processing element for capture:', err);
      }
    };
    
    // Process the entire clone
    processElement(clone);
    
    return clone;
  };

  // Function to capture modal as image and submit
// Function to capture modal as image and submit
const handleSubmitWithCapture = async () => {
  if (!modalRef.current) {
    await onSubmit();
    return;
  }

  setIsCapturing(true);

  try {
    // ensure scroll top for consistent capture (optional)
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }

    const canvas = await html2canvas(modalRef.current, {
      backgroundColor: "#ffffff",
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      logging: false,
      ignoreElements: (element) =>
        element.classList.contains("ignore-capture") ||
        element.hasAttribute("data-ignore-capture"),
      onclone: (clonedDoc, clonedElement) => {
        // hide bottom action buttons in the clone
        const actionBar = clonedElement.querySelector(".sticky.bottom-0");
        if (actionBar) {
          actionBar.style.display = "none";
        }
      }
    });

    const blob = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/png", 0.9);
    });

    if (blob) {
      // Create a new FormData object
      const formDataWithImage = new FormData();
      
      // Append the captured screenshot
      formDataWithImage.append("postImage", blob, "job-preview.png");
      
      // Append the job image if it exists
      if (jobImage) {
        formDataWithImage.append("jobImage", jobImage);
      }
      
      // IMPORTANT: We need to pass all form data along with the image
      // Call onSubmit with both the captured image AND the form data
      await onSubmit(formDataWithImage);
    } else {
      // If blob creation fails, fall back to regular submit
      await onSubmit();
    }
  } catch (error) {
    console.error("Error in capture process:", error);
    // Fall back to regular submit on error
    await onSubmit();
  } finally {
    setIsCapturing(false);
  }
};


  // Function to safely render HTML content
  const renderHTML = (htmlString) => {
    if (!htmlString) return null;
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    // Clean up empty divs and br tags
    const cleanHTML = tempDiv.innerHTML
      .replace(/<div><br><\/div>/g, '<br>')
      .replace(/<div><\/div>/g, '')
      .replace(/<div>(.*?)<\/div>/g, '<p>$1</p>')
      .replace(/<p><br><\/p>/g, '<br>');
    
    return { __html: cleanHTML };
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div
        ref={modalRef}
        className="w-full min-h-screen bg-white"
        data-capture-target
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Preview</h1>
                <p className="text-gray-600 text-lg">Review your job posting before {jobApproved ? 'updating' : 'submitting'}</p>
                {jobApproved && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 mt-3 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    <FiCheck className="text-sm" />
                    <span>Approved Job - Updates will require re-approval</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors ignore-capture"
                data-ignore-capture
              >
                <FiX className="text-xl" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Preview Content */}
        <div
          ref={contentRef}
          data-modal-content
          className="overflow-y-auto py-8"
        >
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            {/* Job Header with Image */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Job Image */}
              {(jobImage || existingImage) && (
                <div className="md:w-1/3">
                  <div className="relative h-48 md:h-full rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={jobImage ? URL.createObjectURL(jobImage) : existingImage}
                      alt="Job preview"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                      onLoad={(e) => {
                        // Ensure image is loaded before capture
                        console.log('Job image loaded');
                      }}
                    />
                  </div>
                </div>
              )}
              
              {/* Job Title and Basic Info */}
              <div className={`${(jobImage || existingImage) ? 'md:w-2/3' : 'w-full'}`}>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {formData.jobTitle || "No title provided"}
                </h1>
                
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {formData.employmentType && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <FiBriefcase className="text-xs" />
                      {formData.employmentType}
                    </span>
                  )}
                  {formData.workMode && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <FiUsers className="text-xs" />
                      {formData.workMode}
                    </span>
                  )}
                  {formData.jobIndustry && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {formData.jobIndustry}
                    </span>
                  )}
                  {formData.remoteEligibility && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                      Remote Eligible
                    </span>
                  )}
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {(formData.city || formData.state || formData.country) && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiMapPin className="text-sm" />
                        <span className="text-xs font-medium">LOCATION</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {[formData.city, formData.state].filter(Boolean).join(', ') || formData.country}
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiUsers className="text-sm" />
                      <span className="text-xs font-medium">OPENINGS</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formData.openingsCount} position(s)
                    </p>
                  </div>
                  
                  {formData.salaryMin > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <FiDollarSign className="text-sm" />
                        <span className="text-xs font-medium">SALARY</span>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formData.salaryCurrency} {formData.salaryMin.toLocaleString()} - {formData.salaryMax.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Per {formData.salaryType}</p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <FiCalendar className="text-sm" />
                      <span className="text-xs font-medium">POSTED</span>
                    </div>
                    <p className="font-semibold text-gray-900">
                      {formatDate(formData.startDate)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Job Description */}
            {formData.jobDescription && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FiBriefcase />
                  Job Description
                </h2>
                <div 
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={renderHTML(formData.jobDescription)}
                />
              </div>
            )}
            
            {/* Qualifications & Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Required Skills */}
              {formData.preferredSkills && formData.preferredSkills.filter(s => s.trim()).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiCode />
                    Required Skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferredSkills.filter(s => s.trim()).map((skill, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Qualifications */}
              {formData.qualifications && formData.qualifications.filter(q => q.educationLevel.trim() !== '').length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FiAward />
                    Qualifications
                  </h2>
                  <ul className="space-y-3">
                    {formData.qualifications.filter(q => q.educationLevel.trim() !== '').map((qual, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <FiCheck className="text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900">{qual.educationLevel}</span>
                          {qual.course && (
                            <span className="text-gray-700"> - {qual.course}</span>
                          )}
                          {qual.specialization && (
                            <p className="text-sm text-gray-600 mt-1">Specialization: {qual.specialization}</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Experience & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience */}
              {(formData.minimumExperience > 0 || formData.maximumExperience > 0) && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Experience Required</h2>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Minimum:</span> {formData.minimumExperience} years
                    </p>
                    {formData.maximumExperience > 0 && (
                      <p className="text-gray-700">
                        <span className="font-medium">Maximum:</span> {formData.maximumExperience} years
                      </p>
                    )}
                    {formData.freshersAllowed && (
                      <p className="text-green-600 font-medium">
                        Freshers are welcome to apply
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Benefits */}
              {formData.benefits && formData.benefits.filter(b => b.trim()).length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
                  <ul className="space-y-2">
                    {formData.benefits.filter(b => b.trim()).map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <FiCheck className="text-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Additional Details */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.contractDuration && (
                  <div>
                    <p className="text-sm text-gray-600">Contract Duration</p>
                    <p className="font-medium">
                      {formData.contractDuration} {formData.contractDurationUnit}
                    </p>
                  </div>
                )}
                
                {formData.shiftType && (
                  <div>
                    <p className="text-sm text-gray-600">Shift Type</p>
                    <p className="font-medium">{formData.shiftType}</p>
                  </div>
                )}
                
                {formData.urgencyLevel && (
                  <div>
                    <p className="text-sm text-gray-600">Urgency Level</p>
                    <p className="font-medium">{formData.urgencyLevel}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-600">Application Deadline</p>
                  <p className="font-medium">{formatDate(formData.endDate)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="bg-white border-t border-gray-200 p-6 mt-8 ignore-capture"
          data-ignore-capture
        >
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-4xl mx-auto">
            {/* Only show Save Draft if job is NOT approved */}
            {!jobApproved && (
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting || isCapturing}
                className="flex items-center justify-center gap-2 px-6 py-3 text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-sm ignore-capture"
                data-ignore-capture
              >
                <FiSave />
                Save Draft
              </button>
            )}
            
            <button
              type="button"
              onClick={onEditAgain}
              disabled={isSubmitting || isCapturing}
              className="flex items-center justify-center gap-2 px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ignore-capture"
              data-ignore-capture
            >
              <FiEdit2 />
              Edit Again
            </button>
            
           <button
  type="button"
  onClick={() => handleSubmitWithCapture()}
  disabled={isSubmitting || isCapturing}
  className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ignore-capture"
  data-ignore-capture
>
  {/* ... button content ... */}

              {(isSubmitting || isCapturing) ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {jobApproved ? 'Updating...' : isEditMode ? 'Updating...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <FiCheck />
                  {jobApproved ? 'Update Job' : isEditMode ? 'Update Job' : 'Submit Job'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPreviewModal;
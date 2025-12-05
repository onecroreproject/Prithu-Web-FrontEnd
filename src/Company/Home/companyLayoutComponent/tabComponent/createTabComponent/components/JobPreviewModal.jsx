import React from "react";
import { FiX } from "react-icons/fi";

const JobPreviewModal = ({
  showPreview,
  setShowPreview,
  formData,
  jobImage,
  existingImage
}) => {
  if (!showPreview) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-900">Job Preview</h3>
            <button
              onClick={() => setShowPreview(false)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="space-y-6">
            {/* Job Image in Preview */}
            {(jobImage || existingImage) && (
              <div>
                <img
                  src={jobImage ? URL.createObjectURL(jobImage) : existingImage}
                  alt="Job preview"
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              </div>
            )}

            <div>
              <h4 className="text-2xl font-bold text-gray-900">{formData.jobTitle}</h4>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {formData.employmentType}
                </span>
                <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  {formData.workMode}
                </span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  {formData.jobCategory}
                </span>
                {formData.remoteEligibility && (
                  <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    Remote Eligible
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Location</h5>
                <p className="text-gray-700">{formData.city}, {formData.state}, {formData.country}</p>
                {formData.fullAddress && (
                  <p className="text-gray-600 text-sm mt-1">{formData.fullAddress}</p>
                )}
              </div>

              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Openings</h5>
                <p className="text-gray-700">{formData.openingsCount} position(s) available</p>
              </div>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-2">Job Description</h5>
              <p className="text-gray-700 whitespace-pre-line">{formData.jobDescription}</p>
            </div>

            {formData.responsibilities.filter(r => r.trim()).length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Key Responsibilities</h5>
                <ul className="list-disc pl-5 space-y-2">
                  {formData.responsibilities.filter(r => r.trim()).map((resp, index) => (
                    <li key={index} className="text-gray-700">{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {formData.requiredSkills.filter(s => s.trim()).length > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Required Skills</h5>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.filter(s => s.trim()).map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {formData.salaryMin > 0 && (
              <div>
                <h5 className="font-semibold text-gray-900 mb-2">Salary</h5>
                <p className="text-gray-700">
                  {formData.salaryCurrency} {formData.salaryMin} - {formData.salaryMax} per {formData.salaryType}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPreviewModal;

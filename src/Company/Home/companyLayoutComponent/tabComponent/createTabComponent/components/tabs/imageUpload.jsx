import React from "react";
import { FiImage, FiX, FiCheckCircle } from "react-icons/fi";

const JobImageUpload = ({
  handleFileChange,
  removeImage,
  jobImage,
  existingImage,
  errors
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        <div className="flex items-center gap-2">
          <FiImage className="text-blue-600" />
          Job Image
        </div>
      </h3>
      
      {existingImage && !jobImage && (
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Current Image:</p>
          <div className="relative">
            <img 
              src={existingImage} 
              alt="Current job" 
              className="w-64 h-48 object-cover rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <FiX className="text-sm" />
            </button>
          </div>
        </div>
      )}
      
      {(!existingImage || jobImage) && (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            id="job-image-upload"
          />
          <label htmlFor="job-image-upload" className="cursor-pointer block">
            <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
              <FiImage className="w-full h-full" />
            </div>
            <p className="text-gray-600 text-lg mb-1">Click to upload job image</p>
            <p className="text-gray-400 text-sm">JPG, PNG (Max 5MB)</p>
          </label>
        </div>
      )}
      
      {jobImage && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={URL.createObjectURL(jobImage)} 
                alt="Preview" 
                className="w-12 h-12 object-cover rounded"
              />
              <div>
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <FiCheckCircle />
                  {jobImage.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(jobImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}
      
      {errors.jobImage && (
        <p className="text-red-500 text-sm mt-2">{errors.jobImage}</p>
      )}
    </div>
  );
};

export default JobImageUpload;
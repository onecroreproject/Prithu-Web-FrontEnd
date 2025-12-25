// CropperModal.jsx
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { FiX, FiCheck, FiRotateCw, FiRotateCcw } from "react-icons/fi";

const CropperModal = ({ 
  image, 
  aspectRatio, 
  onCropComplete, 
  onCancel,
  title = "Crop Image",
  description = "Adjust the crop area"
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation) => {
    setRotation(rotation);
  };

  const onCropCompleteCallback = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = () => {
    if (croppedAreaPixels) {
      onCropComplete(croppedAreaPixels);
    }
  };

  const rotateLeft = () => {
    setRotation(rotation - 90);
  };

  const rotateRight = () => {
    setRotation(rotation + 90);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            <p className="text-xs text-gray-500 mt-1">Aspect Ratio: {aspectRatio === 1 ? "1:1 (Square)" : "16:9 (Wide)"}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-96 bg-gray-900">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteCallback}
            cropShape="rect"
            showGrid={true}
            objectFit="contain"
            classes={{
              containerClassName: "cropper-container",
              mediaClassName: "cropper-media",
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-gray-200">
          {/* Zoom Control */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Zoom: {zoom.toFixed(1)}x
            </label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rotation Controls */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <button
                onClick={rotateLeft}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiRotateCcw />
                Rotate Left
              </button>
              <button
                onClick={rotateRight}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiRotateCw />
                Rotate Right
              </button>
            </div>
            <div className="text-sm text-gray-600">
              Rotation: {rotation}°
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCrop}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <FiCheck />
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
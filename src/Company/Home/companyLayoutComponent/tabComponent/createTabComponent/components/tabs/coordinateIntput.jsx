import React from "react";
import { FiMapPin, FiNavigation, FiCheckCircle } from "react-icons/fi";

const LocationCoordinatesInput = ({
  formData,
  handleInputChange,
  isGettingLocation,
  locationPermission,
  locationError,
  handleUseCurrentLocation,
  getCoordinatesFromAddress
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border-2 border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiMapPin className="text-blue-600" />
            Location Coordinates
          </div>
          <div className="flex items-center gap-2">
            {locationPermission === 'granted' && (
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                Location Access Granted
              </span>
            )}
            {locationPermission === 'denied' && (
              <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                Location Access Denied
              </span>
            )}
          </div>
        </div>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Latitude</label>
          <input
            type="text"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g., 28.6139"
            readOnly={isGettingLocation}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">Longitude</label>
          <input
            type="text"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            placeholder="e.g., 77.2090"
            readOnly={isGettingLocation}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isGettingLocation || locationPermission === 'denied'}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGettingLocation ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Getting Location...
            </>
          ) : (
            <>
              <FiNavigation />
              Use My Current Location
            </>
          )}
        </button>

        <button
          type="button"
          onClick={getCoordinatesFromAddress}
          disabled={!formData.city || !formData.state || !formData.country || isGettingLocation}
          className="flex items-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiMapPin />
          Get from Address
        </button>
      </div>

      {locationError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{locationError}</p>
        </div>
      )}

      {formData.latitude && formData.longitude && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm flex items-center gap-2">
            <FiCheckCircle />
            Coordinates set: {formData.latitude}, {formData.longitude}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            These coordinates will be used for job location mapping.
          </p>
        </div>
      )}

      {locationPermission === 'denied' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700 text-sm">
            Location access is denied. Please enable location access in your browser settings to use automatic location detection.
          </p>
        </div>
      )}
    </div>
  );
};

export default LocationCoordinatesInput;
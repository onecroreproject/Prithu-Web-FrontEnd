import React from "react";
import { MapPin, Navigation, X, Target, ChevronDown } from "lucide-react";

const CurrentLocation = ({
  locationLoading,
  locationError,
  userLocation,
  selectedCountry,
  selectedState,
  selectedCity,
  distanceRadius,
  getUserLocation,
  clearLocationSearch
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">Current Location</h3>
        </div>
        
        {userLocation && (
          <button
            onClick={clearLocationSearch}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {!userLocation ? (
        <button
          onClick={getUserLocation}
          disabled={locationLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all flex items-center justify-center gap-2 font-medium"
        >
          {locationLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              <span>Detecting Location...</span>
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              <span>Use My Current Location</span>
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {selectedCountry && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {selectedCountry}
              </span>
            )}
            {selectedState && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
                {selectedState}
              </span>
            )}
            {selectedCity && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {selectedCity}
              </span>
            )}
            {distanceRadius && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                <Navigation className="w-3 h-3" />
                {distanceRadius} km radius
              </span>
            )}
          </div>
        </div>
      )}
      
      {locationError && (
        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-md">
          <p className="text-red-600 text-sm">{locationError}</p>
        </div>
      )}
    </div>
  );
};

export default CurrentLocation;
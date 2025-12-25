import React, { useState, useEffect } from "react";
import { FiMapPin, FiX, FiAlertCircle, FiCheckCircle, FiClock, FiHelpCircle } from "react-icons/fi";

const LocationRequestModal = ({
  showLocationModal,
  setShowLocationModal,
  isGettingLocation,
  locationError,
  locationPermission,
  pendingAction,
  handleLocationModalGetLocation,
  handleLocationModalSkip
}) => {
  const [showTips, setShowTips] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (showLocationModal) {
      setRetryCount(0);
    }
  }, [showLocationModal]);

  if (!showLocationModal) return null;

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    handleLocationModalGetLocation();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-fadeIn">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isGettingLocation ? 'bg-blue-100 text-blue-600' : locationError ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                {isGettingLocation ? <FiClock className="animate-pulse" /> : 
                 locationError ? <FiAlertCircle /> : <FiMapPin />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {isGettingLocation ? 'Getting Your Location' : 
                   locationError ? 'Location Access Needed' : 
                   'Enable Location Access'}
                </h3>
                <p className="text-sm text-gray-600">
                  {isGettingLocation ? 'Waiting for your response...' : 
                   'Required for better job matching'}
                </p>
              </div>
            </div>
            <button
              onClick={() => !isGettingLocation && setShowLocationModal(false)}
              disabled={isGettingLocation}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              <FiX />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            {isGettingLocation ? (
              <div className="text-center py-6">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 border-4 border-blue-100 rounded-full flex items-center justify-center animate-pulse">
                    <FiMapPin className="text-blue-600 text-3xl" />
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-800 font-medium">
                    Waiting for your response...
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm font-medium mb-2">What to do:</p>
                    <ul className="text-blue-700 text-sm space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                        <span>Look for the browser permission popup</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                        <span>Click <strong className="text-green-600">"Allow"</strong> or <strong className="text-green-600">"Grant"</strong></span>
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                        <span>Wait for location to be captured</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1 mx-auto"
                  >
                    <FiHelpCircle />
                    Can't see the permission popup?
                  </button>

                  {showTips && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-fadeIn">
                      <p className="text-gray-700 text-sm mb-2 font-medium">The permission popup might be:</p>
                      <ul className="text-gray-600 text-sm space-y-1">
                        <li>• In your browser's address bar (look for 🌐 or 🔒 icon)</li>
                        <li>• Blocked by a popup blocker (disable temporarily)</li>
                        <li>• Already denied previously (check browser settings)</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                {/* Benefits */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-blue-900 font-medium mb-2">Why enable location?</p>
                      <ul className="text-blue-800 text-sm space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>Jobs appear 3x more in local searches</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>Better matching with nearby candidates</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 mt-1">•</span>
                          <span>Automatic distance calculations</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Error Display */}
                {locationError && (
                  <div className="mb-4">
                    <div className={`p-4 rounded-lg ${retryCount > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-start gap-3">
                        <FiAlertCircle className={`mt-0.5 flex-shrink-0 ${retryCount > 0 ? 'text-yellow-600' : 'text-red-600'}`} />
                        <div className="flex-1">
                          <p className={`font-medium mb-1 ${retryCount > 0 ? 'text-yellow-800' : 'text-red-800'}`}>
                            {retryCount > 0 ? 'Still having issues?' : 'Unable to get location'}
                          </p>
                          <p className={`text-sm whitespace-pre-line ${retryCount > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                            {locationError}
                          </p>
                          {retryCount > 0 && (
                            <div className="mt-3">
                              <p className="text-yellow-800 text-sm font-medium mb-2">Quick browser-specific help:</p>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                <div className="bg-yellow-100 p-2 rounded">
                                  <p className="font-medium">Chrome</p>
                                  <p className="text-yellow-700">Click 🔒 in address bar → Site settings → Location → Allow</p>
                                </div>
                                <div className="bg-yellow-100 p-2 rounded">
                                  <p className="font-medium">Firefox</p>
                                  <p className="text-yellow-700">Click 🌐 in address bar → Permissions → Location → Allow</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          {!isGettingLocation && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <button
                  onClick={handleRetry}
                  disabled={isGettingLocation}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FiMapPin />
                  {retryCount > 0 ? 'Try Again' : 'Get My Location'}
                </button>
                
                <button
                  onClick={handleLocationModalSkip}
                  disabled={isGettingLocation}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Skip
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  We only request location once. Your data is never shared.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add CSS animation
const styles = `
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
`;

// Add to your component
export default LocationRequestModal;
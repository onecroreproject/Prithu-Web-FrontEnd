import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Home, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FollowModal = ({ 
  isOpen, 
  onClose, 
  profileOwnerName, 
  profileOwnerAvatar,
  onFollow,
  followingLoading,
  isOwnProfile 
}) => {
  const navigate = useNavigate();

  if (!isOpen || isOwnProfile) return null;

  const handleSkip = () => {
    navigate("/home");
    onClose();
  };

  const handleClose = () => {
    navigate("/home");
    onClose();
  };

  const handleFollowAndStay = async () => {
    try {
      await onFollow();
      // Modal will close automatically via onFollow's setShowFollowModal(false)
    } catch (error) {
      console.error("Error in follow action:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xs bg-white rounded-xl shadow-lg border border-gray-200"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-5">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden">
                    {profileOwnerAvatar ? (
                      <img 
                        src={profileOwnerAvatar} 
                        alt={profileOwnerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600">
                          {profileOwnerName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                    <Eye className="w-3 h-3 text-white" />
                  </div>
                </div>
              </div>

              {/* Text */}
              <h3 className="text-center font-semibold text-gray-900 mb-1">
                Unlock {profileOwnerName?.split(' ')[0] || "User"}'s Profile
              </h3>
              <p className="text-center text-sm text-gray-500 mb-5">
                Follow to view their posts, activity, and connect with them
              </p>

              {/* Follow Button - User stays on page */}
              <button
                onClick={handleFollowAndStay}
                disabled={followingLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-sm hover:shadow"
              >
                {followingLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Following...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow & View Profile</span>
                  </>
                )}
              </button>

              {/* Go to Home Button */}
              <button
                onClick={handleSkip}
                className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg font-medium flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home Instead</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FollowModal;

// ✅ src/components/Profile/EditProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useUserProfile } from "../../../hook/userProfile";
import { updateProfileDetails } from "../../../Service/profileService";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import debounce from "lodash.debounce";
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Save, X, User, Phone, MapPin, Calendar, Link2, Lock, Users } from "lucide-react";
 
export default function EditProfile({ id, visibility }) {
  const { token } = useAuth();
  const { data: user, isLoading: profileLoading, refetch } = useUserProfile(token, id);
  const currentUser = localStorage.getItem("userId");
  const [isEditing, setIsEditing] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showMaritalDate, setShowMaritalDate] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStatusLoading, setFollowStatusLoading] = useState(false);
 
  const [formData, setFormData] = useState({
    userName: "",
    name: "",
    lastName: "",
    bio: "",
    profileSummary: "",
    gender: "Male",
    maritalStatus: "Single",
    dateOfBirth: null,
    maritalDate: null,
    address: "",
    city: "",
    country: "",
    phoneNumber: "",
    whatsAppNumber: "",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      github: "",
      youtube: "",
      website: "",
    },
  });
 
  const initialDataRef = useRef(JSON.stringify(formData));
 
  // 🧩 Check if current user is following the profile user
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!id || !currentUser || id === String(currentUser)) return;
 
      try {
        setFollowStatusLoading(true);
        const response = await api.post(
          "/api/check/follow/status",
          {
            creatorId: id,
            followerId: String(currentUser)
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsFollowing(Boolean(response.data?.isFollowing));
      } catch (err) {
        console.error("Error checking follow status:", err);
      } finally {
        setFollowStatusLoading(false);
      }
    };
 
    checkFollowStatus();
  }, [id, currentUser, token]);
 
  // 🧩 Prefill user data
  useEffect(() => {
    if (!user) return;
    const updated = {
      userName: user.userName || "",
      name: user.name || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      profileSummary: user.profileSummary || "",
      gender: user.gender || "Male",
      maritalStatus: user.maritalStatus || "Single",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      maritalDate: user.maritalDate ? new Date(user.maritalDate) : null,
      address: user.address || "",
      city: user.city || "",
      country: user.country || "",
      phoneNumber: user.phoneNumber || "",
      whatsAppNumber: user.whatsAppNumber || "",
      socialLinks: {
        facebook: user.socialLinks?.facebook || "",
        instagram: user.socialLinks?.instagram || "",
        twitter: user.socialLinks?.twitter || "",
        linkedin: user.socialLinks?.linkedin || "",
        github: user.socialLinks?.github || "",
        youtube: user.socialLinks?.youtube || "",
        website: user.socialLinks?.website || "",
      },
    };
    setFormData(updated);
    setShowMaritalDate(updated.maritalStatus === "Married");
    initialDataRef.current = JSON.stringify(updated);
  }, [user]);
 
  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(formData) !== initialDataRef.current);
  }, [formData]);
 
  // ✅ Debounced username check
  const checkUsername = useRef(
    debounce(async (username) => {
      if (!username.trim()) {
        setUsernameStatus(null);
        return;
      }
      try {
        const { data } = await api.get(
          `/api/check/username/availability?username=${encodeURIComponent(username)}`
        );
        setUsernameStatus(data);
      } catch (err) {
        console.error("❌ Username check failed:", err);
      }
    }, 600)
  ).current;
 
  // 🔧 Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "userName") checkUsername(value);
  };
 
  const handleMaritalStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, maritalStatus: value }));
   
    if (value === "Married") {
      setShowMaritalDate(true);
    } else {
      setShowMaritalDate(false);
      setFormData((prev) => ({ ...prev, maritalDate: null }));
    }
  };
 
  const handlePhoneChange = (field, value) => {
    if (/^\d{0,10}$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };
 
  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };
 
  // ✅ Mutation for update
  const mutation = useMutation({
    mutationFn: (payload) => updateProfileDetails(payload, token),
    onSuccess: async () => {
      toast.success("✅ Profile updated successfully!");
      await refetch();
      setIsEditing(false);
      initialDataRef.current = JSON.stringify(formData);
      setHasUnsavedChanges(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Failed to update profile"),
  });
 
  const handleSave = (e) => {
    e.preventDefault();
    const payload = new FormData();
 
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "socialLinks") {
        payload.append("socialLinks", JSON.stringify(value));
      } else if (value != null) {
        payload.append(
          key,
          value instanceof Date ? value.toISOString().split("T")[0] : value
        );
      }
    });
 
    mutation.mutate(payload);
  };
 
  const handleCancel = () => {
    setFormData(JSON.parse(initialDataRef.current));
    setIsEditing(false);
    setHasUnsavedChanges(false);
    setShowMaritalDate(JSON.parse(initialDataRef.current).maritalStatus === "Married");
  };
 
  // 🔥 If id exists (viewing another user's profile), show view-only mode with visibility checks
  if (id) {
    return (
      <ProfileDetailsView
        user={user}
        visibility={visibility}
        currentUserId={String(currentUser)}
        isFollowing={isFollowing}
      />
    );
  }
 
  if (profileLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl w-full max-w-6xl mx-auto"
    >
      {/* Header Section */}
      <div className="bg-blue-50 rounded-t-xl p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {isEditing ? "Edit Profile" : "Profile Details"}
              </h2>
              <p className="text-gray-600 text-xs mt-1">
                {isEditing ? "Update your personal information" : "View and manage your profile"}
              </p>
            </div>
          </div>
 
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm w-full sm:w-auto"
            >
              <Edit3 className="w-3 h-3" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-xs sm:text-sm w-1/2 sm:w-auto"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={mutation.isLoading || !hasUnsavedChanges}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm w-1/2 sm:w-auto ${
                  mutation.isLoading || !hasUnsavedChanges
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Save className="w-3 h-3" />
                {mutation.isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>
 
      <form id="profile-form" className="p-3 sm:p-4 space-y-4 sm:space-y-6" onSubmit={handleSave}>
        {/* Personal Information Section */}
        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <InputField
              label="First Name"
              value={formData.name}
              onChange={(v) => handleChange("name", v)}
              disabled={!isEditing}
              icon={User}
            />
            <InputField
              label="Last Name"
              value={formData.lastName}
              onChange={(v) => handleChange("lastName", v)}
              disabled={!isEditing}
              icon={User}
            />
          </div>
         
          <InputField
            label="Username"
            value={formData.userName}
            onChange={(v) => handleChange("userName", v)}
            disabled={!isEditing}
            icon={User}
          />
         
          <AnimatePresence>
            {isEditing && usernameStatus && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-xs font-medium ${
                  usernameStatus.available ? "text-green-600" : "text-red-600"
                }`}
              >
                {usernameStatus.message}
              </motion.p>
            )}
          </AnimatePresence>
        </Section>
 
        {/* Contact Information Section */}
        <Section title="Contact Information" icon={Phone}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <InputField
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(v) => handlePhoneChange("phoneNumber", v)}
              disabled={!isEditing}
              icon={Phone}
              type="tel"
            />
            <InputField
              label="WhatsApp Number"
              value={formData.whatsAppNumber}
              onChange={(v) => handlePhoneChange("whatsAppNumber", v)}
              disabled={!isEditing}
              icon={Phone}
              type="tel"
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <SelectField
              label="Gender"
              options={["Male", "Female", "Other"]}
              value={formData.gender}
              onChange={(v) => handleChange("gender", v)}
              disabled={!isEditing}
            />
            <SelectField
              label="Marital Status"
              options={["Single", "Married", "Divorced", "Widowed"]}
              value={formData.maritalStatus}
              onChange={handleMaritalStatusChange}
              disabled={!isEditing}
            />
          </div>
        </Section>
 
        {/* Location Information */}
        <Section title="Location" icon={MapPin}>
          <TextArea
            label="Address"
            value={formData.address}
            onChange={(v) => handleChange("address", v)}
            disabled={!isEditing}
            icon={MapPin}
            rows={2}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            <InputField
              label="City"
              value={formData.city}
              onChange={(v) => handleChange("city", v)}
              disabled={!isEditing}
              icon={MapPin}
            />
            <InputField
              label="Country"
              value={formData.country}
              onChange={(v) => handleChange("country", v)}
              disabled={!isEditing}
              icon={MapPin}
            />
          </div>
        </Section>
 
        {/* Date of Birth Section */}
        <Section title="Important Dates" icon={Calendar}>
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            <DateField
              label="Date of Birth"
              value={formData.dateOfBirth}
              onChange={(date) => handleChange("dateOfBirth", date)}
              disabled={!isEditing}
            />
            <AnimatePresence>
              {showMaritalDate && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DateField
                    label="Marriage Date"
                    value={formData.maritalDate}
                    onChange={(date) => handleChange("maritalDate", date)}
                    disabled={!isEditing}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Section>
 
        {/* About Section */}
        <Section title="About You" icon={User}>
          <TextArea
            label="Personal Bio"
            value={formData.bio}
            onChange={(v) => handleChange("bio", v)}
            disabled={!isEditing}
            rows={3}
          />
          <TextArea
            label="Profile Summary"
            value={formData.profileSummary}
            onChange={(v) => handleChange("profileSummary", v)}
            disabled={!isEditing}
            rows={3}
          />
        </Section>
 
        {/* Social Links Section */}
        <Section title="Professional Links" icon={Link2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            {Object.keys(formData.socialLinks).map((platform) => (
              <InputField
                key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                value={formData.socialLinks[platform]}
                onChange={(v) => handleSocialChange(platform, v)}
                disabled={!isEditing}
                icon={Link2}
              />
            ))}
          </div>
        </Section>
      </form>
    </motion.div>
  );
}
 
/* 🔥 Profile Details View Component with Visibility Checks */
function ProfileDetailsView({ user, visibility = {}, currentUserId, isFollowing }) {
  if (!user) return null;
 
  // helper: compare current user id with profile owner id
  const isViewingOwnProfile = () => {
    const profileOwnerId = user.userId ? String(user.userId) : String(user._id || "");
    return Boolean(currentUserId) && String(currentUserId) === profileOwnerId;
  };
 
  // 🛡️ Visibility Check Functions
  const isFieldVisible = (fieldName, fieldVisibility) => {
    // If viewing own profile, show everything
    if (isViewingOwnProfile()) return true;
 
    // If visibility config missing, default to public
    const rule = fieldVisibility ?? "public";
 
    switch (rule) {
      case "public":
        return true;
      case "private":
        return false;
      case "followers":
        return Boolean(isFollowing);
      default:
        return true;
    }
  };
 
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
 
  // Check which sections have visible content
  const hasBasicInfo =
    (isFieldVisible("name", visibility?.name) && (user.name || user.lastName)) ||
    (isFieldVisible("userName", visibility?.userName) && user.userName) ||
    (isFieldVisible("bio", visibility?.bio) && user.bio) ||
    (isFieldVisible("profileSummary", visibility?.profileSummary) && user.profileSummary);
 
  const hasContactInfo =
    (isFieldVisible("phoneNumber", visibility?.phoneNumber) && user.phoneNumber) ||
    (isFieldVisible("whatsAppNumber", visibility?.whatsAppNumber) && user.whatsAppNumber);
 
  const hasLocationInfo =
    (isFieldVisible("address", visibility?.address) && user.address) ||
    (isFieldVisible("city", visibility?.city) && user.city) ||
    (isFieldVisible("country", visibility?.country) && user.country);
 
  const hasDateInfo =
    (isFieldVisible("dateOfBirth", visibility?.dateOfBirth) && user.dateOfBirth) ||
    (isFieldVisible("maritalStatus", visibility?.maritalStatus) && user.maritalStatus) ||
    (isFieldVisible("maritalDate", visibility?.maritalDate) && user.maritalDate);
 
  // Filter social links based on visibility
  const visibleSocialLinks = user.socialLinks
    ? Object.entries(user.socialLinks)
        .filter(([platform, value]) => {
          const platformVisibility = visibility?.socialLinks?.[platform] ?? "public";
          return value && isFieldVisible(platform, platformVisibility);
        })
        .map(([platform, value]) => ({ platform, value }))
    : [];
 
  const hasSocialLinks = visibleSocialLinks.length > 0;
 
  // 🔒 Privacy Notice Component
  const PrivacyNotice = ({ fieldName }) => (
    <div className="flex items-center gap-2 text-gray-400 text-xs">
      <Lock className="w-3 h-3" />
      <span>This information is set to private</span>
    </div>
  );
 
  // 👥 Followers Only Notice
  const FollowersOnlyNotice = () => (
    <div className="flex items-center gap-2 text-gray-400 text-xs">
      <Users className="w-3 h-3" />
      <span>Follow to view this information</span>
    </div>
  );
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl w-full max-w-6xl mx-auto"
    >
      {/* Header Section */}
      <div className="bg-blue-50 rounded-t-xl p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Profile Details
            </h2>
            <p className="text-gray-600 text-xs mt-1">
              View profile information
            </p>
          </div>
        </div>
      </div>
 
      <div className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Basic Information */}
        {hasBasicInfo && (
          <Section title="About" icon={User}>
            <div className="space-y-3">
              {isFieldVisible("name", visibility?.name) && (user.name || user.lastName) && (
                <div className="flex items-start">
                  <User className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Full Name</p>
                    <p className="text-gray-900 text-sm font-medium">{user.name} {user.lastName}</p>
                  </div>
                </div>
              )}
                            {isFieldVisible("userName", visibility?.userName) && user.userName && (
                <div className="flex items-start">
                  <User className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">Username</p>
                    <p className="text-gray-900 text-sm font-medium">@{user.userName}</p>
                  </div>
                </div>
              )}
 
              {user.bio ? (
                isFieldVisible("bio", visibility?.bio) ? (
                  <div className="flex items-start">
                    <User className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Bio</p>
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">{user.bio}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="bio" />
                )
              ) : null}
 
              {user.profileSummary ? (
                isFieldVisible("profileSummary", visibility?.profileSummary) ? (
                  <div className="flex items-start">
                    <User className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Profile Summary</p>
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">{user.profileSummary}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="profileSummary" />
                )
              ) : null}
            </div>
          </Section>
        )}
 
        {/* Contact Information */}
        {hasContactInfo && (
          <Section title="Contact Information" icon={Phone}>
            <div className="space-y-3">
              {user.phoneNumber ? (
                isFieldVisible("phoneNumber", visibility?.phoneNumber) ? (
                  <div className="flex items-start">
                    <Phone className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Phone</p>
                      <p className="text-gray-900 text-sm font-medium">{user.phoneNumber}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="phoneNumber" />
                )
              ) : null}
 
              {user.whatsAppNumber ? (
                isFieldVisible("whatsAppNumber", visibility?.whatsAppNumber) ? (
                  <div className="flex items-start">
                    <Phone className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">WhatsApp</p>
                      <p className="text-gray-900 text-sm font-medium">{user.whatsAppNumber}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="whatsAppNumber" />
                )
              ) : null}
            </div>
          </Section>
        )}
 
        {/* Location Information */}
        {hasLocationInfo && (
          <Section title="Location" icon={MapPin}>
            <div className="space-y-3">
              {user.address ? (
                isFieldVisible("address", visibility?.address) ? (
                  <div className="flex items-start">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Address</p>
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">{user.address}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="address" />
                )
              ) : null}
 
              {user.city ? (
                isFieldVisible("city", visibility?.city) ? (
                  <div className="flex items-start">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">City</p>
                      <p className="text-gray-900 text-sm">{user.city}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="city" />
                )
              ) : null}
 
              {user.country ? (
                isFieldVisible("country", visibility?.country) ? (
                  <div className="flex items-start">
                    <MapPin className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Country</p>
                      <p className="text-gray-900 text-sm">{user.country}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="country" />
                )
              ) : null}
            </div>
          </Section>
        )}
 
        {/* Important Dates */}
        {hasDateInfo && (
          <Section title="Life Events" icon={Calendar}>
            <div className="space-y-3">
              {user.dateOfBirth ? (
                isFieldVisible("dateOfBirth", visibility?.dateOfBirth) ? (
                  <div className="flex items-start">
                    <Calendar className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Date of Birth</p>
                      <p className="text-gray-900 text-sm">{formatDate(user.dateOfBirth)}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="dateOfBirth" />
                )
              ) : null}
 
              {user.maritalStatus ? (
                isFieldVisible("maritalStatus", visibility?.maritalStatus) ? (
                  <div className="flex items-start">
                    <User className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Marital Status</p>
                      <p className="text-gray-900 text-sm">{user.maritalStatus}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="maritalStatus" />
                )
              ) : null}
 
              {user.maritalDate ? (
                isFieldVisible("maritalDate", visibility?.maritalDate) ? (
                  <div className="flex items-start">
                    <Calendar className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-600">Marriage Date</p>
                      <p className="text-gray-900 text-sm">{formatDate(user.maritalDate)}</p>
                    </div>
                  </div>
                ) : (
                  <PrivacyNotice fieldName="maritalDate" />
                )
              ) : null}
            </div>
          </Section>
        )}
 
        {/* Social Links */}
        {hasSocialLinks && (
          <Section title="Social Media" icon={Link2}>
            <div className="space-y-2">
              {visibleSocialLinks.map(({ platform, value }) => (
                <div key={platform} className="flex items-start">
                  <Link2 className="w-3 h-3 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600 capitalize">{platform}</p>
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all text-sm"
                    >
                      {value}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}
 
        {/* Empty State */}
        {!hasBasicInfo && !hasContactInfo && !hasLocationInfo && !hasDateInfo && !hasSocialLinks && (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No profile information</h3>
            <p className="text-gray-500 text-xs">This user hasn't added any profile details yet.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
 
/* ✅ Reusable Section Component */
function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-3 h-3 text-blue-600" />
        </div>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {children}
      </div>
    </div>
  );
}
 
/* ✅ Reusable Input Components */
function InputField({ label, value, onChange, disabled, icon: Icon, type = "text" }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
            <Icon className="w-3 h-3 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full p-2 rounded-lg transition-colors duration-200 text-xs ${
            Icon ? "pl-8" : ""
          } ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }`}
        />
      </div>
    </div>
  );
}
 
function TextArea({ label, value, onChange, disabled, icon: Icon, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-2 top-2">
            <Icon className="w-3 h-3 text-gray-400" />
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          disabled={disabled}
          className={`w-full p-2 rounded-lg transition-colors duration-200 text-xs ${
            Icon ? "pl-8" : ""
          } ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }`}
        />
      </div>
    </div>
  );
}
 
function SelectField({ label, options, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-2 rounded-lg transition-colors duration-200 text-xs ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
 
function DateField({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        maxDate={new Date()}
        showYearDropdown
        disabled={disabled}
        className={`w-full p-2 rounded-lg transition-colors duration-200 text-xs ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white border border-gray-300 hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      />
    </div>
  );
}
 
 
 
 
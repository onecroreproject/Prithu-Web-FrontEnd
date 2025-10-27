import React, { useState, useEffect } from "react"; // <-- added useEffect
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

const EditProfilePage = () => {
  const { user, updateUserProfile, fetchUserProfile, loading } = useAuth(); // <-- added fetchUserProfile
  const navigate = useNavigate();

  const [profileAvatar, setProfileAvatar] = useState(user?.profileAvatar || "");
  const [name, setName] = useState(user?.displayName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [maritalStatus, setMaritalStatus] = useState(user?.maritalStatus || "Single");
  const [dob, setDob] = useState(user?.dob ? new Date(user.dob) : null);
  const [age, setAge] = useState(user?.dob ? calculateAge(new Date(user.dob)) : "");
  const [language, setLanguage] = useState(user?.language || "English");

  // <-- Sync local state whenever user changes
  useEffect(() => {
    if (user) {
      setProfileAvatar(user.profileAvatar || "");
      setName(user.displayName || "");
      setUsername(user.username || "");
      setBio(user.bio || "");
      setPhone(user.phone || "");
      setMaritalStatus(user.maritalStatus || "Single");
      setDob(user.dob ? new Date(user.dob) : null);
      setAge(user.dob ? calculateAge(new Date(user.dob)) : "");
      setLanguage(user.language || "English");
    }
  }, [user]);

  function calculateAge(date) {
    const today = new Date();
    let calculatedAge = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  }

  const handleDobChange = (date) => {
    setDob(date);
    setAge(date ? calculateAge(date) : "");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileAvatar(file); // Store File for backend upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result); // Preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const updatedProfile = {
      profileAvatar: profileAvatar instanceof File ? profileAvatar : null,
      displayName: name,
      username,
      bio,
      phone,
      maritalStatus,
      dob,
      language,
    };

    try {
      await updateUserProfile(updatedProfile);
      await fetchUserProfile(); // <-- re-fetch user to get updated data immediately
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (err) {
      toast.error("Failed to save profile ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 relative">
        <button
          onClick={() => navigate("/profile")}
          className="absolute top-4 left-4 text-gray-600 hover:text-gray-800"
        >
          <FaArrowLeft size={20} />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Profile</h2>

        {/* Avatar Upload */}
        <div className="flex flex-col items-center mb-6">
          <div
            className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-300 mb-2 cursor-pointer transition-transform transform hover:scale-105 shadow-sm hover:shadow-md"
            onClick={() => document.getElementById("avatarInput").click()}
          >
            <img
              src={typeof profileAvatar === "string" ? profileAvatar : URL.createObjectURL(profileAvatar)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <input
            type="file"
            id="avatarInput"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Phone */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Marital Status */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Marital Status</label>
          <select
            value={maritalStatus}
            onChange={(e) => setMaritalStatus(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </div>

        {/* DOB and Age */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Date of Birth</label>
          <DatePicker
            selected={dob}
            onChange={handleDobChange}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            showYearDropdown
            scrollableYearDropdown
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholderText="Select your DOB"
          />
          {dob && <p className="text-gray-500 mt-1">Age: {age} years</p>}
        </div>

        {/* Language */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-1">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="English">English</option>
            <option value="Tamil">Tamil</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`w-full py-3 text-white font-semibold rounded-lg transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default EditProfilePage;

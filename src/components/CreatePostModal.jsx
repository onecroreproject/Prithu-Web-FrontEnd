import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeftSidebarButtons from "../components/createPostModelComponets/leftSidebarButtons";
import MediaUploader from "../components/createPostModelComponets/mediaUploader";
import GifSelector from "../components/createPostModelComponets/gifSelector";
import LocationInput from "../components/createPostModelComponets/locationInput";
import TagFriends from "../components/createPostModelComponets/tagFriends";
import { uploadCreatorFeed } from "../API_Services/postServices";
import { toast } from "react-hot-toast";
import api from "../api/axios";

export default function CreatePostModal({ open, onClose }) {
  const [postText, setPostText] = useState("");
  const [selectedBtn, setSelectedBtn] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [location, setLocation] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [language, setLanguage] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  // 🟢 Fetch categories
  useEffect(() => {
    if (!open) return;
    const fetchCategories = async () => {
      try {
        const res = await api.get(`api/user/get/all/category`);
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, [open]);

  // 🟢 Handle file upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const fileType = selectedFile.type.startsWith("video") ? "video" : "image";
    if (files.length > 0 && files[0].type !== fileType) {
      toast.error("Upload only one type (image or video)");
      return;
    }

    setType(fileType);
    const newFile = {
      file: selectedFile,
      preview: URL.createObjectURL(selectedFile),
      name: selectedFile.name,
      type: selectedFile.type,
    };
    setFiles([newFile]);
  };

  const handleRemoveFile = (index) => {
    URL.revokeObjectURL(files[index]?.preview);
    setFiles([]);
    setType("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange({ target: { files: [file] } });
  };

  // 🟢 Publish or Schedule feed
  const publish = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return toast.error("Please login first");

      setLoading(true);
      const formData = {
        dec: postText,
        files,
        language,
        categoryId,
        type,
        scheduleDate: isScheduled ? scheduleDate : null,
      };

      const res = await uploadCreatorFeed(formData, token);
      toast.success(res.message || "Feed uploaded successfully");
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      {/* 🟣 Overlay */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 pb-2 px-0"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-blue-700 font-bold"
            onClick={onClose}
          >
            ×
          </button>

          <div className="text-center mt-6 mb-4 text-2xl font-semibold text-blue-500">
            + Create New Post
          </div>

          <div className="flex gap-5 px-6 pb-6">
            <LeftSidebarButtons
              selectedBtn={selectedBtn}
              onSelect={setSelectedBtn}
            />

            <div className="flex-1 flex flex-col">
              {/* 📝 Post Text */}
              <textarea
                className="w-full border rounded-md px-3 py-2 text-base min-h-[70px] focus:outline-none"
                placeholder="What's on your mind?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={3}
              />

              <AnimatePresence>
                {selectedBtn === "media" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* 🔹 Dropdowns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select Language</option>
                        <option value="tamil">Tamil</option>
                        <option value="english">English</option>
                        <option value="hindi">Hindi</option>
                      </select>

                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.categoryName}
                          </option>
                        ))}
                      </select>

                      {/* 🕓 Schedule Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 text-sm">Schedule</span>
                        <div
                          onClick={() => setIsScheduled(!isScheduled)}
                          className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-all ${
                            isScheduled
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        >
                          <motion.div
                            className="bg-white w-4 h-4 rounded-full shadow-md"
                            layout
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* 📅 Schedule Picker */}
                    <AnimatePresence>
                      {isScheduled && (
                        <motion.div
                          className="flex flex-col mt-3"
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <label className="text-sm text-gray-600 mb-1">
                            Select Schedule Date & Time
                          </label>
                          <input
                            type="datetime-local"
                            className="border border-gray-300 rounded px-2 py-1 text-sm"
                            value={scheduleDate}
                            onChange={(e) => setScheduleDate(e.target.value)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 📤 Media Upload Section */}
                    <MediaUploader
                      files={files}
                      fileRef={fileRef}
                      onFilesChange={handleFileChange}
                      onDropFiles={handleDrop}
                      onRemoveFile={handleRemoveFile}
                      type={type}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 🟢 Other Tabs */}
              {selectedBtn === "gif" && (
                <GifSelector
                  selectedGif={selectedGif}
                  setSelectedGif={setSelectedGif}
                />
              )}

              {selectedBtn === "location" && (
                <LocationInput location={location} setLocation={setLocation} />
              )}

              {selectedBtn === "tag" && (
                <TagFriends
                  taggedFriends={taggedFriends}
                  setTaggedFriends={setTaggedFriends}
                />
              )}

              {/* 🟢 Publish Button */}
              <button
                className="w-full bg-[#26Aeee] hover:bg-blue-600 text-white font-medium text-lg rounded-md py-2.5 mt-5 transition-all"
                onClick={publish}
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

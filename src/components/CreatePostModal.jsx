import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LeftSidebarButtons from "./createPostModelComponets/leftSidebarButtons";
import MediaUploader from "./createPostModelComponets/mediaUploader";
import GifSelector from "./createPostModelComponets/gifSelector";
import LocationInput from "./createPostModelComponets/locationInput";
import TagFriends from "./createPostModelComponets/tagFriends";
import EmojiPicker from "./EmojiPicker";
import { uploadCreatorFeed } from "../API_Services/postServices";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreatePostModal({ open, onClose }) {
  const [postText, setPostText] = useState("");
  const [selectedBtn, setSelectedBtn] = useState("media");
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
  const navigate=useNavigate();
  const fileRef = useRef(null);
  const textareaRef = useRef(null);

  /* --------------------------------------------
      RESET — runs only when modal closes
  --------------------------------------------- */
  const resetAll = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));

    setPostText("");
    setSelectedBtn("media");
    setFiles([]);
    setSelectedGif(null);
    setLocation("");
    setTaggedFriends([]);
    setLanguage("");
    setCategoryId("");
    setScheduleDate("");
    setIsScheduled(false);
    setType("");
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  /* ------------------------------------------------------
      SET DEFAULT TAB WHEN MODAL OPENS
  ------------------------------------------------------- */
  useEffect(() => {
    if (open) {
      setSelectedBtn("media");
    }
  }, [open]);

  /* ------------------------------------------------------
      FETCH CATEGORIES
  ------------------------------------------------------- */
  useEffect(() => {
    if (!open) return;

    const fetchCategories = async () => {
      try {
        const res = await api.get(`api/user/get/all/category`);
        setCategories(res.data.categories || []);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, [open]);

  /* ------------------------------------------------------
      FILE HANDLING
  ------------------------------------------------------- */
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
      mime: selectedFile.type,
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
    if (file)
      handleFileChange({
        target: { files: [file] },
      });
  };

  /* ------------------------------------------------------
      VALIDATION FUNCTION
  ------------------------------------------------------- */
  const validatePost = () => {
    if (files.length === 0) {
      toast.error("Please select a file (image or video) to publish");
      return false;
    }

    if (!categoryId) {
      toast.error("Please select a category");
      return false;
    }

    return true;
  };

  /* ------------------------------------------------------
      PUBLISH / SCHEDULE
  ------------------------------------------------------- */
  const publish = async () => {
    try {
      // Validation check
       if (!validatePost()) return;

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
      navigate("/")
      resetAll();
      onClose?.();
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------
      ENHANCED VALIDATION FOR PUBLISH BUTTON
  ------------------------------------------------------- */
  const isPublishDisabled = () => {
    return files.length === 0 || !categoryId || loading;
  };

  if (!open) return null;

  /* ------------------------------------------------------
      UI RENDER
  ------------------------------------------------------- */
  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 pb-2 px-0"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-blue-700 font-bold"
            onClick={handleClose}
          >
            ×
          </button>

          <div className="text-center mt-6 mb-4 text-2xl font-semibold text-blue-500">
            What's on your mind
          </div>

          <div className="flex gap-5 px-6 pb-6">
            {/* Left Sidebar Buttons */}
            {/* <LeftSidebarButtons
              selectedBtn={selectedBtn}
              setSelectedBtn={setSelectedBtn}
            /> */}

            <div className="flex-1 flex flex-col">
              {/* text with emoji picker */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  className="w-full border rounded-md px-3 py-2 text-base min-h-[70px] focus:outline-none pr-12"
                  placeholder="What's on your mind? play with #"
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  rows={3}
                />
                <div className="absolute bottom-2 right-2">
                  <EmojiPicker
                    onEmojiSelect={(emoji) => {
                      const textarea = textareaRef.current;
                      if (!textarea) return;

                      const cursorPos = textarea.selectionStart;
                      const textBefore = postText.substring(0, cursorPos);
                      const textAfter = postText.substring(cursorPos);
                      setPostText(textBefore + emoji + textAfter);

                      setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = cursorPos + emoji.length;
                        textarea.focus();
                      }, 0);
                    }}
                  />
                </div>
              </div>

              {/* Validation Messages */}
              <AnimatePresence>
                {(files.length === 0 || !categoryId) && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                  
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Media Section */}
              <AnimatePresence>
                {selectedBtn === "media" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Dropdowns */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                      <div className="relative">
                        <select
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className={`w-full border rounded px-2 py-1 text-sm border-gray-300'}`}
                        >
                          <option value="">Select Category *</option>
                          {categories.map((cat) => (
                            <option key={cat.categoryId} value={cat.categoryId}>
                              {cat.categoryName}
                            </option>
                          ))}
                        </select>
                        
                      </div>

                      {/* Schedule Toggle */}
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 text-sm">Schedule</span>
                        <div
                          onClick={() => setIsScheduled(!isScheduled)}
                          className={`w-12 h-6 flex items-center rounded-full cursor-pointer p-1 transition-all ${isScheduled ? "bg-blue-500" : "bg-gray-300"
                            }`}
                        >
                          <motion.div
                            className="bg-white w-4 h-4 rounded-full shadow-md"
                            layout
                          />
                        </div>
                      </div>
                    </div>

                    {/* Schedule Picker */}
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

                    {/* Media Uploader */}
                    <MediaUploader
                      files={files}
                      fileRef={fileRef}
                      onFilesChange={handleFileChange}
                      onDropFiles={handleDrop}
                      onRemoveFile={handleRemoveFile}
                      type={type}
                      required={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Other Tabs */}
              {selectedBtn === "gif" && (
                <GifSelector
                  selectedGif={selectedGif}
                  setSelectedGif={setSelectedGif}
                />
              )}

              {selectedBtn === "location" && (
                <LocationInput
                  location={location}
                  setLocation={setLocation}
                />
              )}

              {selectedBtn === "tag" && (
                <TagFriends
                  taggedFriends={taggedFriends}
                  setTaggedFriends={setTaggedFriends}
                />
              )}

              {/* Publish Button */}
              <button
                className={`w-full font-medium text-lg rounded-md py-2.5 mt-5 transition-all ${isPublishDisabled()
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#26Aeee] hover:bg-blue-600 text-white"
                  }`}
                onClick={publish}
                disabled={isPublishDisabled()}
              >
                {loading ? "Publishing..." : "Publish"}
              </button>

              {/* Validation hint */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                * File and category selection are required
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
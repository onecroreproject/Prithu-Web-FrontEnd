import React, { useRef, useState, useEffect } from "react";
import {
  FaCamera,
  FaMapMarkerAlt,
  FaSmile,
  FaUserTag,
  FaUsers,
  FaLink,
  FaPlayCircle,
  FaBook,
  FaAd,
  FaTimes,
} from "react-icons/fa";

// Replace with your GIPHY API key (get free at https://developers.giphy.com/)
const GIPHY_API_KEY = "YOUR_GIPHY_API_KEY";

const buttons = [
  { label: "Photo / Video", icon: <FaCamera />, type: "media" },
  { label: "Post Gif", icon: <FaSmile />, type: "gif" },
  { label: "Share in Group", icon: <FaUsers />, type: "group" },
  { label: "Go Live", icon: <FaPlayCircle />, type: "live" },
  { label: "Post A Book", icon: <FaBook />, type: "book" },
  { label: "Post Location", icon: <FaMapMarkerAlt />, type: "location" },
  { label: "Tag to Friend", icon: <FaUserTag />, type: "tag" },
  { label: "Share Link", icon: <FaLink />, type: "link" },
  { label: "Post Online Course", icon: <FaBook />, type: "course" },
  { label: "Post an Ad", icon: <FaAd />, type: "ad" },
];

export default function CreatePostModal({ open, onClose, onSubmit }) {
  const [postText, setPostText] = useState("");
  const [isActivity, setIsActivity] = useState(true);
  const [isStory, setIsStory] = useState(true);
  const [group, setGroup] = useState("");
  const [schedule, setSchedule] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [files, setFiles] = useState([]);
  const [selectedBtn, setSelectedBtn] = useState(null);
  const [gifSearch, setGifSearch] = useState("");
  const [gifResults, setGifResults] = useState([]);
  const [selectedGif, setSelectedGif] = useState(null);
  const [location, setLocation] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);

  const fileRef = useRef(null);
  const gifDebounce = useRef(null);

  // Helper: Add files with preview
  const addFiles = (newFiles) => {
    const withPreview = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...withPreview]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) addFiles(Array.from(e.dataTransfer.files));
  };

  const handleRemoveFile = (idx) => {
    URL.revokeObjectURL(files[idx].preview);
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // GIPHY Search
  useEffect(() => {
    if (selectedBtn !== "gif" || !gifSearch.trim()) {
      setGifResults([]);
      return;
    }

    clearTimeout(gifDebounce.current);
    gifDebounce.current = setTimeout(() => {
      fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(
          gifSearch
        )}&limit=12&rating=pg`
      )
        .then((res) => res.json())
        .then((data) => {
          setGifResults(data.data || []);
        })
        .catch(() => setGifResults([]));
    }, 500);
  }, [gifSearch, selectedBtn]);

  // YouTube Thumbnail
  const getYoutubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const ytId = getYoutubeId(youtubeLink);
  const ytThumb = ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null;

  // Reset everything
  const handleClose = () => {
    setPostText("");
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
    setYoutubeLink("");
    setGroup("");
    setSchedule("");
    setIsActivity(true);
    setIsStory(true);
    setSelectedBtn(null);
    setGifSearch("");
    setGifResults([]);
    setSelectedGif(null);
    setLocation("");
    setTaggedFriends([]);
    if (onClose) onClose();
  };

  // Submit
  const publish = () => {
    const data = {
      postText,
      files: files.map((f) => f.file),
      youtubeLink,
      schedule,
      group,
      isActivity,
      isStory,
      gif: selectedGif,
      location,
      taggedFriends,
    };
    if (onSubmit) onSubmit(data);
    handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 pb-2 pt-0 px-0 animate-fadeIn">
        {/* Close Button */}
        <button
          className="absolute top-4 right-6 text-3xl text-gray-400 hover:text-blue-700 font-bold focus:outline-none"
          onClick={handleClose}
        >
          ×
        </button>

        {/* Title */}
        <div className="text-center mt-6 mb-4">
          <span className="text-2xl font-semibold text-blue-500 flex items-center justify-center gap-2">
            <span className="text-2xl font-normal leading-none mr-0.5">+</span>
            Create New Post
          </span>
        </div>

        <div className="flex gap-5 px-6 pb-6">
          {/* LEFT: Action Buttons */}
          <div className="w-60 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {buttons.slice(0, 6).map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedBtn(btn.type)}
                  className={`flex items-center gap-2 text-sm bg-[#F2F4F7] text-[#5D5D5D] hover:bg-blue-100 py-2 pl-4 pr-1 rounded-lg transition-all
                    ${selectedBtn === btn.type ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}
                >
                  <span className="text-lg">{btn.icon}</span>
                  {btn.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {buttons.slice(6).map((btn, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedBtn(btn.type)}
                  className={`flex items-center gap-2 text-sm bg-[#F2F4F7] text-[#5D5D5D] hover:bg-blue-100 py-2 pl-4 pr-1 rounded-lg transition-all
                    ${selectedBtn === btn.type ? "bg-blue-100 ring-2 ring-blue-400" : ""}`}
                >
                  <span className="text-lg">{btn.icon}</span>
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Compose Area */}
          <div className="flex-1 flex flex-col">
            {/* Textarea */}
            <textarea
              className="w-full border border-[#E4E4E4] rounded-md px-3 py-2 resize-none text-base min-h-[70px] focus:outline-none"
              placeholder="What's On Your Mind?"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows={3}
            />

            {/* Toggles + Group */}
            <div className="flex items-center gap-4 mt-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="accent-blue-500 w-4 h-4"
                  checked={isActivity}
                  onChange={(e) => setIsActivity(e.target.checked)}
                />
                Activity Feed
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  className="accent-blue-500 w-4 h-4"
                  checked={isStory}
                  onChange={(e) => setIsStory(e.target.checked)}
                />
                My Story
              </label>
              <select
                className="ml-auto px-3 py-1 border border-[#D1D5DB] rounded-md text-sm bg-[#F8FAFC]"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                <option value="">Joined Groups</option>
                <option value="group-1">ABC Friends Group</option>
                <option value="group-2">Work Buddies</option>
              </select>
            </div>

            {/* Special Panels */}
            {selectedBtn === "media" && (
              <div className="mt-4 p-3 border border-dashed border-gray-400 rounded-lg bg-[#F9FAFB] min-h-[120px] flex flex-col items-center justify-center">
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current && fileRef.current.click()}
                  className="cursor-pointer text-gray-500 text-center"
                >
                  <p>Drop files here or <span className="underline text-blue-600">click to upload</span></p>
                </div>

                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {files.map((f, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded overflow-hidden bg-gray-100">
                        {f.type.startsWith("image/") ? (
                          <img src={f.preview} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <video src={f.preview} className="w-full h-full object-cover" />
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(i)}
                          className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedBtn === "gif" && (
              <div className="mt-4 p-3 border rounded bg-[#F9FAFB]">
                <input
                  type="text"
                  placeholder="Search GIFs..."
                  className="w-full border-b border-gray-300 px-2 py-1 focus:outline-none"
                  value={gifSearch}
                  onChange={(e) => setGifSearch(e.target.value)}
                />
                <div className="grid grid-cols-3 gap-2 mt-3 max-h-48 overflow-y-auto">
                  {gifResults.map((gif) => (
                    <img
                      key={gif.id}
                      src={gif.images.fixed_height_small.url}
                      alt={gif.title}
                      className={`cursor-pointer rounded hover:ring-2 ring-blue-400 transition-all ${
                        selectedGif === gif.images.fixed_height_small.url ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => setSelectedGif(gif.images.fixed_height_small.url)}
                    />
                  ))}
                </div>
                {selectedGif && (
                  <div className="mt-3 flex justify-center">
                    <img src={selectedGif} alt="Selected GIF" className="max-h-32 rounded" />
                  </div>
                )}
              </div>
            )}

            {selectedBtn === "location" && (
              <div className="mt-4 p-3 border rounded bg-[#F9FAFB]">
                <input
                  type="text"
                  placeholder="Enter location (e.g. Paris, France)"
                  className="w-full border-b border-gray-300 px-2 py-1 focus:outline-none"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                {location && (
                  <p className="mt-2 text-sm text-gray-600">
                    Location: <strong>{location}</strong>
                  </p>
                )}
              </div>
            )}

            {selectedBtn === "tag" && (
              <div className="mt-4 p-3 border rounded bg-[#F9FAFB]">
                <p className="text-sm mb-2">Tag friends:</p>
                <div className="flex flex-wrap gap-2">
                  {["Alice", "Bob", "Charlie", "Diana", "Eve"].map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        setTaggedFriends((prev) =>
                          prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        taggedFriends.includes(name)
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                {taggedFriends.length > 0 && (
                  <p className="mt-2 text-sm">
                    Tagged: <strong>{taggedFriends.join(", ")}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Placeholder for Live, Book, Course, Ad */}
            {["live", "book", "course", "ad"].includes(selectedBtn) && (
              <div className="mt-4 p-4 border rounded bg-[#F9FAFB] text-center text-gray-600">
                <p className="font-medium">
                  {selectedBtn === "live" && "Live streaming setup coming soon..."}
                  {selectedBtn === "book" && "Book details form will appear here"}
                  {selectedBtn === "course" && "Online course link form will appear here"}
                  {selectedBtn === "ad" && "Ad creation tools will appear here"}
                </p>
              </div>
            )}

            {/* Bottom: Schedule, YouTube, Publish */}
            <div className="flex gap-4 mt-4">
              {/* Default Upload Area */}
              {!selectedBtn && (
                <div className="flex-1 border border-dashed border-gray-400 rounded-lg bg-[#F9FAFB] min-h-[120px] flex flex-col justify-center items-center p-4">
                  <input ref={fileRef} type="file" multiple onChange={handleFileChange} className="hidden" />
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileRef.current && fileRef.current.click()}
                    className="cursor-pointer text-gray-500 text-center"
                  >
                    Drop files here to upload
                  </div>
                  {files.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {files.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center text-xs rounded bg-blue-50 border border-blue-200 px-2 py-1"
                        >
                          {f.name}
                          <button
                            type="button"
                            className="ml-1 text-blue-400 hover:text-red-700"
                            onClick={() => handleRemoveFile(i)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Right Column */}
              <div className="flex-1 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Schedule Post (e.g. Tomorrow 3PM)"
                  className="border border-[#A7C8DF] rounded px-2 py-1 text-sm w-full focus:outline-none"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="border-b border-gray-300 px-2 py-1 w-full text-sm bg-transparent focus:outline-none"
                  value={youtubeLink}
                  onChange={(e) => setYoutubeLink(e.target.value)}
                />
                {ytThumb && (
                  <img src={ytThumb} alt="YouTube Preview" className="mt-2 w-full rounded max-h-32 object-cover" />
                )}
                <button
                  className="w-full bg-[#26Aeee] hover:bg-blue-600 text-white font-medium text-lg rounded-md py-2.5 mt-3 transition"
                  onClick={publish}
                >
                  Publish
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Blue Bar */}
        <div className="absolute left-0 bottom-0 w-full h-2 bg-[#26Aeee] rounded-b-lg" />
      </div>
    </div>
  );
}
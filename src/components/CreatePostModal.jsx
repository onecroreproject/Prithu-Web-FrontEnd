// ✅ src/components/CreatePostModal.jsx
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Image, Video, Calendar, 
  Hash, Globe, Lock, Users, Sparkles, Smile,
  ChevronDown, Upload, Film, Check, Loader2,
  ChevronLeft, Crop, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Target,
  Sliders, CheckCircle
} from "lucide-react";
import { uploadCreatorFeed } from "../API_Services/postServices";
import { toast } from "react-hot-toast";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreatePostFilter from "../components/createPostModelComponets/createPostFilter";

export default function CreatePostModal({ open, onClose }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Crop, 3: Filters, 4: Details, 5: Success
  const [postText, setPostText] = useState("");
  const [files, setFiles] = useState([]);
  const [location, setLocation] = useState("");
  const [taggedFriends, setTaggedFriends] = useState([]);
  const [language, setLanguage] = useState("en");
  const [categoryId, setCategoryId] = useState("");
  const [type, setType] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [isScheduled, setIsScheduled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [audience, setAudience] = useState("public");
  const [selectedRatio, setSelectedRatio] = useState("original");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState("original");
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    fade: 0,
    saturation: 0,
    temperature: 0,
    vignette: 0
  });
  const [publishSuccess, setPublishSuccess] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const textareaRef = useRef(null);
  const mediaContainerRef = useRef(null);
  const modalContentRef = useRef(null);

  /* --------------------------------------------
      RESET — runs only when modal closes
  --------------------------------------------- */
  const resetAll = () => {
    files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setStep(1);
    setPostText("");
    setFiles([]);
    setLocation("");
    setTaggedFriends([]);
    setLanguage("en");
    setCategoryId("");
    setScheduleDate("");
    setIsScheduled(false);
    setType("");
    setAudience("public");
    setSelectedRatio("original");
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setSelectedFilter("original");
    setAdjustments({
      brightness: 0,
      contrast: 0,
      fade: 0,
      saturation: 0,
      temperature: 0,
      vignette: 0
    });
    setPublishSuccess(false);
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  /* ------------------------------------------------------
      SET DEFAULT STEP WHEN MODAL OPENS
  ------------------------------------------------------- */
  useEffect(() => {
    if (open) {
      setStep(1);
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
      setPublishSuccess(false);
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
      FILE HANDLING - COMBINED UPLOAD
  ------------------------------------------------------- */
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type
    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      toast.error("Please select an image or video file");
      return;
    }

    const fileType = isImage ? "image" : "video";
    setType(fileType);

    const newFile = {
      file: selectedFile,
      preview: URL.createObjectURL(selectedFile),
      name: selectedFile.name,
      type: fileType,
      mime: selectedFile.type,
    };

    setFiles([newFile]);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setStep(2); // Go to crop step after selecting file
  };

  const handleRemoveFile = () => {
    if (files[0]?.preview) {
      URL.revokeObjectURL(files[0].preview);
    }
    setFiles([]);
    setType("");
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setStep(1); // Go back to upload step
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      
      if (!isImage && !isVideo) {
        toast.error("Please drop an image or video file");
        return;
      }
      
      handleFileChange({ target: { files: [file] } });
    }
  };

  /* ------------------------------------------------------
      ZOOM CONTROLS
  ------------------------------------------------------- */
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 1));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  /* ------------------------------------------------------
      MANUAL POSITION ADJUSTMENT CONTROLS
  ------------------------------------------------------- */
  const movePosition = (direction) => {
    const stepSize = 10;
    switch(direction) {
      case 'up':
        setPosition(prev => ({ ...prev, y: prev.y - stepSize }));
        break;
      case 'down':
        setPosition(prev => ({ ...prev, y: prev.y + stepSize }));
        break;
      case 'left':
        setPosition(prev => ({ ...prev, x: prev.x - stepSize }));
        break;
      case 'right':
        setPosition(prev => ({ ...prev, x: prev.x + stepSize }));
        break;
      case 'center':
        setPosition({ x: 0, y: 0 });
        break;
    }
  };

  /* ------------------------------------------------------
      FILTER FUNCTIONS
  ------------------------------------------------------- */
  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);
  };

  const handleAdjustmentChange = (adjustmentId, value) => {
    setAdjustments(prev => ({
      ...prev,
      [adjustmentId]: value
    }));
  };

  /* ------------------------------------------------------
      DRAG AND PAN FOR ZOOMED IMAGE
  ------------------------------------------------------- */
  const handleMouseDown = (e) => {
    if (zoomLevel <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || zoomLevel <= 1) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calculate bounds based on zoom level
    const containerWidth = mediaContainerRef.current?.clientWidth || 0;
    const containerHeight = mediaContainerRef.current?.clientHeight || 0;
    const maxX = (zoomLevel - 1) * containerWidth / 2;
    const maxY = (zoomLevel - 1) * containerHeight / 2;
    
    setPosition({
      x: Math.max(Math.min(newX, maxX), -maxX),
      y: Math.max(Math.min(newY, maxY), -maxY)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  /* ------------------------------------------------------
      RATIO OPTIONS
  ------------------------------------------------------- */
  const ratios = [
    { id: 'original', label: 'Original', aspect: 'auto' },
    { id: '1:1', label: '1:1', aspect: '1/1' },
    { id: '4:5', label: '4:5', aspect: '4/5' },
    { id: '16:9', label: '16:9', aspect: '16/9' },
  ];

  /* ------------------------------------------------------
      EMOJI HANDLING
  ------------------------------------------------------- */
  const handleEmojiSelect = (emoji) => {
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
        audience,
        taggedFriends,
        ratio: selectedRatio,
        zoomLevel,
        position,
        filter: selectedFilter,
        adjustments
      };

      const res = await uploadCreatorFeed(formData, token);
      toast.success(res.message || "Post published successfully!");
      
      // Show success step
      setPublishSuccess(true);
      setStep(5);
      
      // Auto close after 3 seconds
      setTimeout(() => {
        navigate("/");
        resetAll();
        onClose?.();
      }, 3000);
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
      RENDER STEP 1: UPLOAD (COMBINED PHOTO/VIDEO)
  ------------------------------------------------------- */
  const renderStep1 = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-light mb-3">Create new post</h2>
        <p className="text-gray-500 text-sm">Select photos or videos to share</p>
      </div>
      
      <div 
        className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl p-8 md:p-12 cursor-pointer hover:border-blue-400 transition-all duration-200 mb-8 md:mb-10 bg-gray-50/50"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto mb-6">
            <div className="relative">
              <Image size={28} className="text-blue-500 absolute -left-3 md:-left-4" />
              {/* <Video size={28} className="text-purple-500 absolute -right-3 md:-right-4" /> */}
            </div>
          </div>
          <h3 className="text-lg md:text-xl font-medium mb-4">Drag photos or videos here</h3>
          <button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl text-sm md:text-base">
            Select from computer
          </button>
          <p className="text-gray-400 text-xs mt-4 md:mt-6">Supports: JPG, PNG, GIF, MP4, MOV • Max 50MB</p>
        </div>
      </div>
      
      <div className="flex gap-4 md:gap-6">
        <div className="flex flex-col items-center gap-3 p-4 md:p-6 border border-gray-200 rounded-2xl">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
            <div className="flex gap-1">
              <Image size={16} className="text-blue-600 md:text-blue-600" />
              {/* <Video size={16} className="text-purple-600 md:text-purple-600" /> */}
            </div>
          </div>
          <span className="font-medium text-sm md:text-base">Photos & Videos</span>
          <span className="text-xs md:text-sm text-gray-500">All formats supported</span>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------
      RENDER STEP 2: CROP/RATIO SELECTION
  ------------------------------------------------------- */
  const renderStep2 = () => (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <div className="lg:w-2/3 p-4 md:p-8 flex items-center justify-center bg-gray-900 relative min-h-[300px] md:min-h-[400px]">
        {/* Top Controls - Zoom */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={handleZoomOut}
              disabled={zoomLevel <= 1}
              className={`p-1.5 md:p-2 rounded-full ${zoomLevel <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}
            >
              <ZoomOut size={14} className="text-white md:text-white" />
            </button>
            <span className="text-white text-xs md:text-sm font-medium min-w-[50px] md:min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button 
              onClick={handleZoomIn}
              disabled={zoomLevel >= 3}
              className={`p-1.5 md:p-2 rounded-full ${zoomLevel >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'}`}
            >
              <ZoomIn size={14} className="text-white md:text-white" />
            </button>
          </div>
          <div className="h-3 md:h-4 w-px bg-white/30"></div>
          <button 
            onClick={handleResetZoom}
            className="p-1.5 md:p-2 rounded-full hover:bg-white/20"
            title="Reset zoom and position"
          >
            <Maximize2 size={14} className="text-white md:text-white" />
          </button>
        </div>

        {/* Bottom Controls - Position Adjustment */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/70 backdrop-blur-sm rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-1">
            <div className="text-white text-xs font-medium mr-1 md:mr-2">Adjust:</div>
            <button 
              onClick={() => movePosition('up')}
              className="p-1 md:p-1.5 rounded-full hover:bg-white/20"
              title="Move Up"
            >
              <ArrowUp size={12} className="text-white md:text-white" />
            </button>
            <button 
              onClick={() => movePosition('down')}
              className="p-1 md:p-1.5 rounded-full hover:bg-white/20"
              title="Move Down"
            >
              <ArrowDown size={12} className="text-white md:text-white" />
            </button>
            <button 
              onClick={() => movePosition('left')}
              className="p-1 md:p-1.5 rounded-full hover:bg-white/20"
              title="Move Left"
            >
              <ArrowLeft size={12} className="text-white md:text-white" />
            </button>
            <button 
              onClick={() => movePosition('right')}
              className="p-1 md:p-1.5 rounded-full hover:bg-white/20"
              title="Move Right"
            >
              <ArrowRight size={12} className="text-white md:text-white" />
            </button>
          </div>
          <div className="h-3 md:h-4 w-px bg-white/30"></div>
          <button 
            onClick={() => movePosition('center')}
            className="p-1 md:p-1.5 rounded-full hover:bg-white/20"
            title="Center Position"
          >
            <Target size={12} className="text-white md:text-white" />
          </button>
        </div>

        {/* Media Container */}
        <div 
          ref={mediaContainerRef}
          className="relative w-full max-w-lg overflow-hidden"
          style={{
            aspectRatio: selectedRatio === '1:1' ? '1/1' : 
                        selectedRatio === '4:5' ? '4/5' : 
                        selectedRatio === '16:9' ? '16/9' : 
                        'auto'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => {
            if (zoomLevel <= 1) return;
            setIsDragging(true);
            const touch = e.touches[0];
            setDragStart({
              x: touch.clientX - position.x,
              y: touch.clientY - position.y
            });
          }}
        >
          {type === "image" ? (
            <img 
              src={files[0]?.preview} 
              alt="Preview" 
              className={`w-full h-full rounded-lg shadow-2xl object-cover transition-transform duration-200 ${isDragging ? 'cursor-grabbing' : zoomLevel > 1 ? 'cursor-grab' : 'cursor-default'}`}
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center'
              }}
            />
          ) : (
            <div className="relative w-full h-full">
              <video 
                src={files[0]?.preview} 
                controls
                className={`w-full h-full rounded-lg shadow-2xl object-cover ${zoomLevel > 1 ? 'cursor-grab' : 'cursor-default'}`}
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center center'
                }}
              />
              <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/70 text-white text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
                {selectedRatio} • {Math.round(zoomLevel * 100)}%
              </div>
            </div>
          )}
          
          {/* Position Coordinates Display */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/60 text-white text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
            X: {Math.round(position.x)} Y: {Math.round(position.y)}
          </div>
          
          {/* Drag instruction hint */}
          {zoomLevel > 1 && (
            <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap">
              Click and drag to pan
            </div>
          )}
        </div>
      </div>
      
      <div className="lg:w-1/3 p-4 md:p-6 border-l border-gray-200 overflow-y-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Crop size={16} className="text-white md:text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm md:text-base">Crop</h3>
              <p className="text-xs md:text-sm text-gray-500">Select aspect ratio</p>
            </div>
          </div>
          
          <div className="space-y-2 md:space-y-3">
            {ratios.map((ratio) => (
              <button
                key={ratio.id}
                className={`w-full flex items-center justify-between p-3 md:p-4 rounded-xl border transition-all ${
                  selectedRatio === ratio.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => setSelectedRatio(ratio.id)}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded border ${
                    ratio.id === '1:1' ? 'aspect-square' : 
                    ratio.id === '4:5' ? 'aspect-[4/5] h-8 md:h-10' : 
                    ratio.id === '16:9' ? 'aspect-video h-5 md:h-6' : 
                    'aspect-auto'
                  } ${selectedRatio === ratio.id ? 'bg-blue-100 border-blue-300' : 'bg-gray-100 border-gray-300'}`} />
                  <span className="font-medium text-sm md:text-base">{ratio.label}</span>
                </div>
                {selectedRatio === ratio.id && (
                  <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
          
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <Move size={14} className="text-blue-600 md:text-blue-600" />
              <h4 className="font-medium text-blue-700 text-sm md:text-base">Position Adjustment</h4>
            </div>
            <p className="text-xs md:text-sm text-blue-600">
              Use arrow buttons to fine-tune the position. Drag to pan when zoomed in.
            </p>
          </div>
          
          {type === "video" && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs md:text-sm text-yellow-700">
                Note: Video cropping will be applied during playback. Original file remains unchanged.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 md:mt-8">
          <button
            onClick={() => setStep(3)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 md:py-3.5 px-4 md:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
          >
            Next
            <ChevronLeft size={16} className="rotate-180 md:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------
      RENDER STEP 3: FILTERS
  ------------------------------------------------------- */
  const renderStep3 = () => (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Left side - Preview with filters */}
      <div className="lg:w-2/3 p-4 md:p-8 flex items-center justify-center bg-gray-900 relative min-h-[300px] md:min-h-[400px]">
        {/* Filter Preview Container */}
        <div 
          className="relative w-full max-w-lg overflow-hidden rounded-lg shadow-2xl"
          style={{
            aspectRatio: selectedRatio === '1:1' ? '1/1' : 
                        selectedRatio === '4:5' ? '4/5' : 
                        selectedRatio === '16:9' ? '16/9' : 
                        'auto'
          }}
        >
          {type === "image" ? (
            <div 
              className="w-full h-full"
              style={{
                filter: getFilterStyle(selectedFilter, adjustments),
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center'
              }}
            >
              <img 
                src={files[0]?.preview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="relative w-full h-full">
              <video 
                src={files[0]?.preview} 
                controls
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-black/70 text-white text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
                Preview
              </div>
            </div>
          )}
          
          {/* Filter Info Display */}
          <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-black/60 text-white text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm">
            {selectedFilter !== 'original' ? 
              selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1) : 
              'Original'}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white text-xs px-2 md:px-3 py-1 md:py-1.5 rounded-full backdrop-blur-sm whitespace-nowrap">
          Apply filters in the right panel
        </div>
      </div>
      
      {/* Right side - Filter Controls */}
      <div className="lg:w-1/3 p-4 md:p-6 border-l border-gray-200 h-full overflow-y-auto">
        <CreatePostFilter
          onFilterSelect={handleFilterSelect}
          onAdjustmentChange={handleAdjustmentChange}
          currentFilter={selectedFilter}
          adjustments={adjustments}
          onClose={() => {}}
        />
        
        <div className="mt-6 md:mt-8">
          <button
            onClick={() => setStep(4)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 md:py-3.5 px-4 md:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base"
          >
            Next
            <ChevronLeft size={16} className="rotate-180 md:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------
      RENDER STEP 4: DETAILS
  ------------------------------------------------------- */
  const renderStep4 = () => (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
      {/* Left side - Media preview */}
      <div className="lg:w-2/5 border-r border-gray-200 p-4 md:p-6 flex flex-col">
        <div 
          className="flex-1 rounded-xl md:rounded-2xl overflow-hidden bg-black flex items-center justify-center min-h-[200px] md:min-h-0"
          style={{
            filter: getFilterStyle(selectedFilter, adjustments)
          }}
        >
          {type === "image" ? (
            <img 
              src={files[0]?.preview} 
              alt="Post preview" 
              className="w-full h-full object-contain"
              style={{
                transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: 'center center'
              }}
            />
          ) : (
            <video 
              src={files[0]?.preview} 
              controls
              className="w-full h-full object-contain"
            />
          )}
        </div>
        
        <div className="mt-4 md:mt-6 p-3 md:p-4 bg-gray-50 rounded-xl">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                <Crop size={12} className="md:text-base" />
                <span>Aspect Ratio:</span>
              </div>
              <span className="font-medium">{selectedRatio}</span>
            </div>
            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                <ZoomIn size={12} className="md:text-base" />
                <span>Zoom Level:</span>
              </div>
              <span className="font-medium">{Math.round(zoomLevel * 100)}%</span>
            </div>
            <div className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                <Move size={12} className="md:text-base" />
                <span>Position:</span>
              </div>
              <span className="font-medium text-xs">X: {Math.round(position.x)} Y: {Math.round(position.y)}</span>
            </div>
            {selectedFilter !== 'original' && (
              <div className="flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                  <Sliders size={12} className="md:text-base" />
                  <span>Filter:</span>
                </div>
                <span className="font-medium capitalize">{selectedFilter}</span>
              </div>
            )}
            {(adjustments.brightness !== 0 || adjustments.contrast !== 0 || adjustments.saturation !== 0) && (
              <div className="flex items-center justify-between text-xs md:text-sm">
                <div className="flex items-center gap-1 md:gap-2 text-gray-600">
                  <Sliders size={12} className="md:text-base" />
                  <span>Adjustments:</span>
                </div>
                <span className="font-medium text-xs">
                  {adjustments.brightness !== 0 && `B:${adjustments.brightness} `}
                  {adjustments.contrast !== 0 && `C:${adjustments.contrast} `}
                  {adjustments.saturation !== 0 && `S:${adjustments.saturation}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="lg:w-3/5 p-4 md:p-6 overflow-y-auto">
        {/* User header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow">
            <img 
              src="https://via.placeholder.com/48" 
              alt="User" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm md:text-base">Your Name</p>
            <p className="text-xs md:text-sm text-gray-600">Posting to your feed</p>
          </div>
        </div>

        {/* Caption */}
        <div className="mb-4 md:mb-6">
          <textarea
            ref={textareaRef}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            placeholder="What's on your mind? #hashtag @mention"
            className="w-full p-3 md:p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none resize-none min-h-[100px] md:min-h-[120px] text-sm"
            rows="3"
          />
          <div className="flex items-center justify-between mt-2 md:mt-3">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Smile size={16} className="text-gray-500 md:text-gray-500" />
            </button>
            <span className="text-xs text-gray-500">{postText.length}/2200</span>
          </div>
          
          {/* Emoji Picker (Simplified) */}
          {showEmojiPicker && (
            <div className="mt-2 p-2 md:p-3 border border-gray-200 rounded-lg bg-white shadow-lg">
              <div className="flex gap-1 md:gap-2 flex-wrap">
                {["😀", "😍", "😂", "🥳", "👍", "❤️", "🔥", "✨", "🎉", "🌟", "💯", "🙏"].map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleEmojiSelect(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="text-lg md:text-xl p-0.5 md:p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="mb-4 md:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm md:text-base"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
          {!categoryId && files.length > 0 && (
            <p className="mt-1 text-xs md:text-sm text-red-500">Category is required</p>
          )}
        </div>

        {/* Schedule Option */}
        <div className="mb-4 md:mb-6">
          <div className="flex items-center justify-between p-3 md:p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center gap-2 md:gap-3">
              <Calendar size={16} className="text-gray-500 md:text-gray-500" />
              <div>
                <p className="font-medium text-sm md:text-base">Schedule Post</p>
                <p className="text-xs md:text-sm text-gray-500">
                  Set a future date for automatic posting
                </p>
              </div>
            </div>
            <div
              onClick={() => setIsScheduled(!isScheduled)}
              className={`relative w-10 h-5 md:w-12 md:h-6 rounded-full cursor-pointer transition-colors ${
                isScheduled ? "bg-blue-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-0.5 md:top-1 w-3 h-3 md:w-4 md:h-4 rounded-full bg-white transition-transform ${
                  isScheduled ? "left-5 md:left-7" : "left-0.5 md:left-1"
                }`}
              />
            </div>
          </div>
          
          {isScheduled && (
            <div className="mt-3 md:mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none text-sm md:text-base"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          )}
        </div>

        {/* Publish button - Sticky on mobile */}
        <div className="sticky bottom-0 bg-white pt-4 md:pt-6 mt-6 md:mt-8 pb-2 md:pb-0">
          <button
            onClick={publish}
            disabled={isPublishDisabled()}
            className={`w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 md:py-4 px-4 md:px-6 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm md:text-base ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin md:animate-spin" />
                Publishing...
              </>
            ) : isScheduled ? (
              "Schedule Post"
            ) : (
              "Publish Now"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  /* ------------------------------------------------------
      RENDER STEP 5: SUCCESS
  ------------------------------------------------------- */
  const renderStep5 = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="mb-6 md:mb-8"
      >
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center">
            <CheckCircle size={48} className="text-white md:text-white" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-green-400"
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        </div>
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-light mb-3">Post Published!</h2>
        <p className="text-gray-500 text-base md:text-lg mb-6 md:mb-8">
          Your {type} has been successfully shared with your audience.
        </p>
        
        <div className="max-w-md mx-auto p-4 md:p-6 bg-gray-50 rounded-2xl mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow">
              <img 
                src="https://via.placeholder.com/48" 
                alt="User" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm md:text-base">Your Name</p>
              <p className="text-xs md:text-sm text-gray-500">Just now</p>
            </div>
          </div>
          
          {type === "image" ? (
            <div 
              className="w-full h-40 md:h-48 rounded-xl overflow-hidden mb-3 md:mb-4"
              style={{
                filter: getFilterStyle(selectedFilter, adjustments),
                aspectRatio: selectedRatio === '1:1' ? '1/1' : 
                            selectedRatio === '4:5' ? '4/5' : 
                            selectedRatio === '16:9' ? '16/9' : 
                            'auto'
              }}
            >
              <img 
                src={files[0]?.preview} 
                alt="Published" 
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
                  transformOrigin: 'center center'
                }}
              />
            </div>
          ) : (
            <div className="w-full h-40 md:h-48 rounded-xl overflow-hidden mb-3 md:mb-4 bg-black flex items-center justify-center">
              <video 
                src={files[0]?.preview} 
                controls
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <p className="text-sm text-gray-700 mb-2 line-clamp-2">
            {postText || "No caption"}
          </p>
          
          <div className="flex flex-wrap gap-1 md:gap-2">
            {selectedFilter !== 'original' && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs">
                <Sliders size={10} className="md:text-xs" />
                {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
              </span>
            )}
            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs">
              <Crop size={10} className="md:text-xs" />
              {selectedRatio}
            </span>
            {zoomLevel > 1 && (
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs">
                <ZoomIn size={10} className="md:text-xs" />
                {Math.round(zoomLevel * 100)}%
              </span>
            )}
          </div>
        </div>
        
        <p className="text-gray-400 text-xs md:text-sm">
          Redirecting to home page in 3 seconds...
        </p>
      </motion.div>
    </div>
  );

  /* ------------------------------------------------------
      MAIN MODAL RENDER
  ------------------------------------------------------- */
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 pointer-events-none">
            <motion.div
              className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-5xl h-[95vh] max-h-[900px] flex flex-col overflow-hidden pointer-events-auto"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 shrink-0">
                <button 
                  onClick={() => {
                    if (step === 1) {
                      handleClose();
                    } else if (step === 5) {
                      // From success step, go directly to close
                      handleClose();
                    } else {
                      setStep(step - 1);
                    }
                  }}
                  className="p-1.5 md:p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {step === 1 || step === 5 ? <X size={20} className="md:text-base" /> : <ChevronLeft size={20} className="md:text-base" />}
                </button>
                
                <h2 className="text-base md:text-lg font-semibold">
                  {step === 1 ? 'Create new post' : 
                   step === 2 ? 'Crop' : 
                   step === 3 ? 'Edit' : 
                   step === 4 ? 'Create new post' : 
                   'Published!'}
                </h2>
                
                <div className="w-8 md:w-10"></div> {/* Spacer for alignment */}
              </div>

              {/* Progress indicator - Hide on success step */}
              {step !== 5 && (
                <div className="h-1 bg-gray-100 shrink-0">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              )}

              {/* Content - Scrollable area */}
              <div className="flex-1 overflow-hidden">
                <div ref={modalContentRef} className="h-full overflow-y-auto">
                  {step === 1 && renderStep1()}
                  {step === 2 && renderStep2()}
                  {step === 3 && renderStep3()}
                  {step === 4 && renderStep4()}
                  {step === 5 && renderStep5()}
                </div>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------
    FILTER STYLE FUNCTION
------------------------------------------------------- */
const getFilterStyle = (filter, adjustments) => {
  let filterStyle = '';
  
  // Apply preset filter
  switch(filter) {
    case 'aden':
      filterStyle += 'sepia(0.2) brightness(1.15) saturate(1.4) ';
      break;
    case 'clarendon':
      filterStyle += 'contrast(1.2) saturate(1.35) ';
      break;
    case 'crema':
      filterStyle += 'sepia(0.5) contrast(1.25) brightness(1.15) saturate(0.9) ';
      break;
    case 'gingham':
      filterStyle += 'contrast(1.1) brightness(1.1) ';
      break;
    case 'juno':
      filterStyle += 'sepia(0.35) contrast(1.15) brightness(1.15) saturate(1.8) ';
      break;
    case 'lark':
      filterStyle += 'contrast(0.9) ';
      break;
    case 'ludwig':
      filterStyle += 'sepia(0.25) contrast(1.05) brightness(1.05) saturate(2) ';
      break;
    case 'moon':
      filterStyle += 'grayscale(1) contrast(1.1) brightness(1.1) ';
      break;
    case 'perpetua':
      filterStyle += 'contrast(1.1) brightness(1.25) saturate(1.1) ';
      break;
    case 'reyes':
      filterStyle += 'sepia(0.75) contrast(0.75) brightness(1.25) saturate(1.4) ';
      break;
    case 'slumber':
      filterStyle += 'saturate(0.66) brightness(1.05) ';
      break;
    default:
      // Original - no preset filter
      break;
  }
  
  // Apply adjustments
  filterStyle += `brightness(${1 + (adjustments.brightness / 100)}) `;
  filterStyle += `contrast(${1 + (adjustments.contrast / 100)}) `;
  filterStyle += `saturate(${1 + (adjustments.saturation / 100)}) `;
  filterStyle += `sepia(${adjustments.fade / 100}) `;
  filterStyle += `hue-rotate(${adjustments.temperature}deg) `;
  
  return filterStyle.trim();
};
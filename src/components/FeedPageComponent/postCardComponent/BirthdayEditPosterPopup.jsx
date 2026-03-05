import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Cropper from "react-easy-crop";
import api from "../../../api/axios";
import {
    Close as CloseIcon,
    FormatSize as TextSizeIcon,
    TextFields as FontStyleIcon,
    ArrowBack as BackIcon,
    ChevronRight as ChevronIcon,
    Dashboard as FooterIcon,
    Person as UserIcon,
    AlternateEmail as EmailIcon,
    Phone as PhoneIcon,
    Share as SocialIcon,
    Download as DownloadIcon,
    AccountCircle as AvatarIcon,
    PhotoCamera as CameraIcon,
    Check as CheckIcon,
    Add as PlusIcon,
    Cancel as CancelIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import FeedOverlayRenderer from "./FeedOverlayRenderer";
import OverlayItem from "./OverlayItem";
import PostMedia from "./postMeadia";
import PosterPreviewArea from "./PosterPreviewArea";
import prithuLogo from "../../../assets/prithulogo.png";

// ------- Avatar Crop Utility -------
async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImageBitmap(await fetch(imageSrc).then(r => r.blob()));
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
    return new Promise(resolve => canvas.toBlob(blob => resolve(URL.createObjectURL(blob)), 'image/jpeg', 0.92));
}

// ------- Avatar Cropper Modal -------
function AvatarCropperModal({ src, onCancel, onConfirm }) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const onCropComplete = useCallback((_, pixels) => { setCroppedAreaPixels(pixels); }, []);

    const handleConfirm = async () => {
        try {
            const url = await getCroppedImg(src, croppedAreaPixels);
            onConfirm(url);
        } catch (e) {
            toast.error('Crop failed, please try again.');
        }
    };

    return (
        <div className="fixed inset-0 z-[20000] flex flex-col bg-black/95 items-center justify-center">
            <div className="relative w-full max-w-md h-[380px] mx-4">
                <Cropper
                    image={src}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="mt-6 flex flex-col items-center gap-3 w-full max-w-sm px-4">
                <input
                    type="range" min={1} max={3} step={0.01}
                    value={zoom}
                    onChange={e => setZoom(Number(e.target.value))}
                    className="w-full accent-blue-600"
                />
                <p className="text-white/50 text-xs">Pinch or drag to adjust</p>
                <div className="flex gap-3 w-full mt-1">
                    <button onClick={onCancel} className="flex-1 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all">Cancel</button>
                    <button onClick={handleConfirm} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                        <CheckIcon fontSize="small" /> Apply
                    </button>
                </div>
            </div>
        </div>
    );
}

const BirthdayEditPosterPopup = ({
    isOpen,
    onClose,
    footerStyle,
    setFooterStyle,
    usernameSize,
    setUsernameSize,
    emailSize,
    setEmailSize,
    phoneSize,
    setPhoneSize,
    socialSize,
    setSocialSize,
    postData,
    dominantColor,
    viewer
}) => {
    const popupRef = useRef(null);
    const previewContainerRef = useRef(null);
    const mediaAreaRef = useRef(null);
    const previewVideoRef = useRef(null);
    const [currentView, setCurrentView] = useState('root'); // root, style, sizes, avatarEdit
    const [dragInProgress, setDragInProgress] = useState(false);

    // Add CSS for custom scrollbar
    const scrollbarStyles = `
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #e5e7eb;
            border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #d1d5db;
        }
    `;
    const [previewIsPlaying, setPreviewIsPlaying] = useState(false);
    const [previewIsMuted, setPreviewIsMuted] = useState(true);
    const [previewDuration, setPreviewDuration] = useState(0);
    const [previewCurrentTime, setPreviewCurrentTime] = useState(0);

    // Avatar & Text edit state
    const avatarFileInputRef = useRef(null);
    const [selectedAvatarId, setSelectedAvatarId] = useState(null);
    const [avatarCropSrc, setAvatarCropSrc] = useState(null);
    const [showAvatarCropper, setShowAvatarCropper] = useState(false);
    const [avatarOverlays, setAvatarOverlays] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);

    // Local Text Settings (Post-specific) - Transitioned to multi-slot
    const [textOverlays, setTextOverlays] = useState([]);
    const [selectedTextId, setSelectedTextId] = useState(null);

    // Add refs to track if we're in the middle of an update
    const isUpdatingFromDrag = useRef(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset state when closing/closed to ensure "fresh" start next time it's opened
            setAvatarOverlays([]);
            setTextOverlays([]);
            setCurrentView('root');
            setPreviewIsPlaying(false);
            setPreviewCurrentTime(0);
            return;
        }

        if (!postData?.overlayElements) return;

        console.log("🛠️ [BirthdayEditor] Initializing fresh overlays with (10,10) defaults");
        const avatarEls = postData.overlayElements
            .filter(el => el.type === 'avatar')
            .map(el => ({
                ...el,
                id: el.id || el._id || `avatar-${Math.random()}`,
                // 🚀 FORCE (10,10) for fresh start as requested
                x: 10,
                y: 10,
                w: el.wPercent ?? el.w ?? 22,
                h: el.hPercent ?? el.h ?? 22,
                img: el.img || viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                shape: el.shape || el.avatarConfig?.shape || 'circle',
                visible: true
            }));

        if (avatarEls.length === 0) {
            avatarEls.push({
                id: 'interactive-avatar',
                type: 'avatar',
                x: 10,
                y: 10,
                w: 22,
                h: 22,
                img: viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                shape: 'circle',
                visible: true,
                zIndex: 100
            });
        }

        avatarEls.forEach((el, idx) => {
            console.log(`🖼️ [Init] Avatar slot ${idx + 1}: ID=${el.id} | Initial Position=(${el.x}%, ${el.y}%)`);
        });
        setAvatarOverlays(avatarEls);

        // Initialize text overlays
        console.log("🛠️ [BirthdayEditor] Initializing text overlays");
        const textEls = postData.overlayElements
            .filter(el => el.type === 'text' || el.type === 'username')
            .map((el, idx) => ({
                ...el,
                id: el.id || el._id || `text-${idx}`,
                // 🚀 FORCE (10,10) for fresh start as requested
                x: 10,
                y: 10,
                w: el.wPercent ?? el.w ?? 40,
                h: el.hPercent ?? el.h ?? 10,
                content: el.content || el.textConfig?.content || (el.type === 'username' ? (viewer?.userName || viewer?.name || "User") : ""),
                style: el.textConfig || el.style || {},
                visible: el.visible !== false
            }));

        textEls.forEach((el, idx) => {
            console.log(`📝 [Init] Text slot ${idx + 1}: ID=${el.id} | Initial Position=(${el.x}%, ${el.y}%)`);
        });
        setTextOverlays(textEls);
    }, [isOpen, postData?._id || postData?.id]);

    const handleAvatarUpdate = useCallback((newOverlays) => {
        console.log("🛠️ [BirthdayEditor] Updating avatar overlays", newOverlays.length);
        // Mark that we're updating from drag to avoid conflicts
        isUpdatingFromDrag.current = true;
        setAvatarOverlays(newOverlays);
        // Reset the flag after a short delay
        setTimeout(() => {
            isUpdatingFromDrag.current = false;
        }, 100);
    }, []);

    const handleAvatarFileChange = (e, avatarId) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const src = URL.createObjectURL(file);
        setSelectedAvatarId(avatarId);
        setAvatarCropSrc(src);
        setShowAvatarCropper(true);
        e.target.value = '';
    };

    const handleAvatarCropConfirm = (croppedUrl) => {
        setAvatarOverlays(prev => prev.map(ov =>
            ov.id === selectedAvatarId ? { ...ov, img: croppedUrl } : ov
        ));
        setShowAvatarCropper(false);
        setAvatarCropSrc(null);
        toast.success('Avatar updated in preview!');
    };

    const handleAvatarCropCancel = () => {
        setShowAvatarCropper(false);
        if (avatarCropSrc) URL.revokeObjectURL(avatarCropSrc);
        setAvatarCropSrc(null);
    };

    const resetAvatarToDefault = (avatarId) => {
        const original = postData?.overlayElements?.find(el => (el.id || el._id) === avatarId);
        const defaultImg = original?.img || viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

        setAvatarOverlays(prev => prev.map(ov =>
            ov.id === avatarId ? { ...ov, img: defaultImg } : ov
        ));
        toast('Reverted to default');
    };

    const addNewAvatar = () => {
        if (avatarOverlays.length >= 3) {
            toast.error("Maximum 3 photos allowed");
            return;
        }
        console.log("🛠️ [BirthdayEditor] Adding new manual avatar slot");
        const newId = `manual-avatar-${Date.now()}`;
        const newAvatar = {
            id: newId,
            type: 'avatar',
            x: 10,
            y: 10,
            w: 20,
            h: 20,
            img: viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            shape: 'circle',
            visible: true,
            zIndex: 110,
            isManual: true
        };
        console.log(`🖼️ [Add] New Avatar: ID=${newId} | Initial Position=(10%, 10%)`);
        setAvatarOverlays(prev => {
            const next = [...prev, newAvatar];
            console.log("🛠️ [BirthdayEditor] New overlay count:", next.length);
            return next;
        });
        setSelectedAvatarId(newId);
        setCurrentView('avatarEdit');
        toast.success('New avatar slot added!');
    };

    const removeAvatar = (avatarId) => {
        setAvatarOverlays(prev => prev.filter(ov => ov.id !== avatarId));
        setCurrentView(avatarOverlays.length > 2 ? 'avatarList' : 'root');
        toast.error('Avatar slot removed');
    };

    const handleTextUpdate = useCallback((newOverlays) => {
        console.log("🛠️ [BirthdayEditor] Updating text overlays", newOverlays.length);
        // Mark that we're updating from drag to avoid conflicts
        isUpdatingFromDrag.current = true;
        setTextOverlays(newOverlays);
        // Reset the flag after a short delay
        setTimeout(() => {
            isUpdatingFromDrag.current = false;
        }, 100);
    }, []);

    const addNewText = () => {
        console.log("🛠️ [BirthdayEditor] Adding new manual text slot");
        const newId = `manual-text-${Date.now()}`;
        const newText = {
            id: newId,
            type: 'text',
            x: 10,
            y: 10,
            w: 40,
            h: 10,
            content: "New Text Here",
            style: {
                fontSize: 24,
                color: '#ffffff',
                fontFamily: 'Inter',
                fontWeight: 'bold',
                align: 'center'
            },
            shape: 'rect',
            visible: true,
            zIndex: 150,
            isManual: true
        };
        console.log(`📝 [Add] New Text: ID=${newId} | Initial Position=(10%, 10%)`);
        setTextOverlays(prev => [...prev, newText]);
        setSelectedTextId(newId);
        setCurrentView('textEdit');
        toast.success('Text slot added!');
    };

    const removeText = (textId) => {
        setTextOverlays(prev => prev.filter(ov => ov.id !== textId));
        setCurrentView(textOverlays.length > 1 ? 'textList' : 'root');
        toast.error('Text slot removed');
    };

    const togglePreviewPlayPause = () => {
        const video = previewVideoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().then(() => setPreviewIsPlaying(true)).catch(() => { });
        } else {
            video.pause();
            setPreviewIsPlaying(false);
        }
    };

    const handlePreviewTimeUpdate = () => {
        if (previewVideoRef.current) {
            setPreviewCurrentTime(previewVideoRef.current.currentTime);
        }
    };

    const handlePreviewMetadataLoaded = () => {
        if (previewVideoRef.current) {
            setPreviewDuration(previewVideoRef.current.duration);
        }
    };

    const handlePreviewSeek = (e) => {
        const video = previewVideoRef.current;
        if (!video) return;
        const seekTime = parseFloat(e.target.value);
        video.currentTime = seekTime;
        setPreviewCurrentTime(seekTime);
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            setCurrentView('root');
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleDownload = async () => {
        const feedId = postData?._id;
        if (!feedId) return toast.error("Invalid feed!");

        const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.prithu.app';
        const token = localStorage.getItem('token');
        const activeUserId = localStorage.getItem('userId');

        if (!token || activeUserId === "guest") {
            return toast.error("Please login to download");
        }

        if (isDownloading) return;
        setIsDownloading(true);
        const toastId = toast.loading("Processing your video... This may take up to 30 seconds.", { id: 'dl-toast' });

        try {
            // Process all avatars: convert blobs to base64 if needed
            console.log("🚀 [Download] Starting coordinate capture for avatars...");
            const processedAvatars = await Promise.all(avatarOverlays.map(async (ov, idx) => {
                let imgUrl = ov.img;
                if (imgUrl && imgUrl.startsWith('blob:')) {
                    try {
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        imgUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = () => resolve(ov.img); // Fallback to original URL on error
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.error(`❌ [Download] Failed to convert avatar blob for slot ${idx + 1}:`, e);
                    }
                }

                const avatarData = {
                    id: ov.id,
                    x: parseFloat(Number(ov.x).toFixed(2)),
                    y: parseFloat(Number(ov.y).toFixed(2)),
                    w: parseFloat(Number(ov.w).toFixed(2)),
                    h: parseFloat(Number(ov.h).toFixed(2)),
                    img: imgUrl,
                    shape: ov.shape || ov.avatarConfig?.shape || 'circle'
                };

                console.log(`👤 [Download] Avatar Slot ${idx + 1}: ID=${avatarData.id} | x=${avatarData.x}% | y=${avatarData.y}% | size=${avatarData.w}x${avatarData.h}%`);
                return avatarData;
            }));

            console.log("🚀 [Download] Starting coordinate capture for text overlays...");
            const processedTextOverlays = textOverlays.map((ov, idx) => {
                const textData = {
                    id: ov.id,
                    type: ov.type,
                    x: parseFloat((ov.x ?? ov.xPercent ?? 10).toFixed(2)),
                    y: parseFloat((ov.y ?? ov.yPercent ?? 10).toFixed(2)),
                    w: parseFloat((ov.w ?? ov.wPercent ?? 40).toFixed(2)),
                    h: parseFloat((ov.h ?? ov.hPercent ?? 10).toFixed(2)),
                    content: ov.content,
                    style: ov.style
                };
                console.log(`📝 [Download] Text Slot ${idx + 1}: ID=${textData.id} | x=${textData.x}% | y=${textData.y}% | content="${textData.content?.substring(0, 20)}..."`);
                return textData;
            });

            const customMetadata = {
                avatarConfigs: processedAvatars,
                textOverlays: processedTextOverlays,
            };

            console.log("📡 [Download] Final Payload customMetadata:", customMetadata);

            // Use fetch + blob — form.submit() silently drops long-running file responses
            const response = await fetch(`${BACKEND_URL}/api/user/feed/${feedId}/birthday-download`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, userId: activeUserId, customMetadata })
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || errData.message || `Server error ${response.status}`);
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `birthday_poster_${feedId.slice(-4)}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success("Download complete!", { id: toastId });
        } catch (error) {
            console.error("Download error:", error);
            toast.error(error.message || "Download failed", { id: toastId });
        } finally {
            setIsDownloading(false);
        }
    };


    const MenuButton = ({ icon: Icon, label, onClick }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-2xl transition-all group"
        >
            <div className="p-2.5 bg-gray-100 group-hover:bg-blue-50 text-gray-600 group-hover:text-blue-600 rounded-xl transition-colors">
                <Icon fontSize="small" />
            </div>
            <span className="font-semibold text-gray-700">{label}</span>
            <ChevronIcon className="ml-auto text-gray-300 group-hover:text-blue-400" />
        </button>
    );

    const viewVariants = {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 }
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <>
            <style>{scrollbarStyles}</style>
            <AnimatePresence>
                {isOpen && (
                    <div className={`fixed inset-0 z-[9999] ${isMobile ? 'flex items-end justify-center' : ''}`}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className={`absolute inset-0 bg-black/60 ${!isMobile ? 'hidden' : ''}`}
                        />

                        <motion.div
                            ref={popupRef}
                            variants={isMobile ? { hidden: { y: "100%" }, visible: { y: 0 }, exit: { y: "100%" } } : { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`relative w-full bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-300
                                ${isMobile ? 'h-screen w-screen fixed inset-0 z-[10001]' : 'h-screen w-screen fixed inset-0 z-[10001]'}`}
                        >
                            <div className={`flex flex-col sm:flex-row h-full overflow-hidden bg-white`}>
                                {/* Mobile Header */}
                                {isMobile && (
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-[100]">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {currentView === 'root' ? 'Birthday Editor' :
                                                currentView === 'avatarList' ? 'Select Slot' :
                                                    currentView === 'avatarEdit' ? 'Edit Photo' :
                                                        currentView === 'textList' ? 'Select Text' : 'Edit Text'}
                                        </h3>
                                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                            <CloseIcon />
                                        </button>
                                    </div>
                                )}

                                {/* Editor Sidebar / Mobile Bottom Bar */}
                                <div className={`flex flex-col ${isMobile ? 'order-2 w-full border-t border-gray-100' : 'sm:w-[450px] border-r border-gray-100'} bg-white z-10`}>
                                    {!isMobile && (
                                        <div className="flex items-center gap-4 p-6 mb-2">
                                            <button
                                                onClick={() => {
                                                    if (currentView === 'root') onClose();
                                                    else setCurrentView('root');
                                                }}
                                                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 flex items-center gap-2 group"
                                            >
                                                <BackIcon fontSize="small" className="group-hover:-translate-x-0.5 transition-transform" />
                                                {currentView === 'root' && <span className="text-sm font-semibold">Back to Feed</span>}
                                            </button>
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                                                {currentView === 'root' ? 'Birthday Editor' :
                                                    currentView === 'avatarList' ? 'Select Avatar Slot' :
                                                        currentView === 'avatarEdit' ? 'Edit Photo & Shape' :
                                                            currentView === 'textEdit' ? 'Text Style & Size' : 'Text Selection'}
                                            </h3>
                                        </div>
                                    )}

                                    <div className={`${isMobile ? 'h-auto' : 'flex-1 overflow-y-auto pr-1 custom-scrollbar p-6'}`}>
                                        <AnimatePresence mode="wait">
                                            {currentView === 'root' && (
                                                <motion.div
                                                    key="root"
                                                    {...viewVariants}
                                                    className={`${isMobile ? 'flex items-center justify-around py-4 px-2' : 'space-y-2'}`}
                                                >
                                                    {isMobile ? (
                                                        <>
                                                            <button
                                                                onClick={() => setCurrentView('avatarList')}
                                                                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50">
                                                                    <AvatarIcon fontSize="small" />
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Avatars</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setCurrentView('textList')}
                                                                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50">
                                                                    <TextSizeIcon fontSize="small" />
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Text</span>
                                                            </button>
                                                            <button
                                                                onClick={handleDownload}
                                                                disabled={isDownloading}
                                                                className="flex flex-col items-center gap-1 p-2 text-blue-600 active:scale-95 transition-all"
                                                            >
                                                                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-blue-200 shadow-lg">
                                                                    {isDownloading ? (
                                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                    ) : (
                                                                        <DownloadIcon fontSize="small" />
                                                                    )}
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Download</span>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MenuButton
                                                                icon={AvatarIcon}
                                                                label="Edit Profile Avatars"
                                                                onClick={() => setCurrentView('avatarList')}
                                                            />
                                                            <MenuButton
                                                                icon={TextSizeIcon}
                                                                label="Edit Text & Style"
                                                                onClick={() => setCurrentView('textList')}
                                                            />
                                                            <p className="text-[10px] text-gray-400 px-4 mt-2 italic">
                                                                Note: Font and size changes apply to the current post only.
                                                            </p>
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}

                                            {currentView === 'avatarList' && (
                                                <motion.div
                                                    key="avatarList"
                                                    {...viewVariants}
                                                    className={`${isMobile ? 'fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 z-[200] max-h-[80vh] overflow-y-auto' : 'space-y-4'}`}
                                                >
                                                    {isMobile && (
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-bold text-gray-900">Select Slot</h4>
                                                            <button
                                                                onClick={() => setCurrentView('root')}
                                                                className="p-1.5 bg-gray-100 rounded-full text-gray-500"
                                                            >
                                                                <CloseIcon sx={{ fontSize: 18 }} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between px-1">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select an avatar</p>
                                                            {!isMobile && (
                                                                <button
                                                                    onClick={addNewAvatar}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                                                >
                                                                    <PlusIcon fontSize="inherit" /> Add New
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {avatarOverlays.map((ov, idx) => (
                                                                <button
                                                                    key={ov.id}
                                                                    onClick={() => {
                                                                        setSelectedAvatarId(ov.id);
                                                                        setCurrentView('avatarEdit');
                                                                    }}
                                                                    className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-all group text-left"
                                                                >
                                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-gray-100">
                                                                        <img src={ov.img} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                                                        <span className="font-bold text-gray-700 truncate w-full">Slot {idx + 1} {ov.isManual && <span className="text-[10px] text-blue-500 font-normal">(Added)</span>}</span>
                                                                        <span className="text-xs text-gray-400">Edit photo or shape</span>
                                                                    </div>
                                                                    <ChevronIcon className="ml-auto text-gray-300 group-hover:text-blue-400" />
                                                                </button>
                                                            ))}
                                                            {isMobile && (
                                                                <button
                                                                    onClick={addNewAvatar}
                                                                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-blue-200 hover:text-blue-500 transition-all"
                                                                >
                                                                    <PlusIcon fontSize="small" /> Add Another Slot
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'avatarEdit' && (
                                                <motion.div
                                                    key="avatarEdit"
                                                    {...viewVariants}
                                                    className={`${isMobile ? 'fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 z-[200] max-h-[80vh] overflow-y-auto' : 'space-y-4'}`}
                                                >
                                                    {isMobile && (
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-bold text-gray-900">Adjust Avatar</h4>
                                                            <button
                                                                onClick={() => setCurrentView('avatarList')}
                                                                className="p-1.5 bg-gray-100 rounded-full text-gray-500"
                                                            >
                                                                <CloseIcon sx={{ fontSize: 18 }} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="space-y-5">
                                                        {(() => {
                                                            const currentOv = avatarOverlays.find(o => o.id === selectedAvatarId);
                                                            if (!currentOv) return null;

                                                            return (
                                                                <>
                                                                    <input
                                                                        ref={avatarFileInputRef}
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => handleAvatarFileChange(e, currentOv.id)}
                                                                    />

                                                                    <div className="flex flex-col items-center gap-3 py-2">
                                                                        <div className="relative">
                                                                            <div className={`w-24 h-24 ${currentOv.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'} overflow-hidden border-4 border-blue-100 shadow-lg bg-gray-100`}>
                                                                                <img
                                                                                    src={currentOv.img}
                                                                                    alt="Current Avatar"
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            </div>
                                                                            <div className="absolute -bottom-1 -right-1 flex gap-1">
                                                                                <button
                                                                                    onClick={() => avatarFileInputRef.current?.click()}
                                                                                    title="Change photo"
                                                                                    className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95 border-2 border-white"
                                                                                >
                                                                                    <CameraIcon sx={{ fontSize: 14 }} />
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-3">
                                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shape</p>
                                                                        <div className="flex gap-3">
                                                                            <button
                                                                                onClick={() => setAvatarOverlays(prev => prev.map(o => o.id === selectedAvatarId ? { ...o, shape: 'circle' } : o))}
                                                                                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${currentOv.shape === 'circle' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                                            >
                                                                                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-gray-300" />
                                                                                <span className="text-[10px] font-bold text-gray-700">Circle</span>
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setAvatarOverlays(prev => prev.map(o => o.id === selectedAvatarId ? { ...o, shape: 'square' } : o))}
                                                                                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${currentOv.shape === 'square' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                                            >
                                                                                <div className="w-8 h-8 rounded-lg bg-gray-200 border-2 border-gray-300" />
                                                                                <span className="text-[10px] font-bold text-gray-700">Square</span>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-2">
                                                                        {avatarOverlays.length < 3 && (
                                                                            <button
                                                                                onClick={addNewAvatar}
                                                                                className="w-full py-4 px-6 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 text-blue-600 font-bold hover:bg-blue-100 hover:border-blue-300 transition-all flex items-center justify-center gap-2 mb-2"
                                                                            >
                                                                                <PlusIcon fontSize="small" />
                                                                                Add Another Photo ({avatarOverlays.length}/3)
                                                                            </button>
                                                                        )}
                                                                        {currentOv.isManual && (
                                                                            <button
                                                                                onClick={() => removeAvatar(currentOv.id)}
                                                                                className="w-full py-3 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all text-xs"
                                                                            >
                                                                                Remove Slot
                                                                            </button>
                                                                        )}
                                                                        {!currentOv.isManual && (
                                                                            <button
                                                                                onClick={() => resetAvatarToDefault(currentOv.id)}
                                                                                className="w-full py-3 px-4 bg-gray-50 text-gray-600 font-bold rounded-2xl transition-all text-xs"
                                                                            >
                                                                                Reset to Default
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'textList' && (
                                                <motion.div
                                                    key="textList"
                                                    {...viewVariants}
                                                    className={`${isMobile ? 'fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 z-[200] max-h-[80vh] overflow-y-auto' : 'space-y-4'}`}
                                                >
                                                    {isMobile && (
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-bold text-gray-900">Select Text</h4>
                                                            <button
                                                                onClick={() => setCurrentView('root')}
                                                                className="p-1.5 bg-gray-100 rounded-full text-gray-500"
                                                            >
                                                                <CloseIcon sx={{ fontSize: 18 }} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between px-1">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select text</p>
                                                            {!isMobile && (
                                                                <button
                                                                    onClick={addNewText}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm active:scale-95"
                                                                >
                                                                    <PlusIcon fontSize="inherit" /> Add New
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2">
                                                            {textOverlays.map((ov, idx) => (
                                                                <button
                                                                    key={ov.id}
                                                                    onClick={() => {
                                                                        setSelectedTextId(ov.id);
                                                                        setCurrentView('textEdit');
                                                                    }}
                                                                    className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-all group text-left"
                                                                >
                                                                    <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                                                                        <TextSizeIcon fontSize="small" className="text-gray-400" />
                                                                    </div>
                                                                    <div className="flex flex-col items-start flex-1 min-w-0">
                                                                        <span className="font-bold text-gray-700 truncate w-full">
                                                                            {ov.content || "Empty Text"}
                                                                        </span>
                                                                        <span className="text-[10px] text-gray-400 uppercase font-black">
                                                                            Slot {idx + 1}
                                                                        </span>
                                                                    </div>
                                                                    <ChevronIcon className="ml-auto text-gray-300 group-hover:text-blue-400" />
                                                                </button>
                                                            ))}
                                                            {isMobile && (
                                                                <button
                                                                    onClick={addNewText}
                                                                    className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-100 rounded-2xl text-gray-400 font-bold hover:border-blue-200 hover:text-blue-500 transition-all"
                                                                >
                                                                    <PlusIcon fontSize="small" /> Add Another Text
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'textEdit' && (
                                                <motion.div
                                                    key="textEdit"
                                                    {...viewVariants}
                                                    className={`${isMobile ? 'fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 z-[200] max-h-[80vh] overflow-y-auto' : 'space-y-6'}`}
                                                >
                                                    {isMobile && (
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-bold text-gray-900">Style Text</h4>
                                                            <button
                                                                onClick={() => setCurrentView('textList')}
                                                                className="p-1.5 bg-gray-100 rounded-full text-gray-500"
                                                            >
                                                                <CloseIcon sx={{ fontSize: 18 }} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {(() => {
                                                        const currentOv = textOverlays.find(o => o.id === selectedTextId);
                                                        if (!currentOv) return null;

                                                        return (
                                                            <div className="space-y-6">
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Content</p>
                                                                    <textarea
                                                                        value={currentOv.content}
                                                                        onChange={(e) => {
                                                                            const val = e.target.value;
                                                                            const words = val.trim().split(/\s+/).filter(w => w.length > 0);
                                                                            if (words.length > 50) {
                                                                                toast.error("Maximum 50 words allowed");
                                                                                return;
                                                                            }
                                                                            setTextOverlays(prev => prev.map(o => o.id === selectedTextId ? { ...o, content: val } : o));
                                                                        }}
                                                                        className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-gray-700 resize-none h-20 text-sm"
                                                                        placeholder="Type here..."
                                                                    />
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Font Family</p>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        {[
                                                                            { id: 'Inter', name: 'Modern' },
                                                                            { id: 'Oswald', name: 'Impact' },
                                                                            { id: 'Dancing Script', name: 'Elegant' },
                                                                            { id: 'Montserrat', name: 'Clean' },
                                                                            { id: 'Playfair Display', name: 'Classic' }
                                                                        ].map(f => (
                                                                            <button
                                                                                key={f.id}
                                                                                onClick={() => setTextOverlays(prev => prev.map(o => o.id === selectedTextId ? { ...o, style: { ...o.style, fontFamily: f.id } } : o))}
                                                                                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${currentOv.style.fontFamily === f.id ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                                            >
                                                                                <span className="text-sm font-bold" style={{ fontFamily: f.id }}>Aa</span>
                                                                                <span className="text-[10px] font-medium text-gray-500">{f.name}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Text Color</p>
                                                                    <div className="flex flex-wrap gap-2 px-1">
                                                                        {[
                                                                            '#ffffff', '#000000', '#ef4444', '#3b82f6', '#22c55e',
                                                                            '#eab308', '#a855f7', '#ec4899', '#f97316', '#14b8a6'
                                                                        ].map(c => (
                                                                            <button
                                                                                key={c}
                                                                                onClick={() => setTextOverlays(prev => prev.map(o => o.id === selectedTextId ? { ...o, style: { ...o.style, color: c } } : o))}
                                                                                className={`w-8 h-8 rounded-full border-2 transition-all ${currentOv.style.color === c ? 'border-blue-500 scale-110 shadow-md' : 'border-gray-100 scale-100'}`}
                                                                                style={{ backgroundColor: c }}
                                                                            />
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Font Style</p>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <button
                                                                            onClick={() => setTextOverlays(prev => prev.map(o => o.id === selectedTextId ? { ...o, style: { ...o.style, fontWeight: o.style.fontWeight === 'bold' ? 'normal' : 'bold' } } : o))}
                                                                            className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${currentOv.style.fontWeight === 'bold' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                                                                        >
                                                                            <span className="text-sm font-bold">B</span>
                                                                            <span className="text-[10px] font-bold uppercase">Bold</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setTextOverlays(prev => prev.map(o => o.id === selectedTextId ? { ...o, style: { ...o.style, fontStyle: o.style.fontStyle === 'italic' ? 'normal' : 'italic' } } : o))}
                                                                            className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${currentOv.style.fontStyle === 'italic' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 hover:bg-gray-50 text-gray-400'}`}
                                                                        >
                                                                            <span className="text-sm italic font-serif">I</span>
                                                                            <span className="text-[10px] font-bold uppercase">Italic</span>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div className="flex items-center justify-between px-1">
                                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Text Size</p>
                                                                        <span className="text-xs font-black text-blue-600">
                                                                            {Math.round((currentOv.style.fontSize || 24) * 1)}px
                                                                        </span>
                                                                    </div>
                                                                    <input
                                                                        type="range"
                                                                        min="12"
                                                                        max="120"
                                                                        step="1"
                                                                        value={currentOv.style.fontSize || 24}
                                                                        onChange={(e) => setTextOverlays(prev => prev.map(o => o.id === selectedTextId ? { ...o, style: { ...o.style, fontSize: parseInt(e.target.value) } } : o))}
                                                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                                    />
                                                                </div>

                                                                <div className="pt-4 flex flex-col gap-2">
                                                                    <button
                                                                        onClick={addNewText}
                                                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-2xl transition-all border border-green-100 active:scale-[0.98]"
                                                                    >
                                                                        <PlusIcon fontSize="small" />
                                                                        Add Another Text
                                                                    </button>
                                                                    {currentOv.isManual && (
                                                                        <button
                                                                            onClick={() => removeText(currentOv.id)}
                                                                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all border border-red-100 active:scale-[0.98]"
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                            Remove This Text
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Main Preview Area (Desktop & Mobile) */}
                                <div className="flex-1 min-w-0 bg-gray-50 relative overflow-hidden flex flex-col">
                                    <PosterPreviewArea
                                        onClose={onClose}
                                        previewContainerRef={previewContainerRef}
                                        postData={postData}
                                        mediaAreaRef={mediaAreaRef}
                                        previewVideoRef={previewVideoRef}
                                        previewIsPlaying={previewIsPlaying}
                                        previewIsMuted={previewIsMuted}
                                        togglePreviewPlayPause={togglePreviewPlayPause}
                                        setPreviewIsMuted={setPreviewIsMuted}
                                        setPreviewIsPlaying={setPreviewIsPlaying}
                                        viewer={viewer}
                                        prithuLogo={prithuLogo}
                                        avatarOverlays={avatarOverlays}
                                        handleAvatarUpdate={handleAvatarUpdate}
                                        selectedAvatarId={selectedAvatarId}
                                        setSelectedAvatarId={setSelectedAvatarId}
                                        setCurrentView={setCurrentView}
                                        removeAvatar={removeAvatar}
                                        isUpdatingFromDrag={isUpdatingFromDrag.current}
                                        textOverlays={textOverlays}
                                        handleTextUpdate={handleTextUpdate}
                                        selectedTextId={selectedTextId}
                                        setSelectedTextId={setSelectedTextId}
                                        removeText={removeText}
                                        handleDownload={handleDownload}
                                        isDownloading={isDownloading}
                                        previewDuration={previewDuration}
                                        previewCurrentTime={previewCurrentTime}
                                        onPreviewTimeUpdate={handlePreviewTimeUpdate}
                                        onPreviewMetadataLoaded={handlePreviewMetadataLoaded}
                                        onPreviewSeek={handlePreviewSeek}
                                        showOrigin={true}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {showAvatarCropper && avatarCropSrc && (
                <AvatarCropperModal
                    src={avatarCropSrc}
                    onCancel={handleAvatarCropCancel}
                    onConfirm={handleAvatarCropConfirm}
                />
            )}
        </>
    );
};

export default BirthdayEditPosterPopup;
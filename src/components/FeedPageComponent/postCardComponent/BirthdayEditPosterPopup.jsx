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
} from "@mui/icons-material";
import toast from "react-hot-toast";
import FeedOverlayRenderer from "./FeedOverlayRenderer";
import OverlayItem from "./OverlayItem";
import PostMedia from "./postMeadia";
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
    // Avatar & Text edit state
    const avatarFileInputRef = useRef(null);
    const [selectedAvatarId, setSelectedAvatarId] = useState(null);
    const [avatarCropSrc, setAvatarCropSrc] = useState(null);
    const [showAvatarCropper, setShowAvatarCropper] = useState(false);
    const [avatarOverlays, setAvatarOverlays] = useState([]);

    // Local Text Settings (Post-specific) - Transitioned to multi-slot
    const [textOverlays, setTextOverlays] = useState([]);
    const [selectedTextId, setSelectedTextId] = useState(null);

    useEffect(() => {
        if (!isOpen || !postData?.overlayElements) return;

        // Skip if already initialized to preserve manual edits
        if (avatarOverlays.length > 0 || textOverlays.length > 0) {
            console.log("🛠️ [BirthdayEditor] Overlays already initialized, skipping reset.");
            return;
        }

        console.log("🛠️ [BirthdayEditor] Initializing avatar overlays from postData", postData._id || postData.id);
        const avatarEls = postData.overlayElements
            .filter(el => el.type === 'avatar')
            .map(el => ({
                ...el,
                id: el.id || el._id || `avatar-${Math.random()}`,
                img: el.img || viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                shape: el.shape || el.avatarConfig?.shape || 'circle',
                visible: true
            }));

        if (avatarEls.length === 0) {
            avatarEls.push({
                id: 'interactive-avatar',
                type: 'avatar',
                x: 10,
                y: 75,
                w: 22,
                h: 22,
                img: viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                shape: 'circle',
                visible: true,
                zIndex: 100
            });
        }
        setAvatarOverlays(avatarEls);

        // Initialize text overlays
        console.log("🛠️ [BirthdayEditor] Initializing text overlays");
        const textEls = postData.overlayElements
            .filter(el => el.type === 'text' || el.type === 'username')
            .map((el, idx) => ({
                ...el,
                id: el.id || el._id || `text-${idx}`,
                content: el.content || (el.type === 'username' ? (viewer?.userName || viewer?.name || "User") : ""),
                style: el.textConfig || el.style || {},
                visible: el.visible !== false
            }));
        setTextOverlays(textEls);
    }, [isOpen, postData?._id || postData?.id]);

    const handleAvatarUpdate = useCallback((newOverlays) => {
        console.log("🛠️ [BirthdayEditor] Updating avatar overlays", newOverlays.length);
        setAvatarOverlays(newOverlays);
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
        console.log("🛠️ [BirthdayEditor] Adding new manual avatar slot");
        const newId = `manual-avatar-${Date.now()}`;
        const newAvatar = {
            id: newId,
            type: 'avatar',
            x: 50,
            y: 50,
            w: 20,
            h: 20,
            img: viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
            shape: 'circle',
            visible: true,
            zIndex: 110,
            isManual: true
        };
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
        setTextOverlays(newOverlays);
    }, []);

    const addNewText = () => {
        console.log("🛠️ [BirthdayEditor] Adding new manual text slot");
        const newId = `manual-text-${Date.now()}`;
        const newText = {
            id: newId,
            type: 'text',
            x: 50,
            y: 50,
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

        const toastId = toast.loading("Processing your video... This may take up to 30 seconds.", { id: 'dl-toast' });

        try {
            // Process all avatars: convert blobs to base64 if needed
            const processedAvatars = await Promise.all(avatarOverlays.map(async (ov) => {
                let imgUrl = ov.img;
                if (imgUrl && imgUrl.startsWith('blob:')) {
                    try {
                        const response = await fetch(imgUrl);
                        const blob = await response.blob();
                        imgUrl = await new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        });
                    } catch (e) {
                        console.error("Failed to convert avatar blob:", e);
                    }
                }
                return {
                    x: ov.x,
                    y: ov.y,
                    w: ov.w,
                    h: ov.h,
                    img: imgUrl,
                    shape: ov.shape || ov.avatarConfig?.shape || 'circle'
                };
            }));

            const customMetadata = {
                avatarConfigs: processedAvatars,
                textOverlays: textOverlays.map(ov => ({
                    id: ov.id,
                    type: ov.type,
                    x: ov.x,
                    y: ov.y,
                    w: ov.w,
                    h: ov.h,
                    content: ov.content,
                    style: ov.style
                })),
                footerConfig: {
                    backgroundColor: dominantColor || "#000000",
                    showElements: postData?.footerDisplay?.showElements
                }
            };

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
                            drag={!isMobile ? false : true}
                            dragMomentum={false}
                            dragElastic={0.1}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className={`relative w-full bg-white shadow-2xl overflow-hidden flex flex-col transition-all duration-300
                ${isMobile ? 'rounded-t-3xl pb-10 min-h-[300px]' : 'h-screen w-screen fixed inset-0 z-[10001]'}`}
                        >
                            <div className={`flex flex-col sm:flex-row h-full overflow-hidden ${isMobile ? '' : 'h-full bg-white'}`}>
                                <div className={`flex flex-col ${isMobile ? 'w-full' : 'sm:w-[450px] border-r border-gray-100'} p-6 bg-white z-10`}>
                                    <div className="flex items-center gap-4 mb-8">
                                        {(currentView !== 'root' || !isMobile) && (
                                            <button
                                                onClick={() => {
                                                    if (currentView === 'root') onClose();
                                                    else setCurrentView('root');
                                                }}
                                                className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-500 flex items-center gap-2 group"
                                            >
                                                <BackIcon fontSize="small" className="group-hover:-translate-x-0.5 transition-transform" />
                                                {!isMobile && currentView === 'root' && <span className="text-sm font-semibold">Back to Feed</span>}
                                            </button>
                                        )}
                                        {currentView !== 'root' && (
                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                                                {currentView === 'avatarList' ? 'Select Avatar Slot' :
                                                    currentView === 'avatarEdit' ? 'Edit Photo & Shape' :
                                                        currentView === 'textEdit' ? 'Text Style & Size' : 'Birthday Editor'}
                                            </h3>
                                        )}
                                        {currentView === 'root' && (
                                            <h3 className="text-xl font-bold text-gray-900">Birthday Editor</h3>
                                        )}
                                        {isMobile && (
                                            <div className="ml-auto flex items-center gap-1">
                                                <button
                                                    onClick={handleDownload}
                                                    className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                    title="Download"
                                                >
                                                    <DownloadIcon fontSize="small" />
                                                </button>
                                                <button
                                                    onClick={onClose}
                                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                                >
                                                    <CloseIcon />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                        <AnimatePresence mode="wait">
                                            {currentView === 'root' && (
                                                <motion.div key="root" {...viewVariants} className="space-y-2">
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
                                                </motion.div>
                                            )}

                                            {currentView === 'avatarList' && (
                                                <motion.div key="avatarList" {...viewVariants} className="space-y-3">
                                                    <div className="flex items-center justify-between px-1">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select an avatar to edit</p>
                                                        <button
                                                            onClick={addNewAvatar}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                                                        >
                                                            <PlusIcon fontSize="inherit" /> Add New
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {avatarOverlays.map((ov, idx) => (
                                                            <button
                                                                key={ov.id}
                                                                onClick={() => {
                                                                    setSelectedAvatarId(ov.id);
                                                                    setCurrentView('avatarEdit');
                                                                }}
                                                                className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-all group"
                                                            >
                                                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-gray-100">
                                                                    <img src={ov.img} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex flex-col items-start">
                                                                    <span className="font-bold text-gray-700">Avatar Slot {idx + 1} {ov.isManual && <span className="text-[10px] text-blue-500 font-normal">(Added)</span>}</span>
                                                                    <span className="text-xs text-gray-400">Tap to edit photo or shape</span>
                                                                </div>
                                                                <ChevronIcon className="ml-auto text-gray-300 group-hover:text-blue-400" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'avatarEdit' && (
                                                <motion.div key="avatarEdit" {...viewVariants} className="space-y-5">
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
                                                                        <div className={`w-28 h-28 ${currentOv.shape === 'circle' ? 'rounded-full' : 'rounded-2xl'} overflow-hidden border-4 border-blue-100 shadow-lg bg-gray-100`}>
                                                                            <img
                                                                                src={currentOv.img}
                                                                                alt="Current Avatar"
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                        </div>
                                                                        <div className="absolute -bottom-1 -right-1 flex gap-1">
                                                                            <button
                                                                                onClick={addNewAvatar}
                                                                                title="Add another slot"
                                                                                className="p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all active:scale-95 border-2 border-white"
                                                                            >
                                                                                <PlusIcon sx={{ fontSize: 16 }} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => avatarFileInputRef.current?.click()}
                                                                                title="Change photo"
                                                                                className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95 border-2 border-white"
                                                                            >
                                                                                <CameraIcon sx={{ fontSize: 16 }} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-sm text-gray-500 text-center">
                                                                        Slot: {avatarOverlays.findIndex(o => o.id === selectedAvatarId) + 1}
                                                                    </p>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avatar Shape</p>
                                                                    <div className="flex gap-3">
                                                                        <button
                                                                            onClick={() => setAvatarOverlays(prev => prev.map(o => o.id === selectedAvatarId ? { ...o, shape: 'circle' } : o))}
                                                                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${currentOv.shape === 'circle' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                                        >
                                                                            <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-300" />
                                                                            <span className="text-xs font-bold text-gray-700">Circle</span>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => setAvatarOverlays(prev => prev.map(o => o.id === selectedAvatarId ? { ...o, shape: 'square' } : o))}
                                                                            className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${currentOv.shape === 'square' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                                        >
                                                                            <div className="w-10 h-10 rounded-lg bg-gray-200 border-2 border-gray-300" />
                                                                            <span className="text-xs font-bold text-gray-700">Square</span>
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <button
                                                                        onClick={() => avatarFileInputRef.current?.click()}
                                                                        className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl transition-all border border-blue-100 active:scale-[0.98]"
                                                                    >
                                                                        <CameraIcon fontSize="small" />
                                                                        Choose New Photo
                                                                    </button>
                                                                    {currentOv.isManual ? (
                                                                        <button
                                                                            onClick={() => removeAvatar(currentOv.id)}
                                                                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl transition-all border border-red-100 active:scale-[0.98]"
                                                                        >
                                                                            <CloseIcon fontSize="small" />
                                                                            Remove This Slot
                                                                        </button>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => resetAvatarToDefault(currentOv.id)}
                                                                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-2xl transition-all border border-gray-100 active:scale-[0.98]"
                                                                        >
                                                                            Reset to Default
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                <div className="pt-2 pb-1">
                                                                    <p className="text-xs text-gray-400 text-center">
                                                                        💡 Drag &amp; resize elements directly on the preview.
                                                                    </p>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}

                                            {currentView === 'textList' && (
                                                <motion.div key="textList" {...viewVariants} className="space-y-3">
                                                    <div className="flex items-center justify-between px-1">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tap a text slot to edit</p>
                                                        <button
                                                            onClick={addNewText}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-all shadow-sm active:scale-95"
                                                        >
                                                            <PlusIcon fontSize="inherit" /> Add New
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {textOverlays.map((ov, idx) => (
                                                            <button
                                                                key={ov.id}
                                                                onClick={() => {
                                                                    setSelectedTextId(ov.id);
                                                                    setCurrentView('textEdit');
                                                                }}
                                                                className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-all group"
                                                            >
                                                                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200">
                                                                    <TextSizeIcon fontSize="small" className="text-gray-400" />
                                                                </div>
                                                                <div className="flex flex-col items-start overflow-hidden">
                                                                    <span className="font-bold text-gray-700 truncate w-full">
                                                                        {ov.content || "Empty Text"}
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-400 uppercase font-black">
                                                                        Slot {idx + 1} {ov.isManual && <span className="text-blue-500">(Added)</span>}
                                                                    </span>
                                                                </div>
                                                                <ChevronIcon className="ml-auto text-gray-300 group-hover:text-blue-400" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'textEdit' && (
                                                <motion.div key="textEdit" {...viewVariants} className="space-y-6">
                                                    {(() => {
                                                        const currentOv = textOverlays.find(o => o.id === selectedTextId);
                                                        if (!currentOv) return null;

                                                        return (
                                                            <>
                                                                <div className="space-y-2">
                                                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">Text Content</p>
                                                                    <textarea
                                                                        value={currentOv.content}
                                                                        onChange={(e) => setTextOverlays(prev => prev.map(o => o.id === selectedTextId ? { ...o, content: e.target.value } : o))}
                                                                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-gray-700 resize-none h-24"
                                                                        placeholder="Type your message..."
                                                                    />
                                                                </div>

                                                                <div className="space-y-4">
                                                                    <div className="flex items-center gap-2 px-1">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Font Family</p>
                                                                    </div>
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
                                                            </>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {!isMobile && (
                                    <div className="flex-1 bg-gray-50 flex flex-col relative overflow-hidden">
                                        <button
                                            onClick={onClose}
                                            className="absolute top-4 right-4 z-[100] p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-500 hover:text-gray-900 transition-all"
                                        >
                                            <CloseIcon />
                                        </button>

                                        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
                                            <div className="relative w-full max-w-[400px] flex flex-col items-center">
                                                <div
                                                    className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 relative flex flex-col scale-[0.85] origin-top ring-8 ring-gray-100/50"
                                                    ref={previewContainerRef}
                                                >
                                                    <div className="relative flex-1 w-full overflow-hidden flex flex-col items-center justify-center">
                                                        <PostMedia
                                                            type={postData?.type || 'image'}
                                                            contentUrl={postData?.contentUrl}
                                                            ref={mediaAreaRef}
                                                            aspectRatio={postData?.designMetadata?.canvasSettings?.aspectRatio || "1:1"}
                                                            isTemplate={true}
                                                            viewMode="list"
                                                            videoRef={previewVideoRef}
                                                            isPlaying={previewIsPlaying}
                                                            isMuted={previewIsMuted}
                                                            togglePlayPause={togglePreviewPlayPause}
                                                            toggleMute={() => setPreviewIsMuted(m => !m)}
                                                            onVideoPlay={() => setPreviewIsPlaying(true)}
                                                            onVideoPause={() => setPreviewIsPlaying(false)}
                                                            onVideoEnded={() => setPreviewIsPlaying(false)}
                                                            overlaySlot={
                                                                <>
                                                                    <div className="absolute inset-0 pointer-events-none z-30">
                                                                        <FeedOverlayRenderer
                                                                            overlayElements={postData?.overlayElements?.filter(el => el.type !== 'avatar' && el.type !== 'text' && el.type !== 'username')}
                                                                            viewer={viewer}
                                                                            visibilityConfig={postData?.footerDisplay?.showElements}
                                                                            prithuLogoUrl={prithuLogo}
                                                                            isVisible={true}
                                                                        />
                                                                    </div>

                                                                    {avatarOverlays.map(ov => (
                                                                        <OverlayItem
                                                                            key={ov.id}
                                                                            ov={ov}
                                                                            containerRef={mediaAreaRef}
                                                                            onUpdate={handleAvatarUpdate}
                                                                            onSelect={(id) => {
                                                                                setSelectedAvatarId(id);
                                                                                setCurrentView('avatarEdit');
                                                                            }}
                                                                            overlays={avatarOverlays}
                                                                            isAvatar={true}
                                                                            removeOverlay={removeAvatar}
                                                                        />
                                                                    ))}

                                                                    {textOverlays.map(ov => (
                                                                        <OverlayItem
                                                                            key={ov.id}
                                                                            ov={ov}
                                                                            containerRef={mediaAreaRef}
                                                                            onUpdate={handleTextUpdate}
                                                                            onSelect={(id) => {
                                                                                setSelectedTextId(id);
                                                                                setCurrentView('textEdit');
                                                                            }}
                                                                            overlays={textOverlays}
                                                                            isAvatar={false}
                                                                            removeOverlay={removeText}
                                                                        />
                                                                    ))}
                                                                </>
                                                            }
                                                            footerSlot={
                                                                postData?.hasFooter && (
                                                                    <div
                                                                        className="relative w-full z-30 shrink-0 flex flex-col border-t border-white/10"
                                                                        style={{
                                                                            backgroundColor: dominantColor || '#000000',
                                                                            paddingTop: `${8 * usernameSize}px`,
                                                                            paddingBottom: `${8 * usernameSize}px`,
                                                                            gap: `${4 * usernameSize}px`,
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center justify-between px-4">
                                                                            <span className="text-white font-bold truncate" style={{ fontSize: `14px` }}>
                                                                                {viewer?.userName || "Username"}
                                                                            </span>
                                                                            <div className="flex items-center gap-2">
                                                                                {[1, 2].map(id => (
                                                                                    <div key={id} className="bg-white/20 rounded-full" style={{ padding: `6px` }}>
                                                                                        <div style={{ width: `14px`, height: `14px` }} className="bg-white/40 rounded-full" />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center justify-between px-4">
                                                                            <span className="text-white/80 text-[10px]" style={{ fontSize: `12px` }}>{viewer?.email || "email@example.com"}</span>
                                                                            <span className="text-white/80 text-[10px]" style={{ fontSize: `12px` }}>{viewer?.phoneNumber || "+91 9999999999"}</span>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </div>


                                            </div>
                                            <button
                                                onClick={handleDownload}
                                                title="Download Poster"
                                                className="
  absolute bottom-12 right-20 z-50
  flex items-center justify-center gap-2
  px-6 py-4
  rounded-2xl
  bg-gradient-to-br from-blue-600 to-blue-800
  text-white
  shadow-[0_10px_25px_rgba(0,0,0,0.4)]
  overflow-hidden
  transition-all duration-300
  hover:scale-105
  hover:shadow-[0_15px_35px_rgba(59,130,246,0.6)]
  active:scale-95
  "
                                            >
                                                <span className="
    absolute inset-0 
    -translate-x-full 
    bg-gradient-to-r 
    from-transparent 
    via-white/20 
    to-transparent 
    group-hover:translate-x-full 
    transition-transform 
    duration-1000
  " />

                                                <DownloadIcon
                                                    fontSize="medium"
                                                    className="
       relative z-10
       transition-transform duration-300
       group-hover:scale-110
       group-hover:rotate-6
     "
                                                />

                                                <span className="relative z-10 font-medium tracking-wide">
                                                    Download
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                )}
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

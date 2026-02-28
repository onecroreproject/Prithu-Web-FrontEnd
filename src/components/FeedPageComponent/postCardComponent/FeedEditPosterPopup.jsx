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

const FeedEditPosterPopup = ({
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
    const [previewIsPlaying, setPreviewIsPlaying] = useState(false);
    const [previewIsMuted, setPreviewIsMuted] = useState(true);
    const [previewDuration, setPreviewDuration] = useState(0);
    const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
    const [dragInProgress, setDragInProgress] = useState(false);
    const isUpdatingFromDrag = useRef(false);
    // Avatar edit state
    const avatarFileInputRef = useRef(null);
    const [customAvatarUrl, setCustomAvatarUrl] = useState(null);
    const [avatarCropSrc, setAvatarCropSrc] = useState(null);
    const [showAvatarCropper, setShowAvatarCropper] = useState(false);
    const [avatarOverlays, setAvatarOverlays] = useState([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [avatarShape, setAvatarShape] = useState(() => {
        const firstAvatar = postData?.overlayElements?.find(el => el.type === 'avatar');
        return firstAvatar?.shape || firstAvatar?.avatarConfig?.shape || 'circle';
    }); // circle or square

    useEffect(() => {
        if (!isOpen || !postData?.overlayElements) return;

        // Check if we already have overlays initialized for this specific feed
        // This prevents resetting manual resizes/drags when the parent re-renders
        if (avatarOverlays.length > 0) {
            // Just update images if needed, but don't reset positions/sizes
            setAvatarOverlays(prev => prev.map(ov => ({
                ...ov,
                img: customAvatarUrl || ov.img // preserve manual crop
            })));
            return;
        }

        console.log("🛠️ [FeedEditor] Initializing avatar overlays...");
        const avatarEls = postData.overlayElements
            .filter(el => el.type === 'avatar')
            .map(el => ({
                ...el,
                id: el.id || el._id || `avatar-${Math.random()}`,
                x: el.xPercent ?? el.x ?? 10,
                y: el.yPercent ?? el.y ?? 75,
                w: el.wPercent ?? el.w ?? 22,
                h: el.hPercent ?? el.h ?? 22,
                img: customAvatarUrl || el.img || viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                shape: avatarShape, // Always use local state shape for consistency
                visible: true
            }));

        if (avatarEls.length === 0) {
            avatarEls.push({
                id: 'interactive-avatar',
                type: 'avatar',
                x: 10,
                y: 72, // Slightly adjusted default for better fit
                w: 22,
                h: 22,
                img: customAvatarUrl || viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                shape: avatarShape,
                visible: true,
                zIndex: 100
            });
        }
        setAvatarOverlays(avatarEls);
        if (avatarEls.length > 0 && !selectedAvatarId) {
            setSelectedAvatarId(avatarEls[0].id);
        }
    }, [isOpen, postData?._id, viewer?._id]); // Stable dependencies

    // Handle Individual Shape Updates
    useEffect(() => {
        setAvatarOverlays(prev => prev.map(ov => ({ ...ov, shape: avatarShape })));
    }, [avatarShape]);

    const handleAvatarUpdate = (newOverlays) => {
        setAvatarOverlays(newOverlays);
    };

    const handleAvatarFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const src = URL.createObjectURL(file);
        setAvatarCropSrc(src);
        setShowAvatarCropper(true);
        e.target.value = '';
    };

    const handleAvatarCropConfirm = (croppedUrl) => {
        if (customAvatarUrl && customAvatarUrl.startsWith('blob:')) URL.revokeObjectURL(customAvatarUrl);
        setCustomAvatarUrl(croppedUrl);

        // Also update the selected avatar's image in the list
        // Fallback to first avatar if none selected
        const targetId = selectedAvatarId || (avatarOverlays.length > 0 ? avatarOverlays[0].id : null);

        if (targetId) {
            setAvatarOverlays(prev => prev.map(ov =>
                ov.id === targetId ? { ...ov, img: croppedUrl } : ov
            ));
            if (!selectedAvatarId) setSelectedAvatarId(targetId);
        }

        setShowAvatarCropper(false);
        setAvatarCropSrc(null);
        toast.success('Avatar updated in preview!');
    };

    const handleAvatarCropCancel = () => {
        setShowAvatarCropper(false);
        if (avatarCropSrc) URL.revokeObjectURL(avatarCropSrc);
        setAvatarCropSrc(null);
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
                footerConfig: {
                    backgroundColor: dominantColor || "#000000",
                    fontFamily: footerStyle !== 'inherit' ? footerStyle : undefined,
                    usernameScale: usernameSize,
                    emailScale: emailSize,
                    phoneScale: phoneSize,
                    socialScale: socialSize,
                    showElements: postData?.footerDisplay?.showElements,
                    enabled: true,
                    showFooter: true
                }
            };

            // Use fetch + blob — form.submit() silently drops long-running file responses
            const response = await fetch(`${BACKEND_URL}/api/user/feed/${feedId}/direct-download`, {
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
            a.download = `poster_${feedId.slice(-4)}.mp4`;
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


    const fontOptions = [
        { label: "Default", value: "inherit" },
        { label: "Serif", value: "'Playfair Display', serif" },
        { label: "Mono", value: "'Fira Code', monospace" },
        { label: "Script", value: "'Dancing Script', cursive" },
        { label: "Modern", value: "'Montserrat', sans-serif" },
        { label: "Display", value: "'Pacifico', cursive" },
    ];

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

    const SliderControl = ({ icon: Icon, label, value, onChange, colorClass = "blue" }) => (
        <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-800">
                <div className={`p-2 bg-${colorClass}-50 text-${colorClass}-600 rounded-lg`}>
                    <Icon fontSize="small" />
                </div>
                <span className="font-semibold">{label}</span>
                <span className="ml-auto text-sm text-gray-500 font-medium">
                    {Math.round(value * 100)}%
                </span>
            </div>
            <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${colorClass}-600`}
            />
        </div>
    );

    const viewVariants = {
        initial: { x: 20, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -20, opacity: 0 }
    };

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <>
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
                                            {currentView === 'root' ? 'Feed Editor' :
                                                currentView === 'avatarEdit' ? 'Profile Avatar' :
                                                    currentView === 'style' ? 'Footer Style' : 'Element Sizes'}
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
                                                {currentView === 'root' ? 'Feed Editor' :
                                                    currentView === 'avatarEdit' ? 'Profile Avatar' :
                                                        currentView === 'style' ? 'Footer Style' : 'Element Sizes'}
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
                                                                onClick={() => setCurrentView('avatarEdit')}
                                                                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50">
                                                                    <AvatarIcon fontSize="small" />
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Avatar</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setCurrentView('style')}
                                                                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50">
                                                                    <FontStyleIcon fontSize="small" />
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Style</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setCurrentView('sizes')}
                                                                className="flex flex-col items-center gap-1 p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                                            >
                                                                <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-blue-50">
                                                                    <FooterIcon fontSize="small" />
                                                                </div>
                                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Sizes</span>
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
                                                            <MenuButton icon={AvatarIcon} label="Edit Profile Avatar" onClick={() => setCurrentView('avatarEdit')} />
                                                            <MenuButton icon={FontStyleIcon} label="Footer Font Style" onClick={() => setCurrentView('style')} />
                                                            <MenuButton icon={FooterIcon} label="Footer Element Sizes" onClick={() => setCurrentView('sizes')} />
                                                        </>
                                                    )}
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
                                                            <h4 className="font-bold text-gray-900">Profile Avatar</h4>
                                                            <button onClick={() => setCurrentView('root')} className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                                                                <CloseIcon sx={{ fontSize: 18 }} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="space-y-5">
                                                        <input
                                                            ref={avatarFileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={handleAvatarFileChange}
                                                        />

                                                        <div className="flex flex-col items-center gap-3 py-2">
                                                            <div className="relative">
                                                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg bg-gray-100">
                                                                    <img
                                                                        src={customAvatarUrl || viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                                                                        alt="Current Avatar"
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                <button
                                                                    onClick={() => avatarFileInputRef.current?.click()}
                                                                    className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all active:scale-95"
                                                                >
                                                                    <CameraIcon sx={{ fontSize: 16 }} />
                                                                </button>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-3">
                                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shape</p>
                                                            <div className="flex gap-3">
                                                                <button
                                                                    onClick={() => {
                                                                        setAvatarShape('circle');
                                                                        setAvatarOverlays(prev => prev.map(ov => ({ ...ov, shape: 'circle' })));
                                                                    }}
                                                                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${avatarShape === 'circle' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                                >
                                                                    <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-300" />
                                                                    <span className="text-xs font-bold text-gray-700">Circle</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setAvatarShape('square');
                                                                        setAvatarOverlays(prev => prev.map(ov => ({ ...ov, shape: 'square' })));
                                                                    }}
                                                                    className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${avatarShape === 'square' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
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
                                                            {customAvatarUrl && (
                                                                <button
                                                                    onClick={() => setCustomAvatarUrl(null)}
                                                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-2xl transition-all border border-gray-100 active:scale-[0.98]"
                                                                >
                                                                    Reset to Default
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'style' && (
                                                <motion.div
                                                    key="style"
                                                    {...viewVariants}
                                                    className={`${isMobile ? 'fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 z-[200] max-h-[80vh] overflow-y-auto' : 'space-y-6'}`}
                                                >
                                                    {isMobile && (
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-bold text-gray-900">Footer Style</h4>
                                                            <button onClick={() => setCurrentView('root')} className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                                                                <CloseIcon sx={{ fontSize: 18 }} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-2 gap-3 pb-6">
                                                        {fontOptions.map((opt) => (
                                                            <button
                                                                key={opt.value}
                                                                onClick={() => setFooterStyle(opt.value)}
                                                                className={`py-4 px-2 rounded-2xl text-xl transition-all h-20 flex items-center justify-center text-center border-2 ${footerStyle === opt.value ? 'bg-purple-600 text-white border-purple-400 shadow-md' : 'bg-gray-50 text-gray-800 border-transparent hover:bg-gray-100'}`}
                                                                style={{ fontFamily: opt.value }}
                                                            >
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'sizes' && (
                                                <motion.div
                                                    key="sizes"
                                                    {...viewVariants}
                                                    className={`${isMobile ? 'fixed inset-x-0 bottom-0 bg-white rounded-t-[32px] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] p-8 z-[200] max-h-[80vh] overflow-y-auto' : 'space-y-6'}`}
                                                >
                                                    {isMobile && (
                                                        <div className="flex items-center justify-between mb-6">
                                                            <h4 className="font-bold text-gray-900">Element Sizes</h4>
                                                            <button onClick={() => setCurrentView('root')} className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                                                                <CloseIcon sx={{ fontSize: 18 }} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="space-y-6 pb-6">
                                                        <SliderControl label="Username" icon={UserIcon} value={usernameSize} onChange={setUsernameSize} colorClass="blue" />
                                                        <SliderControl label="Social" icon={SocialIcon} value={socialSize} onChange={setSocialSize} colorClass="purple" />
                                                        <SliderControl label="Email" icon={EmailIcon} value={emailSize} onChange={setEmailSize} colorClass="indigo" />
                                                        <SliderControl label="Phone" icon={PhoneIcon} value={phoneSize} onChange={setPhoneSize} colorClass="green" />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Preview Area */}
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
                                        setSelectedAvatarId={setSelectedAvatarId}
                                        setCurrentView={setCurrentView}
                                        removeAvatar={() => { }}
                                        isUpdatingFromDrag={isUpdatingFromDrag.current}
                                        textOverlays={[]}
                                        handleTextUpdate={() => { }}
                                        setSelectedTextId={() => { }}
                                        removeText={() => { }}
                                        handleDownload={handleDownload}
                                        isDownloading={isDownloading}
                                        previewDuration={previewDuration}
                                        previewCurrentTime={previewCurrentTime}
                                        onPreviewTimeUpdate={handlePreviewTimeUpdate}
                                        onPreviewMetadataLoaded={handlePreviewMetadataLoaded}
                                        onPreviewSeek={handlePreviewSeek}
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
                                                        <span className="text-white font-bold truncate" style={{ fontSize: `${14 * usernameSize}px`, fontFamily: footerStyle }}>
                                                            {viewer?.userName || "Username"}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {[1, 2].map(id => (
                                                                <div key={id} className="bg-white/20 rounded-full" style={{ padding: `${6 * socialSize}px` }}>
                                                                    <div style={{ width: `${14 * socialSize}px`, height: `${14 * socialSize}px` }} className="bg-white/40 rounded-full" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between px-4">
                                                        <span className="text-white/80 text-[10px]" style={{ fontSize: `${12 * emailSize}px`, fontFamily: footerStyle }}>{viewer?.email || "email@example.com"}</span>
                                                        <span className="text-white/80 text-[10px]" style={{ fontSize: `${12 * phoneSize}px`, fontFamily: footerStyle }}>{viewer?.phoneNumber || "+91 9999999999"}</span>
                                                    </div>
                                                </div>
                                            )
                                        }
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

export default FeedEditPosterPopup;

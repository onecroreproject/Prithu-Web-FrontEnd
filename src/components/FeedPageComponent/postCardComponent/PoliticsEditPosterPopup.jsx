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
    Portrait as LeaderIcon,
    Public as StateIcon,
    Download as DownloadIcon,
    AccountCircle as AvatarIcon,
    PhotoCamera as CameraIcon,
    Check as CheckIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import FeedOverlayRenderer from "./FeedOverlayRenderer";
import LeaderOverlayRenderer from "./LeaderOverlayRenderer";
import OverlayItem from "./OverlayItem";
import PostMedia from "./postMeadia";
import PosterPreviewArea from "./PosterPreviewArea";
import prithuLogo from "../../../assets/prithulogo.png";

// ------- Contrast Color Utility -------
// Returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds.
// Handles hex (#rgb, #rrggbb), rgb(...), rgba(...) formats.
function getContrastColor(color) {
    if (!color) return '#ffffff';
    let r = 0, g = 0, b = 0;
    const s = color.trim();
    // rgb() / rgba()
    const rgbMatch = s.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/);
    if (rgbMatch) {
        r = parseInt(rgbMatch[1]); g = parseInt(rgbMatch[2]); b = parseInt(rgbMatch[3]);
    } else {
        // Strip # and expand shorthand #abc → #aabbcc
        let hex = s.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length === 6) {
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            // Unknown format — try canvas fallback
            try {
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 1;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = s;
                ctx.fillRect(0, 0, 1, 1);
                const d = ctx.getImageData(0, 0, 1, 1).data;
                r = d[0]; g = d[1]; b = d[2];
            } catch { return '#ffffff'; }
        }
    }
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

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

const PoliticsEditPosterPopup = ({
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
    selectedParty,
    setSelectedParty,
    selectedState,
    setSelectedState,
    initialLeaders = [],
    onUpdateLeaders,
    postData,
    dominantColor,
    viewer
}) => {
    const popupRef = useRef(null);
    const previewContainerRef = useRef(null);
    const mediaAreaRef = useRef(null);
    const previewVideoRef = useRef(null);
    const [currentView, setCurrentView] = useState('root'); // root, overlay, style, sizes, stateList, partyList, leaderList
    const [states, setStates] = useState([]);
    const [loadingStates, setLoadingStates] = useState(false);
    const [parties, setParties] = useState([]);
    const [loadingParties, setLoadingParties] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(initialLeaders);
    const [previewIsPlaying, setPreviewIsPlaying] = useState(false);
    const [previewIsMuted, setPreviewIsMuted] = useState(true);
    // Avatar edit state
    const avatarFileInputRef = useRef(null);
    const [customAvatarUrl, setCustomAvatarUrl] = useState(null);
    const [avatarCropSrc, setAvatarCropSrc] = useState(null);
    const [showAvatarCropper, setShowAvatarCropper] = useState(false);
    const [avatarOverlays, setAvatarOverlays] = useState([]);
    const [selectedAvatarId, setSelectedAvatarId] = useState(null);
    const [avatarShape, setAvatarShape] = useState(() => {
        const firstAvatar = postData?.overlayElements?.find(el => el.type === 'avatar');
        return firstAvatar?.shape || firstAvatar?.avatarConfig?.shape || 'circle';
    }); // circle or square
    const [isFooterEnabled, setIsFooterEnabled] = useState(false);
    const isFooterEnabledRef = useRef(false); // ref mirror to avoid stale closures in handleDownload
    const [isDownloading, setIsDownloading] = useState(false);
    const [previewDuration, setPreviewDuration] = useState(0);
    const [previewCurrentTime, setPreviewCurrentTime] = useState(0);

    // Keep ref in sync with state so handleDownload always reads current value
    useEffect(() => { isFooterEnabledRef.current = isFooterEnabled; }, [isFooterEnabled]);

    // Add refs to track if we're in the middle of an update
    const isUpdatingFromDrag = useRef(false);

    useEffect(() => {
        if (!isOpen || !postData?.overlayElements) return;

        console.log("🛠️ [PoliticsEditor] Initializing fresh overlays with (10,10) defaults");

        const avatarEls = postData.overlayElements
            .filter(el => el.type === 'avatar')
            .map(el => ({
                ...el,
                id: el.id || el._id || `avatar-${Math.random()}`,
                x: 10,
                y: 10,
                w: el.wPercent ?? el.w ?? 22,
                h: el.hPercent ?? el.h ?? 22,
                img: el.img || viewer?.modifyAvatar || viewer?.profileAvatar || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
                shape: avatarShape,
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
                shape: avatarShape,
                visible: true,
                zIndex: 100
            });
        }
        setAvatarOverlays(avatarEls);
        if (avatarEls.length > 0 && !selectedAvatarId) {
            setSelectedAvatarId(avatarEls[0].id);
        }

        // Initialize leaders - preserve existing x,y if available
        const leaderEls = initialLeaders.map(ov => ({
            ...ov,
            x: ov.x ?? 10,
            y: ov.y ?? 10,
            w: ov.w ?? 25,
            h: ov.h ?? 25,
            zIndex: ov.zIndex ?? 50
        }));
        setCurrentSelection(leaderEls);
    }, [isOpen, postData?._id, viewer?._id, initialLeaders]);

    const handleAvatarUpdate = useCallback((newOverlays) => {
        console.log("🛠️ [PoliticsEditor] Updating avatar overlays", newOverlays.length);
        isUpdatingFromDrag.current = true;
        setAvatarOverlays(newOverlays);
        setTimeout(() => {
            isUpdatingFromDrag.current = false;
        }, 100);
    }, []);

    // Keep avatarOverlays in sync with avatarShape when it changes
    useEffect(() => {
        setAvatarOverlays(prev => prev.map(ov => ({ ...ov, shape: avatarShape })));
    }, [avatarShape]);

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
        if (selectedAvatarId) {
            setAvatarOverlays(prev => prev.map(ov =>
                ov.id === selectedAvatarId ? { ...ov, img: croppedUrl } : ov
            ));
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
            setAvatarOverlays([]); // Clear on close to ensure fresh init next time
            setSelectedAvatarId(null);
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleAddLeaderClick = () => {
        if (selectedParty) {
            setCurrentView('leaderList');
        } else {
            setCurrentView('stateList');
        }
    };

    useEffect(() => {
        setCurrentSelection(initialLeaders);
    }, [initialLeaders]);

    const handleUpdateSelection = useCallback((newSelection) => {
        console.log("🛠️ [PoliticsEditor] Updating leader overlays", newSelection.length);
        isUpdatingFromDrag.current = true;
        setCurrentSelection(newSelection);
        onUpdateLeaders(newSelection); // Keep parent in sync for in-memory persistence
        setTimeout(() => {
            isUpdatingFromDrag.current = false;
        }, 100);
    }, [onUpdateLeaders]);

    useEffect(() => {
        if (currentView === 'stateList' && states.length === 0) {
            fetchStates();
        }
    }, [currentView]);

    const fetchStates = async () => {
        setLoadingStates(true);
        try {
            const res = await api.get('api/parties/states');
            if (res.data.success) {
                setStates(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching states:", error);
        } finally {
            setLoadingStates(false);
        }
    };

    const toggleLeader = (item) => {
        let newSelection = [...currentSelection];
        const index = newSelection.findIndex(s => s.id === item.id);
        if (index > -1) {
            newSelection.splice(index, 1);
        } else {
            newSelection.push({
                ...item,
                x: 30,
                y: 30,
                w: 25,
                h: 25,
                zIndex: 50
            });
        }
        setCurrentSelection(newSelection);
        onUpdateLeaders(newSelection);
    };

    const handleSelectParty = (party) => {
        setSelectedParty(party);
        // Keep the current selection in memory, or clear it if changing party?
        // User said "locally memory the user party selection", 
        // usually switching parties should show the new leaders list.
        setCurrentView('leaderList');
    };

    const fetchPartiesByState = async (stateName) => {
        setLoadingParties(true);
        try {
            const res = await api.get(`api/parties/by-state/${encodeURIComponent(stateName)}`);
            if (res.data.success) {
                setParties(res.data.data);
                setCurrentView('partyList');
            }
        } catch (error) {
            console.error("Error fetching parties:", error);
            toast.error("Could not load parties. Please try again.");
        } finally {
            setLoadingParties(false);
        }
    };

    const handleDownload = async () => {
        // ── DIAGNOSTIC: confirm this function is called and check footer state ──
        console.log('🔴 [PoliticsDL] handleDownload CALLED | isFooterEnabled:', isFooterEnabled, '| ref:', isFooterEnabledRef.current);
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

            const footerOn = isFooterEnabledRef.current; // always fresh
            const xShift = footerOn ? 2 : 0;
            console.log('[PoliticsDL] isFooterEnabled state:', isFooterEnabled, '| ref:', footerOn, '| xShift:', xShift);
            const customMetadata = {
                leaderOverlays: currentSelection.map(ov => ({
                    id: ov.id,
                    img: ov.img,
                    x: ov.x + xShift,
                    y: ov.y,
                    w: ov.w,
                    h: ov.h,
                    zIndex: ov.zIndex,
                    type: ov.type,
                    name: ov.name
                })),
                avatarConfigs: processedAvatars.map(av => ({
                    ...av,
                    x: av.x + xShift
                })),
                footerConfig: {
                    backgroundColor: dominantColor || "#000000",
                    fontFamily: footerStyle !== 'inherit' ? footerStyle : undefined,
                    usernameScale: usernameSize,
                    emailScale: emailSize,
                    phoneScale: phoneSize,
                    socialScale: socialSize,
                    showElements: footerOn ? postData?.footerDisplay?.showElements : {
                        userName: false,
                        email: false,
                        phone: false,
                        socialIcons: false
                    },
                    showFooter: footerOn
                }
            };

            // Use fetch + blob — form.submit() silently drops long-running file responses
            const response = await fetch(`${BACKEND_URL}/api/user/feed/${feedId}/politics-download`, {
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
            a.download = `politics_poster_${feedId.slice(-4)}.mp4`;
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
                            <div className="flex flex-col sm:flex-row h-full overflow-hidden bg-white">
                                {/* Mobile Header */}
                                {isMobile && (
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-[100]">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {currentView === 'root' ? 'Politics Editor' :
                                                currentView === 'avatarEdit' ? 'Edit Photo' :
                                                    currentView === 'stateList' ? 'Select State' :
                                                        currentView === 'partyList' ? 'Select Party' :
                                                            currentView === 'leaderList' ? 'Select Leaders' :
                                                                currentView === 'style' ? 'Footer Style' : 'Edit Sizes'}
                                        </h3>
                                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                            <CloseIcon />
                                        </button>
                                    </div>
                                )}

                                {/* Editor Sidebar / Mobile Bottom Bar */}
                                <div className={`flex flex-col ${isMobile ? 'order-2 w-full border-t border-gray-100 pb-safe' : 'sm:w-[450px] border-r border-gray-100'} bg-white z-10 overflow-hidden`}>
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
                                                {currentView === 'root' ? 'Politics Editor' :
                                                    currentView === 'avatarEdit' ? 'Edit Photo & Shape' :
                                                        currentView === 'stateList' ? 'Select State' :
                                                            currentView === 'partyList' ? 'Select Party' :
                                                                currentView === 'leaderList' ? 'Select Leaders' :
                                                                    currentView === 'style' ? 'Footer Style' : 'Edit Sizes'}
                                            </h3>
                                        </div>
                                    )}

                                    <div className={`${isMobile ? 'h-auto' : 'flex-1 overflow-y-auto pr-1 custom-scrollbar p-6'}`}>

                                        <AnimatePresence mode="wait">
                                            {currentView === 'root' && (
                                                <motion.div key="root" {...viewVariants} className="space-y-2">
                                                    <MenuButton icon={AvatarIcon} label="Edit Profile Avatar" onClick={() => setCurrentView('avatarEdit')} />
                                                    <MenuButton icon={LeaderIcon} label="Add leader photo" onClick={handleAddLeaderClick} />

                                                    <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                                                        <div className="flex items-center gap-3 text-gray-800">
                                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                                <FooterIcon fontSize="small" />
                                                            </div>
                                                            <span className="font-semibold">Footer Configuration</span>
                                                        </div>
                                                        <div className="flex gap-4 px-1">
                                                            <label className="flex-1 flex items-center gap-3 p-3 bg-white rounded-xl border-2 transition-all cursor-pointer group hover:border-blue-200">
                                                                <input
                                                                    type="radio"
                                                                    name="footerToggle"
                                                                    checked={isFooterEnabled}
                                                                    onChange={() => setIsFooterEnabled(true)}
                                                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                                                />
                                                                <span className={`text-sm font-bold ${isFooterEnabled ? 'text-blue-600' : 'text-gray-500'}`}>Enabled</span>
                                                            </label>
                                                            <label className="flex-1 flex items-center gap-3 p-3 bg-white rounded-xl border-2 transition-all cursor-pointer group hover:border-red-200">
                                                                <input
                                                                    type="radio"
                                                                    name="footerToggle"
                                                                    checked={!isFooterEnabled}
                                                                    onChange={() => setIsFooterEnabled(false)}
                                                                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                                                                />
                                                                <span className={`text-sm font-bold ${!isFooterEnabled ? 'text-red-600' : 'text-gray-500'}`}>Disabled</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {isFooterEnabled && (
                                                        <>
                                                            <MenuButton icon={FontStyleIcon} label="Footer Font Style" onClick={() => setCurrentView('style')} />
                                                            <MenuButton icon={FooterIcon} label="Footer Element Sizes" onClick={() => setCurrentView('sizes')} />
                                                        </>
                                                    )}
                                                </motion.div>
                                            )}


                                            {currentView === 'style' && (
                                                <motion.div key="style" {...viewVariants} className="space-y-6">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-3 text-gray-800">
                                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                                <FontStyleIcon fontSize="small" />
                                                            </div>
                                                            <span className="font-semibold">select</span>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto px-1 custom-scrollbar pb-6">
                                                            {fontOptions.map((opt) => (
                                                                <button
                                                                    key={opt.value}
                                                                    onClick={() => setFooterStyle(opt.value)}
                                                                    className={`py-4 px-2 rounded-2xl text-xl transition-all h-20 flex items-center justify-center text-center
                                                        ${footerStyle === opt.value
                                                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 scale-[1.02] border-2 border-purple-400'
                                                                            : 'bg-gray-50 text-gray-800 hover:bg-gray-100 border-2 border-transparent'
                                                                        }`}
                                                                    style={{ fontFamily: opt.value }}
                                                                >
                                                                    {opt.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'sizes' && (
                                                <motion.div key="sizes" {...viewVariants} className="space-y-6 py-2 pb-6 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
                                                    <SliderControl label="Username" icon={UserIcon} value={usernameSize} onChange={setUsernameSize} colorClass="blue" />
                                                    <SliderControl label="Social Icons" icon={SocialIcon} value={socialSize} onChange={setSocialSize} colorClass="purple" />
                                                    <SliderControl label="Email Address" icon={EmailIcon} value={emailSize} onChange={setEmailSize} colorClass="indigo" />
                                                    <SliderControl label="Phone Number" icon={PhoneIcon} value={phoneSize} onChange={setPhoneSize} colorClass="green" />
                                                </motion.div>
                                            )}

                                            {currentView === 'stateList' && (
                                                <motion.div key="stateList" {...viewVariants} className="flex flex-col h-full bg-white overflow-hidden">
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-20">
                                                        {(loadingStates || loadingParties) ? (
                                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                                                <p className="text-gray-500 font-medium text-xs">Processing...</p>
                                                            </div>
                                                        ) : states.length > 0 ? (
                                                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                                                                {states.map((item) => (
                                                                    <button
                                                                        key={item._id}
                                                                        onClick={() => {
                                                                            setSelectedState(item.state);
                                                                            fetchPartiesByState(item.state);
                                                                        }}
                                                                        className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all group border h-full justify-center
                                                            ${selectedState === item.state
                                                                                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                                                                : 'border-gray-50 hover:bg-blue-50/50 hover:border-blue-100 bg-gray-50/30'}`}
                                                                    >
                                                                        <div className={`p-2 rounded-xl transition-colors mb-2 ${selectedState === item.state ? 'bg-blue-600 text-white' : 'bg-white text-gray-400 group-hover:text-blue-600'}`}>
                                                                            <StateIcon sx={{ fontSize: 20 }} />
                                                                        </div>
                                                                        <div className="flex flex-col gap-0.5 leading-tight">
                                                                            <span className="font-bold text-gray-800 text-xs sm:text-sm tracking-tight text-center">
                                                                                {item.state}
                                                                            </span>
                                                                            {item.stateRegionalName && (
                                                                                <span className="text-gray-400 text-[10px] font-medium opacity-80 italic">
                                                                                    ({item.stateRegionalName})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center ">
                                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                    <StateIcon className="text-gray-300" />
                                                                </div>
                                                                <p className="text-gray-500 font-medium text-xs">No states found</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 shrink-0">
                                                        <button
                                                            onClick={() => setCurrentView('root')}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all text-sm"
                                                        >
                                                            <BackIcon sx={{ fontSize: 16 }} />
                                                            Back
                                                        </button>
                                                        <button
                                                            onClick={onClose}
                                                            className="flex-1 py-3 px-4 bg-gray-50 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-all text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'partyList' && (
                                                <motion.div key="partyList" {...viewVariants} className="flex flex-col h-full bg-white overflow-hidden">
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-20">
                                                        {loadingParties ? (
                                                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                                                <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                                                                <p className="text-gray-500 font-medium text-xs">Fetching parties...</p>
                                                            </div>
                                                        ) : parties.length > 0 ? (
                                                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                                                                {parties.map((party) => (
                                                                    <button
                                                                        key={party._id}
                                                                        onClick={() => handleSelectParty(party)}
                                                                        className={`flex flex-col items-center text-center p-3 rounded-2xl transition-all group border h-full justify-center
                                                            ${selectedParty?._id === party._id
                                                                                ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                                                                                : 'border-gray-50 hover:bg-blue-50/50 hover:border-blue-100 bg-gray-50/30'}`}
                                                                    >
                                                                        <div className="w-14 h-14 bg-white rounded-full overflow-hidden transition-colors mb-2.5 border-2 border-transparent group-hover:border-blue-200 p-1.5 shadow-sm">
                                                                            {party.partyLogo ? (
                                                                                <img
                                                                                    src={party.partyLogo}
                                                                                    alt={party.partyName}
                                                                                    className="w-full h-full object-contain rounded-full"
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                                    <LeaderIcon />
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex flex-col gap-0.5 leading-tight">
                                                                            <span className="font-bold text-gray-800 text-xs line-clamp-2">
                                                                                {party.partyName}
                                                                            </span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-20">
                                                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                    <LeaderIcon className="text-gray-300" />
                                                                </div>
                                                                <p className="text-gray-500 font-medium text-xs">No parties found for {selectedState}</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 shrink-0">
                                                        <button
                                                            onClick={() => setCurrentView('stateList')}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all text-sm"
                                                        >
                                                            <BackIcon sx={{ fontSize: 16 }} />
                                                            Back
                                                        </button>
                                                        <button
                                                            onClick={onClose}
                                                            className="flex-1 py-3 px-4 bg-gray-50 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-all text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {currentView === 'leaderList' && (
                                                <motion.div key="leaderList" {...viewVariants} className="flex flex-col h-full bg-white overflow-hidden">
                                                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-20">
                                                        <div className="flex items-center justify-between mb-6 px-1 sticky top-0 bg-white z-10 py-2">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                {selectedParty ? `${selectedParty.partyName} Leaders` : 'Select Leaders'}
                                                            </span>
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentView('stateList');
                                                                }}
                                                                className="text-xs text-blue-600 font-bold hover:text-blue-700 transition-colors py-1.5 px-3 bg-blue-50 rounded-lg flex items-center gap-1"
                                                            >
                                                                Choose Different Party
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-3">
                                                            {selectedParty && (
                                                                <div
                                                                    onClick={() => toggleLeader({
                                                                        id: `party-logo-${selectedParty._id}`,
                                                                        img: selectedParty.partyLogo,
                                                                        type: 'party-logo',
                                                                        name: selectedParty.partyName
                                                                    })}
                                                                    className={`relative flex flex-col items-center text-center p-4 rounded-2xl transition-all cursor-pointer border-2 h-full justify-center
                                                        ${currentSelection.some(s => s.id === `party-logo-${selectedParty._id}`)
                                                                            ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                                                            : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    <div className="absolute top-2 right-2">
                                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                                              ${currentSelection.some(s => s.id === `party-logo-${selectedParty._id}`)
                                                                                ? 'bg-blue-600 border-blue-600'
                                                                                : 'bg-white border-gray-300'
                                                                            }`}
                                                                        >
                                                                            {currentSelection.some(s => s.id === `party-logo-${selectedParty._id}`) && (
                                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-16 h-16 rounded-full overflow-hidden mb-2.5 border-4 border-white shadow-sm bg-white">
                                                                        <img src={selectedParty.partyLogo} alt="Logo" className="w-full h-full object-contain" />
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1">Party Logo</span>
                                                                </div>
                                                            )}

                                                            {selectedParty?.leaders?.map((leader, index) => (
                                                                <div
                                                                    key={`leader-${index}`}
                                                                    onClick={() => toggleLeader({
                                                                        id: `leader-${selectedParty._id}-${index}`,
                                                                        img: leader.photo,
                                                                        type: 'leader',
                                                                        name: leader.name
                                                                    })}
                                                                    className={`relative flex flex-col items-center text-center p-4 rounded-2xl transition-all cursor-pointer border-2 h-full justify-center
                                                        ${currentSelection.some(s => s.id === `leader-${selectedParty._id}-${index}`)
                                                                            ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                                                                            : 'border-gray-50 bg-gray-50/30 hover:bg-gray-50'
                                                                        }`}
                                                                >
                                                                    <div className="absolute top-2 right-2">
                                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                                                              ${currentSelection.some(s => s.id === `leader-${selectedParty._id}-${index}`)
                                                                                ? 'bg-blue-600 border-blue-600'
                                                                                : 'bg-white border-gray-300'
                                                                            }`}
                                                                        >
                                                                            {currentSelection.some(s => s.id === `leader-${selectedParty._id}-${index}`) && (
                                                                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-16 h-16 rounded-full overflow-hidden mb-2.5 border-4 border-white shadow-sm">
                                                                        <img src={leader.photo} alt={leader.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <span className="text-[11px] font-bold text-gray-800 line-clamp-1">{leader.name}</span>
                                                                </div>
                                                            ))}

                                                            {!selectedParty && currentSelection.map((item) => (
                                                                <div
                                                                    key={item.id}
                                                                    onClick={() => toggleLeader(item)}
                                                                    className="relative flex flex-col items-center text-center p-1.5 rounded-xl transition-all cursor-pointer border-2 border-blue-500 bg-blue-50/50 h-full justify-center"
                                                                >
                                                                    <div className="absolute top-1.5 right-1.5">
                                                                        <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center bg-blue-600 border-blue-600">
                                                                            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                                            </svg>
                                                                        </div>
                                                                    </div>
                                                                    <div className="w-12 h-12 rounded-full overflow-hidden mb-1.5 border-2 border-white shadow-sm">
                                                                        <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-gray-800 line-clamp-1">{item.name || 'Leader'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 shrink-0">
                                                        <button
                                                            onClick={() => {
                                                                if (selectedParty) setCurrentView('partyList');
                                                                else setCurrentView('root');
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-all text-sm"
                                                        >
                                                            <BackIcon sx={{ fontSize: 16 }} />
                                                            Back
                                                        </button>
                                                        <button
                                                            onClick={onClose}
                                                            className="flex-1 py-3 px-4 bg-gray-50 hover:bg-red-50 text-red-600 font-bold rounded-xl transition-all text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                            {currentView === 'avatarEdit' && (
                                                <motion.div key="avatarEdit" {...viewVariants} className="space-y-5">
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
                                                        <p className="text-sm text-gray-500 text-center">
                                                            {customAvatarUrl ? 'Custom avatar applied to preview' : 'Using your profile avatar'}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avatar Shape</p>
                                                        <div className="flex gap-3">
                                                            <button
                                                                onClick={() => {
                                                                    setAvatarShape('circle');
                                                                    setAvatarOverlays(prev => prev.map(ov => ({ ...ov, shape: 'circle' })));
                                                                }}
                                                                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${avatarShape === 'circle' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                            >
                                                                <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-gray-300" />
                                                                <span className="text-xs font-bold text-gray-700">Circle Fade</span>
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setAvatarShape('square');
                                                                    setAvatarOverlays(prev => prev.map(ov => ({ ...ov, shape: 'square' })));
                                                                }}
                                                                className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${avatarShape === 'square' ? 'border-blue-600 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                                                            >
                                                                <div className="w-10 h-10 rounded-lg bg-gray-200 border-2 border-gray-300" />
                                                                <span className="text-xs font-bold text-gray-700">Square Fade</span>
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
                                                                onClick={() => { setCustomAvatarUrl(null); toast('Reverted to profile avatar'); }}
                                                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 font-bold rounded-2xl transition-all border border-gray-100 active:scale-[0.98]"
                                                            >
                                                                Reset to Default
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="pt-2 pb-1">
                                                        <p className="text-xs text-gray-400 text-center">
                                                            💡 After choosing, drag &amp; resize the avatar directly on the preview.
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Responsive Preview Area */}
                                <div className={`flex-1 bg-gray-50 flex flex-col relative overflow-hidden ${isMobile ? 'order-1 min-h-[40vh]' : ''}`}>
                                    <PosterPreviewArea
                                        onClose={onClose}
                                        previewContainerRef={previewContainerRef}
                                        mediaAreaRef={mediaAreaRef}
                                        postData={postData}
                                        viewer={viewer}
                                        prithuLogo={prithuLogo}
                                        customAvatarUrl={customAvatarUrl}
                                        avatarOverlays={avatarOverlays}
                                        handleAvatarUpdate={handleAvatarUpdate}
                                        selectedAvatarId={selectedAvatarId}
                                        setSelectedAvatarId={setSelectedAvatarId}
                                        setCurrentView={setCurrentView}
                                        removeAvatar={() => setAvatarOverlays([])}
                                        isUpdatingFromDrag={isUpdatingFromDrag.current}
                                        leaderOverlays={currentSelection}
                                        handleUpdateSelection={handleUpdateSelection}
                                        previewVideoRef={previewVideoRef}
                                        previewIsPlaying={previewIsPlaying}
                                        previewIsMuted={previewIsMuted}
                                        togglePreviewPlayPause={togglePreviewPlayPause}
                                        setPreviewIsMuted={setPreviewIsMuted}
                                        setPreviewIsPlaying={setPreviewIsPlaying}
                                        previewDuration={previewDuration}
                                        previewCurrentTime={previewCurrentTime}
                                        onPreviewSeek={handlePreviewSeek}
                                        onPreviewMetadataLoaded={handlePreviewMetadataLoaded}
                                        onPreviewTimeUpdate={handlePreviewTimeUpdate}
                                        handleDownload={handleDownload}
                                        isMobile={isMobile}
                                        footerSlot={
                                            isFooterEnabled && (
                                                <div
                                                    className="relative w-full z-30 shrink-0 flex flex-col border-t border-white/10"
                                                    style={{
                                                        backgroundColor: dominantColor || '#000000',
                                                        paddingTop: `${8 * usernameSize}px`,
                                                        paddingBottom: `${8 * usernameSize}px`,
                                                        gap: `${4 * usernameSize}px`,
                                                    }}
                                                >
                                                    {(() => {
                                                        const fgColor = getContrastColor(dominantColor || '#000000');
                                                        const fgMuted = fgColor === '#ffffff' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.55)';
                                                        const iconBg = fgColor === '#ffffff' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)';
                                                        const iconDot = fgColor === '#ffffff' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.25)';
                                                        return (
                                                            <>
                                                                <div className="flex items-center justify-between px-4">
                                                                    <span className="font-bold truncate" style={{ fontSize: `${14 * usernameSize}px`, fontFamily: footerStyle, color: fgColor }}>
                                                                        {viewer?.userName || "Username"}
                                                                    </span>
                                                                    <div className="flex items-center gap-2">
                                                                        {[1, 2].map(id => (
                                                                            <div key={id} className="rounded-full" style={{ padding: `${6 * socialSize}px`, backgroundColor: iconBg }}>
                                                                                <div style={{ width: `${14 * socialSize}px`, height: `${14 * socialSize}px`, backgroundColor: iconDot, borderRadius: '9999px' }} />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center justify-between px-4">
                                                                    <span style={{ fontSize: `${12 * emailSize}px`, fontFamily: footerStyle, color: fgMuted }}>{viewer?.email || "email@example.com"}</span>
                                                                    <span style={{ fontSize: `${12 * phoneSize}px`, fontFamily: footerStyle, color: fgMuted }}>{viewer?.phoneNumber || "+91 9999999999"}</span>
                                                                </div>
                                                            </>
                                                        );
                                                    })()}
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
        </>
    );
};

export default PoliticsEditPosterPopup;

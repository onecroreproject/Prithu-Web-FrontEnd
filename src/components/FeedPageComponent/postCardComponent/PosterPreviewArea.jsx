import React from "react";
import {
    Close as CloseIcon,
    Download as DownloadIcon,
} from "@mui/icons-material";
import PostMedia from "./postMeadia";
import FeedOverlayRenderer from "./FeedOverlayRenderer";
import OverlayItem from "./OverlayItem";
import {
    PlayArrow as PlayIcon,
    Pause as PauseIcon
} from "@mui/icons-material";
import { useState } from "react";

const PosterPreviewArea = ({
    onClose,
    previewContainerRef,
    postData,
    mediaAreaRef,
    previewVideoRef,
    previewIsPlaying,
    previewIsMuted,
    togglePreviewPlayPause,
    setPreviewIsMuted,
    setPreviewIsPlaying,
    viewer,
    prithuLogo,
    avatarOverlays,
    handleAvatarUpdate,
    setSelectedAvatarId,
    setCurrentView,
    removeAvatar,
    isUpdatingFromDrag,
    textOverlays,
    handleTextUpdate,
    setSelectedTextId,
    removeText,
    handleDownload,
    previewDuration = 0,
    previewCurrentTime = 0,
    onPreviewTimeUpdate,
    onPreviewMetadataLoaded,
    onPreviewSeek,
    footerSlot,
    isDownloading = false
}) => {
    const [isHovering, setIsHovering] = useState(false);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return (
        <div className="flex-1 bg-gray-50 flex flex-col relative overflow-hidden">
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-[100] p-2 bg-white/80 hover:bg-white rounded-full shadow-md text-gray-500 hover:text-gray-900 transition-all"
            >
                <CloseIcon />
            </button>

            <div className={`flex-1 flex flex-col items-center justify-center ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'p-4' : 'p-8'} overflow-y-auto`}>
                <div className={`relative w-full max-w-[400px] flex flex-col items-center ${typeof window !== 'undefined' && window.innerWidth < 768 ? 'scale-[0.9]' : 'scale-[0.8]'} origin-center`}>
                    <div
                        className="w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 relative flex flex-col ring-8 ring-gray-100/50"
                        style={{ aspectRatio: '9/16' }}
                        ref={previewContainerRef}
                    >
                        <div
                            className="relative flex-1 w-full overflow-hidden flex flex-col items-center justify-center group/media"
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <PostMedia
                                type={postData?.type || 'image'}
                                contentUrl={postData?.contentUrl}
                                containerRef={mediaAreaRef}
                                aspectRatio={postData?.designMetadata?.canvasSettings?.aspectRatio || "1:1"}
                                isTemplate={true}
                                viewMode="list"
                                videoRef={previewVideoRef}
                                isPlaying={previewIsPlaying}
                                isMuted={previewIsMuted}
                                // 🚀 ISOLATION: No-op here to prevent background clicks/drags from triggering play
                                togglePlayPause={() => { }}
                                toggleMute={() => setPreviewIsMuted(m => !m)}
                                onVideoPlay={() => { }} // Handled by BirthdayEditPosterPopup state
                                onVideoPause={() => { }} // Handled by BirthdayEditPosterPopup state
                                onVideoEnded={() => setPreviewIsPlaying(false)}
                                // Sync time and metadata
                                onLoadedMetadata={onPreviewMetadataLoaded}
                                onTimeUpdate={onPreviewTimeUpdate}
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
                                    </>
                                }
                                fullFrameOverlaySlot={
                                    <>
                                        {/* 📍 Origin Marker: (0,0) */}
                                        <div
                                            className="absolute top-0 left-0 w-4 h-4 bg-red-600 rounded-full -translate-x-1/2 -translate-y-1/2 z-[100] flex items-center justify-center border-2 border-white shadow-lg pointer-events-none"
                                            title="Origin (0,0)"
                                        >
                                            <span className="text-[10px] text-white font-bold">0</span>
                                        </div>

                                        {/* ✅ OverlayItems live here — inside the aspect-ratio-locked div that matches the actual video frame */}
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
                                                isUpdatingFromDrag={isUpdatingFromDrag}
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
                                                isUpdatingFromDrag={isUpdatingFromDrag}
                                            />
                                        ))}
                                    </>
                                }
                                footerSlot={footerSlot}
                            />
                        </div>
                    </div>

                    {/* 🚀 COMPACT VIDEO CONTROLS (Below Media) */}
                    {postData?.type === 'video' && (
                        <div className={`w-full max-w-[400px] mt-2 px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm flex items-center gap-4 transition-all duration-500 ${isHovering ? 'opacity-100' : 'opacity-40'}`}>
                            {/* Play/Pause Integrated here */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    togglePreviewPlayPause();
                                }}
                                className="p-2 bg-blue-600 rounded-xl text-white shadow-md hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                {previewIsPlaying ? <PauseIcon sx={{ fontSize: 24 }} /> : <PlayIcon sx={{ fontSize: 24 }} />}
                            </button>

                            <div className="flex-1 flex flex-col gap-1.5 pt-1">
                                <div className="flex items-center justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                    <span>{formatTime(previewCurrentTime)}</span>
                                    <span>{formatTime(previewDuration)}</span>
                                </div>
                                <div className="relative group/progress h-4 flex items-center">
                                    <input
                                        type="range"
                                        min="0"
                                        max={previewDuration || 100}
                                        step="0.01"
                                        value={previewCurrentTime}
                                        onChange={onPreviewSeek}
                                        className="absolute inset-0 w-full h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-600 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    />
                                    <div className="absolute inset-x-0 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-100"
                                            style={{ width: `${(previewCurrentTime / (previewDuration || 1)) * 100}%` }}
                                        />
                                    </div>
                                    <div
                                        className="absolute w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-full shadow-md z-20 pointer-events-none transition-all duration-100"
                                        style={{ left: `calc(${(previewCurrentTime / (previewDuration || 1)) * 100}% - 5px)` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    title={isDownloading ? "Processing..." : "Download Poster"}
                    className={`${typeof window !== 'undefined' && window.innerWidth < 768 ? 'hidden' : 'flex'} absolute bottom-12 right-20 z-50 items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-[0_10px_25px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-300 ${isDownloading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:scale-105 hover:shadow-[0_15px_35px_rgba(59,130,246,0.6)] active:scale-95'}`}
                >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                    {isDownloading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                    ) : (
                        <DownloadIcon fontSize="medium" className="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                    )}
                    <span className="relative z-10 font-medium tracking-wide">
                        {isDownloading ? 'Processing...' : 'Download'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default PosterPreviewArea;

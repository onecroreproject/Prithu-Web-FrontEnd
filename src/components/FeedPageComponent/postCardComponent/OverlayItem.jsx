import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import toast from "react-hot-toast";

export default function OverlayItem({
    ov,
    containerRef,
    onUpdate,
    overlays,
    removeOverlay,
    isAvatar = false,
    onSelect,
    isUpdatingFromDrag = false
}) {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [localPosition, setLocalPosition] = useState(null); // For smooth drag updates
    const [debugInfo, setDebugInfo] = useState(null); // For visual debugging
    const dragStartPos = useRef({ x: 0, y: 0 });
    const dragStartPercent = useRef({ x: 0, y: 0 }); // 🚀 New: store starting % for delta calcs
    const itemStartPos = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 }); // Store offset from click point to element corner
    const resizeStartData = useRef(null);
    const resizeObserverRef = useRef(null);
    const animationFrameRef = useRef(null);
    const elementRef = useRef(null);

    // Track container size
    useEffect(() => {
        // Clean up previous observer
        if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
        }

        // Check if containerRef exists and has a current element
        if (!containerRef?.current) {
            console.log("⚠️ [OverlayItem] Container ref not available yet");
            return;
        }

        const updateSize = () => {
            if (!containerRef.current) return;

            try {
                setContainerSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            } catch (error) {
                console.error("❌ [OverlayItem] Error getting container size:", error);
            }
        };

        // Initial size
        updateSize();

        // Create observer for size changes
        try {
            resizeObserverRef.current = new ResizeObserver(updateSize);
            resizeObserverRef.current.observe(containerRef.current);
        } catch (error) {
            console.error("❌ [OverlayItem] Error setting up ResizeObserver:", error);
            // Fallback: use window resize event
            window.addEventListener('resize', updateSize);
            return () => window.removeEventListener('resize', updateSize);
        }

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [containerRef]);

    // Convert percentage to pixels for positioning
    const getPixelPosition = useCallback(() => {
        if (!containerRef?.current) return { left: 0, top: 0, width: 0, height: 0 };
        const rect = containerRef.current.getBoundingClientRect();

        // Use local position during drag for smooth updates, otherwise use original ov values
        const x = localPosition?.x ?? ov.x;
        const y = localPosition?.y ?? ov.y;
        const w = localPosition?.w ?? ov.w;
        const h = localPosition?.h ?? ov.h;

        let targetW = (w / 100) * rect.width;
        let targetH = (h / 100) * rect.height;

        // 🚀 CRITICAL: For avatars, we must FORCE square pixels based on width percentage
        // This prevents stretching in non-square containers (like 9:16 video)
        if (isAvatar) {
            targetH = targetW;
        }

        return {
            left: (x / 100) * rect.width,
            top: (y / 100) * rect.height,
            width: targetW,
            height: targetH
        };
    }, [ov.x, ov.y, ov.w, ov.h, containerRef, isAvatar, localPosition]);

    // Convert pixels to percentage for storage
    const pixelsToPercentage = useCallback((left, top, width, height) => {
        if (!containerRef?.current) return { x: ov.x, y: ov.y, w: ov.w, h: ov.h };
        const rect = containerRef.current.getBoundingClientRect();

        // 🚀 CRITICAL: Inverse of getPixelPosition — for avatars, height is derived from width pixels
        const targetH = isAvatar ? width : height;

        const newX = Math.max(0, Math.min(100, (left / rect.width) * 100));
        const newY = Math.max(0, Math.min(100, (top / rect.height) * 100));
        const newW = Math.max(5, Math.min(100, (width / rect.width) * 100));
        const newH = Math.max(5, Math.min(100, (targetH / rect.height) * 100));

        return {
            x: newX,
            y: newY,
            w: newW,
            h: newH
        };
    }, [containerRef, isAvatar, ov.x, ov.y, ov.w, ov.h]);

    const pixelPos = getPixelPosition();

    // Handle Pan Start (Replacing DragStart)
    const handlePanStart = useCallback((event, info) => {
        if (isResizing) return false;

        setIsDragging(true);
        // Store the percentage where we started the pan
        dragStartPercent.current = { x: ov.x, y: ov.y };

        // Initialize local position for smooth tracking
        setLocalPosition({
            x: ov.x,
            y: ov.y,
            w: ov.w,
            h: ov.h
        });
    }, [isResizing, ov.x, ov.y, ov.w, ov.h]);

    // Handle Pan (Replacing Drag)
    const handlePan = useCallback((event, info) => {
        if (!isDragging || !containerRef.current) return;

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
            if (!containerRef.current) return; // Guard
            const containerRect = containerRef.current.getBoundingClientRect();

            // Use values from the current ref/state closure but avoid volatile deps
            const widthPercent = ov.w;

            // Calculate height percent based on width pixels for avatars to maintain aspect ratio
            const widthPixels = (widthPercent / 100) * containerRect.width;
            const heightPercent = isAvatar
                ? (widthPixels / containerRect.height) * 100
                : ov.h;

            // 📐 Delta-based calculation
            const deltaXPercent = (info.offset.x / containerRect.width) * 100;
            const deltaYPercent = (info.offset.y / containerRect.height) * 100;

            const targetX = dragStartPercent.current.x + deltaXPercent;
            const targetY = dragStartPercent.current.y + deltaYPercent;

            // 🛡️ STRICT CLAMPING
            const minBound = 0;
            const maxXBound = 100 - widthPercent;
            const maxYBound = 100 - heightPercent;

            let percentageX = Math.max(minBound, Math.min(maxXBound, targetX));
            let percentageY = Math.max(minBound, Math.min(maxYBound, targetY));

            // 🎯 EDGE SNAPPING (0.5% threshold)
            if (percentageX < 0.5) percentageX = 0;
            else if (percentageX > maxXBound - 0.5) percentageX = maxXBound;

            if (percentageY < 0.5) percentageY = 0;
            else if (percentageY > maxYBound - 0.5) percentageY = maxYBound;

            const finalX = percentageX;
            const finalY = percentageY;

            setLocalPosition(prev => ({ ...prev, x: finalX, y: finalY }));

            const updatedOverlays = overlays.map(o =>
                o.id === ov.id ? { ...o, x: finalX, y: finalY } : o
            );
            onUpdate(updatedOverlays);
        });
    }, [isDragging, containerRef, ov.w, ov.h, isAvatar, overlays, ov.id, onUpdate]);

    // Handle drag end
    const handleDragEnd = useCallback((e, info) => {
        setIsDragging(false);
        setDebugInfo(null);
        // Clear local position to use original ov values
        setLocalPosition(null);
        // Reset drag offset
        dragOffset.current = { x: 0, y: 0 };

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Log final percentage
        const finalX = localPosition?.x ?? ov.x;
        const finalY = localPosition?.y ?? ov.y;
        console.log(`📍 [DragEnd] ${isAvatar ? 'Avatar' : 'Text'}: x=${finalX.toFixed(2)}% | y=${finalY.toFixed(2)}%`);
    }, [ov.id, ov.x, ov.y, isAvatar, localPosition]);

    // Handle resize
    const handleResizeStart = useCallback((e, corner) => {
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);

        // Initialize local position with current values
        setLocalPosition({
            x: ov.x,
            y: ov.y,
            w: ov.w,
            h: ov.h
        });

        resizeStartData.current = {
            corner,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: pixelPos.left,
            startTop: pixelPos.top,
            startWidth: pixelPos.width,
            startHeight: pixelPos.height,
            startXPercent: ov.x,
            startYPercent: ov.y,
            startWPercent: ov.w,
            startHPercent: ov.h
        };

        const onMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();

            if (!resizeStartData.current || !containerRef.current) return;

            // Cancel any pending animation frame
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            // Schedule update on next frame
            animationFrameRef.current = requestAnimationFrame(() => {
                // Calculate scale factor
                const rect = containerRef.current.getBoundingClientRect();
                const scaleX = rect.width / containerRef.current.offsetWidth || 1;
                const scaleY = rect.height / containerRef.current.offsetHeight || 1;

                const deltaX = (moveEvent.clientX - resizeStartData.current.startX) / scaleX;
                const deltaY = (moveEvent.clientY - resizeStartData.current.startY) / scaleY;

                let newLeft = resizeStartData.current.startLeft;
                let newTop = resizeStartData.current.startTop;
                let newWidth = resizeStartData.current.startWidth;
                let newHeight = resizeStartData.current.startHeight;

                // Calculate new dimensions based on corner
                switch (corner) {
                    case 'bottom-right':
                        newWidth = Math.max(20, resizeStartData.current.startWidth + deltaX);
                        newHeight = isAvatar ? newWidth : Math.max(20, resizeStartData.current.startHeight + deltaY);
                        break;
                    case 'bottom-left':
                        newWidth = Math.max(20, resizeStartData.current.startWidth - deltaX);
                        newLeft = resizeStartData.current.startLeft + (resizeStartData.current.startWidth - newWidth);
                        newHeight = isAvatar ? newWidth : Math.max(20, resizeStartData.current.startHeight + deltaY);
                        break;
                    case 'top-right':
                        newWidth = Math.max(20, resizeStartData.current.startWidth + deltaX);
                        newHeight = isAvatar ? newWidth : Math.max(20, resizeStartData.current.startHeight - deltaY);
                        newTop = resizeStartData.current.startTop + (resizeStartData.current.startHeight - newHeight);
                        break;
                    case 'top-left':
                        newWidth = Math.max(20, resizeStartData.current.startWidth - deltaX);
                        newLeft = resizeStartData.current.startLeft + (resizeStartData.current.startWidth - newWidth);
                        newHeight = isAvatar ? newWidth : Math.max(20, resizeStartData.current.startHeight - deltaY);
                        newTop = resizeStartData.current.startTop + (resizeStartData.current.startHeight - newHeight);
                        break;
                    case 'top':
                        newHeight = Math.max(20, resizeStartData.current.startHeight - deltaY);
                        if (isAvatar) {
                            newWidth = newHeight;
                            newLeft = resizeStartData.current.startLeft + (resizeStartData.current.startWidth - newWidth) / 2;
                        }
                        newTop = resizeStartData.current.startTop + (resizeStartData.current.startHeight - newHeight);
                        break;
                    case 'bottom':
                        newHeight = Math.max(20, resizeStartData.current.startHeight + deltaY);
                        if (isAvatar) {
                            newWidth = newHeight;
                            newLeft = resizeStartData.current.startLeft + (resizeStartData.current.startWidth - newWidth) / 2;
                        }
                        break;
                    case 'left':
                        newWidth = Math.max(20, resizeStartData.current.startWidth - deltaX);
                        if (isAvatar) {
                            newHeight = newWidth;
                            newTop = resizeStartData.current.startTop + (resizeStartData.current.startHeight - newHeight) / 2;
                        }
                        newLeft = resizeStartData.current.startLeft + (resizeStartData.current.startWidth - newWidth);
                        break;
                    case 'right':
                        newWidth = Math.max(20, resizeStartData.current.startWidth + deltaX);
                        if (isAvatar) {
                            newHeight = newWidth;
                            newTop = resizeStartData.current.startTop + (resizeStartData.current.startHeight - newHeight) / 2;
                        }
                        break;
                }

                // Constrain to container bounds
                const containerRectForBounds = containerRef.current.getBoundingClientRect();
                newLeft = Math.max(0, Math.min(containerRectForBounds.width - newWidth, newLeft));
                newTop = Math.max(0, Math.min(containerRectForBounds.height - newHeight, newTop));

                // Convert to percentage and update
                const percentage = pixelsToPercentage(
                    newLeft,
                    newTop,
                    newWidth,
                    newHeight
                );

                // Update local position for smooth rendering
                setLocalPosition({
                    x: percentage.x,
                    y: percentage.y,
                    w: percentage.w,
                    h: percentage.h
                });

                // Update the actual overlay state
                const updatedOverlays = overlays.map(o =>
                    o.id === ov.id
                        ? { ...o, x: percentage.x, y: percentage.y, w: percentage.w, h: percentage.h }
                        : o
                );
                onUpdate(updatedOverlays);
            });
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            setIsResizing(false);
            // Clear local position to use original ov values
            setLocalPosition(null);
            resizeStartData.current = null;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [pixelPos, containerRef, isAvatar, overlays, ov.id, onUpdate, pixelsToPercentage, ov.x, ov.y, ov.w, ov.h]);

    // Cancel button handler
    const handleCancel = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();

        // Reset to original position
        setLocalPosition(null);

        // Update overlay with original values
        const updatedOverlays = overlays.map(o =>
            o.id === ov.id
                ? { ...o, x: ov.x, y: ov.y, w: ov.w, h: ov.h }
                : o
        );
        onUpdate(updatedOverlays);

        toast.success('Position reset');
    }, [overlays, ov.id, ov.x, ov.y, ov.w, ov.h, onUpdate]);

    // Don't render if container size not available (but show with default positioning)
    if (!containerSize.width || !containerSize.height) {
        return (
            <div
                style={{
                    position: 'absolute',
                    left: `${ov.x}%`,
                    top: `${ov.y}%`,
                    width: `${ov.w}%`,
                    height: `${ov.h}%`,
                    zIndex: ov.zIndex || 50,
                    pointerEvents: 'none',
                    opacity: 0.5
                }}
                className="bg-gray-300 border-2 border-dashed border-gray-500"
            >
                <div className="text-xs text-center p-1">Loading...</div>
            </div>
        );
    }

    const shape = ov.shape || ov.avatarConfig?.shape || 'circle';
    const isRound = shape === 'circle';

    const displayX = localPosition?.x ?? ov.x;
    const displayY = localPosition?.y ?? ov.y;
    const displayW = localPosition?.w ?? ov.w;
    const displayH = localPosition?.h ?? ov.h;

    return (
        <motion.div
            ref={elementRef}
            drag={false}
            onPanStart={handlePanStart}
            onPan={handlePan}
            onPanEnd={handleDragEnd}
            onTap={() => {
                if (onSelect && !isDragging && !isResizing) {
                    onSelect(ov.id);
                }
            }}
            dragPropagation={false}
            style={{
                position: 'absolute',
                left: `${displayX}%`,
                top: `${displayY}%`,
                width: `${displayW}%`,
                height: isAvatar ? 'auto' : `${displayH}%`,
                aspectRatio: isAvatar ? '1/1' : 'auto',
                cursor: isDragging ? 'grabbing' : 'grab',
                zIndex: ov.zIndex || 100,
                touchAction: 'none',
                pointerEvents: 'auto'
            }}
            className="group overlay-item-interactive"
        >
            {/* Enhanced visual debugging grid */}
            {(isDragging || isResizing) && (
                <>
                    {/* Full container crosshair */}
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            pointerEvents: 'none',
                            zIndex: 9998
                        }}
                    >
                        {/* Vertical line through mouse X */}
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: debugInfo?.mouseX || 0,
                                width: '2px',
                                background: 'rgba(255, 0, 0, 0.3)',
                                transform: 'translateX(-50%)',
                                pointerEvents: 'none'
                            }}
                        />
                        {/* Horizontal line through mouse Y */}
                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                right: 0,
                                top: debugInfo?.mouseY || 0,
                                height: '2px',
                                background: 'rgba(0, 255, 0, 0.3)',
                                transform: 'translateY(-50%)',
                                pointerEvents: 'none'
                            }}
                        />
                    </div>

                    {/* Container bounds indicator */}
                    <div
                        style={{
                            position: 'fixed',
                            left: debugInfo?.containerLeft || 0,
                            top: debugInfo?.containerTop || 0,
                            width: debugInfo?.containerWidth || 0,
                            height: debugInfo?.containerHeight || 0,
                            border: '2px solid rgba(255, 165, 0, 0.5)',
                            pointerEvents: 'none',
                            zIndex: 9997
                        }}
                    />

                    {/* Axis guide lines centered on element */}
                    <div
                        style={{
                            position: 'absolute',
                            top: '-2000px',
                            bottom: '-2000px',
                            left: '50%',
                            width: '1.5px',
                            background: '#4fd1c5',
                            opacity: 0.8,
                            pointerEvents: 'none',
                            zIndex: -1,
                            boxShadow: '0 0 8px rgba(79, 209, 197, 0.8)'
                        }}
                    />
                    <div
                        style={{
                            position: 'absolute',
                            left: '-2000px',
                            right: '-2000px',
                            top: '50%',
                            height: '1.5px',
                            background: '#f6e05e',
                            opacity: 0.8,
                            pointerEvents: 'none',
                            zIndex: -1,
                            boxShadow: '0 0 8px rgba(246, 224, 94, 0.8)'
                        }}
                    />
                </>
            )}

            <div className={`relative w-full h-full ${isAvatar ? 'border-2 border-dashed border-transparent group-hover:border-blue-500' : 'border-2 border-white/50 group-hover:border-blue-500'} transition-colors rounded-lg overflow-hidden`}>
                {/* Content */}
                {isAvatar ? (
                    <img
                        src={ov.img}
                        alt="avatar"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        style={{
                            borderRadius: isRound ? '50%' : '0px',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center pointer-events-none select-none p-2"
                        style={{
                            fontSize: `${ov.style?.fontSize || 24}px`,
                            color: ov.style?.color || '#ffffff',
                            fontFamily: ov.style?.fontFamily || 'Inter',
                            fontWeight: ov.style?.fontWeight || 'normal',
                            fontStyle: ov.style?.fontStyle || 'normal',
                            textAlign: ov.style?.align || 'center',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            lineHeight: 1.2,
                            wordBreak: 'break-word'
                        }}
                    >
                        {ov.content}
                    </div>
                )}

                {(isDragging || isResizing) && (() => {
                    const liveX = (localPosition?.x ?? ov.x ?? 0).toFixed(1);
                    const liveY = (localPosition?.y ?? ov.y ?? 0).toFixed(1);
                    return (
                        <>
                            <div style={{ position: 'absolute', top: 0, left: '-1000%', width: '1000%', height: '1px', borderTop: '1px dashed #3b82f6', opacity: 0.5, pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', top: '-1000%', left: 0, height: '1000%', width: '1px', borderLeft: '1px dashed #3b82f6', opacity: 0.5, pointerEvents: 'none' }} />

                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: '#3b82f6',
                                    borderRadius: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    zIndex: 100,
                                    border: '1px solid white',
                                    boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                                }}
                            />

                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-32px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: 'rgba(0,0,0,0.85)',
                                    color: '#fff',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    padding: '4px 12px',
                                    borderRadius: '8px',
                                    whiteSpace: 'nowrap',
                                    pointerEvents: 'none',
                                    zIndex: 9999,
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    display: 'flex',
                                    gap: '10px'
                                }}
                            >
                                <span style={{ color: '#4fd1c5' }}>X: {liveX}%</span>
                                <span style={{ color: '#f6e05e' }}>Y: {liveY}%</span>
                            </div>
                        </>
                    );
                })()}

                {/* Action buttons */}
                <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    {(isDragging || isResizing || localPosition) && (
                        <button
                            onClick={handleCancel}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="bg-yellow-500 text-white p-1.5 rounded-full shadow-lg hover:bg-yellow-600 transition-colors pointer-events-auto"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 3v5h5" />
                            </svg>
                        </button>
                    )}

                    {removeOverlay && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                removeOverlay(ov.id);
                            }}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors pointer-events-auto"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* Resize handles (MOVED OUTSIDE overflow-hidden) */}
            <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ns-resize shadow-lg z-[200] pointer-events-auto"
                onMouseDown={(e) => handleResizeStart(e, 'top')}
            />
            <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ns-resize shadow-lg z-[200] pointer-events-auto"
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ew-resize shadow-lg z-[200] pointer-events-auto"
                onMouseDown={(e) => handleResizeStart(e, 'left')}
            />
            <div
                className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ew-resize shadow-lg z-[200] pointer-events-auto"
                onMouseDown={(e) => handleResizeStart(e, 'right')}
            />

            {/* Corner handles for avatars */}
            {isAvatar && (
                <>
                    <div
                        className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nwse-resize shadow-lg z-[200] pointer-events-auto"
                        onMouseDown={(e) => handleResizeStart(e, 'top-right')}
                    />
                    <div
                        className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nesw-resize shadow-lg z-[200] pointer-events-auto"
                        onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
                    />
                    <div
                        className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nwse-resize shadow-lg z-[200] pointer-events-auto"
                        onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
                    />
                    <div
                        className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nesw-resize shadow-lg z-[200] pointer-events-auto"
                        onMouseDown={(e) => handleResizeStart(e, 'top-left')}
                    />
                </>
            )}
        </motion.div>
    );
}
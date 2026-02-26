import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export default function OverlayItem({
    ov,
    containerRef,
    onUpdate,
    overlays,
    removeOverlay,
    isAvatar = false,
    onSelect
}) {
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef({ x: 0, y: 0 });
    const itemStartPos = useRef({ x: 0, y: 0 });
    const resizeStartData = useRef(null);
    const resizeObserverRef = useRef(null);

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
        };
    }, [containerRef]); // Only depend on containerRef, not containerRef.current

    // Convert percentage to pixels for positioning
    const getPixelPosition = useCallback(() => {
        if (!containerSize.width || !containerSize.height) {
            return { left: 0, top: 0, width: 0, height: 0 };
        }

        const width = (ov.w / 100) * containerSize.width;
        // 🛑 SYNC: Use percentage height for freedom, like backend
        const height = (ov.h / 100) * containerSize.height;

        return {
            left: (ov.x / 100) * containerSize.width,
            top: (ov.y / 100) * containerSize.height,
            width,
            height
        };
    }, [ov.x, ov.y, ov.w, ov.h, containerSize, isAvatar]);

    // Convert pixels to percentage for storage
    const pixelsToPercentage = useCallback((pixels) => {
        if (!containerSize.width || !containerSize.height) {
            return { x: ov.x, y: ov.y, w: ov.w, h: ov.h };
        }

        const w = (pixels.width / containerSize.width) * 100;
        const h = (pixels.height / containerSize.height) * 100;

        return {
            x: Math.max(0, Math.min(100, (pixels.left / containerSize.width) * 100)),
            y: Math.max(0, Math.min(100, (pixels.top / containerSize.height) * 100)),
            w: Math.max(5, Math.min(100, w)),
            h: Math.max(5, Math.min(100, h))
        };
    }, [containerSize, ov.x, ov.y, ov.w, ov.h, isAvatar]);

    const pixelPos = getPixelPosition();

    // Handle drag start
    const handleDragStart = useCallback((event, info) => {
        if (isResizing) return false;

        setIsDragging(true);
        dragStartPos.current = { x: info.point.x, y: info.point.y };
        itemStartPos.current = {
            left: pixelPos.left,
            top: pixelPos.top
        };
    }, [isResizing, pixelPos.left, pixelPos.top]);

    // Handle drag
    const handleDrag = useCallback((event, info) => {
        if (!isDragging || !containerSize.width || !containerSize.height || !containerRef.current) return;

        // Calculate scale factor if container is transformed
        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = rect.width / containerRef.current.offsetWidth || 1;
        const scaleY = rect.height / containerRef.current.offsetHeight || 1;

        // Calculate new position in logical pixels (normalized by scale)
        const deltaX = (info.point.x - dragStartPos.current.x) / scaleX;
        const deltaY = (info.point.y - dragStartPos.current.y) / scaleY;

        let newLeftPx = itemStartPos.current.left + deltaX;
        let newTopPx = itemStartPos.current.top + deltaY;

        // Constrain to container bounds
        const maxLeftPx = containerSize.width - pixelPos.width;
        const maxTopPx = containerSize.height - pixelPos.height;

        newLeftPx = Math.max(0, Math.min(maxLeftPx, newLeftPx));
        newTopPx = Math.max(0, Math.min(maxTopPx, newTopPx));

        // Convert to percentage and update
        const percentage = pixelsToPercentage({
            left: newLeftPx,
            top: newTopPx,
            width: pixelPos.width,
            height: pixelPos.height
        });

        const updatedOverlays = overlays.map(o =>
            o.id === ov.id
                ? { ...o, x: percentage.x, y: percentage.y }
                : o
        );
        onUpdate(updatedOverlays);
    }, [isDragging, containerSize, pixelPos, overlays, ov.id, onUpdate, pixelsToPercentage, containerRef]);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle resize
    const handleResizeStart = useCallback((e, corner) => {
        e.preventDefault();
        e.stopPropagation();

        setIsResizing(true);

        resizeStartData.current = {
            corner,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: pixelPos.left,
            startTop: pixelPos.top,
            startWidth: pixelPos.width,
            startHeight: pixelPos.height
        };

        const onMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();

            if (!resizeStartData.current || !containerSize.width || !containerSize.height || !containerRef.current) return;

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
                    newTop = resizeStartData.current.top + (resizeStartData.current.startHeight - newHeight);
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
            newLeft = Math.max(0, Math.min(containerSize.width - newWidth, newLeft));
            newTop = Math.max(0, Math.min(containerSize.height - newHeight, newTop));

            // Convert to percentage and update
            const percentage = pixelsToPercentage({
                left: newLeft,
                top: newTop,
                width: newWidth,
                height: newHeight
            });

            const updatedOverlays = overlays.map(o =>
                o.id === ov.id
                    ? { ...o, x: percentage.x, y: percentage.y, w: percentage.w, h: percentage.h }
                    : o
            );
            onUpdate(updatedOverlays);
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            setIsResizing(false);
            resizeStartData.current = null;
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    }, [pixelPos, containerSize, isAvatar, overlays, ov.id, onUpdate, pixelsToPercentage]);

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

    return (
        <motion.div
            drag={!isResizing}
            dragMomentum={false}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onTap={() => {
                if (onSelect && !isDragging && !isResizing) {
                    onSelect(ov.id);
                }
            }}
            dragPropagation={false}
            style={{
                position: 'absolute',
                left: pixelPos.left,
                top: pixelPos.top,
                width: pixelPos.width,
                height: pixelPos.height,
                zIndex: ov.zIndex || 50,
                pointerEvents: 'auto',
                cursor: isResizing ? 'grabbing' : 'grab',
            }}
            className="group overlay-item-interactive"
        >
            <div className={`relative w-full h-full ${isAvatar ? 'border-2 border-dashed border-transparent group-hover:border-blue-500' : 'border-2 border-white/50 group-hover:border-blue-500'} transition-colors rounded-lg overflow-hidden`}>
                {/* Content */}
                {isAvatar ? (
                    <img
                        src={ov.img}
                        alt="avatar"
                        className="w-full h-full object-cover pointer-events-none select-none"
                        style={{
                            borderRadius: isRound ? '50%' : '0px',
                            WebkitMaskImage: 'linear-gradient(to bottom, white 70%, transparent 100%)',
                            maskImage: 'linear-gradient(to bottom, white 70%, transparent 100%)'
                        }}
                    />
                ) : (
                    <div
                        className="w-full h-full flex items-center justify-center pointer-events-none select-none p-2"
                        style={{
                            fontSize: `${ov.style?.fontSize || 24}px`,
                            color: ov.style?.color || '#ffffff',
                            fontFamily: ov.style?.fontFamily || 'Inter',
                            fontWeight: ov.style?.fontWeight || 'bold',
                            textAlign: ov.style?.align || 'center',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                            lineHeight: 1.2,
                            wordBreak: 'break-word'
                        }}
                    >
                        {ov.content}
                    </div>
                )}

                {/* Remove button */}
                {removeOverlay && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeOverlay(ov.id);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="absolute -top-3 -right-3 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 z-10"
                    >
                        <X size={12} />
                    </button>
                )}

                {/* Resize handles */}
                <div
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ns-resize shadow-lg z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'top')}
                />
                <div
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ns-resize shadow-lg z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'bottom')}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ew-resize shadow-lg z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'left')}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-ew-resize shadow-lg z-10"
                    onMouseDown={(e) => handleResizeStart(e, 'right')}
                />

                {/* Corner handles for avatars (to maintain aspect ratio) */}
                {isAvatar && (
                    <>
                        <div
                            className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nwse-resize shadow-lg z-10"
                            onMouseDown={(e) => handleResizeStart(e, 'top-right')}
                        />
                        <div
                            className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nesw-resize shadow-lg z-10"
                            onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
                        />
                        <div
                            className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nwse-resize shadow-lg z-10"
                            onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
                        />
                        <div
                            className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 cursor-nesw-resize shadow-lg z-10"
                            onMouseDown={(e) => handleResizeStart(e, 'top-left')}
                        />
                    </>
                )}
            </div>
        </motion.div>
    );
}

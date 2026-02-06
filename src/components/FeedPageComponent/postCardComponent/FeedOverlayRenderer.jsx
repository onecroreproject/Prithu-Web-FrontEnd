import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeedOverlayRenderer({
    overlayElements = [],
    viewer = {},
    visibilityConfig = {},
    prithuLogoUrl = "",
    playSessionId = 0,
    isVisible = false,
    freezeAtEnd = true,
}) {
    if (!Array.isArray(overlayElements) || overlayElements.length === 0) return null;

    const getOffscreenPosition = (dir) => {
        const d = dir?.toLowerCase() || "";
        let x = "0";
        let y = "0";

        if (d.includes("top")) y = "-120%";
        if (d.includes("bottom")) y = "120%";
        if (d.includes("left")) x = "-120%";
        if (d.includes("right")) x = "120%";

        if (d === "top-left") { x = "-120%"; y = "-120%"; }
        if (d === "top-right") { x = "120%"; y = "-120%"; }
        if (d === "bottom-left") { x = "-120%"; y = "120%"; }
        if (d === "bottom-right") { x = "120%"; y = "120%"; }

        return { x, y };
    };

    const renderOverlay = (el) => {
        const id = el.id || el._id;
        const x = el.xPercent ?? el.x ?? 0;
        const y = el.yPercent ?? el.y ?? 0;
        const w = el.wPercent ?? el.w ?? 20;
        const h = el.hPercent ?? el.h ?? 20;

        const dir = el.animation?.direction || el.animDir || "";
        const speedVal = el.animation?.speed || el.animSpeed || 1;
        const speed = typeof speedVal === 'number' ? speedVal : parseFloat(speedVal) || 1;
        const animEnabled = el.animation?.enabled ?? el.animEnabled ?? false;

        const { x: startX, y: startY } = getOffscreenPosition(dir);

        // Animation variants
        const variants = {
            initial: animEnabled ? {
                x: startX,
                y: startY,
                opacity: 0,
                scale: 0.8
            } : { x: 0, y: 0, opacity: 1, scale: 1 },
            animate: {
                x: 0,
                y: 0,
                opacity: 1,
                scale: 1,
                transition: {
                    duration: speed,
                    ease: [0.2, 0.8, 0.2, 1], // Equivalent to cubic-bezier(0.2, 0.8, 0.2, 1)
                }
            }
        };

        const commonStyle = {
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            width: `${w}%`,
            height: `${h}%`,
            zIndex: el.zIndex || 30,
            display: el.visible === false ? "none" : "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
        };

        let content = null;

        if (el.type === "logo") {
            content = (
                <img
                    src={prithuLogoUrl}
                    alt="logo"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
            );
        } else if (el.type === "avatar") {
            const avatarUrl = viewer?.modifyAvatar || viewer?.profileAvatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            // Check if name visibility is public to show avatar? 
            // Usually avatars are separate, but if the user wants to be private, maybe hide avatar too?
            // The schema doesn't have a specific "profileAvatar" visibility, but "name" is often the proxy.
            const showAvatar = visibilityConfig.name !== false;

            if (!showAvatar) return null;

            content = (
                <div style={{ width: "100%", height: "100%" }}>
                    <img
                        src={avatarUrl}
                        alt="viewer-avatar"
                        className="transition-all duration-300 shadow-lg"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: (el.avatarConfig?.shape === 'square' || el.avatarConfig?.shape === 'rectangle' || el.shape === 'square' || el.shape === 'rectangle') ? "12px" : "100000px",
                            maskImage: (el.avatarConfig?.shape === 'square' || el.avatarConfig?.shape === 'rectangle' || el.shape === 'square' || el.shape === 'rectangle')
                                ? "linear-gradient(to bottom, black 0%, black 88%, transparent 100%)"
                                : "radial-gradient(110% 100% at 50% 0%, black 78%, transparent 100%)",
                            WebkitMaskImage: (el.avatarConfig?.shape === 'square' || el.avatarConfig?.shape === 'rectangle' || el.shape === 'square' || el.shape === 'rectangle')
                                ? "linear-gradient(to bottom, black 0%, black 88%, transparent 100%)"
                                : "radial-gradient(110% 100% at 50% 0%, black 78%, transparent 100%)",
                            filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.35))",
                        }}
                    />
                </div>
            );
        } else if (el.type === "username" || el.type === "text") {
            const textConfig = el.textConfig || {};
            const isUsername = el.type === "username";

            // Guard for username visibility
            if (isUsername && visibilityConfig.userName === false) return null;

            content = (
                <div style={{
                    color: textConfig.color || "white",
                    fontSize: textConfig.fontSize ? `${textConfig.fontSize}px` : "16px",
                    fontFamily: textConfig.fontFamily || "inherit",
                    fontWeight: textConfig.fontWeight || "bold",
                    textAlign: textConfig.align || "center",
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                    lineHeight: textConfig.lineHeight || 1.2,
                    whiteSpace: "nowrap",
                }}>
                    {isUsername ? (viewer?.userName || viewer?.name || "User") : (textConfig.content || el.content || "")}
                </div>
            );
        }

        if (!content) return null;

        return (
            <motion.div
                key={`${id}-${playSessionId}`}
                style={commonStyle}
                variants={variants}
                initial="initial"
                animate={isVisible ? "animate" : "initial"}
            >
                {content}
            </motion.div>
        );
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
            {overlayElements.map(renderOverlay)}
        </div>
    );
}

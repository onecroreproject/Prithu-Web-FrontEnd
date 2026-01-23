import React, { useEffect, useState } from "react";

export default function FeedOverlayRenderer({
    overlayElements = [],
    viewer = {},
    prithuLogoUrl = "",
    playSessionId = 0,
    isVisible = false,
    freezeAtEnd = true,
}) {
    const [animateKey, setAnimateKey] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setAnimateKey((k) => k + 1);
        }
    }, [isVisible, playSessionId]);

    if (!Array.isArray(overlayElements) || overlayElements.length === 0) return null;

    const getOffscreenPosition = (dir) => {
        const d = dir?.toLowerCase() || "";
        let x = "0";
        let y = "0";

        // We use large viewport-relative units to ensure it starts outside the container
        if (d.includes("top")) y = "-120vh";
        if (d.includes("bottom")) y = "120vh";
        if (d.includes("left")) x = "-120vw";
        if (d.includes("right")) x = "120vw";

        // Combinations
        if (d === "top-left") { x = "-120vw"; y = "-120vh"; }
        if (d === "top-right") { x = "120vw"; y = "-120vh"; }
        if (d === "bottom-left") { x = "-120vw"; y = "120vh"; }
        if (d === "bottom-right") { x = "120vw"; y = "120vh"; }

        return { x, y };
    };

    const getAnimStyle = (el) => {
        const dir = el.animation?.direction || el.animDir;
        const speedVal = el.animation?.speed || el.animSpeed || 1;
        const speed = typeof speedVal === 'number' ? `${speedVal}s` : speedVal;
        const enabled = el.animation?.enabled ?? el.animEnabled ?? false;

        if (!dir || dir === "none" || !enabled) return {};

        return {
            animation: `overlayEntry-${animateKey}-${el.id || el._id} ${speed} cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
        };
    };

    const renderOverlay = (el) => {
        console.log(el.avatarConfig)
        const id = el.id || el._id;
        const x = el.xPercent ?? el.x ?? 0;
        const y = el.yPercent ?? el.y ?? 0;
        const w = el.wPercent ?? el.w ?? 20;
        const h = el.hPercent ?? el.h ?? 20;

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
            willChange: "transform, opacity",
            ...getAnimStyle(el),
        };

        if (el.type === "logo") {
            return (
                <img
                    key={id}
                    src={prithuLogoUrl}
                    alt="logo"
                    style={{ ...commonStyle, objectFit: "contain" }}
                />
            );
        }

        if (el.type === "avatar") {
            const avatarUrl = viewer?.modifyAvatar || viewer?.profileAvatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png";
            return (
                <div key={id} style={commonStyle}>
                    <img
                        src={avatarUrl}
                        alt="viewer-avatar"
                        className="transition-all duration-300 shadow-lg"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            borderRadius: (el.avatarConfig?.shape === 'square' || el.avatarConfig?.shape === 'rectangle' || el.shape === 'square' || el.shape === 'rectangle') ? "8px" : "100000px",
                            maskImage: (el.avatarConfig?.shape === 'square' || el.avatarConfig?.shape === 'rectangle' || el.shape === 'square' || el.shape === 'rectangle')
                                ? "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)"
                                : "radial-gradient(120% 100% at 50% 0%, black 75%, transparent 100%)",
                            WebkitMaskImage: (el.avatarConfig?.shape === 'square' || el.avatarConfig?.shape === 'rectangle' || el.shape === 'square' || el.shape === 'rectangle')
                                ? "linear-gradient(to bottom, black 0%, black 85%, transparent 100%)"
                                : "radial-gradient(120% 100% at 50% 0%, black 75%, transparent 100%)",
                            filter: "drop-shadow(0px 10px 18px rgba(0,0,0,0.45))",
                            backgroundColor: "transparent",
                        }}
                    />
                </div>
            );
        }

        if (el.type === "username" || el.type === "text") {
            const textConfig = el.textConfig || {};
            return (
                <div key={id} style={{
                    ...commonStyle,
                    color: textConfig.color || "white",
                    fontSize: textConfig.fontSize ? `${textConfig.fontSize}px` : "16px",
                    fontFamily: textConfig.fontFamily || "inherit",
                    fontWeight: textConfig.fontWeight || "bold",
                    textAlign: textConfig.align || "center",
                    textShadow: "0 2px 8px rgba(0,0,0,0.8)",
                    lineHeight: textConfig.lineHeight || 1.2,
                    whiteSpace: "nowrap",
                }}>
                    {el.type === "username" ? (viewer?.userName || viewer?.name || "User") : (textConfig.content || el.content || "")}
                </div>
            );
        }

        return null;
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
            <style>{`
                ${overlayElements
                    .map((el) => {
                        const dir = el.animation?.direction || el.animDir || "";
                        const enabled = el.animation?.enabled ?? el.animEnabled ?? false;
                        if (!dir || dir === "none" || !enabled) return "";

                        const { x: startX, y: startY } = getOffscreenPosition(dir);

                        return `
                        @keyframes overlayEntry-${animateKey}-${el.id || el._id} {
                            from { 
                                transform: translate(${startX}, ${startY}) scale(0.8);
                                opacity: 0;
                            }
                            to { 
                                transform: translate(0, 0) scale(1);
                                opacity: 1;
                            }
                        }
                        `;
                    })
                    .join("\n")}
            `}</style>

            {overlayElements.map(renderOverlay)}
        </div>
    );
}

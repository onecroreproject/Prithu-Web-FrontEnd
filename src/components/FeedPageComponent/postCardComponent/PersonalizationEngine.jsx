import React, { useRef, useEffect, useState, useMemo } from "react";

/**
 * Crafto-Style Personalization Engine (Canvas Edition)
 * Finalized for Strict Privacy & Frontend-Only Personalization
 */
export default function PersonalizationEngine({
    template = {},
    viewer = {},
    isVisible = false
}) {
    const containerRef = useRef(null);
    const bgVideoRef = useRef(null);
    const avatarVideoRef = useRef(null);
    const usernameVideoRef = useRef(null);
    const footerVideoRef = useRef(null);
    const canvasRef = useRef(null);
    const avatarImgRef = useRef(null);
    const animationFrameRef = useRef(null);

    // Offscreen canvases for localized masking
    const avatarCanvasRef = useRef(null);
    const userCanvasRef = useRef(null);
    const footerCanvasRef = useRef(null);

    // Static content canvases (Optimization)
    const staticUserContentRef = useRef(null);
    const staticFooterContentRef = useRef(null);

    // Flow & Logging Refs
    const logsRef = useRef({
        bg: false,
        avatar: false,
        user: false,
        footer: false
    });

    // Tracking injected content status
    const mediaContentRef = useRef({
        avatarMask: false,
        userMask: false,
        footerMask: false
    });

    const [debugMode, setDebugMode] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const TARGET_WIDTH = 720;
    const TARGET_HEIGHT = 1280;

    const { backgroundVideo, avatarMaskVideo: rawAvatarMask, usernameMaskVideo: rawUserMask, footerMaskVideo: rawFooterMask, templateJson } = template;

    // 🔒 PRIVACY ENFORCEMENT & CONDITIONAL MASK LOADING
    const sanitizedMasks = useMemo(() => {
        const canShowUser = viewer.visibility?.userName === "public";
        const canShowPhone = viewer.visibility?.phoneNumber === "public";
        const canShowSocial = viewer.visibility?.socialLinks === "public";

        const hasFooterContent = canShowPhone || canShowSocial;

        return {
            avatar: rawAvatarMask?.url ? rawAvatarMask : null,
            username: (rawUserMask?.url && canShowUser) ? rawUserMask : null,
            footer: (rawFooterMask?.url && hasFooterContent) ? rawFooterMask : null,
            privacy: { canShowUser, canShowPhone, canShowSocial }
        };
    }, [rawAvatarMask, rawUserMask, rawFooterMask, viewer.visibility]);

    // ✅ Stalled Recovery Effect
    useEffect(() => {
        const checkStalls = setInterval(() => {
            [bgVideoRef, avatarVideoRef, usernameVideoRef, footerVideoRef].forEach(ref => {
                const vid = ref.current;
                if (vid && vid.readyState < 2 && !vid.paused) {
                    vid.load();
                }
            });
        }, 5000);
        return () => clearInterval(checkStalls);
    }, [reloadKey]);

    // ✅ Video Sync Logic
    useEffect(() => {
        const bg = bgVideoRef.current;
        if (!bg || !isVisible) return;

        const syncInterval = setInterval(() => {
            if (bg.paused || bg.seeking) return;
            const time = bg.currentTime;

            [avatarVideoRef, usernameVideoRef, footerVideoRef].forEach(ref => {
                const vid = ref.current;
                if (vid && vid.readyState >= 2) {
                    if (vid.paused) vid.play().catch(() => { });
                    const drift = Math.abs(vid.currentTime - time);
                    if (drift > 0.5) vid.currentTime = time;
                }
            });
        }, 2000);

        return () => clearInterval(syncInterval);
    }, [isVisible, reloadKey]);

    useEffect(() => {
        if (!isVisible || !templateJson) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d", { alpha: false });
        const bg = bgVideoRef.current;
        const aMask = avatarVideoRef.current;
        const uMask = usernameVideoRef.current;
        const fMask = footerVideoRef.current;
        const aImg = avatarImgRef.current;

        if (!ctx || !bg) return;

        const scaleX = TARGET_WIDTH / 1080;
        const scaleY = TARGET_HEIGHT / 1920;
        const userFont = `bold ${Math.round(46 * scaleX)}px Outfit, sans-serif`;
        const footerFont = `${Math.round(30 * scaleX)}px Outfit, sans-serif`;

        // Initialize offscreen canvases
        if (!avatarCanvasRef.current) avatarCanvasRef.current = document.createElement("canvas");
        if (!userCanvasRef.current) userCanvasRef.current = document.createElement("canvas");
        if (!footerCanvasRef.current) footerCanvasRef.current = document.createElement("canvas");
        if (!staticUserContentRef.current) staticUserContentRef.current = document.createElement("canvas");
        if (!staticFooterContentRef.current) staticFooterContentRef.current = document.createElement("canvas");

        const avCtx = avatarCanvasRef.current.getContext("2d");
        const uCtx = userCanvasRef.current.getContext("2d");
        const fCtx = footerCanvasRef.current.getContext("2d");

        const draw = () => {
            if (!isVisible) return;
            animationFrameRef.current = requestAnimationFrame(draw);

            // 1️⃣ Background Video (Base)
            if (bg.readyState >= 2) {
                ctx.drawImage(bg, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
                if (!logsRef.current.bg) {
                    console.log("🎥 [Personalization] Background Layer Playing");
                    logsRef.current.bg = true;
                }
            } else {
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
            }

            // 2️⃣ Avatar Mask Layer
            if (sanitizedMasks.avatar && aMask && aMask.readyState >= 2 && !aMask.paused && templateJson.avatar) {
                const { x, y } = templateJson.avatar;
                const px = x * scaleX;
                const py = y * scaleY;
                const rw = Math.round(aMask.videoWidth * scaleX);
                const rh = Math.round(aMask.videoHeight * scaleY);

                if (rw > 0 && rh > 0) {
                    const avCanvas = avatarCanvasRef.current;
                    if (avCanvas.width !== rw || avCanvas.height !== rh) {
                        avCanvas.width = rw;
                        avCanvas.height = rh;
                    }

                    try {
                    avCtx.clearRect(0, 0, rw, rh);

if (aImg && aImg.complete && aImg.naturalWidth) {
    const imgW = aImg.naturalWidth;
    const imgH = aImg.naturalHeight;

    const scale = Math.max(rw / imgW, rh / imgH);
    const drawW = imgW * scale;
    const drawH = imgH * scale;
    const dx = (rw - drawW) / 2;
    const dy = (rh - drawH) / 2;

    avCtx.drawImage(aImg, dx, dy, drawW, drawH);
}

// MASK AFTER DRAW
avCtx.globalCompositeOperation = "destination-in";
avCtx.drawImage(
    aMask,
    0, 0, aMask.videoWidth, aMask.videoHeight,
    0, 0, rw, rh
);
avCtx.globalCompositeOperation = "source-over";

// FINAL COMPOSITE
ctx.drawImage(
    avatarCanvasRef.current,
    Math.round(px - rw / 2),
    Math.round(py - rh / 2)
);


                        if (!logsRef.current.avatar) {
                            console.log("👤 [Personalization] Avatar Layer Masking Active");
                            logsRef.current.avatar = true;
                        }
                    } catch (e) { }
                }
            }

            // 3️⃣ Username Mask Layer (Privacy Enforced)
            if (sanitizedMasks.username && uMask && uMask.readyState >= 2 && !uMask.paused && templateJson.username && viewer.userName) {
                const { x, y } = templateJson.username;
                const upx = x * scaleX;
                const upy = y * scaleY;
                const rw = Math.round(uMask.videoWidth * scaleX);
                const rh = Math.round(uMask.videoHeight * scaleY);

                if (rw > 0 && rh > 0) {
                    const sUser = staticUserContentRef.current;
                    if (sUser.width !== rw || sUser.height !== rh) {
                        sUser.width = rw;
                        sUser.height = rh;
                        const sCtx = sUser.getContext("2d");
                        sCtx.font = userFont;
                        sCtx.textAlign = "center";
                        sCtx.textBaseline = "middle";
                        sCtx.fillStyle = "white";
                        sCtx.fillText(viewer.userName, rw / 2, rh / 2);
                    }

                    const uCanvas = userCanvasRef.current;
                    if (uCanvas.width !== rw || uCanvas.height !== rh) {
                        uCanvas.width = rw;
                        uCanvas.height = rh;
                    }

                    try {
                        uCtx.clearRect(0, 0, rw, rh);
                        uCtx.drawImage(sUser, 0, 0);
                        mediaContentRef.current.userMask = true;
                        uCtx.globalCompositeOperation = "destination-in";
                        uCtx.drawImage(uMask, 0, 0, uMask.videoWidth, uMask.videoHeight, 0, 0, rw, rh);
                        uCtx.globalCompositeOperation = "source-over";
                        ctx.drawImage(uCanvas, Math.round(upx - rw / 2), Math.round(upy - rh / 2));

                        if (!logsRef.current.user) {
                            console.log("✍️ [Personalization] Username Layer Masking Active");
                            logsRef.current.user = true;
                        }
                    } catch (e) { }
                }
            }

            // 4️⃣ Footer Mask Layer (Privacy Enforced & Content Injection)
            if (sanitizedMasks.footer && fMask && fMask.readyState >= 2 && !fMask.paused && templateJson.footer) {
                const { x, y } = templateJson.footer;
                const fpx = (x !== undefined ? x : 540) * scaleX;
                const fpy = y * scaleY;
                const rw = Math.round(fMask.videoWidth * scaleX);
                const rh = Math.round(fMask.videoHeight * scaleY);

                if (rw > 0 && rh > 0) {
                    const sFooter = staticFooterContentRef.current;
                    if (sFooter.width !== rw || sFooter.height !== rh) {
                        sFooter.width = rw;
                        sFooter.height = rh;
                        const sCtx = sFooter.getContext("2d");

                        // Footer Background
                        sCtx.fillStyle = "rgba(0,0,0,0.8)";
                        sCtx.fillRect(0, 0, rw, rh);

                        // Injection Logic (Frontend Only)
                        let textY = rh / 2;
                        sCtx.fillStyle = "white";
                        sCtx.font = footerFont;
                        sCtx.textAlign = "center";
                        sCtx.textBaseline = "middle";

                        const footerText = [];
                        if (sanitizedMasks.privacy.canShowPhone && viewer.phone) footerText.push(viewer.phone);
                        // Simplified: Show social links as text if available
                        if (sanitizedMasks.privacy.canShowSocial && viewer.socialLinks) {
                            const platforms = Object.keys(viewer.socialLinks).filter(k => viewer.socialLinks[k]);
                            if (platforms.length > 0) footerText.push(platforms.join(" | "));
                        }

                        sCtx.fillText(footerText.join("  •  "), rw / 2, textY);
                    }

                    const fCanvas = footerCanvasRef.current;
                    if (fCanvas.width !== rw || fCanvas.height !== rh) {
                        fCanvas.width = rw;
                        fCanvas.height = rh;
                    }

                    try {
                        fCtx.clearRect(0, 0, rw, rh);
                        fCtx.drawImage(sFooter, 0, 0);
                        mediaContentRef.current.footerMask = true;
                        fCtx.globalCompositeOperation = "destination-in";
                        fCtx.drawImage(fMask, 0, 0, fMask.videoWidth, fMask.videoHeight, 0, 0, rw, rh);
                        fCtx.globalCompositeOperation = "source-over";
                        ctx.drawImage(fCanvas, Math.round(fpx - rw / 2), Math.round(fpy - rh / 2));

                        if (!logsRef.current.footer) {
                            console.log("🦶 [Personalization] Footer Layer Masking Active");
                            logsRef.current.footer = true;
                        }
                    } catch (e) { }
                }
            }
        };

        animationFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isVisible, templateJson, viewer, reloadKey, sanitizedMasks]);

    if (!backgroundVideo?.url) return null;

    const sourceVideoStyle = {
        position: "absolute",
        width: "1px",
        height: "1px",
        opacity: 0,
        pointerEvents: "none",
        zIndex: -1,
    };

    const forceReload = () => {
        logsRef.current = { bg: false, avatar: false, user: false, footer: false };
        setReloadKey(prev => prev + 1);
    };

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center" style={{ aspectRatio: "9/16" }}>
            <div className="absolute top-2 left-2 z-[200] flex flex-col gap-1 opacity-10 hover:opacity-100 transition-opacity">
                <button onClick={() => setDebugMode(!debugMode)} className="bg-white/20 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
                    {debugMode ? "Hide Masks" : "Show Masks"}
                </button>
                <button onClick={forceReload} className="bg-red-500/40 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md">
                    Reload
                </button>
            </div>

            <video key={`bg-${reloadKey}`} ref={bgVideoRef} src={backgroundVideo.url} autoPlay loop muted playsInline preload="auto" crossOrigin="anonymous" style={sourceVideoStyle} />

            {sanitizedMasks.avatar && (
                <>
                    <img key={`img-${reloadKey}`} ref={avatarImgRef} src={viewer.profileAvatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} crossOrigin="anonymous" style={{ display: "none" }} />
                    <video key={`mask-${reloadKey}`} ref={avatarVideoRef} src={sanitizedMasks.avatar.url} autoPlay loop muted playsInline preload="auto" crossOrigin="anonymous" style={sourceVideoStyle} />
                </>
            )}

            {sanitizedMasks.username && (
                <video key={`umask-${reloadKey}`} ref={usernameVideoRef} src={sanitizedMasks.username.url} autoPlay loop muted playsInline preload="auto" crossOrigin="anonymous" style={sourceVideoStyle} />
            )}

            {sanitizedMasks.footer && (
                <video key={`fmask-${reloadKey}`} ref={footerVideoRef} src={sanitizedMasks.footer.url} autoPlay loop muted playsInline preload="auto" crossOrigin="anonymous" style={sourceVideoStyle} />
            )}

            <canvas ref={canvasRef} width={TARGET_WIDTH} height={TARGET_HEIGHT} className="absolute inset-0 w-full h-full z-10 pointer-events-none" style={{ objectFit: "contain" }} />
        </div>
    );
}

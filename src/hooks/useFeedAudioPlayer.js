import { useEffect, useRef, useState, useCallback } from "react";
import { isAudioUnlocked } from "../utils/audioUnlock";

export default function useFeedAudioPlayer({ audioConfig, isVisible }) {
    const audioRef = useRef(null);
    const rafRef = useRef(null);

    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [playSessionId, setPlaySessionId] = useState(0);

    const audioUrl = audioConfig?.audioFile || null;
    const cropStart = Number(audioConfig?.crop?.start ?? 0);
    const cropEnd = Number(audioConfig?.crop?.end ?? 0);
    const volume = Number(audioConfig?.volume ?? 1);
    const loop = Boolean(audioConfig?.loop ?? false);

    const hasCrop = cropEnd > cropStart && cropEnd > 0;

    const stopWatcher = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    const startWatcher = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !hasCrop) return;

        const tick = () => {
            if (!audioRef.current) return;

            if (audio.currentTime >= cropEnd) {
                if (loop) {
                    audio.currentTime = cropStart;
                    audio.play().catch(() => { });
                } else {
                    audio.pause();
                }
            }

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    }, [cropStart, cropEnd, loop, hasCrop]);

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const onTimeUpdate = useCallback(() => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    }, []);

    const onLoadedMetadata = useCallback(() => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    }, []);

    /* ✅ Create audio instance */
    useEffect(() => {
        if (!audioUrl) return;

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.preload = "auto";
        audio.volume = volume;

        // ✅ IMPORTANT: do not default muted
        audio.muted = false;

        const onPlay = () => {
            setIsPlayingAudio(true);
            setPlaySessionId((p) => p + 1);
        };

        const onPause = () => setIsPlayingAudio(false);

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);

        return () => {
            stopWatcher();
            audio.pause();
            audio.currentTime = 0;
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audioRef.current = null;
            setIsPlayingAudio(false);
        };
    }, [audioUrl, volume, onTimeUpdate, onLoadedMetadata]);

    /* ✅ Update volume */
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = volume;
    }, [volume]);

    /* ✅ Autoplay ONLY when visible */
    useEffect(() => {
        const audio = audioRef.current;
        if (!audioUrl || !audio) return;

        if (!isVisible) {
            stopWatcher();
            audio.pause();
            return;
        }

        // ✅ must be unlocked
        if (!isAudioUnlocked()) {
            setIsBlocked(true);
            return;
        }

        // ✅ restart from cropStart whenever it becomes visible again
        if (hasCrop) {
            try {
                audio.currentTime = cropStart;
            } catch { }
        }

        audio
            .play()
            .then(() => {
                setIsBlocked(false);
                startWatcher();
            })
            .catch(() => {
                setIsBlocked(true);
                setIsPlayingAudio(false);
            });
    }, [isVisible, audioUrl, cropStart, hasCrop, startWatcher]);

    /* ✅ Manual Play / Pause */
    const manualToggle = async () => {
        const audio = audioRef.current;
        if (!audio) return;

        // pause
        if (!audio.paused) {
            stopWatcher();
            audio.pause();
            return;
        }

        // play
        if (hasCrop) {
            if (audio.currentTime < cropStart || audio.currentTime >= cropEnd) {
                audio.currentTime = cropStart;
            }
        }

        try {
            await audio.play();
            setIsBlocked(false);
            startWatcher();
        } catch {
            setIsBlocked(true);
        }
    };

    return {
        hasAudio: !!audioUrl,
        isPlayingAudio,
        isBlocked,
        manualToggle,
        playSessionId,
        currentTime,
        duration,
    };
}

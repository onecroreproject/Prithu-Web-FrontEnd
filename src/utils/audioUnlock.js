/**
 * Audio Unlock Utility
 * Handles browser autoplay policy by unlocking audio context on first user interaction
 */

let audioUnlocked = false;

export const unlockAudio = () => {
    if (audioUnlocked) return;

    // Create a silent audio element and play it
    const silentAudio = new Audio();
    silentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA";
    silentAudio.volume = 0;

    const playPromise = silentAudio.play();

    if (playPromise !== undefined) {
        playPromise
            .then(() => {
                audioUnlocked = true;
                console.log("✅ Audio unlocked successfully");
            })
            .catch(() => {
                console.warn("⚠️ Audio unlock failed - user interaction required");
            });
    }
};

export const isAudioUnlocked = () => audioUnlocked;

// Auto-unlock on first user interaction
if (typeof window !== "undefined") {
    const unlockOnInteraction = () => {
        unlockAudio();
        // Remove listeners after first unlock attempt
        document.removeEventListener("click", unlockOnInteraction);
        document.removeEventListener("touchstart", unlockOnInteraction);
        document.removeEventListener("keydown", unlockOnInteraction);
    };

    document.addEventListener("click", unlockOnInteraction);
    document.addEventListener("touchstart", unlockOnInteraction);
    document.addEventListener("keydown", unlockOnInteraction);
}

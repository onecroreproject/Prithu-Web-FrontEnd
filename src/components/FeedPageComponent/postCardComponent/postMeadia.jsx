import React, { useEffect } from "react";
import { VolumeUp, VolumeOff, PlayArrow, Pause } from "@mui/icons-material";

const PostMedia = ({
  type,
  contentUrl,
  videoRef,
  isMuted,
  isPlaying,
  togglePlayPause,
  toggleMute,
}) => {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || type !== "video") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!video) return;
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    observer.observe(video);

    return () => {
      observer.unobserve(video);
      observer.disconnect();
    };
  }, [videoRef, type]);

  return (
    <div
      className="relative w-full h-[480px] overflow-hidden border-b border-gray-400 animate-fadeIn"
    >
      {/* Background Blur */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl scale-110 z-0"
        style={{ backgroundImage: `url(${contentUrl})` }}
      />

      {/* Foreground */}
      <div className="relative z-10 w-full h-full flex justify-center items-center bg-black/10 transition-opacity duration-500">
        {type === "image" ? (
          <img
            src={contentUrl}
            alt="post"
            className="w-full h-full object-contain animate-fadeInSlow"
          />
        ) : (
          <video
            ref={videoRef}
            src={contentUrl}
            loop
            muted={isMuted}
            playsInline
            onClick={togglePlayPause}
            className={`w-full h-full object-contain cursor-pointer rounded-xl transition-opacity duration-500 ${
              isPlaying ? "opacity-100" : "opacity-90"
            }`}
          />
        )}
      </div>

      {/* Controls */}
      {type === "video" && (
        <>
          {/* Play / Pause */}
          <button
            onClick={togglePlayPause}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white bg-black/40 hover:bg-black/60 rounded-full p-3"
          >
            {isPlaying ? (
              <Pause fontSize="large" />
            ) : (
              <PlayArrow fontSize="large" />
            )}
          </button>

          {/* Mute / Unmute */}
          <button
            onClick={toggleMute}
            className="absolute bottom-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-2"
          >
            {isMuted ? <VolumeOff /> : <VolumeUp />}
          </button>
        </>
      )}
    </div>
  );
};

export default PostMedia;

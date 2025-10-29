import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { FiPlay, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const Stories = () => {
  const [feeds, setFeeds] = useState([]);
  const [selectedFeedIndex, setSelectedFeedIndex] = useState(null);
  const [thumbnails, setThumbnails] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Helper: generate video thumbnail in-browser
  const getVideoThumbnail = (videoUrl) =>
    new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.crossOrigin = "anonymous";
      video.muted = true;
      video.currentTime = 1;

      video.addEventListener("loadeddata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      });

      video.addEventListener("error", (e) => reject(e));
    });

  // ✅ Fetch trending feeds
  useEffect(() => {
    const fetchTrendingFeeds = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/get/trending/feed");
        const data = res.data?.data || [];
        setFeeds(data);

        // ✅ Generate thumbnails for videos
        data.forEach(async (feed) => {
          if (feed.type === "video" && feed.contentUrl) {
            try {
              const thumb = await getVideoThumbnail(feed.contentUrl);
              setThumbnails((prev) => ({ ...prev, [feed._id]: thumb }));
            } catch (err) {
              console.warn("Thumbnail generation failed:", err);
            }
          }
        });
      } catch (err) {
        console.error("Error fetching trending feeds:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingFeeds();
  }, []);


  const openPopup = (index) => setSelectedFeedIndex(index);
  const closePopup = () => setSelectedFeedIndex(null);
  const nextFeed = () =>
    setSelectedFeedIndex((prev) => (prev === feeds.length - 1 ? 0 : prev + 1));
  const prevFeed = () =>
    setSelectedFeedIndex((prev) => (prev === 0 ? feeds.length - 1 : prev - 1));

  // ✅ Skeleton Loader Component
  const SkeletonCard = () => (
    <div className="flex-shrink-0 w-28 h-48">
      <div className="relative rounded-xl overflow-hidden h-40 w-28 bg-gray-200 animate-pulse" />
      <div className="mt-2 h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse" />
    </div>
  );

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm max-w-[900px] mx-auto"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Feed Scroll */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {loading
          ? // ✅ Show 6 skeleton placeholders while loading
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : // ✅ Once loaded, show feeds
            feeds.map((feed, index) => (
              <motion.div
                key={feed._id}
                className="flex-shrink-0 w-28 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 200 }}
                onClick={() => openPopup(index)}
              >
                <div className="relative rounded-xl overflow-hidden h-40 w-28 bg-gray-200 flex items-center justify-center">
                  {feed.type === "video" ? (
                    <>
                      <img
                        src={
                          thumbnails[feed._id] ||
                          feed.thumbnail ||
                          "https://via.placeholder.com/150"
                        }
                        alt="video"
                        className="object-cover h-full w-full"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <FiPlay className="text-white text-3xl" />
                      </div>
                    </>
                  ) : (
                    <img
                      src={feed.contentUrl || "https://via.placeholder.com/150"}
                      alt={feed.caption || "Feed"}
                      className="object-cover h-full w-full"
                    />
                  )}
                  {/* Profile avatar */}
                  <img
                    src={
                      feed.createdByProfile?.profileAvatar ||
                      "https://default-avatar.example.com/default.png"
                    }
                    alt="avatar"
                    className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white object-cover"
                  />
                </div>
                <div className="mt-2 text-center text-[15px] font-medium truncate">
                  {feed.createdByProfile?.userName || "Unknown User"}
                </div>
              </motion.div>
            ))}
      </div>

      {/* ✅ Popup Modal */}
      <AnimatePresence>
        {selectedFeedIndex !== null && feeds[selectedFeedIndex] && (
          <motion.div
            key="modal"
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
          >
            <motion.div
              className="relative flex flex-col items-center"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closePopup}
                className="absolute top-3 right-3 text-white text-3xl bg-black/50 p-2 rounded-full hover:bg-black/70 transition"
              >
                <FiX />
              </button>

              {/* Prev button */}
              <button
                onClick={prevFeed}
                className="absolute left-[-50px] top-[250px] text-white text-4xl p-2 bg-black/30 rounded-full"
              >
                <FiChevronLeft />
              </button>

              {/* Feed content */}
              <div className="relative aspect-[9/16] w-[280px] sm:w-[350px] md:w-[400px] h-[600px] rounded-lg overflow-hidden shadow-lg bg-black flex items-center justify-center">
                {feeds[selectedFeedIndex].type === "video" ? (
                  <video
                    src={feeds[selectedFeedIndex].contentUrl}
                    controls
                    autoPlay
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={feeds[selectedFeedIndex].contentUrl}
                    alt="Feed content"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              <div className="text-white mt-3 text-lg font-medium text-center">
                {feeds[selectedFeedIndex].createdByProfile?.userName}
              </div>

              {/* Next button */}
              <button
                onClick={nextFeed}
                className="absolute right-[-50px] top-[250px] text-white text-4xl p-2 bg-black/30 rounded-full"
              >
                <FiChevronRight />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stories;

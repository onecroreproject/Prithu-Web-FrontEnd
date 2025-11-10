// ✅ src/pages/ReelsPage.jsx
import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { motion } from "framer-motion";
import Postcard from "../components/FeedPageComponent/Postcard";
import { Skeleton } from "@mui/material";

/* ✅ Skeleton Loader for Reels */
const ReelSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="h-screen w-full flex items-center justify-center bg-black snap-start"
  >
    <div className="w-full max-w-md">
      <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-md animate-pulse">
        <div className="flex items-center gap-3 p-3">
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{ bgcolor: "grey.700" }}
          />
          <div className="flex-1">
            <Skeleton variant="text" width="50%" sx={{ bgcolor: "grey.700" }} />
            <Skeleton variant="text" width="30%" sx={{ bgcolor: "grey.700" }} />
          </div>
        </div>
        <Skeleton
          variant="rectangular"
          width="100%"
          height={500}
          sx={{ bgcolor: "grey.800" }}
        />
        <div className="p-3">
          <Skeleton variant="text" width="80%" sx={{ bgcolor: "grey.700" }} />
          <Skeleton variant="text" width="60%" sx={{ bgcolor: "grey.700" }} />
        </div>
      </div>
    </div>
  </motion.div>
);

const ReelsPage = () => {
  const { token, user } = useContext(AuthContext);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const videoRefs = useRef([]);

  // ✅ Auto play/pause using IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            video.play();
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    videoRefs.current.forEach((video) => {
      if (video) observer.observe(video);
    });

    return () => observer.disconnect();
  }, [reels]);

  // ✅ Fetch all video feeds
  useEffect(() => {
    const fetchReels = async () => {
      if (!token) return;
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/api/get/all/feeds/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const videos = (res.data.feeds || []).filter(
          (feed) => feed.type?.toLowerCase() === "video"
        );

        setReels(videos);
      } catch (err) {
        console.error("❌ Error fetching reels:", err);
        setError("Failed to fetch reels");
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, [token]);

  if (error)
    return (
      <div className="h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );

  return (
    <motion.div
      className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory no-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {loading ? (
        <>
          {Array(3)
            .fill()
            .map((_, i) => (
              <ReelSkeleton key={i} />
            ))}
        </>
      ) : reels.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No reels found</p>
      ) : (
        reels.map((video, index) => (
          <motion.div
            key={video._id || index}
            className="h-screen w-full flex items-center justify-center snap-start"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-full max-w-md h-full flex items-center justify-center">
              <Postcard
                postData={video}
                authUser={user}
                ref={(el) => (videoRefs.current[index] = el?.querySelector("video"))}
              />
            </div>
          </motion.div>
        ))
      )}
    </motion.div>
  );
};

export default ReelsPage;

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import Postcard from "../components/FeedPageComponent/Postcard"; // using your existing card

const ReelsPage = () => {
  const { token, user } = useContext(AuthContext);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReels = async () => {
      if (!token) return;
      setLoading(true);
      setError("");

      try {
        const res = await api.get("/api/get/all/feeds/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // ✅ Filter only video posts
        const videos = (res.data.feeds || []).filter(
          (feed) => feed.type?.toLowerCase() === "video"
        );

        setReels(videos);
      } catch (err) {
        console.error("Error fetching reels:", err);
        setError("Failed to fetch reels");
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, [token]);

  if (loading) return <p className="text-center text-gray-500">Loading reels...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="h-screen w-full bg-white overflow-y-scroll snap-y snap-mandatory">
      {reels.length === 0 ? (
        <p className="text-center text-gray-400 mt-10">No reels found</p>
      ) : (
        reels.map((video, index) => (
          <div
            key={video._id}
            className="h-screen w-full flex items-center justify-center snap-start"
          >
            {/* Reuse your Postcard but force it full screen */}
            <div className="w-full max-w-md h-full flex items-center justify-center">
              <Postcard postData={video} authUser={user} />
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ReelsPage;

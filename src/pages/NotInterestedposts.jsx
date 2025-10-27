import React, { useEffect, useState } from "react";
import axios from "../api/axios";

const NotInterestedposts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotInterested = async () => {
      try {
        const token = localStorage.getItem("userToken");
        const res = await axios.get("/user/not-interested-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotInterested();
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!posts.length) return <p className="p-6">No posts marked as not interested.</p>;

  return (
    <div className="p-6 grid gap-4">
      {posts.map((post) => (
        <div key={post._id} className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg">{post.title}</h3>
          <p className="text-gray-600 mt-2">{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default NotInterestedposts;

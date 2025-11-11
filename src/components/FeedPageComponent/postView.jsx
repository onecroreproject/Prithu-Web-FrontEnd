// src/pages/PostDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

export default function PostDetails() {
  const { feedId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await api.get(`/api/feed/${feedId}`);
        setPost(res.data);
      } catch (err) {
        console.error("Failed to fetch post:", err);
      }
    };
    fetchPost();
  }, [feedId]);

  if (!post) return <p className="text-center mt-10">Loading post...</p>;

  return (
    <div className="flex flex-col items-center mt-6">
      <img
        src={post.contentUrl}
        alt="Shared post"
        className="max-w-md w-full rounded-lg shadow-lg"
      />
      <p className="mt-3 text-gray-700">{post.caption}</p>
    </div>
  );
}

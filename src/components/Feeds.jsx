// import React, { useState, useEffect, useContext } from "react";
// import { AuthContext } from "../../context/AuthContext";
// import axios from "../api/axios";
// import Stories from "./Stories";
// import Postcard from "./Postcard";

// const Feeds = ({ authUser }) => {
//   const { token } = useContext(AuthContext);
//   const [feeds, setFeeds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchFeeds = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get("/api/get/all/feeds/user", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
        

//         // Map backend feeds to Postcard-friendly format
//         const formattedFeeds = response.data.feeds.map((feed) => ({
//           feedId: feed.feedId,
//           type: feed.type || "image",
//           contentUrl: feed.contentUrl || "",
//           caption: feed.caption || "",
//           _id: feed._id || "guest",
//            userName: feed.userName || "Unknown",
//           profileAvatar: feed.profileAvatar || "",
//           postCreated: feed.postCreated ? new Date(feed.postCreated) : new Date(),
//           likesCount: feed.likesCount || 0,
//           likedUser: feed.likedUser || [],
//           comments: feed.comments || [],
//           commentsCount: feed.commentsCount || 0,
//         }));

//         setFeeds(formattedFeeds);
//         console.log("Fetched Feeds:", formattedFeeds);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch feeds");
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) fetchFeeds();
//   }, [token]);

//   // Dummy stories for now
//   const dummyStories = Array(7)
//     .fill()
//     .map((_, i) => ({
//       userName: `User ${i + 1}`,
//       profileAvatar: null,
//       hasStory: true,
//       feedId: i,
//     }));
    

//   return (
//     <div className="max-w-md mx-auto px-2 py-3">
//       {/* Stories Section */}
//       <Stories feeds={dummyStories} />

//       {/* Feed Posts */}
//       {loading && <p className="text-center py-6 text-gray-500">Loading feeds...</p>}
//       {error && <p className="text-center py-6 text-red-500">{error}</p>}

//       <div className="mt-5 flex flex-col gap-6">
//         {feeds.length > 0 ? (
//           feeds.map((feed) => (
//             <Postcard key={feed.feedId} postData={feed} authUser={authUser} />
//           ))
//         ) : (
//           !loading && <p className="text-center text-gray-500">No feeds available.</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Feeds;

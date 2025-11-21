import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, IconButton, Box, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Postcard from "../../FeedPageComponent/Postcard"; // Import your Postcard component

const SeeAllPhotosModal = ({ open, onClose, initialPosts = [], authUser, token }) => {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(false);

  // Fetch all photos if not provided initially
  useEffect(() => {
    const fetchAllPhotos = async () => {
      if (open && posts.length === 0) {
        try {
          setLoading(true);
          const res = await api.get("/api/get/user/post");
          const allPosts = res.data?.feeds || [];
          const imagePosts = allPosts.filter(p => p.type === "image");
          setPosts(imagePosts);
        } catch (err) {
          console.error("Error fetching photos:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAllPhotos();
  }, [open, posts.length]);

  // Handle post actions
  const handleHidePost = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handleNotInterested = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          margin: 0,
          width: "95vw",
          height: "95vh",
          maxWidth: "1200px",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.default",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          All Photos ({posts.length})
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 3,
          bgcolor: "background.default",
        }}
      >
        {loading ? (
          <Box className="flex justify-center items-center h-64">
            <Typography color="textSecondary">Loading photos...</Typography>
          </Box>
        ) : posts.length === 0 ? (
          <Box className="flex justify-center items-center h-64">
            <Typography color="textSecondary">No photos found</Typography>
          </Box>
        ) : (
          <motion.div
            className="space-y-6 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Postcard
                  postData={post}
                  authUser={authUser}
                  token={token}
                  onHidePost={() => handleHidePost(post._id)}
                  onNotInterested={() => handleNotInterested(post._id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </Box>
    </Dialog>
  );
};

export default SeeAllPhotosModal;
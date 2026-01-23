import React from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { FiMessageCircle } from "react-icons/fi";

const CommentBox = ({ comments, currentIndex, onClick }) => {
  if (!comments || comments.length === 0) return null;
  
  const comment = comments[currentIndex];
  
  return (
    <Box
      sx={{
        mt: 1.5,
        px: 2,
        py: 1.2,
        borderRadius: 3,
        cursor: "pointer",
        backdropFilter: "blur(10px)",
        background: "rgba(255, 255, 255, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.25)",
        overflow: "hidden",
        transition: "all 0.4s ease",
        "&:hover": { 
          background: "rgba(255, 255, 255, 0.55)",
          transform: "translateY(-1px)" 
        },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <FiMessageCircle size={16} />
        <Typography variant="subtitle2" fontWeight="bold">
          Comments
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          ({comments.length})
        </Typography>
      </Box>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "left",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.4,
            }}
          >
            <b>{comment?.username || comment?.userName || "User"}:</b> {comment?.commentText || ""}
          </Typography>
        </motion.div>
      </AnimatePresence>
    </Box>
  );
};

export default CommentBox;
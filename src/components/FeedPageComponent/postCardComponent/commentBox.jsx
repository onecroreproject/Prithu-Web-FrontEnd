import React from "react";
import { Box, Typography } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";

const CommentBox = ({ comments, currentIndex, onClick }) => {
  if (!comments.length) return null;
  const comment = comments[currentIndex];
  return (<>
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
        "&:hover": { background: "rgba(255, 255, 255, 0.55)" },
      }}
      onClick={onClick}
    >
      <h1 className="mb-2">Comments</h1>
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
            }}
          >
            <b>{comment?.username || "User"}:</b> {comment?.commentText || ""}
          </Typography>
        </motion.div>
      </AnimatePresence>
    </Box>
  </>);
};

export default CommentBox;

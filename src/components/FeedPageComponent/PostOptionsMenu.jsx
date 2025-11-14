import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  CircularProgress,
} from "@mui/material";
import {
  MoreHoriz,
  BookmarkBorder,
  Bookmark,
  ThumbDown,
  VisibilityOff,
  Flag,
} from "@mui/icons-material";
import api from "../../api/axios";
import ReportModal from "../../components/ReportModal"; // ✅ import dynamic modal

const PostOptionsMenu = ({
  feedId,
  authUserId,
  token,
  onNotInterested,
  onHidePost,
  onSavePost,
  isSaved: initialSaved = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const [openReportModal, setOpenReportModal] = useState(false); // ✅ NEW

  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // -------------------------------------------
  // Save / Unsave
  // -------------------------------------------
  const handleSaveToggle = async () => {
    setLoading(true);
    try {
      const endpoint = isSaved ? "/api/user/unsave/post" : "/api/user/save/post";
      const res = await api.post(
        endpoint,
        { postId: feedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSaved(!isSaved);
      setToastMsg(res.data.message || "Updated");
      if (onSavePost) onSavePost(feedId, !isSaved);
    } catch (err) {
      setToastMsg("Action failed");
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  // -------------------------------------------
  // Not Interested
  // -------------------------------------------
  const handleNotInterested = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        "/api/user/not/intrested",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg(res.data.message);
      if (onNotInterested) onNotInterested(feedId);
    } catch (err) {
      setToastMsg("Action failed");
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  // -------------------------------------------
  // Hide Post
  // -------------------------------------------
  const handleHidePost = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        "/api/user/hide/feed",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg(res.data.message);
      if (onHidePost) onHidePost(feedId);
    } catch (err) {
      setToastMsg("Hide failed");
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  // -------------------------------------------
  // REPORT → OPEN ReportModal
  // -------------------------------------------
  const handleReport = () => {
    handleClose();
    setOpenReportModal(true); // ✅ open the new modal
  };

  return (
    <>
      {/* MAIN MENU BUTTON */}
      <IconButton onClick={handleOpen} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : <MoreHoriz />}
      </IconButton>

      {/* MENU */}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        
        {/* Save */}
        <MenuItem onClick={handleSaveToggle}>
          <ListItemIcon>
            {isSaved ? <Bookmark /> : <BookmarkBorder />}
          </ListItemIcon>
          <ListItemText>{isSaved ? "Unsave" : "Save"}</ListItemText>
        </MenuItem>

        {/* Not Interested */}
        <MenuItem onClick={handleNotInterested}>
          <ListItemIcon>
            <ThumbDown />
          </ListItemIcon>
          <ListItemText>Not Interested</ListItemText>
        </MenuItem>

        {/* Hide */}
        <MenuItem onClick={handleHidePost}>
          <ListItemIcon>
            <VisibilityOff />
          </ListItemIcon>
          <ListItemText>Hide Post</ListItemText>
        </MenuItem>

        {/* REPORT */}
        <MenuItem onClick={handleReport}>
          <ListItemIcon>
            <Flag />
          </ListItemIcon>
          <ListItemText>Report</ListItemText>
        </MenuItem>
      </Menu>

      {/* FULL SCREEN REPORT MODAL */}
      {openReportModal && (
        <ReportModal
          targetId={feedId}
          targetType="Feed"
          onClose={() => setOpenReportModal(false)} // close callback
        />
      )}

      {/* TOAST */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3000}
        message={toastMsg}
        onClose={() => setToastMsg("")}
      />
    </>
  );
};

export default PostOptionsMenu;

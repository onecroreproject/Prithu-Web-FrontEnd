// src/components/PostOptionsMenu.jsx
import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  MoreHoriz,
  ThumbDown,
  VisibilityOff,
  Flag,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import api from "../../api/axios";
import ReportModal from "../../components/ReportModal";

const PostOptionsMenu = ({
  feedId,
  authUserId,
  token,
  onNotInterested,
  onHidePost,
  onHideFromUI,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);

  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  /* --------------------------------------------------
     NOT INTERESTED
  -------------------------------------------------- */
  const handleNotInterested = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        "/api/user/not/intrested",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(res.data.message);
      onNotInterested?.(feedId);

    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  /* --------------------------------------------------
     HIDE POST
  -------------------------------------------------- */
  const handleHidePost = async () => {
    setLoading(true);
    try {
      const res = await api.post(
        "/api/user/hide/feed",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setToastMsg(res.data.message);

      // 🔥 Remove from UI instantly
      onHideFromUI?.(feedId);

      // Optional callback
      onHidePost?.(feedId);

    } catch {
      setToastMsg("Hide failed");
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  /* --------------------------------------------------
     REPORT
  -------------------------------------------------- */
  const handleReport = () => {
    handleClose();
    setOpenReportModal(true);
  };

  return (
    <>
      <IconButton onClick={handleOpen} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : <MoreHoriz />}
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>

        <MenuItem onClick={handleNotInterested}>
          <ListItemIcon><ThumbDown /></ListItemIcon>
          <ListItemText>Not Interested</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleHidePost}>
          <ListItemIcon><VisibilityOff /></ListItemIcon>
          <ListItemText>Hide Post</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleReport}>
          <ListItemIcon><Flag /></ListItemIcon>
          <ListItemText>Report</ListItemText>
        </MenuItem>

      </Menu>

      {openReportModal && (
        <ReportModal
          targetId={feedId}
          targetType="Feed"
          onClose={() => setOpenReportModal(false)}
        />
      )}
    </>
  );
};

export default PostOptionsMenu;

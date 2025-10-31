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
import axios from "../../api/axios";

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

  // Report flow
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selections, setSelections] = useState([]);
  const [viewMode, setViewMode] = useState("menu"); // menu | report | question

  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => {
    setAnchorEl(null);
    setViewMode("menu");
  };

  // Save / Unsave
  const handleSaveToggle = async () => {
    setLoading(true);
    try {
      const endpoint = isSaved ? "/api/user/unsave/post" : "/api/user/save/post";
      const res = await axios.post(
        endpoint,
        { postId: feedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsSaved(!isSaved);
      setToastMsg(res.data.message || (isSaved ? "Post unsaved" : "Post saved"));
      if (onSavePost) onSavePost(feedId, !isSaved);
    } catch (err) {
      setToastMsg(err.response?.data?.message || "Save failed");
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  // Not Interested
  const handleNotInterested = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/user/not/intrested",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg(res.data.message || "Marked as not interested");
      if (onNotInterested) onNotInterested(feedId);
    } catch (err) {
      const msg = err.response?.data?.message || "Action failed";
      setToastMsg(msg);
      if (msg.includes("already") && onNotInterested) onNotInterested(feedId);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  // Hide Post
  const handleHidePost = async () => {
    setLoading(true);
    try {
      const res = await axios.post(
        "/api/user/hide/feed",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg(res.data.message || "Post hidden");
      if (onHidePost) onHidePost(feedId);
    } catch (err) {
      const msg = err.response?.data?.message || "Hide failed";
      setToastMsg(msg);
      if (msg.includes("already") && onHidePost) onHidePost(feedId);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  // Fetch Report Types
  const fetchReportTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/report-types", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportTypes(res.data.data || []);
      setViewMode("report");
    } catch (err) {
      setToastMsg("Failed to load report options");
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    fetchReportTypes();
    handleClose();
  };

  // Select Report Type
  const handleReportTypeSelection = async (typeId) => {
    setSelectedTypeId(typeId);
    setSelections([]);
    try {
      const res = await axios.get(`/api/report-questions/start?typeId=${typeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.data) {
        setCurrentQuestion(res.data.data);
        setViewMode("question");
      } else {
        await submitReport([]);
      }
    } catch (err) {
      setToastMsg("Error starting report");
    }
  };

  // Submit Report
  const submitReport = async (answers) => {
    try {
      await axios.post(
        "/api/report-post",
        {
          typeId: selectedTypeId,
          targetId: feedId,
          targetType: "Feed",
          answers,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg("Report submitted successfully");
      setViewMode("menu");
    } catch (err) {
      setToastMsg("Report submission failed");
    }
  };

  // Handle Option Selection
  const handleOptionSelection = async (option) => {
    const newSelection = {
      questionId: currentQuestion._id,
      questionText: currentQuestion.questionText,
      answer: option.text,
    };

    try {
      const res = await axios.post(
        "/api/report-questions/next",
        {
          reportId: selectedTypeId,
          questionId: currentQuestion._id,
          selectedOption: option._id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedSelections = [...selections, newSelection];

      if (res.data.data) {
        setCurrentQuestion(res.data.data);
        setSelections(updatedSelections);
      } else {
        await submitReport(updatedSelections);
      }
    } catch (err) {
      setToastMsg("Error selecting option");
    }
  };

  return (
    <>
      {/* More Options Button */}
      <IconButton onClick={handleOpen} disabled={loading}>
        {loading ? <CircularProgress size={20} /> : <MoreHoriz />}
      </IconButton>

      {/* Main Menu (4 Options with Icons) */}
      <Menu anchorEl={anchorEl} open={open && viewMode === "menu"} onClose={handleClose}>
        {/* Save / Unsave */}
        <MenuItem onClick={handleSaveToggle}>
          <ListItemIcon>
            {isSaved ? <Bookmark fontSize="small" /> : <BookmarkBorder fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{isSaved ? "Unsave" : "Save"}</ListItemText>
        </MenuItem>

        {/* Not Interested */}
        <MenuItem onClick={handleNotInterested}>
          <ListItemIcon>
            <ThumbDown fontSize="small" />
          </ListItemIcon>
          <ListItemText>Not Interested</ListItemText>
        </MenuItem>

        {/* Hide Post */}
        <MenuItem onClick={handleHidePost}>
          <ListItemIcon>
            <VisibilityOff fontSize="small" />
          </ListItemIcon>
          <ListItemText>Hide Post</ListItemText>
        </MenuItem>

        {/* Report */}
        <MenuItem onClick={handleReport}>
          <ListItemIcon>
            <Flag fontSize="small" />
          </ListItemIcon>
          <ListItemText>Report</ListItemText>
        </MenuItem>
      </Menu>

      {/* Report Type Selection */}
      {viewMode === "report" && (
        <Menu anchorEl={anchorEl} open={true} onClose={() => setViewMode("menu")}>
          {reportTypes.map((type) => (
            <MenuItem
              key={type._id}
              onClick={() => handleReportTypeSelection(type._id)}
            >
              <ListItemText>{type.name}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* Question Flow */}
      {viewMode === "question" && currentQuestion && (
        <Menu anchorEl={anchorEl} open={true} onClose={() => setViewMode("menu")}>
          <MenuItem disabled>
            <ListItemText primary={currentQuestion.questionText} />
          </MenuItem>
          {currentQuestion.options.map((opt) => (
            <MenuItem
              key={opt._id}
              onClick={() => handleOptionSelection(opt)}
            >
              <ListItemText>{opt.text}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* Toast Notification */}
      <Snackbar
        open={!!toastMsg}
        autoHideDuration={3000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
};

export default PostOptionsMenu;
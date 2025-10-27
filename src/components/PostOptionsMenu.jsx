import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Snackbar } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import axios from "../api/axios";

const PostOptionsMenu = ({ feedId, authUserId, token, onNotInterested, onHidePost }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [toastMsg, setToastMsg] = useState("");
  const [reportTypes, setReportTypes] = useState([]);
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selections, setSelections] = useState([]);
  const [loading,setLoading]=useState(false);
  const [viewMode, setViewMode] = useState("menu"); // menu | report | question

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Hide Post
  const handleHidePost = async () => {
    try {
      const response = await axios.post(
        "/api/user/hide/feed",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg(response.data.message || "Post hidden successfully");
      if (onHidePost) onHidePost(feedId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Hide post failed";
      setToastMsg(errorMessage);
      if (errorMessage === "Post already hidden" && onHidePost) onHidePost(feedId);
    } finally {
      handleClose();
    }
  };

  // Not Interested
  const handleNotInterested = async () => {
    try {
      const response = await axios.post(
        "/api/user/not/intrested",
        { feedId, userId: authUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setToastMsg(response.data.message || "Marked as not interested");
      if (onNotInterested) onNotInterested(feedId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Action failed";
      setToastMsg(errorMessage);
      if (errorMessage === "Post already not interested" && onNotInterested) onNotInterested(feedId);
    } finally {
      handleClose();
    }
  };

  // Fetch report types
const fetchReportTypes = async () => {
  setLoading(true); // if you have a loading state
  try {
    // If token is stored in localStorage (React web), get it
    const userToken = localStorage.getItem('userToken'); 
    const headers = { 'Content-Type': 'application/json' };
    if (userToken) {
      headers.Authorization = `Bearer ${userToken}`;
    }

    const res =  await axios.get('/api/report-types', {
      method: 'GET',
      headers,
    });

    const data = await res.json();

    if (res.ok) {
      setReportTypes(data.data || []);
      setViewMode("report");
      console.log("Report types fetched:", data);
    } else {
      setToastMsg(data.message || "Failed to fetch report types");
      console.error("Error fetching report types:", data);
    }
  } catch (error) {
    console.error('Fetch report types error:', error);
    setToastMsg('Something went wrong while fetching report types');
  } finally {
    setLoading(false);
  }
};


  const handleReport = () => {
    fetchReportTypes();
  };

  // Select report type
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
        // No start question, submit directly
        const reportRes = await axios.post(
          "/api/report-post",
          { typeId, targetId: feedId, targetType: "Feed", answers: [] },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setToastMsg(reportRes.data.message || "Report submitted successfully");
        setViewMode("menu");
      }
    } catch (err) {
      console.error(err);
      setToastMsg("Error starting report");
    }
  };

  // Option selection
  const handleOptionSelection = async (option) => {
    if (!currentQuestion) return;
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

      if (res.data.data) {
        setSelections((prev) => [
          ...prev,
          { questionId: currentQuestion._id, questionText: currentQuestion.questionText, answer: option.text },
        ]);
        setCurrentQuestion(res.data.data);
      } else {
        // Final step: submit report
        const finalSelections = [
          ...selections,
          { questionId: currentQuestion._id, questionText: currentQuestion.questionText, answer: option.text },
        ];

        await axios.post(
          "/api/report-post",
          { typeId: selectedTypeId, targetId: feedId, targetType: "Feed", answers: finalSelections },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setToastMsg("Report submitted successfully");
        setViewMode("menu");
      }
    } catch (err) {
      console.error(err);
      setToastMsg("Error selecting option");
    }
  };

  return (
    <>
      <IconButton onClick={handleOpen}>
        <MoreHorizIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={handleNotInterested}>Not Interested</MenuItem>
        <MenuItem onClick={handleHidePost}>Hide post</MenuItem>
        <MenuItem onClick={handleReport}>Report</MenuItem>
      </Menu>

      <Snackbar
        open={!!toastMsg}
        autoHideDuration={2000}
        onClose={() => setToastMsg("")}
        message={toastMsg}
      />

      {/* Report flow menu */}
      {viewMode === "report" && reportTypes.length > 0 && (
        <Menu anchorEl={anchorEl} open={true} onClose={() => setViewMode("menu")}>
          {reportTypes.map((type) => (
            <MenuItem key={type._id} onClick={() => handleReportTypeSelection(type._id)}>
              {type.name}
            </MenuItem>
          ))}
        </Menu>
      )}

      {viewMode === "question" && currentQuestion && currentQuestion.options?.length > 0 && (
        <Menu anchorEl={anchorEl} open={true} onClose={() => setViewMode("menu")}>
          {currentQuestion.options.map((opt) => (
            <MenuItem key={opt._id} onClick={() => handleOptionSelection(opt)}>
              {opt.text}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default PostOptionsMenu;

// ReportModal.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  CircularProgress
} from "@mui/material";
import api from "../api/axios";

const ReportModal = ({ open, onClose, postId, onReportSubmit }) => {
  const [reportTypes, setReportTypes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchReportTypes();
      fetchInitialQuestions();
    }
  }, [open]);

  const fetchReportTypes = async () => {
    try {
      const res = await api.get("/report-types");
      setReportTypes(res.data.reportTypes || []);
    } catch (err) {
      console.error("Error fetching report types:", err);
    }
  };

  const fetchInitialQuestions = async () => {
    try {
      const res = await api.get("/report-questions/start");
      setQuestions(res.data.questions || []);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const handleReportTypeSelect = (typeId) => {
    setSelectedReportType(typeId);
  };

  const handleAnswerSelect = async (questionId, answer) => {
    const newAnswers = {
      ...selectedAnswers,
      [questionId]: answer
    };
    setSelectedAnswers(newAnswers);

    try {
      setLoading(true);
      const res = await api.post(`/report-questions/${questionId}`, {
        answer: answer,
        previousAnswers: newAnswers
      });

      if (res.data.nextQuestion) {
        setQuestions(prev => [...prev, res.data.nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // No more questions, submit the report
        await submitReport(newAnswers);
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async (answers) => {
    try {
      await api.post("/report-post", {
        postId: postId,
        reportType: selectedReportType,
        answers: answers
      });
      
      if (onReportSubmit) {
        onReportSubmit();
      }
      
      onClose();
      // Reset state
      setSelectedReportType("");
      setSelectedAnswers({});
      setCurrentQuestionIndex(0);
      setQuestions([]);
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };

  const handleClose = () => {
    // Reset state when closing
    setSelectedReportType("");
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setQuestions([]);
    onClose();
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {!selectedReportType ? "Report Post" : "Tell us more"}
      </DialogTitle>
      <DialogContent>
        {!selectedReportType ? (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend">Why are you reporting this post?</FormLabel>
            <RadioGroup value={selectedReportType} onChange={(e) => handleReportTypeSelect(e.target.value)}>
              {reportTypes.map((type) => (
                <FormControlLabel
                  key={type.id}
                  value={type.id}
                  control={<Radio />}
                  label={type.name}
                />
              ))}
            </RadioGroup>
          </FormControl>
        ) : (
          <Stack spacing={2}>
            {currentQuestion && (
              <>
                <Typography variant="h6">{currentQuestion.question}</Typography>
                <RadioGroup value={selectedAnswers[currentQuestion.id] || ""}>
                  {currentQuestion.options.map((option, index) => (
                    <FormControlLabel
                      key={index}
                      value={option}
                      control={<Radio />}
                      label={option}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option)}
                      disabled={loading}
                    />
                  ))}
                </RadioGroup>
                {loading && <CircularProgress size={24} />}
              </>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {!selectedReportType && (
          <Button 
            onClick={() => selectedReportType && setCurrentQuestionIndex(0)}
            disabled={!selectedReportType}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ReportModal;
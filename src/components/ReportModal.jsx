import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ReportModal({ targetId, targetType, onClose }) {
  const navigate = useNavigate();

  const [step, setStep] = useState("selectType");
  const [types, setTypes] = useState([]);

  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [reportId, setReportId] = useState("");

  const [loading, setLoading] = useState(false);

  // Load Types
  useEffect(() => {
    loadTypes();
  }, []);

  const loadTypes = async () => {
    try {
      const res = await axios.get("/api/report-types");
      setTypes(res.data.data || []);
    } catch {
      toast.error("Failed to load report types");
    }
  };

  // Step 1 → Load first question
  const handleSelectType = async (typeId) => {
    try {
      setSelectedTypeId(typeId);
      setLoading(true);

      const res = await axios.get(`/api/report-questions/start?typeId=${typeId}`);
      setCurrentQuestion(res.data.data);
      setAnswers([]);
      setStep("questions");
    } catch {
      toast.error("Unable to start report");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Answer logic
  const handleSelectOption = async (opt) => {
    const answer = {
      questionId: currentQuestion._id,
      questionText: currentQuestion.questionText,
      selectedOption: opt.text,
    };

    // 1️⃣ First question → Create report first
    if (!reportId) {
      let created;

      try {
        const res = await axios.post("/api/report-post", {
          typeId: selectedTypeId,
          targetId,
          targetType,
          answers: [answer],
        });

        created = res.data.data;
        setReportId(created._id);
        setAnswers([answer]);
      } catch {
        return toast.error("Failed to create report");
      }

      // No next question → go preview
      if (!opt.nextQuestion) return setStep("preview");

      try {
        const next = await axios.post("/api/report-questions/next", {
          reportId: created._id,
          questionId: currentQuestion._id,
          selectedOption: opt._id,
        });

        if (next.data.isLast) return setStep("preview");

        setCurrentQuestion(next.data.data);
      } catch {
        toast.error("Failed to load next question");
      }

      return;
    }

    // 2️⃣ Follow up questions
    try {
      const res = await axios.post("/api/report-questions/next", {
        reportId,
        questionId: currentQuestion._id,
        selectedOption: opt._id,
      });

      setAnswers((prev) => [...prev, answer]);

      if (res.data.isLast) return setStep("preview");

      setCurrentQuestion(res.data.data);
    } catch {
      toast.error("Failed to save answer");
    }
  };

  // Final submit
  const submitReport = () => setStep("success");

  const closeModal = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  // =======================================================================
  // UI STEPS
  // =======================================================================

  if (step === "selectType") {
    return (
      <GlassModal title="Why are you reporting this?">
        {types.map((t) => (
          <ModalButton key={t._id} label={t.name} onClick={() => handleSelectType(t._id)} />
        ))}
      </GlassModal>
    );
  }

  if (step === "questions") {
    return (
      <GlassModal title={currentQuestion?.questionText || "Loading..."}>
        {currentQuestion?.options?.map((opt) => (
          <ModalButton key={opt._id} label={opt.text} onClick={() => handleSelectOption(opt)} />
        ))}
      </GlassModal>
    );
  }

  if (step === "preview") {
    return (
      <GlassModal title="Review your report">
        <div className="p-4 space-y-3">
          {answers.map((ans, i) => (
            <div key={i} className="border border-gray-200/60 rounded-lg p-3 bg-gray-50/40">
              <div className="font-semibold text-gray-800">{ans.questionText}</div>
              <div className="text-sm text-gray-600 mt-1">{ans.selectedOption}</div>
            </div>
          ))}
        </div>

        <button
          onClick={submitReport}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-4 transition-all"
        >
          Submit Report
        </button>
      </GlassModal>
    );
  }

  if (step === "success") {
    return (
      <GlassModal title="Report Submitted">
        <div className="text-center p-6">
          <p className="text-gray-700 mb-4">
            Thank you for helping keep our community safe.
          </p>
          <button
            onClick={closeModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg mt-2"
          >
            Close
          </button>
        </div>
      </GlassModal>
    );
  }

  return null;
}

// ====================================================================================
// 🌟 BEAUTIFUL REUSABLE GLASS MODAL
// ====================================================================================
function GlassModal({ title, children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[60]">
      {/* Blurred Grey Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-white/60 backdrop-blur-xl shadow-2xl border border-gray-300/30 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-gray-300/40 bg-white/70 backdrop-blur-md">
          <h2 className="font-semibold text-gray-900 text-lg">{title}</h2>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

// ====================================================================================
// 🌟 MODAL BUTTONS — Clean, Light, Smooth
// ====================================================================================
function ModalButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="
        w-full text-left px-4 py-4
        bg-white/70 backdrop-blur-sm
        border-b border-gray-200/40
        flex justify-between items-center
        text-gray-800
        hover:bg-gray-100/60
        transition-all duration-200
      "
    >
      {label}
      <span className="text-gray-400">›</span>
    </button>
  );
}

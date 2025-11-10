import React, { useState, useContext, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";

function RegisterForm({ switchMode }) {
  const { sendOtpForReset, verifyOtpForNewUser, register } = useContext(AuthContext);
  const navigate = useNavigate();

  // 🧠 State Management
  const [step, setStep] = useState("email");
  const [form, setForm] = useState({
    email: "",
    otp: "",
    username: "",
    password: "",
    phone: "",
    whatsapp: "",
  });
  const [sameAsWhatsapp, setSameAsWhatsapp] = useState(false);
  const [status, setStatus] = useState({
    email: null,
    username: null,
    checkingEmail: false,
    usernameSuggestions: [],
  });
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // 🕒 Timer (Resend OTP)
  useEffect(() => {
    if (!timer) return;
    const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  // 📩 Email Availability Check (Debounced + Abort-safe)
  useEffect(() => {
    if (step !== "email" || !form.email.trim()) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setStatus((prev) => ({ ...prev, checkingEmail: true }));
        const { data } = await api.get("/api/check/email/availability", {
          params: { email: form.email },
          signal: controller.signal,
        });
        setStatus((prev) => ({
          ...prev,
          email: data.available ? "available" : "taken",
        }));
      } catch {
        setStatus((prev) => ({ ...prev, email: "error" }));
      } finally {
        setStatus((prev) => ({ ...prev, checkingEmail: false }));
      }
    }, 600);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [form.email, step]);

  // 👤 Username Availability + Suggestions
  useEffect(() => {
    if (step !== "details" || form.username.length < 5) return;
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/check/username/availability", {
          params: { username: form.username },
        });
        if (data.available) {
          setStatus((prev) => ({ ...prev, username: "available", usernameSuggestions: [] }));
        } else {
          const rand = Math.floor(Math.random() * 1000);
          setStatus((prev) => ({
            ...prev,
            username: "taken",
            usernameSuggestions: [
              `${form.username}${rand}`,
              `${form.username}_01`,
              `${form.username}.dev`,
            ],
          }));
        }
      } catch {
        setStatus((prev) => ({ ...prev, username: "error" }));
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [form.username, step]);

  // 🔐 Password Validation
  useEffect(() => {
    const pass = form.password;
    setPasswordChecks({
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      lowercase: /[a-z]/.test(pass),
      number: /\d/.test(pass),
      special: /[!@#$%^&*]/.test(pass),
    });
  }, [form.password]);

  // 🔁 Sync WhatsApp with Phone
  useEffect(() => {
    if (sameAsWhatsapp) setForm((prev) => ({ ...prev, whatsapp: prev.phone }));
  }, [sameAsWhatsapp, form.phone]);

  // 📤 Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (loading || timer > 0) return;
    setLoading(true);
    try {
      const success = await sendOtpForReset(form.email);
      if (success) {
        setStep("otp");
        setTimer(30);
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔎 Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const success = await verifyOtpForNewUser({ email: form.email, otp: form.otp });
      if (success) setStep("details");
    } finally {
      setLoading(false);
    }
  };

  // 📝 Register
  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    const validPassword = Object.values(passwordChecks).every(Boolean);
    if (!validPassword || form.username.length < 5)
      return alert("Please complete all requirements before registering.");

    setLoading(true);
    try {
      const success = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        whatsapp: form.whatsapp,
      });
      if (success) {
        switchMode("login");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✨ Framer Motion Variants
  const fade = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15, ease: "easeInOut" } },
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 bg-white/5 rounded-2xl backdrop-blur-md border border-white/20">
      <h1 className="text-2xl sm:text-3xl  font-bold text-center mb-5 text-gray-900">
        Create Free Account
      </h1>

      <form
        className="space-y-4"
        onSubmit={
          step === "email"
            ? handleSendOtp
            : step === "otp"
            ? handleVerifyOtp
            : handleRegister
        }
      >
        <AnimatePresence mode="wait">
          {/* STEP 1 — EMAIL */}
          {step === "email" && (
            <motion.div key="email" initial="hidden" animate="visible" exit="exit" variants={fade}>
              <label className="block font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />
              <p className="text-sm mt-1 min-h-[20px]">
                {status.email === "available" && (
                  <span className="text-green-600">✅ Email available</span>
                )}
                {status.email === "taken" && (
                  <span className="text-red-500">❌ Email already registered</span>
                )}
                {status.email === "error" && (
                  <span className="text-gray-500">⚠️ Could not check email</span>
                )}
              </p>

              <button
                type="submit"
                disabled={loading || timer > 0}
                className={`w-full py-2 rounded-full font-semibold text-white transition-all ${
                  loading || timer > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                }`}
              >
                {loading
                  ? "Sending..."
                  : timer > 0
                  ? `Resend OTP in ${timer}s`
                  : "Register Now"}
              </button>
            </motion.div>
          )}

          {/* STEP 2 — OTP */}
          {step === "otp" && (
            <motion.div key="otp" initial="hidden" animate="visible" exit="exit" variants={fade}>
              <label className="block font-medium text-gray-700 mb-1">Enter OTP</label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={form.otp}
                onChange={(e) => setForm((p) => ({ ...p, otp: e.target.value }))}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none mb-2"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-full font-semibold text-white ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center mt-2">
                {timer > 0 ? (
                  <p className="text-gray-500 text-sm">Resend available in {timer}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    className={`text-sm ${
                      loading
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-green-600 hover:underline"
                    }`}
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3 — DETAILS */}
          {step === "details" && (
            <motion.div key="details" initial="hidden" animate="visible" exit="exit" variants={fade}>
              {/* Username */}
              <label className="block font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                placeholder="Min 5 characters"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none mb-2"
                required
              />
              <p className="text-sm min-h-[20px]">
                {form.username && form.username.length < 5 && (
                  <span className="text-red-500">❌ Too short</span>
                )}
                {status.username === "available" && (
                  <span className="text-green-600">✅ Username available</span>
                )}
                {status.username === "taken" && (
                  <span className="text-red-500">❌ Username not available</span>
                )}
              </p>
              {status.usernameSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {status.usernameSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, username: s }))}
                      className="text-sm text-green-600 hover:underline"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Phone / WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        phone: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    placeholder="Enter mobile"
                    className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-gray-700 mb-1">WhatsApp</label>
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.whatsapp}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          whatsapp: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      placeholder="Enter WhatsApp"
                      className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <span
                      onClick={() => setSameAsWhatsapp((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-green-600 cursor-pointer hover:underline"
                    >
                      Same as Phone
                    </span>
                  </div>
                </div>
              </div>

              {/* Password */}
              <label className="block font-medium text-gray-700 mt-2 mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
              />

              <motion.div
                className="text-xs sm:text-sm text-gray-700 mt-2 space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Object.entries({
                  length: "At least 8 characters",
                  uppercase: "One uppercase",
                  lowercase: "One lowercase",
                  number: "One number",
                  special: "One special character",
                }).map(([key, text]) => (
                  <p
                    key={key}
                    className={passwordChecks[key] ? "text-green-600" : "text-red-500"}
                  >
                    {passwordChecks[key] ? "✅" : "❌"} {text}
                  </p>
                ))}
              </motion.div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-4 py-2 rounded-full font-semibold text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                }`}
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

export default memo(RegisterForm);

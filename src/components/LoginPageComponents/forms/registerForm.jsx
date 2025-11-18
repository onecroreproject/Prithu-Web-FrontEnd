import React, { useState, useContext, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";

function RegisterForm({ switchMode }) {
  const { sendOtpForReset, verifyOtpForNewUser, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [form, setForm] = useState({
    email: "",
    otp: "",
    username: "",
    password: "",
    phone: "",
    whatsapp: "",
    accountType: "",
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

  /* --------------------------- TIMER --------------------------- */
  useEffect(() => {
    if (!timer) return;
    const t = setTimeout(() => setTimer((prev) => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);


  /* --------------------------- CHANGE EMAIL --------------------------- */
  const handleChangeEmail = () => {
    setStep("email");
    setForm((p) => ({ ...p, otp: "" }));
    setTimer(0);
  };


  /* --------------------------- EMAIL CHECK --------------------------- */
  useEffect(() => {
    if (step !== "email" || !form.email.trim()) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setStatus((p) => ({ ...p, checkingEmail: true }));
        const { data } = await api.get("/api/check/email/availability", {
          params: { email: form.email },
          signal: controller.signal,
        });

        setStatus((p) => ({
          ...p,
          email: data.available ? null : "taken",
        }));
      } catch {
        setStatus((p) => ({ ...p, email: "error" }));
      } finally {
        setStatus((p) => ({ ...p, checkingEmail: false }));
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [form.email, step]);


  /* --------------------------- USERNAME CHECK --------------------------- */
  useEffect(() => {
    if (step !== "details" || form.username.length < 5) return;
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/check/username/availability", {
          params: { username: form.username },
        });
console.log(data)
        if (data.available) {
          setStatus((p) => ({
            ...p,
            username: "available",
            usernameSuggestions: [],
          }));
        } else {
          const rand = Math.floor(Math.random() * 1000);
          setStatus((p) => ({
            ...p,
            username: "taken",
            usernameSuggestions: [
              `${form.username}${rand}`,
              `${form.username}_01`,
              `${form.username}.dev`,
            ],
          }));
        }
      } catch {
        setStatus((p) => ({ ...p, username: "error" }));
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [form.username, step]);


  /* --------------------------- PASSWORD VALIDATION --------------------------- */
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


  /* --------------------------- WHATSAPP SYNC --------------------------- */
  useEffect(() => {
    if (sameAsWhatsapp) setForm((p) => ({ ...p, whatsapp: p.phone }));
  }, [sameAsWhatsapp, form.phone]);


  /* --------------------------- HANDLERS --------------------------- */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (loading || timer > 0) return;

    if (status.email === "taken") return;

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


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const success = await verifyOtpForNewUser({
        email: form.email,
        otp: form.otp,
      });

      if (success) setStep("details");
    } finally {
      setLoading(false);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validPassword = Object.values(passwordChecks).every(Boolean);
    if (!validPassword || form.username.length < 5)
      return alert("Please complete all requirements before registering.");

    if (!form.accountType)
      return alert("Please select account type.");

    setLoading(true);
    try {
      const success = await register({
        username: form.username,
        email: form.email,
        password: form.password,
        phone: form.phone,
        whatsapp: form.whatsapp,
        accountType: form.accountType,
      });

      if (success) {
        switchMode("login");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };


  /* --------------------------- ANIMATION --------------------------- */
  const fadeSlide = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: "easeIn" } },
  };


  /* --------------------------- UI --------------------------- */
  return (
    <div className="w-full bg-white/5 rounded-2xl backdrop-blur-md border border-white/20">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-5 text-gray-900">
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

          {/* ---------------------------------- STEP 1: EMAIL ---------------------------------- */}
          {step === "email" && (
            <motion.div key="email" initial="hidden" animate="visible" exit="exit" variants={fadeSlide}>
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

                {status.email === "taken" && (
                  <span className="text-red-500 flex flex-col gap-1">
                    ❌ Email already registered.
                    <span className="flex justify-between mt-7">
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-blue-600 underline text-sm"
                      >
                        Back to Login
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-blue-600 underline text-sm"
                      >
                        Forgot Password?
                      </button>
                    </span>
                  </span>
                )}

                {status.email === "error" && (
                  <span className="text-gray-500">⚠️ Could not check email</span>
                )}
              </p>

              {status.email !== "taken" && (
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
              )}
            </motion.div>
          )}


          {/* ---------------------------------- STEP 2: OTP ---------------------------------- */}
          {step === "otp" && (
            <motion.div key="otp" initial="hidden" animate="visible" exit="exit" variants={fadeSlide}>
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

              {/* Timer + Resend + Change Email */}
              <div className="text-center mt-3 space-y-2">

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

                {/* 🔥 NEW: CHANGE EMAIL */}
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="block w-full text-sm text-blue-600 hover:underline"
                >
                  Change Email
                </button>
              </div>
            </motion.div>
          )}


          {/* ---------------------------------- STEP 3: DETAILS ---------------------------------- */}
          {step === "details" && (
            <motion.div key="details" initial="hidden" animate="visible" exit="exit" variants={fadeSlide}>
              
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


              {/* Account Type */}
              <label className="block font-medium text-gray-700 mb-1 mt-2">
                Account For <span className="text-red-500">*</span>
              </label>

              <select
                value={form.accountType}
                onChange={(e) => setForm((p) => ({ ...p, accountType: e.target.value }))}
                className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none mb-2 bg-white"
                required
              >
                <option value="">Select account type</option>
                <option value="personal">Personal</option>
                <option value="company">Company</option>
              </select>


              {/* Phone + WhatsApp */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Mobile */}
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))
                    }
                    placeholder="Enter mobile"
                    className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 mb-1">WhatsApp</label>
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.whatsapp}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, whatsapp: e.target.value.replace(/\D/g, "") }))
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
                  <p key={key} className={passwordChecks[key] ? "text-green-600" : "text-gray-500"}>
                    {passwordChecks[key] ? "✅" : "❌"} {text}
                  </p>
                ))}
              </motion.div>


              {/* Register Button */}
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

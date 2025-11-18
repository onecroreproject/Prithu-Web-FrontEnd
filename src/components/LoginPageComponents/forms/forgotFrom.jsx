import React, { useState, useContext, useEffect, memo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";

const Spinner = lazy(() => import("../../../components/spiner")); // Optional spinner

function ForgotForm({ switchMode }) {
  const { sendOtpForReset, verifyOtpForReset, resetPassword } = useContext(AuthContext);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState(null); // null, 'checking', 'available', 'not-available'
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // ✅ Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // ✅ Email availability check (debounced) - runs on every user input
  useEffect(() => {
    const checkEmail = async () => {
      if (!email || !email.includes("@")) {
        setEmailStatus(null);
        return;
      }
      
      setEmailStatus("checking");
      
      try {
        const { data } = await api.get(
          `/api/check/email/availability?email=${encodeURIComponent(email)}`
        );
        console.log(data)
        setEmailStatus(data.available ? "available" : "not-available");
      } catch {
        setEmailStatus("error");
      }
    };
    
    const timeout = setTimeout(checkEmail, 500);
    return () => clearTimeout(timeout);
  }, [email]);

  // ✅ Password strength validation
  useEffect(() => {
    setPasswordChecks({
      length: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      special: /[\W_]/.test(newPassword),
    });
  }, [newPassword]);

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  // ✅ Handlers
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (cooldown > 0) return;
    if (emailStatus !== "not-available") {
      return;
    }
    const success = await sendOtpForReset(email);
    if (success) {
      setStep("otp");
      setCooldown(30);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const success = await verifyOtpForReset({ otp });
    if (success) setStep("reset");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    await resetPassword(newPassword);
    switchMode("login");
  };

  // ✅ Lightweight motion variants
  const fadeSlide = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: "easeIn" } },
  };

return (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="flex flex-col items-center w-full max-w-sm mx-auto p-4 sm:p-6"
  >
    <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 text-gray-900">
      Forgot Password
    </h1>

    <Suspense fallback={<div className="text-sm text-gray-600 text-center">Loading...</div>}>
      <form
        className="w-full flex flex-col space-y-3"
        onSubmit={
          step === "email"
            ? handleSendOtp
            : step === "otp"
            ? handleVerifyOtp
            : handleResetPassword
        }
      >
        <AnimatePresence mode="wait">
          {/* ===================== EMAIL STEP ===================== */}
          {step === "email" && (
            <motion.div
              key="email"
              variants={fadeSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Label + Input */}
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-500 outline-none"
              />

              {/* ---------------- EMAIL STATUS (fixed height) ---------------- */}
              <motion.div
                layout
                className="min-h-[34px] flex items-start pt-1"
              >
                <AnimatePresence mode="wait">
                  {emailStatus === "checking" && (
                    <motion.p
                      key="checking"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="text-blue-500 text-xs"
                    >
                      Checking email...
                    </motion.p>
                  )}

                  {emailStatus === "not-available" && (
                    <motion.p
                      key="valid"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="text-green-600 text-xs"
                    >
                      ✓ Email verified! You can reset your password.
                    </motion.p>
                  )}

                  {emailStatus === "available" && (
                    <motion.div
                      key="notExist"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="text-red-500 text-xs"
                    >
                      This email is not registered.
                      <div className="text-green-600">
                        Create account?{" "}
                        <span
                          onClick={() => switchMode("register")}
                          className="cursor-pointer underline font-semibold"
                        >
                          Sign up
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {emailStatus === "error" && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.18 }}
                      className="text-orange-500 text-xs"
                    >
                      Unable to check email. Try again.
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ---------------- SEND OTP BUTTON (fixed height) ---------------- */}
              <motion.div layout className="min-h-[60px] flex items-center">
                <AnimatePresence>
                  {emailStatus === "not-available" && (
                    <motion.button
                      key="sendOtpBtn"
                      type="submit"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileTap={{ scale: 0.97 }}
                      transition={{ duration: 0.18 }}
                      className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 shadow"
                    >
                      Send OTP
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {/* ===================== OTP STEP ===================== */}
          {step === "otp" && (
            <motion.div
              key="otp"
              variants={fadeSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3"
            >
              <label className="text-sm font-medium text-gray-700">OTP</label>

              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-500 outline-none"
              />

              {/* FIXED HEIGHT BUTTON AREA */}
              <motion.div layout className="min-h-[60px] flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                >
                  Verify OTP
                </button>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0}
                  className={`px-4 py-2 rounded-full font-semibold text-white ${
                    cooldown > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {cooldown > 0 ? `${cooldown}s` : "Resend"}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ===================== RESET PASSWORD STEP ===================== */}
          {step === "reset" && (
            <motion.div
              key="reset"
              variants={fadeSlide}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-3"
            >
              {/* New password input */}
              <label className="text-sm font-medium text-gray-700">New Password</label>

              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-500 outline-none"
              />

              {/* Indicator */}
              <div className="text-xs sm:text-sm mt-2 space-y-1 text-gray-600">
                {[ 
                  { key: "length", text: "At least 8 characters" },
                  { key: "upper", text: "One uppercase letter" },
                  { key: "lower", text: "One lowercase letter" },
                  { key: "number", text: "One number" },
                  { key: "special", text: "One special character" },
                ].map((rule) => (
                  <p
                    key={rule.key}
                    className={`flex items-center gap-2 ${
                      passwordChecks[rule.key] ? "text-green-600" : "text-gray-500"
                    }`}
                  >
                    <span>{passwordChecks[rule.key] ? "✅" : "❌"}</span>
                    <span>{rule.text}</span>
                  </p>
                ))}
              </div>

              <button
                type="submit"
                disabled={!isPasswordValid}
                className={`w-full py-2 rounded-full font-semibold text-white shadow-md ${
                  !isPasswordValid
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                }`}
              >
                Reset Password
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BACK TO LOGIN */}
        <p className="text-sm text-center text-gray-600 mt-3">
          Remembered your password?{" "}
          <span
            className="text-green-600 cursor-pointer hover:underline"
            onClick={() => switchMode("login")}
          >
            Back to Login
          </span>
        </p>
      </form>
    </Suspense>
  </motion.div>
);

}

export default memo(ForgotForm);
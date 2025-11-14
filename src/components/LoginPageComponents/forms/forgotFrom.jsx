import React, { useState, useContext, useEffect, memo, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { AuthContext } from "../../../context/AuthContext";

const Spinner = lazy(() => import("../../../components/spiner")); // Optional spinner

function ForgotForm({ switchMode }) {
  const { sendOtpForReset, verifyOtpForReset, resetPassword } = useContext(AuthContext);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [emailStatus, setEmailStatus] = useState(null);
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

  // ✅ Email availability check (debounced)
  useEffect(() => {
    const checkEmail = async () => {
      if (!email || !email.includes("@")) {
        setEmailStatus(null);
        return;
      }
      try {
        const { data } = await axios.get(
          `/check/email/availability?email=${encodeURIComponent(email)}`
        );
        setEmailStatus(data.available ? "available" : "not-available");
      } catch {
        setEmailStatus(null);
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
    if (emailStatus === "available") {
      alert("This email is not registered.");
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
      className="flex flex-col items-center w-full max-w-sm mx-auto p-4 sm:p-6 backdrop-blur-md"
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
            {step === "email" && (
              <motion.div
                key="email"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  required
                />
                {emailStatus === "available" && (
                  <p className="text-red-500 text-xs mt-1">Email not found in our records.</p>
                )}
                {emailStatus === "not-available" && (
                  <p className="text-green-600 text-xs mt-1">
                    Welcome ! You can reset now.
                  </p>
                )}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <label className="text-sm font-medium text-gray-700">OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={cooldown > 0}
                  className={`w-full py-2 mt-2 rounded-full font-semibold text-white transition ${
                    cooldown > 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                  }`}
                >
                  {cooldown > 0 ? `Resend OTP in ${cooldown}s` : "Resend OTP"}
                </button>
              </motion.div>
            )}

            {step === "reset" && (
              <motion.div
                key="reset"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
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
                      className={passwordChecks[rule.key] ? "text-green-600" : "text-gray-500"}
                    >
                      {passwordChecks[rule.key] ? "✅" : "❌"} {rule.text}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ✅ Submit Button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.98 }}
            disabled={step === "email" && emailStatus === "available"}
            className={`w-full py-2 mt-2 rounded-full font-semibold text-white shadow-md transition-all ${
              step === "email" && emailStatus === "available"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
            }`}
          >
            {step === "email"
              ? "Send OTP"
              : step === "otp"
              ? "Verify OTP"
              : "Reset Password"}
          </motion.button>

          <div className="text-sm mt-3 text-gray-600 text-center">
            Remembered your password?{" "}
            <span
              className="text-green-600 cursor-pointer hover:underline"
              onClick={() => switchMode("login")}
            >
              Back to Login
            </span>
          </div>
        </form>
      </Suspense>
    </motion.div>
  );
}

export default memo(ForgotForm);

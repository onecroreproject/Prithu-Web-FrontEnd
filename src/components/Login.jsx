import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaShoppingBag, FaHeart } from "react-icons/fa";
import PrithuLogo from "../assets/prithu_logo.webp";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const {
    login,
    register,
    sendOtpForReset,
    verifyOtpForNewUser,
    verifyOtpForReset,
    resetPassword,
  } = useContext(AuthContext);

  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'forgot'
  const [registerStep, setRegisterStep] = useState("email");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);

  // --- Mode switchers ---
  const switchToRegister = () => {
    setMode("register");
    setRegisterStep("email");
    resetForm();
  };

  const switchToLogin = () => {
    setMode("login");
    resetForm();
  };

  const switchToForgot = () => {
    setMode("forgot");
    resetForm();
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setOtp("");
    setNewPassword("");
    setIsOtpVerified(false);
    setIsOtpStep(false);
  };

  // --- REGISTER FLOW ---

  // Step 1: send OTP
  const handleSendOtpForRegister = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");
    const success = await sendOtpForReset(email); // same endpoint for sending OTP
    if (success) setRegisterStep("otp");
  };

  // Step 2: verify OTP
  const handleVerifyOtpForRegister = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please enter OTP");
    const success = await verifyOtpForNewUser({ email, otp }); // ✅ Correct function
    if (success) {
      setIsOtpVerified(true);
      setRegisterStep("details");
    }
  };

  // Step 3: complete registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password)
      return alert("Please enter username and password");
    await register({ username, email, password });
  };

  // --- LOGIN FLOW ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please enter email and password");
    await login({ identifier: email, password });
  };

  // --- FORGOT PASSWORD FLOW ---
  const handleSendOtpForForgot = async (e) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email");
    const success = await sendOtpForReset(email);
    if (success) setIsOtpStep(true);
  };

  const handleVerifyOtpForForgot = async (e) => {
    e.preventDefault();
    if (!otp) return alert("Please enter OTP");
    const success = await verifyOtpForReset(otp); // ✅ Correct function
    if (success) setIsOtpVerified(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) return alert("Please enter new password");
    await resetPassword(newPassword);
    switchToLogin();
  };

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden text-gray-800">
      {/* Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://cdn.pixabay.com/video/2021/07/28/82408-583908341_large.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-emerald-800/60 to-lime-900/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex w-full max-w-2xl mx-auto bg-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/20 backdrop-blur-md"
      >
        {/* LEFT PANEL */}
        <div className="flex-1 bg-gradient-to-br from-green-700 via-emerald-600 to-lime-600 text-white p-8 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <img
              src={PrithuLogo}
              alt="Prithu Logo"
              className="w-12 h-12 rounded-full bg-white p-1 shadow-md"
            />
            <h1 className="text-2xl font-bold tracking-tight">Prithu</h1>
          </div>
          <h2 className="text-xl font-semibold mb-2">Join the Healing Circle 🌱</h2>
          <p className="mb-8 text-sm opacity-90">
            Heal to Positive – a platform that connects you to mindful communities and personal growth.
          </p>
          <div className="space-y-5">
            <Feature icon={<FaLeaf />} title="Community" text="Connect & grow with mindfulness." />
            <Feature icon={<FaShoppingBag />} title="Wellness Shop" text="Curated products for lifestyle." />
            <Feature icon={<FaHeart />} title="Mindful Journey" text="Track and nurture wellness." />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 bg-white/95 p-8 flex flex-col justify-center relative">
          <div className="flex flex-col items-center">
            <div className="mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                <FaLeaf className="text-white text-2xl" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-green-700 mb-1">
              {mode === "register"
                ? registerStep === "email"
                  ? "Register - Enter Email"
                  : registerStep === "otp"
                  ? "Register - Verify OTP"
                  : "Register - Enter Details"
                : mode === "forgot"
                ? isOtpVerified
                  ? "Reset Password"
                  : isOtpStep
                  ? "Enter OTP"
                  : "Forgot Password"
                : "Welcome Back"}
            </h2>

            <p className="text-gray-500 text-sm mb-6 text-center">
              {mode === "register"
                ? registerStep === "email"
                  ? "Enter your email to receive an OTP."
                  : registerStep === "otp"
                  ? "Check your email and enter the OTP sent to you."
                  : "Enter your username and password to complete registration."
                : mode === "forgot"
                ? isOtpVerified
                  ? "Set your new password below."
                  : isOtpStep
                  ? "Check your email and enter the OTP sent to you."
                  : "We’ll send you an OTP to reset your password."
                : "Continue your mindful journey with Prithu"}
            </p>

            <form
              className="w-full max-w-xs"
              onSubmit={
                mode === "register"
                  ? registerStep === "email"
                    ? handleSendOtpForRegister
                    : registerStep === "otp"
                    ? handleVerifyOtpForRegister
                    : handleRegisterSubmit
                  : mode === "forgot"
                  ? isOtpVerified
                    ? handleResetPassword
                    : isOtpStep
                    ? handleVerifyOtpForForgot
                    : handleSendOtpForForgot
                  : handleLoginSubmit
              }
            >
              {/* REGISTER FIELDS */}
              {mode === "register" && (
                <>
                  {registerStep === "email" && (
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                      required
                    />
                  )}
                  {registerStep === "otp" && (
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                      required
                    />
                  )}
                  {registerStep === "details" && (
                    <>
                      <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                        required
                      />
                    </>
                  )}
                </>
              )}

              {/* LOGIN FIELDS */}
              {mode === "login" && (
                <>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                    required
                  />
                </>
              )}

              {/* FORGOT PASSWORD FIELDS */}
              {mode === "forgot" && (
                <>
                  {!isOtpStep && (
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                      required
                    />
                  )}
                  {isOtpStep && !isOtpVerified && (
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                      required
                    />
                  )}
                  {isOtpVerified && (
                    <input
                      type="password"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                      required
                    />
                  )}
                </>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 transition"
              >
                {mode === "register"
                  ? registerStep === "email"
                    ? "Send OTP"
                    : registerStep === "otp"
                    ? "Verify OTP"
                    : "Register"
                  : mode === "forgot"
                  ? isOtpVerified
                    ? "Reset Password"
                    : isOtpStep
                    ? "Verify OTP"
                    : "Send OTP"
                  : "Login"}
              </button>
            </form>

            {mode === "login" && (
              <div
                className="text-sm text-green-600 mt-3 cursor-pointer hover:underline"
                onClick={switchToForgot}
              >
                Forgot Password?
              </div>
            )}

            <div className="text-center mt-6 text-sm text-gray-600">
              {mode === "register"
                ? "Already have an account?"
                : "New to Prithu?"}{" "}
              <span
                className="text-green-600 cursor-pointer hover:underline"
                onClick={mode === "register" ? switchToLogin : switchToRegister}
              >
                {mode === "register" ? "Login" : "Create an account"}
              </span>
            </div>

            {mode === "forgot" && (
              <div className="text-sm mt-2 text-gray-600">
                Remembered your password?{" "}
                <span
                  className="text-green-600 cursor-pointer hover:underline"
                  onClick={switchToLogin}
                >
                  Back to Login
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const Feature = ({ icon, title, text }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex items-start gap-3"
  >
    <div className="w-10 h-10 flex items-center justify-center border-2 border-white/50 rounded-lg">
      {icon}
    </div>
    <div>
      <h3 className="text-md font-semibold">{title}</h3>
      <p className="text-sm opacity-80">{text}</p>
    </div>
  </motion.div>
);

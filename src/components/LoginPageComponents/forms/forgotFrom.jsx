import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

export default function ForgotForm({ switchMode }) {
  const { sendOtpForReset, verifyOtpForReset, resetPassword } = useContext(AuthContext);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const success = await sendOtpForReset(email);
    if (success) setStep("otp");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const success = await verifyOtpForReset({ otp });
    if (success) setStep("reset");
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    await resetPassword(newPassword);
    switchMode("login");
  };

  return (
    <form
      className="w-full max-w-xs"
      onSubmit={
        step === "email"
          ? handleSendOtp
          : step === "otp"
          ? handleVerifyOtp
          : handleResetPassword
      }
    >
      {step === "email" && (
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
          required
        />
      )}
      {step === "otp" && (
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
          required
        />
      )}
      {step === "reset" && (
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
          required
        />
      )}

      <button
        type="submit"
        className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 transition"
      >
        {step === "email" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Reset Password"}
      </button>

      <div className="text-sm mt-2 text-gray-600">
        Remembered your password?{" "}
        <span
          className="text-green-600 cursor-pointer hover:underline"
          onClick={() => switchMode("login")}
        >
          Back to Login
        </span>
      </div>
    </form>
  );
}

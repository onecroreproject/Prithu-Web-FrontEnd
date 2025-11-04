import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

export default function RegisterForm({ switchMode }) {
  const { sendOtpForReset, verifyOtpForNewUser, register } = useContext(AuthContext);

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const success = await sendOtpForReset(email);
    if (success) setStep("otp");
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const success = await verifyOtpForNewUser({ email, otp });
    if (success) setStep("details");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register({ username, email, password });
  };

  return (
    <form
      className="w-full max-w-xs"
      onSubmit={
        step === "email"
          ? handleSendOtp
          : step === "otp"
          ? handleVerifyOtp
          : handleRegister
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
      {step === "details" && (
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

      <button
        type="submit"
        className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 transition"
      >
        {step === "email" ? "Send OTP" : step === "otp" ? "Verify OTP" : "Register"}
      </button>

      <div className="text-center mt-6 text-sm text-gray-600">
        Already have an account?{" "}
        <span
          className="text-green-600 cursor-pointer hover:underline"
          onClick={() => switchMode("login")}
        >
          Login
        </span>
      </div>
    </form>
  );
}

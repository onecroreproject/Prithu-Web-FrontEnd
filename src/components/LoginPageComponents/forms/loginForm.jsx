import React, { useState, useContext } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { AuthContext } from "../../../context/AuthContext";

export default function LoginForm({ switchMode }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    await login({ identifier: email, password });

  } catch (err) {
    const backendError =
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      "Login failed. Please try again.";

    setError(backendError);
  } finally {
    setLoading(false);
  }
};



  // ✅ Simple fade-slide variant
  const fadeSlide = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeSlide}
      className="w-full max-w-xs mx-auto"
    >
      <h1 className="text-3xl text-center font-bold pb-4 text-gray-900">
        Welcome Back
      </h1>

      <form onSubmit={handleLogin} className="flex flex-col space-y-4">
        {/* ✅ Email Field */}
        <div className="relative">
          <Mail
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none transition-all"
            required
          />
        </div>

        {/* ✅ Password Field */}
        <div className="relative">
          <Lock
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none transition-all"
            required
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-green-600 transition"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </div>
        </div>

        {/* ✅ Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-sm text-center -mt-2"
          >
            {error}
          </motion.p>
        )}

        {/* ✅ Login Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          disabled={loading}
          type="submit"
          className={`w-full py-2 rounded-full font-semibold text-white transition-all ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
          }`}
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* ✅ Forgot Password */}
        <div
          className="text-sm text-green-600 mt-3 cursor-pointer hover:underline text-center"
          onClick={() => switchMode("forgot")}
        >
          Forgot Password?
        </div>

        {/* ✅ Create Account */}
        <div className="text-center mt-4 text-sm text-gray-600">
          New to Prithu?{" "}
          <span
            className="text-green-600 cursor-pointer hover:underline font-medium"
            onClick={() => switchMode("register")}
          >
            Create an account
          </span>
        </div>
      </form>
    </motion.div>
  );
}

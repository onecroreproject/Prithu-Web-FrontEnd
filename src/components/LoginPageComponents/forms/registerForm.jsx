import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";

export default function RegisterForm({ switchMode }) {
  const { sendOtpForReset, verifyOtpForNewUser, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [sameAsWhatsapp, setSameAsWhatsapp] = useState(false);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  // Availability checks
  const [emailStatus, setEmailStatus] = useState(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);

  // Password validation
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

  // Countdown timer for OTP
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  // ✅ FIXED: Real-time, reliable email availability check
  useEffect(() => {
    if (step !== "email" || !email.trim()) {
      setEmailStatus(null);
      return;
    }

    const controller = new AbortController();
    let isMounted = true;

    const checkAvailability = async () => {
      try {
        setCheckingEmail(true);
        const { data } = await api.get("/api/check/email/availability", {
          params: { email },
          signal: controller.signal,
        });

        console.log("📩 Email check response:", data);

        if (!isMounted) return;

        // ✅ Handle exact backend structure
        if (typeof data.available === "boolean") {
          setEmailStatus(data.available ? "available" : "taken");
        } else {
          setEmailStatus("error");
        }
      } catch (err) {
        if (err.name !== "CanceledError" && isMounted) {
          console.error("Email check error:", err);
          setEmailStatus("error");
        }
      } finally {
        if (isMounted) setCheckingEmail(false);
      }
    };

    checkAvailability();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [email, step]);

  // ✅ Username availability check
  useEffect(() => {
    if (step !== "details" || !username || username.length < 5) return;
    const delay = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/check/username/availability", {
          params: { username },
        });
        if (data.available) {
          setUsernameStatus("available");
          setUsernameSuggestions([]);
        } else {
          setUsernameStatus("taken");
          const random = Math.floor(Math.random() * 1000);
          setUsernameSuggestions([
            `${username}${random}`,
            `${username}_01`,
            `${username}.dev`,
          ]);
        }
      } catch {
        setUsernameStatus("error");
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [username, step]);

  // ✅ Password validation
  useEffect(() => {
    setPasswordChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*]/.test(password),
    });
  }, [password]);

  // ✅ Sync WhatsApp number with phone
  useEffect(() => {
    if (sameAsWhatsapp) setWhatsapp(phone);
  }, [sameAsWhatsapp, phone]);

  // ✅ Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (loading || timer > 0) return;
    setLoading(true);
    try {
      const success = await sendOtpForReset(email);
      if (success) {
        setStep("otp");
        setTimer(30);
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const success = await verifyOtpForNewUser({ email, otp });
      if (success) setStep("details");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Register user
  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    const validPassword = Object.values(passwordChecks).every(Boolean);
    if (!validPassword || username.length < 5)
      return alert("Please fix the highlighted issues before continuing.");

    setLoading(true);
    try {
      const success = await register({ username, email, password, phone, whatsapp });
      if (success) {
        switchMode("login");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Motion fade variants
  const fade = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };

  return (
    <>
      <div className="mt-1 mb-3">
        <h1 className="text-3xl font-bold pt-1 pb-3">Create Free Account</h1>
      </div>

      <form
        className="w-full relative"
        onSubmit={
          step === "email"
            ? handleSendOtp
            : step === "otp"
            ? handleVerifyOtp
            : handleRegister
        }
      >
        <AnimatePresence mode="wait">
          {/* STEP 1: EMAIL */}
          {step === "email" && (
            <motion.div key="email" initial="hidden" animate="visible" exit="exit" variants={fade}>
              <label className="block mb-1 font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>

              <div className="relative mb-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailStatus(null);
                  }}
                  className="w-full px-4 py-2 pr-10 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                  required
                />
              </div>

              <div className="mb-2 min-h-[20px]">
                {emailStatus === "available" && (
                  <motion.p className="text-green-600 text-sm" >
                    ✅ Email available
                  </motion.p>
                )}
                {emailStatus === "taken" && (
                  <motion.p className="text-red-500 text-sm" >
                    ❌ Email already in use
                  </motion.p>
                )}
                {emailStatus === "error" && (
                  <motion.p className="text-gray-500 text-sm" {...fade}>
                    ⚠️ Could not check email
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || timer > 0}
                className={`w-full py-2 rounded-full font-semibold text-white transition ${
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

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <motion.div key="otp" initial="hidden" animate="visible" exit="exit" variants={fade}>
              <label className="block mb-1 font-medium text-gray-700">
                OTP <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="mb-3 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-full font-semibold text-white transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <div className="text-center mt-4">
                {timer > 0 ? (
                  <span className="text-gray-500 text-sm">
                    Resend available in {timer}s
                  </span>
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
                    {loading ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 3: DETAILS */}
          {step === "details" && (
            <motion.div key="details" initial="hidden" animate="visible" exit="exit" variants={fade}>
              {/* Username */}
              <label className="block mb-1 font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter username (min 5 chars)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setUsernameStatus(null);
                }}
                className="mb-2 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />

              <div className="mb-2 min-h-[20px]">
                {username && username.length < 5 && (
                  <p className="text-red-500 text-sm">❌ Must be at least 5 characters</p>
                )}
                {usernameStatus === "available" && (
                  <p className="text-green-600 text-sm">✅ Username available</p>
                )}
                {usernameStatus === "taken" && (
                  <p className="text-red-500 text-sm">❌ Username not available</p>
                )}
              </div>

              {usernameSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {usernameSuggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      className="text-sm text-green-600 hover:underline"
                      onClick={() => setUsername(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Phone */}
              <label className="block mb-1 font-medium text-gray-700">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                maxLength={10}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= 10) setPhone(val);
                }}
                className="mb-2 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />

              {/* WhatsApp */}
              <label className="block mb-1 font-medium text-gray-700">
                WhatsApp Number <span className="text-red-500">*</span>
              </label>
              <div className="relative mb-2">
                <input
                  type="tel"
                  placeholder="Enter WhatsApp number"
                  value={whatsapp}
                  maxLength={10}
                  onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                  required
                />
                <span
                  onClick={() => {
                    setSameAsWhatsapp((prev) => !prev);
                    setWhatsapp(phone);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-green-600 cursor-pointer hover:underline"
                >
                  Same as Phone
                </span>
              </div>

              {/* Password */}
              <label className="block mb-1 font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-2 w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />

              {/* Password checklist */}
              <motion.div
                className="text-xs text-gray-700 mb-3 space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Object.entries({
                  length: "At least 8 characters",
                  uppercase: "One uppercase letter",
                  lowercase: "One lowercase letter",
                  number: "One number",
                  special: "One special character (!@#$%^&*)",
                }).map(([key, label]) => (
                  <motion.p
                    key={key}
                    className={`flex items-center gap-1 ${
                      passwordChecks[key] ? "text-green-600" : "text-red-500"
                    }`}
                    layout
                  >
                    {passwordChecks[key] ? "✅" : "❌"} {label}
                  </motion.p>
                ))}
              </motion.div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-full font-semibold text-white transition ${
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

    </>
  );
}

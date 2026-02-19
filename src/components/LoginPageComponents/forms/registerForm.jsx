import React, { useState, useEffect, useContext, memo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../api/axios";
import { validateReferralCode } from "../../../API_Services/referralServices";

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
    referralCode: "",
  });

  const [searchParams] = useSearchParams();
  const [referrer, setReferrer] = useState({
    name: null,
    status: "idle", // "idle" | "loading" | "valid" | "invalid"
    isLocked: false,
  });

  const [sameAsWhatsapp, setSameAsWhatsapp] = useState(false);
  const [status, setStatus] = useState({
    email: null, // null | "taken" | "available" | "error"
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

  /* --------------------------- REFERRAL CHECK --------------------------- */
  // 1. Listen to URL params only once to set the initial form state
  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode && !form.referralCode) {
      setForm((p) => ({ ...p, referralCode: refCode }));
    }
  }, [searchParams]);

  // 2. Debounced Validator: Single source of truth for triggering validation
  useEffect(() => {
    if (!form.referralCode || referrer.isLocked || referrer.status === "loading") return;

    // Fast track URL-based code, debounce manual entry
    const isUrlCode = form.referralCode === searchParams.get("ref");
    const delay = isUrlCode ? 0 : 800;

    const timeout = setTimeout(() => {
      handleValidateReferral(form.referralCode);
    }, delay);

    return () => clearTimeout(timeout);
  }, [form.referralCode, searchParams]);

  const handleValidateReferral = async (code) => {
    if (!code || referrer.status === "loading") return;

    setReferrer((p) => ({ ...p, status: "loading", isLocked: true }));
    try {
      const data = await validateReferralCode(code);

      if (data.success && data.referrerActive) {
        setReferrer({
          name: data.referrerName,
          status: "valid",
          isLocked: true,
        });
      } else {
        // Referral issues (Either invalid or inactive referrer)
        const message = !data.success
          ? "This referral link is invalid."
          : `This referral link from "${data.referrerName}" is not active.`;

        const proceed = window.confirm(`${message}\n\nDo you want to continue without a referral code?`);

        if (proceed) {
          setForm(p => ({ ...p, referralCode: "" }));
          setReferrer({ name: null, status: "idle", isLocked: false });
        } else {
          // Keep the code but unlock so they can edit it
          setReferrer({
            name: data.referrerName || null,
            status: "invalid",
            isLocked: false,
          });
        }
      }
    } catch (err) {
      setReferrer({
        name: null,
        status: "invalid",
        isLocked: false,
      });
    }
  };



  /* --------------------------- CHANGE EMAIL --------------------------- */
  const handleChangeEmail = () => {
    setStep("email");
    setForm((p) => ({ ...p, otp: "" }));
    setTimer(0);
  };

  /* --------------------------- EMAIL CHECK (improved) --------------------------- */
  useEffect(() => {
    if (step !== "email") return;

    const raw = form.email;
    const emailClean = raw.replace(/\s/g, ""); // remove all whitespace for checking
    // When empty, reset status and skip
    if (!emailClean) {
      setStatus((p) => ({ ...p, email: null, checkingEmail: false }));
      return;
    }

    // Basic heuristic: check while user types, but avoid calling API immediately for nonsense input.
    // We require at least an '@' plus 3 chars to start checking; this keeps checking responsive while avoiding useless calls.
    const shouldCheck = emailClean.includes("@") && emailClean.length > 3;

    if (!shouldCheck) {
      // still clear any previous state (but keep "typing")
      setStatus((p) => ({ ...p, email: null, checkingEmail: false }));
      return;
    }

    const controller = new AbortController();
    setStatus((p) => ({ ...p, checkingEmail: true }));

    const timeout = setTimeout(async () => {
      try {
        const { data } = await api.get("/api/check/email/availability", {
          params: { email: emailClean },
          signal: controller.signal,
        });

        setStatus((p) => ({
          ...p,
          email: data.available ? "available" : "taken",
          checkingEmail: false,
        }));
      } catch (err) {
        if (err.name === "CanceledError" || err.name === "AbortError") {
          // request was aborted intentionally — do nothing
          return;
        }
        setStatus((p) => ({ ...p, email: "error", checkingEmail: false }));
      }
    }, 400); // debounce

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
      // send trimmed email to backend
      const success = await sendOtpForReset(form.email.replace(/\s/g, ""));
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
        email: form.email.replace(/\s/g, ""),
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

    if (referrer.status === "loading") {
      return alert("Please wait while we validate your referral code.");
    }

    if (referrer.status === "invalid") {
      return alert("Please provide a valid referral code or continue without one.");
    }

    const validPassword = Object.values(passwordChecks).every(Boolean);

    if (!validPassword || form.username.length < 5)
      return alert("Please complete all requirements before registering.");

    setLoading(true);
    try {
      const success = await register({
        username: form.username,
        email: form.email.replace(/\s/g, ""),
        password: form.password,
        phone: form.phone,
        whatsapp: form.whatsapp,
        referralCode: form.referralCode,
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
    <div className="w-full max-w-sm mx-auto bg-white/5 rounded-2xl backdrop-blur-md border border-white/20 p-3 sm:p-4">
      <h1 className="text-lg sm:text-xl font-bold text-center mb-3 text-gray-900">
        Create Free Account
      </h1>



      <form
        className="space-y-3"
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
                className="w-full px-3 py-1.5 text-sm border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                required
              />

              {/* Stable response area */}
              <p className="text-sm mt-0.5 min-h-[28px] flex items-center">

                {status.checkingEmail && (
                  <span className="text-gray-500">Checking...</span>
                )}

                {!status.checkingEmail && status.email === "taken" && (
                  <span className="text-red-500 flex flex-col gap-0.5">
                    ❌ Email already registered.
                    <span className="flex justify-between mt-1">

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

                {!status.checkingEmail && status.email === "available" && (
                  <span className="text-green-600">✅ Email available</span>
                )}

                {!status.checkingEmail && status.email === "error" && (
                  <span className="text-gray-500">⚠️ Could not check email</span>
                )}
              </p>

              {status.email !== "taken" && (
                <button
                  type="submit"
                  disabled={loading || timer > 0}
                  className={`w-full py-2 rounded-full font-semibold text-white transition-all ${loading || timer > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
                    }`}
                >
                  {loading ? "Sending..." : timer > 0 ? `Resend OTP in ${timer}s` : "Register Now"}
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
                className="w-full px-3 py-1.5 text-sm border rounded-full focus:ring-2 focus:ring-green-400 outline-none mb-1"
                required
              />


              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-full font-semibold text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
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
                    className={`text-sm ${loading ? "text-gray-400 cursor-not-allowed" : "text-green-600 hover:underline"}`}
                  >
                    Resend OTP
                  </button>
                )}

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
                className="w-full px-3 py-1.5 text-sm border rounded-full focus:ring-2 focus:ring-green-400 outline-none mb-1"
                required
              />


              <p className="text-sm min-h-[20px]">
                {form.username && form.username.length < 5 && <span className="text-red-500">❌ Too short</span>}
                {status.username === "available" && <span className="text-green-600">✅ Username available</span>}
                {status.username === "taken" && <span className="text-red-500">❌ Username not available</span>}
              </p>


              {/* Phone + WhatsApp (Row Layout) */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Mobile */}
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 mb-0.5 text-sm">Mobile</label>
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "") }))}
                      placeholder="Mobile"
                      className="w-full px-3 py-1.5 text-sm border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                    />
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 mb-0.5 text-sm">WhatsApp</label>
                  <div className="relative">
                    <input
                      type="tel"
                      maxLength={10}
                      value={form.whatsapp}
                      onChange={(e) => setForm((p) => ({ ...p, whatsapp: e.target.value.replace(/\D/g, "") }))}
                      placeholder="WhatsApp"
                      className="w-full px-3 py-1.5 text-sm border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                    />
                    <span
                      onClick={() => setSameAsWhatsapp((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-green-600 cursor-pointer hover:underline"
                    >
                      Same
                    </span>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="mt-1">
                <label className="block font-medium text-gray-700 mb-0.5 text-sm">Password</label>

                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-1.5 text-sm border rounded-full focus:ring-2 focus:ring-green-400 outline-none"
                />
              </div>


              <motion.div className="text-[11px] text-gray-700 mt-1 space-y-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>


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

              {/* Referral Code (Shown only if user comes with a link or is validating) */}
              {(form.referralCode || referrer.status !== "idle") && (
                <div className="mt-4">
                  <label className="block font-medium text-gray-700 mb-0.5 text-sm">Referral Code</label>
                  <input
                    type="text"
                    placeholder="Referral code"
                    value={form.referralCode}
                    onChange={(e) => setForm((p) => ({ ...p, referralCode: e.target.value.toUpperCase() }))}
                    readOnly={referrer.isLocked}
                    className={`w-full px-3 py-1.5 text-sm border rounded-full outline-none transition-all ${referrer.isLocked ? "bg-gray-100 cursor-not-allowed border-gray-200" : "focus:ring-2 focus:ring-green-400"
                      }`}
                  />


                  {referrer.status === "loading" && (
                    <p className="text-xs text-gray-500 mt-1 animate-pulse">Validating referral code...</p>
                  )}
                  {referrer.status === "valid" && referrer.name && (
                    <p className="text-xs text-green-600 mt-1 font-medium flex items-center gap-1">
                      ✅ Referred by: <span className="font-bold">{referrer.name}</span>
                    </p>
                  )}
                  {referrer.status === "invalid" && (
                    <p className="text-xs text-red-500 mt-1 font-medium">❌ Invalid referral code</p>
                  )}
                </div>
              )}


              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-3 py-2 rounded-full font-semibold text-white transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
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

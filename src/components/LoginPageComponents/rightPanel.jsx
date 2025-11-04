import React from "react";
import { FaLeaf } from "react-icons/fa";
import LoginForm from "./forms/loginForm";
import RegisterForm from "./forms/registerForm";
import ForgotForm from "./forms/forgotFrom";

export default function RightPanel({ mode, setMode }) {
  const switchMode = (newMode) => setMode(newMode);

  return (
    <div className="flex-1 bg-white/95 p-8 flex flex-col justify-center relative">
      <div className="flex flex-col items-center">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
            <FaLeaf className="text-white text-2xl" />
          </div>
        </div>

        {mode === "login" && <LoginForm switchMode={switchMode} />}
        {mode === "register" && <RegisterForm switchMode={switchMode} />}
        {mode === "forgot" && <ForgotForm switchMode={switchMode} />}
      </div>
    </div>
  );
}

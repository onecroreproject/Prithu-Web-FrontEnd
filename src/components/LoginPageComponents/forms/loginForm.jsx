import React, { useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";

export default function LoginForm({ switchMode }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    await login({ identifier: email, password });
  };

  return (
    <form className="w-full max-w-xs" onSubmit={handleLogin}>
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
      <button
        type="submit"
        className="w-full py-2 rounded-full font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90 transition"
      >
        Login
      </button>

      <div
        className="text-sm text-green-600 mt-3 cursor-pointer hover:underline"
        onClick={() => switchMode("forgot")}
      >
        Forgot Password?
      </div>

      <div className="text-center mt-6 text-sm text-gray-600">
        New to Prithu?{" "}
        <span
          className="text-green-600 cursor-pointer hover:underline"
          onClick={() => switchMode("register")}
        >
          Create an account
        </span>
      </div>
    </form>
  );
}

import React, { useState } from "react";
import api from "../api/axios";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Send, Image, Loader2 } from "lucide-react";

export default function AdminSendNotification() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim())
      return toast.error("Title and message are required");

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await api.post(
        "/api/admin/send/notification",
        { title, message, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("✅ Notification sent to all users!");
        setTitle("");
        setMessage("");
        setImage("");
      } else toast.error(data.error || "Failed to send");
    } catch (err) {
      console.error("❌ Send notification error:", err);
      toast.error("Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center px-4 py-12">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <Send className="w-6 h-6 text-green-600" />
            Send Admin Notification
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Broadcast an announcement to all users instantly 🔔
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSend} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notification Title
            </label>
            <input
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows="4"
              placeholder="Enter your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <Image className="w-4 h-4 text-green-600" /> Optional Image URL
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>

          {/* Preview */}
          {image && (
            <motion.img
              src={image}
              alt="Preview"
              className="rounded-lg border mt-2 mx-auto max-h-40 object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
            className={`w-full flex items-center justify-center gap-2 py-3 font-semibold text-white rounded-full transition 
              ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Send Notification
              </>
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

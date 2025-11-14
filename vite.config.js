import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),

    // 📊 Enable bundle visualizer only in analysis mode
    ...(mode === "analyze"
      ? [
          visualizer({
            filename: "bundle-stats.html",
            open: true,
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],

  build: {
    // ⚙️ Higher limit to prevent false warnings
    chunkSizeWarningLimit: 1500,

    // 📦 Manual chunk optimization
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          mui: ["@mui/material", "@mui/icons-material"],
          framer: ["framer-motion"],
          utils: ["axios", "dayjs"],
        },
      },
    },

    sourcemap: false,
    minify: "esbuild",
  },

  // ⚡ Dev server configuration
  server: {
    port: 5173,
    open: true,
  },
}));

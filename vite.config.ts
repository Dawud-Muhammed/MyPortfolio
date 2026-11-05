import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { publicPreviewPlugin } from "./scripts/public-preview-plugin";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => ({
  plugins: [
    react(),
    ...(command === "serve" && mode === "public-preview"
      ? [publicPreviewPlugin()]
      : []),
  ],
  server: { proxy: { "/api": "http://127.0.0.1:3001" } },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
    // Use default minifier (esbuild is built-in)
    chunkSizeWarningLimit: 600,
  },
}));

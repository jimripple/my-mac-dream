import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Prevent Vite from obscuring Rust errors
  clearScreen: false,
  server: {
    host: "::",
    port: 8080,
    // Tauri expects a fixed port
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  // Env variables starting with TAURI_ are available in the frontend
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

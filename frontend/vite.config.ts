import path from "node:path";
import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // In development the browser talks only to Vite (same origin). Requests to
    // `/api/*` are proxied to the FastAPI backend, which means:
    //   - no CORS in local dev, and
    //   - the HttpOnly session cookie set by the backend is scoped to
    //     `localhost:5173` and forwarded on every proxied request automatically.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) requires manualChunks as a function.
        manualChunks(id: string) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-router")) {
            return "react";
          }
          if (id.includes("node_modules/@tanstack")) {
            return "query";
          }
          if (id.includes("node_modules/axios")) {
            return "http";
          }
          return undefined;
        },
      },
    },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves a project site from /<repo>/, so the asset base has to
// match. The workflow sets BASE_PATH; locally it stays "/" so `npm run dev`
// and `npm run preview` behave normally.
const base = process.env.BASE_PATH || "/";

// Take the port from the environment rather than pinning one. Nothing in this
// app depends on a specific port - it is a static SPA that fetches its own
// snapshot over a relative path, with no OAuth callback, webhook or
// cross-origin call to register anywhere. Pinning 3000 only guaranteed a
// collision with whatever else was already running.
const port = process.env.PORT ? Number(process.env.PORT) : undefined;

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    // The snapshot JSON is bundled as the offline fallback and recharts is
    // large. One chunk over 500kB is expected and not worth code-splitting a
    // single-page terminal for.
    chunkSizeWarningLimit: 1100,
  },
  server: {
    host: "0.0.0.0",
    port,
    // Let Vite move to the next free port instead of failing outright, and let
    // HMR follow whatever port it lands on rather than hard-coding its own.
    strictPort: false,
  },
});

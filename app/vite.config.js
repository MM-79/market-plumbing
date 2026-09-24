import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves a project site from /<repo>/, so the asset base has to
// match. The workflow sets BASE_PATH; locally it stays "/" so `npm run dev`
// and `npm run preview` behave normally.
const base = process.env.BASE_PATH || "/";

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
    port: 3000,
    strictPort: true,
    hmr: { port: 3000 },
  },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { commentsApiPlugin } from "./demo/api/plugin";

export default defineConfig({
  plugins: [react(), commentsApiPlugin()],
  build: {
    outDir: "demo-dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
});

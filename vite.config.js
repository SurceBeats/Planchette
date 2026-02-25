import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "path";

const FLASK_PORT = 7777;

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/src/dist/" : "/",

  publicDir: false,
  plugins: [react(), tailwindcss()],

  server: {
    port: 5173,
    cors: {
      origin: `http://localhost:${FLASK_PORT}`,
      credentials: true,
    },
    allowedHosts: ["localhost"],
    hmr: {
      clientPort: 5173,
    },
  },

  build: {
    outDir: "src/dist",
    manifest: true,
    minify: true,
    rollupOptions: {
      input: {
        global: resolve(__dirname, "src/static/css/global.css"),
        __main__: resolve(__dirname, "src/static/js/__main__.ts"),
      },
    },
  },
}));

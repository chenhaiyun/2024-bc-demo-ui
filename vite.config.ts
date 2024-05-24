import dotenv from "dotenv";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": process.env,
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
  server: {
    proxy: {
      "/tts": {
        target: "https://nls-gateway-cn-shanghai.aliyuncs.com/stream/v1/tts",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tts/, ""),
      },
    },
  },
});

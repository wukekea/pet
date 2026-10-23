import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: "./",
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    // 支持通过 PET_PORT 环境变量指定端口，与 electron:dev 的 wait-on 保持一致
    port: Number(process.env.PET_PORT) || 5173,
    strictPort: true,
  },
});

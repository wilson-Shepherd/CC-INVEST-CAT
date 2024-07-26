import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: "index.html",
    },
  },
  define: {
    "import.meta.env.API_BASE_URL": JSON.stringify(
      // "https://api.cc-invest-cat.com",
      "http://localhost:3000",
    ),
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
});
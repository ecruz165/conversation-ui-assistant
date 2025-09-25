import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable fast refresh
      fastRefresh: true,
    }),
  ],
  server: {
    port: 3001,
    host: true,
    hmr: {
      port: 3001,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  // Optimize dependencies for faster dev server startup
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});

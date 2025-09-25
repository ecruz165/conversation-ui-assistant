import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    port: 3000,
    host: true,
    hmr: {
      port: 3000,
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    tanstackStart({
      srcDirectory: "src",
      start: { entry: "./start.tsx" },
      server: { entry: "./server.ts" },
    }),
    viteReact(),
  ],
  // Optimize dependencies for faster dev server startup
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  // Build configuration
  build: {
    sourcemap: true,
    // Let TanStack Start handle chunking for SSR compatibility
  },
});

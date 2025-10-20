import { resolve } from "node:path";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  mode: "production",
  build: {
    target: "es2015", // Better browser support for web components
    lib: {
      entry: resolve(__dirname, "src/chat-widget/web-component/index.ts"),
      name: "ChatWidget",
      fileName: "chat-widget",
      formats: ["iife"], // Immediately Invoked Function Expression for standalone usage
    },
    rollupOptions: {
      output: {
        // Ensure everything is bundled into a single file
        inlineDynamicImports: true,
        // Make the global variable name predictable
        name: "ChatWidget",
        // Add banner to help with debugging
        banner: "/* Chat Widget Web Component - Built with Vite */",
        // Ensure proper globals are exposed
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      // Don't externalize these - bundle everything
      external: [],
    },
    // Minify for production but keep readable for debugging
    minify: "esbuild",
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Output directory for web component builds
    outDir: "dist/web-component",
    // Empty output dir to avoid conflicts
    emptyOutDir: true,
    // Ensure CSS is inlined
    cssCodeSplit: false,
  },
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    viteReact({
      // Ensure JSX is handled correctly in the bundle
      jsxRuntime: "automatic",
    }),
  ],
  // Optimize dependencies for the build
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "framer-motion",
      "lucide-react",
      "socket.io-client",
    ],
  },
  define: {
    // Ensure React works in production mode
    "process.env.NODE_ENV": '"production"',
    // Define global for better debugging
    __DEV__: false,
  },
  // Ensure proper resolution for web component build
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});

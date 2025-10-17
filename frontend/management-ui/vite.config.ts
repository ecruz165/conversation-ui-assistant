import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";
import viteReact from "@vitejs/plugin-react";
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

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
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    // Serve static files from web-component dist
    middlewareMode: false,
    fs: {
      allow: ['..', './dist']
    }
  },
  // Configure public directory to serve static assets
  publicDir: 'public',
  plugins: [
    tsConfigPaths({
      projects: ["./tsconfig.json"],
    }),
    viteReact(),
    // Custom plugin to serve web component files
    {
      name: 'serve-web-component',
      configureServer(server) {
        server.middlewares.use('/web-component', (req, res, next) => {
          const filePath = resolve(__dirname, 'dist/web-component' + req.url);
          try {
            if (existsSync(filePath)) {
              const content = readFileSync(filePath);
              if (req.url?.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
              }
              res.end(content);
              return;
            }
          } catch (error) {
            console.error('Error serving web component file:', error);
          }
          next();
        });
      }
    }
  ],
  // Optimize dependencies for faster dev server startup
  optimizeDeps: {
    include: ["react", "react-dom"],
    exclude: [
      "@tanstack/react-start",
      "@tanstack/start-server-core",
    ],
  },
  // Build configuration
  build: {
    target: 'esnext',
    sourcemap: true,
    rollupOptions: {
      input: './index.html',
    },
  },
});

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import viteReact from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  // ============================================
  // Load Environment Variables
  // ============================================
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = mode === 'development';
  const isProd = mode === 'production';

  // ============================================
  // Parse DevX Configuration
  // ============================================
  const parseEnvBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
  };

  const devxEnabled = parseEnvBoolean(env.VITE_DEVX_ENABLED, isDev);

  const devxConfig = {
    enabled: devxEnabled,
    million: devxEnabled && parseEnvBoolean(env.VITE_DEVX_MILLION, true),
    bundleVisualizer: parseEnvBoolean(env.VITE_DEVX_BUNDLE_VISUALIZER, false) || process.env.ANALYZE === 'true',
    inspect: devxEnabled && parseEnvBoolean(env.VITE_DEVX_INSPECT, true) && isDev,
    reactScan: devxEnabled && parseEnvBoolean(env.VITE_DEVX_REACT_SCAN, true) && isDev,
  };

  // ============================================
  // Log DevX Configuration
  // ============================================
  console.log('\n🔧 DevX Build Configuration:');
  console.log(`   Mode: ${mode}`);
  console.log(`   Master Switch: ${devxConfig.enabled ? '✓ Enabled' : '✗ Disabled'}`);
  if (devxConfig.enabled) {
    console.log(`   Million.js: ${devxConfig.million ? '✓' : '✗'}`);
    console.log(`   Bundle Visualizer: ${devxConfig.bundleVisualizer ? '✓' : '✗'}`);
    console.log(`   Vite Inspect: ${devxConfig.inspect ? '✓' : '✗'}`);
    console.log(`   React Scan: ${devxConfig.reactScan ? '✓' : '✗'}`);
  }
  console.log('');

  // ============================================
  // Build Plugins Array Conditionally
  // ============================================
  const plugins = [];

  // TSConfig paths (always needed)
  plugins.push(tsConfigPaths({
    projects: ["./tsconfig.json"],
  }));

  // Million.js - MUST come before React plugin
  // Note: Million.js is disabled by default as it requires careful configuration
  // Uncomment and configure when ready to use
  // if (devxConfig.million) {
  //   const million = require('million/compiler');
  //   plugins.push(million.vite({
  //     auto: true,
  //     mode: 'react',
  //   }));
  // }

  // React plugin (core)
  plugins.push(viteReact());

  // React Scan - Visual render tracking
  // Note: React Scan is disabled by default as it requires installation
  // Install with: npm install -D react-scan
  // if (devxConfig.reactScan) {
  //   const { scan } = require('react-scan/vite');
  //   plugins.push(scan({
  //     enabled: true,
  //     showRenderCount: true,
  //     highlightSlowComponents: true,
  //   }));
  // }

  // Vite Inspect - Debug plugin transformations
  // Note: Vite Inspect is disabled by default as it requires installation
  // Install with: npm install -D vite-plugin-inspect
  // if (devxConfig.inspect) {
  //   const Inspect = require('vite-plugin-inspect').default;
  //   plugins.push(Inspect({
  //     enabled: true,
  //     build: false,
  //   }));
  // }

  // Bundle Visualizer - Analyze bundle size
  // Note: Bundle Visualizer is disabled by default as it requires installation
  // Install with: npm install -D rollup-plugin-visualizer
  // if (devxConfig.bundleVisualizer) {
  //   const { visualizer } = require('rollup-plugin-visualizer');
  //   plugins.push(visualizer({
  //     open: true,
  //     filename: 'dist/stats.html',
  //     gzipSize: true,
  //     brotliSize: true,
  //     template: 'treemap',
  //   }));
  // }

  // Custom plugin to serve web component files
  plugins.push({
    name: "serve-web-component",
    configureServer(server) {
      server.middlewares.use("/web-component", (req, res, next) => {
        const filePath = resolve(__dirname, `dist/web-component${req.url}`);
        try {
          if (existsSync(filePath)) {
            const content = readFileSync(filePath);
            if (req.url?.endsWith(".js")) {
              res.setHeader("Content-Type", "application/javascript");
            }
            res.end(content);
            return;
          }
        } catch (error) {
          console.error("Error serving web component file:", error);
        }
        next();
      });
    },
  });

  return {
    plugins,
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization",
      },
      // Serve static files from web-component dist
      middlewareMode: false,
      fs: {
        allow: ["..", "./dist"],
      },
    },
    // Configure public directory to serve static assets
    publicDir: "public",
    // Optimize dependencies for faster dev server startup
    optimizeDeps: {
      include: ["react", "react-dom", "web-vitals"],
      exclude: ["@tanstack/react-start", "@tanstack/start-server-core"],
    },
    // Build configuration
    build: {
      target: "esnext",
      sourcemap: isDev,
      rollupOptions: {
        input: "./index.html",
      },
    },
  };
});

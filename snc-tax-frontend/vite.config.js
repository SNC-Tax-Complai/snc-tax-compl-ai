import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BUILD_VERSION = Date.now().toString();
const BUILD_TIME = new Date().toISOString();

// Base path: /snc-tax-compl-ai/ for GitHub Pages, / for custom domain
// Override with VITE_BASE_URL env var when custom domain is active
const base = process.env.VITE_BASE_URL || '/snc-tax-compl-ai/';

function versionJsonPlugin() {
  return {
    name: 'version-json',
    closeBundle() {
      try {
        writeFileSync(join('dist', 'version.json'),
          JSON.stringify({ version: BUILD_VERSION, buildTime: BUILD_TIME }));
      } catch (e) { /* non-fatal */ }
    },
  };
}

export default defineConfig({
  base,
  plugins: [react(), versionJsonPlugin()],
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});

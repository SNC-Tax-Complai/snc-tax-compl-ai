import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BUILD_VERSION = Date.now().toString();
const BUILD_TIME = new Date().toISOString();

function versionJsonPlugin() {
  return {
    name: 'version-json',
    closeBundle() {
      try {
        const version = { version: BUILD_VERSION, buildTime: BUILD_TIME };
        writeFileSync(join('dist', 'version.json'), JSON.stringify(version));
      } catch (e) {
        // non-fatal: version.json is optional
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), versionJsonPlugin()],
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',  // esbuild is built into Vite — no extra package needed
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

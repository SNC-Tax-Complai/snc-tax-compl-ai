import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BUILD_VERSION = Date.now().toString();
const BUILD_TIME = new Date().toISOString();

// Plugin: write dist/version.json so the backend can serve it
function versionJsonPlugin() {
  return {
    name: 'version-json',
    closeBundle() {
      const version = { version: BUILD_VERSION, buildTime: BUILD_TIME };
      writeFileSync(join('dist', 'version.json'), JSON.stringify(version));
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
    minify: 'terser',
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});

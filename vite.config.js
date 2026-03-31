import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'url';
import environment from 'vite-plugin-environment';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  build: {
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./src/hoswap2_frontend/index.html', import.meta.url)),
        login: fileURLToPath(new URL('./src/hoswap2_frontend/login.html', import.meta.url)),
        upload: fileURLToPath(new URL('./src/hoswap2_frontend/main.html', import.meta.url)),
      }
    }
  
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4943",
        changeOrigin: true,
      },
    },
  },
  publicDir: "assets",
  plugins: [
    environment("all", { prefix: "CANISTER_" }),
    environment("all", { prefix: "DFX_" }),
  ],
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  resolve: {
    alias: [
      {
        find: "declarations",
        replacement: fileURLToPath(
          new URL("../declarations", import.meta.url)
        ),
      },
    ],
    dedupe: ['@dfinity/agent'],
  },
});

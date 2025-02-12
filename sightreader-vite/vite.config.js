import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // You can change this if needed
  },
  resolve: {
    alias: {
      'abcjs': 'abcjs/dist/abcjs-basic.min.js'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});
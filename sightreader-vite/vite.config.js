import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  resolve: {
    alias: {
      // REMOVE this alias
      // 'abcjs': 'node_modules/abcjs/dist/abcjs-basic.min.js'
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
});

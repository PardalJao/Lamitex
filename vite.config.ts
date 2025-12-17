import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This ensures process.env is available as an object to avoid "process is not defined"
    'process.env': {
      API_KEY: process.env.API_KEY || ''
    }
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000, // Silences the large chunk warning from your logs
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', '@google/genai'],
        },
      },
    },
  },
  server: {
    port: 3000
  }
});
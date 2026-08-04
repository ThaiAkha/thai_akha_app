import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      build: {
        target: 'esnext',
        chunkSizeWarningLimit: 600,
        rollupOptions: {
          output: {
            manualChunks(id) {
              if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
              if (id.includes('node_modules/@supabase/')) return 'vendor-supabase';
              if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
              if (id.includes('node_modules/framer-motion')) return 'vendor-motion';
              if (id.includes('node_modules/@google/genai') || id.includes('node_modules/@google/')) return 'vendor-genai';
            },
          },
        },
      },
    };
});

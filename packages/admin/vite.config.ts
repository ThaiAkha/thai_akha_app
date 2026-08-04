import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
// admin.thaiakha.com → porta 3001 in dev
export default defineConfig({
  server: {
    port: 3001,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        // This will transform your SVG to a React component
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      // Suppress eval warning from @react-jvectormap/core (third-party, not fixable)
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id?.includes('jvectormap')) return;
        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'vendor-react';
          if (id.includes('node_modules/react-router')) return 'vendor-react';
          if (id.includes('node_modules/@supabase/')) return 'vendor-supabase';
          if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
          if (id.includes('jvectormap')) return 'vendor-map';
        },
      },
    },
  },
});

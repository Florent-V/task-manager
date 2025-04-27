import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import nightwatchPlugin from 'vite-plugin-nightwatch'
import vueDevTools from 'vite-plugin-vue-devtools'
import dotenv from 'dotenv';

dotenv.config();
console.log('process.env.VITE_CLIENT_DOCKER_PORT:', process.env.VITE_CLIENT_DOCKER_PORT);

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: process.env.VITE_CLIENT_DOCKER_PORT || 5173
  },
  plugins: [
    vue(),
    nightwatchPlugin(),
    vueDevTools(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: 'auto',

      pwaAssets: {
        disabled: false,
        config: true,
      },

      manifest: {
        name: "Task Manager",
        short_name: "Task",
        description: "An application to handle tasks with To Do Lists and projects with Kanban",
        start_url: "/",
        display: "standalone",
        theme_color: '#3E1B65',
        background_color: "#3E1B65",
        icons: [
          {
            src: "/icon-48x48.png",
            sizes: "48x48",
            type: "image/png"
          },
          {
            src: "/icon-72x72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "/icon-96x96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "/icon-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icon-180x180.png",
            sizes: "180x180",
            type: "image/png"
          },
          {
            src: "/icon-167x167.png",
            sizes: "167x167",
            type: "image/png"
          },
          {
            src: "/icon-152x152.png",
            sizes: "152x152",
            type: "image/png"
          },
          {
            src: "/icon-120x120.png",
            sizes: "120x120",
            type: "image/png"
          },
          {
            src: "/icon-76x76.png",
            sizes: "76x76",
            type: "image/png"
          },
          {
            src: "/icon-70x70.png",
            sizes: "70x70",
            type: "image/png"
          },
          {
            src: "/icon-150x150.png",
            sizes: "150x150",
            type: "image/png"
          },
          {
            src: "/icon-310x310.png",
            sizes: "310x310",
            type: "image/png"
          }
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },

      devOptions: {
        enabled: true,
        navigateFallback: 'index.html',
        suppressWarnings: true,
        type: 'module',
      },
    })
  ],
  build: {
    chunkSizeWarningLimit: 2000, // Augmenter la limite à 2000 kB (2 MB)
    rollupOptions: {
      output: {
        manualChunks(id) {
          // 1. Séparer les composants volumineux
          if (id.includes('/src/components/')) {
            const componentName = id.split('/src/components/')[1].split('.')[0];
            return `components/${componentName}`;
          }

          // 2. Séparer les vues (pages)
          if (id.includes('/src/views/')) {
            const viewName = id.split('/src/views/')[1].split('.')[0];
            return `views/${viewName}`;
          }

          // 3. Séparer les modules du store (si volumineux)
          if (id.includes('/src/stores/')) {
            return 'stores';
          }

          // 4. Séparer les utilitaires (si volumineux)
          if (id.includes('/src/utils/')) {
            return 'utils';
          }

          // 5. Regrouper les dépendances tierces (si nécessaire)
          if (id.includes('/node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})

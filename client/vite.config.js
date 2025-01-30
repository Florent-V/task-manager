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
        name: 'task-manager',
        short_name: 'task-manager',
        description: 'Application de gestion de liste de tâches',
        theme_color: '#f0f0f0',
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

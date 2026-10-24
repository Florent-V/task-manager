/* eslint-disable */
import { fileURLToPath, URL } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
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
    tailwindcss(),
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
        name: "ToDo",
        short_name: "ToDo",
        description: "An application to handle tasks with To Do Lists and projects with Kanban",
        start_url: "/",
        display: "standalone",
        theme_color: '#3E1B65',
        icons: [
          {
            src: "/icon-16x16.png",
            sizes: "16x16",
            type: "image/png"
          },
          {
            src: "/icon-32x32.png",
            sizes: "32x32",
            type: "image/png"
          },
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
            src: "/icon-120x120.png",
            sizes: "120x120",
            type: "image/png"
          },
          {
            src: "/icon-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "/icon-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "/icon-152x152.png",
            sizes: "152x152",
            type: "image/png"
          },
          {
            src: "/icon-180x180.png",
            sizes: "180x180",
            type: "image/png"
          },
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "/icon-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        // Les URL de l'API ouvertes dans le navigateur (connexion SSO, callback, logout, admin-panel)
        // doivent atteindre le serveur, pas être servies par index.html depuis le cache
        navigateFallbackDenylist: [/^\/api\//],
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
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'vendor', test: /[\\/]node_modules[\\/]/, priority: 2 },
            { name: 'stores', test: /[\\/]src[\\/]stores[\\/]/, priority: 1 },
            { name: 'utils', test: /[\\/]src[\\/]utils[\\/]/, priority: 1 },
          ],
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

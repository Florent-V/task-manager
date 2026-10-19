<script setup>
import { computed, ref } from 'vue'
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/vue'

// check for updates every hour
const period = 60 * 60 * 1000

const swActivated = ref(false)
const reloading = ref(false)

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 * @param {string} swUrl
 * @param {ServiceWorkerRegistration} r
 */
function registerPeriodicSync(swUrl, r) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine)
      return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        'cache': 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200)
      await r.update()
  }, period)
}


const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW({
  immediate: true,
  onRegisteredSW(swUrl, r) {
    if (period <= 0) return
    if (r?.active?.state === 'activated') {
      swActivated.value = true
      registerPeriodicSync(swUrl, r)
    }
    else if (r?.installing) {
      r.installing.addEventListener('statechange', (e) => {
        /** @type {ServiceWorker} */
        const sw = e.target
        swActivated.value = sw.state === 'activated'
        if (swActivated.value)
          registerPeriodicSync(swUrl, r)
      })
    }
  },
})

const title = computed(() => {
  if (offlineReady.value)
    return 'Application prête à fonctionner hors ligne.'
  if (needRefresh.value)
    return 'Une nouvelle version est disponible.'
  return ''
})

/**
 * vite-plugin-pwa ne recharge la page que si le nouveau SW a été installé par cet onglet
 * (event.isUpdate). Quand le SW était déjà en attente au chargement (installé lors d'une visite
 * précédente ou par un autre onglet), aucun rechargement n'a lieu : on l'assure nous-mêmes.
 */
async function reload() {
  if (reloading.value) return
  reloading.value = true

  navigator.serviceWorker?.addEventListener('controllerchange', () => window.location.reload(), { once: true })
  await updateServiceWorker(true)

  // Filet de sécurité si aucun SW n'était réellement en attente (controllerchange jamais émis)
  setTimeout(() => window.location.reload(), 3000)
}

function close() {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-4 opacity-0"
      leave-active-class="transition duration-200 ease-in"
      leave-to-class="translate-y-4 opacity-0"
  >
    <div
        v-if="offlineReady || needRefresh"
        class="fixed bottom-4 right-4 left-4 sm:left-auto z-[9999] sm:w-96 flex items-start gap-3 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
        aria-labelledby="pwa-toast-message"
        role="alert"
    >
      <div
          class="shrink-0 flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-600 dark:bg-yellow-400/20 dark:text-yellow-400"
          aria-hidden="true"
      >
        <!-- Flèches circulaires (mise à jour) ou nuage coché (hors ligne) -->
        <svg v-if="needRefresh" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5" :class="{ 'animate-spin': reloading }">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <p id="pwa-toast-message" class="font-semibold text-gray-900 dark:text-yellow-300">
          {{ title }}
        </p>
        <p v-if="needRefresh" class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Rechargez pour profiter des dernières améliorations.
        </p>

        <div class="flex justify-end gap-2 mt-3">
          <button
              type="button"
              class="px-3 py-1.5 text-sm rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition"
              @click="close"
          >
            {{ needRefresh ? 'Plus tard' : 'Fermer' }}
          </button>
          <button
              v-if="needRefresh"
              type="button"
              :disabled="reloading"
              class="px-3 py-1.5 text-sm rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 dark:bg-yellow-400 dark:text-gray-900 dark:hover:bg-yellow-500 disabled:opacity-60 disabled:cursor-wait transition"
              @click="reload"
          >
            {{ reloading ? 'Rechargement…' : 'Recharger' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

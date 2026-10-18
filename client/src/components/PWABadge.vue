<script setup>
import { computed, ref } from 'vue'
// eslint-disable-next-line import/no-unresolved
import { useRegisterSW } from 'virtual:pwa-register/vue'

// check for updates every hour
const period = 60 * 60 * 1000

const swActivated = ref(false)

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
      registerPeriodicSync(period, swUrl, r)
    }
    else if (r?.installing) {
      r.installing.addEventListener('statechange', (e) => {
        /** @type {ServiceWorker} */
        const sw = e.target
        swActivated.value = sw.state === 'activated'
        if (swActivated.value)
          registerPeriodicSync(period, swUrl, r)
      })
    }
  },
})

const title = computed(() => {
  if (offlineReady.value)
    return 'App ready to work offline'
  if (needRefresh.value)
    return 'New content available, click on reload button to update.'
  return ''
})

function close() {
  offlineReady.value = false
  needRefresh.value = false
}
</script>

<template>
  <div
      v-if="offlineReady || needRefresh"
      class="pwa-toast"
      aria-labelledby="toast-message"
      role="alert"
  >
    <div class="message">
      <span id="toast-message">
        {{ title }}
      </span>
    </div>
    <div class="buttons">
      <button v-if="needRefresh" type="button" class="reload" @click="updateServiceWorker()">
        Reload
      </button>
      <button type="button" @click="close">
        Close
      </button>
    </div>
  </div>
</template>

<style scoped>
.pwa-toast {
  position: fixed;
  right: 0;
  bottom: 0;
  margin: 16px;
  padding: 12px;
  border: 1px solid #8885;
  border-radius: 8px;
  background-color: #fff;
  color: #1f2937;
  z-index: 9999;
  text-align: left;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  display: grid;
}
:global(.dark) .pwa-toast {
  background-color: #1f2937;
  color: #f3f4f6;
}
.pwa-toast .message {
  margin-bottom: 8px;
}
.pwa-toast .buttons {
  display: flex;
}
.pwa-toast button {
  border: 1px solid #8885;
  outline: none;
  margin-right: 5px;
  border-radius: 4px;
  padding: 6px 14px;
  background-color: transparent;
  color: inherit;
  cursor: pointer;
}
.pwa-toast button.reload {
  display: block;
  background-color: #3E1B65;
  border-color: #3E1B65;
  color: #fff;
}
</style>

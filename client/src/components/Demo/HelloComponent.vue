<script setup>
import { ref } from 'vue'
import router from '@/router/index.js'

const name = ref()
function go() {
  router.push(`/hello/${encodeURIComponent(name.value)}`)
}

</script>

<template>
  <div class="flex items-center justify-center">
    <div class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-md w-64 text-center">
      <input
        v-model="name"
        type="text"
        placeholder="Enter your name"
        @keydown.enter="go"
        class="bg-gray-100 dark:bg-gray-600 text-black dark:text-white p-2 rounded w-full mb-4"
      >
      <button
        :disabled="!name"
        @click="go"
        class="bg-blue-500 dark:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        Go
      </button>
    </div>
  </div>

</template>

<style scoped>
</style>

<script setup>
import { computed } from 'vue'
import { useCounterStore } from '@/stores/counter.js'

const counterStore = useCounterStore()

const count = computed(() => counterStore.count)
const doubleCount = computed(() => counterStore.doubleCount)
const increment = counterStore.increment
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white p-6 rounded-lg shadow-md w-64 text-center">
      <h2 class="text-2xl font-semibold mb-4">Counter</h2>
      <p class="text-xl mb-2">Current Count: {{ count }}</p>
      <p class="text-xl mb-6">Double Count: {{ doubleCount }}</p>
      <button @click="increment" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Increment
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>

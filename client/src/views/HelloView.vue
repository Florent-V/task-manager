<script setup>
import { useRoute, useRouter } from 'vue-router'
import CounterComponent from '@/components/Demo/CounterComponent.vue'


const router = useRouter()
const route = useRoute()
console.log('route', route.params.name)
console.log('router', router)

const name = route.params.name;

</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <h2 class="text-3xl font-bold mb-4">Hello, {{ name }}!</h2>
    <p class="text-gray-700 dark:text-gray-300">
      This project is a starter base for your modern Vue.js applications. It includes:
    </p>
    <ul class="list-disc pl-5 mt-4 text-gray-700 dark:text-gray-300">
      <li>Vue 3 with Composition API</li>
      <li>Vue Router for navigation</li>
      <li>Tailwind CSS for modern and responsive styling</li>
      <li>Easy light/dark theme toggling</li>
    </ul>
    <p class="mt-4 text-gray-700 dark:text-gray-300">
      Use this starter to speed up the development of your Vue.js applications with best practices and the latest technologies.
    </p>
  </div>
  <div class="p-6 max-w-4xl mx-auto">
    <CounterComponent />
  </div>


</template>

<style scoped>

</style>
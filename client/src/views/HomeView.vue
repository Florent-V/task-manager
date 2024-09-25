<script setup>
// Le script reste inchangé
import { ref } from 'vue'

const featuredProducts = ref([
  {
    id: 1,
    name: 'QuantumX Smartphone',
    description: 'Harness the power of quantum computing in your pocket.',
    price: 1299.99,
    image: 'https://placehold.co/600x400'
  },
  {
    id: 2,
    name: 'NeuraPad Pro',
    description: 'A neural interface tablet that responds to your thoughts.',
    price: 1799.99,
    image: 'https://placehold.co/600x400'
  },
  {
    id: 3,
    name: 'HoloHub 360',
    description: 'Transform your living space with full-room holographic projections.',
    price: 899.99,
    image: 'https://placehold.co/600x400'
  }
])
</script>


<template>
  <!-- Main Content -->
  <div class="flex-grow container mx-auto px-4 py-12">
    <section class="mb-20 text-center">
      <h1 class="text-5xl font-bold mb-6 text-blue-800 dark:text-yellow-300">Welcome to TechVerse</h1>
      <p class="text-2xl mb-8 max-w-3xl mx-auto text-gray-700 dark:text-gray-300">Discover the future of technology
        with our cutting-edge gadgets and innovations. Step into a world where tomorrow's tech is today's
        reality.</p>
      <a href="#featured"
         class="bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-8 py-3 rounded-full text-lg inline-block transition duration-300 font-semibold">Explore
        Our Universe</a>
    </section>

    <section id="featured" class="mb-20">
      <h2 class="text-4xl font-semibold mb-10 text-center text-blue-800 dark:text-yellow-300">Featured Tech
        Marvels</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <div v-for="product in featuredProducts" :key="product.id"
             class="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg dark:shadow-gray-700 transition duration-300 transform hover:scale-105 group">
          <div class="relative">
            <img :src="product.image" :alt="product.name" class="w-full h-64 object-cover">
            <div
              class="absolute inset-0 bg-blue-600 dark:bg-yellow-400 bg-opacity-70 dark:bg-opacity-70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
              <button
                class="bg-white dark:bg-gray-900 text-blue-600 dark:text-yellow-400 px-6 py-2 rounded-full font-semibold">
                View Details
              </button>
            </div>
          </div>
          <div class="p-6">
            <h3 class="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{{ product.name }}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-3xl font-bold text-blue-600 dark:text-yellow-400">${{ product.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
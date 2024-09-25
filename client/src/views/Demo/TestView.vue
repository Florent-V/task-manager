<template>
  <div :class="{ 'dark': isDarkMode }">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <nav class="container mx-auto flex justify-between items-center py-4">
        <!-- Logo -->
        <div class="text-2xl font-bold text-gray-800 dark:text-white">
          <router-link to="/">TechArticles</router-link>
        </div>

        <!-- Menu -->
        <ul class="flex space-x-6 text-gray-600 dark:text-gray-300">
          <li><router-link to="/" class="hover:text-gray-900 dark:hover:text-white">Home</router-link></li>
          <li><router-link to="/products" class="hover:text-gray-900 dark:hover:text-white">Produits</router-link></li>
          <li><router-link to="/about" class="hover:text-gray-900 dark:hover:text-white">About</router-link></li>
        </ul>

      
        <!-- Actions -->
        <div class="flex items-center space-x-4">
          <!-- Login/Register Button -->
          <button class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
            <router-link to="/login">Se connecter</router-link>
          </button>

          <!-- Dark/Light Mode Toggle -->
          <button @click="toggleDarkMode" class="text-2xl focus:outline-none">
            <span v-if="isDarkMode">🌙</span>
            <span v-else>☀️</span>
          </button>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 py-12">
      <!-- Introduction Section -->
      <section class="container mx-auto text-center px-4">
        <h1 class="text-4xl font-bold mb-4">Bienvenue chez TechArticles</h1>
        <p class="mb-8 text-lg">
          Découvrez les dernières innovations high-tech à travers nos articles et produits sélectionnés pour les passionnés de technologie.
        </p>
      </section>

      <!-- Featured Products Section -->
      <section class="container mx-auto px-4">
        <h2 class="text-2xl font-semibold mb-6 text-center">Produits en vedette</h2>
        <div class="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <!-- Example Product Card -->
          <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <img src="https://via.placeholder.com/300x200" alt="Product 1" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="text-lg font-semibold">Produit 1</h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">Un gadget révolutionnaire pour votre quotidien technologique.</p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <img src="https://via.placeholder.com/300x200" alt="Product 2" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="text-lg font-semibold">Produit 2</h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">Améliorez votre expérience avec ce produit innovant.</p>
            </div>
          </div>

          <div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <img src="https://via.placeholder.com/300x200" alt="Product 3" class="w-full h-48 object-cover">
            <div class="p-4">
              <h3 class="text-lg font-semibold">Produit 3</h3>
              <p class="mt-2 text-gray-600 dark:text-gray-400">Une technologie avancée pour une performance optimale.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-200 dark:bg-gray-800 py-6">
      <div class="container mx-auto text-center text-gray-600 dark:text-gray-400">
        <p>&copy; 2024 TechArticles. Tous droits réservés.</p>
        <ul class="mt-4 flex justify-center space-x-4">
          <li><a href="#" class="hover:underline">Politique de confidentialité</a></li>
          <li><a href="#" class="hover:underline">Conditions d'utilisation</a></li>
          <li><a href="#" class="hover:underline">Contact</a></li>
        </ul>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// State to track dark mode
const isDarkMode = ref(false);

// Function to toggle dark mode
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};
</script>

<style>
/* Add any additional custom styles here */
</style>

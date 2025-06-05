<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goToToDo = () => {
  router.push('/toDoList');
};

const goToKanban = () => {
  router.push('/kanban');
};
</script>

<template>
  <div class="container mx-auto py-10 px-4">
    <h1 class="text-4xl font-bold text-center mb-10 text-blue-800 dark:text-yellow-300">
      Bienvenue sur votre espace
    </h1>

    <div class="flex flex-col md:flex-row justify-center items-center gap-10">
      <!-- ToDo List Block -->
      <div
          class="w-72 h-72 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700 flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition-transform"
          @click="goToToDo"
      >
        <!-- SVG -->
        <svg class="w-32 h-32 text-blue-600 dark:text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 11H7v2h2v-2zm0-4H7v2h2V7zm0 8H7v2h2v-2zm4-8h8v2h-8V7zm0 4h8v2h-8v-2zm0 4h8v2h-8v-2zM3 5h2v14H3V5z"/>
        </svg>
        <!-- Title -->
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-300">Mes ToDo Lists</h2>
      </div>

      <!-- Kanban Block -->
      <div
          class="w-72 h-72 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700 flex flex-col justify-center items-center cursor-pointer hover:scale-105 transition-transform"
          @click="goToKanban"
      >
        <!-- SVG -->
        <svg class="w-32 h-32 text-blue-600 dark:text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v4h-7V3zm0 7h7v11h-7V10z"/>
        </svg>
        <!-- Title -->
        <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-300">Mes Kanbans</h2>
      </div>
    </div>


  </div>
</template>

<style scoped>
.container {
  max-width: 1200px;
}
</style>

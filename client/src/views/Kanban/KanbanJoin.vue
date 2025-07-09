<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { client } from '@/services/requestMaker.js';
import { hookApi } from "@/services/requestHook.js";
import LoaderComponent from "@/components/LoaderComponent.vue";
import logger from "@/utils/logger.js";

const router = useRouter();
const route = useRoute();
const { isLoading, error, executeRequest } = hookApi();

const successMessage = ref('');

async function joinToDoList() {
  try {
    const data = await executeRequest(() => client.post(`/api/kanban/${route.params.id}/join`))
    logger.debug('data', data);
    successMessage.value = 'Vous avez rejoint le kanban avec succès !';
  } catch (err) {
    logger.error('Error joining ToDoList', err?.response?.data?.message || err.message);
    error.value = "Une erreur s'est produite lors de l'ajout à la kanban.";
  } finally {
    isLoading.value = false;
  }
}

function goToOverview() {
  router.push({ name: 'KanbanOverView' });
}

onMounted(() => {
  joinToDoList();
});
</script>

<template>
  <div class="container mx-auto px-1 py-12 flex justify-center">
    <div class="w-full max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
      <h2 class="text-2xl font-bold text-blue-800 dark:text-yellow-300 mb-4">Rejoindre le Kanban</h2>

      <!-- Message de succès ou d'erreur -->
      <p v-if="successMessage" class="text-green-600 dark:text-green-400 mb-6">{{ successMessage }}</p>
      <p v-else-if="error" class="text-red-600 dark:text-red-400 mb-6">{{ error }}</p>
      <LoaderComponent v-if="isLoading" />

      <!-- Bouton Retour -->
      <button
class="bg-blue-600 dark:bg-yellow-400 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-yellow-500"
              @click="goToOverview">
        Retourner au kanban
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Optionnel : styles spécifiques */
</style>

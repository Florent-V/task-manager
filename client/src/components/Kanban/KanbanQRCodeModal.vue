<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { useRoute } from 'vue-router';

import logger from "@/utils/logger.js";
import { client } from "@/services/requestMaker.js";
import { hookApi } from "@/services/requestHook.js";

const props = defineProps({
  qrCodeUrl: {
    type: String,
    required: true
  },
  linkUrl: {
    type: String,
    required: true
  }
});
const emit = defineEmits(['close']);

const { error, executeRequest } = hookApi();
const route = useRoute();
const copySuccess = ref(false);
const shareEmailError = ref(null);
const successMessage = ref(null);
const emailToShare = ref('');

function closeModal() {
  emit('close');
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.linkUrl);
    copySuccess.value = true;
    setTimeout(() => copySuccess.value = false, 2000); // Cache le message après 2 secondes
  } catch (err) {
    logger.error("Échec de la copie du lien :", err);
    copySuccess.value = false;
  }
}

async function shareByEmail() {
  shareEmailError.value = '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailToShare.value)) {
    shareEmailError.value = 'Format d\'email invalide';
    logger.error('Format d\'email invalide.');
    return;
  }

  try {
    const requestBody = { email: emailToShare.value, linkUrl: props.linkUrl };
    await executeRequest(() => client.post(`/api/kanban/${route.params.id}/share-email`, requestBody));
    logger.info(`Kanban shared successfully with ${emailToShare.value}`);
    successMessage.value = `Kanban partagé avec ${emailToShare.value}`;
    emailToShare.value = ''; // Clear the input after emitting

  } catch (err) {
    logger.error("Erreur lors de l'envoi de l'email :", err);
    shareEmailError.value = 'Erreur lors de l\'envoi de l\'email';
  }
}
</script>

<template>
  <!-- Modal Background -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <!-- Modal Content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 md:w-1/3 max-w-md">

      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-4 dark:border-gray-600">
        <h2 class="text-2xl font-bold text-blue-800 dark:text-yellow-300">
          Partager le tableau Kanban
        </h2>
        <div class="flex space-x-4">
          <button class="text-gray-500 dark:text-gray-300 hover:text-red-500" @click="closeModal">
            <v-icon name="md-close-round" scale="1.2"/>
          </button>
        </div>
      </div>

      <!-- QR Code Image -->
      <div class="flex justify-center my-4">
        <img :src="qrCodeUrl" alt="QR Code pour partage" class="w-48 h-48">
      </div>

      <!-- Email Sharing Section -->
      <div class="mb-6 mt-4">
        <div class="flex">
          <input
              v-model="emailToShare" class="flex-1 border border-gray-300 dark:border-gray-600 p-2 rounded-l w-full max-w-xs mb-0 text-gray-800 dark:bg-gray-700 dark:text-gray-200 focus:ring-yellow-400 focus:border-yellow-400" placeholder="Entrez l'email pour le partage"
              type="email">
          <button
              class="bg-blue-600 dark:bg-yellow-400 text-white px-8 py-2 rounded-r hover:bg-blue-700 dark:hover:bg-yellow-500"
              @click="shareByEmail">
            <v-icon name="ri-mail-send-line" scale="1.2"/>
          </button>
        </div>
        <p v-if="shareEmailError" class="text-red-600 dark:text-red-400 mt-2">{{ shareEmailError }}!</p>
        <p v-if="successMessage" class="text-green-600 dark:text-green-400 mt-2">{{ successMessage }}</p>
      </div>

      <!-- Bouton Copier -->
      <div class="flex flex-col items-center mb-6">
        <button
            class="bg-blue-600 dark:bg-yellow-400 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-yellow-500"
            @click="copyLink">
          Copier le lien
        </button>
        <p v-if="copySuccess" class="text-green-600 dark:text-green-400 mt-2">Lien copié dans le presse-papier !</p>
      </div>

      <p v-if="error" class="my-2 text-center text-red-500 dark:text-red-400">{{ error }}</p>

      <!-- Footer close button -->
      <div class="flex justify-end mt-6">
        <button
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            @click="closeModal"
        >
          Fermer
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Optional: Custom styling */
</style>
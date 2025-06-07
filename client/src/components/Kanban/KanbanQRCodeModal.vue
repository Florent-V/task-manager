<script setup>
import { ref, defineProps, defineEmits } from 'vue';

import logger from "@/utils/logger.js";

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

const emit = defineEmits(['close', 'share-by-email']);
const copySuccess = ref(false);
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

function shareByEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(emailToShare.value)) {
    emit('share-by-email', { email: emailToShare.value });
    logger.info(`Demande de partage par email à : ${emailToShare.value}`);
    emailToShare.value = ''; // Clear the input after emitting
  } else {
    logger.error('Format d\'email invalide.');
    // Optionally, show an error message to the user here
  }
}
</script>

<template>
  <!-- Modal Background -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <!-- Modal Content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 md:w-1/3 max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-center text-blue-800 dark:text-yellow-300">Partager le tableau Kanban</h2>

      <!-- QR Code Image -->
      <div class="flex justify-center mb-6">
        <img :src="qrCodeUrl" alt="QR Code pour partage" class="w-48 h-48">
      </div>

      <!-- Lien et Bouton Copier -->
      <div class="flex flex-col items-center mb-6">
        <button class="bg-blue-600 dark:bg-yellow-400 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-yellow-500" @click="copyLink">
          Copier le lien
        </button>
        <p v-if="copySuccess" class="text-green-600 dark:text-green-400 mt-2">Lien copié dans le presse-papier !</p>
      </div>

      <!-- Email Sharing Section -->
      <div class="flex flex-col items-center mb-6 mt-4">
        <input type="email" v-model="emailToShare" placeholder="Entrez l'email pour le partage" class="border p-2 rounded w-full max-w-xs mb-2 text-gray-800 dark:bg-gray-700 dark:text-gray-200 focus:ring-yellow-400 focus:border-yellow-400">
        <button class="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-700 dark:hover:bg-green-600" @click="shareByEmail">
          Envoyer par Email
        </button>
      </div>

      <!-- Close Button -->
      <div class="text-center">
        <button class="bg-blue-600 dark:bg-yellow-400 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-yellow-500" @click="closeModal">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional: Custom styling */
</style>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

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
const copySuccess = ref(false);

function closeModal() {
  emit('close');
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.linkUrl);
    copySuccess.value = true;
    setTimeout(() => copySuccess.value = false, 2000); // Cache le message après 2 secondes
  } catch (error) {
    console.error("Échec de la copie du lien :", error);
    copySuccess.value = false;
  }
}
</script>

<template>
  <!-- Modal Background -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <!-- Modal Content -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 md:w-1/3 max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-center text-blue-800 dark:text-yellow-300">Partager la ToDoList</h2>

      <!-- QR Code Image -->
      <div class="flex justify-center mb-6">
        <img :src="qrCodeUrl" alt="QR Code pour partage" class="w-48 h-48">
      </div>

      <!-- Lien et Bouton Copier -->
      <div class="flex flex-col items-center mb-6">
        <button @click="copyLink" class="bg-blue-600 dark:bg-yellow-400 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-yellow-500">
          Copier le lien
        </button>
        <p v-if="copySuccess" class="text-green-600 dark:text-green-400 mt-2">Lien copié dans le presse-papier !</p>
      </div>

      <!-- Close Button -->
      <div class="text-center">
        <button @click="closeModal" class="bg-blue-600 dark:bg-yellow-400 text-white px-4 py-2 rounded-full hover:bg-blue-700 dark:hover:bg-yellow-500">
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional: Custom styling */
</style>

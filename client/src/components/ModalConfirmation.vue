<script setup>
const props = defineProps({
  question: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['confirm', 'cancel']);

const confirm = () => emit('confirm');
const cancel = () => emit('cancel');
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 w-full max-w-md rounded-lg shadow-lg p-6">
      <!-- Question -->
      <h3 class="text-xl font-bold text-gray-900 dark:text-yellow-300">{{ question }}</h3>
      <div class="flex justify-end mt-6 space-x-4">
        <!-- Cancel Button -->
        <button
            @click="cancel"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <!-- Confirm Button -->
        <button
            @click="confirm"
            class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Confirmer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ajoutez des styles personnalisés ici si nécessaire */
</style>

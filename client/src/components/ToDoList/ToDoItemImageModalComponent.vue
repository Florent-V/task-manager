<script setup>
import { apiBaseUrl } from "@/utils/requestMaker.js";
const filesApiUrl = `${apiBaseUrl}/api/uploads`;

defineProps({
  imageUrl: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["close"]);

function closeModal() {
  emit("close");
}
</script>

<template>
  <div
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
      @click.self="closeModal"
  >
    <div
        class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-11/12 sm:w-3/4 lg:w-1/2 p-4 relative"
    >
      <!-- Bouton fermer -->
      <button
          @click="closeModal"
          class="absolute top-3 right-3 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
      >
        <v-icon name="md-close" scale="1.2"/>
      </button>

      <!-- Image -->
      <div class="flex justify-center items-center">
        <img
            :src="`${filesApiUrl}/${imageUrl}`"
            alt="Aperçu"
            class="max-w-full max-h-[80vh] rounded-lg"
        />
      </div>
    </div>
  </div>
</template>

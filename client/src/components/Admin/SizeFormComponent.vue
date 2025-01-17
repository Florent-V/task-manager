<script setup>
import { ref, computed, watch } from 'vue';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import useFormErrors from "@/utils/handleFormErrors.js";

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ name: '', label: '', color: '' }),
  },
});

const { isLoading, error, executeRequest } = hookApi();
const formData = ref({ ...props.initialData });
const isEditing = computed(() => !!formData.value.id);

watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? { ...newValue } : { name: '', label: '', color: '' };
    },
    { immediate: true }
);

// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

const submitForm = async () => {
  const data = {
    name: formData.value.name,
    label: formData.value.label,
    color: formData.value.color,
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing to-do
      response = await executeRequest(
          () => client.patch(`/api/size/${formData.value.id}`, data)
      );
    } else {
      // Create new to-do
      response = await executeRequest(
          () => client.post('/api/size', data)
      );
    }
    emit('handleResponse', response);
    closeForm();
  } catch (err) {
    logger.error('Error in form submission', err?.response?.data?.message || err.message);
    setErrors(err);
  }
};

const closeForm = () => {
  resetForm();
  emit('cancel');
};

const resetForm = () => {
  clearErrors();
  formData.value = {
    name: '',
  };
};

</script>


<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">
      {{ isEditing ? 'Modifier un sizing' : 'Ajouter un sizing' }}
    </h2>
    <form @submit.prevent="submitForm">
      <div class="mt-4">
        <label for="name" class="block text-gray-700 dark:text-gray-300">Nom</label>
        <input
            type="text"
            id="name"
            v-model="formData.name"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <p v-if="errors.name" class="text-red-600 dark:text-red-400 mt-1">{{ errors.name }}</p>
      </div>

      <div class="mt-4">
        <label for="label" class="block text-gray-700 dark:text-gray-300">Label</label>
        <input
            type="text"
            id="label"
            v-model="formData.label"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        <p v-if="errors.label" class="text-red-600 dark:text-red-400 mt-1">{{ errors.name }}</p>
      </div>

      <div class="mt-4">
        <label for="color" class="block text-gray-700 dark:text-gray-300">Color</label>
        <div class="flex items-center mt-2">
          <input
              type="color"
              id="color"
              v-model="formData.color"
              class="w-12 h-12 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer"
          />
          <input
              type="text"
              v-model="formData.color"
              class="ml-4 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="#000000"
          />
        </div>
        <p v-if="errors.color" class="text-red-600 dark:text-red-400 mt-1">{{ errors.color }}</p>
      </div>

      <div>
        <p v-if="defaultError" class="text-sm px-2 text-red-600 dark:text-red-400">{{ defaultError }}</p>
      </div>


      <div class="flex justify-end gap-4 mt-6">
        <button
            type="button"
            @click="$emit('cancel')"
            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Annuler
        </button>
        <button
            type="submit"
            class="bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-yellow-500 transition"
        >
          {{ isEditing ? 'Modifier' : 'Ajouter' }}
        </button>
      </div>
    </form>
  </div>

</template>

<style scoped>

</style>
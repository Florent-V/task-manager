<script setup>
import { computed, ref, watch } from 'vue';

import logger from '@/utils/logger.js';
import useFormErrors from '@/utils/handleFormErrors.js';
import { TaskService } from '@/services/taskService.js';
import { hookApi } from "@/services/requestHook.js";

// Props
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: null,
      content: null,
    }),
  },
  taskId: {
    type: String,
    required: true,
  },
  kanbanId: {
    type: String,
    required: true,
  },
});

// Emits
const emit = defineEmits(['handleResponse', 'cancel']);

// Initialize services and data
const taskService = new TaskService();
const {
  isLoading: requestLoading,
  error: requestError,
  executeRequest
} = hookApi();

// Handle Form Data
const formData = ref({ ...props.initialData });
watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? { ...newValue } : { title: '', content: '' };
    },
    { immediate: true }
);
// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

// Computed Properties
const isEditing = computed(() => !!formData.value.id);

// Methods
const submitForm = async () => {
  const data = {
    content: formData.value.content.trim(),
    title: formData.value.title.trim(),
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing comment
      response = executeRequest(() => taskService.editComment(
          props.kanbanId,
          props.taskId,
          formData.value.id,
          data
      ))
    } else {
      // Create new comment
      response = await executeRequest(() => taskService.createComment(
          props.kanbanId,
          props.taskId,
          data
      ));
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
    title: '',
    content: '',
  };
};
</script>

<template>
  <div id="comment-form-section" class="mb-8 p-4 border rounded-lg dark:border-gray-700">
    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
      {{ isEditing ? "Modifier le commentaire" : "Ajouter un commentaire" }}
    </h3>
    <form class="mt-6 space-y-4" @submit.prevent="submitForm">
      <div>
      <textarea
          v-model="formData.content"
          class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          placeholder="Ajouter un commentaire..."
          rows="3"
      ></textarea>
        <p v-if="errors.content" class="text-red-500 dark:text-red-400">{{ errors.content }}</p>
      </div>

      <p v-if="defaultError" class="text-sm px-2 text-red-600 dark:text-red-400">{{ defaultError }}</p>
      <p v-if="requestError" class="text-sm px-2 text-red-600 dark:text-red-400">{{ requestError }}</p>

      <div class="flex space-x-3">
        <button
            class="px-4 py-2 rounded-md bg-blue-600 dark:bg-yellow-400 text-white hover:bg-blue-700 dark:hover:bg-yellow-500"
            type="submit"
        >
          {{ isEditing ? 'Mettre à jour' : 'Enregistrer' }}
        </button>
        <button
            class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none"
            @click="closeForm"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
</template>



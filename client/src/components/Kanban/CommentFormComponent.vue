<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { useHandleRequestStore } from "@/stores/handleRequestStore.js";
import logger from '@/utils/logger.js';
import useFormErrors from '@/utils/handleFormErrors.js';
import { TaskService } from '@/services/taskService.js';

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      content: '',
    }),
  },
  task: {
    type: Object,
    required: true,
  },
});

const handleRequestStore = useHandleRequestStore();
const route = useRoute();
const taskService = new TaskService();
const formData = ref({ ...props.initialData });
// const isEditing = computed(() => !!formData.value.id);
// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });
watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? { ...newValue } : { title: '', description: '', stages: [] };
    },
    { immediate: true }
);

const requestError = computed(() => handleRequestStore.error);

const submitForm = async () => {
  const data = {
    content: formData.value.content.trim(),
    title: formData.value.title.trim(),
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing comment
      response = await taskService.editComment(
          route.params.id,
          props.task.id,
          formData.value.id,
          data
      );
    } else {
      // Create new comment
      response = await taskService.createComment(
          route.params.id,
          props.task.id,
          data
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
    title: '',
    content: '',
  };
};
</script>

<template>
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

    <button
        class="px-4 py-2 rounded-lg bg-blue-600 dark:bg-yellow-400 text-white hover:bg-blue-700 dark:hover:bg-yellow-500"
        type="submit"
    >
      Poster le commentaire
    </button>
  </form>
</template>



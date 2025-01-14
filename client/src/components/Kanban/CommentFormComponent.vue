<script setup>
import { ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import useFormErrors from "@/utils/handleFormErrors.js";

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

const route = useRoute();
const formData = ref({ ...props.initialData });
const isEditing = computed(() => !!formData.value.id);
const { isLoading, error, executeRequest } = hookApi();
// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });


watch(() => props.initialData, (newValue) => {
  formData.value = newValue ? { ...newValue } : { title: '', description: '', stages: [] };
    },
    { immediate: true }
);

const submitForm = async () => {
  const data = {
    content: formData.value.content.trim(),
    title: formData.value.title.trim(),
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing comment
      response = await executeRequest(
          () => client.patch(`/api/kanban/${route.params.id}/task/${formData.value.id}`, data)
      );
    } else {
      // Create new comment
      response = await executeRequest(
          () => client.post(`/api/kanban/${route.params.id}/task/${props.task.id}/comment`, data)
      );
    }
    emit('handleResponse', response);
    closeForm();
  } catch (err) {
    logger.error('Error in form submission', err?.response?.data?.message || err.message);
    console.log("err", err);
    setErrors(err);
    console.log("errors", errors);
    console.log("defaultError", defaultError);
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
  <form @submit.prevent="submitForm" class="mt-6 space-y-4">
          <textarea
              v-model="formData.content"
              rows="3"
              class="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              placeholder="Ajouter un commentaire..."
          ></textarea>
    <button
        type="submit"
        class="px-4 py-2 rounded-lg bg-blue-600 dark:bg-yellow-400 text-white hover:bg-blue-700 dark:hover:bg-yellow-500"
    >
      Poster le commentaire
    </button>
  </form>
</template>



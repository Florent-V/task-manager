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
    default: () => ({ name: '' }),
  },
});

const { isLoading, error, executeRequest } = hookApi();
const formData = ref({ ...props.initialData });
const isEditing = computed(() => !!formData.value.id);

watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? { ...newValue } : { name: '' };
    },
    { immediate: true }
);

// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

const submitForm = async () => {
  const data = {
    name: formData.value.name,
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing to-do
      response = await executeRequest(
          () => client.patch(`/api/todolisttype/${formData.value.id}`, data)
      );
    } else {
      // Create new to-do
      response = await executeRequest(
          () => client.post('/api/todolisttype', data)
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
      {{ isEditing ? 'Ajouter un Type' : 'Créer un Type' }}
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

  <!--
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-700">
    <h2 class="text-gray-700 dark:text-gray-300 text-xl font-semibold mb-4">
      {{ isEditing ? 'Modifier un Type' : 'Créer un Type' }}
    </h2>
    <form @submit.prevent="handleSubmit">
      <div class="relative">
        <input
            type="text"
            id="name"
            placeholder=" "
            class="peer border border-gray-300 dark:border-gray-600 pt-6 pb-2 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            v-model="form.name"
        />
        <label
            for="name"
            class="absolute left-3 top-1 bg-white dark:bg-gray-700 px-1 text-gray-600 dark:text-gray-100 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-100 peer-focus:top-1 peer-focus:left-3 peer-focus:text-blue-600 dark:peer-focus:text-yellow-400"
        >
          Nom du Type
        </label>
      </div>
     <p v-if="errors.name" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.name }}</p>

      <div class="text-right mt-6">
        <button
            type="submit"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          {{ isEditing ? 'Modifier' : 'Créer' }}
        </button>
        <button
            @click.prevent="cancel"
            class="ml-4 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
        >
          Annuler
        </button>
      </div>
    </form>
  </div>
-->
</template>

<style scoped>

</style>
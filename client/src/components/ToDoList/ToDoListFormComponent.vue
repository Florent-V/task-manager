<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import useFormErrors from "@/utils/handleFormErrors.js";

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({ title: '', description: '' }),
  },
});

const { isLoading, error, executeRequest } = hookApi();
const formData = ref({ ...props.initialData });
const isEditing = computed(() => !!formData.value.id);
const toDoListTypes = ref([]);

watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? { ...newValue } : { title: '', description: '', typeId: '' };
    },
    { immediate: true }
);

// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

const submitForm = async () => {
  const data = {
    title: formData.value.title,
    description: formData.value.description,
    typeId: formData.value.typeId,
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing to-do
      response = await executeRequest(
          () => client.patch(`/api/todolist/${formData.value.id}`, data)
      );
    } else {
      // Create new to-do
      response = await executeRequest(
          () => client.post('/api/todolist', data)
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
    description: '',
    typeId: 1,
  };
};

const fetchToDoListTypes = async () => {
  const data = await client.get('/api/todolisttype');
  logger.debug('todolisttype', data);
  toDoListTypes.value = data.toDoListTypes;
  clearErrors();
};

onMounted(fetchToDoListTypes);
</script>

<template>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-700">
    <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold">
      {{ isEditing ? 'Modifier une ToDo List' : 'Créer une ToDo List' }}
    </h2>

    <form @submit.prevent="submitForm">
      <div class="py-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <!-- Name field -->
            <div class="relative">
              <input
                  type="text"
                  id="title"
                  placeholder=" "
                  class="peer border border-gray-300 dark:border-gray-600 pt-6 pb-2 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  v-model="formData.title"
              />
              <label
                  for="title"
                  class="rounded absolute left-3 top-1 bg-white dark:bg-gray-700 px-1 text-gray-600 dark:text-gray-100 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-100 peer-placeholder-shown:bg-transparent peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:top-1 peer-focus:left-3 peer-focus:text-blue-600 dark:peer-focus:text-yellow-400 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:bg-white dark:peer-not-placeholder-shown:bg-gray-700"
              >
                Titre
              </label>
            </div>
            <p v-if="errors.title" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.title }}</p>
          </div>


          <div class="flex flex-col">
            <!-- Select field for ToDoList Type -->
            <div class="m-auto w-full">
              <label for="typeId" class="hidden block mb-2 text-base font-medium text-gray-900 dark:text-white">Type</label>
              <select
                  style="padding:1.1rem"
                  v-model="formData.typeId"
                  id="typeId"
                  class="peer border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option selected disabled value="">Type</option>
                <option v-for="type in toDoListTypes" :key="type.id" :value="type.id">
                  {{ type.name }}
                </option>
              </select>
            </div>
            <p v-if="errors.typeId" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.typeId }}</p>
          </div>

          <!-- Description field -->
          <div class="relative md:col-span-2">
            <textarea
                id="description"
                rows="4"
                placeholder=" "
                class="peer border border-gray-300 dark:border-gray-600 pt-6 pb-2 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                v-model="formData.description"
            ></textarea>
            <label
                for="description"
                class="rounded absolute left-3 top-1 bg-white dark:bg-gray-700 px-1 text-gray-600 dark:text-gray-100 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:left-4 peer-placeholder-shown:text-gray-400 dark:peer-placeholder-shown:text-gray-100 peer-placeholder-shown:bg-transparent peer-focus:bg-white dark:peer-focus:bg-gray-700 peer-focus:top-1 peer-focus:left-3 peer-focus:text-blue-600 dark:peer-focus:text-yellow-400 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:left-3 peer-not-placeholder-shown:bg-white dark:peer-not-placeholder-shown:bg-gray-700"
            >
              Description
            </label>

            <p v-if="errors.description" class="mt-2 text-sm text-red-600 dark:text-red-400">A{{
                errors.description
              }}</p>
            <p v-if="defaultError" class="mt-2 text-sm text-red-600 dark:text-red-400">B{{ defaultError }}</p>

          </div>


          <!-- Add button -->
          <div class="text-right md:text-left flex">
            <button
                type="submit"
                class="w-full m-auto bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-lg text-lg transition duration-300 font-semibold"
            >
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </button>
          </div>

          <!-- Cancel button -->
          <div class="text-center flex">
            <button
                @click="closeForm"
                class="w-full bg-gray-600 text-white px-6 py-3 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
button {
  cursor: pointer;
}
</style>

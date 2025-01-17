<script setup>
import { ref, watch, computed } from 'vue';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import useFormErrors from "@/utils/handleFormErrors.js";
import logger from "@/utils/logger.js";

const { isLoading, error, executeRequest } = hookApi();

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: '',
      description: '',
      stages: [],
    }),
  },
});

// Gestion du formulaire
const formData = ref({ ...props.initialData });
watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? { ...newValue } : { title: '', description: '', stages: [] };
    },
    { immediate: true }
);

const isEditing = computed(() => !!formData.value.id);
// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

const addStatus = () => {
  formData.value.stages.push({ name: '', description: '', maxRecord: 1 });
};

const removeStatus = (index) => {
  formData.value.stages.splice(index, 1);
};

const submitForm = async () => {
  const data = {
    title: formData.value.title,
    description: formData.value.description,
    stages: formData.value.stages.map(({ id, name, description, maxRecord, kanbanId }) => ({
      id,
      name,
      description,
      maxRecord,
      kanbanId,
    })),
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing to-do
      response = await executeRequest(
          () => client.patch(`/api/kanban/${formData.value.id}`, data)
      );
    } else {
      // Create new to-do
      response = await executeRequest(
          () => client.post('/api/kanban', data)
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
    stages: [],
  };
};
</script>

<template>

  <div>
    <h1 class="text-4xl font-bold my-4 text-blue-800 dark:text-yellow-300">Créer un nouveau kanban</h1>
  </div>

  <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg dark:shadow-gray-700">
    <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 mb-2 px-4 py-2 rounded-t-lg text-xl font-semibold">
      {{ isEditing ? 'Kanban - Modification' : 'Kanban - Création' }}
    </h2>

    <form @submit.prevent="submitForm">
      <!-- Titre du Kanban -->
      <div class="mb-4">
        <label for="title" class="block text-gray-700 dark:text-gray-300">Titre</label>
        <input
            type="text"
            maxlength="50"
            id="title"
            v-model="formData.title"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Titre du Kanban"
            required
        />
        <p v-if="errors.title" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.title }}</p>
      </div>

      <!-- Description du Kanban -->
      <div class="mb-4">
        <label for="description" class="block text-gray-700 dark:text-gray-300">Description</label>
        <textarea
            id="description"
            maxlength="250"
            v-model="formData.description"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Description (facultatif)"
        ></textarea>
        <p v-if="errors.description" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.description }}</p>
      </div>

      <!-- Stages dynamiques -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Colonnes</h3>
        <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div
              v-for="(stage, index) in formData.stages"
              :key="index"
              class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <!-- Ligne 1 : Nom et MaxRecord -->
            <div class="flex items-center gap-4">
              <div class="flex-grow">
                <label class="block text-gray-700 dark:text-gray-300">Nom de la colonne</label>
                <input
                    type="text"
                    maxlength="50"
                    v-model="stage.name"
                    placeholder="Nom du statut"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                />
              </div>
              <div class="w-20">
                <label class="block text-gray-700 dark:text-gray-300">Max</label>
                <input
                    type="text"
                    v-model="stage.maxRecord"
                    min="1"
                    max="99"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                    required
                />
              </div>
            </div>

            <!-- Ligne 2 : Description -->
            <div class="mt-4">
              <label for="stageDescription" class="block text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                  id="stageDescription"
                  maxlength="150"
                  v-model="stage.description"
                  placeholder="Description (facultatif)"
                  class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <!-- Bouton Supprimer -->
            <button
                type="button"
                @click="removeStatus(index)"
                class="text-red-600 font-bold mt-4"
            >
              ✖ Supprimer
            </button>
          </div>
        </div>
        <p v-if="errors.stages" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.stages }}</p>

        <!-- Ajouter un statut -->
        <button
            type="button"
            @click="addStatus"
            class="text-blue-600 font-semibold mt-2"
        >
          + Ajouter une colonne
        </button>

        <p v-if="defaultError" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ defaultError }}</p>
      </div>

      <!-- Boutons d'action -->
      <div class="flex justify-end gap-4">
        <button
            @click="closeForm"
            class="w-full bg-gray-600 text-white px-6 py-3 rounded-lg"
        >
          Annuler
        </button>
        <button
            type="submit"
            class="w-full m-auto bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-lg text-lg transition duration-300 font-semibold"
        >
          {{ isEditing ? 'Modifier' : 'Créer' }}
        </button>
      </div>
    </form>
  </div>



</template>



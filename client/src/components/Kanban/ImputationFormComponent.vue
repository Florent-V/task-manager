<script setup>
import { computed, ref, watch } from 'vue';

import { useHandleRequestStore } from "@/stores/handleRequestStore.js";
import logger from '@/utils/logger.js';
import useFormErrors from '@/utils/handleFormErrors.js';
import { TimeParser } from "@/utils/timeParser.js";
import { TaskService } from '@/services/taskService.js';

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      timeSpentString: null,
      comment: null,
      date: null,
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

const handleRequestStore = useHandleRequestStore();
const taskService = new TaskService();
const timeParser = new TimeParser();

const formData = ref({ ...props.initialData });
const imputationFormError = ref(null);

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toISOString().slice(0, 10);
};

watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? {
        ...newValue,
        timeSpentString: timeParser.formatMinutesToTimeString(newValue.timeSpent),
        date: formatDate(newValue.date)
      } : { timeSpentString: null, comment: null, date: null };
    },
    { immediate: true }
);
// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

// Computed Properties
const requestError = computed(() => handleRequestStore.error);
const isEditing = computed(() => !!formData.value.id);
const isImputationFormInvalid = computed(() => {
  if (!formData.value.timeSpentString?.trim()) return true; // Disabled if empty or only spaces
  return !timeParser.validateTimeInput(formData.value.timeSpentString); // Disabled if invalid format
});

// Methods
const checkImputationValue = () => {

  if (isImputationFormInvalid.value) {
    imputationFormError.value = 'Format de temps invalide. Utilisez par ex. "1h 30m" ou "2d".';
    return;
  }
  const timeSpentString = formData.value.timeSpentString.trim();
  const timeSpentInMinutes = timeParser.parseTimeInputToMinutes(timeSpentString);
  if (timeSpentInMinutes <= 0) {
    imputationFormError.value = 'Le temps imputé doit être supérieur à zéro.';
    return;
  }
  imputationFormError.value = null;
  return timeSpentInMinutes;
};


const submitForm = async () => {

  const timeSpentInMinutes = checkImputationValue();

  const data = {
    timeSpent: timeSpentInMinutes,
    comment: formData.value.comment?.trim(),
    date: formData.value.date,
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing comment
      response = await taskService.editImputation(
          props.kanbanId,
          props.taskId,
          formData.value.id,
          data
      );
    } else {
      // Create new comment
      response = await taskService.createImputation(
          props.kanbanId,
          props.taskId,
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
  <div id="imputation-form-section" class="mb-8 p-4 border rounded-lg dark:border-gray-700">
    <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
      {{ isEditing ? "Modifier l'imputation" : "Ajouter une imputation" }}
    </h3>
    <form class="space-y-4" @submit.prevent="submitForm">
      <div class="flex flex-col md:flex-row md:space-x-4">
        <!-- Champ Temps passé -->
        <div class="flex-1">
          <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              for="timeSpentString"
          >
            Temps passé
          </label>
          <input
              id="timeSpentString"
              v-model="formData.timeSpentString"
              class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-200"
              placeholder="ex: 1h 30m ou 2d"
              type="text"
              @blur="checkImputationValue"
          />
          <p v-if="errors.timeSpentString" class="text-red-500 dark:text-red-400">
            {{ errors.timeSpentString }}
          </p>
          <p v-if="imputationFormError" class="text-red-500 dark:text-red-400">
            {{ imputationFormError }}
          </p>
        </div>

        <!-- Champ Date -->
        <div class="flex-1">
          <label
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              for="date"
          >
            Date
          </label>
          <input
              id="date"
              v-model="formData.date"
              class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-200"
              type="date"
          />
          <p v-if="errors.date" class="text-red-500 dark:text-red-400">
            {{ errors.date }}
          </p>
        </div>
      </div>

      <div>
        <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            for="comment"
        >
          Commentaire (optionnel)
        </label>
        <textarea
            id="comment"
            v-model="formData.comment"
            class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:text-gray-200"
            rows="3"
        ></textarea>
        <p v-if="errors.comment" class="text-red-500 dark:text-red-400">{{ errors.comment }}</p>
      </div>

      <p v-if="defaultError" class="text-sm px-2 text-red-600 dark:text-red-400">{{ defaultError }}</p>
      <p v-if="requestError" class="text-sm px-2 text-red-600 dark:text-red-400">{{ requestError }}</p>

      <div class="flex space-x-3">
        <button
            :disabled="isImputationFormInvalid"
            class="px-4 py-2 rounded-md bg-green-600 text-white  hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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




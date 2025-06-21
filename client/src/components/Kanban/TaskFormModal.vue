<script setup>
import { ref, watch, computed, onMounted } from "vue";
import Quill from 'quill';

import 'quill/dist/quill.snow.css';
import { useHandleRequestStore } from "@/stores/handleRequestStore.js";
import logger from "@/utils/logger.js";
import useFormErrors from "@/utils/handleFormErrors.js";
import { TimeParser } from "@/utils/timeParser.js";
import { TaskService } from '@/services/taskService.js';

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({
      title: null,
      description: null,
      estimation: null,
      priorityId: null,
      sizeId: null,
      stageId: null,
      assignedToId: null,
    }),
  },
  users: {
    type: Array,
    required: true,
  },
  priorities: {
    type: Array,
    required: true,
  },
  sizes: {
    type: Array,
    required: true,
  },
  stages: {
    type: Array,
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

// Ref
const editorContainer = ref(null);
const formData = ref({ ...props.initialData });
const estimationFormError = ref(null);

// Gestion du formulaire
const newTask = {
  title: null,
  description: null,
  estimation: null,
  estimationString: null,
  priorityId: null,
  sizeId: null,
  stageId: null,
  assignedToId: null,
};

watch(() => props.initialData, (newValue) => {
      formData.value = newValue
          ? {
            ...newValue,
            estimationString: taskService.formatMinutesToTimeString(newValue.estimation)
          }
          : {
            ...newTask,
            estimationString: null
          };
    },
    { immediate: true }
);
// Utilitaire de gestions des erreurs de formulaire
const { errors, defaultError, setErrors, clearErrors } = useFormErrors({ ...formData.value });

const isEditing = computed(() => !!formData.value.id);
const requestError = computed(() => handleRequestStore.error);
const isEstimationFormInvalid = computed(() => {
  console.log("isEstimationFormInvalid")
  console.log("!formData.value.estimationString?.trim()", !formData.value.estimationString?.trim());
  console.log("!timeParser.validateTimeInput(formData.value.estimationString)", !timeParser.validateTimeInput(formData.value.estimationString));
  if (!formData.value.estimationString?.trim()) return true; // Disabled if empty or only spaces
  return !timeParser.validateTimeInput(formData.value.estimationString); // Disabled if invalid format
});


const checkEstimationValue = () => {

  if (isEstimationFormInvalid.value) {
    estimationFormError.value = 'Format de temps invalide. Utilisez par ex. "1h 30m" ou "2d".';
    return;
  }
  const timeSpentString = formData.value.estimationString.trim();
  const timeSpentInMinutes = timeParser.parseTimeInputToMinutes(timeSpentString);
  if (timeSpentInMinutes <= 0) {
    estimationFormError.value = 'Le temps imputé doit être supérieur à zéro.';
    return;
  }
  estimationFormError.value = null;
  return timeSpentInMinutes;
};

const submitForm = async () => {
  logger.debug("submitForm");
  const estimationTimeInMinutes = checkEstimationValue();

  const data = {
    title: formData.value.title,
    description: formData.value.description,
    estimation: estimationTimeInMinutes,
    priorityId: formData.value.priorityId,
    sizeId: formData.value.sizeId,
    stageId: formData.value.stageId,
    assignedToId: formData.value.assignedToId,
  };

  try {
    let response;
    if (formData.value.id) {
      // Update existing task
      logger.debug("Updating task with ID:", formData.value.id);
      console.log("data", data);
      response = await taskService.editTask(props.kanbanId, formData.value.id, data);
    } else {
      // Create new task
      logger.debug("Creating new task");
      response = await taskService.createTask(props.kanbanId, data);
    }
    emit('handleResponse', response);
    closeForm();
  } catch (err) {
    logger.error('Error in form submission', err?.response?.data?.message || err.message);
    setErrors(err);
  }
};

const closeForm = () => {
  logger.debug("closeForm");
  resetForm();
  emit('cancel');
};

const resetForm = () => {
  logger.debug("resetForm");
  clearErrors();
  formData.value = { ...newTask };
};

onMounted(async () => {
  if (editorContainer.value) {
    const quill = new Quill(editorContainer.value, {
      theme: 'snow',
      placeholder: 'Écris ici...',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image']
        ]
      }
    });

    // Initialiser avec la description reçue (HTML)
    if (props.initialData.description) {
      quill.root.innerHTML = props.initialData.description;
    }

    // Synchroniser le contenu avec formData.description
    quill.on('text-change', () => {
      formData.value.description = quill.root.innerHTML;
    });
  }
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="w-full max-w-6xl max-h-[90vh] p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-auto">
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-4 dark:border-gray-600">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-yellow-300">
          {{ isEditing ? "Modifier la tâche" : "Créer une tâche" }}

        </h2>
        <button class="text-gray-500 dark:text-gray-300 hover:text-red-500" @click="closeForm">
          <v-icon name="md-close"/>
        </button>
      </div>

      <form @submit.prevent="submitForm">
        <!-- Content -->
        <div class="mt-4 space-y-4">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
            <input
                v-model="formData.title"
                class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                placeholder="Titre de la tâche"
                type="text"
            />
            <div v-if="errors.title" class="mt-0 text-sm text-red-600 dark:text-red-400">{{ errors.title }}</div>
          </div>

          <!-- Description -->
          <div class="flex flex-col flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <div
                ref="editorContainer"
                class="flex-1 min-h-[100px] max-h-[40vh] overflow-y-auto border-b border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2 rounded-bl rounded-br"
            ></div>
            <p v-if="errors.description" class="mt-2 text-sm text-red-600 dark:text-red-400">
              {{ errors.description }}
            </p>
          </div>

          <!-- Priority & Assigned -->
          <div class="flex space-x-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorité</label>
              <select
                  v-model="formData.priorityId"
                  class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option selected value=null>Choisir une option</option>
                <option v-for="priority in priorities" :key="priority.id" :value="priority.id">
                  {{ priority.label }}
                </option>
              </select>
              <p v-if="errors.priorityId" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ errors.priorityId }}
              </p>
            </div>

            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignée à</label>
              <select
                  v-model="formData.assignedToId"
                  class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option :value="null" selected>Choisir une option</option>
                <option v-for="member in users" :key="member.id" :value="member.id">
                  {{ member.firstName }} {{ member.lastName }}
                </option>
              </select>
              <p v-if="errors.assignedToId" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ errors.assignedToId }}
              </p>
            </div>

          </div>

          <!-- Size & stage -->
          <div class="flex space-x-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Taille</label>
              <select
                  v-model="formData.sizeId"
                  class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option selected value=null>Choisir une option</option>
                <option v-for="size in sizes" :key="size.id" :value="size.id">
                  {{ size.label }}
                </option>
              </select>
              <p v-if="errors.sizeId" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ errors.sizeId }}</p>
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Colonne :</label>
              <select
                  v-model="formData.stageId"
                  class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option :value="null" selected>Choisir une option</option>
                <option v-for="stage in stages" :key="stage.id" :value="stage.id">
                  {{ stage.name }}
                </option>
              </select>
              <p v-if="errors.stageId" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ errors.stageId }}
              </p>
            </div>
          </div>

          <!-- Estimated Time  -->
          <div class="flex space-x-4">
            <div class="w-1/2">
              <label
                  class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  for="estimationTimeString"
              >
                Temps estimé (h)
              </label>
              <input
                  id="estimationTimeString"
                  v-model="formData.estimationString"
                  class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Temps estimé"
                  type="text"
                  @blur="checkEstimationValue"
              />
              <p v-if="errors.estimation" class="mt-2 text-sm text-red-600 dark:text-red-400">
                {{ errors.estimation }}
              </p>
              <p v-if="estimationFormError" class="text-red-500 dark:text-red-400">
                {{ estimationFormError }}
              </p>
            </div>

          </div>
        </div>

        <!-- Global Error Messages -->
        <p v-if="defaultError" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ defaultError }}</p>
        <p v-if="requestError" class="text-sm text-red-600 dark:text-red-400">{{ requestError }}</p>

        <!-- Footer -->
        <div class="flex justify-end mt-6 space-x-4">
          <button
              class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              @click="closeForm"
          >
            Annuler
          </button>
          <button
              :disabled="isEstimationFormInvalid"
              class="px-4 py-2 rounded-lg bg-blue-600 dark:bg-yellow-400 text-white hover:bg-blue-700 dark:hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
          >
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* Optional styles for modal animations or spacing */
</style>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LoaderComponent from '@/components/LoaderComponent.vue';
import TaskDisplayDetails from '@/components/Kanban/TaskDisplayDetailsComponent.vue';
import ImputationFormComponent from "@/components/Kanban/ImputationFormComponent.vue";
import ModalConfirmation from '@/components/ModalConfirmation.vue';
import { useKanbanStore } from '@/stores/kanbanStore.js';
import { useHandleRequestStore } from "@/stores/handleRequestStore.js";
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import { TimeParser } from "@/utils/timeParser.js";
import logger from '@/utils/logger.js';
import { TaskService } from '@/services/taskService.js';

const route = useRoute();
const router = useRouter();
const kanbanStore = useKanbanStore();
const handleRequestStore = useHandleRequestStore();
const taskService = new TaskService();
const timeParser = new TimeParser();

// Task related state
const kanbanId = ref(route.params.kanbanId);
const taskId = ref(route.params.taskId);
const task = ref(null);
// Imputation State
const showImputationForm = ref(false);
const selectedImputation = ref(null);
const imputations = ref([]);
const showDeleteImputationConfirmation = ref(false);
const imputationToDeleteId = ref(null);

// Computed Properties
const requestLoading = computed(() => handleRequestStore.isLoading);
const requestError = computed(() => handleRequestStore.error);
const totalImputedMinutes = computed(() => imputations.value.reduce((sum, imp) => sum + imp.timeSpent, 0));
const formattedTotalImputedTime = computed(() => timeParser.formatMinutesToTimeString(totalImputedMinutes.value));
const maxValue = computed(() => {
  const estimation = Number(task.value?.estimation) || 0;
  const imputed = Number(totalImputedMinutes.value) || 0;
  return Math.max(imputed, estimation);
});
const estimatedBarWidth = computed(() => {
  return (task.value.estimation / maxValue.value) * 100;
});
const imputedBarWidth = computed(() => {
  return (totalImputedMinutes.value / maxValue.value) * 100;
});
const taskEstimationMinutes = computed(() => task.value?.estimation || 0);
const sortedImputations = computed(() => {
  return [...imputations.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const handleResponseFormSubmit = async (response) => {
  if (selectedImputation.value) {
    // Update existing comment
    const index = imputations.value.findIndex(item => item.id === response.imputation.id);
    imputations.value[index] = response.imputation;
    selectedImputation.value = null;
  } else {
    // Create new comment
    imputations.value.push(kanbanStore.enrichImputation(response.imputation));
  }
};

const openCreateImputationForm = () => {
  selectedImputation.value = null;
  showImputationForm.value = true;
};
const openEditImputationForm = (imputation) => {
  selectedImputation.value = { ...imputation };
  console.log("selectedImputation.value", selectedImputation.value);
  showImputationForm.value = true;
  window.scrollTo({ top: document.getElementById('imputation-form-section')?.offsetTop || 0, behavior: 'smooth' });
};

const closeImputationForm = () => {
  showImputationForm.value = false;
};

function confirmDeleteImputation(imputationId) {
  imputationToDeleteId.value = imputationId;
  showDeleteImputationConfirmation.value = true;
}

function goBackToKanban() {
  router.push(`/kanban/${kanbanId.value}`);
}

// --- API Interaction Functions ---
// Fetch Task Details
async function fetchTask() {
  logger.debug(`Fetching task details for Kanban ID: ${kanbanId.value}, Task ID: ${taskId.value}`);
  try {
    await kanbanStore.initStore(kanbanId.value);
    task.value = kanbanStore.getTaskById(taskId.value);
    if (!task.value) {
      logger.warn(`Task with ID ${taskId.value} not found in Kanban ${kanbanId.value}`);
      // TODO display a user-friendly message or redirect
      return;
    }
    await fetchImputations(); // Fetch imputations after task is loaded
    logger.info('Task details fetched successfully:', task.value);
  } catch (err) {
    requestError.value = `Erreur lors de la recherche de la tâche: ${err.message}`;
    logger.error('Error fetching task details:', err);
  }
}

// Fetch Task's Imputations
async function fetchImputations() {
  logger.debug(`Fetching imputations for task ${taskId.value}`);
  try {
    const data = await taskService.getImputations(kanbanId.value, taskId.value);
    imputations.value = data.imputations || [];
    logger.info('Imputations fetched successfully:', imputations.value);
  } catch (err) {
    logger.error('Error fetching imputations:', err);
  }
}

// Execute deletion of an imputation
async function executeDeleteImputation() {
  if (!imputationToDeleteId.value) return;
  try {
    await taskService.deleteImputation(kanbanId.value, taskId.value, imputationToDeleteId.value);
    logger.info('Imputation deleted successfully');
    // Refresh list and task.value.loggedTime
    await fetchImputations();
  } catch (err) {
    logger.error('Error deleting imputation:', err);
  } finally {
    showDeleteImputationConfirmation.value = false;
    imputationToDeleteId.value = null;
  }
}

onMounted(async () => {
  await fetchTask();
  setTitle(`Task Détails - ${task.value.title}`);
  setDescription(`Kanban - ${task.value.description}`);
});
</script>
<template>
  <div class="container mx-auto p-4">
    <div v-if="requestLoading && !task" class="text-center">
      <LoaderComponent/>
      <p>Loading task details...</p>
    </div>
    <div v-else-if="task">
      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <!-- Header: Title and Back Button -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-yellow-300">{{ task.title }}</h1>
          <button
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
              @click="goBackToKanban"
          >
            Back to Kanban Board
          </button>
        </div>
        <!-- Task Display Details Component -->
        <TaskDisplayDetails :task="task" class="mb-6"/>

        <div class="mb-8 p-4 border rounded-lg dark:border-gray-700">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Suivi du Temps
            </h3>
            <!-- Add button -->
            <div v-if="!showImputationForm" class="text-right">
              <button
                  class="bg-blue-600 dark:bg-yellow-400 text-white px-2 py-2 rounded"
                  @click="openCreateImputationForm"
              >
                <span class="flex items-center">
                  <v-icon name="md-add" scale="1.6"/>
                </span>
              </button>
            </div>
          </div>

          <div class="space-y-2 mb-2">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Temps Estimé:</span>
              <span class="text-gray-600 dark:text-gray-400 ml-2">{{ task.estimationString }}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700 relative">
              <div
                  :style="{ width: estimatedBarWidth + '%' }"
                  class="bg-blue-600 h-6 rounded-full text-xs font-medium text-white text-center p-0.5 leading-none">
                {{ task.estimationString }}
              </div>
            </div>
          </div>

          <div class="space-y-2 mb-2">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Total Imputé:</span>
              <span class="text-gray-600 dark:text-gray-400 ml-2">{{ formattedTotalImputedTime }}</span>
            </div>

            <div class="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700 relative">
              <div
                  :class="{
                    'bg-green-600': totalImputedMinutes <= taskEstimationMinutes,
                    'bg-red-500': totalImputedMinutes > taskEstimationMinutes
                  }"
                  :style="{ width: imputedBarWidth + '%' }"
                  class="h-6 rounded-full text-xs font-medium text-white text-center p-0.5 leading-none">
                {{ formattedTotalImputedTime }}
              </div>
            </div>
          </div>

          <div v-if="totalImputedMinutes > taskEstimationMinutes && taskEstimationMinutes > 0"
               class="text-sm text-red-700 dark:text-red-500">
            Attention: Le temps imputé dépasse le temps estimé.
          </div>
        </div>

        <!-- Imputation Form Section -->
        <ImputationFormComponent
            v-if="showImputationForm"
            :initial-data="selectedImputation"
            :kanban-id="kanbanId"
            :task-id="taskId"
            @cancel="closeImputationForm"
            @handle-response="handleResponseFormSubmit"
        />

        <!-- Imputations List Section -->
        <div class="p-4 border rounded-lg dark:border-gray-700">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Historique des imputations</h3>
          <div v-if="requestLoading && imputations.length === 0" class="text-center">
            <LoaderComponent/>
            <p>Chargement des imputations...</p>
          </div>
          <div v-else-if="imputations.length === 0" class="text-gray-500 dark:text-gray-400">
            Aucune imputation pour cette tâche.
          </div>
          <ul v-else class="space-y-4">
            <li v-for="imputation in sortedImputations" :key="imputation.id"
                class="p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-semibold text-blue-600 dark:text-blue-400">
                    {{ timeParser.formatMinutesToTimeString(imputation.timeSpent) }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    par {{ imputation.user?.firstName || 'Utilisateur' }} {{ imputation.user?.lastName || 'Inconnu' }}
                    le {{ new Date(imputation.date || imputation.createdAt).toLocaleDateString() }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button class="text-sm text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400"
                          title="Modifier"
                          @click="openEditImputationForm(imputation)">
                    <v-icon name="fa-edit" scale="0.9"/>
                  </button>
                  <button class="text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
                          title="Supprimer" @click="confirmDeleteImputation(imputation.id)">
                    <v-icon name="md-delete" scale="0.9"/>
                  </button>
                </div>
              </div>
              <p v-if="imputation.comment" class="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {{ imputation.comment }}</p>
            </li>
          </ul>
        </div>
        <!-- Kanban ID and Task ID - Kept for reference if needed -->
        <div class="mt-8 pt-6 border-t dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <p>Kanban ID: {{ kanbanId }}</p>
          <p>Task ID: {{ taskId }}</p>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-gray-500 dark:text-gray-400 mt-10">
      <p v-if="!requestLoading">Tâche non trouvée ou impossible à charger.</p>
    </div>
    <div v-if="requestError"
         class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
      <span class="font-medium">Error loading task!</span> {{ requestError }}
    </div>
    <!-- Modal Confirmation for Deleting Imputation -->
    <ModalConfirmation
        v-if="showDeleteImputationConfirmation"
        cancelButtonText="Annuler"
        confirmButtonText="Supprimer"
        question="Êtes-vous sûr de vouloir supprimer cette imputation ?"
        @cancel="showDeleteImputationConfirmation = false"
        @confirm="executeDeleteImputation"
    />
  </div>
</template>
<style scoped>
/* Add any specific styles for this page if needed */
.progress-bar-imputed {
  transition: width 0.5s ease-in-out;
}

.whitespace-pre-wrap {
  white-space: pre-wrap; /* Ensures comments respect newlines and spaces */
}
</style>
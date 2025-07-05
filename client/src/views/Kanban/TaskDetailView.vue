<script setup>
import { ref, onMounted, computed , nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LoaderComponent from '@/components/LoaderComponent.vue';
import TaskDisplayDetails from '@/components/Kanban/TaskDisplayDetailsComponent.vue';
import ImputationFormComponent from "@/components/Kanban/ImputationFormComponent.vue";
import CommentFormComponent from "@/components/Kanban/CommentFormComponent.vue";
import ImputationDisplayComponent from "@/components/Kanban/ImputationDisplayComponent.vue";
import CommentDisplayComponent from "@/components/Kanban/CommentDisplayComponent.vue";
import ModalConfirmation from '@/components/ModalConfirmation.vue';
import TaskFormModal from "@/components/Kanban/TaskFormModal.vue";
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
const timeParser = new TimeParser();
const taskService = new TaskService();

// Task related state
const kanbanId = ref(route.params.kanbanId);
const taskId = ref(route.params.taskId);
const task = ref(null);
// Form State
const showImputationForm = ref(false);
const showCommentForm = ref(false);
const selectedImputation = ref(null);
const selectedComment = ref(null);
const showDeleteImputationConfirmation = ref(false);
const showDeleteCommentConfirmation = ref(false);
const imputationToDeleteId = ref(null);
const commentToDeleteId = ref(null);
const showTaskFormModal = ref(false);

// Component refs
const imputationDisplayRef = ref(null);
const commentDisplayRef = ref(null);

// Reactive data from child components
const totalImputedMinutes = ref(0);

// Computed Properties
const users = computed(() => kanbanStore.users);
const stages = computed(() => kanbanStore.stages);
const priorities = computed(() => kanbanStore.priorities);
const sizes = computed(() => kanbanStore.sizes);
const requestLoading = computed(() => handleRequestStore.isLoading);
const requestError = computed(() => handleRequestStore.error);
const taskEstimationMinutes = computed(() => task.value?.estimation || 0);

// Progress bar calculations based on total from child component
const formattedTotalImputedTime = computed(() => 
  timeParser.formatMinutesToTimeString(totalImputedMinutes.value)
);

const maxValue = computed(() => {
  const estimation = Number(task.value?.estimation) || 0;
  const imputed = Number(totalImputedMinutes.value) || 0;
  return Math.max(imputed, estimation);
});

const estimatedBarWidth = computed(() => {
  if (!maxValue.value) return 0;
  return (taskEstimationMinutes.value / maxValue.value) * 100;
});

const imputedBarWidth = computed(() => {
  if (!maxValue.value) return 0;
  return (totalImputedMinutes.value / maxValue.value) * 100;
});

const toggleArchive = async () => {
  try {
    await (task.value.isArchived
            ? taskService.restoreTask(kanbanId.value, taskId.value)
            : taskService.archiveTask(kanbanId.value, taskId.value)
    );
    task.value.isArchived = !task.value.isArchived;
    kanbanStore.editTask(task.value)

  } catch (err) {
    logger.error('Error archiving/unarchiving task from modal:', err);
  }
};

const editTask = () => {
  showTaskFormModal.value = true;
};

const closeTaskFormModal = () => {
  showTaskFormModal.value = false;
};

const handleResponseTaskFormSubmit = async (response) => {
  kanbanStore.editTask(response.task);
  task.value = kanbanStore.getTaskById(response.task.id);
  closeTaskFormModal();
};

const handleResponseImputationFormSubmit = async (response) => {
  if (selectedImputation.value) {
    // Update existing imputation
    imputationDisplayRef.value?.updateImputation(response.imputation);
    selectedImputation.value = null;
  } else {
    // Create new imputation
    console.log("API response", response);
    imputationDisplayRef.value?.addImputation(response.imputation);
  }
};

const handleResponseCommentFormSubmit = async (response) => {
  if (selectedComment.value) {
    // Update existing comment
    commentDisplayRef.value?.updateComment(response.comment);
    selectedComment.value = null;
  } else {
    // Create new comment
    commentDisplayRef.value?.addComment(response.comment);
  }
};

const openCreateCommentForm = async () => {
  selectedComment.value = null;
  showCommentForm.value = true;
  await nextTick(); // Attendre que le DOM soit mis à jour
  window.scrollTo({ top: document.getElementById('comment-form-section')?.offsetTop || 0, behavior: 'smooth' });
};
const openEditCommentForm = async (comment) => {
  selectedComment.value = { ...comment };
  showCommentForm.value = true;
  await nextTick(); // Attendre que le DOM soit mis à jour
  window.scrollTo({ top: document.getElementById('comment-form-section')?.offsetTop || 0, behavior: 'smooth' });
};

const closeCommentForm = () => {
  showCommentForm.value = false;
};

function confirmDeleteComment(commentId) {
  commentToDeleteId.value = commentId;
  showDeleteCommentConfirmation.value = true;
}

const openCreateImputationForm = async () => {
  selectedImputation.value = null;
  showImputationForm.value = true;
  await nextTick(); // Attendre que le DOM soit mis à jour
  window.scrollTo({ top: document.getElementById('imputation-form-section')?.offsetTop || 0, behavior: 'smooth' });
};
const openEditImputationForm = async (imputation) => {
  selectedImputation.value = { ...imputation };
  showImputationForm.value = true;
  await nextTick(); // Attendre que le DOM soit mis à jour
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
      requestError.value = 'Task not found';
      logger.warn(`Task with ID ${taskId.value} not found in Kanban ${kanbanId.value}`);
      // TODO display a user-friendly message or redirect
      return;
    }
    logger.debug('Task details fetched successfully:', task.value);
  } catch (err) {
    requestError.value = `Erreur lors de la recherche de la tâche: ${err.message}`;
    logger.error('Error fetching task details:', err);
  }
}

// Execute deletion of an imputation
async function executeDeleteImputation() {
  if (!imputationToDeleteId.value) return;
  try {
    await imputationDisplayRef.value?.deleteImputation(imputationToDeleteId.value);
  } catch (err) {
    logger.error('Error deleting imputation:', err);
  } finally {
    showDeleteImputationConfirmation.value = false;
    imputationToDeleteId.value = null;
  }
}

async function executeDeleteComment() {
  if (!commentToDeleteId.value) return;
  try {
    await commentDisplayRef.value?.deleteComment(commentToDeleteId.value);
  } catch (err) {
    logger.error('Error deleting comment:', err);
  } finally {
    showDeleteCommentConfirmation.value = false;
    commentToDeleteId.value = null;
  }
}

// Handler for total imputed minutes changes from child component
const handleTotalImputedChanged = (newTotal) => {
  totalImputedMinutes.value = newTotal;
};

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
      <div
          v-if="requestError"
          class="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
        <span class="font-medium">Error loading task!</span> {{ requestError }}
      </div>

      <div class="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <!-- Header: Title and Back Button -->
        <div class="flex justify-between items-center mb-6">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-yellow-300">{{ task.title }}</h1>
          <div class="flex space-x-2">
            <button
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                :title="task.isArchived ? 'Unarchive Task' : 'Archive Task'"
                @click="toggleArchive"
            >
              <v-icon :name="task.isArchived ? 'md-unarchive-outlined' : 'md-archive-outlined'"/>
            </button>
            <button
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                @click="editTask"
            >
              <v-icon name="fa-edit"/>
            </button>
            <button
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
                @click="goBackToKanban"
            >
              <v-icon name="bi-backspace"/>
            </button>
          </div>
        </div>

        <!-- Task Display Details Component -->
        <TaskDisplayDetails :task="task" class="mb-6"/>

        <!-- Time Tracking -->
        <div class="mb-6 p-4 border rounded-lg dark:border-gray-700">
          <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
            Suivi du Temps
          </h3>

          <!-- Estimated Time -->
          <div class="space-y-2 mb-2">
            <div>
              <span class="font-medium text-gray-700 dark:text-gray-300">Temps Estimé:</span>
              <span class="text-gray-600 dark:text-gray-400 ml-2">{{ task.estimationString }}</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-6 dark:bg-gray-700 relative">
              <div
                  :style="{ width: estimatedBarWidth + '%' }"
                  class="bg-blue-600 h-6 rounded-full text-xs font-medium text-white text-center p-0.5 leading-none"
              >
                {{ task.estimationString }}
              </div>
            </div>
          </div>

          <!-- Total Imputed Time -->
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
                  class="h-6 rounded-full text-xs font-medium text-white text-center p-0.5 leading-none"
              >
                {{ formattedTotalImputedTime }}
              </div>
            </div>
          </div>
          <div
              v-if="totalImputedMinutes > taskEstimationMinutes && taskEstimationMinutes > 0"
              class="text-sm text-red-700 dark:text-red-500">
            Attention: Le temps imputé dépasse le temps estimé.
          </div>
        </div>

        <!-- Imputations and Comments Display Section -->
        <div class="flex gap-3 mb-6">
          <ImputationDisplayComponent 
            ref="imputationDisplayRef"
            :kanban-id="kanbanId"
            :task-id="taskId"
            :show-form-button="!showImputationForm"
            @create-imputation="openCreateImputationForm"
            @edit-imputation="openEditImputationForm"
            @delete-imputation="confirmDeleteImputation"
            @total-changed="handleTotalImputedChanged"
          />
          <CommentDisplayComponent 
            ref="commentDisplayRef"
            :kanban-id="kanbanId"
            :task-id="taskId"
            :show-form-button="!showCommentForm"
            @create-comment="openCreateCommentForm"
            @edit-comment="openEditCommentForm"
            @delete-comment="confirmDeleteComment"
          />
        </div>

        <!-- Imputation Form Section -->
        <ImputationFormComponent
            v-if="showImputationForm"
            :initial-data="selectedImputation"
            :kanban-id="kanbanId"
            :task-id="taskId"
            @cancel="closeImputationForm"
            @handle-response="handleResponseImputationFormSubmit"
        />

        <CommentFormComponent
            v-if="showCommentForm"
            :initial-data="selectedComment"
            :kanban-id="kanbanId"
            :task-id="taskId"
            @cancel="closeCommentForm"
            @handle-response="handleResponseCommentFormSubmit"
        />

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

    <TaskFormModal
        v-if="showTaskFormModal"
        :initial-data="task"
        :users="users"
        :kanban-id="kanbanId"
        :priorities="priorities"
        :sizes="sizes"
        :stages="stages"
        @handle-response="handleResponseTaskFormSubmit"
        @cancel="closeTaskFormModal"
    />

    <!-- Modal Confirmation for Deleting Imputation -->
    <ModalConfirmation
        v-if="showDeleteImputationConfirmation"
        cancel-button-text="Annuler"
        confirm-button-text="Supprimer"
        question="Êtes-vous sûr de vouloir supprimer cette imputation ?"
        @cancel="showDeleteImputationConfirmation = false"
        @confirm="executeDeleteImputation"
    />

    <!-- Modal Confirmation for Deleting Comment -->
    <ModalConfirmation
        v-if="showDeleteCommentConfirmation"
        cancel-button-text="Annuler"
        confirm-button-text="Supprimer"
        question="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
        @cancel="showDeleteCommentConfirmation = false"
        @confirm="executeDeleteComment"
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
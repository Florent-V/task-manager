<script setup>
/* eslint-disable vue/no-mutating-props */
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import LoaderComponent from '@/components/LoaderComponent.vue';
import SpinnerComponent from '@/components/Loader/SpinnerComponent.vue';
import ModalConfirmation from '@/components/ModalConfirmation.vue';
import ArchiveToggle from '@/components/Kanban/ArchiveToggle.vue';
import { useKanbanStore } from '@/stores/kanbanStore.js';
import logger from '@/utils/logger.js';
import { hookApi } from "@/services/requestHook.js";
import { TaskService } from '@/services/taskService.js';

// Props
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
});

// Emits
const emit = defineEmits(['close', 'edit', 'delete', 'add-comment']);

// Initialize services and data
const route = useRoute();
const router = useRouter();
const kanbanStore = useKanbanStore();
const taskService = new TaskService();
const {
  isLoading: requestLoading,
  error: requestError,
  executeRequest
} = hookApi();

const {
  error: requestDeleteError,
  executeRequest: executeDeleteRequest
} = hookApi();

// Ref state
const kanbanId = ref(route.params.id);
const comments = ref([]);
const showDeleteConfirmationModal = ref(false);
const archiveError = ref(null);

// Computed
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Utilities
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

// Methods
const closeModal = () => emit('close');
const editTask = () => emit('edit');
const deleteTask = async () => {
  try {
    showDeleteConfirmationModal.value = false;
    await executeDeleteRequest(() => taskService.deleteTask(kanbanId.value, props.task.id));
    emit('delete', props.task.id);
  } catch (err) {
    requestDeleteError.value = `Error deleting task. ${requestDeleteError.value}`;
    logger.error('Error deleting task', err);
  }
};

const openTaskView = () => {
  router.push(`/kanban/${route.params.id}/task/${props.task.id}`);
};

const fetchComments = async () => {
  try {
    const data = await executeRequest(() => taskService.getComments(route.params.id, props.task.id));
    comments.value = kanbanStore.enrichComments(data.comments);
  } catch (err) {
    logger.error('Error fetching comments', err);
  }
};

onMounted(fetchComments);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div
        class="bg-white dark:bg-gray-800 w-full max-w-7xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-4 dark:border-gray-600">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-yellow-300">
          {{ task.title }}
        </h2>
        <div class="flex space-x-4">
          <button class="text-gray-500 dark:text-gray-300 hover:text-blue-500" @click="openTaskView">
            <v-icon name="pr-window-maximize"/>
          </button>
          <button class="text-gray-500 dark:text-gray-300 hover:text-blue-500" @click="editTask">
            <v-icon name="fa-edit"/>
          </button>
          <ArchiveToggle
              :kanban-id="kanbanId"
              :task-id="props.task.id"
              :is-archived="props.task.isArchived"
              @update:is-archived="value => { props.task.isArchived = value; archiveError = null }"
              @error="archiveError = $event"
          >
            <template #default="{ onClick, loading }">
              <button
                  class="text-gray-500 dark:text-gray-300 hover:text-yellow-500"
                  :title="props.task.isArchived ? 'Unarchive Task' : 'Archive Task'"
                  @click="onClick"
              >
                <SpinnerComponent v-if="loading"/>
                <v-icon v-else :name="props.task.isArchived ? 'md-unarchive-outlined' : 'md-archive-outlined'"/>
              </button>
            </template>
          </ArchiveToggle>

          <button
              class="text-gray-500 dark:text-gray-300 hover:text-red-500"
              @click="showDeleteConfirmationModal = true">
            <v-icon name="md-delete"/>
          </button>
        </div>
      </div>

      <p v-if="archiveError" class="mt-2 text-right text-sm text-red-600 dark:text-red-400">
        {{ archiveError }}
      </p>
      <p v-if="requestDeleteError" class="mt-2 text-right text-sm text-red-600 dark:text-red-400">
        {{ requestDeleteError }}
      </p>

      <!-- Task Details -->
      <div class="my-6 space-y-6">
        <!-- Description -->
        <div>
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Description</h3>
          <div class="prose dark:prose-invert mt-2 text-gray-600 dark:text-gray-400" v-html="task.description"></div>
        </div>

        <!-- Additional Information -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Priorité</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.priorityLabel }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Taille</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.sizeLabel }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Assignée à</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.assignedTo }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Colonne</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.stageLabel }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Temps estimé</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.estimationString }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Temps consigné</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ taskService.calculateTimeSpent(task) }}</p>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div class="mb-6 p-4 border rounded-lg dark:border-gray-700">
        <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Commentaires
        </h3>

        <!-- Loader -->
        <div v-if="requestLoading" class="text-center">
          <LoaderComponent/>
          <p>Chargement des commentaires...</p>
        </div>

        <p v-else-if="requestError" class="mt-4 text-red-600 dark:text-red-400">
          {{ requestError }}
        </p>

        <!-- Comments Section -->
        <div v-else class="mt-8">
          <div v-if="comments.length === 0" class="text-gray-500 dark:text-gray-400">
            Aucune imputation pour cette tâche.
          </div>

          <div v-else class="mt-4 space-y-4">
            <div
                v-for="comment in sortedComments" :key="comment.id"
                class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <div class="flex justify-between items-start">
                <div>
                  <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {{ comment.authorName }}
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Le {{ formatDate(comment.createdAt) }}</p>
                </div>
              </div>
              <p class="mt-2 text-gray-600 dark:text-gray-300">{{ comment.content }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end mt-6">
        <button
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
            @click="closeModal"
        >
          Fermer
        </button>
      </div>
    </div>

    <!-- Modale de confirmation -->
    <ModalConfirmation
        v-if="showDeleteConfirmationModal"
        question="Êtes-vous sûr de vouloir supprimer cette tâche ?"
        @cancel="showDeleteConfirmationModal = false"
        @confirm="deleteTask"
    />
  </div>
</template>

<style scoped>
</style>

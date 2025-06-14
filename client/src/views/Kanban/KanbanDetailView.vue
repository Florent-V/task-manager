<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import LoaderComponent from '@/components/LoaderComponent.vue';
import TaskFormModal from '@/components/Kanban/TaskFormModal.vue';
import TaskViewModal from '@/components/Kanban/TaskViewModal.vue';
import QRCodeModal from '@/components/Kanban/KanbanQRCodeModal.vue';
import { useKanbanStore } from '@/stores/kanbanStore.js';
import { useHandleRequestStore } from "@/stores/handleRequestStore.js";
import { useAuthStore } from '@/stores/authStore';
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import logger from '@/utils/logger.js';
import { TaskService } from '@/services/taskService.js';
import { KanbanService} from "@/services/kanbanService.js";

const route = useRoute();
const kanbanStore = useKanbanStore();
const handleRequestStore = useHandleRequestStore();
const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const taskService = new TaskService();
const kanbanService = new KanbanService();

const kanban = computed(() => kanbanStore.kanban);
const stages = computed(() => kanbanStore.stages);
const tasks = computed(() => kanbanStore.tasks);
const priorities = computed(() => kanbanStore.priorities);
const sizes = computed(() => kanbanStore.sizes);
const users = computed(() => kanbanStore.users);
const requestLoading = computed(() => handleRequestStore.isLoading);
const requestError = computed(() => handleRequestStore.error);
const selectedTask = ref(null);
const showTaskModal = ref(false);
const showTaskFormModal = ref(false);
const showQRCodeModal = ref(false);
const qrCodeUrl = ref(null);
const linkUrl = ref(null);
const foldedGroups = ref({});

// Fonctions utilitaires pour la gestion des tâches
const toggleExpand = (assignedToId) => {
  foldedGroups.value[assignedToId] = !foldedGroups.value[assignedToId];
};

const countTasks = (tasks, columnId) => tasks.filter((task) => task.stageId === columnId).length;

const unassignedTasks = computed(() => {
  return tasks.value.filter((task) => task.stageId === null || task.assignedToId === null);
});

const tasksGroupedByAssigned = computed(() => {
  return tasks.value.reduce((acc, task) => {
    if (task.assignedToId === null || task.assignedToId === undefined) {
      return acc; // Ignorer les tâches non assignées
    }

    const id = task.assignedToId;
    if (!acc[id]) {
      acc[id] = [];
    }

    acc[id].push(task);
    return acc;
  }, {});
});

const getTasksByStatus = (tasks, status) => {
  return tasks.filter((task) => task.stageId === status);
};

// Gestion drag and drop
let draggedTask = null;

const handleDragStart = (task) => {
  draggedTask = task;
};
const handleDrop = async (event, columnId, assignedToId) => {
  if (!draggedTask) return;
  const sourceColumn = draggedTask.stageId;
  const targetColumn = stages.value.find((col) => col.id === columnId);

  if (sourceColumn && targetColumn) {
    draggedTask.stageId = columnId;
    draggedTask.assignedToId = assignedToId;
  }
  await updateTaskStage(draggedTask);
  draggedTask = null;
};

// Fonction pour mettre à jour la colonne et le responsable d'une tâche
const updateTaskStage = async (task) => {
  try {
    console.log("task", task);
    await taskService.updateTaskStage(
        task.kanbanId,
        task.id,
        task.stageId,
        task.assignedToId
    );
  } catch (err) {
    logger.error('Error in update stage:', err);
  }
};

const handleResponseFormSubmit = async (response) => {
  if (selectedTask.value.id) {
    // Update existing task
    kanbanStore.editTask(response.task)
    selectedTask.value = kanbanStore.getTaskById(response.task.id);
  } else {
    // Create new task
    kanbanStore.addTask(response.task);
  }
  closeTaskFormModal();
};

const openTaskModal = (task) => {
  selectedTask.value = task;
  showTaskModal.value = true;
};

const openTaskFormModal = (columnId = null) => {
  selectedTask.value = {
    title: '',
    description: '',
    estimation: 0,
    stageId: columnId,
    assignedToId: getCurrentUserId(),
    priorityId: priorities.value[0]?.id || null,
    sizeId: sizes.value[0]?.id || null,
    loggedTime: 0,
  };
  showTaskFormModal.value = true;
};

const editTask = () => {
  showTaskFormModal.value = true;
};

const closeTaskModal = () => {
  showTaskModal.value = false;
  selectedTask.value = null;
};
const closeTaskFormModal = () => {
  showTaskFormModal.value = false;
};

// Delete ToDoItem
const deleteTask = async (id) => {
  try {
    await taskService.deleteTask(route.params.id, id);
    kanbanStore.deleteTask(id);
    closeTaskModal();
  } catch (err) {
    logger.error('Error deleting Tasks:', err?.response?.data?.message || err.message);
  }
};

// Fonction pour partager la ToDoList
const shareKanban = async () => {
  try {
    const data = await kanbanService.shareKanban(route.params.id);
    console.log("sharedata", data);
    qrCodeUrl.value = data.qrCodeUrl;
    linkUrl.value = data.linkUrl;
    showQRCodeModal.value = true;
  } catch (err) {
    logger.error('Error sharing ToDoList:', err?.response?.data?.message || err.message);
  }
};

const getCurrentUserId = () => {
  const connectedUser = users.value.find(u => u.id === user.value.id);
  return connectedUser ? connectedUser.id : null;
};

onMounted(async () => {
  console.log("coucou")
  await kanbanStore.initStore(route.params.id);
  setTitle(`Kanban - ${kanban.value.title}`);
  setDescription(`Kanban - ${kanban.value.description}`);
  console.log("kanban", kanban.value.title);
  console.log("tasks", tasks.value);
});
</script>

<template>
  <!-- Loader -->
  <LoaderComponent v-if="requestLoading && !kanban"/>

  <div class="container mx-auto mb-8 px-1 pt-6 flex-grow flex flex-col">
    <h1 class="text-4xl font-bold mb-8 text-center text-blue-800 dark:text-yellow-300 break-words">
      {{ kanban.title }}
    </h1>

    <div class="flex justify-between align-center items-center px-4 mb-4">
      <div class="prose dark:prose-invert text-gray-600 dark:text-gray-400 break-words">
        <div v-html="kanban.description"></div>
      </div>

      <div class="text-right">
        <button
            class="flex w-14 h-14 bg-blue-600 dark:bg-yellow-400 text-white rounded-full"
            @click="shareKanban"
        >
              <span class="m-auto">
                <v-icon name="md-share-outlined" scale="1.6"/>
              </span>
        </button>
      </div>
    </div>

    <p v-if="requestError" class="my-2 text-center text-red-500 dark:text-red-400">{{ requestError }}</p>

    <div v-for="(taskGroup, assignedToId) in tasksGroupedByAssigned" :key="assignedToId" class="mb-6">
      <!-- En-tête avec le nom de la personne et un bouton pour replier/déplier -->
      <div
          class="flex gap-2 items-center p-4 rounded-lg"
          :class="foldedGroups[assignedToId] ? 'bg-white dark:bg-gray-800' : ''"
      >
        <button class="text-blue-500" @click="toggleExpand(assignedToId)">
          <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
          >
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="foldedGroups[assignedToId] ? 'M9 5l7 7-7 7' : 'M19 9l-7 7-7-7'"
            />
          </svg>
        </button>
        <h2 class="text-xl font-semibold">
          {{ taskGroup[0].assignedTo }} (Total: {{ taskGroup.length }})
        </h2>

      </div>

      <!-- Contenu des tâches, conditionné par l'état de dépliement -->
      <div v-if="!foldedGroups[assignedToId]" class="overflow-x-auto flex-grow">
        <!-- Grille avec colonnes dynamiques -->
        <div
            class="grid gap-4 auto-cols-[minmax(300px,1fr)] grid-flow-col"
            :style="{ gridTemplateColumns: stages.length <= 5 ? `repeat(${stages.length}, minmax(0, 1fr))` : '' }"
        >
          <div
              v-for="column in stages"
              :key="column.id"
              class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 flex flex-col"
          >
            <!-- Column Header -->
            <div class="mb-2">
              <div class="flex justify-between items-center mb">
                <h2 class="text-lg font-bold text-gray-900 dark:text-gray-300">
                  {{ $cropText(column.name, 40) }}
                </h2>
                <span
                    class="bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-yellow-300 rounded-full px-3 py-1 text-sm min-w-14">
                  {{ countTasks(taskGroup, column.id) }} / {{ column.maxRecord }}
              </span>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                {{ $cropText(column.description, 80) }}
              </p>
            </div>

            <!-- Task List -->
            <div
                class="flex-1 space-y-4"
                @drop="handleDrop($event, column.id, Number(assignedToId))"
                @dragover.prevent
            >
              <!-- Placeholder pour permettre le drop dans une colonne vide -->
              <div
                  v-if="!getTasksByStatus(taskGroup, column.id).length"
                  class="border-2 border-dashed border-gray-400 dark:border-gray-600 h-16 flex items-center justify-center"
              >
                <p class="text-sm text-gray-500 dark:text-gray-400">Déposez une tâche ici</p>
              </div>

              <div
                  v-for="task in getTasksByStatus(taskGroup, column.id)"
                  :key="task.id"
                  draggable="true"
                  class="task bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-md dark:hover:shadow-gray-600 cursor-pointer"
                  @dragstart="handleDragStart(task)"
                  @click="openTaskModal(task)"
              >
                <h3 class="font-bold text-gray-900 dark:text-gray-300">
                  {{ $cropText(task.title, 40) }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ $cropText(task.description, 100) }}
                </p>
                <div class="flex justify-between items-center mt-2 text-sm">
                <span
                    class="inline-block text-sm font-medium px-2 py-1 rounded-full"
                    :style="{ backgroundColor: task.priorityColor }"
                >
                  {{ task.priorityLabel }}
                </span>
                  <span
                      class="inline-block text-sm font-medium px-2 py-1 rounded-full"
                      :style="{ backgroundColor: task.sizeColor }"
                  >
                  {{ task.sizeLabel }}
                </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Assignee: {{ task.assignedTo }}</p>
                <div class="flex justify-between items-center text-sm">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Estimation: {{ task.estimation }}</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">Consigné: {{ task.loggedTime }}</p>
                </div>
              </div>
            </div>

            <!-- Add Task Button -->
            <button
                class="mt-4 w-full bg-blue-600 dark:bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 dark:hover:bg-yellow-500"
                @click="openTaskFormModal(column.id)"
            >
              <svg
                  xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Ajouter une tâche</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Unassigned Tasks Section -->
    <div v-if="unassignedTasks.length" class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 my-3 text-center">Tâches en attente</h2>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
              v-for="task in unassignedTasks"
              :key="task.id"
              class="task bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-md dark:hover:shadow-gray-600 cursor-pointer"
              @click="openTaskModal(task)"
          >
            <h3 class="font-bold text-gray-900 dark:text-gray-300">
              {{ $cropText(task.title, 40) }}
            </h3>
            <p class="text-gray-600 dark:text-gray-400">
              {{ $cropText(task.description, 100) }}
            </p>
            <div class="flex justify-between items-center mt-2 text-sm">
              <span
                  class="inline-block text-sm font-medium px-2 py-1 rounded-full"
                  :style="{ backgroundColor: task.priorityColor }"
              >
                {{ task.priorityLabel }}
              </span>
              <span
                  class="inline-block text-sm font-medium px-2 py-1 rounded-full"
                  :style="{ backgroundColor: task.sizeColor }"
              >
                {{ task.sizeLabel }}
              </span>
            </div>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Assignee: {{ task.assignedTo }}</p>
            <div class="flex justify-between items-center text-sm">
              <p class="text-sm text-gray-500 dark:text-gray-400">Estimation: {{ task.estimation }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Consigné: {{ task.loggedTime }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--     Task Modal -->
    <TaskViewModal
        v-if="showTaskModal"
        :task="selectedTask"
        :users="users"
        @close="closeTaskModal"
        @delete="deleteTask"
        @edit="editTask"
    />

    <!-- QRCodeModal -->
    <QRCodeModal
        v-if="showQRCodeModal"
        :link-url="linkUrl"
        :qr-code-url="qrCodeUrl"
        @close="showQRCodeModal = false"
    />

    <TaskFormModal
        v-if="showTaskFormModal"
        :initial-data="selectedTask"
        :users="users"
        :priorities="priorities"
        :sizes="sizes"
        :stages="stages"
        @handle-response="handleResponseFormSubmit"
        @cancel="closeTaskFormModal"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1600px;
}
</style>

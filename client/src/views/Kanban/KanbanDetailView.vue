<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import TaskFormModal from "./TaskFormModal.vue"; // Modale pour afficher/éditer une tâche
import TaskViewModal from '@/views/Kanban/TaskViewModal.vue';
import logger from "@/utils/logger.js";

const route = useRoute();
const { isLoading, error, executeRequest } = hookApi();

// Variables pour le Kanban
const kanban = ref([]);
const stages = ref([]);
const tasks = ref([]);
const sizes = ref([]);
const priorities = ref([]);
const users = ref([]);
// États pour les modales
const selectedTask = ref(null); // Tâche sélectionnée pour modification
const showTaskModal = ref(false); // Contrôle l'affichage de la modale de modification
const showTaskFormModal = ref(false); // Contrôle l'affichage de la modale d'ajout

// Fonction qui compte le nombre de tâches dans une colonne
const countTasks = (columnId) => tasks.value.filter((task) => task.stageId === columnId).length;

const unassignedTasks = computed(() => {
  console.log("computed");
  return tasks.value.filter((task) => task.stageId === null);
}

);

const enrichTask = (task) => {
  return {
    ...task,
    priorityLabel: priorities.value.find((p) => p.id === task.priorityId)?.label || 'Unknown',
    priorityColor: priorities.value.find((p) => p.id === task.priorityId)?.color || 'gray',
    sizeLabel: sizes.value.find((s) => s.id === task.sizeId)?.label || 'Unknown',
    sizeColor: sizes.value.find((s) => s.id === task.sizeId)?.color || 'gray',
    stageLabel: stages.value.find((s) => s.id === task.stageId)?.name || 'Unknown',
    assignedTo: (() => {
      const user = users.value.find((u) => u.id === task.assignedToId);
      return user ? `${user.firstName} ${user.lastName}` : 'Unassigned';
    })(),
  };
};

// Fonction pour enrichir les tasks avec les labels de priorité et de taille
const enrichTasks = (tasks) => {
  return tasks.map((task) => enrichTask(task));
};

// Fonction pour filtrer les tâches par status
const getTasksByStatus = (status) => {
  return tasks.value
      .filter((task) => task.stageId === status);
};

// État pour le drag and drop
let draggedTask = null;

// Gestion du drag and drop
const handleDragStart = (task) => {
  draggedTask = task;
};
const handleDrop = async (event, columnId) => {
  if (!draggedTask) return;
  const sourceColumn = draggedTask.stageId;
  const targetColumn = stages.value.find((col) => col.id === columnId);

  if (sourceColumn && targetColumn) {
    draggedTask.stageId = columnId;
  }
  await updateTaskStage(draggedTask);
  draggedTask = null;
};

// Fonction pour mettre à jour le stage d'une tâche
const updateTaskStage = async (task) => {
  console.log('pre update task', task);
  try {
    const response = await executeRequest(() => client.patch(
        `/api/kanban/${task.kanbanId}/task/${task.id}/`,
        { stageId: task.stageId })
    );
    console.log('response', response);
  } catch (error) {
    console.error('Error:', error);
  }
};

const handleResponseFormSubmit = async (response) => {
  console.log("handleResponseFormSubmit");
  console.log("tasks", tasks.value);
  if (selectedTask.value) {
    console.log("update")
    // Update existing to-do item
    const index = tasks.value.findIndex(item => item.id === response.task.id);
    tasks.value[index] = response.task;
  } else {
    console.log("create")
    // Create new to-do item
    tasks.value.push(enrichTask(response.task));
  }
  console.log("tasks", tasks.value);
  closeTaskFormModal();
};

function openTaskModal(task) {
  selectedTask.value = task;
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
}

function openTaskFormModal() {
  selectedTask.value = null;
  showTaskFormModal.value = true;
}

function closeTaskFormModal() {
  showTaskFormModal.value = false;
}

const fetchKanban = async () => {
  try {
    const data = await executeRequest(() => client.get(`/api/kanban/${route.params.id}/`));
    logger.debug('kanban', data);
    kanban.value = data.kanban;
    stages.value = data.kanban.stages;
    users.value = data.kanban.users;
    tasks.value = enrichTasks(data.kanban.tasks);
  } catch (error) {
    console.error('Error:', error);
  }
};

const fetchPriority = async () => {
  try {
    const data = await executeRequest(() => client.get('/api/priority/'));
    logger.debug('priority', data);
    priorities.value = data.priorities;
  } catch (error) {
    console.error('Error:', error);
  }
};

const fetchSize = async () => {
  try {
    const data = await executeRequest(() => client.get('/api/size/'));
    logger.debug('size', data);
    sizes.value = data.sizes;
  } catch (error) {
    console.error('Error:', error);
  }
};

const fetchData = async () => {
  await fetchPriority();
  await fetchSize();
  await fetchKanban();
};

onMounted(fetchData);

</script>

<template>
  <div class="container mx-auto px-1 py-12">
    <h1 class="text-4xl font-bold mb-8 text-center text-blue-800 dark:text-yellow-300">
      Tableau KanbanModel
    </h1>

    <div class="grid grid-cols-5 gap-4">
      <div
          v-for="column in stages"
          :key="column.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 flex flex-col"
      >
        <!-- Column Header -->
        <div class="mb-2">
          <div class="flex justify-between items-center mb">
            <h2 class="text-lg font-bold text-gray-900 dark:text-gray-300">{{ column.name }}</h2>
            <span
                class="bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-yellow-300 rounded-full px-3 py-1 text-sm">
            {{ countTasks(column.id) }} / {{ column.maxRecord }}
          </span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">{{ column.description }}</p>
        </div>

        <!-- Task List -->
        <div
            class="flex-1 space-y-4"
            @drop="handleDrop($event, column.id)"
            @dragover.prevent
        >
          <!-- Placeholder pour permettre le drop dans une colonne vide -->
          <div
              v-if="!getTasksByStatus(column.id).length"
              class="border-2 border-dashed border-gray-400 dark:border-gray-600 h-16 flex items-center justify-center"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">Déposez une tâche ici</p>
          </div>

          <div
              v-for="task in getTasksByStatus(column.id)"
              :key="task.id"
              draggable="true"
              @dragstart="handleDragStart(task)"
              class="task bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-md dark:hover:shadow-gray-600 cursor-pointer"
              @click="openTaskModal(task)"
          >
            <h3 class="font-bold text-gray-900 dark:text-gray-300">{{ task.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ task.description }}</p>
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
            @click="openTaskFormModal"
            class="mt-4 w-full bg-blue-600 dark:bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 dark:hover:bg-yellow-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Ajouter une tâche</span>
        </button>
      </div>
    </div>

    <!-- Unassigned Tasks Section -->
    <div v-if="unassignedTasks.length" class="mb-8">
      <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">Tâches sans colonne</h2>
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
              v-for="task in unassignedTasks"
              :key="task.id"
              class="task bg-gray-100 dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-md dark:hover:shadow-gray-600 cursor-pointer"
              @click="openTaskModal(task)"
          >
            <h3 class="font-bold text-gray-900 dark:text-gray-300">{{ task.title }}</h3>
            <p class="text-gray-600 dark:text-gray-400">{{ task.description }}</p>
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
        @close="closeTaskModal"
    />

    <TaskFormModal
        v-if="showTaskFormModal"
        :initialData="selectedTask"
        :users="users"
        :priorities="priorities"
        :sizes="sizes"
        :stages="stages"
        @handleResponse="handleResponseFormSubmit"
        @cancel="closeTaskFormModal"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1600px;
}
</style>

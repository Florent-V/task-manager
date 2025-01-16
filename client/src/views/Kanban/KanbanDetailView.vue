<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from '@/utils/requestHook.js';
import logger from '@/utils/logger.js';
import LoaderComponent from '@/components/LoaderComponent.vue';
import TaskFormModal from '@/components/Kanban/TaskFormModal.vue';
import TaskViewModal from '@/components/Kanban/TaskViewModal.vue';

const route = useRoute();
const { isLoading, error, executeRequest } = hookApi();

const kanban = ref([]);
const stages = ref([]);
const tasks = ref([]);
const sizes = ref([]);
const priorities = ref([]);
const users = ref([]);
const selectedTask = ref(null);
const showTaskModal = ref(false);
const showTaskFormModal = ref(false);

// Fonctions utilitaires pour la gestion des tâches
const countTasks = (columnId) => tasks.value.filter((task) => task.stageId === columnId).length;

const unassignedTasks = computed(() => {
  return tasks.value.filter((task) => task.stageId === null);
});

const getTasksByStatus = (status) => {
  return tasks.value
      .filter((task) => task.stageId === status);
};

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

const enrichTasks = (tasks) => {
  return tasks.map((task) => enrichTask(task));
};


// Gestion drag and drop
let draggedTask = null;

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

// Fonction pour mettre à jour la colonne d'une tâche
const updateTaskStage = async (task) => {
  try {
    await executeRequest(() => client.patch(
        `/api/kanban/${task.kanbanId}/task/${task.id}/`,
        { stageId: task.stageId })
    );
  } catch (err) {
    logger.error('Error in update stage:', err);
  }
};

const handleResponseFormSubmit = async (response) => {
  if (selectedTask.value) {
    // Update existing task
    const index = tasks.value.findIndex(item => item.id === response.task.id);
    tasks.value[index] = response.task;
    selectedTask.value = response.task;
  } else {
    // Create new task
    tasks.value.push(enrichTask(response.task));
  }
  closeTaskFormModal();
};

const openTaskModal = (task) => {
  console.log("task", task);
  selectedTask.value = task;
  showTaskModal.value = true;
};

const openTaskFormModal = () => {
  selectedTask.value = null;
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
    await executeRequest(() => client.delete(`/api/kanban/${route.params.id}/task/${id}`));
    tasks.value = tasks.value.filter(i => i.id !== id);
    closeTaskModal();
  } catch (err) {
    logger.error('Error deleting Tasks:', err?.response?.data?.message || err.message);
  }
};

const fetchKanban = async () => {
  try {
    const data = await executeRequest(() => client.get(`/api/kanban/${route.params.id}/`));
    kanban.value = data.kanban;
    stages.value = data.kanban.stages;
    users.value = data.kanban.users;
    tasks.value = enrichTasks(data.kanban.tasks);
  } catch (err) {
    logger.error('Error in fetching kanban data', err);
  }
};

const fetchPriority = async () => {
  try {
    const data = await executeRequest(() => client.get('/api/priority/'));
    priorities.value = data.priorities;
  } catch (err) {
    logger.error('Error in fetching priority data', err);
  }
};

const fetchSize = async () => {
  try {
    const data = await executeRequest(() => client.get('/api/size/'));
    sizes.value = data.sizes;
  } catch (err) {
    logger.error('Error in fetching size data', err);
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
  <div class="container mx-auto px-1 pt-6 flex-grow flex flex-col">
    <h1 class="text-4xl font-bold mb-8 text-center text-blue-800 dark:text-yellow-300 break-words">
      {{ kanban.title }}
    </h1>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 break-words">
      {{ kanban.description }}
    </p>

    <!-- Loader -->
    <LoaderComponent v-if="isLoading"/>

    <div class="overflow-x-auto flex-grow">
      <!-- Grille avec colonnes dynamiques -->
      <div
          class="grid gap-4 auto-cols-[minmax(250px,1fr)] grid-flow-col"
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
                  {{ countTasks(column.id) }} / {{ column.maxRecord }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ $cropText(column.description, 80) }}
            </p>
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
              @click="openTaskFormModal"
              class="mt-4 w-full bg-blue-600 dark:bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 dark:hover:bg-yellow-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
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

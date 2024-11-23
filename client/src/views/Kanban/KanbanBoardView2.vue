<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-blue-800 dark:text-yellow-300 mb-8">Kanban Board</h1>
    <div class="flex gap-6">
      <div
          v-for="column in columns"
          :key="column.id"
          class="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-4 shadow-md"
          @dragover.prevent="handleDragOver(column.id)"
          @drop="handleDrop(column.id)"
      >
        <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">{{ column.name }}</h2>
        <div class="space-y-4">
          <!-- Tâches -->
          <div
              v-for="task in column.tasks"
              :key="task.id"
              class="bg-white dark:bg-gray-700 rounded-lg shadow p-4 cursor-pointer"
              draggable="true"
              @dragstart="handleDragStart(task.id, column.id)"
          >
            <h3 class="font-bold text-blue-800 dark:text-yellow-300">{{ task.title }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ task.description }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">Assignee: {{ task.assignee }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">Due: {{ task.dueDate }}</p>
          </div>

          <!-- Placeholder pour permettre le drop dans une colonne vide -->
          <div
              v-if="!column.tasks.length"
              class="border-2 border-dashed border-gray-400 dark:border-gray-600 h-16 flex items-center justify-center"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">Déposez une tâche ici</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const columns = ref([
  {
    id: 1,
    name: "À faire",
    tasks: [
      { id: 1, title: "Configurer le projet", description: "Initialiser le dépôt Git", assignee: "Alice", dueDate: "2024-11-20" },
      { id: 2, title: "Créer le Kanban", description: "Mettre en place les colonnes", assignee: "Bob", dueDate: "2024-11-22" },
    ],
  },
  {
    id: 2,
    name: "En cours",
    tasks: [
      { id: 3, title: "Coder le backend", description: "API pour gérer les tâches", assignee: "Charlie", dueDate: "2024-11-25" },
    ],
  },
  {
    id: 3,
    name: "Terminé",
    tasks: [],
  },
]);

const draggedTask = ref(null);

const handleDragStart = (taskId, sourceColumnId) => {
  draggedTask.value = { taskId, sourceColumnId };
};

const handleDragOver = (columnId) => {
  // Permet le drop dans la colonne
};

const handleDrop = (targetColumnId) => {
  if (!draggedTask.value) return;

  const { taskId, sourceColumnId } = draggedTask.value;

  // Trouver la tâche et la supprimer de la colonne source
  const sourceColumn = columns.value.find((col) => col.id === sourceColumnId);
  const targetColumn = columns.value.find((col) => col.id === targetColumnId);
  if (sourceColumn && targetColumn) {
    const taskIndex = sourceColumn.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex > -1) {
      const [task] = sourceColumn.tasks.splice(taskIndex, 1);
      targetColumn.tasks.push(task);
    }
  }

  // Réinitialiser l'état de la tâche déplacée
  draggedTask.value = null;
};
</script>

<style scoped>
.container {
  max-width: 1200px;
}

[draggable="true"] {
  cursor: grab;
}

[draggable="true"]:active {
  cursor: grabbing;
}
</style>

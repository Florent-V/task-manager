<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-center text-blue-800 dark:text-yellow-300 mb-8">
      Tableau KanbanModel
    </h1>
    <div class="flex gap-4 overflow-auto">
      <div
          v-for="column in columns"
          :key="column.id"
          class="flex flex-col w-80 bg-gray-100 dark:bg-gray-800 rounded-lg shadow p-4"
      >
        <h2 class="text-2xl font-semibold text-gray-700 dark:text-gray-300 mb-4">{{ column.name }}</h2>
        <div class="space-y-4">
          <div
              v-for="task in getTasksByStatus(column.id)"
              :key="task.id"
              draggable="true"
              @dragstart="startDrag(task)"
              @dragend="endDrag"
              @dragover.prevent
              @drop="dropTask(column.id)"
              class="bg-white dark:bg-gray-700 p-4 rounded-lg shadow cursor-grab hover:shadow-lg transition"
          >
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">{{ task.title }}</h3>
            <p class="text-gray-600 dark:text-gray-300 text-sm mb-2">{{ task.description }}</p>
            <span
                class="inline-block text-xs font-medium px-2 py-1 rounded-full"
                :class="task.priority === 'High'
                ? 'bg-red-500 text-white'
                : task.priority === 'Medium'
                ? 'bg-yellow-500 text-white'
                : 'bg-green-500 text-white'"
            >
              {{ task.priority }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

// Colonnes du tableau KanbanModel
const columns = reactive([
  { id: 'todo', name: 'À faire' },
  { id: 'in_progress', name: 'En cours' },
  { id: 'review', name: 'En revue' },
  { id: 'done', name: 'Terminé' },
]);

// Données fictives
const tasks = reactive([
  {
    id: 1,
    title: 'Créer un backend API',
    description: 'Mettre en place les endpoints CRUD pour la gestion des utilisateurs.',
    status: 'todo',
    priority: 'High',
  },
  {
    id: 2,
    title: 'Configurer la base de données',
    description: 'Initialiser Sequelize avec les modèles nécessaires.',
    status: 'in_progress',
    priority: 'Medium',
  },
  {
    id: 3,
    title: 'Révision du code',
    description: 'Effectuer une revue du code pour les nouvelles fonctionnalités.',
    status: 'review',
    priority: 'Low',
  },
  {
    id: 4,
    title: 'Déploiement en production',
    description: 'Déployer la nouvelle version de l’application sur le serveur.',
    status: 'done',
    priority: 'High',
  },
]);

// Gestion des tâches lors du drag & drop
let draggedTask = null;

const startDrag = (task) => {
  draggedTask = task;
};

const endDrag = () => {
  draggedTask = null;
};

const dropTask = (columnId) => {
  if (draggedTask) {
    draggedTask.status = columnId;
  }
};

// Filtrer les tâches en fonction de leur colonne
const getTasksByStatus = (status) => tasks.filter((task) => task.status === status);
</script>

<style scoped>
.container {
  max-width: 1200px;
}

[draggable] {
  user-select: none;
}

[draggable]:hover {
  cursor: grab;
}
</style>

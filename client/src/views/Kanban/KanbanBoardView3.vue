<script setup>
import { ref } from "vue";
import TaskModal from "./TaskModal.vue"; // Modale pour afficher/éditer une tâche

// États pour les modales
const selectedTask = ref(null); // Tâche sélectionnée pour modification
const showTaskModal = ref(false); // Contrôle l'affichage de la modale de modification
const showAddTaskModal = ref(false); // Contrôle l'affichage de la modale d'ajout

// Exemple de colonnes et tâches
const columns = ref([
  { id: 1, name: "Backlog", description: "Tâches à faire", maxRecords: 5 },
  { id: 2, name: "Ready", description: "Tâches prêtes à être réalisées", maxRecords: 5 },
  { id: 3, name: "In Progress", description: "Tâches en cours de réalisation", maxRecords: 5 },
  { id: 4, name: "In Review", description: "Tâches en cours de revue", maxRecords: 5 },
  { id: 5, name: "Done", description: "Tâches terminées", maxRecords: 5 },
]);

// Exemple de fausse tâche
const sampleTask = {
  id: 1,
  title: "Créer l'interface Kanban",
  description: "Concevoir l'interface pour le tableau Kanban",
  priority: "High",
  size: "Medium",
  estimation: 4,
  loggedTime: 2,
  assignedTo: "Jean Dupont",
};
// Tableau de tâches : 6 taches
const tasks = ref([
  {
    id: 1,
    title: "Créer l'interface Kanban",
    description: "Concevoir l'interface pour le tableau Kanban",
    priorityId: 1,
    sizeId: 2,
    statusId: 2,
    estimation: 4,
    loggedTime: 2,
    assignedTo: "Jean Dupont",
  },
  {
    id: 2,
    title: "Ajouter le drag and drop",
    description: "Permettre le déplacement des tâches entre les colonnes",
    priorityId: 2,
    sizeId: 2,
    statusId: 5,
    estimation: 2,
    loggedTime: 0,
    assignedTo: "Alice Martin",
  },
  {
    id: 3,
    title: "Implémenter le backend",
    description: "Créer les routes et les contrôleurs pour le backend",
    priorityId: 3,
    sizeId: 3,
    statusId: 4,
    estimation: 8,
    loggedTime: 4,
    assignedTo: "Bob Smith",
  },
  {
    id: 4,
    title: "Tester l'application",
    description: "Effectuer des tests unitaires et fonctionnels",
    priorityId: 1,
    sizeId: 2,
    statusId: 3,
    estimation: 6,
    loggedTime: 1,
    assignedTo: "Charlie Brown",
  },
  {
    id: 5,
    title: "Déployer l'application",
    description: "Mettre en ligne l'application sur un serveur",
    priorityId: 3,
    sizeId: 4,
    statusId: 2,
    estimation: 4,
    loggedTime: 0,
    assignedTo: "David Johnson",
  },
  {
    id: 6,
    title: "Ajouter des fonctionnalités",
    description: "Ajouter des fonctionnalités supplémentaires à l'application",
    priorityId: 1,
    sizeId: 5,
    statusId: 1,
    estimation: 10,
    loggedTime: 2,
    assignedTo: "Eva Williams",
  },
]);

// fonction qui compte le nombre de tâches dans une colonne
const countTasks = (columnId) => tasks.value.filter((task) => task.statusId === columnId).length;

// Filtrer les tâches en fonction de leur colonne
const getTasksByStatus = (status) => tasks.value.filter((task) => task.statusId === status);

// État pour le drag and drop
let draggedTask = null;

// Gestion du drag and drop
const handleDragStart = (task) => {
  draggedTask = task;
};
const handleDrop = (event, columnId) => {
  if (!draggedTask) return;
  const sourceColumn = draggedTask.statusId;
  const targetColumn = columns.value.find((col) => col.id === columnId);

  if (sourceColumn && targetColumn) {
    draggedTask.statusId = columnId;
  }
  draggedTask = null;
};

// Ajouter une nouvelle tâche
const addTask = (columnId) => {
  const newTask = {
    id: Date.now(),
    title: "Nouvelle tâche",
    description: "Description de la tâche",
    priority: "Medium",
    size: "Small",
    estimation: 2,
    loggedTime: 0,
    assignedTo: "Non assigné",
  };
  const column = columns.value.find((col) => col.id === columnId);
  if (column) column.tasks.push(newTask);
};

// Ouvrir la modale de tâche
// const openTaskModal = (task) => {
//   selectedTask.value = task;
// };

function openTaskModal(task) {
  console.log('task', task);
  selectedTask.value = task;
  showTaskModal.value = true;
}

function closeTaskModal() {
  showTaskModal.value = false;
}

function openAddTaskModal() {
  selectedTask.value = {
    title: "",
    description: "",
    priorityId: "",
    sizeId: "",
    estimatedTime: "",
    loggedTime: "",
    assignedToId: "",
  }; // Tâche vide pour création
  showAddTaskModal.value = true;
}

function closeAddTaskModal() {
  showAddTaskModal.value = false;
}

function saveTask(newTask) {
  console.log('newTask', newTask);
  if (showAddTaskModal.value) {
    // Ajouter la nouvelle tâche
    tasks.push(newTask); // `tasks` doit être défini dans ton code comme la liste des tâches
  } else if (showTaskModal.value) {
    // Mettre à jour la tâche existante
    Object.assign(
        tasks.find((t) => t.id === newTask.id),
        newTask
    );
  }
  closeTaskModal();
  closeAddTaskModal();
}

</script>

<template>
  <div class="container mx-auto px-1 py-12">
    <h1 class="text-4xl font-bold mb-8 text-center text-blue-800 dark:text-yellow-300">Tableau KanbanModel</h1>
    <div class="grid grid-cols-5 gap-4">
      <div
          v-for="column in columns"
          :key="column.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 p-4 flex flex-col"
      >
        <!-- Column Header -->
        <div class="mb-2">
          <div class="flex justify-between items-center mb">
            <h2 class="text-lg font-bold text-gray-900 dark:text-gray-300">{{ column.name }}</h2>
            <span
                class="bg-blue-100 dark:bg-gray-700 text-blue-600 dark:text-yellow-300 rounded-full px-3 py-1 text-sm">
            {{ countTasks(column.id) }} / {{ column.maxRecords }}
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
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ task.description }}</p>
            <div class="flex justify-between items-center mt-2 text-sm">
              <span class="text-gray-500 dark:text-gray-400">{{ task.priority }}</span>
              <span class="text-gray-500 dark:text-gray-400">{{ task.size }}</span>
            </div>
          </div>
        </div>

        <!-- Add Task Button -->
        <button
            @click="openAddTaskModal"
            class="mt-4 w-full bg-blue-600 dark:bg-yellow-400 text-white py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 dark:hover:bg-yellow-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          <span>Ajouter une tâche</span>
        </button>
      </div>
    </div>

    <!-- Task Modal -->
    <TaskModal
        v-if="showTaskModal"
        :task="selectedTask"
        @close="closeTaskModal"
        @save="saveTask"
    />

    <TaskModal
        v-if="showAddTaskModal"
        :task="selectedTask"
        @close="closeAddTaskModal"
        @save="saveTask"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1600px;
}
</style>

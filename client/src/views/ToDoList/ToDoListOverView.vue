<script setup>
import { ref, onMounted } from 'vue';
import { client } from '@/utils/requestMaker.js';
import { hookApi} from "@/utils/requestHook.js";
import ToDoListFormComponent from "@/components/ToDoList/ToDoListFormComponent.vue";
import LoaderComponent from "@/components/LoaderComponent.vue";

const { isLoading, data, error, executeRequest } = hookApi();

const toDoLists = ref([]);
const showForm = ref(false);
const selectedToDo = ref(null); // For editing

const handleFormSubmit = async (data) => {
  if (selectedToDo.value) {
    // Update existing to-do
    const response = await client.patch(`/api/todolist/${selectedToDo.value.id}`, data);
    const index = toDoLists.value.findIndex(list => list.id === response.toDoList.id);
    toDoLists.value[index] = response.toDoList;
  } else {
    // Create new to-do
    console.log('new data', data);
    const response = await client.post('/api/todolist', data);
    toDoLists.value.push(response.toDoList);
  }
  closeForm();
};

const openCreateForm = () => {
  selectedToDo.value = null;
  showForm.value = true;
};
const openEditForm = (list) => {
  selectedToDo.value = {...list};
  showForm.value = true;
};

const deleteList = async (list) => {
  await client.delete(`/api/todolist/${list.id}`);
  toDoLists.value = toDoLists.value.filter(item => item.id !== list.id);
};

const closeForm = () => {
  selectedToDo.value = null;
  showForm.value = false;
};

const fetchToDoLists = async () => {
  console.log('fetchToDoLists');
  // const data = await client.get('/api/todolist');
  const data = await executeRequest(() => client.get('/api/todolist'));
  console.log('todolist', data);
  toDoLists.value = data.toDoLists;
};

onMounted(fetchToDoLists);

</script>

<template>

  <div class="container mx-auto px-4 py-12">
    <div class="flex justify-between items-center mb-6 px-6">
      <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">Mes ToDo Listes</h1>
      <!-- Add button -->
      <div v-if="!showForm" class="text-right">
        <button @click="openCreateForm" class="bg-blue-600 dark:bg-yellow-400 text-white px-3 py-3 rounded-full">
          <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clip-rule="evenodd"/>
          </svg>
        </span>
        </button>
      </div>
    </div>

    <!-- ToDoForm -->
    <ToDoListFormComponent
        v-if="showForm"
        :initialData="selectedToDo"
        @submit="handleFormSubmit"
        @cancel="closeForm"
    />

    <!--    spacing div -->
    <div class="h-6"></div>

    <!-- Loader -->
    <LoaderComponent v-if="isLoading" />

    <div v-else class="w-full bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-700">
      <!-- Title Table -->
      <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold">
        ToDo Listes</h2>

      <div class="overflow-x-auto py-4">
        <table class="min-w-full table-auto">
          <thead>
          <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-md">
            <th class="px-6 py-3 text-left">Titre</th>
            <th class="px-6 py-3 text-left hidden md:table-cell">Description</th>
            <th class="px-6 py-3 text-center">Type</th>
            <th class="px-6 py-3 text-center">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="list in toDoLists" :key="list.id" class="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300">
              {{ list.title }}
            </td>
            <td class="hidden md:table-cell border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300">
              {{ list.description }}
            </td>
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300">
              {{ list.type.name }}
            </td>
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-center">
              <button @click="openEditForm(list)"
                      class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 mr-2">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="deleteList(list)"
                      class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 mr-2">
                <i class="fas fa-trash-alt"></i>
              </button>
              <RouterLink :to="`/toDoList/${list.id}`">
                <button class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                  <i class="fas fa-eye"></i>
                </button>
              </RouterLink>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>


<style scoped>
/* Optional styles to make it look nicer */
.container {
  max-width: 1200px;
}

button {
  cursor: pointer;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}
</style>

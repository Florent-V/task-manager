<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";

const { isLoading, error, executeRequest } = hookApi();

const router = useRouter();
const kanbans = ref([]);
const showForm = ref(false);
const selectedKanban = ref(null); // For editing

const handleResponseFormSubmit = async (response) => {
  if (selectedKanban.value) {
    // Update existing to-do
    const index = kanbans.value.findIndex(k => k.id === response.kanban.id);
    kanbans.value[index] = response.kanban;
  } else {
    kanbans.value.push(response.kanban);
  }
  closeForm();
};

const openCreateForm = () => {
  selectedKanban.value = null;
  showForm.value = true;
};
const openEditForm = (list) => {
  selectedKanban.value = { ...list };
  showForm.value = true;
};

const deleteKanban = async (kanban) => {
  try {
    await executeRequest(() => client.delete(`/api/kanban/${kanban.id}`));
    kanbans.value = kanbans.value.filter(k => k.id !== kanban.id);
  } catch (err) {
    logger.error("Error deleting to-do list", err?.response?.data?.message || err.message);
  }
};

const closeForm = () => {
  selectedKanban.value = null;
  showForm.value = false;
};

const fetchKanbans = async () => {
  try {
    const data = await executeRequest(() => client.get('/api/kanban'));
    logger.debug('todolist', data);
    kanbans.value = data.kanbans;
  } catch (err) {
    logger.error("Error fetching to-do lists", err?.response?.data?.message || err.message);
  }
};

const redirectToItem = (id) => {
  router.push(`/toDoList/${id}`);
};

onMounted(fetchKanbans);

</script>

<template>

  <div class="container mx-auto px-1 py-12">
    <div class="flex justify-between items-center mb-6 px-6">
      <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">Mes Kanbans</h1>
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
<!--    <ToDoListFormComponent-->
<!--        v-if="showForm"-->
<!--        :initialData="selectedToDo"-->
<!--        @handleResponse="handleResponseFormSubmit"-->
<!--        @cancel="closeForm"-->
<!--    />-->

    <!--    spacing div -->
    <div class="h-6"></div>

    <!-- Loader -->
    <LoaderComponent v-if="isLoading"/>

    <div v-if="kanbans.length" class="w-full bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg dark:shadow-gray-700">

      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
          <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-md">
            <th class="px-6 py-3 text-left">Titre</th>
            <th class="px-6 py-3 text-left hidden md:table-cell">Description</th>
            <th class="px-6 py-3 text-center w-[5rem]">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="list in toDoLists" :key="list.id" class="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <td
                class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
                @click="redirectToItem(list.id)"
            >
              {{ list.title }}
            </td>
            <td
                class="hidden md:table-cell border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
                @click="redirectToItem(list.id)"
            >
              {{ list.description }}
            </td>
            <td
                class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
                @click="redirectToItem(list.id)"
            >
              {{ list.type.name }}
            </td>
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-center">
              <div class="flex justify-around">
                <button @click="openEditForm(list)"
                        class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteList(list)"
                        class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="!isLoading && !toDoLists.length">
      <p class="text-center text-gray-700 dark:text-gray-300 text-xl">Aucune Liste trouvée</p>
    </div>

    <div v-if="error">
      <p class="text-center text-red-700 dark:text-red-300 text-xl">{{ error }}</p>
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

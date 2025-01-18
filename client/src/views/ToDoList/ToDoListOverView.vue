<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import ToDoListFormComponent from "@/components/ToDoList/ToDoListFormComponent.vue";
import LoaderComponent from "@/components/LoaderComponent.vue";

const { isLoading, error, executeRequest } = hookApi();

const router = useRouter();
const toDoLists = ref([]);
const showForm = ref(false);
const selectedToDo = ref(null); // For editing

const handleResponseFormSubmit = async (response) => {
  if (selectedToDo.value) {
    // Update existing to-do
    const index = toDoLists.value.findIndex(list => list.id === response.toDoList.id);
    toDoLists.value[index] = response.toDoList;
  } else {
    toDoLists.value.push(response.toDoList);
  }
  closeForm();
};

const openCreateForm = () => {
  selectedToDo.value = null;
  showForm.value = true;
};
const openEditForm = (list) => {
  selectedToDo.value = { ...list };
  showForm.value = true;
};

const deleteList = async (list) => {
  try {
    await executeRequest(() => client.delete(`/api/todolist/${list.id}`));
    toDoLists.value = toDoLists.value.filter(item => item.id !== list.id);
  } catch (err) {
    logger.error("Error deleting to-do list", err?.response?.data?.message || err.message);
  }
};

const closeForm = () => {
  selectedToDo.value = null;
  showForm.value = false;
};

const fetchToDoLists = async () => {
  try {
    const data = await executeRequest(() => client.get('/api/todolist'));
    logger.debug('todolists', data);
    toDoLists.value = data.toDoLists;
  } catch (err) {
    logger.error("Error fetching to-do lists", err?.response?.data?.message || err.message);
  }
};

const redirectToItem = (id) => {
  router.push(`/toDoList/${id}`);
};

onMounted(fetchToDoLists);

</script>

<template>

  <div class="container mx-auto px-1 py-12">
    <div class="flex justify-between items-center mb-6 px-6">
      <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">Mes ToDo Listes</h1>
      <!-- Add button -->
      <div v-if="!showForm" class="text-right">
        <button @click="openCreateForm" class="bg-blue-600 dark:bg-yellow-400 text-white px-2 py-2 rounded-full">
          <span class="flex items-center">
          <v-icon name="md-add" scale="1.6" />
        </span>
        </button>
      </div>
    </div>

    <!-- ToDoForm -->
    <ToDoListFormComponent
        v-if="showForm"
        :initialData="selectedToDo"
        @handleResponse="handleResponseFormSubmit"
        @cancel="closeForm"
    />

    <!--    spacing div -->
    <div class="h-6"></div>

    <!-- Loader -->
    <LoaderComponent v-if="isLoading"/>

    <div v-if="toDoLists.length" class="w-full bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg dark:shadow-gray-700">

      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
          <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-md">
            <th class="px-6 py-3 text-left">Titre</th>
            <th class="px-6 py-3 text-left hidden md:table-cell">Description</th>
            <th class="px-6 py-3 text-center">Type</th>
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
                    <v-icon name="fa-edit" scale="1.2" />
                  </button>
                  <button @click="deleteList(list)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                    <v-icon name="fa-regular-trash-alt" scale="1.2" />
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

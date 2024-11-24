<script setup>
import { ref, onMounted } from 'vue';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import LoaderComponent from "@/components/LoaderComponent.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import ToDoListTypeFormComponent from "@/components/Admin/ToDoListTypeFormComponent.vue";

const { isLoading, error, executeRequest } = hookApi();

const toDoListTypes = ref([]);
const showForm = ref(false);
const loading = ref(false);
const selectedToDoListTypes = ref(null);

const handleResponseFormSubmit = async (response) => {
  if (selectedToDoListTypes.value) {
    // Update existing to-do
    const index = toDoListTypes.value.findIndex(list => list.id === response.toDoListType.id);
    toDoListTypes.value[index] = response.toDoListType;
  } else {
    toDoListTypes.value.push(response.toDoListType);
  }
  closeForm();
};

const deleteList = async (list) => {
  try {
    await executeRequest(() => client.delete(`/api/todolisttype/${list.id}`));
    toDoListTypes.value = toDoListTypes.value.filter(item => item.id !== list.id);
  } catch (err) {
    logger.error("Error deleting to-do list", err?.response?.data?.message || err.message);
  }
};

const openCreateForm = () => {
  selectedToDoListTypes.value = null;
  showForm.value = true;
};
const openEditForm = (list) => {
  selectedToDoListTypes.value = { ...list };
  showForm.value = true;
};

const closeForm = () => {
  selectedToDoListTypes.value = null;
  showForm.value = false;
};

const fetchTypes = async () => {
  loading.value = true;
  try {
    const data = await executeRequest(() => client.get('/api/todolisttype'));
    logger.debug('todolist types', data);
    toDoListTypes.value = data.toDoListTypes;
  } catch (err) {
    logger.error("Error fetching to-do lists", err?.response?.data?.message || err.message);
    error.value = err?.response?.data?.message || err.message;
  }
};

onMounted(fetchTypes);
</script>

<template>

  <div class="container mx-auto px-1 py-12">
    <div class="flex justify-between items-center mb-6 px-6">
      <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">Types de Liste</h1>
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

    <div v-if="toDoListTypes.length" class="w-full bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg dark:shadow-gray-700">

      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
          <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-md">
            <th class="px-6 py-3 text-left">id</th>
            <th class="px-6 py-3 text-left hidden md:table-cell">Nom du type</th>
            <th class="px-6 py-3 text-center w-[5rem]">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="type in toDoListTypes" :key="type.id" class="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <td
                class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
            >
              {{ type.id }}
            </td>
            <td
                class="hidden md:table-cell border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
            >
              {{ type.name }}
            </td>
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-center">
              <div class="flex justify-around">
                <button @click="openEditForm(type)"
                        class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteList(type)"
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
    <div v-if="!isLoading && !toDoListTypes.length">
      <p class="text-center text-gray-700 dark:text-gray-300 text-xl">Aucun type de liste trouvé</p>
    </div>

    <div v-if="error">
      <p class="text-center text-red-700 dark:text-red-300 text-xl">{{ error }}</p>
    </div>

    <div class="text-right mt-6">
      <button
          @click="openCreateForm()"
          class="mt-4 bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-yellow-500 transition"
      >
        Ajouter un Type
      </button>
    </div>

    <!-- Modale avec le formulaire -->
    <ModalComponent v-if="showForm" @close="closeForm">
      <ToDoListTypeFormComponent
          :initialData="selectedToDoListTypes"
          @handleResponse="handleResponseFormSubmit"
          @cancel="closeForm"
      />
    </ModalComponent>

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
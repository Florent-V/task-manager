<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import LoaderComponent from "@/components/LoaderComponent.vue";
import KanbanFormComponent from "@/components/Kanban/KanbanFormComponent.vue";

const router = useRouter();
const { isLoading, error, executeRequest } = hookApi();

const kanbans = ref([]);
const showForm = ref(false);
const selectedKanban = ref(null);

const handleResponseFormSubmit = async (response) => {
  if (selectedKanban.value) {
    // Update existing kanban
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
    logger.debug('kanbans', data);
    kanbans.value = data.kanbans;
  } catch (err) {
    logger.error("Error fetching to-do lists", err?.response?.data?.message || err.message);
  }
};

const redirectToItem = (id) => {
  router.push(`/kanban/${id}`);
};

onMounted(fetchKanbans);
</script>

<template>

  <div class="container mx-auto px-1 py-12">

    <!-- KanbanForm -->
    <KanbanFormComponent
        v-if="showForm"
        :initialData="selectedKanban"
        @handleResponse="handleResponseFormSubmit"
        @cancel="closeForm"
    />

    <!-- KanbanTable -->
    <div v-else>
      <div class="flex justify-between items-center mb-6 px-6">
        <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">
          Mes Kanbans
        </h1>
        <!-- Add button -->
        <div class="text-right">
          <button @click="openCreateForm" class="bg-blue-600 dark:bg-yellow-400 text-white px-3 py-3 rounded-full">
          <span class="flex items-center">
            <v-icon name="md-add" scale="1.5"/>
        </span>
          </button>
        </div>
      </div>

      <!-- Loader -->
      <LoaderComponent v-if="isLoading"/>

      <div v-else>
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
              <tr v-for="kanban in kanbans" :key="kanban.id" class="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                <td
                    class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
                    @click="redirectToItem(kanban.id)"
                >
                  {{ kanban.title }}
                </td>
                <td
                    class="hidden md:table-cell border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
                    @click="redirectToItem(kanban.id)"
                >
                  {{ kanban.description }}
                </td>
                <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-center">
                  <div class="flex justify-around">
                    <button @click="openEditForm(kanban)"
                            class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="deleteKanban(kanban)"
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
        <div v-else>
          <p class="text-center text-gray-700 dark:text-gray-300 text-xl">Aucun kanban trouvé</p>
        </div>

        <div v-if="error">
          <p class="text-center text-red-700 dark:text-red-300 text-xl">{{ error }}</p>
        </div>
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

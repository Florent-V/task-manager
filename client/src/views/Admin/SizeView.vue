<script setup>
import { ref, onMounted } from 'vue';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import LoaderComponent from "@/components/LoaderComponent.vue";
import ModalComponent from "@/components/ModalComponent.vue";
import SizeFormComponent from "@/components/Admin/SizeFormComponent.vue";

const { isLoading, error, executeRequest } = hookApi();

const sizes = ref([]);
const showForm = ref(false);
const loading = ref(false);
const selectedSize = ref(null);

const handleResponseFormSubmit = async (response) => {
  if (selectedSize.value) {
    // Update existing to-do
    const index = sizes.value.findIndex(s => s.id === response.size.id);
    sizes.value[index] = response.size;
  } else {
    sizes.value.push(response.size);
  }
  closeForm();
};

const deleteSize = async (size) => {
  try {
    await executeRequest(() => client.delete(`/api/size/${size.id}`));
    sizes.value = sizes.value.filter(item => item.id !== size.id);
  } catch (err) {
    logger.error("Error deleting size", err?.response?.data?.message || err.message);
  }
};

const openCreateForm = () => {
  selectedSize.value = null;
  showForm.value = true;
};
const openEditForm = (list) => {
  selectedSize.value = { ...list };
  showForm.value = true;
};

const closeForm = () => {
  selectedSize.value = null;
  showForm.value = false;
};

const fetchSizes = async () => {
  loading.value = true;
  try {
    const data = await executeRequest(() => client.get('/api/size'));
    logger.debug('sizes', data);
    sizes.value = data.sizes;
  } catch (err) {
    logger.error("Error fetching sizes", err?.response?.data?.message || err.message);
    error.value = err?.response?.data?.message || err.message;
  }
};

onMounted(fetchSizes);
</script>

<template>

  <div class="container mx-auto px-1 py-12">
    <div class="flex justify-between items-center mb-6 px-6">
      <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">Sizing</h1>
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


    <!--    spacing div -->
    <div class="h-6"></div>

    <!-- Loader -->
    <LoaderComponent v-if="isLoading"/>

    <div v-if="sizes.length" class="w-full bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg dark:shadow-gray-700">

      <div class="overflow-x-auto">
        <table class="min-w-full table-auto">
          <thead>
          <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-md">
            <th class="px-6 py-3 text-left hidden md:table-cell">id</th>
            <th class="px-6 py-3 text-left">Nom</th>
            <th class="px-6 py-3 text-left hidden md:table-cell">Label</th>
            <th class="px-6 py-3 text-left hidden md:table-cell">Color</th>
            <th class="px-6 py-3 text-center w-[5rem]">Action</th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="size in sizes" :key="size.id"
                class="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
              <td
                  class="hidden md:table-cell border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
              >
                {{ size.id }}
              </td>
              <td
                  class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
              >
                {{ size.name }}
              </td>
              <td
                  class="hidden md:table-cell border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300 cursor-pointer"
              >
                {{ size.label }}
              </td>
              <td
                  class="hidden md:table-cell border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300"
              >
                <div class="flex items-center">
                    <span
                        :style="{ backgroundColor: size.color }"
                        class="w-5 h-5 rounded-full inline-block border border-gray-300 dark:border-gray-600 mr-2"
                    ></span>
                  <span>{{ size.color }}</span>
                </div>
              </td>
              <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-center">
                <div class="flex justify-around">
                  <button @click="openEditForm(size)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button @click="deleteSize(size)"
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
    <div v-if="!isLoading && !sizes.length">
      <p class="text-center text-gray-700 dark:text-gray-300 text-xl">Aucune sizing trouvé</p>
    </div>

    <div v-if="error">
      <p class="text-center text-red-700 dark:text-red-300 text-xl">{{ error }}</p>
    </div>

    <div class="text-right mt-6">
      <button
          @click="openCreateForm()"
          class="mt-4 bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-yellow-500 transition"
      >
        Ajouter un Sizing
      </button>
    </div>

    <!-- Modale avec le formulaire -->
    <ModalComponent v-if="showForm" @close="closeForm">
      <SizeFormComponent
          :initialData="selectedSize"
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
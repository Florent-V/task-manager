<script setup>
import { ref, watch, defineProps, computed } from 'vue';
import { KanbanService } from '@/services/kanbanService.js';
import LoaderComponent from '@/components/LoaderComponent.vue';
import PaginationComponent from '@/components/PaginationComponent.vue';
import logger from "@/utils/logger.js";

const props = defineProps({
  kanbanId: {
    type: String,
    required: true
  },
  timeParser: {
    type: Object,
    required: true
  }
});

const kanbanService = new KanbanService();

const imputations = ref([]);
const isLoading = ref(false);
const error = ref(null);

const currentPage = ref(1);
const itemsPerPage = ref(10); // Or make this a prop
const totalItems = ref(0);

const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

async function fetchData() {
  if (!props.kanbanId) return;
  isLoading.value = true;
  error.value = null;
  try {
    const response = await kanbanService.getKanbanDetailedImputations(props.kanbanId, {
      page: currentPage.value,
      limit: itemsPerPage.value
    });
    imputations.value = response.rows || [];
    totalItems.value = response.count || 0;
  } catch (err) {
    logger.error('Error fetching detailed imputations in DetailedImputationsTable:', err);
    error.value = `Failed to load detailed imputations: ${err.message}`;
    imputations.value = [];
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
}

watch(() => props.kanbanId, (newId) => {
  if (newId) {
    currentPage.value = 1; // Reset to first page
    fetchData();
  } else {
    imputations.value = [];
    totalItems.value = 0;
    currentPage.value = 1;
  }
}, { immediate: true });

function handlePageChange(newPage) {
  currentPage.value = newPage;
  fetchData();
}
</script>

<template>
  <div class="mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
    <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Detailed Imputations</h2>
    <div v-if="isLoading && (!imputations || imputations.length === 0)" class="flex justify-center py-4">
      <LoaderComponent />
    </div>
    <div v-else-if="!isLoading && (!imputations || imputations.length === 0)" class="text-center py-4 text-gray-500 dark:text-gray-400">
      No detailed imputations to display.
    </div>
    <div v-else-if="imputations && imputations.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
        <thead class="bg-gray-100 dark:bg-slate-700">
        <tr>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task Title</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time Spent</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Imputation Date</th>
          <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comment</th>
        </tr>
        </thead>
        <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
        <tr v-for="imputation in imputations" :key="imputation.id">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ imputation.task?.title || 'N/A' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ imputation.userFullName || 'N/A' }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ timeParser.formatMinutesToTimeString(imputation.timeSpent) }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(imputation.date).toLocaleDateString() }}</td>
          <td class="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 max-w-xs break-words">{{ imputation.comment }}</td>
        </tr>
        </tbody>
      </table>
      <PaginationComponent
          v-if="totalPages > 1"
          :current-page="currentPage"
          :total-pages="totalPages"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          @update:currentPage="handlePageChange"
          class="mt-6"
      />
    </div>
    <div v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</div>
  </div>
</template>

<style scoped>
.max-w-xs {
  max-width: 20rem;
}
</style>

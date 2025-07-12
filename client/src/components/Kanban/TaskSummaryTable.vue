<script setup>
import { ref, watch, defineProps, computed } from 'vue';

import LoaderComponent from '@/components/Loader/LoaderComponent.vue';
import PaginationComponent from '@/components/PaginationComponent.vue';
import logger from "@/utils/logger.js";
import { KanbanService } from '@/services/kanbanService.js';
import { hookApi } from "@/services/requestHook.js";

// Props
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

// Initialize services and data
const kanbanService = new KanbanService();
const {
  isLoading,
  error,
  executeRequest
} = hookApi();

// Ref State
const tasks = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);

// Computed Properties
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

async function fetchData() {
  if (!props.kanbanId) return;
  try {
    const response = await executeRequest(() => kanbanService.getKanbanTasksSummary(props.kanbanId, {
      page: currentPage.value,
      limit: itemsPerPage.value
    }));
    tasks.value = response.rows || [];
    totalItems.value = response.count || 0;
  } catch (err) {
    logger.error('Error fetching tasks summary in TasksSummaryTable:', err);
    error.value = `Failed to load tasks summary: ${err.message}`;
    tasks.value = [];
    totalItems.value = 0;
  }
}

watch(() => props.kanbanId, (newId) => {
  if (newId) {
    currentPage.value = 1; // Reset to first page
    fetchData();
  } else { // kanbanId is null or undefined, clear data
    tasks.value = [];
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
    <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Tasks Summary</h2>
    <!-- Loader -->
    <div v-if="isLoading" class="flex justify-center py-4">
      <LoaderComponent/>
    </div>
    <!-- Error message -->
    <div
        v-else-if="error"
        class="text-center text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700"
    >
      {{ error }}
    </div>

    <div v-else>
      <div v-if="tasks.length === 0" class="text-center py-4 text-gray-500 dark:text-gray-400">
        No tasks to display.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
          <thead class="bg-gray-100 dark:bg-slate-700">
          <tr>
            <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Task Title
            </th>
            <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Estimated Time
            </th>
            <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Total Time Spent
            </th>
            <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Variance
            </th>
            <th
                scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Variance %
            </th>
          </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
          <tr v-for="task in tasks" :key="task.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{
                task.title
              }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ timeParser.formatMinutesToTimeString(task.estimation) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ timeParser.formatMinutesToTimeString(task.totalTimeSpentOnTask) }}
            </td>
            <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', task.varianceMinutes > 0 ? 'text-red-500' : task.varianceMinutes < 0 ? 'text-green-500' : 'text-gray-500']">
              {{ timeParser.formatMinutesToTimeString(task.varianceAbsMinutes) }}
              <span v-if="task.varianceMinutes > 0">(Over)</span>
              <span v-else-if="task.varianceMinutes < 0">(Under)</span>
            </td>
            <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', task.estimation > 0 && task.variancePerc > 100 ? 'text-red-500' : task.estimation > 0 ? 'text-green-500' : 'text-gray-500']">
              {{ task.estimation > 0 ? task.variancePerc.toFixed(0) + '%' : 'N/A' }}
            </td>
          </tr>
          </tbody>
        </table>
        <PaginationComponent
            v-if="totalPages > 1"
            class="mt-6"
            :current-page="currentPage"
            :total-pages="totalPages"
            :total-items="totalItems"
            :items-per-page="itemsPerPage"
            @update:current-page="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Styles specific to TasksSummaryTable if any */
</style>

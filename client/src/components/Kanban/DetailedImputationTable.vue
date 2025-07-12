<script setup>
import { ref, watch, defineProps, computed } from 'vue';

import LoaderComponent from '@/components/LoaderComponent.vue';
import PaginationComponent from '@/components/PaginationComponent.vue';
import KanbanImputationStatsComponent from '@/components/Kanban/KanbanImputationStatsComponent.vue';
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
  },
  usersOnThisKanban: {
    type: Array,
    default: () => []
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
const selectedUserId = ref(null);
const imputations = ref([]);
const currentPage = ref(1);
const itemsPerPage = ref(10); // Or make this a prop
const totalItems = ref(0);

// Computed Properties
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

const selectedUserName = computed(() => {
  if (!selectedUserId.value || !props.usersOnThisKanban) return 'Selected User';
  const user = props.usersOnThisKanban.find(u => u.id === selectedUserId.value);
  return user ? user.fullName : 'Selected User';
});

const detailedImputationsForSelectedUser = computed(() => {
  if (!selectedUserId.value || !imputations.value) {
    return [];
  }
  return imputations.value.filter(imp => imp.userId === selectedUserId.value);
});

function selectUser(id) {
  selectedUserId.value = selectedUserId.value === id ? null : id;
}

async function fetchData() {
  if (!props.kanbanId) return;
  try {
    const response = await executeRequest(
        () => kanbanService.getKanbanDetailedImputations(
            props.kanbanId,
            {
              page: currentPage.value,
              limit: itemsPerPage.value
            })
    );
    imputations.value = response.rows || [];
    totalItems.value = response.count || 0;
  } catch (err) {
    logger.error('Error fetching detailed imputations in DetailedImputationsTable:', err);
    error.value = `Failed to load detailed imputations: ${err.message}`;
    imputations.value = [];
    totalItems.value = 0;
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
  <!-- Detailed Imputations Table -->
  <div class="mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
    <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Detailed Imputations</h2>
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
      <div v-if="imputations.length === 0"
           class="text-center py-4 text-gray-500 dark:text-gray-400">
        No detailed imputations to display for this Kanban.
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
          <thead class="bg-gray-100 dark:bg-slate-700">
          <tr>
            <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Task Title
            </th>
            <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              User
            </th>
            <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Time Spent
            </th>
            <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Imputation Date
            </th>
            <th scope="col"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Comment
            </th>
          </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
          <tr v-for="imputation in imputations" :key="imputation.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ imputation.task?.title || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ imputation.userFullName || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ timeParser.formatMinutesToTimeString(imputation.timeSpent) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ new Date(imputation.date).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 max-w-xs break-words">
              {{ imputation.comment }}
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
            @update:currentPage="handlePageChange"
        />
      </div>
    </div>
  </div>

  <!-- User Selection Section -->
  <div>
    <!-- User Selection Section moved here -->
    <div v-if="props.usersOnThisKanban && props.usersOnThisKanban.length > 0"
         class="mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
      <h2 class="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Select User for Detailed Stats</h2>
      <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">
        Select a user to view their imputation statistics from the table above. The stats shown will be based on the
        currently loaded page of imputations.
      </p>
      <ul class="space-y-2">
        <li v-for="user in props.usersOnThisKanban" :key="user.id" class="text-sm">
          <button
              :class="['text-blue-600 hover:text-blue-800 hover:underline dark:text-yellow-400 dark:hover:text-yellow-200', selectedUserId === user.id ? 'font-semibold ring-2 ring-blue-500 dark:ring-yellow-500 rounded px-1' : 'px-1']"
              @click="selectUser(user.id)"
          >
            {{ user.fullName }}
          </button>
        </li>
      </ul>
      <button
          v-if="selectedUserId"
          @click="selectUser(null)"
          class="mt-4 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 underline"
      >
        Clear selection
      </button>
    </div>
    <div
        v-else-if="!isLoading && (!props.usersOnThisKanban || props.usersOnThisKanban.length === 0) && imputations.length > 0"
        class="mt-8 pt-6 border-t border-gray-200 dark:border-slate-600 text-center text-gray-500 dark:text-gray-400">
      No users found on this Kanban to display activity for.
    </div>

    <!-- Stats for selected user -->
    <KanbanImputationStatsComponent
        v-if="selectedUserId && detailedImputationsForSelectedUser.length > 0"
        :kanban-id="props.kanbanId"
        :imputations="detailedImputationsForSelectedUser"
        :kanban-title="`Imputations for ${selectedUserName}`"
        class="mt-6"
    />
    <div v-else-if="selectedUserId && detailedImputationsForSelectedUser.length === 0 && !isLoading"
         class="mt-6 p-4 bg-yellow-50 dark:bg-slate-700 rounded-lg text-center text-gray-600 dark:text-gray-300">
      No imputations found for {{ selectedUserName }} in the current view.
    </div>

  </div>
</template>

<style scoped>
.max-w-xs {
  max-width: 20rem;
}
</style>

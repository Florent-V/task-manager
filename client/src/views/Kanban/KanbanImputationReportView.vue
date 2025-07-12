<script setup>
import { ref, computed, watch, defineProps } from 'vue';

import LoaderComponent from '@/components/LoaderComponent.vue';
import LoaderDotsComponent from "@/components/Loader/LoaderDotsComponent.vue";
import TasksSummaryTable from '@/components/Kanban/TaskSummaryTable.vue';
import DetailedImputationsTable from '@/components/Kanban/DetailedImputationTable.vue';
import { useKanbanStore } from '@/stores/kanbanStore.js';
import { TimeParser } from '@/utils/timeParser.js';
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import logger from "@/utils/logger.js";
import { KanbanService } from '@/services/kanbanService.js';
import { hookApi } from "@/services/requestHook.js";

// Props
const props = defineProps({
  kanbanId: {
    type: String,
    required: true
  },
});

// Initialize services and data
const kanbanStore = useKanbanStore();
const kanbanService = new KanbanService();
const timeParser = new TimeParser();
const {
  isLoading: requestKanbanLoading,
  error: requestKanbanError,
  executeRequest: executeKanbanRequest
} = hookApi();

const {
  isLoading: requestTotalsLoading,
  error: requestTotalsError,
  executeRequest: executeTotalsRequest
} = hookApi();

// State for data managed by this parent component
const users = ref([]);
const kanbanDetails = ref({});
// Global Totals State
const tasksTotalEstimatedTime = ref(0);
const tasksTotalImputedTime = ref(0);

// Computed Properties
const usersOnThisKanban = computed(() => {
  if (!users.value || users.value.length === 0) return [];
  return [...users.value]
      .map(u => ({
        id: u.id,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
});

// Fetching functions for data managed by this parent
const fetchKanbanBaseDetails = async () => {
  if (!props.kanbanId) return;

  try {
    await executeKanbanRequest(
        () => kanbanStore.initStore(props.kanbanId)
    );
    users.value = kanbanStore.users || [];
    kanbanDetails.value = {
      id: kanbanStore.kanban?.id,
      title: kanbanStore.kanban?.title,
    };
    setTitle(`Imputation Report for Kanban : ${kanbanDetails.value.title}`);
    setDescription(`Imputation Report for Kanban : ${kanbanDetails.value.title}`);
  } catch (err) {
    logger.error('Error fetching Kanban base details in Parent:', err);
    requestKanbanError.value = `Erreur chargement détails Kanban: ${err.message}`;
    users.value = [];
    setTitle(`Report - Error`);
    setDescription(`Error loading report for Kanban ${props.kanbanId}`);
  }
};

const fetchKanbanTotals = async () => {
  if (!props.kanbanId) return;
  try {
    const totalsData = await executeTotalsRequest(
        () => kanbanService.getKanbanImputationTotals(props.kanbanId)
    );
    tasksTotalEstimatedTime.value = totalsData.tasksTotalEstimatedTime || 0;
    tasksTotalImputedTime.value = totalsData.tasksTotalImputedTime || 0;
  } catch (err) {
    logger.error('Error fetching Kanban imputation totals in Parent:', err);
    requestTotalsError.value = `Erreur chargement totaux: ${err.message}`;
    tasksTotalEstimatedTime.value = 0;
    tasksTotalImputedTime.value = 0;
  }
};

// Watch props.kanbanId to re-fetch parent-managed data
watch(() => props.kanbanId, (newId, oldId) => {
  // Ensure it runs only when kanbanId actually changes or for initial load via immediate
  if (newId && (newId !== oldId || !kanbanDetails.value.id)) {
    // Reset  data
    kanbanDetails.value = { id: props.kanbanId };
    users.value = [];
    tasksTotalEstimatedTime.value = 0;
    tasksTotalImputedTime.value = 0;
    fetchKanbanBaseDetails();
    fetchKanbanTotals();
  }
}, { immediate: true }); // immediate: true ensures it runs on component mount

</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Header with overall stats-->
    <div>
      <h1 class="flex mb-8 gap-2 justify-center items-center text-center text-blue-800 dark:text-yellow-300 break-words">
        <span class="text-4xl font-bold">Kanban Report:</span>
        <span v-if="requestKanbanLoading" class="ml-10">
            <LoaderDotsComponent/>
          </span>
        <span v-else class="text-4xl font-bold">{{ kanbanDetails.title }}</span>
      </h1>
    </div>

    <!-- Overall Summary -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Total Estimated Time (All Tasks)</h2>
        <div v-if="requestTotalsLoading" class="flex justify-center py-1">
          <LoaderComponent size="small"/>
        </div>
        <p v-else class="text-3xl font-bold text-blue-600">
          {{ timeParser.formatMinutesToTimeString(tasksTotalEstimatedTime) }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">for all tasks on this board</p>
      </div>
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Total Time Spent (All
          Imputations)</h2>
        <div v-if="requestTotalsLoading" class="flex justify-center py-1">
          <LoaderComponent size="small"/>
        </div>
        <p v-else
           :class="['text-3xl font-bold', tasksTotalImputedTime > tasksTotalEstimatedTime && tasksTotalEstimatedTime > 0 ? 'text-red-600' : 'text-green-600']">
          {{ timeParser.formatMinutesToTimeString(tasksTotalImputedTime) }}
        </p>
        <p class="text-sm text-gray-500 dark:text-gray-400">on this Kanban board</p>
      </div>
    </div>

    <!-- Child components now handle their own data fetching and pagination -->
    <TasksSummaryTable
        :kanban-id="props.kanbanId"
        :time-parser="timeParser"
        class="mb-8"
    />

    <DetailedImputationsTable
        :kanban-id="props.kanbanId"
        :time-parser="timeParser"
        :users-on-this-kanban="usersOnThisKanban"
    />

  </div>
</template>

<style scoped>
/* Add any component-specific styles here if needed, beyond Tailwind classes */
.max-w-xs {
  max-width: 20rem; /* Example for comment column */
}
</style>

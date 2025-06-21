<script setup>
import { ref, onMounted, computed, watch, defineProps } from 'vue';

import { useKanbanStore } from '@/stores/kanbanStore.js';
import { KanbanService } from '@/services/kanbanService.js';
import { TimeParser } from '@/utils/timeParser.js';
import LoaderComponent from '@/components/LoaderComponent.vue';
import KanbanImputationStats from '@/components/Kanban/KanbanImputationStats.vue';
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import logger from "@/utils/logger.js";

const props = defineProps({
  kanbanId: {
    type: String, // Automatically passed from route params
    required: true
  },
});

const kanbanStore = useKanbanStore();
const kanbanService = new KanbanService();
const timeParser = new TimeParser();

const tasks = ref([]);
const users = ref([]);
const kanbanDetails = ref({});
const isLoading = ref(false);
const error = ref(null);

// Derived data built in a single pass over tasks
const derivedData = computed(() => {
  const summary = [];
  const flat = [];

  tasks.value.forEach(task => {
    const totalSpent = (task.imputations || []).reduce((sum, imp) => {
      flat.push({
        ...imp,
        task: {
          id: task.id,
          title: task.title,
          estimation: task.estimation,
          createdAt: task.createdAt,
        }
      });
      return sum + (imp.timeSpent || 0);
    }, 0);

    const varianceMinutes = totalSpent - (task.estimation || 0);

    summary.push({
      id: task.id,
      title: task.title,
      estimation: task.estimation || 0,
      totalTimeSpentOnTask: totalSpent,
      createdAt: task.createdAt || 0,
      varianceMinutes,
      varianceAbsMinutes: Math.abs(varianceMinutes),
      variancePerc: task.estimation ? (totalSpent / task.estimation) * 100 : 0,
    });
  });

  summary.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  flat.sort((a, b) => new Date(b.date) - new Date(a.date));

  return { summary, flat };
});

const sortedImputations = computed(() => derivedData.value.flat);
const tasksSummary = computed(() => derivedData.value.summary);

const formattedImputations = computed(() => {
  return sortedImputations.value.map(imp => ({
    ...imp,
    title: imp.task?.title || 'N/A',
    userFullName: `${imp.user?.firstName || ''} ${imp.user?.lastName || ''}`.trim() || 'N/A',
    timeSpentFormatted: timeParser.formatMinutesToTimeString(imp.timeSpent),
    dateFormatted: new Date(imp.date).toLocaleDateString(),
  }));
});

const grandTotalTimeSpent = computed(() => sortedImputations.value.reduce((total, imp) => total + imp.timeSpent, 0));

const grandTotalEstimatedTime = computed(() => {
  // Sum of unique task estimations from tasksSummary
  // This ensures each task's estimation is counted only once
  return tasksSummary.value.reduce((total, task) => total + task.estimation, 0);
});

const usersOnThisKanban = computed(() => {
  if (!users.value === 0) return [];
  return [...users.value]
    .map(u => ({
      id: u.id,
      firstName: u.firstName || '',
      lastName: u.lastName || '',
      fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown User',
    }))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
});

const selectedUserId = ref(null);
function selectUser(id) {
  selectedUserId.value = selectedUserId.value === id ? null : id;
}

const imputationsForSelectedUser = computed(() => {
  if (!selectedUserId.value) return [];
  return sortedImputations.value.filter(imp => imp.user?.id === selectedUserId.value);
});

// Watch props.kanbanId directly as it's reactive
watch(() => props.kanbanId, (newId) => {
  if (newId) {
    fetchReportData();
  }
});

const fetchReportData = async () => {
  if (!props.kanbanId) return;

  error.value = null;
  try {
    // Optionally still init store to get kanban metadata (title)
    await kanbanStore.initStore(props.kanbanId);
    users.value = kanbanStore.users;
    kanbanDetails.value = {
      id: kanbanStore.kanban.id,
      title: kanbanStore.kanban.title,
    };

    const data = await kanbanService.getKanbanImputationReport(props.kanbanId);
    tasks.value = data.tasks || [];

  } catch (err) {
    logger.error('Error fetching Kanban imputation report:', err);
    tasks.value = [];
    error.value = 'Unable to fetch report';
  }
};

onMounted(async () => {
  await fetchReportData();
  setTitle(`Report - ${kanbanDetails.value.title}`);
  setDescription(`Report for Kanban ${kanbanDetails.value.title}`);
});
</script>

<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <LoaderComponent />
    </div>
    <div v-else-if="error" class="text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700">
      <p class="font-semibold">Error loading report:</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="sortedImputations.length === 0" class="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
      <h1 class="text-2xl font-semibold mb-4">Kanban Report: {{ kanbanDetails?.title || props.kanbanId }}</h1>
      <p>No imputations found for this Kanban board.</p>
    </div>
    <div v-else>
      <h1 class="text-4xl font-bold mb-8 text-center text-blue-800 dark:text-yellow-300 break-words">
        Kanban Report: {{ kanbanDetails?.title || 'Loading...' }}
      </h1>

      <!-- Overall Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
          <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Total Estimated Time</h2>
          <p class="text-3xl font-bold text-blue-600">
            {{ timeParser.formatMinutesToTimeString(grandTotalEstimatedTime) }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">for reported tasks</p>
        </div>
        <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
          <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Total Time Spent</h2>
          <p :class="['text-3xl font-bold', grandTotalTimeSpent > grandTotalEstimatedTime ? 'text-red-600' : 'text-green-600']">
            {{ timeParser.formatMinutesToTimeString(grandTotalTimeSpent) }}
          </p>
          <p class="text-sm text-gray-500 dark:text-gray-400">on this Kanban board</p>
        </div>
      </div>

      <!-- Task-Specific Summary Table -->
      <div class="mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Tasks Summary</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
            <thead class="bg-gray-100 dark:bg-slate-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task Title</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estimated Time</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Time Spent</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Variance</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Variance %</th>
            </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
            <tr v-for="task in tasksSummary" :key="task.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ task.title }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ timeParser.formatMinutesToTimeString(task.estimation) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ timeParser.formatMinutesToTimeString(task.totalTimeSpentOnTask) }}</td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', task.varianceMinutes > 0 ? 'text-red-500' : task.varianceMinutes < 0 ? 'text-green-500' : 'text-gray-500']">
                {{ timeParser.formatMinutesToTimeString(task.varianceAbsMinutes) }}
                <span v-if="task.varianceMinutes > 0">(Over)</span>
                <span v-else-if="task.varianceMinutes < 0">(Under)</span>
              </td>
              <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', task.variancePerc > 100 ? 'text-red-500' : 'text-green-500']">
                {{ task.variancePerc.toFixed(0) }}%
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detailed Imputations Table -->
      <div class="mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Detailed Imputations</h2>
        <div class="overflow-x-auto">
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
            <tr v-for="imputation in formattedImputations" :key="imputation.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ imputation.title }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ imputation.userFullName }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ imputation.timeSpentFormatted }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ imputation.dateFormatted }}</td>
              <td class="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 max-w-xs break-words">{{ imputation.comment }}</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Activity Section -->
      <div v-if="usersOnThisKanban.length > 0" class="mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">User Activity on this Kanban</h2>
        <ul class="space-y-2">
          <li v-for="user in usersOnThisKanban" :key="user.id" class="text-sm">
            <button
                @click="selectUser(user.id)"
                :class="['text-blue-600 hover:text-blue-800 hover:underline dark:text-yellow-400 dark:hover:text-yellow-200', selectedUserId===user.id ? 'font-semibold' : '']"
            >
              {{ user.fullName }}
            </button>
          </li>
        </ul>
      </div>

      <!-- Imputations for selected user (if any) -->
      <KanbanImputationStats
          v-if="selectedUserId && imputationsForSelectedUser.length > 0"
          :kanban-title="`Imputations for ${usersOnThisKanban.find(u=>u.id===selectedUserId)?.fullName || 'Selected user'}`"
          :kanban-id="props.kanbanId"
          :imputations="imputationsForSelectedUser" />

    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here if needed, beyond Tailwind classes */
.max-w-xs {
  max-width: 20rem; /* Example for comment column */
}
</style>

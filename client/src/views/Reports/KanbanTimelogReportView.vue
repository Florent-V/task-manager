<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <LoaderComponent />
    </div>
    <div v-else-if="error" class="text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700">
      <p class="font-semibold">Error loading report:</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="!imputations || imputations.length === 0" class="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
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
          <p class="text-3xl font-bold text-green-600">
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
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
              <tr v-for="task in tasksSummary" :key="task.taskId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ task.taskTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ timeParser.formatMinutesToTimeString(task.totalEstimation) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ timeParser.formatMinutesToTimeString(task.totalTimeSpentOnTask) }}</td>
                <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', task.totalTimeSpentOnTask > task.totalEstimation ? 'text-red-500' : 'text-green-500', task.totalTimeSpentOnTask !== task.totalEstimation ? 'dark:text-opacity-80' : 'dark:text-green-400']">
                  {{ timeParser.formatMinutesToTimeString(task.totalTimeSpentOnTask - task.totalEstimation) }}
                  <span v-if="task.totalTimeSpentOnTask > task.totalEstimation">(Over)</span>
                  <span v-else-if="task.totalTimeSpentOnTask < task.totalEstimation">(Under)</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detailed Imputations Table -->
      <div class="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Detailed Imputations</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imputation Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="imputation in formattedImputations" :key="imputation.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ imputation.taskTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ imputation.userFullName }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ imputation.timeSpentFormatted }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ imputation.dateFormatted }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-500 max-w-xs break-words">{{ imputation.comment }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Activity Section -->
      <div v-if="usersOnThisKanban.length > 0" class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">User Activity on this Kanban</h2>
        <ul class="space-y-2">
          <li v-for="user in usersOnThisKanban" :key="user.id" class="text-sm">
            <router-link
              :to="{ name: 'UserTimelogReport', params: { userId: user.id }, query: { kanbanId: props.kanbanId } }"
              class="text-blue-600 hover:text-blue-800 hover:underline dark:text-yellow-400 dark:hover:text-yellow-200"
            >
              {{ user.fullName }}
            </router-link>
          </li>
        </ul>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, defineProps } from 'vue';
import { useRoute } from 'vue-router';
import { ReportService } from '@/services/reportService.js';
import { TimeParser } from '@/utils/timeParser.js';
import LoaderComponent from '@/components/LoaderComponent.vue';

const props = defineProps({
  kanbanId: String // From route params, made explicit
});

const route = useRoute();
const reportService = new ReportService();
const timeParser = new TimeParser();

// const kanbanId = ref(null); // Now using props.kanbanId
const imputations = ref([]);
const kanbanDetails = ref(null);
const isLoading = ref(true);
const error = ref(null);

const fetchReportData = async () => {
  if (!props.kanbanId) return; // Use prop here

  isLoading.value = true;
  error.value = null;
  try {
    // hookApi's executeRequest typically returns the data directly
    const rawImputations = await reportService.getKanbanImputationReport(props.kanbanId); // Use prop here

    if (rawImputations && rawImputations.length > 0) {
      imputations.value = rawImputations;
      // Extract Kanban details from the first imputation
      if (rawImputations[0]?.task?.kanban) {
        kanbanDetails.value = {
          id: rawImputations[0].task.kanban.id,
          title: rawImputations[0].task.kanban.title
        };
        document.title = `Report - ${kanbanDetails.value.title}`;
      } else {
        document.title = `Report for Kanban ${props.kanbanId}`; // Use prop here
      }
    } else {
      imputations.value = [];
      kanbanDetails.value = { title: `Kanban ${props.kanbanId}` }; // Fallback title, use prop
      document.title = `Report for Kanban ${props.kanbanId}`; // Use prop here
    }
  } catch (err) {
    console.error('Error fetching Kanban imputation report:', err);
    error.value = err.message || 'An unknown error occurred while fetching the report.';
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    }
    imputations.value = []; // Clear any stale data
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // kanbanId.value = route.params.kanbanId; // No longer needed, props.kanbanId is used
  fetchReportData();
});

// Watch props.kanbanId directly as it's reactive
watch(() => props.kanbanId, (newId) => {
  if (newId) {
    // No need to set kanbanId.value, just refetch
    fetchReportData();
  }
});

const formattedImputations = computed(() => {
  return imputations.value.map(imp => ({
    ...imp,
    taskTitle: imp.task?.title || 'N/A',
    userFullName: `${imp.user?.firstName || ''} ${imp.user?.lastName || ''}`.trim() || 'N/A',
    timeSpentFormatted: timeParser.formatMinutesToTimeString(imp.timeSpent),
    dateFormatted: new Date(imp.date).toLocaleDateString(),
  }));
});

const usersOnThisKanban = computed(() => {
  if (!imputations.value || imputations.value.length === 0) {
    return [];
  }
  const usersMap = new Map();
  imputations.value.forEach(imp => {
    if (imp.user && imp.user.id) { // Ensure user and user.id exist
      if (!usersMap.has(imp.user.id)) {
        usersMap.set(imp.user.id, {
          id: imp.user.id,
          firstName: imp.user.firstName || '',
          lastName: imp.user.lastName || '',
          fullName: `${imp.user.firstName || ''} ${imp.user.lastName || ''}`.trim() || 'Unknown User'
        });
      }
    }
  });
  return Array.from(usersMap.values()).sort((a, b) => a.fullName.localeCompare(b.fullName));
});

const tasksSummary = computed(() => {
  if (!imputations.value || imputations.value.length === 0) return [];

  const tasksMap = new Map();

  imputations.value.forEach(imp => {
    if (!imp.task) return; // Skip if task data is missing

    const taskId = imp.task.id;
    if (!tasksMap.has(taskId)) {
      tasksMap.set(taskId, {
        taskId: taskId,
        taskTitle: imp.task.title,
        totalEstimation: imp.task.estimation || 0, // Assuming estimation is in minutes
        totalTimeSpentOnTask: 0,
      });
    }
    tasksMap.get(taskId).totalTimeSpentOnTask += imp.timeSpent;
  });

  return Array.from(tasksMap.values());
});

const grandTotalTimeSpent = computed(() => {
  return imputations.value.reduce((total, imp) => total + imp.timeSpent, 0);
});

const grandTotalEstimatedTime = computed(() => {
  // Sum of unique task estimations from tasksSummary
  // This ensures each task's estimation is counted only once
  return tasksSummary.value.reduce((total, task) => total + task.totalEstimation, 0);
});

</script>

<style scoped>
/* Add any component-specific styles here if needed, beyond Tailwind classes */
.max-w-xs {
  max-width: 20rem; /* Example for comment column */
}
</style>

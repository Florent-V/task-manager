<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <LoaderComponent />
    </div>
    <div v-else-if="error" class="text-red-500 bg-red-100 p-4 rounded-md">
      <p class="font-semibold">Error loading report:</p>
      <p>{{ error }}</p>
    </div>
    <div v-else-if="!imputations || imputations.length === 0" class="text-gray-500 bg-gray-100 p-4 rounded-md">
      <h1 class="text-2xl font-semibold mb-4">Kanban Report: {{ kanbanDetails?.title || kanbanId }}</h1>
      <p>No imputations found for this Kanban board.</p>
    </div>
    <div v-else>
      <h1 class="text-3xl font-bold mb-6 text-gray-800">
        Kanban Report: {{ kanbanDetails?.title || 'Loading...' }}
      </h1>

      <!-- Overall Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Total Estimated Time</h2>
          <p class="text-3xl font-bold text-blue-600">
            {{ timeParser.formatMinutesToTimeString(grandTotalEstimatedTime) }}
          </p>
          <p class="text-sm text-gray-500">for reported tasks</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Total Time Spent</h2>
          <p class="text-3xl font-bold text-green-600">
            {{ timeParser.formatMinutesToTimeString(grandTotalTimeSpent) }}
          </p>
          <p class="text-sm text-gray-500">on this Kanban board</p>
        </div>
      </div>

      <!-- Task-Specific Summary Table -->
      <div class="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Tasks Summary</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Time</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time Spent</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variance</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="task in tasksSummary" :key="task.taskId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ task.taskTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ timeParser.formatMinutesToTimeString(task.totalEstimation) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ timeParser.formatMinutesToTimeString(task.totalTimeSpentOnTask) }}</td>
                <td :class="['px-6 py-4 whitespace-nowrap text-sm font-semibold', task.totalTimeSpentOnTask > task.totalEstimation ? 'text-red-500' : 'text-green-500']">
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
      <div class="bg-white p-6 rounded-lg shadow">
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
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ReportService } from '@/services/reportService.js';
import { TimeParser } from '@/utils/timeParser.js';
import LoaderComponent from '@/components/LoaderComponent.vue';
// import { useAuthStore } from '@/stores/authStore.js'; // Not strictly needed if user info is in report

const route = useRoute();
const reportService = new ReportService();
const timeParser = new TimeParser();

const kanbanId = ref(null);
const imputations = ref([]);
const kanbanDetails = ref(null); // To store Kanban title and other details
const isLoading = ref(true);
const error = ref(null);

const fetchReportData = async () => {
  if (!kanbanId.value) return;

  isLoading.value = true;
  error.value = null;
  try {
    // hookApi's executeRequest typically returns the data directly
    const rawImputations = await reportService.getKanbanImputationReport(kanbanId.value);

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
        document.title = `Report for Kanban ${kanbanId.value}`;
      }
    } else {
      imputations.value = [];
      kanbanDetails.value = { title: `Kanban ${kanbanId.value}` }; // Fallback title
      document.title = `Report for Kanban ${kanbanId.value}`;
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
  kanbanId.value = route.params.kanbanId;
  fetchReportData();
});

watch(() => route.params.kanbanId, (newId) => {
  if (newId) {
    kanbanId.value = newId;
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

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
      <h1 class="text-2xl font-semibold mb-4">
        Timelog Report for {{ viewedUserFullName }}
      </h1>
      <p>No imputations found for this user.</p>
    </div>
    <div v-else>
      <h1 class="text-3xl font-bold mb-6 text-gray-800">
        Timelog Report for {{ viewedUserFullName }}
      </h1>

      <!-- Overall Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white p-6 rounded-lg shadow col-span-1 md:col-span-2">
          <h2 class="text-xl font-semibold text-gray-700 mb-2">Total Time Logged by User</h2>
          <p class="text-3xl font-bold text-blue-600">
            {{ timeParser.formatMinutesToTimeString(grandTotalTimeSpent) }}
          </p>
        </div>
      </div>

      <!-- Kanban-Specific Summary Table -->
      <div class="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700">Summary by Kanban</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kanban Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time Spent by User</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="summary in kanbanSummary" :key="summary.kanbanId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ summary.kanbanTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ timeParser.formatMinutesToTimeString(summary.totalTimeSpentOnKanban) }}</td>
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
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kanban</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imputation Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="imputation in formattedImputations" :key="imputation.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ imputation.kanbanTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ imputation.taskTitle }}</td>
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
// import { useAuthStore } from '@/stores/authStore.js'; // For logged-in user context if needed

const route = useRoute();
const reportService = new ReportService();
const timeParser = new TimeParser();
// const authStore = useAuthStore(); // Example if needed

const userId = ref(null);
const imputations = ref([]);
const viewedUser = ref(null); // To store details of the user whose report is being viewed
const isLoading = ref(true);
const error = ref(null);

const viewedUserFullName = computed(() => {
  if (viewedUser.value) {
    return `${viewedUser.value.firstName || ''} ${viewedUser.value.lastName || ''}`.trim();
  }
  return `User ${userId.value || ''}`;
});

const fetchUserReportData = async () => {
  if (!userId.value) return;

  isLoading.value = true;
  error.value = null;
  try {
    const rawImputations = await reportService.getUserImputationReport(userId.value);

    if (rawImputations && rawImputations.length > 0) {
      imputations.value = rawImputations;
      if (rawImputations[0]?.user) {
        viewedUser.value = rawImputations[0].user;
      }
      document.title = `Timelog Report - ${viewedUserFullName.value}`;
    } else {
      imputations.value = [];
      // Try to get user details if no imputations, or if needed for title
      // This might require a separate call if user details aren't available
      // For now, if no imputations, viewedUser might remain null or be partially set if userId is known
      document.title = `Timelog Report - ${viewedUserFullName.value}`;
    }
  } catch (err) {
    console.error('Error fetching user imputation report:', err);
    error.value = err.message || 'An unknown error occurred while fetching the report.';
    if (err.response && err.response.data && err.response.data.message) {
      error.value = err.response.data.message;
    }
    imputations.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  userId.value = route.params.userId;
  fetchUserReportData();
});

watch(() => route.params.userId, (newId) => {
  if (newId) {
    userId.value = newId;
    // Reset viewedUser if userId changes, so fresh data is used for name
    viewedUser.value = null;
    fetchUserReportData();
  }
});

const formattedImputations = computed(() => {
  return imputations.value.map(imp => ({
    ...imp,
    taskTitle: imp.task?.title || 'N/A',
    kanbanTitle: imp.task?.kanban?.title || 'N/A',
    timeSpentFormatted: timeParser.formatMinutesToTimeString(imp.timeSpent),
    dateFormatted: new Date(imp.date).toLocaleDateString(),
  }));
});

const kanbanSummary = computed(() => {
  if (!imputations.value || imputations.value.length === 0) return [];

  const kanbansMap = new Map();

  imputations.value.forEach(imp => {
    if (!imp.task?.kanban) return; // Skip if kanban data is missing

    const kanbanId = imp.task.kanban.id;
    const kanbanTitle = imp.task.kanban.title || 'Untitled Kanban';

    if (!kanbansMap.has(kanbanId)) {
      kanbansMap.set(kanbanId, {
        kanbanId: kanbanId,
        kanbanTitle: kanbanTitle,
        totalTimeSpentOnKanban: 0,
      });
    }
    kanbansMap.get(kanbanId).totalTimeSpentOnKanban += imp.timeSpent;
  });

  return Array.from(kanbansMap.values());
});

const grandTotalTimeSpent = computed(() => {
  return imputations.value.reduce((total, imp) => total + imp.timeSpent, 0);
});

</script>

<style scoped>
.max-w-xs {
  max-width: 20rem; /* Example for comment column */
}
</style>

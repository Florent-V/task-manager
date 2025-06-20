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
      <h1 class="text-2xl font-semibold mb-4">{{ pageTitle }}</h1>
      <p>No imputations found for this user{{ reportMode === 'kanbanSpecific' ? ` on Kanban "${kanbanTitleForReport}"` : '' }}.</p>
    </div>
    <div v-else>
      <h1 class="text-4xl font-bold mb-8 text-center text-blue-800 dark:text-yellow-300 break-words">
        {{ pageTitle }}
      </h1>

      <!-- Overall Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700 col-span-1 md:col-span-2">
          <h2 v-if="reportMode === 'global'" class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Total Time Logged by {{ viewedUserFullName }}</h2>
          <h2 v-else class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Total Time on Kanban "{{ kanbanTitleForReport }}" by {{ viewedUserFullName }}</h2>
          <p class="text-3xl font-bold text-blue-600">
            {{ timeParser.formatMinutesToTimeString(grandTotalTimeSpent) }}
          </p>
        </div>
      </div>

      <!-- Kanban-Specific Summary Table (Global Mode Only) -->
      <div v-if="reportMode === 'global'" class="mb-8 bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Summary by Kanban</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
            <thead class="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kanban Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total Time Spent</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
              <tr v-for="summary in kanbanSummary" :key="summary.kanbanId">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ summary.kanbanTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ timeParser.formatMinutesToTimeString(summary.totalTimeSpentOnKanban) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detailed Imputations Table -->
      <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700">
        <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Detailed Imputations</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-600">
            <thead class="bg-gray-100 dark:bg-slate-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kanban</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Task Title</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Time Spent</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Imputation Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Comment</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-600">
              <tr v-for="imputation in formattedImputations" :key="imputation.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ imputation.kanbanTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{{ imputation.taskTitle }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ imputation.timeSpentFormatted }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ imputation.dateFormatted }}</td>
                <td class="px-6 py-4 whitespace-normal text-sm text-gray-500 dark:text-gray-400 max-w-xs break-words">{{ imputation.comment }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { useAuthStore } from '@/stores/authStore.js';

const props = defineProps({
  userId: String, // From route params
  kanbanId: {       // Optional, from route params if defined, or query for this component's logic
    type: String,
    required: false,
    default: null
  }
});

const route = useRoute();
const reportService = new ReportService();
const timeParser = new TimeParser();
const authStore = useAuthStore();

const imputations = ref([]);
const viewedUser = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Determine current Kanban context from prop or query parameter
const currentContextKanbanId = computed(() => props.kanbanId || route.query.kanbanId);

const reportMode = computed(() => {
  return currentContextKanbanId.value ? 'kanbanSpecific' : 'global';
});

const viewedUserFullName = computed(() => {
  if (viewedUser.value) {
    return `${viewedUser.value.firstName || ''} ${viewedUser.value.lastName || ''}`.trim();
  }
  // Fallback if viewedUser is not yet loaded
  return props.userId === authStore.user?.id ? `${authStore.user.firstName} ${authStore.user.lastName}`.trim() : `User ${props.userId}`;
});

const kanbanTitleForReport = computed(() => {
  if (reportMode.value === 'kanbanSpecific' && imputations.value.length > 0) {
    return imputations.value[0]?.task?.kanban?.title || currentContextKanbanId.value;
  }
  return '';
});

const pageTitle = computed(() => {
  if (reportMode.value === 'kanbanSpecific') {
    return `Time on Kanban "${kanbanTitleForReport.value}" for ${viewedUserFullName.value}`;
  }
  return `Timelog Report for ${viewedUserFullName.value}`;
});


const fetchUserReportData = async () => {
  if (!props.userId) return;

  isLoading.value = true;
  error.value = null;
  try {
    // Pass both userId and the resolved kanbanId (which can be null)
    const rawImputations = await reportService.getUserImputationReport(props.userId, currentContextKanbanId.value);

    imputations.value = rawImputations || [];

    if (props.userId === authStore.user?.id) {
      viewedUser.value = { ...authStore.user };
    } else if (imputations.value.length > 0 && imputations.value[0]?.user) {
      viewedUser.value = imputations.value[0].user;
    } else {
      // TODO: Consider a userService.getUser(props.userId) call here if no imputations
      // For now, viewedUser might remain null if not self and no imputations
      // The viewedUserFullName computed property has a fallback.
    }

    // Update document title
    if (reportMode.value === 'kanbanSpecific') {
      // Ensure kanbanTitleForReport has a value, might need to wait for imputations if not passed explicitly
      const titleKanbanPart = (imputations.value.length > 0 && imputations.value[0]?.task?.kanban?.title)
                              ? imputations.value[0].task.kanban.title
                              : (currentContextKanbanId.value || 'Selected Kanban');
      document.title = `Report: ${viewedUserFullName.value} on ${titleKanbanPart}`;
    } else {
      document.title = `Report: ${viewedUserFullName.value}`;
    }

  } catch (err) {
    console.error(`Error fetching user imputation report for user ${props.userId}, kanban ${currentContextKanbanId.value}:`, err);
    error.value = err.message || 'An unknown error occurred.';
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    }
    imputations.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // userId is now from props
  fetchUserReportData();
});

// Watch for changes in props (userId) or route query (kanbanId)
watch([() => props.userId, () => route.query.kanbanId, () => props.kanbanId],
  ([newUserId, newQueryKanbanId, newPropKanbanId], [oldUserId, oldQueryKanbanId, oldPropKanbanId]) => {
    // Check if either relevant part (userId or effective KanbanId) has changed
    const newEffectiveKanbanId = newPropKanbanId || newQueryKanbanId;
    const oldEffectiveKanbanId = oldPropKanbanId || oldQueryKanbanId;

    if (newUserId !== oldUserId || newEffectiveKanbanId !== oldEffectiveKanbanId) {
      if (newUserId !== oldUserId) {
         viewedUser.value = null; // Reset user details if userId changes
      }
      fetchUserReportData();
    }
  },
  { immediate: false } // 'immediate: false' because onMounted handles initial fetch
);

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
  if (reportMode.value === 'kanbanSpecific' || !imputations.value || imputations.value.length === 0) {
    return [];
  }

  const kanbansMap = new Map();
  imputations.value.forEach(imp => {
    if (!imp.task?.kanban) return;

    const kanbanIdVal = imp.task.kanban.id;
    const kanbanTitleVal = imp.task.kanban.title || 'Untitled Kanban';

    if (!kanbansMap.has(kanbanIdVal)) {
      kanbansMap.set(kanbanIdVal, {
        kanbanId: kanbanIdVal,
        kanbanTitle: kanbanTitleVal,
        totalTimeSpentOnKanban: 0,
      });
    }
    kanbansMap.get(kanbanIdVal).totalTimeSpentOnKanban += imp.timeSpent;
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

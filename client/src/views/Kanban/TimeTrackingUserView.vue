<script setup>
import { ref, onMounted, computed, watch } from 'vue';

import KanbanImputationStatsComponent from "@/components/Kanban/KanbanImputationStatsComponent.vue";
import MonthlyImputationReportComponent from "@/components/Kanban/MonthlyImputationReportComponent.vue";
import CustomMonthPicker from '@/components/Kanban/CustomMonthPicker.vue';
import CustomDatePicker from '@/components/Kanban/CustomDatePicker.vue';
import ModalConfirmation from '@/components/ModalConfirmation.vue';
import LoaderComponent from '@/components/LoaderComponent.vue';
import { useAuthStore } from '@/stores/authStore.js';
import { TimeParser } from '@/utils/timeParser.js';
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import logger from '@/utils/logger.js';
import { KanbanService } from '@/services/kanbanService.js';
import { hookApi } from "@/services/requestHook.js";

// Initialize services and data
const kanbanService = new KanbanService();
const timeParser = new TimeParser();
const authStore = useAuthStore();
const {
  isLoading: requestLoading,
  error: requestError,
  executeRequest
} = hookApi();

// Initialize date to current month for that mode.
const today = new Date();
const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));
const currentYear = today.getFullYear();
const currentMonthStr = (today.getMonth() + 1).toString().padStart(2, '0');

// Helper to format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Ref state for template
const kanbans = ref([]);
const errorDate = ref(null);
// Filter states - Initial filter type set to 'customRange' for the rolling month default
const filterType = ref('customRange'); // 'month', 'customRange', 'overall'
// View mode for switching between report and calendar
const currentViewMode = ref('report'); // 'report' or 'calendar'
const previousFilterType = ref(filterType.value);
const showOverallConfirm = ref(false);
// Custom date range
const customStartDate = ref(formatDate(oneMonthAgo));
const customEndDate = ref(formatDate(today));
const selectedMonthYear = ref(`${currentYear}-${currentMonthStr}`);

// Computed Properties
const viewedUser = computed(() => authStore.user);

// Proxy to intercept 'overall' selection
const filterTypeProxy = computed({
  get: () => filterType.value,
  set: (val) => {
    if (val === 'overall') {
      previousFilterType.value = filterType.value;
      showOverallConfirm.value = true;
    } else {
      filterType.value = val;
      previousFilterType.value = val;
    }
  }
});

const reportPeriodDescription = computed(() => {
  if (filterType.value === 'overall') {
    return 'Overall';
  } else if (filterType.value === 'month' && selectedMonthYear.value) {
    const [year, month] = selectedMonthYear.value.split('-');
    const date = new Date(year, month - 1);
    return `for ${date.toLocaleString('default', { month: 'long' })} ${year}`;
  } else if (filterType.value === 'customRange' && customStartDate.value && customEndDate.value) {
    return `from ${customStartDate.value} to ${customEndDate.value}`;
  } else if (filterType.value === 'customRange' && customStartDate.value) {
    return `from ${customStartDate.value}`;
  } else if (filterType.value === 'customRange' && customEndDate.value) {
    return `up to ${customEndDate.value}`;
  }
  return 'for the current period';
});

const grandTotalTimeSpent = computed(() => {
  return kanbans.value.flatMap(k => k.tasks.flatMap(t => t.imputations || [])).reduce((tot, imp) => tot + (imp.timeSpent || 0), 0);
});

// Methods
const fetchUserReportData = async () => {
  let params = {};

  // Set the startDate and endDate based on the selected filter type
  if (filterType.value === 'month' && selectedMonthYear.value) {
    const [year, month] = selectedMonthYear.value.split('-');
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0); // Last day of the month

    params.startDate = startDate.toISOString().split('T')[0];
    params.endDate = endDate.toISOString().split('T')[0];
  } else if (filterType.value === 'customRange') {
    if (customStartDate.value) {
      params.startDate = customStartDate.value;
    }
    if (customEndDate.value) {
      params.endDate = customEndDate.value;
    }
  }

  try {
    const data = await executeRequest(() => kanbanService.getUserTimeTrackingReport(params));
    kanbans.value = data.kanbans || [];
  } catch (err) {
    requestError.value = `Erreur lors de la récupération des imputations. ${requestError.value}`;
    logger.error('Error fetching task details:', err);
    kanbans.value = []; // Clear kanbans on error
  }
};

// Initial fetch on mount
onMounted(() => {
  fetchUserReportData();
  setTitle(`Imputations de ${viewedUser.value.username}`);
  setDescription(`Cette page présente les imputations de ${viewedUser.value.username}`);
});

// Watchers to refetch data when filters change for the 'report' view
watch(filterType, (newType) => {
  if (currentViewMode.value === 'report') {
    if (newType === 'overall') return; // fetch on confirmation
    // Reset dates when changing type to avoid inconsistent states
    if (newType === 'overall') {
      customStartDate.value = '';
      customEndDate.value = '';
    } else if (newType === 'month') {
      customStartDate.value = '';
      customEndDate.value = '';
      if (!selectedMonthYear.value) {
        selectedMonthYear.value = `${currentYear}-${currentMonthStr}`;
      }
    }
    // For customRange, dates are managed by their own inputs/watchers
    fetchUserReportData();
  }
});

watch(selectedMonthYear, (newVal, oldVal) => {
  if (currentViewMode.value === 'report' && filterType.value === 'month' && newVal !== oldVal) {
    fetchUserReportData();
  }
});

watch([customStartDate, customEndDate], ([newStart, newEnd], [oldStart, oldEnd]) => {
  if (currentViewMode.value === 'report' && filterType.value === 'customRange' && (newStart !== oldStart || newEnd !== oldEnd)) {
    if (customStartDate.value || customEndDate.value) {
      if (customStartDate.value && customEndDate.value && new Date(customEndDate.value) < new Date(customStartDate.value)) {
        errorDate.value = "The end date cannot be before the start date.";
        kanbans.value = [];
        return;
      }
      errorDate.value = null;
      fetchUserReportData();
    } else if (!customStartDate.value && !customEndDate.value && (oldStart || oldEnd)) {
      fetchUserReportData();
    }
  }
});

// When switching view mode
watch(currentViewMode, (newMode, oldMode) => {
  if (newMode === 'report' && oldMode === 'calendar') {
    // If data for current report filters needs refresh, fetch it.
    fetchUserReportData();
  }
});

// Confirm/cancel handlers for overall
const confirmOverall = () => {
  filterType.value = 'overall';
  showOverallConfirm.value = false;
  fetchUserReportData();
};
const cancelOverall = () => {
  filterType.value = previousFilterType.value;
  showOverallConfirm.value = false;
};
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Setting Panel-->
    <div>
      <h1 class="text-4xl font-bold mb-6 text-center text-blue-800 dark:text-yellow-300 break-words">
        Timelog Report for {{ viewedUser.firstName }} {{ viewedUser.lastName }}
      </h1>
      <!-- Combined View Mode Toggle and Filter Controls -->
      <div class="mb-8 p-4 flex flex-col gap-4 bg-base-200 dark:bg-slate-800 rounded-lg shadow">
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-200">Filter Imputations (Summary Report)</h2>

          <div class="flex items-center space-x-3">
            <button
                :class="currentViewMode === 'report' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-4 py-2 rounded-md focus:outline-none" @click="currentViewMode = 'report'">
              Summary Report
            </button>
            <button
                :class="currentViewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'"
                class="px-4 py-2 rounded-md focus:outline-none" @click="currentViewMode = 'calendar'">
              Monthly Calendar
            </button>
          </div>
        </div>

        <div v-if="currentViewMode === 'report'" class="w-full flex flex-col gap-4">
          <!-- Filter select row -->
          <div class="flex justify-center">
            <div class="flex items-center gap-4 w-full sm:w-1/2">
              <label for="filterType" class="text-gray-700 dark:text-gray-300 font-medium">Filter By</label>
              <select
                  id="filterType" v-model="filterTypeProxy"
                  class="flex-1 py-2 px-3 mx-0 border border-gray-300 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400">
                <option value="month">Month/Year</option>
                <option value="customRange">Custom Range</option>
                <option value="overall">Overall</option>
              </select>
            </div>
          </div>
          <!-- Date pickers row -->
          <div class="flex justify-center items-center gap-4">
            <div v-if="filterType === 'month'" class="w-full sm:w-1/2">
              <CustomMonthPicker v-model="selectedMonthYear" label="Select Month"/>
            </div>
            <template v-if="filterType === 'customRange'">
              <div class="w-full sm:w-1/3">
                <CustomDatePicker v-model="customStartDate" label="Start Date"/>
              </div>
              <div class="w-full sm:w-1/3">
                <CustomDatePicker v-model="customEndDate" label="End Date"/>
              </div>
            </template>
          </div>
          <!-- Error message -->
          <div
              v-if="errorDate"
              class="text-center text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700"
          >
              {{ errorDate }}
          </div>
<!--          <p-->
<!--              v-if="filterType === 'customRange' && customStartDate && customEndDate && new Date(customEndDate) < new Date(customStartDate)"-->
<!--              class="text-red-500 text-sm text-center"-->
<!--          >-->
<!--            The end date cannot be before the start date.-->
<!--          </p>-->


        </div>
        <!-- Confirmation modal for 'overall' filter -->
        <ModalConfirmation
            v-if="showOverallConfirm"
            question="Êtes-vous sûr de charger toutes vos imputations ? Cela peut prendre un peu de temps."
            @confirm="confirmOverall"
            @cancel="cancelOverall"
        />
      </div>
    </div>

    <div>
      <!-- Report View Content -->
      <div v-if="currentViewMode === 'report'">

        <div v-if="requestLoading" class="flex justify-center items-center h-64">
          <LoaderComponent/>
        </div>

        <div
            v-else-if="requestError"
            class="text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700">
          <p class="font-semibold">Error loading report data:
            <span v-if="requestError">({{ requestError }})</span>
            <span v-if="error">({{ error }})</span>
          </p>
        </div>

        <div v-else>
          <div
              v-if="kanbans.length === 0"
              class="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
            <p>No imputations found for {{ viewedUser.firstName }} {{ viewedUser.lastName }}
              {{ reportPeriodDescription.toLowerCase() }}.</p>
          </div>

          <div v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div
                  class="bg-white dark:bg-slate-700 p-6 rounded-lg shadow dark:shadow-gray-700 col-span-1 md:col-span-2">
                <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
                  Total Time Logged {{ reportPeriodDescription }} by {{ viewedUser.firstName }} {{
                    viewedUser.lastName
                  }}
                </h2>
                <p class="text-3xl font-bold text-blue-600 dark:text-yellow-400">
                  {{ timeParser.formatMinutesToTimeString(grandTotalTimeSpent) }}
                </p>
              </div>
            </div>

            <div v-for="k in kanbans" :key="k.id">
              <KanbanImputationStatsComponent
                  :kanban-title="k.title"
                  :kanban-id="k.id"
                  :imputations="k.tasks.flatMap(task => (task.imputations || []).map(imp => ({ ...imp, taskTitle: task.title, taskId: task.id })))"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Calendar View Content -->
      <div v-else-if="currentViewMode === 'calendar'">
        <MonthlyImputationReportComponent :initial-month="selectedMonthYear"/>
      </div>

      <div v-else>
        <p class="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
          <p>Invalid view mode for report.</p>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-w-xs {
  max-width: 20rem; /* Example for comment column */
}

/* Ensure DaisyUI form elements are styled correctly in dark mode if not by default */
.dark .select, .dark .input {
  color-scheme: dark; /* This can sometimes help with date pickers native UI */
}
</style>

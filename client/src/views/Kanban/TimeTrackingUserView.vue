<script setup>
import { ref, onMounted, computed } from 'vue';

import { KanbanService } from '@/services/kanbanService.js';
import { TimeParser } from '@/utils/timeParser.js';
import LoaderComponent from '@/components/LoaderComponent.vue';
import { useAuthStore } from '@/stores/authStore.js';
import KanbanImputationStats from '@/components/Kanban/KanbanImputationStats.vue';

const kanbanService = new KanbanService();
const timeParser = new TimeParser();
const authStore = useAuthStore();

const kanbans = ref([]);
const viewedUser = computed(() => authStore.user);
const isLoading = ref(false);
const error = ref(null);

const fetchUserReportData = async () => {
  error.value = null;
  isLoading.value = true;
  try {
    const data = await kanbanService.getUserTimeTrackingReport();
    kanbans.value = data.kanbans || [];
  } catch (err) {
    error.value = err.message || 'Unknown error';
  } finally {
    isLoading.value = false;
  }
};

const grandTotalTimeSpent = computed(() => {
  return kanbans.value.flatMap(k => k.tasks.flatMap(t => t.imputations || [])).reduce((tot, imp) => tot + (imp.timeSpent || 0), 0);
});

onMounted(() => {
  fetchUserReportData();
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
    <div v-else-if="kanbans.length === 0" class="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 p-4 rounded-md">
      <h1 class="text-2xl font-semibold mb-4">Timelog Report for {{ viewedUser.firstName }} {{ viewedUser.lastName }}</h1>
      <p>No imputations found for this user.</p>
    </div>
    <div v-else>
      <h1 class="text-4xl font-bold mb-8 text-center text-blue-800 dark:text-yellow-300 break-words">
        Timelog Report for {{ viewedUser.firstName }} {{ viewedUser.lastName }}
      </h1>

      <!-- Overall Summary -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700 col-span-1 md:col-span-2">
          <h2 class="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Total Time Logged by {{ viewedUser.firstName }} {{ viewedUser.lastName }}</h2>
          <p class="text-3xl font-bold text-blue-600">
            {{ timeParser.formatMinutesToTimeString(grandTotalTimeSpent) }}
          </p>
        </div>
      </div>

      <!-- Iterate kanbans -->
      <div v-for="k in kanbans" :key="k.id">
        <KanbanImputationStats :kanban-title="k.title" :imputations="k.tasks.flatMap(t => t.imputations || [])" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.max-w-xs {
  max-width: 20rem; /* Example for comment column */
}
</style>

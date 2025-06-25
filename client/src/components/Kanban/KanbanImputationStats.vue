<script setup>
import { reactive, computed } from 'vue';
import { RouterLink } from 'vue-router';

import { TimeParser } from '@/utils/timeParser.js';

const props = defineProps({
  kanbanTitle: { type: String, default: 'Kanban' },
  kanbanId: { type: [String, Number], required: true },
  imputations: { type: Array, default: () => [] },
});

const timeParser = new TimeParser();

const filters = reactive({
  startDate: '',
  endDate: '',
});

const filteredImputations = computed(() => {
  return [...props.imputations]
    .filter(imp => {
      const impDate = new Date(imp.date);
      if (filters.startDate && impDate < new Date(filters.startDate)) return false;
      if (filters.endDate && impDate > new Date(filters.endDate)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalMinutes = computed(() => filteredImputations.value.reduce((sum, imp) => sum + (imp.timeSpent || 0), 0));
const averageMinutes = computed(() => (filteredImputations.value.length ? totalMinutes.value / filteredImputations.value.length : 0));

const totalTimeFormatted = computed(() => timeParser.formatMinutesToTimeString(totalMinutes.value));
const averageTimeFormatted = computed(() => timeParser.formatMinutesToTimeString(averageMinutes.value));

function resetFilters() {
  filters.startDate = '';
  filters.endDate = '';
}

</script>

<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow dark:shadow-gray-700 mb-6">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2 md:mb-0">
        {{ kanbanTitle }} — {{ filteredImputations.length }} imputations
      </h3>
      <div class="flex flex-wrap gap-2 items-center">
        <label class="text-sm text-gray-600 dark:text-gray-300">Start:</label>
        <input v-model="filters.startDate" type="date" class="border rounded px-2 py-1 text-sm" />
        <label class="text-sm text-gray-600 dark:text-gray-300">End:</label>
        <input v-model="filters.endDate" type="date" class="border rounded px-2 py-1 text-sm" />
        <button class="text-xs text-blue-600 hover:underline" @click="resetFilters">Reset</button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
      <div class="p-4 bg-blue-50 dark:bg-slate-700 rounded">
        <p class="text-sm text-gray-600 dark:text-gray-300">Total Time Spent</p>
        <p class="text-2xl font-bold text-blue-600 dark:text-yellow-300">{{ totalTimeFormatted }}</p>
      </div>
      <div class="p-4 bg-green-50 dark:bg-slate-700 rounded">
        <p class="text-sm text-gray-600 dark:text-gray-300">Average / Imputation</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-300">{{ averageTimeFormatted }}</p>
      </div>
    </div>

    <details open>
      <summary class="cursor-pointer text-blue-600 dark:text-yellow-300 mb-2">Imputations ({{ filteredImputations.length }})</summary>
      <ul class="list-disc ml-6 text-sm text-gray-700 dark:text-gray-300 max-h-64 overflow-y-auto pr-2">
        <li v-for="imp in filteredImputations" :key="imp.id" class="mb-1">
          <span class="font-medium">{{ new Date(imp.date).toLocaleDateString() }}:</span>
          <template v-if="imp.task && imp.task.id">
            <RouterLink
              :to="`/kanban/${kanbanId}/task/${imp.task.id}`"
              class="mx-1 text-blue-600 hover:underline dark:text-yellow-300"
            >
              {{ imp.task.title || 'Task' }}
            </RouterLink>
          </template>
          <template v-else>
            <span class="mx-1">{{ imp.task?.title || imp.taskTitle || 'Task' }}</span>
          </template>
          — {{ timeParser.formatMinutesToTimeString(imp.timeSpent || imp.timeSpentMinutes || 0) }}
        </li>
      </ul>
    </details>
  </div>
</template>



<style scoped>
/****** optional custom styles ******/
</style>

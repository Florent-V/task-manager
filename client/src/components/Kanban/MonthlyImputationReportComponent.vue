<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';

import LoaderComponent from '@/components/Loader/LoaderComponent.vue';
import { useAuthStore } from '@/stores/authStore.js';
import { TimeParser } from '@/utils/timeParser.js';
import logger from '@/utils/logger.js';
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import { KanbanService } from '@/services/kanbanService.js';
import { hookApi } from "@/services/requestHook.js";

// Props
const props = defineProps({
  initialMonth: {
    type: String,
    default: () => {
      const d = new Date();
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    }
  }
});

// Initialize services and data
const authStore = useAuthStore();
const kanbanService = new KanbanService();
const timeParser = new TimeParser();
const {
  isLoading: requestLoading,
  error: requestError,
  executeRequest
} = hookApi();

// State
const errorUser = ref(null);
const imputationsData = ref([]); // Raw imputations from the API for the current month
const currentDisplayMonth = ref(props.initialMonth); // YYYY-MM format

// Computed Properties
const viewedUser = computed(() => authStore.user);
const year = computed(() => parseInt(currentDisplayMonth.value.split('-')[0]));
const month = computed(() => parseInt(currentDisplayMonth.value.split('-')[1])); // 1-12
const monthName = computed(() => {
  const date = new Date(year.value, month.value - 1);
  return date.toLocaleString('default', { month: 'long' });
});
const daysInMonth = computed(() => {
  // Day 0 of next month gives last day of current month
  return new Date(year.value, month.value, 0).getDate();
});
// For the template, an array of day numbers
const dayNumbers = computed(() => Array.from({ length: daysInMonth.value }, (_, i) => i + 1));

// Methods
const fetchMonthlyImputations = async () => {

  if (!viewedUser.value?.id) {
    errorUser.value = 'No user found';
    return;
  }

  const startDate = `${currentDisplayMonth.value}-01`;
  const endDate = `${currentDisplayMonth.value}-${daysInMonth.value.toString().padStart(2, '0')}`;

  try {
    const response = await executeRequest(
        () => kanbanService.getUserTimeTrackingReport({ startDate, endDate })
    );
    // We need a flat list of imputations, each with task info (id, title, kanbanId)
    let allImputations = [];
    if (response.kanbans) {
      response.kanbans.forEach(kanban => {
        kanban.tasks.forEach(task => {
          task.imputations.forEach(imp => {
            allImputations.push({
              ...imp,
              taskId: task.id,
              taskTitle: task.title,
              kanbanId: kanban.id,
              kanbanTitle: kanban.title,
            });
          });
        });
      });
    }
    imputationsData.value = allImputations;
  } catch (err) {
    logger.error('Error fetching monthly imputations:', err);
    requestError.value = `Erreur lors de la recherche des imputations mensuelles: ${err.message}`;
    imputationsData.value = [];
  }
};

// Navigation
const goToPreviousMonth = () => {
  const currentDate = new Date(year.value, month.value - 1, 1);
  currentDate.setMonth(currentDate.getMonth() - 1);
  currentDisplayMonth.value = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
};

const goToNextMonth = () => {
  const currentDate = new Date(year.value, month.value - 1, 1);
  currentDate.setMonth(currentDate.getMonth() + 1);
  currentDisplayMonth.value = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}`;
};

const goToCurrentMonth = () => {
  const d = new Date();
  currentDisplayMonth.value = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

// Data transformation for the calendar grid
const calendarData = computed(() => {
  const tasksMap = new Map(); // Key: taskId, Value: { title, kanbanId, kanbanTitle, days: Map<day, totalTimeSpent> }

  imputationsData.value.forEach(imp => {
    const taskKey = imp.taskId;
    if (!tasksMap.has(taskKey)) {
      tasksMap.set(taskKey, {
        id: imp.taskId,
        title: imp.taskTitle,
        kanbanId: imp.kanbanId,
        kanbanTitle: imp.kanbanTitle,
        days: new Map(), // Key: day of month (1-31), Value: total time spent
        totalTaskTime: 0,
      });
    }
    const taskEntry = tasksMap.get(taskKey);

    const impDate = new Date(imp.date);
    const dayOfMonth = impDate.getDate(); // getDate() is 1-indexed

    const currentTime = taskEntry.days.get(dayOfMonth) || 0;
    taskEntry.days.set(dayOfMonth, currentTime + (imp.timeSpent || 0));
    taskEntry.totalTaskTime += (imp.timeSpent || 0);
  });
  return Array.from(tasksMap.values()).sort((a, b) => a.title.localeCompare(b.title));
});

const dailyTotals = computed(() => {
  const totals = new Array(daysInMonth.value + 1).fill(0); // 1-indexed for days
  calendarData.value.forEach(task => {
    task.days.forEach((timeSpent, day) => {
      totals[day] += timeSpent;
    });
  });
  return totals; // totals[0] will be 0, totals[1] for day 1 etc.
});

const grandTotalMonthlyTime = computed(() => {
  return dailyTotals.value.reduce((sum, time) => sum + time, 0);
});

// Fetch data when the component mounts or when the month changes
onMounted(() => {
  // Ensure user is available before initial fetch if not covered by immediate watcher
  if (viewedUser.value?.id) {
    fetchMonthlyImputations();
  }
  setTitle(`Imputations mensuelles de ${viewedUser.value.username}`);
  setDescription(`Cette page affiche les imputations mensuelles de ${viewedUser.value.username}`);
});

watch(currentDisplayMonth, fetchMonthlyImputations);

watch(() => authStore.user, (newUser, oldUser) => {
  // Fetch if user becomes available or changes (e.g. login/logout then login as different user)
  if (newUser?.id && newUser.id !== oldUser?.id) {
    fetchMonthlyImputations();
  } else if (!newUser?.id && imputationsData.value.length > 0) {
    // User logged out, clear data
    imputationsData.value = [];
    errorUser.value = "User logged out.";
  }
}, { immediate: true }); // Immediate true helps on initial load if user is already logged in

watch(() => props.initialMonth, (newInitialMonth) => {
  // If the parent component changes the initialMonth prop, update currentDisplayMonth
  // This is useful if the calendar is already mounted and parent wants to "reset" its view
  if (newInitialMonth && newInitialMonth !== currentDisplayMonth.value) {
    currentDisplayMonth.value = newInitialMonth;
    // The watcher on currentDisplayMonth will trigger fetchMonthlyImputations
  }
});
</script>

<template>
  <div class="p-4 bg-base-100 dark:bg-slate-800 shadow-lg rounded-lg">
    <div
        v-if="errorUser"
        class="text-center text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 p-4 rounded-md border border-red-300 dark:border-red-700"
    >
      {{ errorUser }}
    </div>

    <div v-else>
      <div class="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 dark:text-gray-100">
          Monthly Log: {{ monthName }} {{ year }}
        </h2>
        <div class="flex items-center gap-2 mt-3 sm:mt-0">
          <button
              class="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-slate-700"
              @click="goToPreviousMonth">&lt; Prev
          </button>
          <button
              class="px-3 py-1 border border-gray-400 text-gray-700 rounded hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-slate-700"
              @click="goToCurrentMonth">Today
          </button>
          <button
              class="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 dark:border-yellow-400 dark:text-yellow-400 dark:hover:bg-slate-700"
              @click="goToNextMonth">Next &gt;
          </button>
        </div>
      </div>

      <div v-if="requestLoading" class="flex justify-center items-center h-64">
        <LoaderComponent/>
      </div>
      <div
          v-else-if="requestError"
          class="text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 p-4 rounded-md">
        <p class="font-semibold">Error:
          <span v-if="requestError">({{ requestError }})</span>
        </p>
      </div>
      <div
          v-else-if="calendarData.length === 0"
          class="text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700/50 p-4 rounded-md text-center">
        No imputations found for {{ monthName }} {{ year }}.
      </div>

      <div v-else class="overflow-x-auto">
        <table
            class="min-w-full border border-gray-200 dark:border-slate-700 divide-y divide-gray-200 dark:divide-slate-700">
          <thead class="bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
          <tr>
            <th class="sticky left-0 z-10 bg-gray-50 dark:bg-slate-700 p-2 min-w-[200px] md:min-w-[250px]">Task</th>
            <th
                v-for="day in dayNumbers" :key="`header-${day}`"
                class="p-2 text-center min-w-[60px] hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
              {{ day }}
            </th>
            <th class="p-2 text-center font-bold min-w-[80px] sticky right-0 z-10 bg-gray-50 dark:bg-slate-700">Total</th>
          </tr>
          </thead>
          <tbody class="bg-white dark:bg-slate-800">
          <tr
              v-for="task in calendarData" :key="task.id"
              class="bg-white even:bg-gray-50 dark:bg-slate-800 dark:even:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors">
            <td class="sticky left-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-600/30 p-2 border-t border-gray-200 dark:border-slate-700">
              <RouterLink
                  :to="`/kanban/${task.kanbanId}/task/${task.id}`"
                  class="text-blue-600 hover:underline dark:text-yellow-400 dark:hover:text-yellow-300 font-medium"
                  :title="`Kanban: ${task.kanbanTitle}`"
              >
                {{ task.title }}
              </RouterLink>
              <div class="text-xs text-gray-500 dark:text-gray-400">{{ task.kanbanTitle }}</div>
            </td>
            <td
                v-for="day in dayNumbers" :key="`task-${task.id}-day-${day}`"
                class="p-2 text-center border-t border-gray-200 dark:border-slate-700">
              <span v-if="task.days.get(day)" class="text-sm">
                {{ timeParser.formatMinutesToHourMinuteString(task.days.get(day)) }}
              </span>
              <span v-else class="text-gray-400 dark:text-slate-500">-</span>
            </td>
            <td class="p-2 text-center font-bold border-t border-gray-200 dark:border-slate-700 sticky right-0 z-10 bg-white dark:bg-slate-800 group-hover:bg-gray-50 dark:group-hover:bg-slate-600/30">
              {{ timeParser.formatMinutesToHourMinuteString(task.totalTaskTime) }}
            </td>
          </tr>
          </tbody>
          <tfoot class="bg-gray-100 dark:bg-slate-700 font-bold text-gray-800 dark:text-gray-100">
          <tr>
            <td class="sticky left-0 z-10 bg-gray-100 dark:bg-slate-700 p-2">Monthly Total</td>
            <td v-for="day in dayNumbers" :key="`footer-day-${day}`" class="p-2 text-center">
              <span v-if="dailyTotals[day] > 0">
                {{ timeParser.formatMinutesToHourMinuteString(dailyTotals[day]) }}
              </span>
              <span v-else>-</span>
            </td>
            <td class="p-2 text-center sticky right-0 z-10 bg-gray-100 dark:bg-slate-700">
              {{ timeParser.formatMinutesToHourMinuteString(grandTotalMonthlyTime) }}
            </td>
          </tr>
          </tfoot>
        </table>
      </div>

    </div>


  </div>
</template>

<style scoped>
/* Sticky header and first column styling */
.table th.sticky, .table td.sticky {
  position: sticky;
  /* Ensure background is opaque if rows behind have different colors on hover etc. */
}

.table th.sticky.left-0, .table td.sticky.left-0 {
  left: 0;
}

.table th.sticky.right-0, .table td.sticky.right-0 {
  right: 0;
}

/* Highlight for today's column - needs JS to add a class */
.today-column {
  /* background-color: #f0f8ff; /* Example: AliceBlue */
  /* outline: 1px solid #4A90E2; /* Example: Blue outline */
}

/* Dark mode for today's column */
.dark .today-column {
  /* background-color: #2c3e50; /* Example: Darker blue/grey */
  /* outline: 1px solid #F39C12; /* Example: Orange outline */
}

.table-sm td, .table-sm th {
  padding: 0.5rem; /* Adjust padding for sm table */
}
</style>

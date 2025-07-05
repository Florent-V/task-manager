<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: { // Format YYYY-MM-DD
    type: String,
    default: '',
    validator: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) || value === '',
  },
  label: {
    type: String,
    default: 'Select Date'
  },
  placeholder: {
    type: String,
    default: 'YYYY-MM-DD'
  }
});

const emit = defineEmits(['update:modelValue']);

const showCalendar = ref(false);
const calendarRef = ref(null); // For dropdown positioning or click outside

// Calendar display state
const today = new Date();
const displayYear = ref(today.getFullYear());
const displayMonth = ref(today.getMonth()); // 0-11 for Date object month

// When modelValue changes, update calendar display month/year if a valid date is provided
watch(() => props.modelValue, (newValue) => {
  if (newValue && /^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
    const [year, month, day] = newValue.split('-').map(Number);
    displayYear.value = year;
    displayMonth.value = month - 1; // Date object month is 0-11
  } else if (!newValue) { // If modelValue is cleared, reset calendar to today's month
    displayYear.value = today.getFullYear();
    displayMonth.value = today.getMonth();
  }
}, { immediate: true });


const formattedDisplayDate = computed(() => {
  if (!props.modelValue) return props.placeholder;
  // Optionally, format more nicely, e.g., "Jul 5, 2024"
  // For now, keep YYYY-MM-DD or could use toLocaleDateString
  try {
    const [year, month, day] = props.modelValue.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return props.placeholder;
  }
});

const currentCalendarMonthName = computed(() => {
  return new Date(displayYear.value, displayMonth.value).toLocaleString('default', { month: 'long', year: 'numeric' });
});

const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const calendarGrid = computed(() => {
  const year = displayYear.value;
  const month = displayMonth.value; // 0-11
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();

  let days = [];
  // Add blank days for the start of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ date: null, isCurrentMonth: false });
  }
  // Add days of the current month
  for (let i = 1; i <= daysInCurrentMonth; i++) {
    days.push({ date: new Date(year, month, i), dayNum: i, isCurrentMonth: true });
  }
  return days;
});

function isSelectedDate(calDay) {
  if (!calDay.date || !props.modelValue) return false;
  const [year, month, day] = props.modelValue.split('-').map(Number);
  const selectedDate = new Date(year, month - 1, day);
  return calDay.date.toDateString() === selectedDate.toDateString();
}

function isToday(calDay) {
  if (!calDay.date) return false;
  return calDay.date.toDateString() === today.toDateString();
}

function selectDate(calDay) {
  if (!calDay.date) return;
  const year = calDay.date.getFullYear();
  const month = (calDay.date.getMonth() + 1).toString().padStart(2, '0');
  const day = calDay.date.getDate().toString().padStart(2, '0');
  emit('update:modelValue', `${year}-${month}-${day}`);
  showCalendar.value = false;
}

function changeDisplayMonth(offset) {
  let newMonth = displayMonth.value + offset;
  let newYear = displayYear.value;
  if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  } else if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  }
  displayMonth.value = newMonth;
  displayYear.value = newYear;
}

function toggleCalendar() {
  showCalendar.value = !showCalendar.value;
}

// Click outside to close - basic version
function handleClickOutside(event) {
  if (calendarRef.value && !calendarRef.value.contains(event.target)) {
    // Check if the click was on the toggle button itself
    const toggleButton = calendarRef.value.previousElementSibling; // Assuming button is direct sibling
    if (toggleButton && toggleButton.contains(event.target)) {
      return;
    }
    showCalendar.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true);
});

import { onUnmounted } from 'vue';
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
});

</script>

<template>
  <div ref="calendarRef" class="relative w-full">
    <label v-if="label" for="dateInput" class="block w-full text-center mb-2 text-gray-700 dark:text-gray-300 font-medium">{{ label }}</label>
    <div
        id="dateInput"
        tabindex="0"
        role="button"
        class="w-full py-2 px-3 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-md flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-yellow-400 min-h-[2.5rem]"
        :class="{'text-gray-400 dark:text-slate-500': !modelValue}"
        aria-haspopup="true"
        :aria-expanded="showCalendar"
        @click="toggleCalendar"
    >
      <span>{{ formattedDisplayDate }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-gray-400">
        <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
      </svg>
    </div>

    <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
    >
      <div v-if="showCalendar" class="absolute z-50 mt-1 w-full sm:w-80 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 p-4 shadow-lg rounded-md">
        <div class="flex justify-between items-center mb-3">
          <button aria-label="Previous month" @click.stop="changeDisplayMonth(-1)" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600">
            &lt;
          </button>
          <div class="font-semibold text-gray-800 dark:text-gray-200 text-center" aria-live="polite">{{ currentCalendarMonthName }}</div>
          <button aria-label="Next month" @click.stop="changeDisplayMonth(1)" class="p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600">
            &gt;
          </button>
        </div>
        <div class="grid grid-cols-7 gap-1 text-center text-xs dark:text-gray-300">
          <div v-for="dayName in daysInWeek" :key="dayName" class="font-medium p-1">{{ dayName }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1 mt-1">
          <div v-for="(calDay, index) in calendarGrid" :key="index" class="h-8">
            <button
                v-if="calDay.date"
                class="w-full h-full rounded-btn text-sm flex items-center justify-center transition-colors"
                :class="{
                'bg-primary text-primary-content dark:bg-yellow-400 dark:text-slate-900': isSelectedDate(calDay),
                'hover:bg-gray-200 dark:hover:bg-slate-600': !isSelectedDate(calDay),
                'text-gray-800 dark:text-gray-100': !isSelectedDate(calDay),
                'ring-1 ring-accent dark:ring-yellow-500': isToday(calDay) && !isSelectedDate(calDay),
                'font-semibold': isSelectedDate(calDay) || isToday(calDay)
              }"
                @click.stop="selectDate(calDay)"
            >
              {{ calDay.dayNum }}
            </button>
          </div>
        </div>
        <button @click.stop="showCalendar = false" class="w-full py-2 mt-3 border border-gray-300 dark:border-slate-600 rounded-md text-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600">Close</button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* Minimal styling, relying on Tailwind */
</style>

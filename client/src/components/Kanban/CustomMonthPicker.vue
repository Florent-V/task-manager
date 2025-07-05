<script setup>
import { ref, computed, watchEffect } from 'vue';

const props = defineProps({
  modelValue: { // Format YYYY-MM
    type: String,
    required: true,
    validator: (value) => /^\d{4}-\d{2}$/.test(value) || value === '',
  },
  label: {
    type: String,
    default: 'Selected Month'
  }
});

const emit = defineEmits(['update:modelValue']);

const currentYear = ref(0);
const currentMonth = ref(0); // 1-12

// Parse modelValue to set year and month
watchEffect(() => {
  if (props.modelValue) {
    const [yearVal, monthVal] = props.modelValue.split('-').map(Number);
    currentYear.value = yearVal;
    currentMonth.value = monthVal;
  } else {
    // Default to current month if modelValue is empty or invalid initially
    const today = new Date();
    currentYear.value = today.getFullYear();
    currentMonth.value = today.getMonth() + 1;
    // Optionally emit this default if modelValue was indeed empty
    // emit('update:modelValue', `${currentYear.value}-${currentMonth.value.toString().padStart(2, '0')}`);
  }
});

const displayedDate = computed(() => {
  if (!currentYear.value || !currentMonth.value) return '...';
  const date = new Date(currentYear.value, currentMonth.value - 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
});

function changeMonth(offset) {
  let newMonth = currentMonth.value + offset;
  let newYear = currentYear.value;

  if (newMonth > 12) {
    newMonth = 1;
    newYear++;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear--;
  }
  currentMonth.value = newMonth;
  currentYear.value = newYear;
  emit('update:modelValue', `${newYear}-${newMonth.toString().padStart(2, '0')}`);
}
</script>

<template>
  <div class="w-full">
    <label v-if="label" class="block text-center mb-2 text-gray-700 dark:text-gray-300 font-medium">{{ label }}</label>
    <div class="flex items-center border border-gray-300 dark:border-slate-600 rounded-md overflow-hidden">
      <button
          type="button"
          class="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none"
          @click="changeMonth(-1)"
      >
        <v-icon name="co-chevron-left" class="w-5 h-5 text-gray-600 dark:text-gray-200"/>
      </button>
      <div class="flex-1 text-center py-2 text-sm text-gray-800 dark:text-gray-200">
        {{ displayedDate }}
      </div>
      <button
          type="button"
          class="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 focus:outline-none"
          @click="changeMonth(1)"
      >
        <v-icon name="co-chevron-right" class="w-5 h-5 text-gray-600 dark:text-gray-200"/>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* No custom CSS needed; Tailwind covers styling */
</style>

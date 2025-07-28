<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search...'
  }
});

const emit = defineEmits(['update:modelValue']);

const internalValue = ref(props.modelValue);

watch(internalValue, (newValue) => {
  emit('update:modelValue', newValue);
});

watch(() => props.modelValue, (newValue) => {
  internalValue.value = newValue;
});
</script>

<template>
  <div class="relative">
    <input
        v-model="internalValue"
        :placeholder="placeholder"
        class="w-full px-4 py-2 pr-10 text-gray-700 bg-white border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
        type="text"
    />
    <span class="absolute inset-y-0 right-0 flex items-center pr-3">
      <v-icon name="fa-search" class="text-gray-400" />
    </span>
  </div>
</template>

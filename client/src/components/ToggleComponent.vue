<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
  state: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: 'Toggle Name',
  },
});

const emit = defineEmits(['update:state']);

const isActive = ref(props.state);

const toggleButton = () => {
  emit('update:state', !props.state);
};
</script>

<template>
  <div class="flex items-center">
    <span class="mr-3 text-sm font-semibold">{{ label }}</span>
    <div
        class="relative w-16 h-8 bg-gray-300 rounded-full p-1 cursor-pointer"
        :class="{ 'bg-green-500': state, 'bg-red-500': !state }"
        @click="toggleButton"
    >
      <div
          class="absolute top-1 left-1 h-6 w-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out"
          :class="{ 'translate-x-8': state }"
          style="width: 24px; height: 24px;"
      ></div>
    </div>
  </div>
</template>



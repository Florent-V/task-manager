<script setup>
import { toRefs } from 'vue';

import { hookApi } from '@/services/requestHook.js';
import { TaskService } from '@/services/taskService.js';
import logger from "@/utils/logger.js";

// Props
const props = defineProps({
  kanbanId: {
    type: [String, Number],
    required: true
  },
  taskId: {
    type: [String, Number],
    required: true
  },
  isArchived: {
    type: Boolean,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:isArchived', 'error']);

const { kanbanId, taskId, isArchived } = toRefs(props);
const taskService = new TaskService();
const { isLoading, error, executeRequest } = hookApi();

async function toggle() {
  try {
    await executeRequest(() =>
      isArchived.value
        ? taskService.restoreTask(kanbanId.value, taskId.value)
        : taskService.archiveTask(kanbanId.value, taskId.value)
    );
    emit('update:isArchived', !isArchived.value);
  } catch (err) {
    logger.error('Error toggling task archive status:', err);
    emit('error', error);
  }
}
</script>

<template>
  <!-- Button slot only -->
  <slot :on-click="toggle" :loading="isLoading" />
</template>

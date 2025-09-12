<script setup>
import { defineProps, computed } from 'vue';

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
});
// Helper computed properties to gracefully handle potentially nested data
// and provide fallbacks if properties are missing or have slightly different names.
const description = computed(() => props.task?.description || '');
const priorityLabel = computed(() => props.task?.priority?.label || props.task?.priorityLabel || 'N/A');
const sizeLabel = computed(() => props.task?.size?.label || props.task?.sizeLabel || 'N/A');
const assignedTo = computed(() => {
  if (props.task?.assignee && props.task.assignee.firstName) {
    return `${props.task.assignee.firstName} ${props.task.assignee.lastName}`;
  }
  return props.task?.assignedTo || 'Unassigned';
});
const stageLabel = computed(() => props.task?.stage?.title || props.task?.stageLabel || 'N/A');

</script>
<template>
  <div class="space-y-6">
    <!-- Description -->
    <div>
      <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Description</h3>
      <div class="prose dark:prose-invert max-w-none mt-2 text-gray-600 dark:text-gray-400" v-html="description"></div>
    </div>
    <!-- Additional Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Priorité</h3>
        <p class="mt-1 text-gray-600 dark:text-gray-400">{{ priorityLabel }}</p>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Taille</h3>
        <p class="mt-1 text-gray-600 dark:text-gray-400">{{ sizeLabel }}</p>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Assignée à</h3>
        <p class="mt-1 text-gray-600 dark:text-gray-400">{{ assignedTo }}</p>
      </div>
      <div>
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Colonne</h3>
        <p class="mt-1 text-gray-600 dark:text-gray-400">{{ stageLabel }}</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* If any specific styles were tied to these elements, they can be moved here or ensured they are inherited. */
/* For now, assuming Tailwind CSS classes handle styling adequately. */
</style>
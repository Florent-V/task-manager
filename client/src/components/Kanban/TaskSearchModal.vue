<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  show: {
    type: Boolean,
    required: true
  }
});

const router = useRouter();

const goToTask = (task) => {
  router.push(`/kanban/${task.kanbanId}/task/${task.id}`);
};
</script>

<template>
  <div v-if="show" class="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
    <ul class="max-h-60 overflow-auto">
      <li
          v-for="task in tasks"
          :key="task.id"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
          @click="goToTask(task)"
      >
        <p class="font-semibold text-gray-900 dark:text-gray-200">{{ task.title }}</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">{{ $cropText(task.description, 100) }}</p>
      </li>
      <li v-if="tasks.length === 0" class="px-4 py-2 text-gray-500">
        Aucune tâche trouvée.
      </li>
    </ul>
  </div>
</template>

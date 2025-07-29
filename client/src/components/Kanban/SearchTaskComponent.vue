<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import SearchComponent from './SearchComponent.vue';
import TaskSearchModal from './TaskSearchModal.vue';
import logger from '@/utils/logger.js';
import { hookApi } from "@/services/requestHook.js";
import { TaskService } from '@/services/taskService.js';

// Initialize services and data
const route = useRoute();
const taskService = new TaskService();
const { isLoading,  error, executeRequest} = hookApi();

// State
const searchQuery = ref('');
const searchedTasks = ref([]);
const showSearchModal = ref(false);

watch(searchQuery, async (newValue) => {
  if (newValue) {
    try {
      const response = await taskService.getTasks(route.params.id, newValue);
      searchedTasks.value = response.tasks;
      showSearchModal.value = true;
    } catch (err) {
      logger.error('Error fetching tasks', err);
    }
  } else {
    searchedTasks.value = [];
    showSearchModal.value = false;
  }
});
</script>

<template>
  <div class="relative w-full">
    <SearchComponent v-model="searchQuery" placeholder="Rechercher une tâche..." />
    <TaskSearchModal :tasks="searchedTasks" :show="showSearchModal" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import LoaderComponent from '@/components/Loader/LoaderComponent.vue';
import SearchComponent from './SearchComponent.vue';
import TaskSearchModal from './TaskSearchModal.vue';
import logger from '@/utils/logger.js';
import { hookApi } from "@/services/requestHook.js";
import { TaskService } from '@/services/taskService.js';

// Initialize services and data
const route = useRoute();
const taskService = new TaskService();
const { error, executeRequest} = hookApi();

// State
const searchQuery = ref('');
const searchedTasks = ref([]);
const showSearchModal = ref(false);

watch(searchQuery, async (newValue) => {
  if (newValue) {
    try {
      showSearchModal.value = true;
      const response = await executeRequest(
          () => taskService.getTasks(route.params.id, newValue)
      );
      searchedTasks.value = response.tasks;
    } catch (err) {
      logger.error('Error fetching tasks', err);
    }
  } else {
    console.log('ici')
    searchedTasks.value = [];
    showSearchModal.value = false;
  }
});
</script>

<template>
  <div class="relative w-full">
    <SearchComponent
        v-model="searchQuery"
        placeholder="Rechercher une tâche..."
    />
    <TaskSearchModal
        :tasks="searchedTasks"
        :show="showSearchModal"
        :error="error"
    />
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
  totalItems: {
    type: Number,
    required: true,
  },
  itemsPerPage: {
    type: Number,
    required: true,
  }
});

const emit = defineEmits(['update:currentPage']);

const firstItemIndex = computed(() => {
  if (props.totalItems === 0) return 0;
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const lastItemIndex = computed(() => {
  const last = props.currentPage * props.itemsPerPage;
  return Math.min(last, props.totalItems);
});

const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && props.totalPages > 0) {
    emit('update:currentPage', page);
  }
};

const prevPage = () => {
  goToPage(props.currentPage - 1);
};

const nextPage = () => {
  goToPage(props.currentPage + 1);
};

</script>

<template>
  <nav aria-label="Pagination" class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
    <div class="hidden sm:block">
      <p>
        Showing
        <span class="font-medium">{{ firstItemIndex }}</span>
        to
        <span class="font-medium">{{ lastItemIndex }}</span>
        of
        <span class="font-medium">{{ totalItems }}</span>
        results
      </p>
    </div>
    <div class="flex items-center space-x-2">
      <button
          @click="goToPage(1)"
          :disabled="currentPage === 1 || totalPages === 0"
          class="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="First page"
      >
        <span class="sr-only">First</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M8.354 1.646a.5.5 0 0 1 0 .708L2.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
          <path fill-rule="evenodd" d="M12.354 1.646a.5.5 0 0 1 0 .708L6.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>
      <button
          @click="prevPage"
          :disabled="currentPage === 1 || totalPages === 0"
          class="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
      >
        <span class="sr-only">Previous</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-left" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
        </svg>
      </button>

      <span v-if="totalPages > 0" class="px-2 py-1">Page {{ currentPage }} of {{ totalPages }}</span>
      <span v-else class="px-2 py-1">Page 0 of 0</span>

      <button
          @click="nextPage"
          :disabled="currentPage === totalPages || totalPages === 0"
          class="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
      >
        <span class="sr-only">Next</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
      <button
          @click="goToPage(totalPages)"
          :disabled="currentPage === totalPages || totalPages === 0"
          class="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Last page"
      >
        <span class="sr-only">Last</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-right" viewBox="0 0 16 16">
          <path fill-rule="evenodd" d="M3.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L9.293 8 3.646 2.354a.5.5 0 0 1 0-.708z"/>
          <path fill-rule="evenodd" d="M7.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L13.293 8 7.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/* Additional styling if needed, though Tailwind should cover most */
</style>

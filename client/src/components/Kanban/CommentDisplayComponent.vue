<script setup>
import { ref, computed, onMounted, watch } from 'vue';

import LoaderComponent from '@/components/LoaderComponent.vue';
import { TaskService } from '@/services/taskService.js';
import { useKanbanStore } from '@/stores/kanbanStore.js';
import { useAuthStore } from '@/stores/authStore';
import { useHandleRequestStore } from "@/stores/handleRequestStore.js";
import logger from '@/utils/logger.js';

const taskService = new TaskService();
const kanbanStore = useKanbanStore();
const handleRequestStore = useHandleRequestStore();
const authStore = useAuthStore();

// Props
const props = defineProps({
  kanbanId: {
    type: String,
    required: true
  },
  taskId: {
    type: String,
    required: true
  },
  showFormButton: {
    type: Boolean,
    default: true
  }
});

// State
const comments = ref([]);

// Emits
const emit = defineEmits([
  'create-comment',
  'edit-comment',
  'delete-comment',
]);

// Computed Properties
const requestLoading = computed(() => handleRequestStore.isLoading);
const requestError = computed(() => handleRequestStore.error);

// Methods
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const fetchComments = async () => {
  logger.debug(`Fetching comments for task ${props.taskId}`);
  try {
    const data = await taskService.getComments(props.kanbanId, props.taskId);
    comments.value = kanbanStore.enrichComments(data.comments);
    logger.info('Comments fetched successfully:', comments.value);
  } catch (err) {
    logger.error('Error fetching comments:', err);
  }
};

const handleDeleteComment = async (commentId) => {
  emit('delete-comment', commentId);
};

const deleteComment = async (commentId) => {
  try {
    await taskService.deleteComment(props.kanbanId, props.taskId, commentId);
    comments.value = comments.value.filter(comment => comment.id !== commentId);
    logger.info('Comment deleted successfully');
  } catch (err) {
    logger.error('Error deleting comment:', err);
  }
};

const addComment = (comment) => {
  comments.value.push(kanbanStore.enrichComment(comment));
};

const updateComment = (updatedComment) => {
  const index = comments.value.findIndex(item => item.id === updatedComment.id);
  if (index !== -1) {
    comments.value[index] = kanbanStore.enrichComment(updatedComment);
  }
};

// Computed
const sortedComments = computed(() => {
  return [...comments.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Expose methods for parent component
defineExpose({
  addComment,
  updateComment,
  deleteComment,
  fetchComments
});

// Watch for prop changes
watch([() => props.kanbanId, () => props.taskId], () => {
  if (props.kanbanId && props.taskId) {
    fetchComments();
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  if (props.kanbanId && props.taskId) {
    fetchComments();
  }
});
</script>

<template>
  <div class="w-1/2 p-4 border rounded-lg dark:border-gray-700">
    <!-- Header Component-->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Commentaires</h3>
      <!-- Add button -->
      <div v-if="showFormButton" class="text-right">
        <button
            class="bg-blue-600 dark:bg-yellow-400 text-white px-2 py-2 rounded"
            @click="$emit('create-comment')"
        >
        <span class="flex items-center">
          <v-icon name="md-add" scale="1.6"/>
        </span>
        </button>
      </div>
    </div>

    <!-- 0 comments -->
    <div v-if="comments.length === 0">

      <div v-if="requestLoading" class="text-center">
        <LoaderComponent/>
        <p>Chargement des commentaires...</p>
      </div>

      <div v-else-if="requestError" class="text-sm px-2 text-red-600 dark:text-red-400">
        {{ requestError }}
      </div>

      <div v-else class="text-gray-500 dark:text-gray-400">
        Aucun commentaire pour cette tache.
      </div>

    </div>

    <!-- List of comments -->
    <ul v-else class="space-y-4">
      <li
          v-for="comment in sortedComments" :key="comment.id"
          class="p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-blue-600 dark:text-blue-400">
              {{ comment.authorName || 'Utilisateur Inconnu' }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Le {{ formatDate(comment.createdAt) }}
            </p>
          </div>
          <div v-if="authStore.user.id === comment.authorId" class="flex space-x-2">
            <button
                class="text-sm text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400"
                title="Modifier"
                @click="$emit('edit-comment', comment)">
              <v-icon name="fa-edit" scale="0.9"/>
            </button>
            <button
                class="text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
                title="Supprimer" @click="handleDeleteComment(comment.id)">
              <v-icon name="md-delete" scale="0.9"/>
            </button>
          </div>
        </div>
        <p v-if="comment.content" class="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ comment.content }}</p>
      </li>
    </ul>
  </div>
</template>



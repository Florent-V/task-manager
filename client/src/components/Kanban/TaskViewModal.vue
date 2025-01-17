<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from '@/utils/logger.js';
import LoaderComponent from '@/components/LoaderComponent.vue';
import ModalConfirmation from '@/components/ModalConfirmation.vue';
import CommentFormComponent from '@/components/Kanban/CommentFormComponent.vue';

const route = useRoute();
const { isLoading, error, executeRequest } = hookApi();

const emit = defineEmits(['close', 'edit', 'delete', 'add-comment']);
const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
  users: {
    type: Array,
    required: true,
  },
});

// State
const comments = ref([]);
const selectedComment = ref(null);
const formData = ref({});
const showDeleteConfirmationModal = ref(false);

// Computed
const sortedComments = computed(() => {
  return comments.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Fonction pour enrichir les commentaires avec le nom de l'utilisateur
const enrichComment = (comment) => {
  return {
    ...comment,
    authorName: (() => {
      const user = props.users.find((u) => u.id === comment.authorId);
      return user ? `${user.firstName} ${user.lastName}` : 'Unknown User';
    })(),
  };
};

const enrichComments = (comments) => {
  return comments.map((comment) => enrichComment(comment));
};

// Methods
const closeModal = () => emit('close');
const editTask = () => emit('edit');
const deleteTask = () => {
  showDeleteConfirmationModal.value = false;
  emit('delete', props.task.id);
};

const handleResponseFormSubmit = async (response) => {
  if (selectedComment.value) {
    // Update existing comment
    const index = comments.value.findIndex(item => item.id === response.comment.id);
    comments.value[index] = response.comment;
    selectedComment.value = null;
  } else {
    // Create new comment
    comments.value.push(enrichComment(response.comment));
  }
};

// Utilities
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
};

const fetchComments = async () => {
  try {
    const data = await executeRequest(() => client.get(`/api/kanban/${route.params.id}/task/${props.task.id}/comment`));
    logger.debug('comments', data);
    comments.value = enrichComments(data.comments);
  } catch (err) {
    logger.error('Error fetching comments', err);
  }
};

onMounted(fetchComments);
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div
        class="bg-white dark:bg-gray-800 w-full max-w-4xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-4 dark:border-gray-600">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-yellow-300">
          {{ task.title }}
        </h2>
        <div class="flex space-x-4">
          <button @click="editTask" class="text-gray-500 dark:text-gray-300 hover:text-blue-500">
            <v-icon name="fa-edit" />
          </button>
          <button @click="showDeleteConfirmationModal = true" class="text-gray-500 dark:text-gray-300 hover:text-red-500">
            <v-icon name="md-delete" />
          </button>
        </div>
      </div>

      <!-- Task Details -->
      <div class="mt-6 space-y-6">
        <!-- Description -->
        <div>
          <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Description</h3>
          <p class="mt-2 text-gray-600 dark:text-gray-400">{{ task.description }}</p>
        </div>

        <!-- Additional Information -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Priorité</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.priorityLabel }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Taille</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.sizeLabel }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Assignée à</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.assignedTo }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Colonne</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.stageLabel }}</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Temps estimé</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.estimation }} heures</p>
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Temps consigné</h3>
            <p class="mt-1 text-gray-600 dark:text-gray-400">{{ task.loggedTime }} heures</p>
          </div>
        </div>
      </div>

      <!-- Loader -->
      <LoaderComponent v-if="isLoading"/>

      <!-- Comments Section -->
      <div v-else class="mt-8">
        <h3 class="text-lg font-medium text-gray-700 dark:text-gray-300">Commentaires</h3>
        <div class="mt-4 space-y-4">
          <div v-for="comment in sortedComments" :key="comment.id" class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div class="flex justify-between">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200">
                {{ comment.authorName }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</p>
            </div>
            <p class="mt-2 text-gray-600 dark:text-gray-300">{{ comment.content }}</p>
          </div>
        </div>

        <p v-if="error" class="mt-4 text-red-600 dark:text-red-400">{{ error }}</p>

        <CommentFormComponent
          :comment="selectedComment"
          :task="props.task"
          @handleResponse="handleResponseFormSubmit"
        />

      </div>

      <!-- Footer -->
      <div class="flex justify-end mt-6">
        <button
            @click="closeModal"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Fermer
        </button>
      </div>
    </div>

    <!-- Modale de confirmation -->
    <ModalConfirmation
        v-if="showDeleteConfirmationModal"
        question="Êtes-vous sûr de vouloir supprimer cette tâche ?"
        @confirm="deleteTask"
        @cancel="showDeleteConfirmationModal = false"
    />

  </div>
</template>

<style scoped>
/* Ajoutez des styles personnalisés ici si nécessaire */
</style>

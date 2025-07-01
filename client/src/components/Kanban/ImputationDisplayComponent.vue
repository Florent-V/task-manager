<script setup>
import { ref, computed, onMounted, watch } from 'vue'; // Added watch to the import statement

import LoaderComponent from '@/components/LoaderComponent.vue';
import { TimeParser } from "@/utils/timeParser.js";
import { TaskService } from '@/services/taskService.js';
import { useKanbanStore } from '@/stores/kanbanStore.js';
import { useAuthStore } from '@/stores/authStore';
import { useHandleRequestStore } from "@/stores/handleRequestStore.js";
import logger from '@/utils/logger.js';

const timeParser = new TimeParser();
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
const imputations = ref([]);

// Emits
const emit = defineEmits([
  'create-imputation',
  'edit-imputation',
  'delete-imputation',
  'total-changed'
]);

// Computed
const requestLoading = computed(() => handleRequestStore.isLoading);
const requestError = computed(() => handleRequestStore.error);
const sortedImputations = computed(() => {
  return [...imputations.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalImputedMinutes = computed(() => {
  return imputations.value.reduce((sum, imp) => sum + imp.timeSpent, 0);
});

// Watch for total changes to emit to parent
watch(totalImputedMinutes, (newTotal) => {
  emit('total-changed', newTotal);
}, { immediate: true });

// Methods
const fetchImputations = async () => {
  logger.debug(`Fetching imputations for task ${props.taskId}`);
  try {
    const data = await taskService.getImputations(props.kanbanId, props.taskId);
    imputations.value = data.imputations || [];
    logger.debug('Imputations fetched successfully:', imputations.value);
  } catch (err) {
    logger.error('Error fetching imputations:', err);
  }
};

const handleDeleteImputation = async (imputationId) => {
  emit('delete-imputation', imputationId);
};

const deleteImputation = async (imputationId) => {
  try {
    await taskService.deleteImputation(props.kanbanId, props.taskId, imputationId);
    imputations.value = imputations.value.filter(imp => imp.id !== imputationId);
    kanbanStore.updateTasksImputations(props.taskId, imputations.value);
    logger.info('Imputation deleted successfully');
  } catch (err) {
    logger.error('Error deleting imputation:', err);
  }
};

const addImputation = (imputation) => {
  imputations.value.push(kanbanStore.enrichImputation(imputation));
  kanbanStore.updateTasksImputations(props.taskId, imputations.value);
};

const updateImputation = (updatedImputation) => {
  const index = imputations.value.findIndex(item => item.id === updatedImputation.id);
  if (index !== -1) {
    imputations.value[index] = kanbanStore.enrichImputation(updatedImputation);
  }
  kanbanStore.updateTasksImputations(props.taskId, imputations.value);
};

// Expose methods for parent component
defineExpose({
  addImputation,
  updateImputation,
  deleteImputation,
  fetchImputations,
  imputations: computed(() => imputations.value),
  totalImputedMinutes: computed(() => totalImputedMinutes.value)
});

// Watch for prop changes
watch([() => props.kanbanId, () => props.taskId], () => {
  if (props.kanbanId && props.taskId) {
    fetchImputations();
  }
}, { immediate: true });

// Lifecycle
onMounted(() => {
  if (props.kanbanId && props.taskId) {
    fetchImputations();
  }
});
</script>

<template>
  <div class="w-1/2 p-4 border rounded-lg dark:border-gray-700">
    <!-- Header Component-->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Historique des imputations</h3>
      <!-- Add button -->
      <div v-if="showFormButton" class="text-right">
        <button
            class="bg-blue-600 dark:bg-yellow-400 text-white px-2 py-2 rounded"
            @click="$emit('create-imputation')"
        >
        <span class="flex items-center">
          <v-icon name="md-add" scale="1.6"/>
        </span>
        </button>
      </div>
    </div>

    <!-- 0 imputations -->
    <div v-if="imputations.length === 0">

      <div v-if="requestLoading" class="text-center">
        <LoaderComponent/>
        <p>Chargement des imputations...</p>
      </div>

      <div v-else-if="requestError" class="text-sm px-2 text-red-600 dark:text-red-400">
        {{ requestError }}
      </div>

      <div v-else class="text-gray-500 dark:text-gray-400">
        Aucune imputation pour cette tâche.
      </div>
    </div>

    <!-- List of imputations -->
    <ul v-else class="space-y-4">
      <li
          v-for="imputation in sortedImputations" :key="imputation.id"
          class="p-3 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-blue-600 dark:text-blue-400">
              {{ timeParser.formatMinutesToTimeString(imputation.timeSpent) }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              par {{ imputation.user?.firstName || 'Utilisateur' }} {{ imputation.user?.lastName || 'Inconnu' }}
              le {{ new Date(imputation.date || imputation.createdAt).toLocaleDateString() }}
            </p>
          </div>
          <div v-if="authStore.user.id === imputation.userId" class="flex space-x-2">
            <button
                class="text-sm text-yellow-600 hover:text-yellow-800 dark:hover:text-yellow-400"
                title="Modifier"
                @click="$emit('edit-imputation', imputation)">
              <v-icon name="fa-edit" scale="0.9"/>
            </button>
            <button
                class="text-sm text-red-600 hover:text-red-800 dark:hover:text-red-400"
                title="Supprimer" @click="handleDeleteImputation(imputation.id)">
              <v-icon name="md-delete" scale="0.9"/>
            </button>
          </div>
        </div>
        <p v-if="imputation.comment" class="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
          {{ imputation.comment }}</p>
      </li>
    </ul>
  </div>
</template>



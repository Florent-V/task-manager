<script setup>
import { ref, computed, watch } from 'vue'; // Added watch to the import statement

import LoaderComponent from '@/components/Loader/LoaderComponent.vue';
import ModalConfirmation from '@/components/ModalConfirmation.vue';
import { useKanbanStore } from '@/stores/kanbanStore.js';
import { useAuthStore } from '@/stores/authStore';
import logger from '@/utils/logger.js';
import { TimeParser } from "@/utils/timeParser.js";
import { hookApi } from "@/services/requestHook.js";
import { TaskService } from '@/services/taskService.js';

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

// Emits
const emit = defineEmits([
  'create-imputation',
  'edit-imputation',
  'total-changed'
]);

// Initialize services and data
const timeParser = new TimeParser();
const taskService = new TaskService();
const kanbanStore = useKanbanStore();
const authStore = useAuthStore();
const {
  isLoading: requestLoading,
  error: requestError,
  executeRequest
} = hookApi();

// Ref State
const imputations = ref([]);
const showDeleteImputationConfirmation = ref(false);
const imputationToDeleteId = ref(null);

// Computed
const sortedImputations = computed(() => {
  return [...imputations.value].sort((a, b) => new Date(b.date) - new Date(a.date));
});

const totalImputedMinutes = computed(() => {
  return imputations.value.reduce((sum, imp) => sum + imp.timeSpent, 0);
});

// Methods
const fetchImputations = async () => {
  logger.debug(`Fetching imputations for task ${props.taskId}`);
  try {
    const data = await executeRequest(() => taskService.getImputations(props.kanbanId, props.taskId));
    imputations.value = data.imputations || [];
    logger.debug('Imputations fetched successfully:', imputations.value);
  } catch (err) {
    logger.error('Error fetching imputations:', err);
  }
};

const handleDeleteImputation = (imputationId) => {
  imputationToDeleteId.value = imputationId;
  showDeleteImputationConfirmation.value = true;
};

const executeDeleteImputation = async () => {
  try {
    if (!imputationToDeleteId.value) return;
    const imputationId = imputationToDeleteId.value;
    await executeRequest(() => taskService.deleteImputation(props.kanbanId, props.taskId, imputationId));
    imputations.value = imputations.value.filter(imp => imp.id !== imputationId);
    kanbanStore.updateTasksImputations(props.taskId, imputations.value);
    logger.info('Imputation deleted successfully');
  } catch (err) {
    logger.error('Error deleting imputation:', err);
  } finally {
    showDeleteImputationConfirmation.value = false;
    imputationToDeleteId.value = null;
  }
};

const cancelDeleteImputation = () => {
  showDeleteImputationConfirmation.value = false;
  imputationToDeleteId.value = null;
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

// Watch for prop changes
watch([() => props.kanbanId, () => props.taskId], () => {
  if (props.kanbanId && props.taskId) {
    fetchImputations();
  }
}, { immediate: true });

// Watch for total changes to emit to parent
watch(totalImputedMinutes, (newTotal) => {
  emit('total-changed', newTotal);
}, { immediate: true });

// Expose methods for parent component
defineExpose({
  addImputation,
  updateImputation,
  fetchImputations,
  imputations: computed(() => imputations.value),
  totalImputedMinutes: computed(() => totalImputedMinutes.value)
});
</script>

<template>
  <div class="w-1/2 p-4 border rounded-lg dark:border-gray-700">
    <!-- Header Component-->
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-3">Historique des imputations</h3>
      <!-- Add button -->
      <div v-if="showFormButton" class="flex gap-4">
        <button
            class="bg-blue-600 dark:bg-yellow-400 text-white px-2 py-2 rounded"
            @click="fetchImputations"
        >
          <span class="flex items-center">
            <v-icon name="hi-refresh" scale="1.6"/>
          </span>
        </button>
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

    <!-- Imputations -->
    <div v-if="requestLoading" class="text-center my-10">
      <LoaderComponent/>
      <p>Chargement des imputations...</p>
    </div>

    <div v-else-if="requestError" class="text-sm px-2 text-red-600 dark:text-red-400">
      {{ requestError }}
    </div>

    <div v-else>
      <div
          v-if="imputations.length === 0"
          class="text-gray-500 dark:text-gray-400"
      >
        Aucune imputation pour cette tâche.
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

    <ModalConfirmation
        v-if="showDeleteImputationConfirmation"
        cancel-button-text="Annuler"
        confirm-button-text="Supprimer"
        question="Êtes-vous sûr de vouloir supprimer cette imputation ?"
        @cancel="cancelDeleteImputation"
        @confirm="executeDeleteImputation"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { client } from '@/services/requestMaker.js';
import { hookApi } from '@/services/requestHook.js';
import logger from '@/utils/logger.js';
import LoaderComponent from '@/components/Loader/LoaderComponent.vue';

const props = defineProps({
  toDoListId: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['tasks-generated']);

const { executeRequest } = hookApi();

const aiPrompt = ref('');
const isGeneratingWithAI = ref(false);
const aiError = ref(null);

const generateWithAI = async () => {
  if (!aiPrompt.value.trim() || isGeneratingWithAI.value) return;

  isGeneratingWithAI.value = true;
  aiError.value = null;
  try {
    const generatedTasks = await executeRequest(() => client.post('/api/ai/generate-todolist', { prompt: aiPrompt.value }));
    if (generatedTasks && generatedTasks.length > 0) {
      const newItems = [];
      for (const taskTitle of generatedTasks) {
        const newItem = { title: taskTitle, done: false };
        const response = await executeRequest(
            () => client.postWithFile(`/api/todolist/${props.toDoListId}/todoitem`, newItem)
        );
        newItems.push(response.toDoItem);
      }
      emit('tasks-generated', newItems);
      aiPrompt.value = '';
    }
  } catch (err) {
    logger.error('Error generating tasks with AI:', err?.response?.data?.message || err.message);
    aiError.value = err?.response?.data?.message || 'Erreur lors de la génération des tâches.';
  } finally {
    isGeneratingWithAI.value = false;
  }
};
</script>

<template>
  <div class="px-4 mb-6">
    <div class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg dark:shadow-gray-700">
      <h3 class="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300 flex items-center">
        <v-icon name="ri-robot-line" class="mr-2" scale="1.2" />
        Générer des tâches avec l'IA
      </h3>
      <div class="flex items-center gap-2">
        <input
            v-model="aiPrompt"
            type="text"
            placeholder="Ex: Ingrédients pour une tarte aux pommes"
            class="flex-grow border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            @keyup.enter="generateWithAI"
        />
        <button
            class="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center transition duration-300"
            :disabled="isGeneratingWithAI || !aiPrompt.trim()"
            @click="generateWithAI"
        >
          <v-icon v-if="!isGeneratingWithAI" name="io-sparkles-outline" scale="1.2"/>
          <LoaderComponent v-else :small="true" />
          <span class="ml-2 hidden sm:inline">{{ isGeneratingWithAI ? 'Génération...' : 'Générer' }}</span>
        </button>
      </div>
      <p v-if="aiError" class="text-sm mt-2 text-red-600 dark:text-red-400">{{ aiError }}</p>
    </div>
  </div>
</template>

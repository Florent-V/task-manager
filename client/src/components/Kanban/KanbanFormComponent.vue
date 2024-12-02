<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  kanban: {
    type: Object,
    default: () => ({
      id: null,
      title: '',
      description: '',
      statuses: [],
    }),
  },
});

const emit = defineEmits(['submitSuccess', 'cancel']);

const form = reactive({
  title: '',
  description: '',
  statuses: [],
});

watch(
    () => props.kanban,
    (newKanban) => {
      form.title = newKanban.title || '';
      form.description = newKanban.description || '';
      form.statuses = newKanban.statuses || [];
    },
    { immediate: true }
);

const addStatus = () => {
  form.statuses.push({ name: '', description: '', maxRecord: 1 });
};

const removeStatus = (index) => {
  form.statuses.splice(index, 1);
};

const submitKanban = () => {
  emit('submitSuccess', { ...form });
};
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-300">
      {{ kanban.id ? 'Modifier un Kanban' : 'Créer un Kanban' }}
    </h2>

    <form @submit.prevent="submitKanban">
      <!-- Titre du Kanban -->
      <div class="mb-4">
        <label for="title" class="block text-gray-700 dark:text-gray-300">Titre</label>
        <input
            type="text"
            id="title"
            v-model="form.title"
            maxlength="50"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Titre du Kanban"
            required
        />
      </div>

      <!-- Description du Kanban -->
      <div class="mb-4">
        <label for="description" class="block text-gray-700 dark:text-gray-300">Description</label>
        <textarea
            id="description"
            v-model="form.description"
            maxlength="200"
            class="mt-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Description (facultatif)"
        ></textarea>
      </div>

      <!-- Statuts dynamiques -->
      <div class="mb-6">
        <h3 class="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Statuts</h3>
        <div
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div
              v-for="(status, index) in form.statuses"
              :key="index"
              class="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800"
          >
            <!-- Ligne 1 : Nom et MaxRecord -->
            <div class="flex items-center gap-4">
              <div class="flex-grow">
                <label class="block text-gray-700 dark:text-gray-300">Nom du statut</label>
                <input
                    type="text"
                    v-model="status.name"
                    maxlength="50"
                    placeholder="Nom du statut"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                />
              </div>
              <div class="w-20">
                <label class="block text-gray-700 dark:text-gray-300">Max</label>
                <input
                    type="number"
                    v-model="status.maxRecord"
                    min="1"
                    max="99"
                    class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center"
                    required
                />
              </div>
            </div>

            <!-- Ligne 2 : Description -->
            <div class="mt-4">
              <label class="block text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                  v-model="status.description"
                  maxlength="200"
                  placeholder="Description (facultatif)"
                  class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              ></textarea>
            </div>

            <!-- Bouton Supprimer -->
            <button
                type="button"
                @click="removeStatus(index)"
                class="text-red-600 font-bold mt-4"
            >
              ✖ Supprimer
            </button>
          </div>
        </div>

        <!-- Ajouter un statut -->
        <button
            type="button"
            @click="addStatus"
            class="text-blue-600 font-semibold mt-4"
        >
          + Ajouter un statut
        </button>
      </div>

      <!-- Boutons d'action -->
      <div class="flex justify-end gap-4">
        <button
            type="button"
            @click="$emit('cancel')"
            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Annuler
        </button>
        <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {{ kanban.id ? 'Modifier' : 'Créer' }}
        </button>
      </div>
    </form>
  </div>
</template>



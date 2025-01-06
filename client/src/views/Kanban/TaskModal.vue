<script setup>
import { ref, reactive, watch, computed } from "vue";
import { useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import logger from "@/utils/logger.js";
import useFormErrors from "@/utils/handleFormErrors.js";

const emit = defineEmits(['handleResponse', 'cancel']);
const props = defineProps({
  initialData: {
    type: Object,
  },
  users: {
    type: Array,
    required: true,
  },
  priorities: {
    type: Array,
    required: true,
  },
  sizes: {
    type: Array,
    required: true,
  },
});

const { isLoading, error, executeRequest } = hookApi();
const formData = ref({ ...props.initialData });
const isEditing = computed(() => !!formData.value.id);


const newTask = {
  title: "",
  description: "",
  estimation: "",
  loggedTime: "",
  priorityId: "",
  sizeId: "",
  stageId: "",
  assignedTo: "",
};

watch(() => props.initialData, (newValue) => {
      formData.value = newValue ? { ...newValue } : { ...newTask };
    },
    { immediate: true }
);

// const priorities = ref([
//   { id: 1, label: "Low", name: "Low", color: "#808080" },
//   { id: 2, label: "Medium", name: "Medium", color: "#008000" },
//   { id: 3, label: "High", name: "High", color: "#FF0000" },
// ]);
//
// const sizes = ref([
//   { id: 1, label: "XS", name: "Extra Small", color: "#808080" },
//   { id: 2, label: "S", name: "Small", color: "#008000" },
//   { id: 3, label: "M", name: "Medium", color: "#FFA500" },
//   { id: 4, label: "L", name: "Large", color: "#FF0000" },
//   { id: 5, label: "XL", name: "Extra Large", color: "#800080" },
// ]);
//
// const members = ref([
//   { id: 1, name: "John Doe" },
//   { id: 2, name: "Jane Doe" },
//   { id: 3, name: "Alice" },
//   { id: 4, name: "Bob" },
// ]);

// Watch for updates to the task prop
// watch(
//     () => props.task,
//     (task) => {
//       Object.assign(editableTask, task);
//     }, { immediate: true }
// );

// Methods
function closeModal() {
  emit("close");
}

// function saveTask() {
//   emitSave({ ...editableTask });
//   closeModal();
// }
function saveTask() {
  emit("save", { ...formData, id: formData.id || Date.now() });
  closeModal();
}

</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-lg shadow-lg p-6">
      <!-- Header -->
      <div class="flex justify-between items-center border-b pb-4 dark:border-gray-600">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-yellow-300">
          {{ isEditMode ? "Modifier la tâche" : "Créer une tâche" }}
        </h2>
        <button @click="closeModal" class="text-gray-500 dark:text-gray-300 hover:text-red-500">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Content -->
      <div class="mt-4 space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
          <input
              type="text"
              v-model="formData.title"
              class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              placeholder="Titre de la tâche"
          />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
              v-model="formData.description"
              rows="3"
              class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              placeholder="Description de la tâche"
          ></textarea>
        </div>

        <!-- Priority & Size -->
        <div class="flex space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Priorité</label>
            <select
                v-model="formData.priorityId"
                class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              <option selected value="">Choisir une option</option>
              <option v-for="priority in priorities" :key="priority.id" :value="priority.id">
                {{ priority.label }}
              </option>
            </select>
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Taille</label>
            <select
                v-model="formData.sizeId"
                class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              <option selected value="">Choisir une option</option>
              <option v-for="size in sizes" :key="size.id" :value="size.id">
                {{ size.label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Estimated Time & Logged Time -->
        <div class="flex space-x-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Temps estimé (h)</label>
            <input
                type="text"
                v-model="formData.estimatedTime"
                class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                placeholder="Temps estimé"
            />
          </div>
          <div class="flex-1">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Temps consigné (h)</label>
            <input
                type="text"
                v-model="formData.loggedTime"
                class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                placeholder="Temps consigné"
            />
          </div>
        </div>

        <!-- Assigned User -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignée à</label>
          <select
              v-model="formData.assignedToId"
              class="w-full mt-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
          >
            <option selected value="">Choisir une option</option>
            <option v-for="member in users" :key="member.id" :value="member.id">
              {{ member.firstName }} {{ member.lastName }}
            </option>
          </select>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex justify-end mt-6 space-x-4">
        <button
            @click="closeModal"
            class="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Annuler
        </button>
        <button
            @click="saveTask"
            class="px-4 py-2 rounded-lg bg-blue-600 dark:bg-yellow-400 text-white hover:bg-blue-700 dark:hover:bg-yellow-500"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Optional styles for modal animations or spacing */
</style>

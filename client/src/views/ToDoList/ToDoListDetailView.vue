<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import ToDoItemFormComponent from "@/components/ToDoList/ToDoItemFormComponent.vue";
import ToDoItemInlineFormComponent from "@/components/ToDoList/ToDoItemInlineFormComponent.vue";
import ToggleComponent from "@/components/ToggleComponent.vue";
import LoaderComponent from "@/components/LoaderComponent.vue";
import QRCodeModal from "@/components/ToDoList/ToDoListQRCodeModal.vue";
import logger from "@/utils/logger.js";

const route = useRoute();
const { isLoading, error, executeRequest } = hookApi();

const toDoList = ref({});
const toDoItems = ref([]);
const isCreating = ref(false);
const isEditing = ref(false);
const newToDoItem = ref({ title: '' });
const selectedToDoItem = ref(null); // Pour l'édition
const showOnlyPending = ref(false);
const isEditingQuantity = ref(false);
const showQRCodeModal = ref(false);
const qrCodeUrl = ref(null);
const linkUrl = ref(null);

// Récupération des items de la ToDoList
const fetchToDoItems = async () => {
  try {
    const data = await executeRequest(() => client.get(`/api/todolist/${route.params.id}/`));
    logger.debug('todolist', data);
    toDoItems.value = data.toDoList.toDoItems;
    toDoList.value = data.toDoList;
  } catch (err) {
    logger.error('Error fetching data:', err?.response?.data?.message || err.message);
  } finally {
    isLoading.value = false;
  }
};

// Filtrer les items en fonction du toggle
const filteredToDoItems = computed(() => {
  return showOnlyPending.value
      ? toDoItems.value.filter(item => !item.done)
      : toDoItems.value;
});

const handleResponseFormSubmit = async (response) => {
    if (selectedToDoItem.value) {
      // Update existing to-do item
      const index = toDoItems.value.findIndex(item => item.id === response.toDoItem.id);
      toDoItems.value[index] = response.toDoItem;
    } else {
      // Create new to-do item
      toDoItems.value.push(response.toDoItem);
    }
    closeForm();
};

// Ouvrir le formulaire de création
const openCreateForm = () => {
  selectedToDoItem.value = null;
  isEditing.value = false;
  isCreating.value = true;
};

// Ouvrir le formulaire d'édition
const openEditForm = (item) => {
  selectedToDoItem.value = { ...item };
  isCreating.value = false;
  isEditing.value = true;
};

// Fermer le formulaire
const closeForm = () => {
  selectedToDoItem.value = null;
  isCreating.value = false;
  isEditing.value = false;
  newToDoItem.value = { title: '' };
};

// Flag ToDoItem as done
const toggleToDoItemDone = async (item) => {
  try {
    const response = await executeRequest(() => client.patch(`/api/todolist/${route.params.id}/todoitem/${item.id}`, { done: !item.done }));
    const index = toDoItems.value.findIndex(i => i.id === response.toDoItem.id);
    toDoItems.value[index].done = !toDoItems.value[index].done;
  } catch (err) {
    logger.error('Error updating ToDoItem:', err?.response?.data?.message || err.message);
  }
};

// Delete ToDoItem
const deleteToDoItem = async (item) => {
  try {
    await executeRequest(() => client.delete(`/api/todolist/${route.params.id}/todoitem/${item.id}`));
    toDoItems.value = toDoItems.value.filter(i => i.id !== item.id);
  } catch (err) {
    logger.error('Error deleting ToDoItem:', err?.response?.data?.message || err.message);
  }
};

// Fonction pour incrémenter la quantité
const incrementQuantity = async (item) => {
  item.quantity += 1;
  await updateItemQuantityInDatabase(item);
};

// Fonction pour décrémenter la quantité
const decrementQuantity = async (item) => {
  if (item.quantity > 1) {
    item.quantity -= 1;
    await updateItemQuantityInDatabase(item);
  }
};

// Fonction pour mettre à jour la quantité dans la base de données
const updateItemQuantityInDatabase = async (item) => {
  try {
    logger.debug('Mise à jour de la quantité...', `/api/todolist/${route.params.id}/todoitem/${item.id}`);
    const response = await executeRequest(() => client.patch(`/api/todolist/${route.params.id}/todoitem/${item.id}`, { quantity: item.quantity }));
    const index = toDoItems.value.findIndex(i => i.id === response.toDoItem.id);
    toDoItems.value[index].quantity = response.toDoItem.quantity;
    logger.debug('Quantité mise à jour avec succès');
  } catch (err) {
    logger.error('Error updating quantity:', err?.response?.data?.message || err.message);
  }
};

// Fonction pour partager la ToDoList
const shareToDoList = async () => {
  try {
    const data = await executeRequest(() => client.post(`/api/todolist/${route.params.id}/share`, {}));
    qrCodeUrl.value = data.qrCodeUrl;
    linkUrl.value = data.linkUrl;
    showQRCodeModal.value = true;
  } catch (err) {
    logger.error('Error sharing ToDoList:', err?.response?.data?.message || err.message);
  }
};

// Fonction pour commencer l'édition de la quantité
const editQuantity = (item) => {
  selectedToDoItem.value = { ...item };
  isEditingQuantity.value = true;
};

// Fonction pour sauvegarder la nouvelle quantité
const saveQuantity = async (item) => {
  if (!isEditingQuantity.value) return;
  isEditingQuantity.value = false;
  selectedToDoItem.value = null;
  await updateItemQuantityInDatabase(item);
};

// Fonction pour annuler l'édition de la quantité
const cancelEditQuantity = () => {
  isEditingQuantity.value = false;
  selectedToDoItem.value = null;
};

onMounted(fetchToDoItems);
</script>

<template>

  <div>
    <div class="container mx-auto pt-2 lg:pb-8">

      <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">{{ toDoList.title }} :
        Détails</h1>

      <div class="flex justify-between align-center mb-4">
        <ToggleComponent
            v-model:state="showOnlyPending"
            label="Supprimer fait"
        />
        <div class="flex gap-2">
          <div v-if="!isCreating" class="text-right">
            <button @click="openCreateForm" class="w-14 h-14 bg-blue-600 dark:bg-yellow-400 text-white rounded-full">
            <span class="items-center">
              <v-icon name="md-add" scale="1.6" />
            </span>
            </button>
          </div>
          <div class="text-right">
            <button @click="shareToDoList" class="flex w-14 h-14 bg-blue-600 dark:bg-yellow-400 text-white rounded-full">
              <span class="m-auto">
                <v-icon name="md-share-outlined" scale="1.6" />
              </span>
            </button>
          </div>

        </div>

      </div>

      <!-- QRCodeModal -->
      <QRCodeModal
          v-if="showQRCodeModal"
          :qrCodeUrl="qrCodeUrl"
          :linkUrl="linkUrl"
          @close="showQRCodeModal = false"
      />

      <!-- ToDoForm -->
      <ToDoItemFormComponent
          v-if="isCreating"
          :initialData="selectedToDoItem"
          @handleResponse="handleResponseFormSubmit"
          @cancel="closeForm"
      />

      <!-- Loader -->
      <LoaderComponent v-if="isLoading"/>

      <div v-else-if="toDoItems.length">
        <div class="w-full bg-white dark:bg-gray-800 px-6 rounded-xl shadow-lg dark:shadow-gray-700">
          <p class="py-3">{{ toDoList.description }}</p>
          <!-- Title Table -->
          <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold">
            A faire</h2>

          <div class="overflow-x-auto py-4">
            <ul>
              <li v-for="item in filteredToDoItems.filter(item => !item.done)" :key="item.id"
                  class="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg mb-2 shadow-lg dark:shadow-gray-700">

                <button @click="toggleToDoItemDone(item)"
                        class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                  <v-icon name='md-checkboxoutlineblank' />
                </button>

                <div v-if="isEditing && selectedToDoItem.id === item.id" class="flex-grow">
                  <!-- ToDoForm -->
                  <ToDoItemFormComponent
                      :initialData="selectedToDoItem"
                      :inline-form=true
                      @handleResponse="handleResponseFormSubmit"
                      @cancel="closeForm"
                  />
                </div>

                <div v-else class="flex-grow">
                  <span
                      :class="[{ 'line-through text-gray-400 dark:text-gray-500': item.done }, { 'cursor-pointer': !item.done }]"
                      @click="openEditForm(item)"
                  >
                    {{ item.title }}
                  </span>
                </div>

                <!-- Section de quantité avec boutons + et - -->
                <div v-if="toDoList.type.name === 'Shopping'" class="flex items-center gap-2 mr-4">
                  <button @click="decrementQuantity(item)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                    <v-icon name="fa-minus" scale="1.2" />
                  </button>

                  <div class="border border-gray-300 dark:border-gray-600 px-4 py-1 rounded">
                    <!-- Si 'isEditingQuantity' est vrai pour cet item, on affiche un champ input -->
                    <input v-if="isEditingQuantity && selectedToDoItem.id === item.id"
                           v-model="item.quantity"
                           type="number"
                           class="w-16 bg-transparent text-center border-none focus:outline-none"
                           @blur="saveQuantity(item)"
                           @keydown.alt="saveQuantity(item)"
                           @keydown.esc="cancelEditQuantity(item)"/>
                    <!-- Sinon on affiche simplement la quantité avec un événement click pour éditer -->
                    <span v-else @click="editQuantity(item)">
                  {{ item.quantity }}
                </span>
                  </div>

                  <button @click="incrementQuantity(item)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                    <v-icon name="fa-plus" scale="1.2" />
                  </button>
                </div>

                <!-- Actions pour chaque item -->
                <div class="flex items-center">
                  <button @click="deleteToDoItem(item)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 ml-2">
                    <v-icon name="fa-regular-trash-alt" scale="1.2" />
                  </button>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="filteredToDoItems.filter(item => item.done).length > 0" class="mt-4">
            <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold">
              Fait</h2>

            <div class="overflow-x-auto py-4">
              <ul>
                <li v-for="item in filteredToDoItems.filter(item => item.done)" :key="item.id"
                    class="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg mb-2 shadow-lg dark:shadow-gray-700">

                  <button @click="toggleToDoItemDone(item)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                    <v-icon name='md-checkbox-outlined' />
                  </button>

                  <div class="flex-grow">
                    <span
                        :class="[{ 'line-through text-gray-400 dark:text-gray-500': item.done }, { 'cursor-pointer': !item.done }]">
                      {{ item.title }}
                    </span>
                  </div>

                  <!-- Actions pour chaque item -->
                  <div class="flex items-center">
                    <button @click="deleteToDoItem(item)"
                            class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 ml-2">
                      <v-icon name="fa-regular-trash-alt" scale="1.2" />
                    </button>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div v-else>
        <p class="text-center text-gray-400 dark:text-gray-500 mt-8">Aucune tâche à afficher</p>
      </div>

      <div v-if="error">
        <p class="text-center text-red-700 dark:text-red-300 text-xl">{{ error }}</p>
      </div>

    </div>
  </div>

</template>

<style scoped>
.container {
  max-width: 1200px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

button {
  cursor: pointer;
}
</style>

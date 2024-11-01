<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import { hookApi } from "@/utils/requestHook.js";
import ToDoItemFormComponent from "@/components/ToDoList/ToDoItemFormComponent.vue";
import ToDoItemInlineFormComponent from "@/components/ToDoList/ToDoItemInlineFormComponent.vue";
import ToggleComponent from "@/components/ToggleComponent.vue";
import LoaderComponent from "@/components/LoaderComponent.vue";
import QRCodeModal from "@/components/ToDoList/ToDoListQRCodeModal.vue";

const route = useRoute();
const router = useRouter();
const { isLoading, error, executeRequest } = hookApi();

const toDoList = ref({});
const toDoItems = ref([]);
const isCreating = ref(false);
const isEditing = ref(false);
const newToDoItem = ref({ title: '', description: '' });
const selectedToDoItem = ref(null); // Pour l'édition
const showOnlyPending = ref(false);
const isEditingQuantity = ref(false);
const showQRCodeModal = ref(false);
const qrCodeUrl = ref(null);
const linkUrl = ref(null);

// Récupération des items de la ToDoList
const fetchToDoItems = async () => {
  try {
    const data = await executeRequest(() => client.get(`/api/todolist/${route.params.id}/todoitem`));
    toDoItems.value = data.toDoItems;
    toDoList.value = data.toDoList;
  } catch (error) {
    console.error('Error fetching data:', error);
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

const handleFormSubmit = async (data) => {
  if (selectedToDoItem.value) {
    // Update existing to-do item
    const response = await client.patch(`/api/todolist/${route.params.id}/todoitem/${selectedToDoItem.value.id}`, data);
    const index = toDoItems.value.findIndex(item => item.id === response.toDoItem.id);
    toDoItems.value[index] = response.toDoItem;
  } else {
    // Create new to-do item
    const response = await client.post(`/api/todolist/${route.params.id}/todoitem`, data);
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
  newToDoItem.value = { title: '', description: '' };
};

// Flag ToDoItem as done
const toggleToDoItemDone = async (item) => {
  const response = await client.patch(`/api/todolist/${route.params.id}/todoitem/${item.id}`, { done: !item.done });
  const index = toDoItems.value.findIndex(i => i.id === response.toDoItem.id);
  toDoItems.value[index].done = !toDoItems.value[index].done;
};

// Delete ToDoItem
const deleteToDoItem = async (item) => {
  await client.delete(`/api/todolist/${route.params.id}/todoitem/${item.id}`);
  toDoItems.value = toDoItems.value.filter(i => i.id !== item.id);
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
  console.log('Mise à jour de la quantité...', `/api/todolist/${route.params.id}/todoitem/${item.id}`);
  const response = await client.patch(`/api/todolist/${route.params.id}/todoitem/${item.id}`, { quantity: item.quantity });
  const index = toDoItems.value.findIndex(i => i.id === response.toDoItem.id);
  toDoItems.value[index].quantity = response.toDoItem.quantity;
  console.log('Quantité mise à jour avec succès');
};

// Fonction pour partager la ToDoList
const shareToDoList = async () => {
  try {
    const data = await client.post(`/api/todolist/${route.params.id}/share`, {});
    qrCodeUrl.value = data.qrCodeUrl;
    linkUrl.value = data.linkUrl;
    showQRCodeModal.value = true;
  } catch (error) {
    console.error('Error sharing ToDoList:', error);
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
              <i class="fa-solid fa-plus text-3xl"></i>
            </span>
            </button>
          </div>
          <div class="text-right">
            <button @click="shareToDoList" class="flex w-14 h-14 bg-blue-600 dark:bg-yellow-400 text-white rounded-full">
              <span class="m-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
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
          @submit="handleFormSubmit"
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
                  <i :class="{ 'fa-solid fa-check-square': item.done, 'fa-regular fa-square': !item.done }"></i>
                </button>

                <div v-if="isEditing && selectedToDoItem.id === item.id" class="flex-grow">
                  <ToDoItemInlineFormComponent
                      :initialData="selectedToDoItem"
                      @submit="handleFormSubmit"
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
                    <svg class="w-6 h-6 text-blue-600 dark:text-yellow-400" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 12h14"/>
                    </svg>
                  </button>

                  <div class="border border-gray-300 dark:border-gray-600 px-4 py-1 rounded">
                    <!-- Si 'isEditingQuantity' est vrai pour cet item, on affiche un champ input -->
                    <input v-if="isEditingQuantity && selectedToDoItem.id === item.id"
                           v-model="item.quantity"
                           type="number"
                           class="w-16 bg-transparent text-center border-none focus:outline-none"
                           @blur="saveQuantity(item)"
                           @keydown.enter="saveQuantity(item)"
                           @keydown.esc="cancelEditQuantity(item)"/>
                    <!-- Sinon on affiche simplement la quantité avec un événement click pour éditer -->
                    <span v-else @click="editQuantity(item)">
                  {{ item.quantity }}
                </span>
                  </div>

                  <button @click="incrementQuantity(item)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                    <svg class="w-6 h-6 text-blue-600 dark:text-yellow-400" aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M5 12h14m-7 7V5"/>
                    </svg>
                  </button>
                </div>

                <!-- Actions pour chaque item -->
                <div class="flex items-center">
                  <button @click="deleteToDoItem(item)"
                          class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 ml-2">
                    <i class="fas fa-trash-alt"></i>
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
                    <i :class="{ 'fa-solid fa-check-square': item.done, 'fa-regular fa-square': !item.done }"></i>
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
                      <i class="fas fa-trash-alt"></i>
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

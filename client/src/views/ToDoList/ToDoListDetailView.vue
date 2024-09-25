<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import ToDoItemFormComponent from "@/components/ToDoList/ToDoItemFormComponent.vue";
import ToggleComponent from "@/components/ToggleComponent.vue";

const route = useRoute();
const router = useRouter();

const toDoList = ref({});
const toDoItems = ref([]);
const isCreating = ref(false);
const isEditing = ref(false);
const newToDoItem = ref({ title: '', description: '' });
const selectedToDoItem = ref(null); // Pour l'édition
const showOnlyPending = ref(false);
const isLoading = ref(true);
const isEditingQuantity = ref(false);

// Récupération des items de la ToDoList
const fetchToDoItems = async () => {
  try {
    const data = await client.get(`/api/todolist/${route.params.id}/todoitem`);
    toDoItems.value = data.toDoItems;
    toDoList.value = data.toDoList;
    // await new Promise(r => setTimeout(r, 20000));
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false; // Fin du chargement, que ce soit en cas de succès ou d'erreur
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
    console.log('data', data);
    const response = await client.patch(`/api/todolist/${route.params.id}/todoitem/${selectedToDoItem.value.id}`, data);
    console.log('response', response);
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
    const response = await client.patch(`/api/todolist/${route.params.id}/todoitem/${item.id}`,  { quantity: item.quantity });
    console.log('response', response);
    const index = toDoItems.value.findIndex(i => i.id === response.toDoItem.id);
    toDoItems.value[index].quantity = response.toDoItem.quantity;
    console.log('Quantité mise à jour avec succès');
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
            label="Uniquement non fait"
        />
        <div v-if="!isCreating" class="text-right">
          <button @click="openCreateForm" class="w-14 h-14 bg-blue-600 dark:bg-yellow-400 text-white rounded-full">
          <span class="items-center">
            <i class="fa-solid fa-plus text-3xl"></i>
        </span>
          </button>
        </div>
      </div>


      <!-- ToDoForm -->
      <ToDoItemFormComponent
          v-if="isCreating"
          :initialData="selectedToDoItem"
          @submit="handleFormSubmit"
          @cancel="closeForm"
      />

      <!-- Loader -->
      <div v-if="isLoading" class="loader-wrapper">
        <div class="dot-loader">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      <div v-else>
        <!-- Liste des ToDoItems -->
        <div v-if="toDoItems.length === 0" class="text-center text-gray-400 dark:text-gray-500 mt-8">
          Aucune tâche à afficher
        </div>

        <ul v-else>
          <li v-for="item in filteredToDoItems" :key="item.id"
              class="flex gap-4 items-center bg-white dark:bg-gray-800 p-4 rounded-lg mb-2 shadow-lg dark:shadow-gray-700">

            <button @click="toggleToDoItemDone(item)"
                    class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
              <i :class="{ 'fa-solid fa-check-square': item.done, 'fa-regular fa-square': !item.done }"></i>
            </button>

            <div v-if="isEditing && selectedToDoItem.id === item.id" class="flex-grow">
              <ToDoItemFormComponent
                  :initialData="selectedToDoItem"
                  @submit="handleFormSubmit"
                  @cancel="closeForm"
              />
            </div>

            <div v-else class="flex-grow">
              <span :class="{ 'line-through text-gray-400 dark:text-gray-500': item.done }">{{ item.title }}</span>
            </div>

            <!-- Section de quantité avec boutons + et - -->
            <div class="flex items-center gap-2 mr-4">
              <button @click="decrementQuantity(item)" class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                <svg class="w-6 h-6 text-blue-600 dark:text-yellow-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14"/>
                </svg>
              </button>

<!--              <div class="border border-gray-300 dark:border-gray-600 px-4 py-1 rounded">-->
<!--                {{ item.quantity }}-->
<!--              </div>-->
              <div class="border border-gray-300 dark:border-gray-600 px-4 py-1 rounded">
                <!-- Si 'isEditingQuantity' est vrai pour cet item, on affiche un champ input -->
                <input v-if="isEditingQuantity && selectedToDoItem.id === item.id"
                       v-model="item.quantity"
                       type="number"
                       class="w-16 bg-transparent text-center border-none focus:outline-none"
                       @blur="saveQuantity(item)"
                       @keydown.enter="saveQuantity(item)"
                       @keydown.esc="cancelEditQuantity(item)" />
                <!-- Sinon on affiche simplement la quantité avec un événement click pour éditer -->
                <span v-else @click="editQuantity(item)">
                  {{ item.quantity }}
                </span>
              </div>

              <button @click="incrementQuantity(item)" class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                <svg class="w-6 h-6 text-blue-600 dark:text-yellow-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5"/>
                </svg>
              </button>
            </div>

            <!-- Actions pour chaque item -->
            <div class="flex items-center">
              <button @click="openEditForm(item)"
                      class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 ml-2">
                <i class="fas fa-edit"></i>
              </button>
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

</template>

<style scoped>
.container {
  max-width: 1200px;
}

.input-field {
  transition: all 0.3s ease;
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

.loader-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 5rem;
}

.dot-loader {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 13px;
}

.dot-loader div {
  position: absolute;
  top: 0;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #3498db; /* Couleur principale du loader */
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}

.dot-loader div:nth-child(1) {
  left: 8px;
  animation: dot1 0.6s infinite;
}

.dot-loader div:nth-child(2) {
  left: 8px;
  animation: dot2 0.6s infinite;
}

.dot-loader div:nth-child(3) {
  left: 32px;
  animation: dot2 0.6s infinite;
}

.dot-loader div:nth-child(4) {
  left: 56px;
  animation: dot3 0.6s infinite;
}

@keyframes dot1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes dot2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}

@keyframes dot3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
</style>

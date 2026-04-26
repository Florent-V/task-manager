<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';

import ToDoItemFormComponent from '@/components/ToDoList/ToDoItemFormComponent.vue';
import ToDoItemImageModalComponent from '@/components/ToDoList/ToDoItemImageModalComponent.vue';
import ToggleComponent from '@/components/ToggleComponent.vue';
import LoaderComponent from '@/components/Loader/LoaderComponent.vue';
import QRCodeModal from '@/components/ToDoList/ToDoListQRCodeModal.vue';
import AIGenerateTasks from '@/components/ToDoList/AIGenerateTasks.vue';
import { useToast } from '@/composables/useToast'
import { setTitle, setDescription } from "@/utils/documentInfos.js";
import logger from '@/utils/logger.js';
import { hookApi } from '@/services/requestHook.js';
import { ToDoItemService } from "@/services/toDoItemService.js";
import { ToDoListService } from "@/services/toDoListService.js";

const route = useRoute();
const { showSuccess, showError } = useToast()
const toDoItemService = new ToDoItemService();
const toDoListService = new ToDoListService();
const { isLoading, error, executeRequest } = hookApi();
const {
  error: silentRequestError,
  executeRequest: executeSilentRequest
} = hookApi();

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
const showItemImageModal = ref(false);
const openMenuId = ref(null);
const showAISheet = ref(false);
const isMobileMenuOpen = ref(false);
const quickTaskTitle = ref('');

// Récupération des items de la ToDoList
const fetchToDoItems = async () => {
  try {
    const data = await executeRequest(
        () => toDoListService.getToDoList(route.params.id)
    );
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
    if (index !== -1) {
      toDoItems.value[index] = response.toDoItem;
    } else {
      toDoItems.value.push(response.toDoItem);
    }
  } else {
    // Create new to-do item
    toDoItems.value.push(response.toDoItem);
  }
  closeForm();
};

const submitQuickTask = async () => {
  if (!quickTaskTitle.value.trim()) return;
  try {
    const response = await executeSilentRequest(
      () => toDoItemService.createToDoItemSimple(route.params.id, { title: quickTaskTitle.value.trim(), done: false })
    );
    toDoItems.value.push(response.toDoItem);
    quickTaskTitle.value = '';
    showSuccess('Tâche ajoutée');
  } catch (err) {
    showError('Erreur lors de l\'ajout de la tâche');
    logger.error('Error creating quick ToDoItem:', err?.response?.data?.message || err.message);
  }
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

// Ouvrir le formulaire d'édition complet
const openCompleteEditForm = (item) => {
  openMenuId.value = null;
  selectedToDoItem.value = { ...item };
  isCreating.value = true;
  isEditing.value = false;
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
    const response = await executeSilentRequest(
        () => toDoItemService.editToDoItem(route.params.id, item.id, { done: !item.done })
    );
    showSuccess('Tâche mise à jour avec succès');
    const index = toDoItems.value.findIndex(i => i.id === response.toDoItem.id);
    toDoItems.value[index].done = !toDoItems.value[index].done;
  } catch (err) {
    showError('Erreur lors de la mise à jour de la tâche');
    logger.error('Error updating ToDoItem:', err?.response?.data?.message || err.message);
  }
};

// Delete ToDoItem
const deleteToDoItem = async (item) => {
  try {
    await executeSilentRequest(
        () => toDoItemService.deleteToDoItem(route.params.id, item.id)
    );
    showSuccess('Tâche supprimée avec succès');
    toDoItems.value = toDoItems.value.filter(i => i.id !== item.id);
  } catch (err) {
    showError('Erreur lors de la suppression de la tâche');
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
    const response = await executeSilentRequest(
        () => toDoItemService.editToDoItem(route.params.id, item.id, { quantity: item.quantity })
    );
    const index = toDoItems.value.findIndex(i => i.id === response.toDoItem.id);
    toDoItems.value[index].quantity = response.toDoItem.quantity;
    showSuccess('Tâche mise à jour avec succès');
    logger.debug('Quantité mise à jour avec succès');
  } catch (err) {
    showError('Erreur lors de la mise à jour de la tâche');
    logger.error('Error updating quantity:', err?.response?.data?.message || err.message);
  }
};

// Fonction pour partager la ToDoList
const shareToDoList = async () => {
  try {
    const data = await executeSilentRequest(
        () => toDoListService.shareToDoList(route.params.id)
    );
    qrCodeUrl.value = data.qrCodeUrl;
    linkUrl.value = data.linkUrl;
    showQRCodeModal.value = true;
  } catch (err) {
    showError('Erreur lors du partage de la liste de tâches');
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

const showItemImage = (item) => {
  logger.debug('Affichage de l\'image');
  selectedToDoItem.value = { ...item };
  showItemImageModal.value = true;
};

const closeItemImageModal = () => {
  showItemImageModal.value = false;
  selectedToDoItem.value = null;
};

const toggleMenu = (item) => {
  openMenuId.value = openMenuId.value === item.id ? null : item.id;
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Fonction pour fermer tous les menus
const closeAllMenus = (event) => {
  // Vérifie si le clic est à l'intérieur du menu ou du bouton (évite la fermeture immédiate)
  if (!event.target.closest('.menu-container')) {
    openMenuId.value = null;
  }
  if (!event.target.closest('.mobile-menu-container')) {
    isMobileMenuOpen.value = false;
  }
};

// Ajouter un écouteur d'événements global
onMounted(async () => {
  await fetchToDoItems();
  setTitle(`Détails de la liste de tâches : ${toDoList.value.title}`);
  setDescription(`Détails de la liste de tâches : ${toDoList.value.title}`);
  document.addEventListener('click', closeAllMenus);
});
// Supprimer l'écouteur quand le composant est démonté
onUnmounted(() => {
  document.removeEventListener('click', closeAllMenus);
});

const handleTasksGenerated = (newItems) => {
  toDoItems.value.push(...newItems);
};

</script>

<template>

  <div>
    <div class="container mx-auto pt-2 lg:pb-8">

      <h1 class="text-4xl font-bold my-4 text-center text-blue-800 dark:text-yellow-300">{{ toDoList.title }} :
        Détails
      </h1>

      <!-- ToDoList Tool Bar -->
      <div class="flex justify-between items-center px-4 mb-6 gap-4">
        <div class="flex-grow max-w-md">
          <div class="relative flex items-center">
            <input
              v-model="quickTaskTitle"
              type="text"
              placeholder="Ajouter une tâche..."
              class="w-full border border-gray-300 dark:border-gray-600 py-2 pl-4 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              @keyup.enter="submitQuickTask"
            />
            <button
              class="absolute right-2 text-blue-600 dark:text-yellow-400 p-1"
              @click="submitQuickTask"
            >
              <v-icon name="md-add" scale="1.2"/>
            </button>
          </div>
        </div>

        <!-- Desktop Actions -->
        <div class="hidden sm:flex items-center gap-3">
          <ToggleComponent
              v-model:state="showOnlyPending"
              label="Masquer fait"
          />
          <button
              class="flex w-10 h-10 bg-blue-600 dark:bg-yellow-400 text-white rounded-full items-center justify-center shadow hover:bg-blue-700 dark:hover:bg-yellow-500 transition"
              title="Générer avec IA"
              @click="showAISheet = !showAISheet">
            <v-icon name="io-sparkles-sharp" scale="1.2"/>
          </button>
          <button
              class="flex w-10 h-10 bg-blue-600 dark:bg-yellow-400 text-white rounded-full items-center justify-center shadow hover:bg-blue-700 dark:hover:bg-yellow-500 transition"
              title="Ajout complet"
              @click="openCreateForm">
            <v-icon name="md-add" scale="1.2"/>
          </button>
          <button
              class="flex w-10 h-10 bg-blue-600 dark:bg-yellow-400 text-white rounded-full items-center justify-center shadow hover:bg-blue-700 dark:hover:bg-yellow-500 transition"
              title="Partager"
              @click="shareToDoList">
            <v-icon name="md-share-outlined" scale="1.2"/>
          </button>
        </div>

        <!-- Mobile Actions Menu -->
        <div class="sm:hidden relative mobile-menu-container">
          <button
            class="p-2 text-gray-600 dark:text-gray-300"
            @click.stop="toggleMobileMenu"
          >
            <v-icon name="bi-three-dots-vertical" scale="1.5"/>
          </button>

          <div
            v-if="isMobileMenuOpen"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            <div class="p-3 border-b border-gray-100 dark:border-gray-700">
              <ToggleComponent
                v-model:state="showOnlyPending"
                label="Masquer fait"
              />
            </div>
            <button
              class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-200"
              @click="showAISheet = true; isMobileMenuOpen = false"
            >
              <v-icon name="io-sparkles-sharp" class="text-green-500"/>
              Génération IA
            </button>
            <button
              class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-200"
              @click="openCreateForm(); isMobileMenuOpen = false"
            >
              <v-icon name="md-add" class="text-blue-600 dark:text-yellow-400"/>
              Ajout complet
            </button>
            <button
              class="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-200"
              @click="shareToDoList(); isMobileMenuOpen = false"
            >
              <v-icon name="md-share-outlined" class="text-blue-600 dark:text-yellow-400"/>
              Partager
            </button>
          </div>
        </div>
      </div>

      <!-- Section IA -->
      <AIGenerateTasks
        v-if="toDoList.id && showAISheet"
        :to-do-list-id="toDoList.id"
        @tasks-generated="handleTasksGenerated"
        @close="showAISheet = false"
      />

      <!-- QRCodeModal -->
      <QRCodeModal
          v-if="showQRCodeModal"
          :link-url="linkUrl"
          :qr-code-url="qrCodeUrl"
          @close="showQRCodeModal = false"
      />

      <!-- ToDoForm -->
      <ToDoItemFormComponent
          v-if="isCreating"
          :initial-data="selectedToDoItem"
          :to-do-items="toDoItems"
          @cancel="closeForm"
          @handle-response="handleResponseFormSubmit"
          @use-suggest="selectedToDoItem = true"
      />

      <!-- Loader -->
      <LoaderComponent v-if="isLoading"/>

      <div
          v-else-if="toDoItems.length || isCreating"
          class="w-full dark:bg-gray-800 px-2 md:px-4 pb-4 mb-4 rounded-xl shadow-lg dark:shadow-gray-700"
      >
        <p class="py-3 text-center">{{ toDoList.description }}</p>
        <!-- Title Table -->
        <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold">
          A faire</h2>

        <ul v-if="filteredToDoItems.filter(item => !item.done).length > 0">
          <li
              v-for="item in filteredToDoItems.filter(item => !item.done)" :key="item.id"
              class="flex gap-2 items-center bg-white dark:bg-gray-800 p-2 pl-4 rounded-lg mb-2 shadow-lg dark:shadow-gray-700 relative"
          >
            <button
                class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
                @click="toggleToDoItemDone(item)"
            >
              <v-icon name='md-checkboxoutlineblank'/>
            </button>

            <div v-if="isEditing && selectedToDoItem.id === item.id" class="flex-grow">
              <ToDoItemFormComponent
                  :initial-data="selectedToDoItem"
                  :inline-form="true"
                  @cancel="closeForm"
                  @handle-response="handleResponseFormSubmit"
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
              <button
                  class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
                  @click="decrementQuantity(item)"
              >
                <v-icon name="fa-minus" scale="1.2"/>
              </button>
              <div class="border border-gray-300 dark:border-gray-600 px-4 py-1 rounded">
                <input
                    v-if="isEditingQuantity && selectedToDoItem.id === item.id"
                    v-model="item.quantity"
                    class="w-16 bg-transparent text-center border-none focus:outline-none"
                    type="number"
                    @blur="saveQuantity(item)"
                    @keydown.alt.exact="saveQuantity(item)"
                    @keydown.esc.exact="cancelEditQuantity(item)"
                />
                <span v-else @click="editQuantity(item)">
                  {{ item.quantity }}
                </span>
              </div>
              <button
                  class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
                  @click="incrementQuantity(item)"
              >
                <v-icon name="fa-plus" scale="1.2"/>
              </button>
            </div>

            <!-- Actions pour chaque item -->
            <div class="flex justify-end gap-2 basis-14">
              <button
                  v-if="item.image"
                  class="flex m-auto text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
                  @click="showItemImage(item)"
              >
                <v-icon name="md-photocamera-round" scale="1.2"/>
              </button>
              <!-- Icône 3 points pour ouvrir le menu -->
              <button
                  class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white menu-container"
                  @click.stop="toggleMenu(item)"
              >
                <v-icon name="bi-three-dots-vertical" scale="1.2"/>
              </button>
            </div>

            <!-- Menu déroulant -->
            <div
                v-if="openMenuId === item.id"
                class="absolute right-4 top-10 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-300 dark:border-gray-700 z-50 menu-container">
              <ul class="py-2 px-4">
                <li
                    class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
                    @click="openCompleteEditForm(item)">
                  ✏️ Éditer
                </li>
                <li
                    class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded text-red-600"
                    @click="deleteToDoItem(item)">
                  🗑️ Supprimer
                </li>
              </ul>
            </div>
          </li>
        </ul>

        <div v-if="filteredToDoItems.filter(item => item.done).length > 0" class="mt-4">
          <h2
              class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold"
          >
            Fait
          </h2>

          <ul>
            <li
                v-for="item in filteredToDoItems.filter(item => item.done)" :key="item.id"
                class="flex gap-4 items-center bg-white dark:bg-gray-800 p-2 pl-4 rounded-lg mb-2 shadow-lg dark:shadow-gray-700"
            >
              <button
                  class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500"
                  @click="toggleToDoItemDone(item)"
              >
                <v-icon name='md-checkbox-outlined'/>
              </button>

              <div class="flex-grow">
                <span
                    :class="[{ 'line-through text-gray-400 dark:text-gray-500': item.done }, { 'cursor-pointer': !item.done }]">
                  {{ item.title }}
                </span>
              </div>

              <!-- Actions pour chaque item -->
              <div class="flex items-center">
                <button
                    v-if="item.image"
                    class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 ml-2"
                    @click="showItemImage(item)"
                >
                  <v-icon name="md-photocamera-round" scale="1.2"/>
                </button>
                <button
                    class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 ml-2"
                    @click="deleteToDoItem(item)"
                >
                  <v-icon name="fa-regular-trash-alt" scale="1.2"/>
                </button>
              </div>
            </li>
          </ul>
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

  <ToDoItemImageModalComponent
      v-if="showItemImageModal"
      :image-url="selectedToDoItem.image"
      @close="closeItemImageModal"
  />

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
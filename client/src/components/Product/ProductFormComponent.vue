<script setup>
import { reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

import { client } from '@/services/requestMaker.js';
import logger from "@/utils/logger.js";

// Router instance
const route = useRoute();
const router = useRouter();

// Props
const props = defineProps({
  product: {
    type: Object,
    default: () => ({}),
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  quickEdit: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['quickEdit']);

// Local reactive form state
const localForm = reactive({
  name: '',
  price: null,
  description: '',
  image: null,
  available: false,
  quantity: null,
  releaseDate: '',
});

// Watch for changes to the product prop and update the local form state
watch(
  () => props.product,  // Surveille les changements de l'objet product
  (newProduct) => {
    for (const key in newProduct) {
      if (Object.prototype.hasOwnProperty.call(newProduct, key)) {
        localForm[key] = newProduct[key];  // Mets à jour les champs du formulaire
        if (key === 'releaseDate' && newProduct.releaseDate) {
          localForm.releaseDate = new Date(newProduct.releaseDate).toISOString().split('T')[0];
        }
      }
    }
  },
  { immediate: true }  // Lancer immédiatement pour hydrater dès le montage
);

// Gestion du téléchargement de fichier
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  localForm.image = file;
};

const submitForm = async () => {
  const formData = new FormData();
  formData.append('name', localForm.name);
  formData.append('price', localForm.price);
  formData.append('description', localForm.description);
  formData.append('image', localForm.image);
  formData.append('available', localForm.available);
  formData.append('quantity', localForm.quantity);
  formData.append('releaseDate', localForm.releaseDate);
  try {
    if (props.quickEdit) {
      emit('quickEdit', localForm);
      return;
    }
    if (props.isEditMode) {
      logger.debug('edit form', formData);
      await client.patchWithFile(`/api/product/${route.params.id}`, formData);
      router.push(`/product/${route.params.id}`);
    } else {
      logger.debug('new form', formData);
      const data = await client.postWithFile('/api/product', formData);
      router.push(`/product/${data.id}`);
    }
  } catch (err) {
    logger.error('Une erreur est survenue lors de la soumission du formulaire', err);
  }
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-6">{{ isEditMode ? 'Éditer le Produit' : 'Ajouter un Nouveau Produit' }}</h1>
      
      <form class="space-y-4" enctype="multipart/form-data" @submit.prevent="submitForm">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Produit</label>
          <input
            id="name"
            v-model="localForm.name"
            type="text"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            id="description"
            v-model="localForm.description"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          ></textarea>
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (€)</label>
          <input
            id="price"
            v-model="localForm.price"
            type="number"
            required
            step="0.01"
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>

        <div>
          <label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantité</label>
          <input
            id="quantity"
            v-model="localForm.quantity"
            type="number"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>

        <div>
          <label for="releaseDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de Sortie</label>
          <input
            id="releaseDate"
            v-model="localForm.releaseDate"
            type="date"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>

        <div>
          <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
          <input
            id="image"
            type="file"
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
            @change="handleFileUpload"
          >
        </div>

        <div class="flex items-center">
          <input
            id="available"
            v-model="localForm.available"
            type="checkbox"
            class="mr-2 bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-blue-600"
          >
          <label for="available" class="text-sm font-medium text-gray-700 dark:text-gray-300">Disponible</label>
        </div>

        <button
          type="submit"
          class="bg-blue-500 dark:bg-blue-700 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {{ isEditMode ? 'Mettre à jour' : 'Ajouter' }}
        </button>
      </form>
    </div>
  </div>
</template>

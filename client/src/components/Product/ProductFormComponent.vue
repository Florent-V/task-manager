<script setup>
import { reactive, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { client } from '@/utils/requestMaker.js';

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
      if (newProduct.hasOwnProperty(key)) {
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
  // sdfds
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
      console.log('edit form', formData);
      await client.patchWithFile(`/api/product/${route.params.id}`, formData);
      router.push(`/product/${route.params.id}`);
    } else {
      console.log('new form', formData);
      const data = await client.postWithFile('/api/product', formData);
      router.push(`/product/${data.id}`);
    }
  } catch (error) {
    console.error('Une erreur est survenue lors de la soumission du formulaire', error);
  }
};
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold mb-6">{{ isEditMode ? 'Éditer le Produit' : 'Ajouter un Nouveau Produit' }}</h1>
      
      <form @submit.prevent="submitForm" class="space-y-4" enctype="multipart/form-data">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom du Produit</label>
          <input
            v-model="localForm.name"
            type="text"
            id="name"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            v-model="localForm.description"
            id="description"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          ></textarea>
        </div>

        <div>
          <label for="price" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Prix (€)</label>
          <input
            v-model="localForm.price"
            type="number"
            id="price"
            required
            step="0.01"
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>

        <div>
          <label for="quantity" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantité</label>
          <input
            v-model="localForm.quantity"
            type="number"
            id="quantity"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>

        <div>
          <label for="releaseDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de Sortie</label>
          <input
            v-model="localForm.releaseDate"
            type="date"
            id="releaseDate"
            required
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>

        <div>
          <label for="image" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Image</label>
          <input
            @change="handleFileUpload"
            type="file"
            id="image"
            class="bg-white dark:bg-gray-600 text-gray-900 dark:text-white p-2 rounded w-full"
          >
        </div>

        <div class="flex items-center">
          <input
            v-model="localForm.available"
            type="checkbox"
            id="available"
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

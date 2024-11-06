<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { client } from '@/utils/requestMaker.js';
import ProductFormComponent from '@/components/Product/ProductFormComponent.vue';
import { apiBaseUrl } from "@/utils/requestMaker.js";

const filesApiUrl = `${apiBaseUrl}/api/uploads`;

const route = useRoute();
const router = useRouter();
const product = ref([]);
const isEditing = ref(false);

onMounted(async () => {
  const data = await client.get(`/api/product/${route.params.id}`);
  product.value = data.product;
});

const deleteProduct = async () => {
  await client.delete(`/api/product/${product.value.id}`);
  router.push('/product');
};

const handleQuickEdit = (editedProduct) => {
  product.value = editedProduct;
  isEditing.value = false;
};

</script>

<template>
  <div class="container mx-auto p-6">
    <div class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white p-6 rounded-lg shadow-md">
      <img :src="`${filesApiUrl}/${product.image}`" alt="Product Image"
           class="w-full h-60 object-cover mb-4 rounded-lg">
      <h1 class="text-2xl font-bold">{{ product.name }}</h1>
      <p class="text-gray-700 dark:text-gray-300 mt-4">{{ product.description }}</p>
      <p class="text-yellow-500 mt-4">{{ product.price }} €</p>
      <p class="text-gray-600 dark:text-gray-400 mt-4">Disponible :
        <span :class="product.available ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'">
          {{ product.available ? 'Oui' : 'Non' }}
        </span>
      </p>
      <p class="text-gray-600 dark:text-gray-400 mt-4">Quantité : {{ product.quantity }}</p>
      <p class="text-gray-600 dark:text-gray-400 mt-4">Date de sortie :
        {{ new Date(product.releaseDate).toLocaleDateString() }}</p>

      <div class="flex mt-6 space-x-4">
        <RouterLink :to="`/product/${product.id}/edit`"
                    class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded">Éditer
        </RouterLink>
        <button @click="deleteProduct" class="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded">Supprimer
        </button>
        <!-- Bouton pour afficher/masquer le formulaire d'édition -->
        <button @click="isEditing = !isEditing" class="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded">
          {{ isEditing ? 'Cancel' : 'Edition Rapide' }}
        </button>
      </div>
    </div>
  </div>
  <!-- Formulaire d'édition conditionnellement affiché -->
  <ProductFormComponent
      v-if="isEditing"
      :product="product"
      :isEditMode="true"
      :quickEdit="true"
      @quickEdit="handleQuickEdit"
  />
</template>

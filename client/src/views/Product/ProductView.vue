<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { client } from '@/utils/requestMaker.js';

const router = useRouter();
const products = ref([]);
const baseApiUrl = import.meta.env.VITE_API_BASE_URL;


const navigateToCreateProduct = () => {
  router.push('/product/new');
};

onMounted(async () => {
  const data = await client.get('/api/product');
  products.value = data.products;
});
</script>

<template>
  <div class="flex-grow container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Tous les Produits</h1>
      <button 
        @click="navigateToCreateProduct"
        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        <span class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Créer un produit
        </span>
      </button>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white p-4 rounded-lg shadow-md"
      >
        <img :src="`${baseApiUrl}/uploads/${product.image}`" alt="Product Image" class="w-full h-60 object-cover mb-4 rounded-lg">
        <h2 class="text-lg font-semibold">{{ product.name }}</h2>
        <p class="text-gray-600 dark:text-gray-300">{{ product.description }}</p>
        <p class="text-yellow-400 mt-2">{{ product.price }} €</p>
        <RouterLink :to="`/product/${product.id}`" class="text-blue-500 hover:underline mt-4 block">Voir les détails</RouterLink>
      </div>
    </div>
  </div>
</template>



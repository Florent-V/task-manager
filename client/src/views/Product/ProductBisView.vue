<script setup>
import { ref, onMounted } from 'vue';
import { client } from '@/utils/requestMaker.js';

const products = ref([]);
const newProduct = ref({
  id: '',
  name: '',
  price: ''
});

const addProduct = async () => {
  const response = await client.post('/api/product', newProduct.value);
  products.value.push(response.data.product);
  newProduct.value = { id: '', name: '', price: '' }; // Reset input fields
};

onMounted(async () => {
  const data = await client.get('/api/product');
  products.value = data.products;
});

</script>

<template>
  <h2 class="text-4xl font-bold mb-6 text-center text-blue-800 dark:text-yellow-300">Products</h2>
  <div class="container mx-auto px-4 py-12">
    <!-- Add new product and product list -->
    <div class="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg dark:shadow-gray-700">
      <!-- Title: Add a new product -->
      <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold">Add a new product</h2>

      <div class="p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder="ID" class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition" v-model="newProduct.id" />
          <input type="text" placeholder="Name" class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition" v-model="newProduct.name" />
          <input type="number" placeholder="Price" class="border border-gray-300 dark:border-gray-600 p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-yellow-400 transition" v-model="newProduct.price" />
        </div>
        <div class="text-right mt-4">
          <button @click="addProduct" class="bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 hover:bg-blue-700 dark:hover:bg-yellow-500 px-6 py-3 rounded-full text-lg transition duration-300 font-semibold">Add</button>
        </div>
      </div>

      <!-- Title: Product List -->
      <h2 class="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-t-lg text-xl font-semibold mt-12">Product List</h2>

      <div class="overflow-x-auto p-4">
        <table class="min-w-full table-auto">
          <thead>
          <tr class="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-md">
            <th class="px-6 py-3 text-left">Product ID</th>
            <th class="px-6 py-3 text-left">Product Name</th>
            <th class="px-6 py-3 text-left">Product Price</th>
            <th class="px-6 py-3 text-center">Action</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300">{{ product.id }}</td>
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300">{{ product.name }}</td>
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-gray-900 dark:text-gray-300">${{ product.price }}</td>
            <td class="border-t border-gray-300 dark:border-gray-600 px-6 py-4 text-center">
              <button class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 mr-2">
                <i class="fas fa-edit"></i>
              </button>
              <button class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500 mr-2">
                <i class="fas fa-trash-alt"></i>
              </button>
              <button class="text-blue-600 dark:text-yellow-400 hover:text-blue-700 dark:hover:text-yellow-500">
                <i class="fas fa-eye"></i>
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* Optional styles to make it look nicer */
.container {
  max-width: 800px;
}

button {
  cursor: pointer;
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

th {
  background-color: #f4f4f4;
}
</style>

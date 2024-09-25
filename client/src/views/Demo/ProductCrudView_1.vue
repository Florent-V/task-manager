<script setup>
import { ref, onMounted, computed } from 'vue';
import { useProductsStore } from '@/stores/productsStore';
import FormComponent from '@/components/Demo/FormComponent_1.vue'

const showForm = ref(false);
const editingProduct = ref(null);
const productsStore = useProductsStore();

// Etat du toggle, par défaut il est sur 'afficher tous les produits'
const showAvailableOnly = ref(false);

// Computed pour afficher les produits en fonction du toggle
const filteredProducts = computed(() => {
  if (showAvailableOnly.value) {
    return productsStore.availableProducts
  }
  return productsStore.products;  // Afficher tous les produits
});

// Fonction pour basculer l'état du toggle
const toggleAvailableOnly = () => {
  showAvailableOnly.value = !showAvailableOnly.value;
};

const openCreateForm = () => {
  editingProduct.value = null;
  showForm.value = true;
};

const openEditForm = (product) => {
  editingProduct.value = { ...product };
  showForm.value = true;
};

const closeForm = () => {
  editingProduct.value = null;
  showForm.value = false;
};

const handleFormSubmit = (formData) => {
  console.log('formData', formData);
  if (editingProduct.value) {
    console.log('editingProduct', editingProduct.value);
    // Mettre à jour le produit existant
    productsStore.updateProduct({ ...formData, id: editingProduct.value.id });
  } else {
    console.log('new product');
    // Ajouter un nouveau produit
    productsStore.addProduct(formData);
  }
  closeForm();
};

const deleteProduct = (id) => {
  if (confirm('Are you sure you want to delete this product?')) {
    productsStore.deleteProduct(id);
  }
};

// Charger les produits à l'initialisation
onMounted(() => {
  if (productsStore.products.length === 0) {
    productsStore.fetchProducts();
  }
});

</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6 text-blue-800 dark:text-yellow-300">Product Management</h1>

    <button
      @click="openCreateForm"
      class="bg-blue-600 dark:bg-yellow-400 text-white dark:text-gray-900 px-4 py-2 rounded-md mb-4 inline-block hover:bg-blue-700 dark:hover:bg-yellow-500 transition duration-300"
    >
      Add New ProductT
    </button>

    <div class="flex items-center pb-4">
      <!-- Texte devant le toggle -->
      <span class="mr-3 text-sm font-semibold text-gray-700">Only available</span>

      <!-- Container du toggle -->
      <div
        class="relative w-16 h-8 bg-gray-300 rounded-full p-1 cursor-pointer"
        :class="{ 'bg-green-500': showAvailableOnly, 'bg-red-500': !showAvailableOnly }"
        @click="toggleAvailableOnly"
      >
        <!-- Rond de slider -->
        <div
          class="absolute top-1 left-1 h-6 w-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out"
          :class="{ 'translate-x-8': showAvailableOnly }"
          style="width: 24px; height: 24px;"
        ></div>
      </div>
    </div>

    <FormComponent
      v-if="showForm"
      :editProduct="editingProduct"
      @submitForm="handleFormSubmit"
      @cancel="closeForm"
    />

    <div class="grid grid-cols-1 gap-4 md:hidden">
      <div v-for="product in productsStore.availableProducts" :key="product.id" class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <img :src="product.image" :alt="product.name" class="w-full h-48 object-cover rounded-md mb-4">
        <h2 class="text-xl font-semibold mb-2">{{ product.name }}</h2>
        <p class="text-gray-600 dark:text-gray-300 mb-2">${{ product.price.toFixed(2) }}</p>
        <p class="text-gray-600 dark:text-gray-300 mb-2">{{ product.description }}</p>
        <p class="mb-2">
          <span class="font-semibold">Available:</span>
          <span :class="product.available ? 'text-green-600' : 'text-red-600'">
            {{ product.available ? 'Yes' : 'No' }}
          </span>
        </p>
        <p class="mb-4"><span class="font-semibold">Quantity:</span> {{ product.quantity }}</p>
        <div class="flex justify-between">
          <button @click="openEditForm(product)" class="text-yellow-600 hover:text-yellow-800">
            Edit
          </button>
          <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-800">
            Delete
          </button>
        </div>
      </div>
    </div>

    <div class="hidden md:block overflow-x-auto">
      <table class="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <thead class="bg-gray-200 dark:bg-gray-700">
        <tr>
          <th class="px-4 py-2 text-left">Image</th>
          <th class="px-4 py-2 text-left">Name</th>
          <th class="px-4 py-2 text-left">Price</th>
          <th class="px-4 py-2 text-left">Description</th>
          <th class="px-4 py-2 text-left">Available</th>
          <th class="px-4 py-2 text-left">Quantity</th>
          <th class="px-4 py-2 text-left">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="product in filteredProducts" :key="product.id" class="border-b dark:border-gray-700">
          <td class="px-4 py-2">
            <img :src="product.image" :alt="product.name" class="w-16 h-16 object-cover rounded-md">
          </td>
          <td class="px-4 py-2">{{ product.name }}</td>
          <td class="px-4 py-2">${{ product.price.toFixed(2) }}</td>
          <td class="px-4 py-2">{{ product.description }}</td>
          <td class="px-4 py-2">
              <span :class="product.available ? 'text-green-600' : 'text-red-600'">
                {{ product.available ? 'Yes' : 'No' }}
              </span>
          </td>
          <td class="px-4 py-2">{{ product.quantity }}</td>
          <td class="px-4 py-2">
            <div class="flex space-x-2">
              <button @click="openEditForm(product)" class="text-yellow-600 hover:text-yellow-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-800">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
